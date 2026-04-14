# StudyBuddy API Reference

All endpoints are prefixed with `/api`. The backend runs on `http://localhost:8000` by default.

Interactive Swagger docs: `http://localhost:8000/docs`

---

## Chat

### POST `/api/chat`
Send a message to the AI tutor for a given class.

**Request body:**
```json
{
  "class_id": "string",
  "message": "string",
  "conversation_id": "string (optional)",
  "focus": "string (optional — topic hint for retrieval)"
}
```

**Response:**
```json
{
  "response": "string",
  "conversation_id": "string",
  "timestamp": "ISO 8601 datetime"
}
```

---

### POST `/api/chat/sessions`
Create a new chat session.

**Request body:**
```json
{
  "class_id": "string",
  "title": "string (optional)"
}
```

**Response:** `ChatSessionMetadata` — see GET `/api/chat/sessions/{session_id}` for shape.

---

### GET `/api/chat/sessions`
List all chat sessions.

**Query params:** `class_id` (optional filter)

**Response:**
```json
{
  "sessions": [ ...ChatSessionMetadata ],
  "total": 0
}
```

---

### GET `/api/chat/sessions/{session_id}`
Get a session with its full message history.

**Response:**
```json
{
  "id": "string",
  "class_id": "string",
  "title": "string",
  "messages": [
    { "role": "user|assistant", "content": "string", "timestamp": "..." }
  ],
  "created_at": "...",
  "updated_at": "..."
}
```

---

### PUT `/api/chat/sessions/{session_id}/title`
Rename a chat session.

**Query params:** `title` (string)

**Response:** `ChatSessionMetadata`

---

### DELETE `/api/chat/sessions/{session_id}`
Delete a chat session.

**Response:** `204 No Content`

---

### DELETE `/api/chat/sessions/{session_id}/messages`
Clear all messages from a session (keep session).

**Response:** `204 No Content`

---

## Study — Ingest

### POST `/api/ingest`
Upload and index course materials for a class.

**Request:** `multipart/form-data`
- `class_id` (string)
- `files` (one or more files — PDF, DOCX, or TXT)

**Response:**
```json
{
  "class_id": "string",
  "files_indexed": 2,
  "chunks_indexed": 47,
  "files": ["lecture1.pdf", "notes.docx"],
  "timestamp": "..."
}
```

---

## Study — Flashcards

### POST `/api/flashcards`
Generate a flashcard set from indexed class materials.

**Request body:**
```json
{
  "class_id": "string",
  "focus": "string (optional topic)",
  "count": 10
}
```

**Response:**
```json
{
  "id": "string",
  "class_id": "string",
  "flashcards": [
    { "front": "string", "back": "string" }
  ],
  "count": 10,
  "created_at": "...",
  "updated_at": "...",
  "timestamp": "..."
}
```

---

### GET `/api/flashcards`
List all flashcard sets.

**Query params:** `class_id` (optional filter)

**Response:** `{ "flashcard_sets": [...], "total": 0 }`

---

### GET `/api/flashcards/{flashcard_id}`
Get a specific flashcard set.

**Response:** `FlashcardResponse` (same shape as POST response)

---

### DELETE `/api/flashcards/{flashcard_id}`
Delete a flashcard set.

**Response:** `204 No Content`

---

## Study — One-shot Quiz Generation

### POST `/api/quiz`
Generate a quiz directly from class materials (not persisted).

**Request body:**
```json
{
  "class_id": "string",
  "focus": "string (optional)",
  "count": 10
}
```

**Response:**
```json
{
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "string",
      "explanation": "string"
    }
  ],
  "class_id": "string",
  "count": 10,
  "timestamp": "..."
}
```

---

## Quizzes (CRUD + Submission)

### POST `/api/quizzes`
Create and persist a quiz.

**Request body:**
```json
{
  "class_id": "string",
  "title": "string",
  "description": "string (optional)",
  "focus": "string (optional)",
  "question_count": 10,
  "difficulty": "string (optional)"
}
```

**Response:** `QuizDetail` — full quiz object with questions array.

---

### GET `/api/quizzes`
List all quizzes.

**Query params:** `class_id` (optional filter)

**Response:** `{ "quizzes": [...QuizMetadata], "total": 0 }`

---

### GET `/api/quizzes/{quiz_id}`
Get a quiz with all questions.

**Response:** `QuizDetail`

---

### PUT `/api/quizzes/{quiz_id}`
Update quiz metadata (title, description, difficulty).

**Request body:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "difficulty": "string (optional)"
}
```

**Response:** `QuizMetadata`

---

### DELETE `/api/quizzes/{quiz_id}`
Delete a quiz.

**Response:** `204 No Content`

---

### POST `/api/quizzes/{quiz_id}/submit`
Submit answers for scoring.

**Request body:**
```json
{
  "quiz_id": "string",
  "answers": {
    "question_id": "selected_answer"
  },
  "time_taken": 120
}
```

**Response:**
```json
{
  "id": "string",
  "quiz_id": "string",
  "score": 80.0,
  "correct_count": 8,
  "total_count": 10,
  "time_taken": 120,
  "results": [
    {
      "question_id": "string",
      "correct": true,
      "selected_answer": "string",
      "correct_answer": "string",
      "explanation": "string"
    }
  ],
  "timestamp": "..."
}
```

---

### GET `/api/quizzes/{quiz_id}/submissions`
Get submission history for a quiz.

**Response:** `{ "submissions": [...], "total": 0 }`

---

## Health Check

### GET `/`
**Response:** `{ "message": "StudyBuddy API", "status": "running" }`
