from pydantic_settings import BaseSettings
from typing import Optional, List
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Qurieus API"
    VERSION: str = "1.0.0"
    FAST_API_HOST: str = os.getenv("FAST_API_HOST")
    FAST_API_PORT: int = int(os.getenv("FAST_API_PORT"))

    # Frontend URL for CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL")

    # CORS settings
    CORS_ORIGINS: List[str] = [os.getenv("FRONTEND_URL")]

    # NextAuth Secret for token verification
    # IMPORTANT: This must match the NEXTAUTH_SECRET in the Next.js frontend
    NEXTAUTH_SECRET: str = os.getenv("NEXTAUTH_SECRET", "")

    # File Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploaded_docs")

    # Ollama settings
    OLLAMA_API_URL: str = os.getenv("OLLAMA_API_URL")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL").strip()  # Default to mistral:latest

    # Qdrant settings
    QDRANT_URL: str = os.getenv("QDRANT_URL")
    QDRANT_COLLECTION: str = os.getenv("QDRANT_COLLECTION")
    QDRANT_API_KEY: Optional[str] = os.getenv("QDRANT_API_KEY")

    # AI Service API Key for internal service communication
    AI_SERVICE_API_KEY: str = os.getenv("AI_SERVICE_API_KEY")

    # OCR Settings
    OCR_ENABLED: bool = os.getenv("OCR_ENABLED").lower() == "true"
    OCR_LANGUAGE: str = os.getenv("OCR_LANGUAGE")
    OCR_DPI: int = int(os.getenv("OCR_DPI"))
    OCR_CONFIG: str = os.getenv("OCR_CONFIG")

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
    pass
