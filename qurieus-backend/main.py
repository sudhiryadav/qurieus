from fastapi import FastAPI
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Now we can import using absolute paths
from app.core.config import settings
from app.api.v1.endpoints import documents
from contextlib import asynccontextmanager
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for FastAPI application."""
    yield
    # Shutdown: add cleanup logic here if needed


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Document AI Chatbot API with multi-tenant support",
    version=settings.VERSION,
    lifespan=lifespan,
    # Enable OpenAPI documentation
    docs_url="/api/v1/docs" if settings.DEBUG else None,
    redoc_url="/api/v1/redoc" if settings.DEBUG else None,
    openapi_url="/api/v1/openapi.json" if settings.DEBUG else None,
)

# CORS middleware with proper settings for handling credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-API-Key"],
    expose_headers=["Content-Disposition"],
)

# Include routers
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents"])


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    # Add HSTS only when deployed over HTTPS.
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Serve static frontend (Next.js export) at root
frontend_path = os.path.join(os.path.dirname(__file__), "frontend")
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
        host=settings.FAST_API_HOST,
        port=settings.FAST_API_PORT,
        reload=True,
    )
