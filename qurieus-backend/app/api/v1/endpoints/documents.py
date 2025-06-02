from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel
import os
import sys
import fitz
import docx
import json
import traceback
import base64
import requests
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend
from sentence_transformers import SentenceTransformer
from app.utils.logger import log_to_frontend
import time
from functools import lru_cache
import hashlib
import datetime
import pandas as pd
import io

# Add the root directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

# Now we can import from absolute paths
from app.core.config import settings
from app.database import get_db
from models import Document as DBDocument, DocumentChunk, Embedding

# Initialize Redis client for caching (optional)
try:
    import redis
    redis_client = redis.Redis(
        host=settings.REDIS_HOST if hasattr(settings, 'REDIS_HOST') else 'localhost',
        port=settings.REDIS_PORT if hasattr(settings, 'REDIS_PORT') else 6379,
        password=settings.REDIS_PASSWORD if hasattr(settings, 'REDIS_PASSWORD') else None,
        decode_responses=True,
        socket_timeout=5,  # 5 second timeout
        socket_connect_timeout=5
    )
    # Test connection
    redis_client.ping()
    REDIS_AVAILABLE = True
    print("Redis connection successful")
except Exception as e:
    print(f"Redis not available: {str(e)}")
    REDIS_AVAILABLE = False
    redis_client = None

# Initialize the embedding model with a smaller model
try:
    embedding_model = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
except Exception as e:
    print(f"Warning: Could not initialize SentenceTransformer: {str(e)}")
    embedding_model = None

# Cache for embeddings
@lru_cache(maxsize=1000)
def get_cached_embedding(text: str) -> List[float]:
    """Get cached embedding or compute new one."""
    if not REDIS_AVAILABLE:
        return embedding_model.encode(text).tolist()
    
    try:
        cache_key = f"embedding:{hashlib.md5(text.encode()).hexdigest()}"
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        
        embedding = embedding_model.encode(text).tolist()
        redis_client.setex(cache_key, 3600, json.dumps(embedding))  # Cache for 1 hour
        return embedding
    except Exception as e:
        print(f"Redis error, falling back to direct embedding: {str(e)}")
        return embedding_model.encode(text).tolist()

def optimize_chunk_size(text: str, target_size: int = 500) -> List[str]:
    """Optimize chunk size based on content."""
    # Split by sentences first
    sentences = text.split('. ')
    chunks = []
    current_chunk = []
    current_size = 0
    
    for sentence in sentences:
        sentence = sentence.strip() + '. '
        sentence_size = len(sentence)
        
        if current_size + sentence_size > target_size and current_chunk:
            chunks.append(''.join(current_chunk))
            current_chunk = [sentence]
            current_size = sentence_size
        else:
            current_chunk.append(sentence)
            current_size += sentence_size
    
    if current_chunk:
        chunks.append(''.join(current_chunk))
    
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

def process_file(
    file_content: bytes,
    file_extension: str,
    original_filename: str,
    userId: str,
    db: Session
) -> dict:
    """Process uploaded file with optimized chunking."""
    try:
        text_content = ""
        financial_analysis = {}
        
        if file_extension.lower() == '.pdf':
            doc = fitz.open(stream=file_content, filetype="pdf")
            for page in doc:
                text_content += page.get_text()
        elif file_extension.lower() in ['.docx', '.doc']:
            doc = docx.Document(file_content)
            for para in doc.paragraphs:
                text_content += para.text + "\n"
        elif file_extension.lower() in ['.xlsx', '.xls', '.csv']:
            # Handle Excel and CSV files
            try:
                if file_extension.lower() == '.csv':
                    df = pd.read_csv(io.BytesIO(file_content))
                else:
                    df = pd.read_excel(io.BytesIO(file_content))
                # Convert DataFrame to text for embedding
                text_content = df.to_string()
                # Perform financial analysis
                financial_analysis = analyze_financial_data(df)
            except Exception as e:
                print(f"Error processing file: {str(e)}")
                raise ValueError(f"Error processing file: {str(e)}")
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")
        
        # Create document record with all required fields
        document = DBDocument(
            originalName=original_filename,
            fileName=original_filename,
            fileType=file_extension.lower().lstrip('.'),
            fileSize=len(file_content),
            userId=userId,
            uploadedAt=datetime.datetime.utcnow(),
            content=text_content,
            description="",
            category="",
            keywords="",
            metadata=json.dumps(financial_analysis) if financial_analysis else None
        )
        db.add(document)
        db.flush()
        
        # Optimize chunks
        chunks = optimize_chunk_size(text_content)
        total_chunks = 0
        
        # Process chunks in batches
        batch_size = 10
        for i in range(0, len(chunks), batch_size):
            batch_chunks = chunks[i:i + batch_size]
            
            # Create chunks and embeddings in parallel
            chunk_records = []
            for idx, chunk_text in enumerate(batch_chunks):
                chunk = DocumentChunk(
                    content=chunk_text,
                    documentId=document.id,
                    chunkIndex=total_chunks + idx  # Set the chunk index
                )
                db.add(chunk)
                chunk_records.append(chunk)
            
            db.flush()  # Get chunk IDs
            
            # Generate embeddings in batch
            for chunk in chunk_records:
                embedding = get_cached_embedding(chunk.content)
                embedding_record = Embedding(
                    vector=embedding,
                    chunkId=chunk.id,
                    userId=userId
                )
                db.add(embedding_record)
            
            total_chunks += len(batch_chunks)
            db.commit()
        
        return {"chunks": total_chunks}
        
    except Exception as e:
        db.rollback()
        raise e

