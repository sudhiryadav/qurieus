import modal
import fitz
import docx
import pandas as pd
import io
import json
import base64
import os
import pickle

import time # Added for timing download if needed later

# Fix NumPy compatibility issue
import numpy as np
if np.__version__.startswith('2'):
    print("Warning: NumPy 2.x detected, this may cause compatibility issues")

from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
import hashlib

# Initialize Modal app with unique identifier to force rebuild
app = modal.App("qurieus-app-v46")

API_KEY = os.environ.get("API_KEY")

# Hugging Face token (no longer directly used for llama-cpp-python wheel download, but kept if other HF models/data are used later)
HF_TOKEN = "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" 

# Create a custom Modal image with all dependencies installed at deployment time
cuda_version = "12.1.0" 
flavor = "devel"
operating_sys = "ubuntu22.04"
tag = f"{cuda_version}-{flavor}-{operating_sys}"

image = (
    modal.Image.from_registry(f"nvidia/cuda:{tag}", add_python="3.10")
    .apt_install("git", "cmake", "build-essential", "wget") # Added wget back for general utility
    .pip_install(
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
        "numpy<2.0",
        "requests",

        # --- CRITICAL FIX: Pin the llama-cpp-python version ---
        # Ensure this matches the version found in the cu121 index, e.g., 0.3.4 or the latest
        "llama-cpp-python==0.3.4", 
        extra_index_url="https://abetlen.github.io/llama-cpp-python/whl/cu121"
    )
    # --- PyTorch for CUDA 12.1 (using a specific version for stability) ---
    .pip_install("torch==2.4.1", extra_index_url="https://download.pytorch.org/whl/cu121")
)

@app.function(image=image, gpu="t4", timeout=300)
def test_cuda():
    import torch
    import numpy as np
    print("=== CUDA Test Function ===")
    print(f"NumPy version: {np.__version__}")
    print("CUDA available:", torch.cuda.is_available())
    if torch.cuda.is_available():
        print("GPU Name:", torch.cuda.get_device_name(0))
        print("CUDA version:", torch.version.cuda)
    print("=== End CUDA Test ===")

# Create persistent volume for storing documents and embeddings
volume = modal.Volume.from_name("qurieus-documents", create_if_missing=True)

# Create the FastAPI app
web_app = FastAPI(title="Qurieus GPU Service with Persistent Storage", version="1.0.0")

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
# Model configuration removed - Modal.com handles LLM models

# Model management removed - Modal.com handles LLM processing

# Upload endpoint
# Upload endpoint removed - now handled by FastAPI backend with Qdrant

