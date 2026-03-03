"""Quiz management endpoints.

Handles CRUD operations for quizzes including creation, retrieval, update, deletion, and submission.
"""
from fastapi import APIRouter, HTTPException
from app.models.requests import QuizCreateRequest, QuizUpdateRequest, QuizSubmissionRequest
from app.models.responses import (
    QuizMetadata, QuizDetail, QuizListResponse, QuizSubmissionResult, QuizQuestion
)
from app.agent import run
from datetime import datetime
from typing import Optional
import json
import uuid

router = APIRouter()

# In-memory storage for quizzes (replace with database in production)
quizzes_db = {}


@router.post("/quizzes", response_model=QuizDetail, status_code=201)
async def create_quiz(request: QuizCreateRequest):
    """
    Create a new quiz for a class.
    
    Args:
        request: QuizCreateRequest with class_id, title, description, focus, question_count, difficulty
        
    Returns:
        QuizDetail with generated questions
    """
    try:
        # Generate questions using the agent
        result = run(
            mode="quiz",
            class_id=request.class_id,
            focus=request.focus,
            message=f"Generate {request.question_count} quiz questions" + 
                    (f" focusing on: {request.focus}" if request.focus else "")
        )
        
        # Extract and parse the response
        response_text = result.final_output if hasattr(result, 'final_output') else str(result)
        
        try:
            quiz_data = json.loads(response_text)
            questions = []
            for i, q in enumerate(quiz_data):
                question = QuizQuestion(
                    id=f"q{i+1}",
                    **q
                )
                questions.append(question)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse quiz response from AI")
        
        # Create quiz record
        quiz_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        quiz = {
            "id": quiz_id,
            "class_id": request.class_id,
            "title": request.title,
            "description": request.description,
            "difficulty": request.difficulty,
            "questions": [q.model_dump() for q in questions],
            "created_at": timestamp,
            "updated_at": timestamp
        }
        
        quizzes_db[quiz_id] = quiz
        
        return QuizDetail(**quiz)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating quiz: {str(e)}")


@router.get("/quizzes", response_model=QuizListResponse)
async def list_quizzes(class_id: Optional[str] = None):
    """
    Retrieve a list of all quizzes, optionally filtered by class.
    
    Args:
        class_id: Optional class ID to filter quizzes
        
    Returns:
        QuizListResponse with list of quiz metadata
    """
    try:
        quizzes = list(quizzes_db.values())
        
        # Filter by class_id if provided
        if class_id:
            quizzes = [q for q in quizzes if q["class_id"] == class_id]
        
        # Convert to metadata (exclude questions)
        quiz_metadata = [
            QuizMetadata(
                id=q["id"],
                class_id=q["class_id"],
                title=q["title"],
                description=q.get("description"),
                difficulty=q.get("difficulty", "medium"),
                question_count=len(q["questions"]),
                created_at=q["created_at"],
                updated_at=q.get("updated_at")
            )
            for q in quizzes
        ]
        
        return QuizListResponse(
            quizzes=quiz_metadata,
            total=len(quiz_metadata)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving quizzes: {str(e)}")


@router.get("/quizzes/{quiz_id}", response_model=QuizDetail)
async def get_quiz(quiz_id: str):
    """
    Retrieve details of a specific quiz by ID.
    
    Args:
        quiz_id: The unique identifier of the quiz
        
    Returns:
        QuizDetail with questions
    """
    if quiz_id not in quizzes_db:
        raise HTTPException(status_code=404, detail=f"Quiz with ID '{quiz_id}' not found")
    
    try:
        quiz = quizzes_db[quiz_id]
        return QuizDetail(**quiz)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving quiz: {str(e)}")


@router.put("/quizzes/{quiz_id}", response_model=QuizMetadata)
async def update_quiz(quiz_id: str, request: QuizUpdateRequest):
    """
    Update quiz metadata (title, description, difficulty).
    
    Args:
        quiz_id: The unique identifier of the quiz
        request: QuizUpdateRequest with updated fields
        
    Returns:
        Updated QuizMetadata
    """
    if quiz_id not in quizzes_db:
        raise HTTPException(status_code=404, detail=f"Quiz with ID '{quiz_id}' not found")
    
    try:
        quiz = quizzes_db[quiz_id]
        
        # Update only provided fields
        if request.title is not None:
            quiz["title"] = request.title
        if request.description is not None:
            quiz["description"] = request.description
        if request.difficulty is not None:
            quiz["difficulty"] = request.difficulty
        
        quiz["updated_at"] = datetime.utcnow().isoformat()
        
        return QuizMetadata(
            id=quiz["id"],
            class_id=quiz["class_id"],
            title=quiz["title"],
            description=quiz.get("description"),
            difficulty=quiz.get("difficulty", "medium"),
            question_count=len(quiz["questions"]),
            created_at=quiz["created_at"],
            updated_at=quiz["updated_at"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating quiz: {str(e)}")


@router.delete("/quizzes/{quiz_id}", status_code=204)
async def delete_quiz(quiz_id: str):
    """
    Delete a quiz from the database.
    
    Args:
        quiz_id: The unique identifier of the quiz
        
    Returns:
        No content (204)
    """
    if quiz_id not in quizzes_db:
        raise HTTPException(status_code=404, detail=f"Quiz with ID '{quiz_id}' not found")
    
    try:
        del quizzes_db[quiz_id]
        return None
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting quiz: {str(e)}")


@router.post("/quizzes/{quiz_id}/submit", response_model=QuizSubmissionResult)
async def submit_quiz(quiz_id: str, request: QuizSubmissionRequest):
    """
    Submit answers for a quiz and get results.
    
    Args:
        quiz_id: The unique identifier of the quiz
        request: QuizSubmissionRequest with user's answers
        
    Returns:
        QuizSubmissionResult with score and detailed results
    """
    if quiz_id not in quizzes_db:
        raise HTTPException(status_code=404, detail=f"Quiz with ID '{quiz_id}' not found")
    
    try:
        quiz = quizzes_db[quiz_id]
        questions = quiz["questions"]
        
        correct_count = 0
        results = []
        
        for q in questions:
            question_id = q["id"]
            user_answer = request.answers.get(question_id)
            correct_answer = q["answer"]
            is_correct = user_answer == correct_answer
            
            if is_correct:
                correct_count += 1
            
            results.append({
                "question_id": question_id,
                "question_text": q["question"],
                "user_answer": user_answer,
                "correct_answer": correct_answer,
                "is_correct": is_correct,
                "explanation": q["explanation"]
            })
        
        total_count = len(questions)
        score = round((correct_count / total_count) * 100) if total_count > 0 else 0
        
        return QuizSubmissionResult(
            quiz_id=quiz_id,
            score=score,
            correct_count=correct_count,
            total_count=total_count,
            time_taken=request.time_taken,
            results=results,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting quiz: {str(e)}")
