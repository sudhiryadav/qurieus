from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
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

# Add the root directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

# Now we can import from absolute paths
from app.core.config import settings
from app.database import get_db
from models import Document as DBDocument, Users

# Initialize the embedding model with a smaller model
try:
    embedding_model = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
    print("✅ Embedding model initialized successfully")
except Exception as e:
    print(f"Warning: Could not initialize SentenceTransformer: {str(e)}")
    embedding_model = None

# Initialize Qdrant client
try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import PointStruct, Distance, VectorParams
    
    # Initialize Qdrant client with optional authentication
    if settings.QDRANT_API_KEY:
        qdrant_client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
            check_compatibility=False  # Skip version compatibility check
        )
    else:
        qdrant_client = QdrantClient(
            settings.QDRANT_URL,
            check_compatibility=False  # Skip version compatibility check
        )
    
    qdrant_collection = settings.QDRANT_COLLECTION
    print(f"✅ Qdrant client initialized successfully for collection: {qdrant_collection}")
    
except Exception as e:
    print(f"Warning: Could not initialize Qdrant client: {str(e)}")
    qdrant_client = None

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
                vectors_config=VectorParams(size=384, distance=Distance.COSINE)  # all-MiniLM-L6-v2 has 384 dimensions
            )
            print(f"✅ Successfully created collection '{qdrant_collection}'")
            
            # Create payload indexes for filtering
            try:
                qdrant_client.create_payload_index(
                    collection_name=qdrant_collection,
                    field_name="user_id",
                    field_schema="keyword"
                )
                print(f"✅ Created payload index for user_id in collection {qdrant_collection}")
            except Exception as e:
                print(f"⚠️  Warning: Could not create payload index for user_id: {e}")
            
            try:
                qdrant_client.create_payload_index(
                    collection_name=qdrant_collection,
                    field_name="document_id",
                    field_schema="keyword"
                )
                print(f"✅ Created payload index for document_id in collection {qdrant_collection}")
            except Exception as e:
                print(f"⚠️  Warning: Could not create payload index for document_id: {e}")
            
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
    """Optimize chunk size based on content with contact information preservation."""
    # First, try to identify contact information sections
    contact_sections = []
    contact_keywords = ['contact', 'phone', 'email', 'address', 'call', 'reach', 'get in touch']
    
    # Split by paragraphs first to preserve contact sections
    paragraphs = text.split('\n\n')
    
    for paragraph in paragraphs:
        if any(keyword in paragraph.lower() for keyword in contact_keywords):
            contact_sections.append(paragraph.strip())
    
    # Split by sentences for regular content
    sentences = text.split('. ')
    chunks = []
    current_chunk = []
    current_size = 0
    
    for sentence in sentences:
        sentence = sentence.strip() + '. '
        sentence_size = len(sentence)
        
        # If this sentence contains contact info, try to keep it with related content
        if any(keyword in sentence.lower() for keyword in contact_keywords):
            # If current chunk is getting large, start a new one
            if current_size > target_size * 0.7 and current_chunk:
                chunks.append(''.join(current_chunk))
                current_chunk = [sentence]
                current_size = sentence_size
            else:
                current_chunk.append(sentence)
                current_size += sentence_size
        else:
            # Regular content
            if current_size + sentence_size > target_size and current_chunk:
                chunks.append(''.join(current_chunk))
                current_chunk = [sentence]
                current_size = sentence_size
            else:
                current_chunk.append(sentence)
                current_size += sentence_size
    
    if current_chunk:
        chunks.append(''.join(current_chunk))
    
    # If we found contact sections, ensure they're in their own chunks
    if contact_sections:
        contact_chunk = '\n\n'.join(contact_sections)
        if len(contact_chunk) <= target_size:
            # Add contact chunk at the beginning for better retrieval
            chunks.insert(0, contact_chunk)
        else:
            # Split contact chunk if too large
            contact_chunks = [contact_chunk[i:i+target_size] for i in range(0, len(contact_chunk), target_size)]
            chunks = contact_chunks + chunks
    
    return chunks

