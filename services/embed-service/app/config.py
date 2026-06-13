from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    redis_url: str = "redis://redis:6379"   # better default for docker
    voyage_api_key: str = ""
    pinecone_api_key: str = ""
    pinecone_index_name: str = "promptdoc"
    pinecone_host: str = ""
    internal_api_secret: str = ""
    batch_size: int = 32
    worker_sleep_seconds: int = 1

    

settings = Settings()