from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document
from app.embedder import get_embedder
from app.config import settings
from app.models import ChunkPayload
from typing import cast

_pinecone_client: Pinecone | None = None
_index = None

def get_index():
    global _pinecone_client, _index
    if _pinecone_client is None:
        _pinecone_client = Pinecone(api_key=settings.pinecone_api_key)
        _index = _pinecone_client.Index(
            name=settings.pinecone_index_name,
            host=settings.pinecone_host
        )
    return _index

def get_vectorstore(namespace: str) -> PineconeVectorStore:
    return PineconeVectorStore(
        index=get_index(),
        embedding=get_embedder(),
        namespace=namespace,
    )

def upsert_chunks_batch(chunks: list[ChunkPayload]) -> None:
    if not chunks:
        return
    # all chunks in a batch belong to the same project
    namespace = chunks[0].project_id
    if not all(chunk.project_id == namespace for chunk in chunks):
       raise ValueError(f"Batch contains chunks from multiple projects")
    docs = [
        Document(
            page_content=chunk.content,
            metadata={
                "job_id":       chunk.job_id,
                "project_id":   chunk.project_id,
                "file_path":    chunk.file_path,
                "chunk_index":  chunk.chunk_index,
                "total_chunks": chunk.total_chunks,
                "language":     chunk.language,
            }
        )
        for chunk in chunks
    ]
    vectorstore = get_vectorstore(namespace)
    vectorstore.add_documents(docs)