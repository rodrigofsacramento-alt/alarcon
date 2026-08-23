from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Aplicação
    APP_NAME: str = "Análise Comportamental"
    DEBUG: bool = os.getenv("DEBUG", "False") == "True"
    VERSION: str = "1.0.0"
    
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    
    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "sua-chave-secreta-aqui")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://ahut-ecosystem.apexfyhub.com.br",
        "http://ahut-ecosystem.apexfyhub.com.br",
        "https://seu-dominio.com"
    ]
    
    # Email (opcional)
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
