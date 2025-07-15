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
app = modal.App("qurieus-app-v57")

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
        "qdrant-client",

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
    collection_name: Optional[str] = None  # Allow collection override

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
        # Model should already be downloaded during container startup
        if not os.path.exists(MODEL_PATH):
            raise RuntimeError(f"Model not found at {MODEL_PATH}. Please ensure model was downloaded during container startup.")
        
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
async def query_documents_endpoint(
    request: QueryRequest, 
    x_api_key: str = Header(...),
    x_collection: Optional[str] = Header(None)
):
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
        qdrant_api_key = os.environ.get("QDRANT_API_KEY")
        
        # Determine collection name: header override > request body > environment default
        default_collection = os.environ.get("QDRANT_COLLECTION", "user_documents_embeddings")
        qdrant_collection = x_collection or request.collection_name or default_collection
        
        print(f"Using Qdrant collection: {qdrant_collection}")
        print(f"Collection source: {'header' if x_collection else 'request body' if request.collection_name else 'environment default'}")
        
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
        
        # Generate response using the LLM model
        print(f"PERFLOG: Generating response with context length: {len(context)}")
        try:
            print("Loading LLM model...")
            llm = get_llama_model()
            print("LLM model loaded successfully")
        except Exception as e:
            print(f"Error loading LLM model: {e}")
            raise RuntimeError(f"Failed to load LLM model: {e}")
        
        # Format prompt according to Mistral Instruct template
        prompt = f"[INST] Based on the following context, please answer the question:\n\nContext:\n{context}\n\nQuestion: {query} [/INST]"
        print(f"Generating response with prompt length: {len(prompt)}")
        
        try:
            # Try streaming first, fallback to non-streaming if it fails
            from fastapi.responses import StreamingResponse
            import json
            
            def generate_stream():
                try:
                    # First try streaming
                    print("Attempting streaming generation...")
                    print(f"Prompt: {prompt[:200]}...")  # Show first 200 chars of prompt
                    output = llm(
                        prompt,
                        max_tokens=512,
                        temperature=0.7,
                        top_p=0.95,
                        stop=["</s>"],
                        stream=True
                    )
                    
                    answer = ""
                    chunk_count = 0
                    for chunk in output:
                        chunk_count += 1
                        print(f"Received chunk {chunk_count}: {chunk}")
                        
                        if "choices" in chunk and len(chunk["choices"]) > 0:
                            # Handle both streaming and non-streaming formats
                            choice = chunk["choices"][0]
                            
                            # For streaming format (delta)
                            if "delta" in choice:
                                delta = choice.get("delta", {})
                                if "content" in delta:
                                    content = delta["content"]
                                    answer += content
                                    # Yield each chunk as it's generated
                                    yield f"data: {json.dumps({'response': content, 'done': False})}\n\n"
                            
                            # For non-streaming format (text)
                            elif "text" in choice:
                                content = choice["text"]
                                if content:  # Only process non-empty content
                                    answer += content
                                    print(f"Added content: '{content}', total answer now: '{answer}'")
                                    # Yield each chunk as it's generated
                                    yield f"data: {json.dumps({'response': content, 'done': False})}\n\n"
                    
                    print(f"Streaming completed. Total chunks: {chunk_count}, Answer length: {len(answer)}")
                    print(f"Final accumulated answer: '{answer}'")
                    
                    # If no content was generated, try non-streaming
                    if not answer.strip():
                        print("No content from streaming, trying non-streaming...")
                        print(f"Non-streaming prompt: {prompt[:200]}...")
                        non_stream_output = llm(
                            prompt,
                            max_tokens=512,
                            temperature=0.7,
                            top_p=0.95,
                            stop=["</s>"],
                            stream=False
                        )
                        
                        if "choices" in non_stream_output and len(non_stream_output["choices"]) > 0:
                            answer = non_stream_output["choices"][0]["text"].strip()
                            print(f"Non-streaming generated answer: {answer}")
                            print(f"Full non-streaming output: {non_stream_output}")
                            
                            # Send the complete answer as a single chunk
                            if answer:
                                yield f"data: {json.dumps({'response': answer, 'done': False})}\n\n"
                    
                    # Send final chunk with done flag and sources
                    final_response = {
                        "response": "",
                        "sources": relevant_sources,
                        "done": True
                    }
                    yield f"data: {json.dumps(final_response)}\n\n"
                    
                    print(f"Generated answer length: {len(answer)}")
                    print(f"PERFLOG: Total query time: {time.time() - start_time:.2f}s")
                    print("PERFLOG: --- END OF REQUEST ---")
                    
                except Exception as e:
                    print(f"PERFLOG: Exception in streaming generation: {e}")
                    # Try non-streaming as fallback
                    try:
                        print("Streaming failed, trying non-streaming fallback...")
                        non_stream_output = llm(
                            prompt,
                            max_tokens=512,
                            temperature=0.7,
                            top_p=0.95,
                            stop=["</s>"],
                            stream=False
                        )
                        
                        if "choices" in non_stream_output and len(non_stream_output["choices"]) > 0:
                            answer = non_stream_output["choices"][0]["text"].strip()
                            print(f"Fallback non-streaming generated answer: {answer}")
                            
                            if answer:
                                yield f"data: {json.dumps({'response': answer, 'done': False})}\n\n"
                        
                        # Send final chunk
                        final_response = {
                            "response": "",
                            "sources": relevant_sources,
                            "done": True
                        }
                        yield f"data: {json.dumps(final_response)}\n\n"
                        
                    except Exception as fallback_error:
                        print(f"PERFLOG: Fallback also failed: {fallback_error}")
                        error_response = {
                            "response": f"Error generating response: {str(fallback_error)}",
                            "sources": [],
                            "done": True
                        }
                        yield f"data: {json.dumps(error_response)}\n\n"
            
            return StreamingResponse(
                generate_stream(),
                media_type="text/plain",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                }
            )
            
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

        # --- Attempt to load the LLM model to confirm CUDA usage ---
        print("Attempting to load LLM model with GPU offload for health check...")
        try:
            # Call your existing get_llama_model function
            # This will also trigger download_model if the model isn't there
            get_llama_model() 
            
            health_status["llama_model_load_success"] = True
            
            # If the model loads successfully with n_gpu_layers=35, it implies CUDA usage
            health_status["llama_cuda_support"] = True 

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
    cpu=4,  # Use CPU instead of GPU
    timeout=600,
    memory=4096,
    volumes={"/data": volume},
    secrets=[modal.Secret.from_name("QURIEUS_KEY")]
)
@modal.fastapi_endpoint(docs=True, label="download-model", method="POST")
async def download_model_endpoint(x_api_key: str = Header(...)):
    """Download the LLM model to persistent storage."""
    verify_api_key(x_api_key)
    try:
        print("🚀 Starting model download...")
        download_model()
        print("✅ Model download completed successfully")
        return {
            "success": True,
            "message": "Model downloaded successfully",
            "model_path": MODEL_PATH,
            "model_size_mb": os.path.getsize(MODEL_PATH) / (1024 * 1024) if os.path.exists(MODEL_PATH) else 0
        }
    except Exception as e:
        print(f"❌ Model download failed: {e}")
        raise HTTPException(status_code=500, detail=f"Model download failed: {str(e)}")



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