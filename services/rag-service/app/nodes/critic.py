from langchain_core.messages import HumanMessage, SystemMessage
from app.models import GraphState
from app.clients.gemini import get_llm
from app.config import settings

CRITIQUE_PROMPT = """You are a senior engineer reviewing technical documentation.
Evaluate the draft documentation and identify:
1. Missing sections or concepts visible in the code context
2. Inaccurate descriptions that contradict the code
3. Unclear explanations that need more detail
4. Missing code examples that would help understanding

Be specific and actionable. If the documentation is good enough, respond with exactly: "APPROVED"
Otherwise list the specific improvements needed."""

async def critique_draft(state: GraphState) -> dict:
    """Critique the draft and decide whether to refine or finalize."""
    llm = get_llm()
    messages = [
        SystemMessage(content=CRITIQUE_PROMPT),
        HumanMessage(content=(
            f"Documentation draft:\n{state['draft']}\n\n"
        ))
    ]
    answer= ""
    async for chunk in llm.astream(messages):
        if chunk.content:  
            answer += chunk.content
    critique = answer.strip()
    loops = state.get("critique_loops", 0) + 1
    return {"critique": critique, "critique_loops": loops}

def should_refine(state: GraphState) -> str:
    critique = state.get("critique", "")
    loops = state.get("critique_loops", 0)

    if critique.strip() == "APPROVED" or loops >= settings.max_critique_loops:
        return "finalize"
    return "refine"