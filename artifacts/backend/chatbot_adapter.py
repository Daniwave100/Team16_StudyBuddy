# backend/app/tools/chatbot_adapter.py

import random

QUESTION_BANK = [
    {
        "id": "q1",
        "prompt": "What does (first '(10 20 30)) return?",
        "topic": "Lists",
        "difficulty": "Easy",
        "options": ["'(10 20 30)", "10", "20", "30"],
        "correct_index": 1,
        "explanation": "first returns the first element."
    },
    {
        "id": "q2",
        "prompt": "What does (rest '(10 20 30)) return?",
        "topic": "Lists",
        "difficulty": "Easy",
        "options": ["'(10 20 30)", "'(20 30)", "20", "30"],
        "correct_index": 1,
        "explanation": "rest returns the list without first element."
    },
    {
        "id": "q3",
        "prompt": "foldr processes list from which direction?",
        "topic": "Higher-order functions",
        "difficulty": "Medium",
        "options": ["Left", "Right", "Random", "Depends"],
        "correct_index": 1,
        "explanation": "foldr combines from right to left."
    }
]


def generate_quiz(topic: str = "General", num_questions: int = 5):
    matching = [q for q in QUESTION_BANK if topic.lower() in q["topic"].lower()]
    pool = matching if len(matching) >= 2 else QUESTION_BANK

    chosen = random.sample(pool, k=min(num_questions, len(pool)))

    return {
        "topic": topic,
        "num_questions": len(chosen),
        "questions": chosen
    }