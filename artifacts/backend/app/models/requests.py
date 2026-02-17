"""Request schemas.

Used by route handlers for request validation.
"""
from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    class_id: str
    message: str
    conversation_id: Optional[str] = None
    focus: Optional[str] = None