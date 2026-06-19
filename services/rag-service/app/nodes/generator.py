from langchain_core.messages import HumanMessage, SystemMessage
import re
import logging
from app.models import GraphState
from app.clients.gemini import get_llm

SYSTEM_PROMPT = """You are an expert software engineer helping a developer understand their codebase.

Answer questions using ONLY the provided code context.
Be specific, reference file paths, and include relevant code snippets when helpful.
If the context doesn't contain enough information, say so clearly.

Important Rules:
- Do NOT repeat the user's question.
- Do NOT list or mention expanded queries, step-back queries, or any internal reasoning.
- Do NOT show your thinking process.
- Output ONLY the clean, final answer."""

async def generate_answer(state: GraphState) -> dict:
    """Generate a streaming answer grounded in the retrieved context."""
    llm = get_llm()  

    context = state.get("context", "")
    query = state.get("query", "")
    
    if not context or not query:
        raise ValueError(f"Missing required state: context={bool(context)}, query={bool(query)}")

    user_prompt = f"""Context:
{context}

Question: {query}

Answer:"""

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_prompt)
    ]

    answer = ""
    async for chunk in llm.astream(messages):
        if chunk.content:
            answer += chunk.content

    # Extra safety cleanup - remove any leaked reasoning
    logger = logging.getLogger("rag-service")

    # Patterns that indicate leaked internal reasoning — match at line starts to avoid partial hits
    leaked_patterns = re.compile(r"^(?:expanded query|step back|here are the queries)\b", re.I | re.M)

    if leaked_patterns.search(answer):
        logger.warning("Leaked reasoning detected in LLM output; running cleanup")

        # Prefer an 'Answer:' marker that appears on its own line (case-insensitive).
        # Find the last occurrence of a line that begins with 'Answer:' and take everything after it.
        answer_marker = re.compile(r"(?im)^\s*Answer:\s*$")
        matches = list(answer_marker.finditer(answer))
        if matches:
            last = matches[-1]
            cleaned = answer[last.end():].strip()
            if cleaned:
                answer = cleaned
            else:
                # marker present but nothing after it; fall back to paragraphs
                paragraphs = [p for p in answer.split("\n\n") if p.strip()]
                answer = "\n\n".join(paragraphs[-4:])
        else:
            # No clean 'Answer:' marker; as a fallback keep the last few paragraphs
            paragraphs = [p for p in answer.split("\n\n") if p.strip()]
            answer = "\n\n".join(paragraphs[-4:])  # Keep last few clean paragraphs

    return {"answer": answer.strip()}