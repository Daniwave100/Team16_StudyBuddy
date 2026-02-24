"""Study endpoints.

Defines ingest, flashcards, and quiz generation routes.
"""
from fastapi import APIRouter, HTTPException
from app.models.requests import FlashcardRequest, QuizRequest
from app.models.responses import FlashcardResponse, QuizResponse, Flashcard, QuizQuestion
from app.agent import run
from datetime import datetime
import json

router = APIRouter()


@router.post("/flashcards", response_model=FlashcardResponse)
async def generate_flashcards(request: FlashcardRequest):
    """
    Generate flashcards for a class based on uploaded materials.
    
    Args:
        request: FlashcardRequest containing class_id, optional focus area, and count
        
    Returns:
        FlashcardResponse with generated flashcards
    """
    try:
        # Call the agent with flashcard mode
        result = run(
            mode="flashcard",
            class_id=request.class_id,
            focus=request.focus,
            message=f"Generate {request.count} flashcards" + (f" focusing on: {request.focus}" if request.focus else "")
        )
        
        # Extract the response from the agent result
        response_text = result.final_output if hasattr(result, 'final_output') else str(result)
        
        # Parse the JSON response from the agent
        try:
            flashcards_data = json.loads(response_text)
            flashcards = [Flashcard(**card) for card in flashcards_data]
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse flashcard response from AI")
        
        return FlashcardResponse(
            flashcards=flashcards,
            class_id=request.class_id,
            count=len(flashcards),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating flashcards: {str(e)}")


@router.post("/quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    """
    Generate quiz questions for a class based on uploaded materials.
    
    Args:
        request: QuizRequest containing class_id, optional focus area, and count
        
    Returns:
        QuizResponse with generated quiz questions
    """
    try:
        # Call the agent with quiz mode
        result = run(
            mode="quiz",
            class_id=request.class_id,
            focus=request.focus,
            message=f"Generate {request.count} quiz questions" + (f" focusing on: {request.focus}" if request.focus else "")
        )
        
        # Extract the response from the agent result
        response_text = result.final_output if hasattr(result, 'final_output') else str(result)
        
        # Parse the JSON response from the agent
        try:
            quiz_data = json.loads(response_text)
            questions = [QuizQuestion(**q) for q in quiz_data]
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse quiz response from AI")
        
        return QuizResponse(
            questions=questions,
            class_id=request.class_id,
            count=len(questions),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")