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
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/qurieus")
    
    # Security Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key")
    
    # Frontend URL for CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
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
    
    # File upload settings
    MAX_FILE_SIZE_MB: int = 10  # default is 10MB

    @property
    def MAX_FILE_SIZE_BYTES(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024
    
    # Ollama settings
    OLLAMA_API_URL: str = os.getenv("OLLAMA_API_URL")
    
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