router = APIRouter()
security = HTTPBearer()

# Add request model
class QueryRequest(BaseModel):
    query: str
    document_owner_id: str
    history: Optional[List[dict]] = None  # [{role: "user"/"assistant", content: "..."}]

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

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
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
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload one or more documents (PDF or DOC) for processing."""
    try:
        # Use the authenticated user id from token
        userId = current_user.get("id")
        log_to_frontend("info", f"Processing upload for user: {userId}", user=current_user)
        
        # Validate file sizes
        for file in files:
            content = await file.read()
            if len(content) > settings.MAX_FILE_SIZE_BYTES:
                log_to_frontend("error", f"File {file.filename} exceeds size limit", user=current_user)
                raise HTTPException(
                    status_code=400,
                    detail="File size exceeds the maximum limit"
                )
            # Reset file pointer for later reading
            await file.seek(0)
        
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
                log_to_frontend("error", f"{error_msg}: {str(e)}")
                log_to_frontend("error", traceback.format_exc())
                raise HTTPException(
                    status_code=500, 
                    detail="Error processing document"
                )

        return {
            "message": f"Successfully processed {len(files)} files",
            "total_chunks": total_chunks,
            "user": {
                "id": userId,
                "name": current_user.get("name"),
                "email": current_user.get("email")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        log_to_frontend("error", f"Unexpected error in upload_files: {str(e)}")
        log_to_frontend("error", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing your upload"
        )

@router.post("/query")
async def query_documents(
    request: QueryRequest,
    db: Session = Depends(get_db)
):
    """Query documents using semantic search and Ollama with caching."""
    try:
        # Generate cache key for the query
        cache_key = f"query:{hashlib.md5(request.query.encode()).hexdigest()}"
        
        # Try to get from cache if Redis is available
        if REDIS_AVAILABLE:
            try:
                cached_result = redis_client.get(cache_key)
                if cached_result:
                    return StreamingResponse(
                        iter([cached_result]),
                        media_type="application/x-ndjson"
                    )
            except Exception as e:
                log_to_frontend("error", f"Redis cache error: {str(e)}")

        # Check if this is a financial data query
        financial_terms = ['revenue', 'income', 'expense', 'profit', 'margin', 'earnings', 'cost', 'sales']
        is_financial_query = any(term in request.query.lower() for term in financial_terms)

        if is_financial_query:
            # Query for documents with financial metadata
            query = text("""
                SELECT d.content, d.metadata, d."originalName"
                FROM "Document" d
                WHERE d.metadata IS NOT NULL
                AND d."userId" = :userId
                ORDER BY d."uploadedAt" DESC
                LIMIT 1
            """)
            
            result = db.execute(query, {"userId": request.document_owner_id}).fetchone()
            
            if result:
                content, metadata, filename = result
                if metadata:
                    try:
                        financial_data = json.loads(metadata)
                        # Enhance the prompt with financial context
                        prompt = f"""You are a financial analyst assistant. Answer the following question based on the financial data provided.

Financial Data Summary:
{json.dumps(financial_data, indent=2)}

Question: {request.query}

Please provide a detailed analysis focusing on the financial metrics and trends. If specific numbers are requested, include them in your response.

Answer:"""
                    except json.JSONDecodeError:
                        prompt = f"""Answer the following question based on the provided context.

