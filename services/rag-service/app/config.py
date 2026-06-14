from pydantic_settings import BaseSettings, SettingsConfigDict



class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    gemini_api_key: str = ""
    voyage_api_key: str = ""
    pinecone_api_key: str = ""
    pinecone_index_name: str = "promptdoc"
    pinecone_host: str = ""
    internal_api_secret: str = ""
    batch_size: int = 128
    max_retrieval_results: int = 8
    max_context_chunks: int = 12
    max_critique_loops: int = 2
    temperature: float = 0.2

settings = Settings()