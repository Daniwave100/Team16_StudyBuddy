"""Response schemas.

Used by route handlers for structured responses.
"""
from pydantic import BaseModel
from typing import Optional


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    response: str
    conversation_id: Optional[str] = None
    timestamp: Optional[str] = None