Context:
{content}

Question: {request.query}

Answer:"""
                else:
                    prompt = f"""Answer the following question based on the provided context.

Context:
{content}

Question: {request.query}

Answer:"""
            else:
                # Fall back to semantic search if no financial document found
                return await semantic_search_query(request, db)
        else:
            # Use regular semantic search for non-financial queries
            return await semantic_search_query(request, db)

        # Rest of the existing code for Ollama API call...

    except HTTPException:
        raise
    except Exception as e:
        log_to_frontend("error", f"Unexpected error in query_documents: {str(e)}")
        log_to_frontend("error", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred"
        )

async def semantic_search_query(request: QueryRequest, db: Session):
    """Handle semantic search queries."""
    try:
        cache_key = f"query:{hashlib.md5(request.query.encode()).hexdigest()}"
        if not embedding_model:
            log_to_frontend("error", "Embedding model not available")
            raise HTTPException(
                status_code=503,
                detail="Search service is currently unavailable"
            )

        try:
            query_embedding = get_cached_embedding(request.query)
        except Exception as e:
            log_to_frontend("error", f"Error generating embedding: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error processing your query"
            )
        
        log_to_frontend("info", "Executing similarity search...")
        
        embedding_values = ','.join(map(str, query_embedding))
        
        query = text(f"""
            WITH query_embedding AS (
                SELECT ARRAY[{embedding_values}]::vector AS embedding
            )
            SELECT 
                dc.content,
                dc."documentId",
                d."originalName",
                1 - (e.vector::vector <=> query_embedding.embedding) as similarity
            FROM "DocumentChunk" dc
            JOIN "Embedding" e ON e."chunkId" = dc.id
            JOIN "Document" d ON d.id = dc."documentId"
            CROSS JOIN query_embedding
            WHERE e."userId" = :userId
            ORDER BY similarity DESC
            LIMIT 3
        """)
        
        similar_chunks = db.execute(
            query,
            {"userId": request.document_owner_id}
        ).fetchall()

        if not similar_chunks:
            return {
                "answer": "No relevant documents found.",
                "sources": []
            }

        context = "\n".join([chunk[0][:1000] for chunk in similar_chunks])
        sources = [{"document": chunk[2], "similarity": chunk[3]} for chunk in similar_chunks]

        prompt = f"""Answer the following question based on the provided context. If the answer isn't in the context, say so.

Question: {request.query}

Context:
{context}

Answer:"""

        # Continue with Ollama API call...
        return await generate_ollama_response(prompt, sources, cache_key)
    except Exception as e:
        log_to_frontend("error", f"Error in semantic search: {str(e)}")
        log_to_frontend("error", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="Error processing your query"
        )

async def generate_ollama_response(prompt: str, sources: list, cache_key: str) -> StreamingResponse:
    """Generate response from Ollama API with streaming."""
    try:
        print(f"[DEBUG] Ollama prompt: {repr(prompt)[:500]}")
        if not prompt.strip():
            print("[DEBUG] Prompt is empty!")

        response = requests.post(
            f"{settings.OLLAMA_API_URL}/api/generate",
            json={
                "model": settings.OLLAMA_MODEL,
                "prompt": prompt,
                "stream": True
            },
            stream=True
        )

        print(f"[DEBUG] Ollama API status: {response.status_code}")
        if not response.ok:
            print("[DEBUG] Ollama API error:", response.text)
            raise HTTPException(
                status_code=500,
                detail="Error from Ollama API"
            )

        # Read all lines into a list (so we can cache and stream)
        lines = [line for line in response.iter_lines() if line]
        print(f"[DEBUG] Ollama response lines: {len(lines)}")
        if lines:
            print(f"[DEBUG] First response line: {lines[0][:200]}")
        else:
            print("[DEBUG] Ollama response is empty!")

        # Cache the response if Redis is available
        if REDIS_AVAILABLE:
            try:
                full_response = "\n".join(line.decode() for line in lines)
                redis_client.setex(cache_key, 3600, full_response)  # Cache for 1 hour
            except Exception as e:
                print(f"Redis caching error: {str(e)}")

        # Stream from memory
        async def line_stream():
            for line in lines:
                yield line + b"\n"

        return StreamingResponse(line_stream(), media_type="application/x-ndjson")

    except Exception as e:
        print(f"[DEBUG] Exception in generate_ollama_response: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating response: {str(e)}"
        ) 