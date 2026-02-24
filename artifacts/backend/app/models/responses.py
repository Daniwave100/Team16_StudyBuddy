"""Response schemas.

Used by route handlers for structured responses.
"""
from pydantic import BaseModel
from typing import Optional, List, Dict


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
    id: Optional[str] = None
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


class QuizMetadata(BaseModel):
    """Quiz metadata model."""
    id: str
    class_id: str
    title: str
    description: Optional[str] = None
    difficulty: Optional[str] = "medium"
    question_count: int
    created_at: str
    updated_at: Optional[str] = None


class QuizDetail(BaseModel):
    """Detailed quiz model with questions."""
    id: str
    class_id: str
    title: str
    description: Optional[str] = None
    difficulty: Optional[str] = "medium"
    questions: List[QuizQuestion]
    created_at: str
    updated_at: Optional[str] = None


class QuizListResponse(BaseModel):
    """Response model for quiz list."""
    quizzes: List[QuizMetadata]
    total: int


class QuizSubmissionResult(BaseModel):
    """Result of quiz submission."""
    quiz_id: str
    score: int  # percentage
    correct_count: int
    total_count: int
    time_taken: Optional[int] = None
    results: List[Dict]  # detailed results per question
    timestamp: str


class ChatMessage(BaseModel):
    """Individual chat message model."""
    id: str
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: str
    session_id: str


class ChatSessionMetadata(BaseModel):
    """Chat session metadata."""
    id: str
    class_id: str
    title: str
    message_count: int
    created_at: str
    updated_at: str
    last_message_preview: Optional[str] = None


class ChatSessionDetail(BaseModel):
    """Detailed chat session with messages."""
    id: str
    class_id: str
    title: str
    messages: List[ChatMessage]
    created_at: str
    updated_at: str


class ChatSessionListResponse(BaseModel):
    """Response model for chat session list."""
    sessions: List[ChatSessionMetadata]
    total: int