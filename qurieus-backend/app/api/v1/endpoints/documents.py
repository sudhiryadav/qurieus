from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Header
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
from functools import lru_cache
import datetime
import pandas as pd
import io
from langdetect import detect
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
            api_key=settings.QDRANT_API_KEY
        )
    else:
        qdrant_client = QdrantClient(settings.QDRANT_URL)
    
    qdrant_collection = settings.QDRANT_COLLECTION
    
    # Ensure collection exists
    try:
        qdrant_client.get_collection(qdrant_collection)
    except Exception:
        # Create collection if it doesn't exist
        qdrant_client.create_collection(
            collection_name=qdrant_collection,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE)  # all-MiniLM-L6-v2 has 384 dimensions
        )
    
except Exception as e:
    print(f"Warning: Could not initialize Qdrant client: {str(e)}")
    qdrant_client = None

# Cache for embeddings using lru_cache
@lru_cache(maxsize=1000)
def get_cached_embedding(text: str) -> List[float]:
    """Get cached embedding or compute new one."""
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
    """Upload one or more documents (PDF or DOC) for processing."""
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

@router.post("/query")
async def query_documents(
    request: QueryRequest,
    db: Session = Depends(get_db)
):
    """Query documents using semantic search and Ollama."""
    try:
        # Always fetch the most recent document for the user
        query = text("""
            SELECT d.content, d.metadata, d."originalName"
            FROM "Document" d
            WHERE d."userId" = :userId
            ORDER BY d."uploadedAt" DESC
            LIMIT 1
        """)
        result = db.execute(query, {"userId": request.document_owner_id}).fetchone()

        # Detect the language of the user's question
        try:
            question_language = detect(request.query)
        except Exception:
            question_language = "en"
        language_instructions = {
            "hi": "उत्तर हिंदी में दें।",
            "fr": "Veuillez répondre en français.",
            "es": "Por favor, responda en español.",
            "de": "Bitte antworten Sie auf Deutsch.",
            "en": "Please answer in English.",
        }
        supported_languages = set(language_instructions.keys())
        if question_language in supported_languages:
            language_instruction = language_instructions[question_language]
        else:
            language_instruction = (
                f"The detected language ('{question_language}') is not supported. Please answer in English."
            )

        if result:
            content, metadata, filename = result
            prompt = None
            if metadata:
                try:
                    structured_data = json.loads(metadata)
                    clean_content = content.encode('utf-8', errors='ignore').decode('utf-8')
                    clean_structured_data = json.dumps(structured_data, ensure_ascii=False)
                    prompt = f"{language_instruction}\n\nYou are an intelligent assistant. Answer the following question using all available data, including any structured tables or text.\n\nStructured Data (if any):\n{clean_structured_data}\n\nText Content:\n{clean_content}\n\nQuestion: {request.query}\n\nInstructions:\n- Provide a comprehensive answer based on the provided content\n- If the content is small, extract as much relevant information as possible\n- Be specific and detailed in your response\n- If the question cannot be answered from the content, clearly state this\n\nAnswer:"
                except json.JSONDecodeError:
                    clean_content = content.encode('utf-8', errors='ignore').decode('utf-8')
                    prompt = f"{language_instruction}\n\nYou are an intelligent assistant. Answer the following question using the provided context.\n\nContext:\n{clean_content}\n\nQuestion: {request.query}\n\nInstructions:\n- Provide a comprehensive answer based on the provided content\n- If the content is small, extract as much relevant information as possible\n- Be specific and detailed in your response\n- If the question cannot be answered from the content, clearly state this\n\nAnswer:"
            else:
                clean_content = content.encode('utf-8', errors='ignore').decode('utf-8')
                prompt = f"{language_instruction}\n\nYou are an intelligent assistant. Answer the following question using the provided context.\n\nContext:\n{clean_content}\n\nQuestion: {request.query}\n\nInstructions:\n- Provide a comprehensive answer based on the provided content\n- If the content is small, extract as much relevant information as possible\n- Be specific and detailed in your response\n- If the question cannot be answered from the content, clearly state this\n\nAnswer:"
        else:
            # Fall back to semantic search if no document found
            return await semantic_search_query(request, db, language_instruction)

        # Continue with Ollama API call...
        return await generate_ollama_response(prompt, [])
    except HTTPException:
        raise
    except Exception as e:
        log_to_frontend("error", f"Unexpected error in query_documents: {str(e)}")
        log_to_frontend("error", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred"
        )

