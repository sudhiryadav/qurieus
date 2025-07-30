from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import os
import sys
import fitz
import docx
import json
import traceback
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend
from sentence_transformers import SentenceTransformer
from app.utils.logger import log_to_frontend
from functools import lru_cache
import datetime
import pandas as pd
import io
import uuid
import re
import pytesseract
from PIL import Image

# Add the root directory to Python path
backend_dir = os.path.dirname(
    os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    )
)
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

# Now we can import from absolute paths
from app.core.config import settings

# OCR Configuration
OCR_ENABLED = getattr(settings, "OCR_ENABLED", True)  # Enable/disable OCR
OCR_LANGUAGE = getattr(settings, "OCR_LANGUAGE", "eng")  # OCR language
OCR_DPI = getattr(settings, "OCR_DPI", 300)  # DPI for page rendering
OCR_CONFIG = getattr(settings, "OCR_CONFIG", "--oem 3 --psm 6")  # Tesseract config

# Set Tesseract path if needed (uncomment and set path if tesseract is not in PATH)
# pytesseract.pytesseract.tesseract_cmd = '/opt/homebrew/bin/tesseract'  # macOS with Homebrew

# Initialize the embedding model with the same model as query service
try:
    embedding_model = SentenceTransformer("BAAI/bge-small-en-v1.5", device="cpu")
    print("✅ Embedding model initialized successfully")
except Exception as e:
    print(f"Warning: Could not initialize SentenceTransformer: {str(e)}")
    embedding_model = None

# Initialize Qdrant client
try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import PointStruct

    qdrant_url = settings.QDRANT_URL
    qdrant_api_key = settings.QDRANT_API_KEY
    qdrant_collection = settings.QDRANT_COLLECTION

    qdrant_client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
    print("✅ Qdrant client initialized successfully")
except Exception as e:
    print(f"Warning: Could not initialize Qdrant client: {str(e)}")
    qdrant_client = None

router = APIRouter()

# Security scheme for API key authentication
security = HTTPBearer(auto_error=False)


def ensure_qdrant_collection_exists():
    """Ensure Qdrant collection exists with proper configuration."""
    if not qdrant_client:
        return False

    try:
        # Check if collection exists
        collections = qdrant_client.get_collections()
        collection_names = [col.name for col in collections.collections]

        if qdrant_collection not in collection_names:
            # Create collection with vector configuration
            qdrant_client.create_collection(
                collection_name=qdrant_collection,
                vectors_config={
                    "size": 384,  # BAAI/bge-small-en-v1.5 embedding size
                    "distance": "Cosine",
                },
            )
            print(f"✅ Created Qdrant collection: {qdrant_collection}")
        else:
            print(f"✅ Qdrant collection exists: {qdrant_collection}")

        return True
    except Exception as e:
        print(f"❌ Failed to ensure Qdrant collection: {str(e)}")
        return False


@lru_cache(maxsize=1000)
def get_cached_embedding(text: str) -> List[float]:
    """Get embedding for text with caching."""
    if embedding_model:
        return embedding_model.encode(text).tolist()
    return [0.0] * 384  # Fallback to zero vector


