from pydantic_settings import BaseSettings, SettingsConfigDict



class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    redis_url: str = "redis://redis:6379" 
    gemini_api_key: str = ""
    voyage_api_key: str = ""
    pinecone_api_key: str = ""
    pinecone_index_name: str = "promptdoc"
    pinecone_host: str = ""
    internal_api_secret: str = ""
    batch_size: int = 128
    max_retrieval_results: int = 8
    max_context_chunks: int = 12
    max_critique_loops: int = 1
    temperature: float = 0.2
    langchain_tracing: str = "false"
    langchain_api_key: str = ""
    langsmith_project: str = "promptdoc-rag"
    langsmith_endpoint: str = "https://api.smith.langchain.com"

settings = Settings()