def analyze_financial_data(df: pd.DataFrame) -> Dict[str, Any]:
    """Analyze financial data from DataFrame and return key metrics."""
    analysis = {}
    
    # Basic statistics for numeric columns
    numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns
    if not numeric_cols.empty:
        analysis['numeric_summary'] = df[numeric_cols].describe().to_dict()
    
    # Try to identify financial metrics
    for col in df.columns:
        col_lower = col.lower()
        # Revenue/Income analysis
        if any(term in col_lower for term in ['revenue', 'income', 'sales']):
            analysis['revenue_metrics'] = {
                'total': df[col].sum(),
                'average': df[col].mean(),
                'trend': df[col].pct_change().mean()
            }
        # Expense analysis
        elif any(term in col_lower for term in ['expense', 'cost', 'spend']):
            analysis['expense_metrics'] = {
                'total': df[col].sum(),
                'average': df[col].mean(),
                'trend': df[col].pct_change().mean()
            }
        # Profit analysis
        elif any(term in col_lower for term in ['profit', 'margin', 'earnings']):
            analysis['profit_metrics'] = {
                'total': df[col].sum(),
                'average': df[col].mean(),
                'trend': df[col].pct_change().mean()
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
    text = text.replace('\x00', '')
    
    # Remove other control characters except newlines and tabs
    text = re.sub(r'[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    return text

def process_file(
    file_content: bytes,
    file_extension: str,
    original_filename: str,
    userId: str,
    db: Session
) -> dict:
    """Process uploaded file with optimized chunking and Qdrant integration."""
    try:
        text_content = ""
        financial_analysis = {}
        
        if file_extension.lower() == '.pdf':
            doc = fitz.open(stream=file_content, filetype="pdf")
            for page in doc:
                text_content += page.get_text()
        elif file_extension.lower() in ['.docx', '.doc']:
            # Create a BytesIO object from the file content
            doc_stream = io.BytesIO(file_content)
            doc = docx.Document(doc_stream)
            for para in doc.paragraphs:
                text_content += para.text + "\n"
        elif file_extension.lower() == '.txt':
            # Handle plain text files
            try:
                # Try UTF-8 first
                text_content = file_content.decode('utf-8')
            except UnicodeDecodeError:
                try:
                    # Fallback to UTF-8 with error handling
                    text_content = file_content.decode('utf-8', errors='replace')
                except Exception:
                    # Final fallback to latin-1
                    text_content = file_content.decode('latin-1', errors='replace')
        elif file_extension.lower() in ['.xlsx', '.xls', '.csv']:
            file_stream = io.BytesIO(file_content)
            try:
                if file_extension.lower() == '.csv':
                    df = pd.read_csv(file_stream)
                    text_content = df_to_markdown(df)
                else:
                    xls = pd.ExcelFile(file_stream)
                    sheet_names = xls.sheet_names
                    sheet_tables = []
                    for idx, sheet in enumerate(sheet_names):
                        df_sheet = pd.read_excel(xls, sheet_name=sheet)
                        sheet_tables.append(f"Sheet: {sheet}\n\n{df_to_markdown(df_sheet)}\n")
                        if idx == 0:
                            df = df_sheet  # Use first sheet for financial analysis
                    text_content = "\n\n".join(sheet_tables)
                # Perform financial analysis on the first sheet only
                financial_analysis = analyze_financial_data(df)
            except Exception as e:
                print(f"Error processing file: {str(e)}")
                raise ValueError(f"Error processing file: {str(e)}")
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")
        
        # Create document record with all required fields
        now = datetime.datetime.utcnow()
        document = DBDocument(
            title=original_filename.replace(file_extension, ""),  # Set title from filename without extension
            fileName=original_filename.replace(file_extension, ""),  # Remove file extension for fileName
            originalName=original_filename,
            fileType=file_extension.lower().lstrip('.'),
            fileSize=len(file_content),
            userId=userId,
            uploadedAt=now,
            updatedAt=now,  # Set updatedAt to current time
            content=clean_text_content(text_content),
            description="",
            category="",
            keywords="",
            doc_metadata=json.dumps(financial_analysis) if financial_analysis else None
        )
        db.add(document)
        db.flush()
        
        # Commit the document record
        db.commit()
        
        # Clean text content before chunking
        cleaned_text_content = clean_text_content(text_content)
        
        # Optimize chunks
        chunks = optimize_chunk_size(cleaned_text_content)
        total_chunks = len(chunks)
        
        # Store chunks directly in Qdrant (no database storage for chunks)
        if qdrant_client:
            try:
                points = []
                for idx, chunk_text in enumerate(chunks):
                    embedding = get_cached_embedding(chunk_text)
                    points.append(PointStruct(
                        id=str(uuid.uuid4()),
                        vector=embedding,
                        payload={
                            "document_id": document.id,
                            "user_id": userId,
                            "content": chunk_text,
                            "filename": original_filename,
                            "chunk_index": idx
                        }
                    ))
                
                qdrant_client.upsert(
                    collection_name=qdrant_collection,
                    points=points
                )
                print(f"Upserted {len(points)} chunks to Qdrant for document {document.id}")
            except Exception as e:
                print(f"Warning: Failed to upsert to Qdrant: {str(e)}")
                # Continue processing even if Qdrant fails
        
        return {"chunks": total_chunks}
        
    except Exception as e:
        db.rollback()
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
        backend=default_backend()
    )
    return hkdf.derive(secret_bytes)

def decrypt_token(token: str) -> dict:
    """Decrypt a NextAuth.js JWE token."""
    try:
        # Split the token into its components
        header_b64, _, iv_b64, ciphertext_b64, tag_b64 = token.split('.')
        
        # Decode the header
        header_padding = '=' * (-len(header_b64) % 4)
        header = json.loads(base64.urlsafe_b64decode(header_b64 + header_padding))
        
        if header.get('alg') != 'dir' or header.get('enc') != 'A256GCM':
            raise ValueError("Unsupported JWE algorithm or encryption")
        
        # Decode the other components
        iv = base64.urlsafe_b64decode(iv_b64 + '=' * (-len(iv_b64) % 4))
        ciphertext = base64.urlsafe_b64decode(ciphertext_b64 + '=' * (-len(ciphertext_b64) % 4))
        tag = base64.urlsafe_b64decode(tag_b64 + '=' * (-len(tag_b64) % 4))
        
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
    db: Session = Depends(get_db)
):
    """Get current user from Next.js session token."""
    try:
        token = credentials.credentials
        print(f"Received token: {token[:20]}...")
        
        # Enhanced debugging
        print(f"Token length: {len(token)}")
        print(f"Token parts: {len(token.split('.'))}")
        print(f"Token format: {'JWE' if len(token.split('.')) == 5 else 'JWT' if len(token.split('.')) == 3 else 'Unknown'}")
        
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
                user = db.query(Users).filter(Users.id == user_id).first()
                if not user or not user.is_active:
                    raise HTTPException(
                        status_code=401,
                        detail="Account has been deactivated"
                    )
            
            return payload
        except Exception as e:
            print(f"Token decryption error: {str(e)}")
            raise HTTPException(
                status_code=401,
                detail=f"Invalid token: {str(e)}"
            )
                
    except Exception as e:
        print(f"Authentication error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=401,
            detail=f"Authentication failed: {str(e)}"
        )