def optimize_chunk_size(text: str, target_size: int = 800) -> List[str]:
    """Optimize text chunking for better retrieval."""
    if not text.strip():
        return []

    # Clean the text first
    text = re.sub(r"\s+", " ", text).strip()

    # Split into paragraphs first
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

    chunks = []
    current_chunk = ""

    # Keywords that indicate contact information
    contact_keywords = [
        "contact",
        "phone",
        "email",
        "address",
        "location",
        "office",
        "tel:",
        "fax:",
        "e-mail:",
        "www.",
        "http",
        "https",
        "call us",
        "reach us",
        "get in touch",
        "contact us",
    ]

    # Prioritize paragraphs with contact information
    contact_paragraphs = []
    regular_paragraphs = []

    for paragraph in paragraphs:
        paragraph_lower = paragraph.lower()
        if any(keyword in paragraph_lower for keyword in contact_keywords):
            contact_paragraphs.append(paragraph)
        else:
            regular_paragraphs.append(paragraph)

    # Process contact paragraphs first
    for paragraph in contact_paragraphs:
        if len(current_chunk) + len(paragraph) <= target_size:
            current_chunk += paragraph + "\n\n"
        else:
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
            current_chunk = paragraph + "\n\n"

    # Process regular paragraphs
    for paragraph in regular_paragraphs:
        if len(current_chunk) + len(paragraph) <= target_size:
            current_chunk += paragraph + "\n\n"
        else:
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
            current_chunk = paragraph + "\n\n"

    # Add the last chunk
    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    # If chunks are too large, split them further
    final_chunks = []
    for chunk in chunks:
        if len(chunk) <= target_size:
            final_chunks.append(chunk)
        else:
            # Split large chunks by sentences
            sentences = re.split(r"[.!?]+", chunk)
            current_sentence_chunk = ""
            for sentence in sentences:
                sentence = sentence.strip()
                if not sentence:
                    continue
                if len(current_sentence_chunk) + len(sentence) <= target_size:
                    current_sentence_chunk += sentence + ". "
                else:
                    if current_sentence_chunk.strip():
                        final_chunks.append(current_sentence_chunk.strip())
                    current_sentence_chunk = sentence + ". "
            if current_sentence_chunk.strip():
                final_chunks.append(current_sentence_chunk.strip())

    return final_chunks


def analyze_financial_data(df: pd.DataFrame) -> Dict[str, Any]:
    """Analyze financial data from Excel/CSV files."""
    try:
        analysis = {
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": df.columns.tolist(),
            "data_types": df.dtypes.to_dict(),
            "summary_stats": {},
        }

        # Basic statistics for numeric columns
        numeric_columns = df.select_dtypes(include=["number"]).columns
        if len(numeric_columns) > 0:
            analysis["summary_stats"] = df[numeric_columns].describe().to_dict()

        # Sample data (first 5 rows)
        analysis["sample_data"] = df.head().to_dict("records")

        return analysis
    except Exception as e:
        return {"error": f"Analysis failed: {str(e)}"}


def df_to_markdown(df: pd.DataFrame) -> str:
    """Convert DataFrame to markdown table format."""
    if df.empty:
        return "Empty dataset"

    # Create markdown table
    markdown = "| " + " | ".join(str(col) for col in df.columns) + " |\n"
    markdown += "| " + " | ".join("---" for _ in df.columns) + " |\n"

    # Add rows (limit to first 50 rows to avoid huge tables)
    for _, row in df.head(50).iterrows():
        markdown += "| " + " | ".join(str(val) for val in row.values) + " |\n"

    if len(df) > 50:
        markdown += f"\n*... and {len(df) - 50} more rows*\n"

    return markdown


def clean_text_content(text: str) -> str:
    """Clean and normalize text content."""
    if not text:
        return ""

    # Remove excessive whitespace
    text = re.sub(r"\s+", " ", text)

    # Remove special characters but keep important ones
    text = re.sub(
        r"[^\w\s\.\,\!\?\:\;\-\(\)\[\]\{\}\@\#\$\%\&\*\+\=\/\|\\\<\>\'\"\n]", "", text
    )

    # Normalize line breaks
    text = re.sub(r"\n+", "\n", text)

    return text.strip()


