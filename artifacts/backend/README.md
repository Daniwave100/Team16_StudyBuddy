# StudyBuddy Backend

FastAPI REST API that powers the StudyBuddy AI study assistant. Handles document ingestion, vector-based retrieval, and AI-generated study content (chat, flashcards, quizzes) using the OpenAI Agents SDK.

## Purpose

Provide a backend service that:
- Accepts uploaded study materials (PDF, DOCX, TXT) and indexes them into a vector store
- Retrieves relevant content chunks using semantic search (Supabase pgvector) or lexical fallback (local JSON)
- Orchestrates an OpenAI agent to produce chat responses, flashcard sets, and quiz questions grounded in the student's materials
- Manages quiz lifecycle (create, list, update, delete, submit/grade)
- Manages chat sessions and message history

## Design

### Entry Point

`app/main.py` creates the FastAPI app, configures CORS (currently `*`), and registers three routers under `/api`:
- `chat` — chat sessions and messages
- `study` — ingest, flashcard generation, quiz generation
- `quizzes` — quiz CRUD and submission

### Agent Orchestrator (`app/agent.py`)

Central module that routes call into. Accepts a `mode` (chat | flashcard | quiz), a `class_id`, and an optional message/focus. It:
1. Retrieves the top-5 relevant chunks for the class via `retrieve.py`
2. Formats a system prompt from `prompts.py` with the retrieved context
3. Runs an OpenAI Agent (via `agents` SDK) synchronously
4. Returns the raw agent result

### Vector Store (`app/vector_store.py`)

Dual-backend abstraction controlled by the `VECTOR_BACKEND` env var:

| Backend | How it works |
|---|---|
| `supabase` (default) | Connects to Supabase Postgres via `psycopg2`. Uses `pgvector` extension for cosine similarity search. Embeddings generated via OpenAI `text-embedding-3-small`. |
| `local` | JSON file at `data/vector_store.json`. Lexical overlap scoring (token intersection). No embeddings required. Useful for offline development. |

Text is chunked into ~900-character segments with 120-character overlap before storage.

### Prompts (`app/prompts.py`)

Three prompt templates:
- **CHAT_PROMPT** — General tutoring with rules about accuracy and source grounding
- **FLASHCARD_PROMPT** — Returns JSON array of `{front, back}` objects
- **QUIZ_PROMPT** — Returns JSON array of `{question, options, answer, explanation}` objects

### Tools

| Module | Purpose |
|---|---|
| `tools/ingest.py` | Parses uploaded files (PDF via pypdf, DOCX via python-docx, TXT via decode) and passes extracted text to `vector_store.add_text_documents()` |
| `tools/retrieve.py` | Thin wrapper around `vector_store.retrieve_chunks()` |
| `tools/chatbot_adapter.py` | Legacy dummy quiz generator with hardcoded question bank (not used by main pipeline) |
| `tools/quiz.py` | Placeholder |
| `tools/flashcards.py` | Placeholder |

### Models

| Module | Contents |
|---|---|
| `models/requests.py` | `ChatRequest`, `FlashcardRequest`, `QuizRequest`, `QuizCreateRequest`, `QuizUpdateRequest`, `QuizSubmissionRequest`, `ChatSessionCreateRequest` |
| `models/responses.py` | `ChatResponse`, `Flashcard`, `FlashcardResponse`, `FlashcardListResponse`, `QuizQuestion`, `QuizResponse`, `QuizMetadata`, `QuizDetail`, `QuizListResponse`, `QuizSubmissionResult`, `ChatMessage`, `ChatSessionMetadata`, `ChatSessionDetail`, `ChatSessionListResponse`, `IngestedFile`, `IngestResponse` |

### Routes

| Module | Prefix | Endpoints |
|---|---|---|
| `routes/chat.py` | `/api` | `POST /chat` (send message), `POST /chat/sessions` (create), `GET /chat/sessions` (list), `GET /chat/sessions/{id}` (detail), `PUT /chat/sessions/{id}/title`, `DELETE /chat/sessions/{id}`, `DELETE /chat/sessions/{id}/messages` |
| `routes/study.py` | `/api` | `POST /ingest` (upload files), `POST /flashcards` (generate), `GET /flashcards` (list), `GET /flashcards/{id}`, `DELETE /flashcards/{id}`, `POST /quiz` (generate) |
| `routes/quizzes.py` | `/api` | `POST /quizzes` (create), `GET /quizzes` (list), `GET /quizzes/{id}`, `PUT /quizzes/{id}`, `DELETE /quizzes/{id}`, `POST /quizzes/{id}/submit` |
| `routes/API_endpoint.py` | `/quiz` | `POST /quiz/generate` (legacy, dummy data) |
| `routes/classes.py` | — | Placeholder, no endpoints |

### Database Schema

`app/supabase_schema.sql` defines the `study_chunks` table:

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `class_id` | TEXT | Class the chunk belongs to |
| `source` | TEXT | Original filename |
| `chunk_index` | INTEGER | Position within the source document |
| `content` | TEXT | Chunk text |
| `embedding` | vector(1536) | OpenAI embedding |
| `created_at` | TIMESTAMPTZ | Insertion time |

Indexes: `class_id` (B-tree), `embedding` (HNSW cosine).

## Inputs / Outputs

**Inputs:**
- File uploads (multipart/form-data) — PDF, DOCX, TXT
- JSON request bodies — class IDs, messages, focus areas, quiz answers

**Outputs:**
- JSON responses — chat text, flashcard arrays, quiz question arrays, ingest summaries, submission scores

## Dependencies

Listed in `requirements.txt`:
- `fastapi`, `uvicorn`, `pydantic` — Web framework
- `python-dotenv` — Environment variable loading
- `openai` — Embeddings + Agents SDK
- `psycopg2-binary` — Postgres driver
- `pypdf` — PDF text extraction
- `python-docx` — DOCX text extraction

## Running

```bash
cd artifacts/backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs`.

## Known Limitations

- Chat sessions, flashcard sets, and quizzes are stored in Python dicts (in-memory). All data is lost on restart.
- `config.py` and `classes.py` are empty placeholders.
- `API_endpoint.py` uses a hardcoded question bank and `random.sample` but never imports `random`, so it will raise a `NameError` at runtime.
- No authentication or authorization on any endpoint.
- CORS allows all origins.
