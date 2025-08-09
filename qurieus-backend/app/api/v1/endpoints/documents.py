import base64
import datetime
import io
import json
import os
import re
import sys
import threading
import traceback
import uuid
from functools import lru_cache
from typing import Any, Dict, List, Optional, Union

import docx
import fitz
import pandas as pd
import pytesseract
from app.utils.logger import log_to_backend
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from PIL import Image
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

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

# Processing status tracking
processing_status = {}  # Global dict to track processing status
processing_lock = threading.Lock()  # Thread lock for status updates

# Initialize Qdrant client
try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import Distance, PointStruct, VectorParams

    # Initialize Qdrant client with optional authentication
    if settings.QDRANT_API_KEY:
        qdrant_client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
            check_compatibility=False,  # Skip version compatibility check
        )
    else:
        qdrant_client = QdrantClient(
            settings.QDRANT_URL,
            check_compatibility=False,  # Skip version compatibility check
        )

    qdrant_collection = settings.QDRANT_COLLECTION
    print(
        f"✅ Qdrant client initialized successfully for collection: {qdrant_collection}"
    )

except Exception as e:
    print(f"Warning: Could not initialize Qdrant client: {str(e)}")
    qdrant_client = None


def update_processing_status(
    document_id: str,
    status: str,
    details: str = None,
    error: str = None,
    progress: int = None,
):
    """Update processing status for a document."""
    with processing_lock:
        processing_status[document_id] = {
            "status": status,
            "details": details,
            "error": error,
            "progress": progress,  # 0-100 percentage
            "timestamp": datetime.datetime.now().isoformat(),
        }


def get_processing_status(document_id: str) -> Dict[str, Any]:
    """Get processing status for a document."""
    with processing_lock:
        return processing_status.get(document_id, {"status": "NOT_FOUND"})


def ensure_qdrant_collection_exists():
    """Ensure Qdrant collection exists, create if it doesn't."""
    if not qdrant_client:
        print("Warning: Qdrant client not available")
        return False

    try:
        print(f"Checking if Qdrant collection '{qdrant_collection}' exists...")
        qdrant_client.get_collection(qdrant_collection)
        print(f"✅ Collection '{qdrant_collection}' already exists")
        return True
    except Exception as e:
        print(f"❌ Collection '{qdrant_collection}' does not exist. Creating it now...")
        try:
            # Create collection if it doesn't exist
            qdrant_client.create_collection(
                collection_name=qdrant_collection,
                vectors_config=VectorParams(
                    size=384, distance=Distance.COSINE
                ),  # all-MiniLM-L6-v2 has 384 dimensions
            )
            print(f"✅ Successfully created collection '{qdrant_collection}'")

            # Create payload indexes for filtering
            try:
                qdrant_client.create_payload_index(
                    collection_name=qdrant_collection,
                    field_name="user_id",
                    field_schema="keyword",
                )
                print(
                    f"✅ Created payload index for user_id in collection {qdrant_collection}"
                )
            except Exception as e:
                print(f"⚠️  Warning: Could not create payload index for user_id: {e}")

            try:
                qdrant_client.create_payload_index(
                    collection_name=qdrant_collection,
                    field_name="document_id",
                    field_schema="keyword",
                )
                print(
                    f"✅ Created payload index for document_id in collection {qdrant_collection}"
                )
            except Exception as e:
                print(
                    f"⚠️  Warning: Could not create payload index for document_id: {e}"
                )

            print(f"🎉 Collection '{qdrant_collection}' setup completed successfully!")
            return True
        except Exception as e:
            print(f"❌ Failed to create collection: {e}")
            return False


# Cache for embeddings using lru_cache
@lru_cache(maxsize=1000)
def get_cached_embedding(text: str) -> List[float]:
    """Get cached embedding or compute new one."""
    return embedding_model.encode(text).tolist()


def optimize_chunk_size(text: str, target_size: int = 800) -> List[str]:
    """Optimize text into chunks of approximately target_size characters."""
    print(f"🔧 optimize_chunk_size called:")
    print(f"  Input text length: {len(text)}")
    print(f"  Target size: {target_size}")
    print(f"  Text is empty after strip: {not text.strip()}")

    if not text.strip():
        print(f"  ⚠️ Returning empty chunks - text is empty after strip")
        return []

    # Split by sentences first
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    print(f"  Split into {len(sentences)} sentences")

    chunks = []
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= target_size:
            current_chunk += sentence + " "
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence + " "

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks


def optimize_chunk_size_with_pages(
    text: str, file_extension: str, file_content: bytes
) -> List[Dict[str, Any]]:
    """Optimize text into chunks with page tracking for better search results."""
    print(f"🔧 optimize_chunk_size_with_pages called:")
    print(f"  Input text length: {len(text)}")
    print(f"  Input text preview: {text[:100]}...")
    print(f"  File extension: {file_extension}")
    print(f"  Text is empty after strip: {not text.strip()}")

    if not text.strip():
        print(f"  ⚠️ Returning empty chunks - text is empty after strip")
        return []

    chunks = []

    if file_extension.lower() == ".pdf":
        # For PDFs, we can track page numbers
        print(f"  📄 Processing as PDF file")
        try:
            doc = fitz.open(stream=file_content, filetype="pdf")
            print(f"  📄 PDF opened successfully, {len(doc)} pages")
            current_pos = 0

            for page_num in range(len(doc)):
                page = doc[page_num]
                page_text = page.get_text()
                print(
                    f"  📄 Page {page_num + 1}: {len(page_text)} characters from native text"
                )

                # Always try OCR to get additional text from images
                ocr_text = ""
                if OCR_ENABLED:
                    try:
                        # Render page as image for OCR
                        pix = page.get_pixmap(dpi=OCR_DPI)
                        img = Image.frombytes(
                            "RGB", [pix.width, pix.height], pix.samples
                        )

                        # Run OCR on the page image
                        ocr_text = pytesseract.image_to_string(
                            img, lang=OCR_LANGUAGE, config=OCR_CONFIG
                        )
                        if ocr_text.strip():
                            print(
                                f"  📄 Page {page_num + 1}: OCR extracted {len(ocr_text)} characters from images"
                            )
                        else:
                            print(f"  📄 Page {page_num + 1}: No text found in images")
                    except Exception as ocr_error:
                        print(f"  📄 Page {page_num + 1}: OCR failed: {ocr_error}")

                # Combine native text and OCR text
                combined_text = page_text.strip()
                if ocr_text.strip():
                    if combined_text:
                        # If both exist, combine them with a separator
                        combined_text += f"\n\n[Image Content]:\n{ocr_text.strip()}"
                        print(
                            f"  📄 Page {page_num + 1}: Combined {len(page_text)} native + {len(ocr_text)} OCR characters"
                        )
                    else:
                        # If only OCR text exists, use it
                        combined_text = ocr_text.strip()
                        print(
                            f"  📄 Page {page_num + 1}: Using {len(ocr_text)} OCR characters only"
                        )

                if not combined_text:
                    print(
                        f"  📄 Page {page_num + 1}: Skipping (no text from any source)"
                    )
                    continue

                # Use combined_text for chunking
                page_text = combined_text

                # Find this page's text in the full document
                page_start = text.find(page_text, current_pos)
                if page_start == -1:
                    # Fallback: approximate page boundaries
                    page_start = current_pos
                    print(f"  📄 Page {page_num + 1}: Using fallback position")

                page_end = page_start + len(page_text)
                current_pos = page_end
                print(f"  📄 Page {page_num + 1}: Position {page_start}-{page_end}")

                # Split page text into chunks
                print(f"  📄 Page {page_num + 1}: Calling optimize_chunk_size")
                page_chunks = optimize_chunk_size(page_text, 800)
                print(f"  📄 Page {page_num + 1}: Generated {len(page_chunks)} chunks")

                for chunk_idx, chunk_text in enumerate(page_chunks):
                    print(
                        f"  📄 Page {page_num + 1}, Chunk {chunk_idx + 1}: {len(chunk_text)} chars"
                    )
                    # Find chunk position within page
                    chunk_start = page_text.find(chunk_text)
                    if chunk_start != -1:
                        global_start = page_start + chunk_start
                        global_end = global_start + len(chunk_text)
                    else:
                        global_start = page_start
                        global_end = page_start + len(chunk_text)

                    chunks.append(
                        {
                            "text": chunk_text,
                            "page_number": page_num + 1,  # 1-based page numbers
                            "start_char": global_start,
                            "end_char": global_end,
                            "chunk_in_page": chunk_idx,
                        }
                    )
                    print(
                        f"  📄 Page {page_num + 1}, Chunk {chunk_idx + 1}: Added to chunks list"
                    )

            doc.close()
            print(f"  📄 PDF processing completed, total chunks: {len(chunks)}")

            # If no chunks were generated, use fallback
            if len(chunks) == 0:
                print(f"  📄 No chunks generated from PDF pages, using fallback")
                simple_chunks = optimize_chunk_size(text, 800)
                print(f"  📄 Fallback generated {len(simple_chunks)} chunks")
                for chunk in simple_chunks:
                    chunks.append(
                        {
                            "text": chunk,
                            "page_number": None,
                            "start_char": None,
                            "end_char": None,
                        }
                    )

        except Exception as e:
            print(f"  📄 PDF processing failed: {e}")
            # Fallback to simple chunking if page tracking fails
            print(f"  📄 Using fallback simple chunking")
            simple_chunks = optimize_chunk_size(text, 800)
            print(f"  📄 Fallback generated {len(simple_chunks)} chunks")
            for chunk in simple_chunks:
                chunks.append(
                    {
                        "text": chunk,
                        "page_number": None,
                        "start_char": None,
                        "end_char": None,
                    }
                )
    else:
        # For non-PDF files, use simple chunking
        simple_chunks = optimize_chunk_size(text, 800)
        for chunk in simple_chunks:
            chunks.append(
                {
                    "text": chunk,
                    "page_number": None,
                    "start_char": None,
                    "end_char": None,
                }
            )

    print(f"  📄 Final result: returning {len(chunks)} chunks")
    return chunks


