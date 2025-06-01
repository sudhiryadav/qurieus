from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
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
        
        if file_extension.lower() == '.pdf':
            doc = fitz.open(stream=file_content, filetype="pdf")
            for page in doc:
                text_content += page.get_text()
        elif file_extension.lower() in ['.docx', '.doc']:
            doc = docx.Document(file_content)
            for para in doc.paragraphs:
                text_content += para.text + "\n"
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")
        
        # Create document record with all required fields
        document = DBDocument(
            originalName=original_filename,
            fileName=original_filename,  # Set fileName same as originalName
            fileType=file_extension.lower().lstrip('.'),  # Remove the dot from extension
            fileSize=len(file_content),  # Set file size in bytes
            userId=userId,
            uploadedAt=datetime.datetime.utcnow(),  # Set upload timestamp
            content=text_content,  # Store the extracted text content
            description="",  # Set empty string for optional fields
            category="",  # Set empty string for optional fields
            keywords=""  # Set empty string for optional fields
        )
        db.add(document)
        db.flush()  # Get the document ID
        
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
        
        log_to_frontend("info", "Starting query processing...")

        if not embedding_model:
            log_to_frontend("error", "Embedding model not available")
            raise HTTPException(
                status_code=503,
                detail="Search service is currently unavailable"
            )

        # Get cached embedding for query
        try:
            query_embedding = get_cached_embedding(request.query)
        except Exception as e:
            log_to_frontend("error", f"Error generating embedding: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error processing your query"
            )
        
        # Find similar chunks using cosine similarity
        try:
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

            # Prepare context from similar chunks
            context = "\n".join([chunk[0][:1000] for chunk in similar_chunks])
            sources = [{"document": chunk[2], "similarity": chunk[3]} for chunk in similar_chunks]

            # Query Ollama with optimized prompt
            prompt = f"""Answer the following question based on the provided context. If the answer isn't in the context, say so.

Question: {request.query}

Context:
{context}

Answer:"""
            
            # Verify Ollama API URL is configured
            if not hasattr(settings, 'OLLAMA_API_URL') or not settings.OLLAMA_API_URL:
                log_to_frontend("error", "Ollama API URL not configured")
                raise HTTPException(
                    status_code=503,
                    detail="AI service configuration is missing"
                )

            try:
                # Log the API URL being used (without sensitive info)
                log_to_frontend("info", f"Attempting to connect to Ollama API at {settings.OLLAMA_API_URL}")
                
                # First check if Ollama is running and get available models
                try:
                    log_to_frontend("info", "Checking Ollama model availability...")
                    models_response = requests.get(
                        f"{settings.OLLAMA_API_URL}/api/tags",
                        timeout=5
                    )
                    models_response.raise_for_status()
                    
                    # Log the raw response for debugging
                    log_to_frontend("debug", f"Raw models response: {models_response.text}")
                    
                    available_models = models_response.json().get("models", [])
                    log_to_frontend("info", f"Found {len(available_models)} available models")
                    
                    # Log each available model
                    for model in available_models:
                        model_name = model.get("name", "unknown")
                        model_size = model.get("size", "unknown")
                        model_modified = model.get("modified_at", "unknown")
                        log_to_frontend("info", f"Model: {model_name}, Size: {model_size}, Modified: {model_modified}")
                    
                    # Check for configured model
                    configured_model = settings.OLLAMA_MODEL
                    model_available = any(
                        model.get("name", "").startswith(configured_model) 
                        for model in available_models
                    )
                    if not model_available:
                        log_to_frontend("error", f"Configured model '{configured_model}' not found in Ollama. Available models: " + 
                                     ", ".join(model.get("name", "unknown") for model in available_models))
                        raise HTTPException(
                            status_code=503,
                            detail=f"Configured AI model '{configured_model}' is not available. Please contact support."
                        )
                    else:
                        # Get the full model name for use in the API call
                        selected_model = next(
                            model.get("name") 
                            for model in available_models 
                            if model.get("name", "").startswith(configured_model)
                        )
                        log_to_frontend("info", f"Model '{selected_model}' is available and ready to use")

                except requests.exceptions.RequestException as e:
                    log_to_frontend("error", f"Failed to get available models from Ollama: {str(e)}")
                    log_to_frontend("error", f"Request URL: {settings.OLLAMA_API_URL}/api/tags")
                    log_to_frontend("error", f"Request headers: {models_response.request.headers if 'models_response' in locals() else 'No request made'}")
                    raise HTTPException(
                        status_code=503,
                        detail="AI service is not properly configured. Please contact support."
                    )

                # Now try to generate the response
                log_to_frontend("info", "Initiating chat with Ollama model...")
                try:
                    # First, check if the model is ready with a quick health check
                    health_check = requests.get(
                        f"{settings.OLLAMA_API_URL}/api/tags",  # Use tags endpoint as health check
                        timeout=5
                    )
                    health_check.raise_for_status()
                    log_to_frontend("info", "Ollama service health check passed")

                    # Set up the chat request with longer timeouts
                    ollama_response = requests.post(
                        f"{settings.OLLAMA_API_URL}/api/generate",
                        json={
                            "model": selected_model,
                            "prompt": f"""Context:
{context}

Question: {request.query}

Answer:""",
                            "stream": True,
                            "options": {
                                "temperature": 0.7,
                                "top_p": 0.9,
                                "max_tokens": 250,  # Reduced from 500
                                "num_predict": 250,  # Reduced from 500
                                "stop": ["User:", "Assistant:", "[INST]", "None", "\nUser:", "\nAssistant:"],
                                "num_ctx": 2048,  # Limit context window
                                "repeat_penalty": 1.1,  # Reduce repetition
                                "top_k": 40  # Limit token selection
                            }
                        },
                        stream=True,
                        timeout=(10, 60)  # Reduced read timeout from 120 to 60 seconds
                    )
                    ollama_response.raise_for_status()
                    log_to_frontend("info", "Successfully connected to Ollama generate API")

                    async def generate():
                        try:
                            response_text = ""
                            start_time = time.time()
                            for line in ollama_response.iter_lines():
                                if time.time() - start_time > 55:  # Stop if approaching timeout
                                    log_to_frontend("warning", "Approaching timeout limit, sending partial response")
                                    break
                                    
                                if line:
                                    chunk = json.loads(line)
                                    if chunk.get("response"):  # Changed from message.content to response
                                        response_text += chunk["response"]
                                        yield json.dumps({"chunk": chunk["response"]}) + "\n"
                            
                            final_response = {
                                "final": True,
                                "answer": response_text.strip(),
                                "sources": sources
                            }
                            
                            # Cache the result if Redis is available
                            if REDIS_AVAILABLE:
                                try:
                                    redis_client.setex(
                                        cache_key,
                                        3600,  # Cache for 1 hour
                                        json.dumps(final_response)
                                    )
                                except Exception as e:
                                    log_to_frontend("error", f"Failed to cache result: {str(e)}")
                            
                            yield json.dumps(final_response) + "\n"
                        except Exception as e:
                            log_to_frontend("error", f"Error in response generation: {str(e)}")
                            log_to_frontend("error", f"Response chunk: {chunk if 'chunk' in locals() else 'No chunk'}")
                            yield json.dumps({
                                "final": True,
                                "answer": "I apologize, but I encountered an error while processing your request.",
                                "sources": []
                            }) + "\n"

                    return StreamingResponse(
                        generate(),
                        media_type="application/x-ndjson"
                    )

                except requests.exceptions.Timeout as e:
                    if isinstance(e, requests.exceptions.ConnectTimeout):
                        log_to_frontend("error", "Connection to Ollama API timed out")
                        raise HTTPException(
                            status_code=503,
                            detail="Could not connect to AI service. Please try again later."
                        )
                    else:
                        log_to_frontend("error", "Ollama API request timed out during response generation")
                        raise HTTPException(
                            status_code=503,
                            detail="AI service is taking too long to respond. Please try again with a shorter query."
                        )
                except requests.exceptions.ConnectionError:
                    log_to_frontend("error", "Could not connect to Ollama API. Please ensure the Ollama server is running.")
                    log_to_frontend("error", f"Connection attempt to: {settings.OLLAMA_API_URL}")
                    raise HTTPException(
                        status_code=503,
                        detail="AI service is currently unavailable. Please try again later."
                    )
                except requests.exceptions.HTTPError as e:
                    log_to_frontend("error", f"Ollama API error: {str(e)}")
                    log_to_frontend("error", f"Response status code: {e.response.status_code}")
                    log_to_frontend("error", f"Response content: {e.response.text}")
                    if e.response.status_code == 404:
                        raise HTTPException(
                            status_code=503,
                            detail="AI service endpoint not found. Please check the configuration."
                        )
                    raise HTTPException(
                        status_code=503,
                        detail="AI service is currently unavailable. Please try again later."
                    )
                except Exception as e:
                    log_to_frontend("error", f"Unexpected error with Ollama API: {str(e)}")
                    log_to_frontend("error", f"Error type: {type(e).__name__}")
                    log_to_frontend("error", f"Error details: {traceback.format_exc()}")
                    raise HTTPException(
                        status_code=503,
                        detail="AI service encountered an unexpected error. Please try again later."
                    )

            except Exception as e:
                log_to_frontend("error", f"Error in query processing: {str(e)}")
                log_to_frontend("error", traceback.format_exc())
                raise HTTPException(
                    status_code=500,
                    detail="Error processing your query"
                )
            
        except Exception as e:
            log_to_frontend("error", f"Error in query processing: {str(e)}")
            log_to_frontend("error", traceback.format_exc())
            raise HTTPException(
                status_code=500,
                detail="Error processing your query"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        log_to_frontend("error", f"Unexpected error in query_documents: {str(e)}")
        log_to_frontend("error", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred"
        ) 