async def semantic_search_query(request: QueryRequest, db: Session, language_instruction: str = ""):
    """Handle semantic search queries using Qdrant."""
    try:
        if not embedding_model:
            log_to_frontend("error", "Embedding model not available")
            raise HTTPException(
                status_code=503,
                detail="Search service is currently unavailable"
            )

        if not qdrant_client:
            log_to_frontend("error", "Qdrant client not available")
            raise HTTPException(
                status_code=503,
                detail="Vector database is currently unavailable"
            )

        try:
            query_embedding = get_cached_embedding(request.query)
        except Exception as e:
            log_to_frontend("error", f"Error generating embedding: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error processing your query"
            )
        
        log_to_frontend("info", "Executing Qdrant similarity search...")
        
        # Search Qdrant for similar vectors
        search_results = qdrant_client.search(
            collection_name=qdrant_collection,
            query_vector=query_embedding,
            query_filter={
                "must": [
                    {"key": "user_id", "match": {"value": request.document_owner_id}}
                ]
            },
            limit=5,  # Get top 5 most similar chunks
            with_payload=True
        )
        
        if not search_results:
            # Create a streaming response with the same structure
            async def no_docs_stream():
                yield json.dumps({
                    "response": "No relevant documents found.",
                    "done": True
                }).encode() + b"\n"

            return StreamingResponse(no_docs_stream(), media_type="application/x-ndjson")

        # Extract chunks and sources from Qdrant results
        chunks = []
        sources = []
        for result in search_results:
            if result.payload:
                chunks.append(result.payload.get("content", ""))
                sources.append({
                    "document": result.payload.get("filename", "Unknown"),
                    "similarity": float(result.score)
                })

        # Clean and encode the text properly
        context = "\n".join([chunk.encode('utf-8', errors='ignore').decode('utf-8') for chunk in chunks])

        prompt = f"{language_instruction}\n\nAnswer the following question based on the provided context. If the answer isn't in the context, say so.\n\nQuestion: {request.query}\n\nContext:\n{context}\n\nInstructions:\n- Provide a comprehensive answer based on the provided content\n- If the content is small, extract as much relevant information as possible\n- Be specific and detailed in your response\n- If the question cannot be answered from the content, clearly state this\n\nAnswer:"

        # Continue with Ollama API call...
        return await generate_ollama_response(prompt, sources)
    except Exception as e:
        log_to_frontend("error", f"Error in Qdrant semantic search: {str(e)}")
        log_to_frontend("error", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="Error processing your query"
        )

async def generate_ollama_response(prompt: str, sources: list) -> StreamingResponse:
    """Generate response from Ollama API with streaming."""
    try:
        print(f"[DEBUG] Ollama prompt: {repr(prompt)[:500]}")
        if not prompt.strip():
            print("[DEBUG] Prompt is empty!")
            raise HTTPException(
                status_code=400,
                detail="Empty prompt provided"
            )

        # Validate Ollama API URL
        if not settings.OLLAMA_API_URL:
            raise HTTPException(
                status_code=500,
                detail="Ollama API URL not configured"
            )

        # Validate model name
        model_name = settings.OLLAMA_MODEL.strip()
        if not model_name:
            raise HTTPException(
                status_code=500,
                detail="Ollama model not configured"
            )

        # First check if model exists
        try:
            model_check = requests.get(f"{settings.OLLAMA_API_URL}/api/tags")
            if model_check.ok:
                available_models = model_check.json().get("models", [])
                model_exists = any(model["name"] == model_name for model in available_models)
                if not model_exists:
                    error_msg = f"Model '{model_name}' not found. Available models: {[m['name'] for m in available_models]}"
                    log_to_frontend("error", error_msg, meta={"available_models": [m['name'] for m in available_models]})
                    raise HTTPException(
                        status_code=400,
                        detail=error_msg
                    )
        except requests.RequestException as e:
            log_to_frontend("error", "Failed to check available Ollama models", error=e)
            raise HTTPException(
                status_code=500,
                detail="Failed to check available Ollama models"
            )

        # Make the actual API call
        response = requests.post(
            f"{settings.OLLAMA_API_URL}/api/generate",
            json={
                "model": model_name,
                "prompt": prompt,
                "stream": True
            },
            stream=True
        )

        print(f"[DEBUG] Ollama API status: {response.status_code}")
        if not response.ok:
            error_text = response.text
            print(f"[DEBUG] Ollama API error: {error_text}")
            try:
                error_json = response.json()
                error_message = error_json.get("error", "Unknown error from Ollama API")
            except:
                error_message = error_text
            log_to_frontend("error", "Error from Ollama API", meta={"error_message": error_message})
            raise HTTPException(
                status_code=500,
                detail=f"Error from Ollama API: {error_message}"
            )

        # Read all lines into a list
        lines = [line for line in response.iter_lines() if line]
        print(f"[DEBUG] Ollama response lines: {len(lines)}")
        if lines:
            print(f"[DEBUG] First response line: {lines[0][:200]}")
        else:
            log_to_frontend("error", "Empty response from Ollama API")
            raise HTTPException(
                status_code=500,
                detail="Empty response from Ollama API"
            )

        # Stream from memory
        async def line_stream():
            for line in lines:
                yield line + b"\n"

        return StreamingResponse(line_stream(), media_type="application/x-ndjson")

    except HTTPException:
        raise
    except Exception as e:
        log_to_frontend("error", "Error generating response", error=e)
        raise HTTPException(
            status_code=500,
            detail=f"Error generating response: {str(e)}"
        ) 