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
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import hashlib

# Initialize Modal app
app = modal.App("qurieus-app")

# Define the image with all necessary dependencies
image = modal.Image.debian_slim().pip_install([
    "sentence-transformers",
    "PyMuPDF",
    "python-docx",
    "pandas",
    "fastapi",
    "uvicorn",
    "langdetect",
    "openpyxl",
    "tabulate",
    "xlrd"
])

# Create persistent volume for storing documents and embeddings
volume = modal.Volume.from_name("qurieus-documents", create_if_missing=True)

# Create the FastAPI app
web_app = FastAPI(title="Qurieus GPU Service with Persistent Storage", version="1.0.0")

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

@app.function(
    image=image,
    gpu="T4",
    timeout=300,
    memory=4096,
    volumes={"/data": volume}
)
def process_and_store_document(file_content: str, file_extension: str, original_filename: str, user_id: str) -> Dict[str, Any]:
    """Process document and store it in Modal's persistent volume."""
    try:
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
                
                # Perform financial analysis
                financial_analysis = analyze_financial_data(df)
            except Exception as e:
                raise ValueError(f"Error processing file: {str(e)}")
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")
        
        # Create document record
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
        
        # Load existing documents for this user
        user_docs_path = get_user_documents_path(user_id)
        os.makedirs(os.path.dirname(user_docs_path), exist_ok=True)
        
        existing_docs = []
        if os.path.exists(user_docs_path):
            with open(user_docs_path, 'r') as f:
                existing_docs = json.load(f)
        
        # Add new document
        existing_docs.append(document_record)
        
        # Save updated documents
        with open(user_docs_path, 'w') as f:
            json.dump(existing_docs, f, indent=2)
        
        # Generate embeddings for the document
        embedding_model = SentenceTransformer("all-MiniLM-L6-v2", device="cuda")
        
        # Split content into chunks (similar to your existing logic)
        chunks = text_content.split('. ')
        chunks = [chunk.strip() + '. ' for chunk in chunks if chunk.strip()]
        
        # Generate embeddings for chunks
        embeddings = embedding_model.encode(chunks)
        
        # Store embeddings
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
        raise Exception(f"Error processing and storing document: {str(e)}")

@app.function(
    image=image,
    gpu="T4",
    timeout=120,
    memory=2048,
    volumes={"/data": volume}
)
def query_user_documents(query: str, user_id: str) -> Dict[str, Any]:
    """Query user's documents using stored embeddings."""
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
                
                # Find the document for this embedding
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
            # Calculate cosine similarity
            dot_product = sum(a * b for a, b in zip(query_embedding[0], chunk_embedding))
            norm_a = sum(a * a for a in query_embedding[0]) ** 0.5
            norm_b = sum(b * b for b in chunk_embedding) ** 0.5
            similarity = dot_product / (norm_a * norm_b) if norm_a * norm_b != 0 else 0
            similarities.append((i, similarity))
        
        # Sort by similarity and get top 3
        similarities.sort(key=lambda x: x[1], reverse=True)
        top_indices = [idx for idx, _ in similarities[:3]]
        
        # Get relevant chunks and sources
        relevant_chunks = [all_chunks[i] for i in top_indices]
        relevant_sources = [all_sources[i] for i in top_indices]
        
        # Create context
        context = "\n".join(relevant_chunks)
        
        # Generate response (placeholder - you can integrate with your preferred LLM)
        response = f"Based on your documents, here's what I found:\n\n{context[:500]}"
        
        return {
            "response": response,
            "sources": relevant_sources,
            "done": True
        }
        
    except Exception as e:
        raise Exception(f"Error querying documents: {str(e)}")

@app.function(
    image=image,
    gpu="T4",
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
    gpu="T4",
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


# FastAPI Web Endpoints (needed for frontend HTTP calls)
@app.function(
    image=image,
    timeout=300,
    memory=4096,
    gpu="T4",
    volumes={"/data": volume}
)
@modal.fastapi_endpoint(docs=True,label="upload-document",method="POST")
async def upload_document_endpoint(request: DocumentRequest):
    """Upload and process document using Modal.com GPU service with persistent storage."""
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
    timeout=300,
    gpu="T4",
    memory=4096,
    volumes={"/data": volume}
)
@modal.fastapi_endpoint(docs=True,label="query-documents",method="POST")
async def query_documents_endpoint(request: QueryRequest):
    """Query user's documents using Modal.com GPU service."""
    try:
        result = query_user_documents.remote(
            request.query,
            request.user_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.function(
    image=image,
    timeout=300,
    gpu="T4",
    memory=4096,
    volumes={"/data": volume}
)
@modal.fastapi_endpoint(docs=True,label="health-check")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "active"}

@app.function(
    image=image,
    timeout=300,
    gpu="T4",
    memory=4096,
    volumes={"/data": volume}
)
@modal.fastapi_endpoint(docs=True,label="delete-document",method="DELETE")
async def delete_document_endpoint(user_id: str, document_id: str):
    """Delete a specific document from Modal.com persistent storage."""
    try:
        result = delete_user_document.remote(user_id, document_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.function(
    image=image,
    timeout=300,
    gpu="T4",
    memory=4096,
    volumes={"/data": volume}
)
@modal.fastapi_endpoint(docs=True,label="delete-all-documents",method="DELETE")
async def delete_all_documents_endpoint(user_id: str):
    """Delete all documents for a user from Modal.com persistent storage."""
    try:
        result = delete_all_user_documents.remote(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Deploy the FastAPI app using Modal's fastapi endpoint
@app.function(
    image=image,
    gpu="T4",
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