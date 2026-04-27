# StudyBuddy - AI-Powered Study Assistant

An AI-powered hybrid study app (like an AI-powered Quizlet) that lets students upload course materials and interactively study through AI-generated flashcards, quizzes, and a chat tutor.

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JavaScript (no framework), Supabase JS SDK (CDN) for auth
- **Backend:** Python 3.11+, FastAPI, Uvicorn
- **AI:** OpenAI Agents SDK + OpenAI Embeddings API (`text-embedding-3-small`)
- **Vector Store:** Supabase PostgreSQL with pgvector extension (cosine similarity), local JSON fallback
- **Database:** SQLAlchemy ORM (SQLite dev / PostgreSQL prod) - models defined but in-memory dicts currently used
- **Auth:** Supabase Auth on frontend, no backend auth layer yet

## Project Structure

```
artifacts/
  frontend/           # Static HTML/CSS/JS pages
    index.html        # Landing page
    login.html        # Login form
    signup.html       # Signup form
    dashboard.html    # Class dashboard
    class.html        # Individual class view
    quiz.html         # Quiz interface
    flashcards-homepage.html
    flashcards-individual.html
    chatbot-interface.html
    chatbot-class-selector.html
    script.js         # Auth & session logic (working)
    js/               # Feature JS modules (mostly stubs)
    css/              # Feature-specific styles
  backend/
    app/
      main.py         # FastAPI entry point
      agent.py        # OpenAI Agent orchestrator (chat/flashcard/quiz)
      vector_store.py # Supabase pgvector + local JSON fallback
      prompts.py      # System prompts for each AI mode
      db.py           # SQLAlchemy setup
      models/
        requests.py   # Pydantic request schemas
        responses.py  # Pydantic response schemas
        database.py   # SQLAlchemy ORM models
      routes/
        chat.py       # Chat sessions & messages API
        study.py      # Ingest, flashcards, quiz generation API
        quizzes.py    # Quiz CRUD & submission API
      tools/
        ingest.py     # File parsing (PDF/DOCX/TXT) + chunking
        retrieve.py   # Vector store retrieval wrapper
    requirements.txt  # Python dependencies
  .env                # Environment variables (secrets)
  .env.example        # Template
docs/                 # Research docs, architecture notes
```

## How to Run

### Backend
```bash
cd artifacts/backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# Runs on http://localhost:8000, Swagger docs at /docs
```

### Frontend
```bash
cd artifacts/frontend
python -m http.server 3000  # Or any static file server
```

### Environment Variables (in `artifacts/.env`)
- `OPENAI_API_KEY` - OpenAI API key
- `VECTOR_BACKEND` - `supabase` (default) or `local`
- `SUPABASE_DB_URL` - PostgreSQL connection string for Supabase
- `EMBEDDING_MODEL` - Default: `text-embedding-3-small`
- `EMBEDDING_DIMENSIONS` - Default: `1536`
- `DATABASE_URL` - App database (default: `sqlite:///./studybuddy.db`)

## Core AI Pipeline

1. **Ingest:** Upload files -> parse text -> chunk (~900 chars, 120 overlap) -> embed via OpenAI -> store in Supabase pgvector
2. **Retrieve:** Query embedding -> cosine similarity search -> top-5 chunks
3. **Generate:** System prompt + retrieved context + user message -> OpenAI Agent -> structured response (chat text, flashcard JSON, or quiz JSON)

Prompt templates are in `app/prompts.py`. The agent orchestrator is `app/agent.py`.

## API Routes

All routes prefixed with `/api`:

- **Chat:** `POST /chat`, `POST/GET /chat/sessions`, `GET/PUT/DELETE /chat/sessions/{id}`
- **Study:** `POST /ingest`, `POST/GET /flashcards`, `GET/DELETE /flashcards/{id}`, `POST /quiz`
- **Quizzes:** Full CRUD at `/quizzes`, `POST /quizzes/{id}/submit`, `GET /quizzes/{id}/submissions`

## Database Schema

**Vector store (`study_chunks` in Supabase):** id, class_id, source, chunk_index, content, embedding(1536), created_at

**App tables (SQLAlchemy, defined but not yet persisted):** quizzes, chat_sessions, chat_messages, flashcard_sets

## Current State & Known Issues

- All data stored in-memory dicts (lost on server restart) - SQLAlchemy models exist but aren't wired up
- Frontend JS modules (`api.js`, `chat.js`, `quiz.js`, `flashcards.js`, `classes.js`) are stubs
- No backend authentication - all endpoints are open
- CORS allows all origins (`*`)
- No test suite
- `routes/API_endpoint.py` has a bug referencing undefined `random` module

## Git Conventions

- Branch: `dev` (working branch), `main` (base for PRs)
- Commit messages use task IDs: `TM16-xxx Description`

## Code Conventions

- Backend uses Pydantic models for request/response validation
- UUIDs for all entity IDs (generated via `uuid.uuid4()`)
- AI responses parsed as JSON for flashcards/quizzes, plain text for chat
- Frontend uses localStorage for session state (`isLoggedIn`, `userEmail`)
