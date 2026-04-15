from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Supabase (FREE tier: 500MB DB, 1GB storage)
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str

    # AI — Groq (FREE tier: 30 RPM, 14,400 RPD)
    groq_api_key: Optional[str] = None

    # Security
    secret_key: str = "dev-secret-change-me-in-production-at-least-32-chars"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080

    # App
    environment: str = "development"
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()