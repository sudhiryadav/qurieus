from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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

# Add the root directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

# Now we can import from absolute paths
from app.core.config import settings
from app.database import get_db
from models import Document as DBDocument, DocumentChunk, Embedding
from app.services.document_service import process_file

router = APIRouter()
security = HTTPBearer()

# Initialize the embedding model
try:
    embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
except Exception as e:
    print(f"Warning: Could not initialize SentenceTransformer: {str(e)}")
    embedding_model = None

# Add request model
class QueryRequest(BaseModel):
    query: str
    document_owner_id: str

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
        print(f"Processing upload for user: {userId}")
        
        total_chunks = 0
        for file in files:
            print(f"Processing file: {file.filename}")
            
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
                print(f"Processed {chunks.get('chunks')} chunks from {file.filename}")
            except Exception as e:
                print(f"Error processing file {file.filename}: {str(e)}")
                print(traceback.format_exc())
                raise HTTPException(
                    status_code=500, 
                    detail=f"Error processing file {file.filename}: {str(e)}"
                )

        return {
            "message": f"Processed {len(files)} files",
            "total_chunks": total_chunks,
            "user": {
                "id": userId,
                "name": current_user.get("name"),
                "email": current_user.get("email")
            }
        }
    except HTTPException:
        raise  # Re-raise HTTP exceptions as they are already formatted
    except Exception as e:
        print(f"Unexpected error in upload_files: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Upload processing error: {str(e)}"
        )

@router.get("/documents")
async def list_documents(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all documents for the current user."""
    try:
        documents = db.query(DBDocument).filter(DBDocument.userId == current_user["sub"]).all()
        return documents
    except Exception as e:
        print(f"Error listing documents: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving documents: {str(e)}"
        )

@router.post("/query")
async def query_documents(
    request: QueryRequest,
    db: Session = Depends(get_db)
):
    """Query documents using semantic search and Ollama."""
    try:
        if not embedding_model:
            raise HTTPException(
                status_code=503,
                detail="Search service is currently unavailable. Please try again later."
            )

        print(f"Processing query for user: {request.document_owner_id}")
        print(f"Query: {request.query}")

        # Generate embedding for the query
        query_embedding = embedding_model.encode(request.query)
        print(f"Generated embedding of length: {len(query_embedding)}")

        # Find similar chunks using cosine similarity
        try:
            print("Executing SQL query for similar chunks...")
            # Convert embedding to a string of values
            embedding_values = ','.join(map(str, query_embedding.tolist()))
            
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
                LIMIT 5
            """)
            
            similar_chunks = db.execute(
                query,
                {
                    "userId": request.document_owner_id
                }
            ).fetchall()
            print(f"Found {len(similar_chunks)} similar chunks")
        except Exception as sql_error:
            print(f"SQL Error: {str(sql_error)}")
            print(f"SQL Error type: {type(sql_error)}")
            print(f"SQL Error details: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"Error executing similarity search: {str(sql_error)}"
            )

        if not similar_chunks:
            print("No similar chunks found")
            return {
                "answer": "No relevant documents found.",
                "sources": []
            }

        # Prepare context from similar chunks
        context = "\n".join([chunk[0] for chunk in similar_chunks])
        sources = [{"document": chunk[2], "similarity": chunk[3]} for chunk in similar_chunks]
        print(f"Prepared context with {len(sources)} sources")

        # Query Ollama
        try:
            print("Querying Ollama...")
            ollama_response = requests.post(
                f"{settings.OLLAMA_API_URL}/api/generate",
                json={
                    "model": "mistral",
                    "prompt": f"""Based on the following context, answer the question. 
                    If the answer cannot be found in the context, say so.
                    
                    Context:
                    {context}
                    
                    Question: {request.query}
                    
                    Answer:""",
                    "stream": False
                }
            )

            if not ollama_response.ok:
                print(f"Ollama error: {ollama_response.status_code} - {ollama_response.text}")
                raise HTTPException(
                    status_code=500,
                    detail="Failed to get response from Ollama"
                )

            response_data = ollama_response.json()
            print("Successfully got response from Ollama")
            
        except Exception as ollama_error:
            print(f"Ollama Error: {str(ollama_error)}")
            print(f"Ollama Error details: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"Error querying Ollama: {str(ollama_error)}"
            )
        
        return {
            "answer": response_data.get("response", "No answer generated."),
            "sources": sources
        }

    except Exception as e:
        print(f"Error in query_documents: {str(e)}")
        print(f"Error type: {type(e)}")
        print(f"Error details: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        ) 