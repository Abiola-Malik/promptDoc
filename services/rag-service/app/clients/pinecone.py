from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from langchain_voyageai import VoyageAIEmbeddings
from pydantic import SecretStr
from app.config import settings
from typing import cast
import threading
from pinecone import Index




# '''
# implemented the same singleton pattern for both the Pinecone client and the embedder to avoid unnecessary re-instantiations, which can be costly in terms of performance. The get_vectorstore function now checks if the Pinecone client and index have already been created before initializing them, ensuring that we reuse existing instances whenever possible.
# '''




_embedder_lock = threading.Lock()
_pc_lock = threading.Lock()

_pc: Pinecone | None = None
_index: Index | None = None
_embedder: VoyageAIEmbeddings | None = None
_index = None
_embedder: VoyageAIEmbeddings | None = None

def get_embedder() -> VoyageAIEmbeddings:
    global _embedder
    if _embedder is None: #similar to that of creating google client in the original code, this checks if the embedder has n                        not been created yet before creating the instance. and if it has, it just returns it
        with _embedder_lock:
            if _embedder is None: #double-checked locking to ensure thread safety
             _embedder = VoyageAIEmbeddings(
            api_key=SecretStr(cast(str, settings.voyage_api_key)    ),
            model="voyage-code-3",
            batch_size=settings.batch_size,
        )
    return _embedder

def get_vectorstore(namespace: str) -> PineconeVectorStore:  
    global _pc, _index
    if _pc is None:
        with _pc_lock:
            if _pc is None:
                # wrap the API key in SecretStr for consistent secret handling
                pinecone_key = SecretStr(cast(str, settings.pinecone_api_key))
                api_key_val = pinecone_key.get_secret_value()
                _pc = Pinecone(api_key=api_key_val)
                _index = _pc.Index(
                    name=settings.pinecone_index_name,
                    host=cast(str, settings.pinecone_host),
                )
    return PineconeVectorStore(
        index=_index,
        embedding=get_embedder(),
        namespace=namespace,
    )

async def retrieve(query: str, namespace: str, k: int) -> list[dict]:
    vs = get_vectorstore(namespace)
    docs = await vs.asimilarity_search_with_score(query, k=k)
    return [
        {
            "content":   d.page_content,
            "file_path": d.metadata.get("file_path", ""),
            "language":  d.metadata.get("language", ""),
            "score":     score,
        }
        for d, score in docs
    ]
    
    
'''
the get_vectorstore function now checks if the Pinecone client and index have already been created before initializing them, ensuring that we reuse existing instances whenever possible. This should help improve performance by avoiding unnecessary re-instantiations of the Pinecone client and index. The get_embedder function follows a similar pattern, ensuring that the VoyageAIEmbeddings instance is also reused across calls. The retrieve function remains unchanged, as it simply uses the get_vectorstore function to perform the similarity search and format the results.
'''


'''
also, on a side note for the retrieve function, the return type is a list of dicts, where each dict contains the content, file_path, language, and score of a retrieved document. This allows for more flexibility in how the retrieved information can be used downstream, as it provides not just the content but also metadata about each retrieved chunk.

the assimilarity_search_with_score method is a way of converting the query into an embedding and then finding the most similar embeddings in the vector store, which is a common approach for retrieval in RAG systems. The k parameter allows us to specify how many of the most similar documents we want to retrieve, which can be useful for controlling the amount of context fed into the language model for generating responses.

it returns a tuple of (Document, score) pairs, where Document is an object containing the content and metadata of the retrieved document, and score is a float representing the similarity score between the query and the retrieved document. The higher the score, the more similar the document is to the query. This allows us to not only retrieve relevant documents but also to rank them based on their relevance to the query.
'''
