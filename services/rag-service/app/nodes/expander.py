from langchain_core.messages import HumanMessage
from app.models import GraphState
from app.clients.gemini import get_llm

EXPANSION_PROMPT = """You are an expert at reformulating search queries for code retrieval.
Given a user question about a codebase, generate {n} different versions of the question.
Each version should use different terminology, focus on different aspects, or be more specific.
Return ONLY the queries, one per line, no numbering, no explanation.

Original question: {query}"""

STEP_BACK_PROMPT = """You are an expert at abstracting questions.
Given a specific question about code, generate a broader, more general version.
This helps retrieve background context and architectural information.
Return ONLY the broader question, nothing else.

Specific question: {query}"""

async def expand_queries(state: GraphState) -> dict:
    """
    Generate multiple query variants + a step-back query.
    Returns original + 4 paraphrases + 1 step-back = 6 total queries.
    """
    llm = get_llm()
    query = state["query"]

    # run both prompts concurrently
    import asyncio
    expansion_msg = HumanMessage(content=EXPANSION_PROMPT.format(n=4, query=query))
    stepback_msg  = HumanMessage(content=STEP_BACK_PROMPT.format(query=query))

    expansion_resp, stepback_resp = await asyncio.gather(
        llm.ainvoke([expansion_msg]),
        llm.ainvoke([stepback_msg]),
    )

    expanded = [q.strip() for q in expansion_resp.content.strip().split("\n") if q.strip()]
    stepback = stepback_resp.content.strip()

    # original + expanded + stepback
    all_queries = [query] + expanded[:4] + [stepback]
    return {"expanded_queries": all_queries}


'''
This code defines a workflow step that implements two powerful search optimization techniques: Query Expansion and Step-Back Prompting.Instead of searching a codebase with just the user's raw question, this function uses the Gemini LLM to generate 5 different variations of the search query concurrently to drastically improve retrieval accuracy.
'''

'''
the expansion prompt asks the LLM to generate 4 paraphrased versions of the original query, each using different terminology or focusing on different aspects. This helps capture various ways the same information might be expressed in the codebase.

the step-back prompt asks the LLM to generate a broader, more general version of the original query. This is useful for retrieving background context or architectural information that may not be captured by the specific query.

that makes it 6 questions in total: the original query, 4 expanded queries, and 1 step-back query. The function returns all of these queries in a list under the key "expanded_queries" in the returned dictionary. 

might setup langsmith to visualize later. 

'''
