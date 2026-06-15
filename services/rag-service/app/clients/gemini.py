from typing import cast
import threading

from pydantic import SecretStr
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings

# '''
# it initializes a singleton instance of the ChatGoogleGenerativeAI LLM with the configured API key and temperature settings. The LLM is used for generating responses to user queries in the RAG service.

# the first line creates a global variable _llm to hold the singleton instance of the LLM. The get_llm() function checks if _llm is None, and if so, it creates a new instance of ChatGoogleGenerativeAI with the configured model, API key, temperature, and streaming settings. It then returns the singleton instance of the LLM.
# '''


_llm: ChatGoogleGenerativeAI | None = None
_llm_lock = threading.Lock()

def get_llm() -> ChatGoogleGenerativeAI:
    global _llm
    if _llm is None:
        with _llm_lock:
            if _llm is None:
                _llm = ChatGoogleGenerativeAI(
                    model="gemini-2.0-flash",
                    google_api_key=SecretStr(cast(str, settings.gemini_api_key)),
                    temperature=settings.temperature,
                    streaming=True,
                )
    return _llm

# '''this approach saved memory and reduces potential API bottlenecks by reusing the same LLM instance across multiple requests, rather than creating a new instance for each request. as i noticed in the log files of the embed-service which creates a new pinecone client for each request, which made the upserts super slow.'''