from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
# Now we can import using absolute paths
from app.core.config import settings
from app.api.v1.endpoints import documents
from generate_postman import generate_postman_collection
from contextlib import asynccontextmanager
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for FastAPI application."""
    # Startup: generate Postman collection
    try:
        generate_postman_collection(app)
    except Exception as e:
        print(f"Failed to generate Postman collection: {str(e)}")
    yield
    # Shutdown: add cleanup logic here if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Document AI Chatbot API with multi-tenant support",
    version=settings.VERSION,
    lifespan=lifespan,
    # Enable OpenAPI documentation
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json"
)

# CORS middleware with proper settings for handling credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Include routers
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents"])

# Serve static frontend (Next.js export) at root
frontend_path = os.path.join(os.path.dirname(__file__), 'frontend')
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "healthy", "version": settings.VERSION} 

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )