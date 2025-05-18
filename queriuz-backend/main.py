from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Now we can import using absolute paths
from app.core.config import settings
from app.api.v1.endpoints import documents
from generate_postman import generate_postman_collection
from contextlib import asynccontextmanager

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
    lifespan=lifespan
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
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents"])

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "healthy", "version": settings.VERSION} 

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)