@router.post("/upload")
async def upload_files(
    files: List[UploadFile] = File(...),
    userId: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    api_key: str = Header(..., alias="X-API-Key"),
    db: Session = Depends(get_db)
):
    """Upload one or more documents (PDF, DOC, DOCX, TXT, CSV, XLS, XLSX) for processing."""
    try:
        # Validate API key
        if api_key != settings.BACKEND_API_KEY:
            raise HTTPException(
                status_code=401,
                detail="Invalid API key"
            )
        
        # For now, we'll need to get user ID from the request or use a default
        # You might want to pass user ID in the form data or header
        if not userId:
            raise HTTPException(
                status_code=400,
                detail="User ID is required"
            )
        
        log_to_frontend("info", f"Processing upload for user: {userId}")
        
        # Ensure Qdrant collection exists before processing files
        if not ensure_qdrant_collection_exists():
            log_to_frontend("error", "Failed to ensure Qdrant collection exists")
            raise HTTPException(
                status_code=500,
                detail="Vector database setup failed"
            )
        
        total_chunks = 0
        for file in files:
            log_to_frontend("info", f"Processing file: {file.filename}")
            
            # Read file content
            content = await file.read()
            
            # Get file extension
            _, ext = os.path.splitext(file.filename)
            
            try:
                # Process the document
                chunks = process_file(
                    file_content=content,
                    file_extension=ext,
                    original_filename=file.filename,
                    userId=userId,
                    db=db
                )
                total_chunks += chunks.get("chunks")
                log_to_frontend("info", f"Processed {chunks.get('chunks')} chunks from {file.filename}")
            except Exception as e:
                error_msg = f"Error processing file {file.filename}"
                log_to_frontend("error", error_msg, error=e)
                raise HTTPException(
                    status_code=500, 
                    detail="Error processing document"
                )

        return {
            "message": f"Successfully processed {len(files)} files",
            "total_chunks": total_chunks,
            "user": {
                "id": userId,
                "name": "User",  # We don't have user details from API key auth
                "email": "user@example.com"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        log_to_frontend("error", "Unexpected error in upload_files", error=e)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing your upload"
        )

 