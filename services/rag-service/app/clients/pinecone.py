# app/clients/pinecone.py
import voyageai
from pinecone import Pinecone
from pydantic import SecretStr
from app.config import settings
from typing import cast, Any
import importlib
import threading

_pc_lock = threading.Lock()
_pc: Pinecone | None = None
_index = None
_voyage_client: Any | None = None
_voyage_lock = threading.Lock()

def _get_index():
    global _pc, _index
    # guard on _index (the value we return) to avoid a partial
    # initialization where _pc is set but _index failed to create.
    if _index is None:
        with _pc_lock:
            if _index is None:
                _pc = Pinecone(api_key=SecretStr(
                    cast(str, settings.pinecone_api_key)
                ).get_secret_value())
                _index = _pc.Index(
                    name=settings.pinecone_index_name,
                    host=cast(str, settings.pinecone_host),
                )
    return _index

def _get_voyage() -> Any:
    global _voyage_client
    if _voyage_client is None:
        with _voyage_lock:
            if _voyage_client is None:
                client_mod = importlib.import_module("voyageai.client_async")
                _voyage_client = client_mod.AsyncClient(
                    api_key=cast(str, settings.voyage_api_key)
                )
    return _voyage_client

async def retrieve(query: str, namespace: str, k: int) -> list[dict]:
    """
    Embed query with Voyage AI directly, then query Pinecone directly.
    Bypasses langchain-pinecone entirely — no aiohttp session issues.
    voyage-code-3 returns 1024-dim vectors matching the index dimension.
    """
    voyage = _get_voyage()
    
    # embed the query
    result = await voyage.embed(
        [query],
        model="voyage-code-3",
        input_type="query",  # optimises embedding for retrieval queries
    )
    query_vector = [float(x) for x in result.embeddings[0]]
    
    # query pinecone directly
    index = _get_index()
    response = index.query(
        vector=query_vector,
        top_k=k,
        namespace=namespace,
        include_metadata=True,
    )
    
    return [
        {
            "content":   match.metadata.get("text", ""),
            "file_path": match.metadata.get("file_path", ""),
            "language":  match.metadata.get("language", ""),
            "score":     float(match.score),
        }
        for match in response.matches
    ]