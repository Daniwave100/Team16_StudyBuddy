"""Agent orchestrator.

Routes call into this module to run the core study flow.
"""

from agents import Agent, Runner
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

mode = "test"

agent = Agent(name="Assistant", instructions=mode)

result = Runner.run_sync(agent, "Write a haiku")
print(result.final_output)