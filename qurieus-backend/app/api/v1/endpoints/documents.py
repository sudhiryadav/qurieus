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
from functools import lru_cache
import datetime
import pandas as pd
import io
from langdetect import detect

# Add the root directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

# Now we can import from absolute paths
from app.core.config import settings
from app.database import get_db
from models import Document as DBDocument, DocumentChunk, Embedding, Users

# Initialize the embedding model with a smaller model
try:
    embedding_model = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
except Exception as e:
    print(f"Warning: Could not initialize SentenceTransformer: {str(e)}")
    embedding_model = None

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
            content=text_content,
            description="",
            category="",
            keywords="",
            doc_metadata=json.dumps(financial_analysis) if financial_analysis else None
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
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload one or more documents (PDF or DOC) for processing."""
    try:
        # Use the authenticated user id from token
        userId = current_user.get("id")
        log_to_frontend("info", f"Processing upload for user: {userId}", user=current_user)
        
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
                log_to_frontend("error", error_msg, user=current_user, error=e)
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
        log_to_frontend("error", "Unexpected error in upload_files", user=current_user, error=e)
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
    """Handle semantic search queries."""
    try:
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
        
        # Get all embeddings for the user
        embeddings = db.query(Embedding).filter(Embedding.userId == request.document_owner_id).all()
        
        # Calculate cosine similarity for each embedding
        similarities = []
        for emb in embeddings:
            # Calculate cosine similarity
            dot_product = sum(a * b for a, b in zip(query_embedding, emb.vector))
            norm_a = sum(a * a for a in query_embedding) ** 0.5
            norm_b = sum(b * b for b in emb.vector) ** 0.5
            similarity = dot_product / (norm_a * norm_b) if norm_a * norm_b != 0 else 0
            similarities.append((emb, similarity))
        
        # Sort by similarity and get top 3
        similarities.sort(key=lambda x: x[1], reverse=True)
        top_chunks = similarities[:3]
        
        if not top_chunks:
            # Create a streaming response with the same structure
            async def no_docs_stream():
                yield json.dumps({
                    "response": "No relevant documents found.",
                    "done": True
                }).encode() + b"\n"

            return StreamingResponse(no_docs_stream(), media_type="application/x-ndjson")

        # Get the chunks and their content
        chunks = []
        sources = []
        for emb, similarity in top_chunks:
            chunk = db.query(DocumentChunk).filter(DocumentChunk.id == emb.chunkId).first()
            if chunk:
                doc = db.query(DBDocument).filter(DBDocument.id == chunk.documentId).first()
                if doc:
                    chunks.append(chunk.content)
                    sources.append({
                        "document": doc.originalName,
                        "similarity": float(similarity)
                    })

        # Clean and encode the text properly
        context = "\n".join([chunk.encode('utf-8', errors='ignore').decode('utf-8') for chunk in chunks])

        prompt = f"{language_instruction}\n\nAnswer the following question based on the provided context. If the answer isn't in the context, say so.\n\nQuestion: {request.query}\n\nContext:\n{context}\n\nInstructions:\n- Provide a comprehensive answer based on the provided content\n- If the content is small, extract as much relevant information as possible\n- Be specific and detailed in your response\n- If the question cannot be answered from the content, clearly state this\n\nAnswer:"

        # Continue with Ollama API call...
        return await generate_ollama_response(prompt, sources)
    except Exception as e:
        log_to_frontend("error", f"Error in semantic search: {str(e)}")
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