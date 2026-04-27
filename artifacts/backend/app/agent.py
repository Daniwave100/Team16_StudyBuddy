"""Agent orchestrator.

Routes call into this module to run the core study flow.
"""

from agents import Agent, Runner
from dotenv import load_dotenv
from pathlib import Path
from app.prompts import CHAT_PROMPT, FLASHCARD_PROMPT, QUIZ_PROMPT
from app.tools.retrieve import retrieve_context

# Load environment variables
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

def _build_context_block(class_id: str, query: str) -> str:
    chunks = retrieve_context(class_id=class_id, query=query, top_k=5)
    if not chunks:
        return "No indexed content found for this class yet."

    lines = []
    for index, chunk in enumerate(chunks, start=1):
        lines.append(f"[{index}] Source: {chunk['source']}\n{chunk['text']}")
    return "\n\n".join(lines)

async def run(mode, class_id, message=None, focus=None):

    if mode == "chat":
        prompt_template = CHAT_PROMPT
    elif mode == "flashcard":
        prompt_template = FLASHCARD_PROMPT
    elif mode == "quiz":
        prompt_template = QUIZ_PROMPT
    else:
        raise ValueError(f"Unsupported mode: {mode}")

    user_query = message or focus or "general study guidance"
    retrieved_chunks = _build_context_block(class_id=class_id, query=user_query)

    system_prompt = prompt_template.format(
        class_name=class_id,
        retrieved_chunks=retrieved_chunks,
        user_focus_prompt=focus or "No specific focus provided",
    )

    # call OpenAI and return response (async)
    agent = Agent(name="Assistant", instructions=system_prompt)
    result = await Runner.run(agent, message or "Help me study this class.")
    return result

# use this to test this functionality running
if __name__ == "__main__":
    import asyncio
    result = asyncio.run(run(mode="chat", class_id="demo-class", message="Write a haiku"))
    print(result.final_output)