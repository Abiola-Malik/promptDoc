from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env",env_file_encoding="utf-8", extra="ignore")

    redis_url: str = "redis://localhost:6379"
    internal_api_secret: str = ""
    max_chunk_size: int = 1500
    min_chunk_size: int = 50
    max_file_size_kb: int = 500

settings = Settings()