def analyze_financial_data(df: pd.DataFrame) -> Dict[str, Any]:
    """Analyze financial data from DataFrame and return key metrics."""
    analysis = {}

    # Basic statistics for numeric columns
    numeric_cols = df.select_dtypes(include=["float64", "int64"]).columns
    if not numeric_cols.empty:
        analysis["numeric_summary"] = df[numeric_cols].describe().to_dict()

    # Try to identify financial metrics
    for col in df.columns:
        col_lower = col.lower()
        # Revenue/Income analysis
        if any(term in col_lower for term in ["revenue", "income", "sales"]):
            analysis["revenue_metrics"] = {
                "total": df[col].sum(),
                "average": df[col].mean(),
                "trend": df[col].pct_change().mean(),
            }
        # Expense analysis
        elif any(term in col_lower for term in ["expense", "cost", "spend"]):
            analysis["expense_metrics"] = {
                "total": df[col].sum(),
                "average": df[col].mean(),
                "trend": df[col].pct_change().mean(),
            }
        # Profit analysis
        elif any(term in col_lower for term in ["profit", "margin", "earnings"]):
            analysis["profit_metrics"] = {
                "total": df[col].sum(),
                "average": df[col].mean(),
                "trend": df[col].pct_change().mean(),
            }

    return analysis


def df_to_markdown(df: pd.DataFrame) -> str:
    """Convert a DataFrame to a markdown table string."""
    try:
        return df.to_markdown(index=False)
    except Exception:
        # Fallback to CSV if markdown fails
        return df.to_csv(index=False)


