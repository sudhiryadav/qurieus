import modal
import fitz
import docx
import pandas as pd
import io
import json
import base64
import os
import pickle
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
import hashlib

# Initialize Modal app
app = modal.App("qurieus-app")

# Define the image with all necessary dependencies
image = (
    modal.Image.debian_slim()
    .apt_install("git", "build-essential", "cmake")
    .pip_install([
        "sentence-transformers",
        "PyMuPDF",
        "python-docx",
        "pandas",
        "fastapi",
        "uvicorn",
        "langdetect",
        "openpyxl",
        "tabulate",
        "xlrd",
        "llama-cpp-python"
    ])
)

# Create persistent volume for storing documents and embeddings
volume = modal.Volume.from_name("qurieus-documents", create_if_missing=True)

# Create the FastAPI app
web_app = FastAPI(title="Qurieus GPU Service with Persistent Storage", version="1.0.0")

API_KEY = os.environ.get("API")

def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")

class DocumentRequest(BaseModel):
    file_content: str  # base64 encoded
    file_extension: str
    original_filename: str
    user_id: str

class QueryRequest(BaseModel):
    query: str
    user_id: str
    history: Optional[List[dict]] = None

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
                'total': float(df[col].sum()),
                'average': float(df[col].mean()),
                'trend': float(df[col].pct_change().mean())
            }
        # Expense analysis
        elif any(term in col_lower for term in ['expense', 'cost', 'spend']):
            analysis['expense_metrics'] = {
                'total': float(df[col].sum()),
                'average': float(df[col].mean()),
                'trend': float(df[col].pct_change().mean())
            }
        # Profit analysis
        elif any(term in col_lower for term in ['profit', 'margin', 'earnings']):
            analysis['profit_metrics'] = {
                'total': float(df[col].sum()),
                'average': float(df[col].mean()),
                'trend': float(df[col].pct_change().mean())
            }
    
    return analysis

def get_user_documents_path(user_id: str) -> str:
    """Get the path for user's documents in the persistent volume."""
    return f"/data/users/{user_id}/documents.json"

def get_user_embeddings_path(user_id: str) -> str:
    """Get the path for user's embeddings in the persistent volume."""
    return f"/data/users/{user_id}/embeddings.pkl"

def get_document_hash(file_content: str, filename: str) -> str:
    """Generate a unique hash for the document."""
    content_hash = hashlib.md5(file_content.encode()).hexdigest()
    return f"{filename}_{content_hash}"

# Model download logic (at container start)
MODEL_URL = "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf"
MODEL_PATH = "/data/models/mistral-7b-instruct-v0.2.Q4_K_M.gguf"

