from pydantic_settings import BaseSettings
from typing import Optional, List
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Qurieus API"
    VERSION: str = "1.0.0"
    FAST_API_HOST: str = os.getenv("FAST_API_HOST", "0.0.0.0")
    FAST_API_PORT: int = int(os.getenv("FAST_API_PORT", "8000"))
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/qurieus")
    
    # Frontend URL for CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:8000")
    
    # CORS settings
    CORS_ORIGINS: List[str] = [os.getenv("FRONTEND_URL")]
    
    # NextAuth Secret for token verification
    # IMPORTANT: This must match the NEXTAUTH_SECRET in the Next.js frontend
    NEXTAUTH_SECRET: str = os.getenv("NEXTAUTH_SECRET", "")
    
    # File Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploaded_docs")
    
    # Postman Settings
    POSTMAN_API_KEY: Optional[str] = os.getenv("POSTMAN_API_KEY")
    POSTMAN_COLLECTION_ID: Optional[str] = os.getenv("POSTMAN_COLLECTION_ID")
    
    # Email settings
    ADMIN_EMAIL: str = "admin@qurieus.com"
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@qurieus.com"
    
    # Ollama settings
    OLLAMA_API_URL: str = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "mistral:latest").strip()  # Default to mistral:latest
    
    # Qdrant settings
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    QDRANT_COLLECTION: str = os.getenv("QDRANT_COLLECTION", "user_embeddings")
    QDRANT_API_KEY: Optional[str] = os.getenv("QDRANT_API_KEY")
    
    # Backend API Key for authentication
    BACKEND_API_KEY: str = os.getenv("BACKEND_API_KEY", "")
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        
# Create settings instance
settings = Settings()

# Validate critical settings
if not settings.NEXTAUTH_SECRET:
    import warnings
    warnings.warn(
        "NEXTAUTH_SECRET is not set in environment variables. "
        "This will cause authentication to fail. "
        "Make sure NEXTAUTH_SECRET is the same in both frontend and backend."
    )

# Print debug information in development
if settings.DEBUG:
    print(f"Environment: {settings.ENVIRONMENT}")
    print(f"Debug mode: {settings.DEBUG}")
    print(f"Frontend URL: {settings.FRONTEND_URL}")
    print(f"NEXTAUTH_SECRET set: {'Yes' if settings.NEXTAUTH_SECRET else 'No'}") 