from langchain_core.messages import HumanMessage, SystemMessage
from app.models import GraphState
from app.clients.gemini import get_llm

DRAFT_PROMPT = """You are a technical writer creating documentation for a software project.
Using the provided code context and outline, write comprehensive documentation in Markdown.
Include code examples from the context, explain design decisions, and make it developer-friendly.
Write the complete documentation now."""

REFINE_PROMPT = """You are a technical writer refining documentation based on critique feedback.
Improve the draft by addressing all points in the critique.
Keep what works, fix what doesn't. Return the complete improved documentation."""

async def generate_draft(state: GraphState) -> dict:
    """Generate or refine the documentation draft."""
    llm = get_llm()
    is_refinement = bool(state.get("critique") and state.get("draft"))

    if is_refinement:
        messages = [
            SystemMessage(content=REFINE_PROMPT),
            HumanMessage(content=(
                f"Original draft:\n{state['draft']}\n\n"
                f"Critique:\n{state['critique']}\n\n"
                f"Context:\n{state['context']}\n\n"
                f"Write the improved documentation."
            ))
        ]
    else:
        messages = [
            SystemMessage(content=DRAFT_PROMPT),
            HumanMessage(content=(
                f"Outline:\n{state['outline']}\n\n"
                f"Code context:\n{state['context']}\n\n"
                f"Write the documentation."
            ))
        ]

    response = await llm.ainvoke(messages)
    return {"draft": response.content}