def download_model():
    import requests
    import os
    if not os.path.exists(MODEL_PATH):
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        print("Downloading Mistral GGUF model...")
        r = requests.get(MODEL_URL, stream=True)
        with open(MODEL_PATH, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
        print("Model downloaded.")

# Download model at container start
@app.local_entrypoint()
def _download_model_on_start():
    download_model()

# Global Llama model loader
llm = None

def get_llama_model():
    global llm
    if llm is None:
        from llama_cpp import Llama
        llm = Llama(
            model_path=MODEL_PATH,
            n_ctx=4096,
            n_threads=8,
            n_gpu_layers=35
        )
    return llm

@app.function(
    image=image,
    # gpu="T4",
    timeout=300,
    memory=4096,
    volumes={"/data": volume},
    secrets=[modal.Secret.from_name("QURIEUS_KEY")]
)
@modal.fastapi_endpoint(docs=True,label="upload-document",method="POST")
async def upload_document_endpoint(request: DocumentRequest, x_api_key: str = Header(...)):
    verify_api_key(x_api_key)
    try:
        result = process_and_store_document.remote(
            request.file_content,
            request.file_extension,
            request.original_filename,
            request.user_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.function(
    image=image,
    gpu="T4",
    timeout=120,
    memory=2048,
    volumes={"/data": volume}
)
def query_user_documents(query: str, user_id: str) -> Dict[str, Any]:
    """Query user's documents using stored embeddings and generate an answer with Mistral LLM."""
    try:
        # Load user's documents and embeddings
        user_docs_path = get_user_documents_path(user_id)
        user_embeddings_path = get_user_embeddings_path(user_id)
        
        if not os.path.exists(user_docs_path) or not os.path.exists(user_embeddings_path):
            return {
                "response": "No documents found for this user.",
                "sources": [],
                "done": True
            }
        
        # Load documents
        with open(user_docs_path, 'r') as f:
            documents = json.load(f)
        
        # Load embeddings
        with open(user_embeddings_path, 'rb') as f:
            embeddings_data = pickle.load(f)
        
        # Generate query embedding
        embedding_model = SentenceTransformer("all-MiniLM-L6-v2", device="cuda")
        query_embedding = embedding_model.encode([query])
        
        # Find most similar chunks
        all_chunks = []
        all_embeddings = []
        all_sources = []
        
        for doc_embeddings in embeddings_data:
            if doc_embeddings["user_id"] == user_id:
                all_chunks.extend(doc_embeddings["chunks"])
                all_embeddings.extend(doc_embeddings["embeddings"])
                doc = next((d for d in documents if d["id"] == doc_embeddings["document_id"]), None)
                if doc:
                    all_sources.extend([doc["filename"]] * len(doc_embeddings["chunks"]))
        
        if not all_chunks:
            return {
                "response": "No documents found for this user.",
                "sources": [],
                "done": True
            }
        
        # Calculate similarities
        similarities = []
        for i, chunk_embedding in enumerate(all_embeddings):
            dot_product = sum(a * b for a, b in zip(query_embedding[0], chunk_embedding))
            norm_a = sum(a * a for a in query_embedding[0]) ** 0.5
            norm_b = sum(b * b for b in chunk_embedding) ** 0.5
            similarity = dot_product / (norm_a * norm_b) if norm_a * norm_b != 0 else 0
            similarities.append((i, similarity))
        
        # Sort by similarity and get top 10
        similarities.sort(key=lambda x: x[1], reverse=True)
        top_indices = [idx for idx, _ in similarities[:10]]
        
        # Get relevant chunks and sources
        relevant_chunks = [all_chunks[i] for i in top_indices]
        relevant_sources = [all_sources[i] for i in top_indices]
        
        # Create a larger context window (up to 4096 chars)
        context = "\n".join(relevant_chunks)
        context = context[:4000]
        
        # Generate answer using quantized Mistral LLM
        llm = get_llama_model()
        prompt = f"Context:\n{context}\n\nQuestion: {query}\n\nAnswer:"
        output = llm(
            prompt,
            max_tokens=512,
            temperature=0.7,
            top_p=0.95,
            stop=["</s>"]
        )
        answer = output["choices"][0]["text"].strip()
        
        return {
            "response": answer,
            "sources": relevant_sources,
            "done": True
        }
        
    except Exception as e:
        raise Exception(f"Error querying documents: {str(e)}")

@app.function(
    image=image,
    # gpu="T4",
    timeout=120,
    memory=2048,
    volumes={"/data": volume}
)
def delete_user_document(user_id: str, document_id: str) -> Dict[str, Any]:
    """Delete a specific document from Modal's persistent volume."""
    try:
        user_docs_path = get_user_documents_path(user_id)
        user_embeddings_path = get_user_embeddings_path(user_id)
        
        if not os.path.exists(user_docs_path):
            return {
                "success": False,
                "message": "No documents found for this user."
            }
        
        # Load existing documents
        with open(user_docs_path, 'r') as f:
            documents = json.load(f)
        
        # Find and remove the document
        original_count = len(documents)
        documents = [doc for doc in documents if doc["id"] != document_id]
        
        if len(documents) == original_count:
            return {
                "success": False,
                "message": f"Document {document_id} not found."
            }
        
        # Save updated documents
        with open(user_docs_path, 'w') as f:
            json.dump(documents, f, indent=2)
        
        # Update embeddings if they exist
        if os.path.exists(user_embeddings_path):
            with open(user_embeddings_path, 'rb') as f:
                embeddings_data = pickle.load(f)
            
            # Remove embeddings for this document
            embeddings_data = [emb for emb in embeddings_data if emb["document_id"] != document_id]
            
            with open(user_embeddings_path, 'wb') as f:
                pickle.dump(embeddings_data, f)
        
        return {
            "success": True,
            "message": f"Document {document_id} deleted successfully.",
            "documents_remaining": len(documents)
        }
        
    except Exception as e:
        raise Exception(f"Error deleting document: {str(e)}")

@app.function(
    image=image,
    # gpu="T4",
    timeout=120,
    memory=2048,
    volumes={"/data": volume}
)
def delete_all_user_documents(user_id: str) -> Dict[str, Any]:
    """Delete all documents for a user from Modal's persistent volume."""
    try:
        user_docs_path = get_user_documents_path(user_id)
        user_embeddings_path = get_user_embeddings_path(user_id)
        
        deleted_count = 0
        
        # Delete documents file
        if os.path.exists(user_docs_path):
            with open(user_docs_path, 'r') as f:
                documents = json.load(f)
                deleted_count = len(documents)
            os.remove(user_docs_path)
        
        # Delete embeddings file
        if os.path.exists(user_embeddings_path):
            os.remove(user_embeddings_path)
        
        # Remove user directory if empty
        user_dir = os.path.dirname(user_docs_path)
        if os.path.exists(user_dir) and not os.listdir(user_dir):
            os.rmdir(user_dir)
        
        return {
            "success": True,
            "message": f"All documents for user {user_id} deleted successfully.",
            "documents_deleted": deleted_count
        }
        
    except Exception as e:
        raise Exception(f"Error deleting all documents: {str(e)}")

@app.function(
    image=image,
    # gpu="T4",
    timeout=300,
    memory=4096,
    volumes={"/data": volume},
    secrets=[modal.Secret.from_name("QURIEUS_KEY")]
)
@modal.fastapi_endpoint(docs=True,label="health-check")
async def health_check(x_api_key: str = Header(...)):
    verify_api_key(x_api_key)
    return {"status": "healthy", "service": "active"}

@app.function(
    image=image,
    # gpu="T4",
    timeout=300,
    memory=4096,
    volumes={"/data": volume},
    secrets=[modal.Secret.from_name("QURIEUS_KEY")]
)
@modal.fastapi_endpoint(docs=True,label="delete-document",method="DELETE")
async def delete_document_endpoint(user_id: str, document_id: str, x_api_key: str = Header(...)):
    verify_api_key(x_api_key)
    try:
        result = delete_user_document.remote(user_id, document_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.function(
    image=image,
    # gpu="T4",
    timeout=300,
    memory=4096,
    volumes={"/data": volume},
    secrets=[modal.Secret.from_name("QURIEUS_KEY")]
)
@modal.fastapi_endpoint(docs=True,label="delete-all-documents",method="DELETE")
async def delete_all_documents_endpoint(user_id: str, x_api_key: str = Header(...)):
    verify_api_key(x_api_key)
    try:
        result = delete_all_user_documents.remote(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.function(
    image=image,
    gpu="T4",
    timeout=300,
    memory=4096,
    volumes={"/data": volume},
    secrets=[modal.Secret.from_name("QURIEUS_KEY")]
)
@modal.fastapi_endpoint(docs=True, label="query-documents", method="POST")
async def query_documents_endpoint(request: QueryRequest, x_api_key: str = Header(...)):
    verify_api_key(x_api_key)
    try:
        result = query_user_documents.remote(
            request.query,
            request.user_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Deploy the FastAPI app using Modal's fastapi endpoint
@app.function(
    image=image,
    # gpu="T4",
    timeout=300,
    memory=4096,
    volumes={"/data": volume}
)
@modal.fastapi_endpoint(docs=True,label="api")
def web():
    """Deploy the FastAPI app to Modal."""
    return web_app

if __name__ == "__main__":
    # For local testing of Modal functions
    print("Modal service functions ready for deployment") 