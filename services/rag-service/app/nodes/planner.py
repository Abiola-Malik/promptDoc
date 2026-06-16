from langchain_core.messages import HumanMessage, SystemMessage
from app.models import GraphState
from app.clients.gemini import get_llm

PLANNER_PROMPT = """You are a technical documentation expert.
Based on the codebase context provided, create a documentation outline.
Structure it with clear sections covering: Overview, Architecture, Key Components, API/Interfaces, Usage Examples, and Configuration.
Return ONLY the outline as markdown headers and bullet points."""

async def plan_documentation(state: GraphState) -> dict:
    """Plan the documentation structure based on retrieved context."""
    llm = get_llm()
    messages = [
        SystemMessage(content=PLANNER_PROMPT),
        HumanMessage(content=f"Codebase context:\n{state['context']}\n\nCreate a documentation outline.")
    ]
    response = await llm.ainvoke(messages)
    return {"outline": response.content, "critique_loops": 0}