def clean_text_content(text: str) -> str:
    """Clean text content by removing problematic characters."""
    if not text:
        return ""

    # Remove NUL characters (0x00)
    text = text.replace("\x00", "")

    # Remove other control characters except newlines and tabs
    text = re.sub(r"[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    # Remove leading/trailing whitespace
    text = text.strip()

    return text


def process_file_background(
    file_content: bytes,
    file_extension: str,
    original_filename: str,
    userId: str,
    document_id: str,
):
    """Process file in background thread."""
    try:
        update_processing_status(
            document_id,
            "PROCESSING",
            f"Starting to process {original_filename}",
            None,
            10,
        )

        # Process the file with progress updates
        result = process_file_with_progress(
            file_content, file_extension, original_filename, userId, document_id
        )

        # Update status to completed
        update_processing_status(
            document_id,
            "COMPLETED",
            f"Successfully processed {original_filename}. Generated {result.get('chunks', 0)} chunks.",
            None,  # error
            100,  # progress
        )

        # log_to_backend(
        #     "info", f"Background processing completed for {original_filename}"
        # )

    except Exception as e:
        error_msg = f"Error processing {original_filename}: {str(e)}"
        update_processing_status(document_id, "ERROR", error_msg, str(e), 0)
        log_to_backend("error", error_msg, error=e)


def process_file_with_progress(
    file_content: bytes,
    file_extension: str,
    original_filename: str,
    userId: str,
    document_id: str,
) -> dict:
    """Process file with progress tracking."""
    try:
        text_content = ""
        financial_analysis = {}

        update_processing_status(
            document_id, "PROCESSING", "Extracting text content...", None, 20
        )

        if file_extension.lower() == ".pdf":
            doc = None
            try:
                doc = fitz.open(stream=file_content, filetype="pdf")
                total_pages = len(doc)
                update_processing_status(
                    document_id,
                    "PROCESSING",
                    f"Processing PDF with {total_pages} pages...",
                    None,  # error
                    30,  # progress
                )

                for page_num, page in enumerate(doc):
                    # Update progress based on page processing
                    progress = 30 + int(
                        (page_num / total_pages) * 50
                    )  # 30-80% for page processing
                    update_processing_status(
                        document_id,
                        "PROCESSING",
                        f"Processing page {page_num + 1}/{total_pages}...",
                        None,  # error
                        progress,  # progress
                    )

                    # Extract selectable text first
                    page_text = page.get_text()
                    text_content += page_text

                    # If no text was extracted, the page might be scanned/image-based
                    if not page_text.strip() and OCR_ENABLED:
                        log_to_backend(
                            "info",
                            f"Page {page_num + 1} appears to be image-based, running OCR...",
                        )
                        try:
                            # Render page as image for OCR
                            pix = page.get_pixmap(dpi=OCR_DPI)
                            img = Image.frombytes(
                                "RGB", [pix.width, pix.height], pix.samples
                            )

                            # Run OCR on the page image
                            ocr_text = pytesseract.image_to_string(
                                img, lang=OCR_LANGUAGE, config=OCR_CONFIG
                            )
                            if ocr_text.strip():
                                text_content += (
                                    f"\n[OCR Page {page_num + 1}]:\n{ocr_text}\n"
                                )
                                log_to_backend(
                                    "info",
                                    f"OCR extracted {len(ocr_text)} characters from page {page_num + 1}",
                                )
                            else:
                                log_to_backend(
                                    "warning",
                                    f"No text found via OCR on page {page_num + 1}",
                                )
                        except Exception as e:
                            log_to_backend(
                                "error",
                                f"OCR failed on page {page_num + 1}: {str(e)}",
                            )
                    elif not page_text.strip() and not OCR_ENABLED:
                        log_to_backend(
                            "warning",
                            f"Page {page_num + 1} appears to be image-based but OCR is disabled",
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
                                    text_content += f"\n[OCR Page {page_num + 1} Image {img_index + 1}]:\n{ocr_text}\n"
                                    log_to_backend(
                                        "info",
                                        f"OCR extracted {len(ocr_text)} characters from image {img_index + 1} on page {page_num + 1}",
                                    )
                        except Exception as e:
                            log_to_backend(
                                "warning",
                                f"Failed to process embedded images on page {page_num + 1}: {str(e)}",
                            )
            finally:
                if doc:
                    doc.close()

        elif file_extension.lower() in [".docx", ".doc"]:
            update_processing_status(
                document_id, "PROCESSING", "Processing Word document...", None, 40
            )
            # Create a BytesIO object from the file content
            doc_stream = io.BytesIO(file_content)
            doc = docx.Document(doc_stream)
            for para in doc.paragraphs:
                text_content += para.text + "\n"

        elif file_extension.lower() == ".txt":
            update_processing_status(
                document_id, "PROCESSING", "Processing text file...", None, 40
            )
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
            update_processing_status(
                document_id, "PROCESSING", "Processing spreadsheet...", None, 40
            )
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
            update_processing_status(
                document_id, "PROCESSING", "Processing image with OCR...", None, 40
            )
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
                    log_to_backend(
                        "info",
                        f"OCR extracted {len(ocr_text)} characters from image {original_filename}",
                    )
                else:
                    log_to_backend(
                        "warning", f"No text found via OCR in image {original_filename}"
                    )
                    text_content = (
                        f"[Image file: {original_filename} - No text detected via OCR]"
                    )
            except Exception as e:
                log_to_backend(
                    "error",
                    f"Failed to process image file {original_filename}: {str(e)}",
                )
                raise ValueError(f"Error processing image file: {str(e)}")
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")

        update_processing_status(
            document_id, "PROCESSING", "Cleaning and chunking text...", None, 80
        )

        # Clean text content before chunking
        cleaned_text_content = clean_text_content(text_content)

        # Debug: Check text content before chunking
        print(f"🔍 Text content before chunking:")
        print(f"  Content length: {len(cleaned_text_content)}")
        print(f"  Content preview: {cleaned_text_content[:200]}...")
        print(f"  Content is empty: {not cleaned_text_content.strip()}")

        # Generate a unique document ID for vector storage
        document_id_for_storage = str(uuid.uuid4())

        # Optimize chunks with page tracking
        chunks_with_pages = optimize_chunk_size_with_pages(
            cleaned_text_content, file_extension, file_content
        )
        total_chunks = len(chunks_with_pages)

        print(f"📊 Chunking results:")
        print(f"  Total chunks generated: {total_chunks}")
        if total_chunks > 0:
            for i, chunk in enumerate(chunks_with_pages[:3]):  # Show first 3 chunks
                print(
                    f"  Chunk {i + 1}: {len(chunk['text'])} chars - {chunk['text'][:50]}..."
                )
        else:
            print(f"  ⚠️ No chunks generated!")

        update_processing_status(
            document_id, "PROCESSING", "Storing in vector database...", None, 90
        )

        if qdrant_client:
            try:
                points = []
                for idx, chunk_data in enumerate(chunks_with_pages):
                    # Debug: Check chunk data
                    print(f"Processing chunk {idx + 1}/{len(chunks_with_pages)}")
                    print(f"  Text length: {len(chunk_data['text'])}")
                    print(f"  Text preview: {chunk_data['text'][:50]}...")

                    # Generate embedding with error handling
                    try:
                        embedding = get_cached_embedding(chunk_data["text"])
                        print(f"  ✅ Embedding generated: {len(embedding)} dimensions")
                        print(f"  Embedding type: {type(embedding)}")

                        # Ensure embedding is a list
                        if hasattr(embedding, "tolist"):
                            embedding = embedding.tolist()
                        print(f"  Final embedding type: {type(embedding)}")

                    except Exception as embed_error:
                        print(f"  ❌ Embedding generation failed: {embed_error}")
                        continue

                    # Create point with error handling
                    try:
                        point = PointStruct(
                            id=str(uuid.uuid4()),
                            vector=embedding,
                            payload={
                                "document_id": document_id_for_storage,
                                "user_id": userId,
                                "content": chunk_data["text"],
                                "filename": original_filename,
                                "chunk_index": idx,
                                "page_number": chunk_data.get("page_number"),
                                "start_char": chunk_data.get("start_char"),
                                "end_char": chunk_data.get("end_char"),
                                "file_type": file_extension.lower().lstrip("."),
                            },
                        )
                        points.append(point)
                        print(f"  ✅ Point created successfully")

                    except Exception as point_error:
                        print(f"  ❌ Point creation failed: {point_error}")
                        continue

                # Upsert with error handling
                if points:
                    print(f"Attempting to upsert {len(points)} points to Qdrant...")
                    qdrant_client.upsert(
                        collection_name=qdrant_collection, points=points
                    )
                    print(
                        f"✅ Successfully upserted {len(points)} chunks to Qdrant for document {document_id_for_storage}"
                    )
                else:
                    print("⚠️ No valid points to upsert")

            except Exception as e:
                print(f"❌ Failed to upsert to Qdrant: {str(e)}")
                print(f"Error type: {type(e)}")
                import traceback

                print(f"Traceback: {traceback.format_exc()}")
                # Continue processing even if Qdrant fails

        return {
            "chunks": total_chunks,
            "document_id": document_id_for_storage,
            "content": cleaned_text_content,
            "filename": original_filename,
            "file_size": len(file_content),
            "file_type": file_extension.lower().lstrip("."),
            "pages": len(
                [c for c in chunks_with_pages if c.get("page_number") is not None]
            ),
        }

    except Exception as e:
        raise e


def process_file(
    file_content: bytes,
    file_extension: str,
    original_filename: str,
    userId: str,
) -> dict:
    """Process uploaded file with optimized chunking and Qdrant integration."""
    try:
        text_content = ""
        financial_analysis = {}

        if file_extension.lower() == ".pdf":
            doc = None
            try:
                doc = fitz.open(stream=file_content, filetype="pdf")
            except fitz.FileDataError as e:
                log_to_backend(
                    "error", f"Failed to open PDF file '{original_filename}': {str(e)}"
                )
                raise ValueError(
                    f"PDF file '{original_filename}' appears to be corrupted or broken. Please try uploading a valid PDF file."
                )
            except Exception as e:
                log_to_backend(
                    "error",
                    f"Unexpected error opening PDF file '{original_filename}': {str(e)}",
                )
                raise ValueError(
                    f"Failed to process PDF file '{original_filename}': {str(e)}"
                )

            try:
                for page in doc:
                    # Extract selectable text first
                    page_text = page.get_text()
                    text_content += page_text

                    # If no text was extracted, the page might be scanned/image-based
                    if not page_text.strip() and OCR_ENABLED:
                        log_to_backend(
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
                                log_to_backend(
                                    "info",
                                    f"OCR extracted {len(ocr_text)} characters from page {page.number + 1}",
                                )
                            else:
                                log_to_backend(
                                    "warning",
                                    f"No text found via OCR on page {page.number + 1}",
                                )
                        except Exception as e:
                            log_to_backend(
                                "error",
                                f"OCR failed on page {page.number + 1}: {str(e)}",
                            )
                    elif not page_text.strip() and not OCR_ENABLED:
                        log_to_backend(
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
                                    log_to_backend(
                                        "info",
                                        f"OCR extracted {len(ocr_text)} characters from image {img_index + 1} on page {page.number + 1}",
                                    )
                        except Exception as e:
                            log_to_backend(
                                "warning",
                                f"Failed to process embedded images on page {page.number + 1}: {str(e)}",
                            )
            finally:
                if doc:
                    doc.close()
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
                    log_to_backend(
                        "info",
                        f"OCR extracted {len(ocr_text)} characters from image {original_filename}",
                    )
                else:
                    log_to_backend(
                        "warning", f"No text found via OCR in image {original_filename}"
                    )
                    text_content = (
                        f"[Image file: {original_filename} - No text detected via OCR]"
                    )
            except Exception as e:
                log_to_backend(
                    "error",
                    f"Failed to process image file {original_filename}: {str(e)}",
                )
                raise ValueError(f"Error processing image file: {str(e)}")
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")

        # Clean text content before chunking
        cleaned_text_content = clean_text_content(text_content)

        # Debug: Check text content before chunking
        print(f"🔍 Text content before chunking:")
        print(f"  Content length: {len(cleaned_text_content)}")
        print(f"  Content preview: {cleaned_text_content[:200]}...")
        print(f"  Content is empty: {not cleaned_text_content.strip()}")

        # Generate a unique document ID for vector storage
        document_id = str(uuid.uuid4())

        # Optimize chunks with page tracking
        chunks_with_pages = optimize_chunk_size_with_pages(
            cleaned_text_content, file_extension, file_content
        )
        total_chunks = len(chunks_with_pages)

        print(f"📊 Chunking results:")
        print(f"  Total chunks generated: {total_chunks}")
        if total_chunks > 0:
            for i, chunk in enumerate(chunks_with_pages[:3]):  # Show first 3 chunks
                print(
                    f"  Chunk {i + 1}: {len(chunk['text'])} chars - {chunk['text'][:50]}..."
                )
        else:
            print(f"  ⚠️ No chunks generated!")

        if qdrant_client:
            try:
                points = []
                for idx, chunk_data in enumerate(chunks_with_pages):
                    # Debug: Check chunk data
                    print(f"Processing chunk {idx + 1}/{len(chunks_with_pages)}")
                    print(f"  Text length: {len(chunk_data['text'])}")
                    print(f"  Text preview: {chunk_data['text'][:50]}...")

                    # Generate embedding with error handling
                    try:
                        embedding = get_cached_embedding(chunk_data["text"])
                        print(f"  ✅ Embedding generated: {len(embedding)} dimensions")
                        print(f"  Embedding type: {type(embedding)}")

                        # Ensure embedding is a list
                        if hasattr(embedding, "tolist"):
                            embedding = embedding.tolist()
                        print(f"  Final embedding type: {type(embedding)}")

                    except Exception as embed_error:
                        print(f"  ❌ Embedding generation failed: {embed_error}")
                        continue

                    # Create point with error handling
                    try:
                        point = PointStruct(
                            id=str(uuid.uuid4()),
                            vector=embedding,
                            payload={
                                "document_id": document_id,
                                "user_id": userId,
                                "content": chunk_data["text"],
                                "filename": original_filename,
                                "chunk_index": idx,
                                "page_number": chunk_data.get("page_number"),
                                "start_char": chunk_data.get("start_char"),
                                "end_char": chunk_data.get("end_char"),
                                "file_type": file_extension.lower().lstrip("."),
                            },
                        )
                        points.append(point)
                        print(f"  ✅ Point created successfully")

                    except Exception as point_error:
                        print(f"  ❌ Point creation failed: {point_error}")
                        continue

                # Upsert with error handling
                if points:
                    print(f"Attempting to upsert {len(points)} points to Qdrant...")
                    qdrant_client.upsert(
                        collection_name=qdrant_collection, points=points
                    )
                    print(
                        f"✅ Successfully upserted {len(points)} chunks to Qdrant for document {document_id}"
                    )
                else:
                    print("⚠️ No valid points to upsert")

            except Exception as e:
                print(f"❌ Failed to upsert to Qdrant: {str(e)}")
                print(f"Error type: {type(e)}")
                import traceback

                print(f"Traceback: {traceback.format_exc()}")
                # Continue processing even if Qdrant fails

        return {
            "chunks": total_chunks,
            "document_id": document_id,
            "content": cleaned_text_content,
            "filename": original_filename,
            "file_size": len(file_content),
            "file_type": file_extension.lower().lstrip("."),
            "pages": len(
                [c for c in chunks_with_pages if c.get("page_number") is not None]
            ),
        }

    except Exception as e:
        raise e


router = APIRouter()
security = HTTPBearer()


def derive_encryption_key(secret: str) -> bytes:
    """Derive the encryption key using HKDF, matching NextAuth.js implementation."""
    if not secret:
        raise ValueError("NEXTAUTH_SECRET is not set")

    # Convert the secret to bytes
    secret_bytes = secret.encode()

    # Use HKDF to derive the key
    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=32,  # 32 bytes for AES-256
        salt=b"",  # NextAuth.js uses no salt
        info=b"NextAuth.js Generated Encryption Key",
        backend=default_backend(),
    )
    return hkdf.derive(secret_bytes)


def decrypt_token(token: str) -> dict:
    """Decrypt a NextAuth.js JWE token."""
    try:
        # Split the token into its components
        header_b64, _, iv_b64, ciphertext_b64, tag_b64 = token.split(".")

        # Decode the header
        header_padding = "=" * (-len(header_b64) % 4)
        header = json.loads(base64.urlsafe_b64decode(header_b64 + header_padding))

        if header.get("alg") != "dir" or header.get("enc") != "A256GCM":
            raise ValueError("Unsupported JWE algorithm or encryption")

        # Decode the other components
        iv = base64.urlsafe_b64decode(iv_b64 + "=" * (-len(iv_b64) % 4))
        ciphertext = base64.urlsafe_b64decode(
            ciphertext_b64 + "=" * (-len(ciphertext_b64) % 4)
        )
        tag = base64.urlsafe_b64decode(tag_b64 + "=" * (-len(tag_b64) % 4))

        # Derive the key using HKDF
        key = derive_encryption_key(settings.NEXTAUTH_SECRET)

        # Create AESGCM cipher
        aesgcm = AESGCM(key)

        # Decrypt the payload
        plaintext = aesgcm.decrypt(iv, ciphertext + tag, header_b64.encode())

        # Parse and return the decrypted payload
        return json.loads(plaintext)

    except Exception as e:
        print(f"Error decrypting token: {str(e)}")
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

            # Check if user is active
            user_id = payload.get("id")
            if user_id:
                # No database user lookup needed - AI service should not manage users
                pass

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
    files: Union[UploadFile, List[UploadFile]] = File(...),
    userId: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    api_key: str = Header(..., alias="X-API-Key"),
):
    """Upload one or more documents (PDF, DOC, DOCX, TXT, CSV, XLS, XLSX) for processing."""
    try:
        # Validate API key
        if api_key != settings.AI_SERVICE_API_KEY:
            raise HTTPException(status_code=401, detail="Invalid API key")

        # For now, we'll need to get user ID from the request or use a default
        # You might want to pass user ID in the form data or header
        if not userId:
            raise HTTPException(status_code=400, detail="User ID is required")

        log_to_backend("info", f"Processing upload for user: {userId}")

        # Ensure Qdrant collection exists before processing files
        if not ensure_qdrant_collection_exists():
            log_to_backend("error", "Failed to ensure Qdrant collection exists")
            raise HTTPException(status_code=500, detail="Vector database setup failed")

        # Handle both single file and list of files
        file_list = files if isinstance(files, list) else [files]
        uploaded_documents = []

        for file in file_list:
            log_to_backend("info", f"Starting upload for file: {file.filename}")

            # Read file content
            content = await file.read()

            # Debug logging
            log_to_backend(
                "info",
                f"File details: filename={file.filename}, size={file.size}, content_length={len(content) if content else 0}",
            )

            if not content:
                log_to_backend("error", f"File content is empty for {file.filename}")
                raise HTTPException(
                    status_code=400, detail=f"File '{file.filename}' content is empty"
                )

            # Validate file content
            if not content or len(content) == 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"File '{file.filename}' is empty or could not be read",
                )

            # Check file size limit (50MB)
            if len(content) > 50 * 1024 * 1024:
                raise HTTPException(
                    status_code=400,
                    detail=f"File '{file.filename}' is too large. Maximum file size is 50MB.",
                )

            # Get file extension
            _, ext = os.path.splitext(file.filename)

            # Validate PDF files have proper header
            if ext.lower() == ".pdf":
                if not content.startswith(b"%PDF"):
                    raise HTTPException(
                        status_code=400,
                        detail=f"File '{file.filename}' does not appear to be a valid PDF file",
                    )
                # Check for minimum PDF size (PDF files should be at least 100 bytes)
                if len(content) < 100:
                    raise HTTPException(
                        status_code=400,
                        detail=f"File '{file.filename}' appears to be too small to be a valid PDF file",
                    )

            # Generate document ID for tracking
            document_id = str(uuid.uuid4())

            # Initialize processing status
            update_processing_status(
                document_id,
                "UPLOADED",
                f"File {file.filename} uploaded successfully",
                None,
                0,
            )

            # Start background processing
            processing_thread = threading.Thread(
                target=process_file_background,
                args=(content, ext, file.filename, userId, document_id),
            )
            processing_thread.daemon = True
            processing_thread.start()

            # Add to uploaded documents list
            uploaded_documents.append(
                {
                    "document_id": document_id,
                    "filename": file.filename,
                    "status": "PROCESSING",
                    "message": f"File uploaded successfully. Processing started in background.",
                }
            )

            log_to_backend(
                "info",
                f"Started background processing for {file.filename} with ID: {document_id}",
            )

        return {
            "message": f"Successfully uploaded {len(file_list)} files. Processing in background.",
            "documents": uploaded_documents,
            "processing_status": "BACKGROUND",
            "user": {
                "id": userId,
                "name": "User",
                "email": "user@example.com",
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        log_to_backend("error", "Unexpected error in upload_files", error=e)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing your upload",
        )


@router.get("/status/{document_id}")
async def get_document_status(
    document_id: str,
    api_key: str = Header(..., alias="X-API-Key"),
):
    """Get processing status for a document."""
    try:
        # Validate API key
        if api_key != settings.AI_SERVICE_API_KEY:
            raise HTTPException(status_code=401, detail="Invalid API key")

        status = get_processing_status(document_id)
        # print(f"Status request for {document_id}: {status}")
        return {"document_id": document_id, "status": status}

    except HTTPException:
        raise
    except Exception as e:
        log_to_backend("error", "Unexpected error in get_document_status", error=e)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while getting document status",
        )


@router.post("/embeddings/generate")
async def generate_embedding(
    text: str = Form(...),
    api_key: str = Header(..., alias="X-API-Key"),
):
    """Generate embedding for text using the same model as document processing."""
    try:
        # Validate API key
        if api_key != settings.AI_SERVICE_API_KEY:
            raise HTTPException(status_code=401, detail="Invalid API key")

        if not embedding_model:
            raise HTTPException(status_code=500, detail="Embedding model not available")

        # Generate embedding
        embedding = get_cached_embedding(text)

        return {
            "text": text,
            "embedding": embedding,
            "dimensions": len(embedding),
        }

    except HTTPException:
        raise
    except Exception as e:
        log_to_backend("error", "Unexpected error in generate_embedding", error=e)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while generating embedding",
        )
