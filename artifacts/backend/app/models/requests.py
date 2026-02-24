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


class FlashcardRequest(BaseModel):
    """Request model for flashcard generation endpoint."""
    class_id: str
    focus: Optional[str] = None
    count: Optional[int] = 10


class QuizRequest(BaseModel):
    """Request model for quiz generation endpoint."""
    class_id: str
    focus: Optional[str] = None
    count: Optional[int] = 10