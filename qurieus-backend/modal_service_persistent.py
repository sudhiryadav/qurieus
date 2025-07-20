import modal
import json
import os
import time

# Fix NumPy compatibility issue
import numpy as np
if np.__version__.startswith('2'):
    print("Warning: NumPy 2.x detected, this may cause compatibility issues")

from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
import re

# Initialize Modal app with unique identifier to force rebuild
app = modal.App("qurieus-app-v58")  # Increment version for rebuild

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

# Create persistent volume for storing documents and embeddings
volume = modal.Volume.from_name("qurieus-documents", create_if_missing=True)

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

# Global model instances for caching
llm = None
embedding_model = None

def get_embedding_model():
    """Get cached embedding model instance."""
    global embedding_model
    if embedding_model is None:
        print("Initializing embedding model...")
        # Use a better model for document Q&A
        embedding_model = SentenceTransformer("BAAI/bge-small-en-v1.5", device="cuda")
        print("Embedding model initialized successfully")
    return embedding_model

def get_llama_model():
    """Get cached LLM model instance."""
    global llm
    if llm is None:
        # Model should already be downloaded during container startup
        if not os.path.exists(MODEL_PATH):
            raise RuntimeError(f"Model not found at {MODEL_PATH}. Please ensure model was downloaded during container startup.")
        
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
                verbose=False  # Disable verbose logging for better performance
            )
            
            print(f"Llama model loaded successfully!")
            
        except Exception as e:
            print(f"Error loading model for get_llama_model: {e}")
            raise RuntimeError(f"Failed to load model with GPU support: {e}. Check model path, n_gpu_layers, and CUDA installation.")
        
    return llm

# Initialize models at container startup
def initialize_models_at_startup():
    """Initialize both models during container startup to avoid cold starts."""
    try:
        print("🚀 Initializing models at container startup...")
        
        # Download model if needed
        download_model()
        
        # Preload embedding model
        print("Preloading embedding model...")
        embedding_model = get_embedding_model()
        print("✅ Embedding model preloaded")
        
        # Preload LLM model
        print("Preloading LLM model...")
        llm_model = get_llama_model()
        print("✅ LLM model preloaded")
        
        # Test inference to ensure models are ready
        print("Testing models...")
        test_embedding = embedding_model.encode("test query").tolist()
        print(f"✅ Embedding test successful, vector length: {len(test_embedding)}")
        
        test_output = llm_model(
            "[INST] Say hello [/INST]",
            max_tokens=10,
            temperature=0.1,
            stream=False
        )
        print(f"✅ LLM test successful: {test_output['choices'][0]['text']}")
        
        print("🎉 All models initialized and ready!")
        return True
        
    except Exception as e:
        print(f"❌ Model initialization failed: {e}")
        return False

