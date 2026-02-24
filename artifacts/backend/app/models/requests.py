"""Request schemas.

Used by route handlers for request validation.
"""
from pydantic import BaseModel
from typing import Optional, List, Dict


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


class QuizCreateRequest(BaseModel):
    """Request model for creating a quiz."""
    class_id: str
    title: str
    description: Optional[str] = None
    focus: Optional[str] = None
    question_count: int = 10
    difficulty: Optional[str] = "medium"


class QuizUpdateRequest(BaseModel):
    """Request model for updating quiz metadata."""
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None


class QuizSubmissionRequest(BaseModel):
    """Request model for submitting quiz answers."""
    quiz_id: str
    answers: Dict[str, str]  # question_id -> selected_answer
    time_taken: Optional[int] = None  # seconds


class ChatSessionCreateRequest(BaseModel):
    """Request model for creating a new chat session."""
    class_id: str
    title: Optional[str] = "New Conversation"