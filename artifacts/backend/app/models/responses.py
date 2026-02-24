"""Response schemas.

Used by route handlers for structured responses.
"""
from pydantic import BaseModel
from typing import Optional, List


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    response: str
    conversation_id: Optional[str] = None
    timestamp: Optional[str] = None


class Flashcard(BaseModel):
    """Individual flashcard model."""
    front: str
    back: str


class FlashcardResponse(BaseModel):
    """Response model for flashcard generation endpoint."""
    flashcards: List[Flashcard]
    class_id: str
    count: int
    timestamp: Optional[str] = None


class QuizQuestion(BaseModel):
    """Individual quiz question model."""
    question: str
    options: List[str]
    answer: str
    explanation: str


class QuizResponse(BaseModel):
    """Response model for quiz generation endpoint."""
    questions: List[QuizQuestion]
    class_id: str
    count: int
    timestamp: Optional[str] = None