def process_file(
    file_content: bytes, file_extension: str, original_filename: str, userId: str
) -> dict:
    """Process uploaded file with optimized chunking and Qdrant integration."""
    try:
        text_content = ""
        financial_analysis = {}

        if file_extension.lower() == ".pdf":
            doc = fitz.open(stream=file_content, filetype="pdf")
            for page in doc:
                # Extract selectable text first
                page_text = page.get_text()
                text_content += page_text

                # If no text was extracted, the page might be scanned/image-based
                if not page_text.strip() and OCR_ENABLED:
                    log_to_frontend(
                        "info",
                        f"Page {page.number + 1} appears to be image-based, running OCR...",
                    )
                    try:
                        # Render page as image for OCR
                        pix = page.get_pixmap(dpi=OCR_DPI)  # Use configured DPI
                        img = Image.frombytes(
                            "RGB", [pix.width, pix.height], pix.samples
                        )

                        # Run OCR on the page image
                        ocr_text = pytesseract.image_to_string(
                            img, lang=OCR_LANGUAGE, config=OCR_CONFIG
                        )
                        if ocr_text.strip():
                            text_content += (
                                f"\n[OCR Page {page.number + 1}]:\n{ocr_text}\n"
                            )
                            log_to_frontend(
                                "info",
                                f"OCR extracted {len(ocr_text)} characters from page {page.number + 1}",
                            )
                        else:
                            log_to_frontend(
                                "warning",
                                f"No text found via OCR on page {page.number + 1}",
                            )
                    except Exception as e:
                        log_to_frontend(
                            "error", f"OCR failed on page {page.number + 1}: {str(e)}"
                        )
                elif not page_text.strip() and not OCR_ENABLED:
                    log_to_frontend(
                        "warning",
                        f"Page {page.number + 1} appears to be image-based but OCR is disabled",
                    )

                # Also extract text from embedded images in the page
                if OCR_ENABLED:
                    try:
                        for img_index, img in enumerate(page.get_images(full=True)):
                            xref = img[0]
                            base_image = doc.extract_image(xref)
                            image_bytes = base_image["image"]
                            image = Image.open(io.BytesIO(image_bytes))

                            # Run OCR on embedded image
                            ocr_text = pytesseract.image_to_string(
                                image, lang=OCR_LANGUAGE, config=OCR_CONFIG
                            )
                            if ocr_text.strip():
                                text_content += f"\n[OCR Page {page.number + 1} Image {img_index + 1}]:\n{ocr_text}\n"
                                log_to_frontend(
                                    "info",
                                    f"OCR extracted {len(ocr_text)} characters from image {img_index + 1} on page {page.number + 1}",
                                )
                    except Exception as e:
                        log_to_frontend(
                            "warning",
                            f"Failed to process embedded images on page {page.number + 1}: {str(e)}",
                        )
        elif file_extension.lower() in [".docx", ".doc"]:
            # Create a BytesIO object from the file content
            doc_stream = io.BytesIO(file_content)
            doc = docx.Document(doc_stream)
            for para in doc.paragraphs:
                text_content += para.text + "\n"
        elif file_extension.lower() == ".txt":
            # Handle plain text files
            try:
                # Try UTF-8 first
                text_content = file_content.decode("utf-8")
            except UnicodeDecodeError:
                try:
                    # Fallback to UTF-8 with error handling
                    text_content = file_content.decode("utf-8", errors="replace")
                except Exception:
                    # Final fallback to latin-1
                    text_content = file_content.decode("latin-1", errors="replace")
        elif file_extension.lower() in [".xlsx", ".xls", ".csv"]:
            file_stream = io.BytesIO(file_content)
            try:
                if file_extension.lower() == ".csv":
                    df = pd.read_csv(file_stream)
                    text_content = df_to_markdown(df)
                else:
                    xls = pd.ExcelFile(file_stream)
                    sheet_names = xls.sheet_names
                    sheet_tables = []
                    for idx, sheet in enumerate(sheet_names):
                        df_sheet = pd.read_excel(xls, sheet_name=sheet)
                        sheet_tables.append(
                            f"Sheet: {sheet}\n\n{df_to_markdown(df_sheet)}\n"
                        )
                        if idx == 0:
                            df = df_sheet  # Use first sheet for financial analysis
                    text_content = "\n\n".join(sheet_tables)
                # Perform financial analysis on the first sheet only
                financial_analysis = analyze_financial_data(df)
            except Exception as e:
                print(f"Error processing file: {str(e)}")
                raise ValueError(f"Error processing file: {str(e)}")
        elif file_extension.lower() in [
            ".png",
            ".jpg",
            ".jpeg",
            ".bmp",
            ".tiff",
            ".tif",
        ]:
            # Handle image files with OCR
            if not OCR_ENABLED:
                raise ValueError(
                    f"OCR is disabled. Cannot process image file: {file_extension}"
                )

            try:
                image = Image.open(io.BytesIO(file_content))

                # Convert to RGB if necessary (for better OCR accuracy)
                if image.mode != "RGB":
                    image = image.convert("RGB")

                # Run OCR on the image
                ocr_text = pytesseract.image_to_string(
                    image, lang=OCR_LANGUAGE, config=OCR_CONFIG
                )
                if ocr_text.strip():
                    text_content = ocr_text
                    log_to_frontend(
                        "info",
                        f"OCR extracted {len(ocr_text)} characters from image {original_filename}",
                    )
                else:
                    log_to_frontend(
                        "warning", f"No text found via OCR in image {original_filename}"
                    )
                    text_content = (
                        f"[Image file: {original_filename} - No text detected via OCR]"
                    )
            except Exception as e:
                log_to_frontend(
                    "error",
                    f"Failed to process image file {original_filename}: {str(e)}",
                )
                raise ValueError(f"Error processing image file: {str(e)}")
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")

        # Clean text content before chunking
        cleaned_text_content = clean_text_content(text_content)

        # Optimize chunks
        chunks = optimize_chunk_size(cleaned_text_content)
        total_chunks = len(chunks)

        # Generate document ID for Qdrant
        document_id = str(uuid.uuid4())

        # Store chunks directly in Qdrant
        chunk_data = []
        if qdrant_client:
            try:
                points = []
                for idx, chunk_text in enumerate(chunks):
                    embedding = get_cached_embedding(chunk_text)
                    point_id = str(uuid.uuid4())
                    points.append(
                        PointStruct(
                            id=point_id,
                            vector=embedding,
                            payload={
                                "document_id": document_id,
                                "user_id": userId,
                                "content": chunk_text,
                                "filename": original_filename,
                                "chunk_index": idx,
                            },
                        )
                    )

                    # Store chunk data for Next.js
                    chunk_data.append(
                        {
                            "chunk_index": idx,
                            "content": chunk_text,
                            "content_length": len(chunk_text),
                            "qdrant_point_id": point_id,
                            "embedding_vector": embedding,
                        }
                    )

                qdrant_client.upsert(collection_name=qdrant_collection, points=points)
                print(
                    f"Upserted {len(points)} chunks to Qdrant for document {document_id}"
                )
            except Exception as e:
                print(f"Warning: Failed to upsert to Qdrant: {str(e)}")
                # Continue processing even if Qdrant fails

        # Return processed data for Next.js to store in database
        return {
            "document_id": document_id,
            "chunks": total_chunks,
            "content": cleaned_text_content,
            "file_size": len(file_content),
            "file_type": file_extension.lower().lstrip("."),
            "original_filename": original_filename,
            "financial_analysis": financial_analysis,
            "processed_at": datetime.datetime.utcnow().isoformat(),
            "chunk_data": chunk_data,
        }

    except Exception as e:
        raise e


