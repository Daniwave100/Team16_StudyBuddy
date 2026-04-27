# StudyBuddy

StudyBuddy is an AI-powered study assistant that helps students learn from their own course materials. Upload a PDF, DOCX, or TXT file for a class — the system indexes it into a vector store — then chat with an AI tutor, generate flashcards, or take a quiz, all grounded in your actual notes and readings.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [User Guide](#user-guide)
- [Known Limitations](#known-limitations)
- [Project Structure](#project-structure)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (User)                           │
│  HTML/CSS/JS  ·  Supabase JS SDK (auth)  ·  localStorage        │
└───────────────────────────┬─────────────────────────────────────┘
                            │  HTTP (fetch / FormData)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND  :8000                        │
│                                                                 │
│  /api/ingest  ──► ingest.py (parse + chunk)                     │
│  /api/chat    ──► agent.py  (OpenAI Agents SDK)                 │
│  /api/flashcards ──► agent.py                                   │
│  /api/quizzes    ──► agent.py + in-memory store                 │
│                        │                                        │
│               prompts.py (system prompts)                       │
│               retrieve.py (similarity search)                   │
└──────────┬─────────────────────────┬───────────────────────────┘
           │  pgvector (embeddings)  │  OpenAI API
           ▼                         ▼
┌──────────────────┐     ┌──────────────────────────────┐
│ Supabase Postgres │     │  OpenAI                      │
│  study_chunks     │     │  text-embedding-3-small      │
│  (pgvector 1536d) │     │  gpt-4o (via Agents SDK)     │
└──────────────────┘     └──────────────────────────────┘
   (or local JSON fallback when VECTOR_BACKEND=local)
```

**Data flow:**
1. **Ingest** — file → text extraction → 900-char chunks (120 overlap) → embed via OpenAI → store in Supabase pgvector
2. **Generate** — user query → embed query → cosine similarity top-5 chunks → system prompt + context → OpenAI Agent → structured JSON or plain text response
3. **Quiz submit** — answers submitted → scored against stored correct answers → results with explanations returned

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JavaScript, Supabase JS SDK (CDN) |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| AI | OpenAI Agents SDK, OpenAI Embeddings (`text-embedding-3-small`) |
| Vector Store | Supabase PostgreSQL + pgvector (cosine similarity), local JSON fallback |
| ORM | SQLAlchemy (models defined, not yet wired to persistence) |
| Auth | Supabase Auth (frontend only) |

---

## Quick Start

### Prerequisites

- Python 3.11+
- An OpenAI API key
- (Optional) A Supabase project with pgvector enabled — set `VECTOR_BACKEND=local` to skip this

### 1. Clone and set up environment

```bash
git clone <repo-url>
cd Team16_StudyBuddy

python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

pip install -r artifacts/backend/requirements.txt
```

### 2. Configure environment variables

```bash
cp artifacts/.env.example artifacts/.env
# Edit artifacts/.env — at minimum set OPENAI_API_KEY
```

See [Environment Variables](#environment-variables) for the full reference.

### 3. (Optional) Bootstrap Supabase vector store

If using `VECTOR_BACKEND=supabase`, run the schema setup against your Supabase project:

```bash
# In your Supabase SQL editor, paste and run:
artifacts/backend/app/supabase_schema.sql
```

This creates the `study_chunks` table with the `vector(1536)` column and a cosine similarity index.

### 4. Start the backend

```bash
cd artifacts/backend
uvicorn app.main:app --reload
# API: http://localhost:8000
# Swagger docs: http://localhost:8000/docs
```

### 5. Open the frontend

```bash
cd artifacts/frontend
python -m http.server 3000
# Open http://localhost:3000 in your browser
```

Or simply open `artifacts/frontend/index.html` directly in a browser.

---

## Environment Variables

Place these in `artifacts/.env`. Copy `artifacts/.env.example` as a starting point.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | — | OpenAI API key for embeddings and chat |
| `VECTOR_BACKEND` | No | `supabase` | `supabase` or `local` (local uses JSON file, no DB needed) |
| `SUPABASE_DB_URL` | If `VECTOR_BACKEND=supabase` | — | Supabase PostgreSQL connection string |
| `EMBEDDING_MODEL` | No | `text-embedding-3-small` | OpenAI embedding model |
| `EMBEDDING_DIMENSIONS` | No | `1536` | Must match the model's output dimensions |
| `DATABASE_URL` | No | `sqlite:///./studybuddy.db` | SQLAlchemy app database URL |

---

## API Documentation

Full interactive docs are at `http://localhost:8000/docs` when the backend is running.

See [`docs/API.md`](docs/API.md) for a complete reference of all endpoints, request/response schemas, and example payloads.

---

## User Guide

See [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) for a step-by-step walkthrough of all features from the end-user perspective.

---

## Known Limitations

See [`docs/KNOWN_ISSUES.md`](docs/KNOWN_ISSUES.md) for the full list of known limitations, technical debt items, and suggested next steps.

Key items:
- All chat sessions, quizzes, and flashcard sets are stored **in-memory** — data is lost on server restart. SQLAlchemy models exist but are not wired to persistence.
- No backend authentication — all API endpoints are open. Frontend uses Supabase Auth via `localStorage`.
- Several frontend JS modules (`api.js`, `chat.js`, `quiz.js`, `flashcards.js`, `classes.js`) are stubs not connected to the backend.
- CORS allows all origins (`*`) — must be restricted before production deployment.

---

## Project Structure

```
artifacts/
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI entry point, CORS, router registration
│   │   ├── agent.py            # OpenAI Agent orchestrator (chat/flashcard/quiz)
│   │   ├── vector_store.py     # Supabase pgvector + local JSON dual-backend
│   │   ├── prompts.py          # System prompts for each AI mode
│   │   ├── db.py               # SQLAlchemy setup
│   │   ├── supabase_schema.sql # Supabase table creation script
│   │   ├── models/
│   │   │   ├── requests.py     # Pydantic request schemas
│   │   │   ├── responses.py    # Pydantic response schemas
│   │   │   └── database.py     # SQLAlchemy ORM models
│   │   ├── routes/
│   │   │   ├── chat.py         # Chat sessions & messages API
│   │   │   ├── study.py        # Ingest, flashcards, quiz generation API
│   │   │   ├── quizzes.py      # Quiz CRUD & submission API
│   │   │   └── API_endpoint.py # Legacy endpoint (dummy data)
│   │   └── tools/
│   │       ├── ingest.py       # File parsing (PDF/DOCX/TXT) + chunking
│   │       └── retrieve.py     # Vector store retrieval wrapper
│   └── requirements.txt
├── frontend/
│   ├── index.html              # Landing page
│   ├── login.html / signup.html
│   ├── dashboard.html          # Class dashboard
│   ├── class.html              # Per-class view
│   ├── quiz.html               # Quiz interface
│   ├── flashcards-homepage.html / flashcards-individual.html
│   ├── chatbot-class-selector.html / chatbot-interface.html
│   ├── script.js               # Auth & session logic
│   ├── js/                     # Feature JS modules
│   └── css/                    # Feature-specific styles
└── .env / .env.example
docs/
├── API.md                      # Full API endpoint reference
├── USER_GUIDE.md               # End-user feature walkthrough
└── KNOWN_ISSUES.md             # Limitations and technical debt
```

---

## Ownership

Team 16 — SCRUM Sprint 9
