"""Chat session endpoints.

Handles chat sessions, message history, and conversation management.
"""
from fastapi import APIRouter, HTTPException
from app.models.requests import ChatRequest, ChatSessionCreateRequest
from app.models.responses import (
    ChatResponse, ChatMessage, ChatSessionMetadata, 
    ChatSessionDetail, ChatSessionListResponse
)
from app.agent import run
from datetime import datetime
from typing import Optional
import uuid

router = APIRouter()

# In-memory storage for chat sessions and messages (replace with database in production)
sessions_db = {}
messages_db = {}  # session_id -> list of messages


@router.post("/chat/sessions", response_model=ChatSessionMetadata, status_code=201)
async def create_chat_session(request: ChatSessionCreateRequest):
    """
    Create a new chat session.
    
    Args:
        request: ChatSessionCreateRequest with class_id and optional title
        
    Returns:
        ChatSessionMetadata with new session info
    """
    try:
        session_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        session = {
            "id": session_id,
            "class_id": request.class_id,
            "title": request.title or "New Conversation",
            "created_at": timestamp,
            "updated_at": timestamp
        }
        
        sessions_db[session_id] = session
        messages_db[session_id] = []
        
        return ChatSessionMetadata(
            id=session_id,
            class_id=request.class_id,
            title=session["title"],
            message_count=0,
            created_at=timestamp,
            updated_at=timestamp,
            last_message_preview=None
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating chat session: {str(e)}")


@router.get("/chat/sessions", response_model=ChatSessionListResponse)
async def list_chat_sessions(class_id: Optional[str] = None):
    """
    Retrieve a list of all chat sessions, optionally filtered by class.
    
    Args:
        class_id: Optional class ID to filter sessions
        
    Returns:
        ChatSessionListResponse with list of session metadata
    """
    try:
        sessions = list(sessions_db.values())
        
        # Filter by class_id if provided
        if class_id:
            sessions = [s for s in sessions if s["class_id"] == class_id]
        
        # Convert to metadata with message counts and previews
        session_metadata = []
        for s in sessions:
            session_messages = messages_db.get(s["id"], [])
            last_message = session_messages[-1] if session_messages else None
            
            session_metadata.append(ChatSessionMetadata(
                id=s["id"],
                class_id=s["class_id"],
                title=s["title"],
                message_count=len(session_messages),
                created_at=s["created_at"],
                updated_at=s["updated_at"],
                last_message_preview=last_message["content"][:50] + "..." if last_message else None
            ))
        
        # Sort by updated_at descending (most recent first)
        session_metadata.sort(key=lambda x: x.updated_at, reverse=True)
        
        return ChatSessionListResponse(
            sessions=session_metadata,
            total=len(session_metadata)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat sessions: {str(e)}")


@router.get("/chat/sessions/{session_id}", response_model=ChatSessionDetail)
async def get_chat_session(session_id: str):
    """
    Retrieve details of a specific chat session with full message history.
    
    Args:
        session_id: The unique identifier of the chat session
        
    Returns:
        ChatSessionDetail with messages
    """
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail=f"Chat session with ID '{session_id}' not found")
    
    try:
        session = sessions_db[session_id]
        session_messages = messages_db.get(session_id, [])
        
        messages = [ChatMessage(**msg) for msg in session_messages]
        
        return ChatSessionDetail(
            id=session["id"],
            class_id=session["class_id"],
            title=session["title"],
            messages=messages,
            created_at=session["created_at"],
            updated_at=session["updated_at"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat session: {str(e)}")


@router.put("/chat/sessions/{session_id}/title")
async def update_chat_session_title(session_id: str, title: str):
    """
    Update the title of a chat session.
    
    Args:
        session_id: The unique identifier of the chat session
        title: New title for the session
        
    Returns:
        Updated session metadata
    """
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail=f"Chat session with ID '{session_id}' not found")
    
    try:
        session = sessions_db[session_id]
        session["title"] = title
        session["updated_at"] = datetime.utcnow().isoformat()
        
        session_messages = messages_db.get(session_id, [])
        last_message = session_messages[-1] if session_messages else None
        
        return ChatSessionMetadata(
            id=session["id"],
            class_id=session["class_id"],
            title=session["title"],
            message_count=len(session_messages),
            created_at=session["created_at"],
            updated_at=session["updated_at"],
            last_message_preview=last_message["content"][:50] + "..." if last_message else None
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating chat session: {str(e)}")


@router.delete("/chat/sessions/{session_id}", status_code=204)
async def delete_chat_session(session_id: str):
    """
    Delete a chat session and all its messages.
    
    Args:
        session_id: The unique identifier of the chat session
        
    Returns:
        No content (204)
    """
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail=f"Chat session with ID '{session_id}' not found")
    
    try:
        del sessions_db[session_id]
        if session_id in messages_db:
            del messages_db[session_id]
        return None
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting chat session: {str(e)}")


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a chat message and get AI response. Creates session if conversation_id not provided.
    
    Args:
        request: ChatRequest containing class_id, message, optional conversation_id, and focus
        
    Returns:
        ChatResponse with the AI assistant's response and conversation_id
    """
    try:
        # Create or get session
        session_id = request.conversation_id
        
        if not session_id:
            # Create new session
            session_id = str(uuid.uuid4())
            timestamp = datetime.utcnow().isoformat()
            sessions_db[session_id] = {
                "id": session_id,
                "class_id": request.class_id,
                "title": request.message[:50] + "..." if len(request.message) > 50 else request.message,
                "created_at": timestamp,
                "updated_at": timestamp
            }
            messages_db[session_id] = []
        elif session_id not in sessions_db:
            raise HTTPException(status_code=404, detail=f"Conversation ID '{session_id}' not found")
        
        # Store user message
        timestamp = datetime.utcnow().isoformat()
        user_message = {
            "id": str(uuid.uuid4()),
            "role": "user",
            "content": request.message,
            "timestamp": timestamp,
            "session_id": session_id
        }
        messages_db[session_id].append(user_message)
        
        # Call the agent with chat mode
        result = run(
            mode="chat",
            class_id=request.class_id,
            message=request.message,
            focus=request.focus
        )
        
        # Extract the response from the agent result
        response_text = result.final_output if hasattr(result, 'final_output') else str(result)
        
        # Store assistant message
        assistant_message = {
            "id": str(uuid.uuid4()),
            "role": "assistant",
            "content": response_text,
            "timestamp": datetime.utcnow().isoformat(),
            "session_id": session_id
        }
        messages_db[session_id].append(assistant_message)
        
        # Update session timestamp
        sessions_db[session_id]["updated_at"] = datetime.utcnow().isoformat()
        
        return ChatResponse(
            response=response_text,
            conversation_id=session_id,
            timestamp=timestamp
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")


@router.delete("/chat/sessions/{session_id}/messages", status_code=204)
async def clear_chat_history(session_id: str):
    """
    Clear all messages in a chat session (keep the session).
    
    Args:
        session_id: The unique identifier of the chat session
        
    Returns:
        No content (204)
    """
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail=f"Chat session with ID '{session_id}' not found")
    
    try:
        messages_db[session_id] = []
        sessions_db[session_id]["updated_at"] = datetime.utcnow().isoformat()
        return None
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing chat history: {str(e)}")
