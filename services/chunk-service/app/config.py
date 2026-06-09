from pydantic_settings import BaseSettings
from os import getenv

secret_from_env = getenv("INTERNAL_API_SECRET", "")  # default is just a placeholder, should be overridden in production

class Settings(BaseSettings):
    redis_url: str = "redis://localhost:6379"
    internal_api_secret: str = secret_from_env
    max_chunk_size: int = 1500
    min_chunk_size: int = 50
    max_file_size_kb: int = 500

    class Config:
        env_file = ".env"

settings = Settings()