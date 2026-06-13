from langchain_voyageai import VoyageAIEmbeddings
from app.config import settings
from pydantic import SecretStr
from typing import cast
_embedder: VoyageAIEmbeddings | None = None

def get_embedder() -> VoyageAIEmbeddings:
    global _embedder
    if _embedder is None:
        _embedder = VoyageAIEmbeddings(
            api_key=SecretStr(cast(str, settings.voyage_api_key)),
            model="voyage-code-3",
            batch_size=settings.batch_size,
        )
    return _embedder