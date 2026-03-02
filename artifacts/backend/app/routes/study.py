"""Study endpoints.

Defines ingest, flashcards, and quiz generation routes.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.models.requests import FlashcardRequest, QuizRequest
from app.models.responses import (
    FlashcardResponse,
    QuizResponse,
    Flashcard,
    QuizQuestion,
    IngestResponse,
    IngestedFile,
)
from app.agent import run
from app.tools.ingest import ingest_files
from datetime import datetime
import json

router = APIRouter()


@router.post("/ingest", response_model=IngestResponse, status_code=201)
async def ingest_study_materials(
    class_id: str = Form(...),
    files: list[UploadFile] = File(...),
):
    """Ingest uploaded files and index them for retrieval by class."""
    try:
        if not files:
            raise HTTPException(status_code=400, detail="At least one file is required")

        payloads: list[tuple[str, bytes]] = []
        for uploaded_file in files:
            if not uploaded_file.filename:
                raise HTTPException(status_code=400, detail="Uploaded file must have a filename")
            payloads.append((uploaded_file.filename, await uploaded_file.read()))

        file_summaries = ingest_files(class_id=class_id, files=payloads)
        if not file_summaries:
            raise HTTPException(status_code=400, detail="No readable content found in uploaded files")

        return IngestResponse(
            class_id=class_id,
            files_indexed=len(file_summaries),
            chunks_indexed=sum(item["chunk_count"] for item in file_summaries),
            files=[IngestedFile(**item) for item in file_summaries],
            timestamp=datetime.utcnow().isoformat(),
        )
    except HTTPException:
        raise
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Error ingesting files: {str(error)}")


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