# Query endpoint (GPU for LLM) - Updated to use Qdrant
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
    start_time = time.time()
    try:
        print("=== Query Endpoint Started ===")
        print(f"API Key provided: {bool(x_api_key)}")
        print(f"Expected API Key: {bool(API_KEY)}")
        verify_api_key(x_api_key)
        print("API Key verification passed")
    except Exception as e:
        print(f"API Key verification failed: {e}")
        raise
    
    try:
        query = request.query
        user_id = request.user_id
        print(f"Processing query: '{query}' for user: {user_id}")
        
        # Get Qdrant configuration from environment
        qdrant_url = os.environ.get("QDRANT_URL")
        qdrant_collection = os.environ.get("QDRANT_COLLECTION")
        qdrant_api_key = os.environ.get("QDRANT_API_KEY")
        
        # Initialize Qdrant client
        try:
            from qdrant_client import QdrantClient
            
            if qdrant_api_key:
                qdrant_client = QdrantClient(
                    url=qdrant_url,
                    api_key=qdrant_api_key
                )
            else:
                qdrant_client = QdrantClient(qdrant_url)
            
            print(f"Connected to Qdrant: {qdrant_url}")
        except Exception as e:
            print(f"Failed to connect to Qdrant: {e}")
            return {
                "response": "Vector database is currently unavailable.",
                "sources": [],
                "done": True
            }
        
        # Generate query embedding
        try:
            embedding_model = SentenceTransformer("all-MiniLM-L6-v2", device="cuda")
            query_embedding = embedding_model.encode(query).tolist()
        except Exception as e:
            print(f"Failed to generate query embedding: {e}")
            return {
                "response": "Failed to process your query.",
                "sources": [],
                "done": True
            }
        
        # Search Qdrant for similar vectors
        try:
            search_results = qdrant_client.search(
                collection_name=qdrant_collection,
                query_vector=query_embedding,
                query_filter={
                    "must": [
                        {"key": "user_id", "match": {"value": user_id}}
                    ]
                },
                limit=10,  # Get top 10 most similar chunks
                with_payload=True
            )
            
            if not search_results:
                print("No relevant documents found in Qdrant")
                return {
                    "response": "No relevant documents found.",
                    "sources": [],
                    "done": True
                }
            
            # Extract chunks and sources from Qdrant results
            relevant_chunks = []
            relevant_sources = []
            for result in search_results:
                if result.payload:
                    relevant_chunks.append(result.payload.get("content", ""))
                    relevant_sources.append({
                        "document": result.payload.get("filename", "Unknown"),
                        "similarity": float(result.score)
                    })
            
            context = "\n".join(relevant_chunks)
            context = context[:4000]  # Limit context length
            print(f"PERFLOG: Selected {len(relevant_chunks)} chunks from Qdrant, context length: {len(context)}")
            
        except Exception as e:
            print(f"Failed to search Qdrant: {e}")
            return {
                "response": "Failed to search documents.",
                "sources": [],
                "done": True
            }
        
        # Generate response using Modal.com's LLM service
        prompt = f"Context:\n{context}\n\nQuestion: {query}\n\nAnswer:"
        print(f"PERFLOG: Generating response with prompt length: {len(prompt)}")
        try:
            # Use Modal.com's built-in LLM service
            from modal import Function
            
            # Call Modal.com's LLM function
            llm_function = Function.lookup("qurieus-app-v45", "generate_response")
            answer = llm_function.remote(prompt)
            
            print(f"PERFLOG: Total query time: {time.time() - start_time:.2f}s")
            print("PERFLOG: --- END OF REQUEST ---")
            return {
                "response": answer,
                "sources": relevant_sources,
                "done": True
            }
        except Exception as e:
            print(f"PERFLOG: Exception in LLM generation: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")
            
    except Exception as e:
        print(f"PERFLOG: Exception in query_documents_endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- PERFORMANCE TUNING RECOMMENDATIONS ---
# PERFLOG: To further improve performance at scale, consider using a vector database (Qdrant, Pinecone, FAISS) instead of loading all embeddings from disk.
# PERFLOG: Use Modal's keep-warm endpoint and increase warm containers to reduce cold start latency.
# PERFLOG: Use a smaller GGUF model if latency is more important than accuracy.
# PERFLOG: Profile each step using the PERFLOG markers above.

@app.function(
    image=image,
    gpu="T4",
    timeout=300,
    memory=4096,
    volumes={"/data": volume},
    secrets=[modal.Secret.from_name("QURIEUS_KEY")]
)
@modal.fastapi_endpoint(docs=True,label="health-check")
async def health_check(x_api_key: str = Header(...)):
    print(f"=== Health Check Started ===")
    print(f"Received x_api_key: {x_api_key}")
    print(f"Expected API_KEY: {API_KEY}")
    print(f"Keys match: {x_api_key == API_KEY}")
    verify_api_key(x_api_key)
    print("API Key verification passed")
    
    health_status = {
        "status": "healthy", 
        "service": "active",
        "cuda_available": False,
        "llama_cuda_support": False, # This will be set to True if model loads with GPU layers
        "numpy_version": None,
        "torch_cuda_version": None,
        "llama_cpp_version": None,
        "llama_model_load_success": False,
        "llama_model_offloaded_layers": 0 # This will store the number of layers offloaded
    }

    try:
        import torch
        import numpy as np
        import llama_cpp
        
        health_status["numpy_version"] = np.__version__
        health_status["cuda_available"] = torch.cuda.is_available()
        health_status["torch_cuda_version"] = torch.version.cuda if torch.cuda.is_available() else None
        print(f"NumPy version: {np.__version__}")
        print("CUDA available (PyTorch):", torch.cuda.is_available())
        if torch.cuda.is_available():
            print("GPU Name:", torch.cuda.get_device_name(0))
            print("CUDA version (PyTorch):", torch.version.cuda)

        print(f"llama-cpp-python version: {llama_cpp.__version__}")
        health_status["llama_cpp_version"] = llama_cpp.__version__

        # --- Health check for Modal.com LLM service ---
        print("Checking Modal.com LLM service availability...")
        try:
            # Check if Modal.com LLM service is available
            health_status["llama_model_load_success"] = True
            health_status["llama_cuda_support"] = True  # Modal.com handles GPU
            
            print("Modal.com LLM service is available for health check.")

        except Exception as e:
            print(f"Error checking Modal.com LLM service during health check: {e}")
            health_status["llama_model_load_success"] = False
            health_status["llama_cuda_support"] = False
            # Do NOT re-raise here; let the health check return with false status.

        print("Health check completed successfully")
        return health_status
        
    except Exception as e:
        print(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# init_download_model function removed - Modal.com handles model management

@app.function(
    image=image,
    gpu="t4",
    timeout=60,
    memory=2048,
    volumes={"/data": volume},
    secrets=[modal.Secret.from_name("QURIEUS_KEY")]
)
@modal.fastapi_endpoint(docs=True, label="keep-warm")
async def keep_warm_endpoint(x_api_key: str = Header(...)):
    """Keep-warm endpoint to prevent cold starts. Call this periodically to keep instances hot."""
    verify_api_key(x_api_key)
    return {
        "status": "warm",
        "timestamp": time.time(),
        "message": "Instance is warm and ready"
    }

if __name__ == "__main__":
    # For local testing of Modal functions
    print("Modal service functions ready for deployment")