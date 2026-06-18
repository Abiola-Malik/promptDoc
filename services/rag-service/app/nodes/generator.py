from langchain_core.messages import HumanMessage, SystemMessage
from app.models import GraphState
from app.clients.gemini import get_llm

SYSTEM_PROMPT = """You are an expert software engineer helping a developer understand their codebase.
Answer questions using ONLY the provided code context.
Be specific, reference file paths, and include relevant code snippets in your answer.
If the context doesn't contain enough information to answer confidently, say so clearly."""

async def generate_answer(state: GraphState) -> dict:
    """Generate a streaming answer grounded in the retrieved context."""
    llm = get_llm()
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"Context:\n{state['context']}\n\nQuestion: {state['query']}")
    ]
    answer= ""
    async for chunk in llm.astream(messages):
        if chunk.content:  
            answer += chunk.content
    return {"answer": answer}