def derive_encryption_key(secret: str) -> bytes:
    """Derive encryption key from secret."""
    salt = b"qurieus_salt"  # Fixed salt for consistency
    kdf = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        info=b"qurieus_key",
        backend=default_backend(),
    )
    return kdf.derive(secret.encode())


def decrypt_token(token: str) -> dict:
    """Decrypt JWE token using NEXTAUTH_SECRET."""
    try:
        secret = settings.NEXTAUTH_SECRET
        if not secret:
            raise ValueError("NEXTAUTH_SECRET not configured")

        key = derive_encryption_key(secret)

        # Split the token
        parts = token.split(".")
        if len(parts) != 5:  # JWE format
            raise ValueError("Invalid JWE token format")

        header_b64, encrypted_key_b64, iv_b64, ciphertext_b64, tag_b64 = parts

        # Decode base64 parts
        encrypted_key = base64.urlsafe_b64decode(encrypted_key_b64 + "==")
        iv = base64.urlsafe_b64decode(iv_b64 + "==")
        ciphertext = base64.urlsafe_b64decode(ciphertext_b64 + "==")
        tag = base64.urlsafe_b64decode(tag_b64 + "==")

        # Combine ciphertext and tag
        encrypted_data = ciphertext + tag

        # Decrypt
        cipher = AESGCM(key)
        decrypted_data = cipher.decrypt(iv, encrypted_data, None)

        # Parse JSON payload
        payload = json.loads(decrypted_data.decode())
        return payload

    except Exception as e:
        print(f"Token decryption error: {str(e)}")
        print(traceback.format_exc())
        raise


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Get current user from Next.js session token."""
    try:
        token = credentials.credentials
        print(f"Received token: {token[:20]}...")

        # Enhanced debugging
        print(f"Token length: {len(token)}")
        print(f"Token parts: {len(token.split('.'))}")
        print(
            f"Token format: {'JWE' if len(token.split('.')) == 5 else 'JWT' if len(token.split('.')) == 3 else 'Unknown'}"
        )

        # Print NEXTAUTH_SECRET for debugging
        secret = settings.NEXTAUTH_SECRET
        print(f"Using NEXTAUTH_SECRET: {secret[:5] if secret else 'Not set'}...")
        print(f"NEXTAUTH_SECRET length: {len(secret) if secret else 0}")

        # Decrypt the token
        try:
            payload = decrypt_token(token)
            print("Successfully decrypted token")
            print(f"Decoded payload: {json.dumps(payload, indent=2)}")

            return payload
        except Exception as e:
            print(f"Token decryption error: {str(e)}")
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

    except Exception as e:
        print(f"Authentication error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


@router.post("/upload")
async def upload_files(
    files: List[UploadFile] = File(...),
    userId: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    api_key: str = Header(..., alias="X-API-Key"),
):
    """Upload one or more documents (PDF, DOC, DOCX, TXT, CSV, XLS, XLSX) for processing."""
    try:
        # Validate API key
        if api_key != settings.BACKEND_API_KEY:
            raise HTTPException(status_code=401, detail="Invalid API key")

        # For now, we'll need to get user ID from the request or use a default
        # You might want to pass user ID in the form data or header
        if not userId:
            raise HTTPException(status_code=400, detail="User ID is required")

        log_to_frontend("info", f"Processing upload for user: {userId}")

        # Ensure Qdrant collection exists before processing files
        if not ensure_qdrant_collection_exists():
            log_to_frontend("error", "Failed to ensure Qdrant collection exists")
            raise HTTPException(status_code=500, detail="Vector database setup failed")

        processed_files = []
        total_chunks = 0

        for file in files:
            log_to_frontend("info", f"Processing file: {file.filename}")

            # Read file content
            content = await file.read()

            # Get file extension
            _, ext = os.path.splitext(file.filename)

            try:
                # Process the document
                result = process_file(
                    file_content=content,
                    file_extension=ext,
                    original_filename=file.filename,
                    userId=userId,
                )

                total_chunks += result["chunks"]
                processed_files.append(result)
                log_to_frontend(
                    "info", f"Processed {result['chunks']} chunks from {file.filename}"
                )
            except Exception as e:
                error_msg = f"Error processing file {file.filename}"
                log_to_frontend("error", error_msg, error=e)
                raise HTTPException(status_code=500, detail="Error processing document")

        return {
            "message": f"Successfully processed {len(files)} files",
            "total_chunks": total_chunks,
            "processed_files": processed_files,
            "user": {
                "id": userId,
                "name": "User",  # We don't have user details from API key auth
                "email": "user@example.com",
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        log_to_frontend("error", "Unexpected error in upload_files", error=e)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing your upload",
        )
