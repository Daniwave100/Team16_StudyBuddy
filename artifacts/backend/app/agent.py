"""Agent orchestrator.

Routes call into this module to run the core study flow.
"""

from agents import Agent, Runner
import os
from dotenv import load_dotenv
from prompts import CHAT_PROMPT, FLASHCARD_PROMPT, QUIZ_PROMPT

# Load environment variables
load_dotenv()

# get mode 
system_prompt = ""

def run(mode, class_id, message=None, focus=None):

    if mode=="chat":
        system_prompt = CHAT_PROMPT
    elif mode == "flashcard":
        system_prompt = FLASHCARD_PROMPT
    elif mode == "quiz":
        system_prompt = QUIZ_PROMPT

    # retrieve from vector_store
    
    # inject chunks into system prompt

    # call openaI and return response

# use this to test this functionality running
if __name__ == "main":
    agent = Agent(name="Assistant", instructions=mode)

    result = Runner.run_sync(agent, "Write a haiku")
    print(result.final_output)