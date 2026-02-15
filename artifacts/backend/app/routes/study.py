"""Study endpoints.

Defines chat, ingest, flashcards, and quiz routes.
"""
from fastapi import APIRouter, HTTPException
from app.models.requests import ChatRequest
from app.models.responses import ChatResponse
from app.agent import run
from datetime import datetime

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint for interacting with the study assistant.
    
    Args:
        request: ChatRequest containing class_id, message, and optional conversation_id
        
    Returns:
        ChatResponse with the AI assistant's response
    """
    try:
        # Call the agent with chat mode
        result = run(
            mode="chat",
            class_id=request.class_id,
            message=request.message,
            focus=request.focus
        )
        
        # Extract the response from the agent result
        response_text = result.final_output if hasattr(result, 'final_output') else str(result)
        
        return ChatResponse(
            response=response_text,
            conversation_id=request.conversation_id,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")