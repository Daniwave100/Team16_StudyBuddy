"""SQLAlchemy ORM models for persistent storage.

These mirror the Pydantic response schemas but represent actual DB rows.
"""

from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db import Base


class QuizRecord(Base):
    __tablename__ = "quizzes"

    id = Column(String, primary_key=True)
    class_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(String, default="medium")
    questions_json = Column(Text, nullable=False)  # stored as JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String, primary_key=True)
    class_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False, default="New Conversation")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True)
    session_id = Column(String, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String, nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


class FlashcardSet(Base):
    __tablename__ = "flashcard_sets"

    id = Column(String, primary_key=True)
    class_id = Column(String, nullable=False, index=True)
    flashcards_json = Column(Text, nullable=False)  # stored as JSON string
    count = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
