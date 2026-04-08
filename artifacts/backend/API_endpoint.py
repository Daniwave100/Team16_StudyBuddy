from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List

# ============================
# Request / Response Models
# ============================

class GenerateQuizRequest(BaseModel):
    topic: str = Field(default="General", min_length=1)
    num_questions: int = Field(default=5, ge=1, le=50)


class QuizQuestionOut(BaseModel):
    id: str
    prompt: str
    topic: str
    difficulty: str
    options: List[str]


class GenerateQuizResponse(BaseModel):
    topic: str
    num_questions: int
    questions: List[QuizQuestionOut]


# ============================
# Router
# ============================

router = APIRouter(prefix="/quiz", tags=["quiz"])


# ============================
# TEMP DUMMY DATA
# (replace later with chatbot call)
# ============================

QUESTION_BANK = [
    {
        "id": "q1",
        "prompt": "What does (first '(10 20 30)) return?",
        "topic": "Lists",
        "difficulty": "Easy",
        "options": ["'(10 20 30)", "10", "20", "30"],
    },
    {
        "id": "q2",
        "prompt": "What does (rest '(10 20 30)) return?",
        "topic": "Lists",
        "difficulty": "Easy",
        "options": ["'(10 20 30)", "'(20 30)", "20", "30"],
    },
    {
        "id": "q3",
        "prompt": "foldr processes list from which direction?",
        "topic": "Higher-order functions",
        "difficulty": "Medium",
        "options": ["Left", "Right", "Random", "Depends"],
    },
]


# ============================
# Endpoint
# ============================

@router.post("/generate", response_model=GenerateQuizResponse)
def generate_quiz(payload: GenerateQuizRequest):
    # later replace this with:
    # from app.tools.chatbot_adapter import generate_quiz
    # return generate_quiz(payload.topic, payload.num_questions)

    matching = [q for q in QUESTION_BANK if payload.topic.lower() in q["topic"].lower()]
    pool = matching if len(matching) >= 1 else QUESTION_BANK

    chosen = random.sample(pool, k=min(payload.num_questions, len(pool)))

    return {
        "topic": payload.topic,
        "num_questions": len(chosen),
        "questions": chosen
    }# TM16-30: generate quiz endpoint