# Note: Model initialization will happen inside Modal functions when they first run
print("🔄 Modal service starting - models will be initialized on first request...")

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
        verify_api_key(x_api_key)
        print("API Key verification passed")
        
        # Initialize models on first request (inside Modal function context)
        initialize_models_at_startup()
        
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
        default_collection = os.environ.get("QDRANT_COLLECTION")
        qdrant_collection = x_collection or request.collection_name or default_collection
        
        print(f"Using Qdrant collection: {qdrant_collection}")
        
        # Initialize Qdrant client
        try:
            from qdrant_client import QdrantClient
            
            if qdrant_api_key:
                qdrant_client = QdrantClient(
                    url=qdrant_url,
                    check_compatibility=False,
                    api_key=qdrant_api_key
                )
            else:
                qdrant_client = QdrantClient(qdrant_url, check_compatibility=False)
            
            print(f"Connected to Qdrant: {qdrant_url}")
        except Exception as e:
            print(f"Failed to connect to Qdrant: {e}")
            from fastapi.responses import StreamingResponse
            
            def generate_qdrant_error_stream():
                yield f"data: {json.dumps({'response': 'Vector database is currently unavailable.', 'done': False})}\n\n"
                yield f"data: {json.dumps({'response': '', 'sources': [], 'done': True})}\n\n"
            
            return StreamingResponse(
                generate_qdrant_error_stream(),
                media_type="text/plain",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                }
            )
        
        # Generate query embedding using cached model
        embedding_start = time.time()
        try:
            embedding_model = get_embedding_model()
            query_embedding = embedding_model.encode(query).tolist()
            print(f"PERFLOG: Query embedding generated in {time.time() - embedding_start:.2f}s")
        except Exception as e:
            print(f"Failed to generate query embedding: {e}")
            from fastapi.responses import StreamingResponse
            
            def generate_embedding_error_stream():
                yield f"data: {json.dumps({'response': 'Failed to process your query.', 'done': False})}\n\n"
                yield f"data: {json.dumps({'response': '', 'sources': [], 'done': True})}\n\n"
            
            return StreamingResponse(
                generate_embedding_error_stream(),
                media_type="text/plain",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                }
            )
        
        # Search Qdrant for similar vectors with optimized parameters
        search_start = time.time()
        try:
            # First search with higher threshold for quality results
            search_results = qdrant_client.search(
                collection_name=qdrant_collection,
                query_vector=query_embedding,
                query_filter={
                    "must": [
                        {"key": "user_id", "match": {"value": user_id}}
                    ]
                },
                limit=12,  # Increased for better coverage
                with_payload=True,
                score_threshold=0.3  # Higher threshold for better quality
            )
            
            # If we don't get enough results, try with lower threshold
            if len(search_results) < 3:
                print(f"Only {len(search_results)} results with high threshold, trying lower threshold...")
                search_results = qdrant_client.search(
                    collection_name=qdrant_collection,
                    query_vector=query_embedding,
                    query_filter={
                        "must": [
                            {"key": "user_id", "match": {"value": user_id}}
                        ]
                    },
                    limit=8,
                    with_payload=True,
                    score_threshold=0.2  # Lower threshold as fallback
                )
            
            print(f"PERFLOG: Qdrant search completed in {time.time() - search_start:.2f}s")
            
            if not search_results:
                print("No relevant documents found in Qdrant")
                from fastapi.responses import StreamingResponse
                
                def generate_no_results_stream():
                    yield f"data: {json.dumps({'response': 'No relevant documents found.', 'done': False})}\n\n"
                    yield f"data: {json.dumps({'response': '', 'sources': [], 'done': True})}\n\n"
                
                return StreamingResponse(
                    generate_no_results_stream(),
                    media_type="text/plain",
                    headers={
                        "Cache-Control": "no-cache",
                        "Connection": "keep-alive",
                    }
                )
            
            # Extract chunks and sources from Qdrant results with better filtering
            relevant_chunks = []
            relevant_sources = []
            
            # For contact-related queries, be more lenient with score filtering
            contact_keywords = ['contact', 'phone', 'email', 'address', 'call', 'reach', 'get in touch', 'support']
            is_contact_query = any(keyword in query.lower() for keyword in contact_keywords)
            
            # Sort results by score for better quality selection
            sorted_results = sorted(search_results, key=lambda x: x.score, reverse=True)
            
            for result in sorted_results:
                if result.payload:
                    content = result.payload.get("content", "")
                    
                    # Skip empty content
                    if not content.strip():
                        continue
                    
                    # Dynamic threshold based on query type and result quality
                    base_threshold = 0.25 if is_contact_query else 0.35
                    
                    # Lower threshold for top results to ensure we get some content
                    if len(relevant_chunks) < 3:
                        score_threshold = base_threshold * 0.8
                    else:
                        score_threshold = base_threshold
                    
                    if result.score > score_threshold:
                        relevant_chunks.append(content)
                        relevant_sources.append({
                            "document": result.payload.get("filename", "Unknown"),
                            "similarity": float(result.score),
                            "chunk_id": result.payload.get("chunk_id", "unknown")
                        })
                        
                        # Limit to prevent context overflow
                        if len(relevant_chunks) >= 6:
                            break
            
            # Build context with better organization
            if is_contact_query:
                # For contact queries, prioritize chunks that contain contact information
                contact_chunks = []
                other_chunks = []
                
                for chunk in relevant_chunks:
                    if any(keyword in chunk.lower() for keyword in contact_keywords):
                        contact_chunks.append(chunk)
                    else:
                        other_chunks.append(chunk)
                
                # Put contact chunks first, then others
                context = "\n".join(contact_chunks + other_chunks)
            else:
                context = "\n".join(relevant_chunks)
            
            # Adjust context length based on query type
            max_length = 3000 if is_contact_query else 2500
            context = context[:max_length]
            print(f"PERFLOG: Selected {len(relevant_chunks)} chunks from Qdrant, context length: {len(context)}")
            print(f"PERFLOG: Search scores: {[f'{r.score:.3f}' for r in sorted_results[:5]]}")
            print(f"PERFLOG: Query type: {'contact' if is_contact_query else 'general'}")
            
        except Exception as e:
            print(f"Failed to search Qdrant: {e}")
            from fastapi.responses import StreamingResponse
            
            def generate_error_stream():
                yield f"data: {json.dumps({'response': 'Failed to search documents.', 'done': False})}\n\n"
                yield f"data: {json.dumps({'response': '', 'sources': [], 'done': True})}\n\n"
            
            return StreamingResponse(
                generate_error_stream(),
                media_type="text/plain",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                }
            )
        
        # Generate response using the cached LLM model
        llm_start = time.time()
        print(f"PERFLOG: Generating response with context length: {len(context)}")
        try:
            print("Loading LLM model...")
            llm = get_llama_model()
            print("LLM model loaded successfully")
        except Exception as e:
            print(f"Error loading LLM model: {e}")
            raise RuntimeError(f"Failed to load LLM model: {e}")
        
        # Create an enhanced prompt that works well for all types of queries
        prompt = f"""[INST] You are a helpful AI assistant. Answer the following question based on the provided context. Be thorough and provide complete information.

Context: {context}

Question: {query}

Instructions:
- Provide comprehensive and accurate information based ONLY on the provided context
- If asked about contact details, include all available phone numbers, emails, addresses, and websites
- If asked about services or company information, be detailed and clear
- If the context doesn't contain relevant information, say "I don't have information about that in the provided documents"
- Structure your response logically and be concise
- Do not make up information that's not in the context
[/INST]"""
        
        print(f"Generating response with prompt length: {len(prompt)}")
        
        try:
            # Try streaming first, fallback to non-streaming if it fails
            from fastapi.responses import StreamingResponse
            
            def generate_stream():
                try:
                    # First try streaming with optimized parameters
                    print("Attempting streaming generation...")
                    output = llm(
                        prompt,
                        max_tokens=512,  # Increased from 200 to 512 for complete responses
                        temperature=0.7,
                        top_p=0.95,
                        stop=["</s>"],
                        stream=True
                    )
                    
                    answer = ""
                    chunk_count = 0
                    for chunk in output:
                        chunk_count += 1
                        
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
                                    # Yield each chunk as it's generated
                                    yield f"data: {json.dumps({'response': content, 'done': False})}\n\n"
                    
                    print(f"Streaming completed. Total chunks: {chunk_count}, Answer length: {len(answer)}")
                    
                    # If no content was generated, try non-streaming
                    if not answer.strip():
                        print("No content from streaming, trying non-streaming...")
                        non_stream_output = llm(
                            prompt,
                            max_tokens=512,  # Increased from 200 to 512
                            temperature=0.7,
                            top_p=0.95,
                            stop=["</s>"],
                            stream=False
                        )
                        
                        if "choices" in non_stream_output and len(non_stream_output["choices"]) > 0:
                            answer = non_stream_output["choices"][0]["text"].strip()
                            print(f"Non-streaming generated answer: {answer}")
                            
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
                    print(f"PERFLOG: LLM generation completed in {time.time() - llm_start:.2f}s")
                    print(f"PERFLOG: Total query time: {time.time() - start_time:.2f}s")
                    print("PERFLOG: --- END OF REQUEST ---")
                    
                except Exception as e:
                    print(f"PERFLOG: Exception in streaming generation: {e}")
                    # Try non-streaming as fallback
                    try:
                        print("Streaming failed, trying non-streaming fallback...")
                        non_stream_output = llm(
                            prompt,
                            max_tokens=512,  # Increased from 200 to 512
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

@app.function(
    image=image,
    gpu="T4",
    timeout=300,
    memory=4096,
    volumes={"/data": volume},
    secrets=[modal.Secret.from_name("QURIEUS_KEY")]
)
@modal.fastapi_endpoint(docs=True, label="health-check")
async def health_check(x_api_key: str = Header(...)):
    print("=== Health Check Started ===")
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



if __name__ == "__main__":
    # For local testing of Modal functions
    print("Modal service functions ready for deployment")