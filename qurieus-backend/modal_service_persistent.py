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
app = modal.App("qurieus-app-v45")

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
MODEL_URL = "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf"
MODEL_PATH = "/data/models/mistral-7b-instruct-v0.2.Q4_K_M.gguf"

def download_model():
    import requests
    import os
    if not os.path.exists(MODEL_PATH):
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        print(f"Model not found at {MODEL_PATH}. Downloading Mistral GGUF model...")
        start_time = time.time() # Start timing
        r = requests.get(MODEL_URL, stream=True)
        r.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)
        total_size = int(r.headers.get('content-length', 0))
        downloaded_size = 0
        with open(MODEL_PATH, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
                downloaded_size += len(chunk)
                # print(f"Downloaded {downloaded_size / (1024*1024):.2f}MB / {total_size / (1024*1024):.2f}MB", end='\r')
        end_time = time.time() # End timing
        print(f"Model downloaded and saved to volume in {end_time - start_time:.2f} seconds.")
    else:
        print(f"Model already exists at {MODEL_PATH}, skipping download.")

# Global Llama model loader
llm = None

def get_llama_model():
    global llm
    if llm is None:
        download_model()  # Ensure model is present before loading, works in Modal Cloud
        
        # Log available backends and GPU info
        print("=== GPU/Backend Information (from get_llama_model) ===")
        
        try:
            import llama_cpp
            # Check if CUDA backend is available by trying to get backend info
            print("llama-cpp-python version:", llama_cpp.__version__)
            # Check for specific GPU offload capability in the library if exposed
            if hasattr(llama_cpp, 'LLAMA_SUPPORTS_K_QUANTS'):
                 print(f"LLAMA_SUPPORTS_K_QUANTS: {llama_cpp.LLAMA_SUPPORTS_K_QUANTS}")
            if hasattr(llama_cpp, '_lib') and hasattr(llama_cpp._lib, 'llama_supports_gpu_offload'):
                # This is a better check if available directly from the lib
                print(f"llama_supports_gpu_offload: {llama_cpp._lib.llama_supports_gpu_offload()}")
            else:
                print("Direct llama_supports_gpu_offload check not available.")

        except Exception as e:
            print(f"Error getting llama_cpp backend info: {e}")
        
        # Check CUDA availability (PyTorch perspective)
        try:
            import torch
            print(f"PyTorch CUDA available: {torch.cuda.is_available()}")
            if torch.cuda.is_available():
                print(f"PyTorch CUDA device count: {torch.cuda.device_count()}")
                print(f"PyTorch Current CUDA device: {torch.cuda.current_device()}")
                print(f"PyTorch CUDA device name: {torch.cuda.get_device_name()}")
        except Exception as e:
            print(f"PyTorch CUDA check failed in get_llama_model: {e}")
        
        print("Loading Llama model with n_gpu_layers=35...")
        try:
            from llama_cpp import Llama
            print(f"Model path exists: {os.path.exists(MODEL_PATH)}")
            print(f"Model file size: {os.path.getsize(MODEL_PATH) if os.path.exists(MODEL_PATH) else 'N/A'} bytes")
            
            llm = Llama(
                model_path=MODEL_PATH,
                n_ctx=4096,
                n_threads=8,
                n_gpu_layers=35, # Attempt to offload 35 layers to GPU
                verbose=True  # Enable verbose logging to see llama.cpp's internal output
            )
            
            # Log the backend being used (if exposed by llama_cpp.Llama object)
            print(f"Llama model loaded successfully!")
            try:
                print(f"Llama-cpp-python backend (from LLM object): {llm.backend}")
            except AttributeError:
                print("Backend attribute not available on LLM object (check llama-cpp-python version).")
            
            # Key indicator for GPU usage will be in the verbose logs above this line:
            print("Model loaded. CHECK LOGS ABOVE FOR 'ggml_init_cublas', 'BLAS = 1', 'offloading X layers to GPU' TO CONFIRM GPU USAGE.")
        except Exception as e:
            print(f"Error loading model for get_llama_model: {e}")
            # No fallback to CPU - exit early to save costs if GPU is intended
            raise RuntimeError(f"Failed to load model with GPU support: {e}. Check model path, n_gpu_layers, and CUDA installation.")
        
        print("=== End GPU/Backend Information (from get_llama_model) ===")
    return llm

# Upload endpoint
@app.function(
    image=image,
    gpu="T4",
    timeout=300,
    memory=4096,
    volumes={"/data": volume},
    secrets=[modal.Secret.from_name("QURIEUS_KEY")]
)
@modal.fastapi_endpoint(docs=True,label="upload-document",method="POST")
async def upload_document_endpoint(request: DocumentRequest, x_api_key: str = Header(...)):
    verify_api_key(x_api_key)
    try:
        # ... logic from process_and_store_document ...
        file_content = request.file_content
        file_extension = request.file_extension
        original_filename = request.original_filename
        user_id = request.user_id
        # Decode base64 content
        content_bytes = base64.b64decode(file_content)
        text_content = ""
        financial_analysis = {}
        if file_extension.lower() == '.pdf':
            doc = fitz.open(stream=content_bytes, filetype="pdf")
            for page in doc:
                text_content += page.get_text()
        elif file_extension.lower() in ['.docx', '.doc']:
            doc_stream = io.BytesIO(content_bytes)
            doc = docx.Document(doc_stream)
            for para in doc.paragraphs:
                text_content += para.text + "\n"
        elif file_extension.lower() in ['.xlsx', '.xls', '.csv']:
            file_stream = io.BytesIO(content_bytes)
            try:
                if file_extension.lower() == '.csv':
                    df = pd.read_csv(file_stream)
                    text_content = df.to_markdown(index=False)
                else:
                    xls = pd.ExcelFile(file_stream)
                    sheet_names = xls.sheet_names
                    sheet_tables = []
                    for idx, sheet in enumerate(sheet_names):
                        df_sheet = pd.read_excel(xls, sheet_name=sheet)
                        sheet_tables.append(f"Sheet: {sheet}\n\n{df_sheet.to_markdown(index=False)}\n")
                        if idx == 0:
                            df = df_sheet  # Use first sheet for financial analysis
                    text_content = "\n\n".join(sheet_tables)
                financial_analysis = analyze_financial_data(df)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_extension}")
        document_hash = get_document_hash(file_content, original_filename)
        document_record = {
            "id": document_hash,
            "filename": original_filename,
            "content": text_content,
            "financial_analysis": financial_analysis,
            "user_id": user_id,
            "uploaded_at": str(pd.Timestamp.now()),
            "file_extension": file_extension
        }
        user_docs_path = get_user_documents_path(user_id)
        os.makedirs(os.path.dirname(user_docs_path), exist_ok=True)
        existing_docs = []
        if os.path.exists(user_docs_path):
            with open(user_docs_path, 'r') as f:
                existing_docs = json.load(f)
        existing_docs.append(document_record)
        with open(user_docs_path, 'w') as f:
            json.dump(existing_docs, f, indent=2)
        embedding_model = SentenceTransformer("all-MiniLM-L6-v2", device="cuda")
        chunks = text_content.split('. ')
        chunks = [chunk.strip() + '. ' for chunk in chunks if chunk.strip()]
        embeddings = embedding_model.encode(chunks)
        embeddings_data = {
            "document_id": document_hash,
            "chunks": chunks,
            "embeddings": embeddings.tolist(),
            "user_id": user_id
        }
        user_embeddings_path = get_user_embeddings_path(user_id)
        os.makedirs(os.path.dirname(user_embeddings_path), exist_ok=True)
        existing_embeddings = []
        if os.path.exists(user_embeddings_path):
            with open(user_embeddings_path, 'rb') as f:
                existing_embeddings = pickle.load(f)
        existing_embeddings.append(embeddings_data)
        with open(user_embeddings_path, 'wb') as f:
            pickle.dump(existing_embeddings, f)
        return {
            "success": True,
            "document_id": document_hash,
            "chunks_processed": len(chunks),
            "filename": original_filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Query endpoint (GPU for LLM)
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
        t0 = time.time()
        user_docs_path = get_user_documents_path(user_id)
        user_embeddings_path = get_user_embeddings_path(user_id)
        print(f"PERFLOG: Checking paths - docs: {os.path.exists(user_docs_path)}, embeddings: {os.path.exists(user_embeddings_path)}")
        if not os.path.exists(user_docs_path) or not os.path.exists(user_embeddings_path):
            print("PERFLOG: No documents found for user")
            return {
                "response": "No documents found for this user.",
                "sources": [],
                "done": True
            }
        t1 = time.time()
        with open(user_docs_path, 'r') as f:
            documents = json.load(f)
        with open(user_embeddings_path, 'rb') as f:
            embeddings_data = pickle.load(f)
        print(f"PERFLOG: Loaded documents and embeddings in {time.time() - t1:.2f}s")
        embedding_model = SentenceTransformer("all-MiniLM-L6-v2", device="cuda")
        t2 = time.time()
        # Only load embeddings for this user (already done, but log)
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
        print(f"PERFLOG: Filtered user embeddings/chunks in {time.time() - t2:.2f}s. Chunks: {len(all_chunks)}")
        if not all_chunks:
            print("PERFLOG: No chunks found for user")
            return {
                "response": "No documents found for this user.",
                "sources": [],
                "done": True
            }
        t3 = time.time()
        # Vectorized similarity calculation
        import numpy as np
        emb_matrix = np.array(all_embeddings)
        query_vec = np.array(embedding_model.encode([query])[0])
        emb_matrix_norm = emb_matrix / np.linalg.norm(emb_matrix, axis=1, keepdims=True)
        query_vec_norm = query_vec / np.linalg.norm(query_vec)
        sims = emb_matrix_norm @ query_vec_norm
        similarities = list(enumerate(sims))
        print(f"PERFLOG: Vectorized similarity calculation in {time.time() - t3:.2f}s")
        similarities.sort(key=lambda x: x[1], reverse=True)
        top_indices = [idx for idx, _ in similarities[:10]]
        relevant_chunks = [all_chunks[i] for i in top_indices]
        relevant_sources = [all_sources[i] for i in top_indices]
        context = "\n".join(relevant_chunks)
        context = context[:4000]
        print(f"PERFLOG: Selected top {len(relevant_chunks)} chunks, context length: {len(context)}")
        t4 = time.time()
        # Model loading (singleton)
        try:
            print("PERFLOG: Loading LLM model...")
            llm = get_llama_model()
            print("PERFLOG: LLM model loaded (singleton):", llm is not None)
        except Exception as e:
            print(f"PERFLOG: Error loading LLM model: {e}")
            raise RuntimeError(f"Failed to load LLM model: {e}")
        print(f"PERFLOG: Model load time: {time.time() - t4:.2f}s")
        t5 = time.time()
        prompt = f"Context:\n{context}\n\nQuestion: {query}\n\nAnswer:"
        print(f"PERFLOG: Generating response with prompt length: {len(prompt)}")
        try:
            output = llm(
                prompt,
                max_tokens=512,
                temperature=0.7,
                top_p=0.95,
                stop=["</s>"]
            )
            answer = output["choices"][0]["text"].strip()
            print(f"PERFLOG: Generated answer length: {len(answer)}")
        except Exception as e:
            print(f"PERFLOG: Error generating response: {e}")
            raise RuntimeError(f"Failed to generate response: {e}")
        t6 = time.time()
        print(f"PERFLOG: LLM inference time: {t6 - t5:.2f}s")
        print(f"PERFLOG: Total query time: {time.time() - start_time:.2f}s")
        print("PERFLOG: --- END OF REQUEST ---")
        return {
            "response": answer,
            "sources": relevant_sources,
            "done": True
        }
    except Exception as e:
        print(f"PERFLOG: Exception in query_documents_endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- PERFORMANCE TUNING RECOMMENDATIONS ---
# PERFLOG: To further improve performance at scale, consider using a vector database (Qdrant, Pinecone, FAISS) instead of loading all embeddings from disk.
# PERFLOG: Use Modal's keep-warm endpoint and increase warm containers to reduce cold start latency.
# PERFLOG: Use a smaller GGUF model if latency is more important than accuracy.
# PERFLOG: Profile each step using the PERFLOG markers above.

# Delete document endpoint
@app.function(
    image=image,
    timeout=120,
    memory=2048,
    volumes={"/data": volume},
    secrets=[modal.Secret.from_name("QURIEUS_KEY")]
)
@modal.fastapi_endpoint(docs=True,label="delete-document",method="DELETE")
async def delete_document_endpoint(user_id: str, document_id: str, x_api_key: str = Header(...)):
    verify_api_key(x_api_key)
    try:
        user_docs_path = get_user_documents_path(user_id)
        user_embeddings_path = get_user_embeddings_path(user_id)
        if not os.path.exists(user_docs_path):
            return {
                "success": False,
                "message": "No documents found for this user."
            }
        with open(user_docs_path, 'r') as f:
            documents = json.load(f)
        original_count = len(documents)
        documents = [doc for doc in documents if doc["id"] != document_id]
        if len(documents) == original_count:
            return {
                "success": False,
                "message": f"Document {document_id} not found."
            }
        with open(user_docs_path, 'w') as f:
            json.dump(documents, f, indent=2)
        if os.path.exists(user_embeddings_path):
            with open(user_embeddings_path, 'rb') as f:
                embeddings_data = pickle.load(f)
            embeddings_data = [emb for emb in embeddings_data if emb["document_id"] != document_id]
            with open(user_embeddings_path, 'wb') as f:
                pickle.dump(embeddings_data, f)
        return {
            "success": True,
            "message": f"Document {document_id} deleted successfully.",
            "documents_remaining": len(documents)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Delete all documents endpoint
@app.function(
    image=image,
    timeout=120,
    memory=2048,
    volumes={"/data": volume},
    secrets=[modal.Secret.from_name("QURIEUS_KEY")]
)
@modal.fastapi_endpoint(docs=True,label="delete-all-documents",method="DELETE")
async def delete_all_documents_endpoint(user_id: str, x_api_key: str = Header(...)):
    verify_api_key(x_api_key)
    try:
        user_docs_path = get_user_documents_path(user_id)
        user_embeddings_path = get_user_embeddings_path(user_id)
        deleted_count = 0
        if os.path.exists(user_docs_path):
            with open(user_docs_path, 'r') as f:
                documents = json.load(f)
                deleted_count = len(documents)
            os.remove(user_docs_path)
        if os.path.exists(user_embeddings_path):
            os.remove(user_embeddings_path)
        user_dir = os.path.dirname(user_docs_path)
        if os.path.exists(user_dir) and not os.listdir(user_dir):
            os.rmdir(user_dir)
        return {
            "success": True,
            "message": f"All documents for user {user_id} deleted successfully.",
            "documents_deleted": deleted_count
        }
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

        # --- Attempt to load the LLM model to confirm CUDA usage ---
        print("Attempting to load LLM model with GPU offload for health check...")
        try:
            # Call your existing get_llama_model function
            # This will also trigger download_model if the model isn't there
            llm_instance = get_llama_model() 
            
            health_status["llama_model_load_success"] = True
            
            # If the model loads successfully with n_gpu_layers=-1, it implies CUDA usage
            health_status["llama_cuda_support"] = True 
            
            # To get actual offloaded layers, you'd usually parse the verbose logs.
            # A more direct way to confirm actual layers loaded to GPU is not always exposed directly by llm_instance.
            # However, if `verbose=True` and `n_gpu_layers > 0` are set, the logs will confirm.
            # For this health check, successful load with n_gpu_layers > 0 is a strong indicator.

            print("Llama model instance created successfully for health check.")

        except Exception as e:
            print(f"Error loading Llama model during health check: {e}")
            health_status["llama_model_load_success"] = False
            health_status["llama_cuda_support"] = False # Set to false if model load fails
            # Do NOT re-raise here; let the health check return with false status.

        print("Health check completed successfully")
        return health_status
        
    except Exception as e:
        print(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.function(
    image=image,
    timeout=600,
    memory=4096,
    volumes={"/data": volume},
    secrets=[modal.Secret.from_name("QURIEUS_KEY")]
)
def init_download_model():
    """Download the LLM model to the Modal volume so it is ready before any endpoint is called."""
    download_model()

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