"""Study endpoints.

Defines ingest, flashcards, and quiz generation routes.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.models.requests import FlashcardRequest, QuizRequest
from app.models.responses import (
    FlashcardResponse,
    FlashcardListResponse,
    QuizResponse,
    Flashcard,
    QuizQuestion,
    IngestResponse,
    IngestedFile,
)
from app.agent import run
from app.tools.ingest import ingest_files
from datetime import datetime
from typing import Optional
import json
import uuid

router = APIRouter()

# In-memory storage for flashcard sets (replace with database in production)
flashcards_db = {}


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


@router.post("/flashcards", response_model=FlashcardResponse, status_code=201)
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
            if not isinstance(flashcards_data, list):
                raise HTTPException(status_code=500, detail="Invalid flashcard response format from AI")
            flashcards = [Flashcard(**card) for card in flashcards_data]
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse flashcard response from AI")

        flashcard_set_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()

        flashcard_record = {
            "id": flashcard_set_id,
            "flashcards": [card.model_dump() for card in flashcards],
            "class_id": request.class_id,
            "count": len(flashcards),
            "created_at": timestamp,
            "updated_at": timestamp,
            "timestamp": timestamp,
        }

        flashcards_db[flashcard_set_id] = flashcard_record
        
        return FlashcardResponse(
            id=flashcard_set_id,
            flashcards=flashcards,
            class_id=request.class_id,
            count=len(flashcards),
            created_at=timestamp,
            updated_at=timestamp,
            timestamp=timestamp,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating flashcards: {str(e)}")


@router.get("/flashcards", response_model=FlashcardListResponse)
async def list_flashcard_sets(class_id: Optional[str] = None):
    """Retrieve flashcard sets, optionally filtered by class ID."""
    try:
        flashcard_sets = list(flashcards_db.values())

        if class_id:
            flashcard_sets = [item for item in flashcard_sets if item["class_id"] == class_id]

        return FlashcardListResponse(
            flashcard_sets=[FlashcardResponse(**item) for item in flashcard_sets],
            total=len(flashcard_sets),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving flashcard sets: {str(e)}")


@router.get("/flashcards/{flashcard_id}", response_model=FlashcardResponse)
async def get_flashcard_set(flashcard_id: str):
    """Retrieve a specific flashcard set by ID."""
    if flashcard_id not in flashcards_db:
        raise HTTPException(status_code=404, detail=f"Flashcard set with ID '{flashcard_id}' not found")

    try:
        return FlashcardResponse(**flashcards_db[flashcard_id])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving flashcard set: {str(e)}")


@router.delete("/flashcards/{flashcard_id}", status_code=204)
async def delete_flashcard_set(flashcard_id: str):
    """Delete a flashcard set by ID."""
    if flashcard_id not in flashcards_db:
        raise HTTPException(status_code=404, detail=f"Flashcard set with ID '{flashcard_id}' not found")

    try:
        del flashcards_db[flashcard_id]
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting flashcard set: {str(e)}")


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