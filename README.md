# StudyBuddy

StudyBuddy is an AI-powered study assistant that helps students learn from their course materials. Students upload documents (PDF, DOCX, TXT) for a class, and the system indexes that content into a vector store. From there, they can chat with an AI tutor, generate flashcards, and take quizzes — all grounded in their own class materials.

## Architecture

```
artifacts/
├── backend/          # FastAPI REST API + OpenAI Agent orchestration
│   ├── app/
│   │   ├── main.py           # App entry point, CORS, router registration
│   │   ├── agent.py          # Agent orchestrator (chat / flashcard / quiz modes)
│   │   ├── vector_store.py   # Dual-backend vector store (Supabase pgvector + local JSON)
│   │   ├── prompts.py        # System prompts per mode
│   │   ├── config.py         # Shared configuration (placeholder)
│   │   ├── supabase_schema.sql
│   │   ├── models/
│   │   │   ├── requests.py   # Pydantic request schemas
│   │   │   └── responses.py  # Pydantic response schemas
│   │   ├── routes/
│   │   │   ├── chat.py       # Chat session & message endpoints
│   │   │   ├── study.py      # Ingest, flashcard, and quiz generation endpoints
│   │   │   ├── quizzes.py    # Quiz CRUD and submission endpoints
│   │   │   ├── classes.py    # Class management (placeholder)
│   │   │   └── API_endpoint.py  # Legacy quiz generate endpoint (dummy data)
│   │   └── tools/
│   │       ├── ingest.py         # File parsing (PDF/DOCX/TXT) → vector store
│   │       ├── retrieve.py       # Context retrieval from vector store
│   │       ├── chatbot_adapter.py  # Legacy dummy quiz generator
│   │       ├── quiz.py           # Quiz tool (placeholder)
│   │       └── flashcards.py     # Flashcards tool (placeholder)
│   └── requirements.txt
├── frontend/         # Static HTML/CSS/JS single-page UI
│   ├── index.html              # Landing page
│   ├── login.html              # Login form
│   ├── signup.html             # Signup form
│   ├── dashboard.html          # Class dashboard
│   ├── class.html              # Individual class view
│   ├── quiz.html               # Quiz interface (HS & College levels)
│   ├── subject-quiz.html       # Subject-specific quiz page
│   ├── flashcards-homepage.html    # Flashcard set browser
│   ├── flashcards-individual.html  # Single flashcard set viewer
│   ├── flashcards-error-page.html  # Flashcard error state
│   ├── chatbot-class-selector.html # Class picker for chatbot
│   ├── chatbot-interface.html      # Chat UI
│   ├── script.js               # Auth logic (login/signup/session)
│   ├── js/
│   │   ├── api.js              # Backend fetch helper (stub)
│   │   ├── chat.js             # Chat tab logic (stub)
│   │   ├── quiz.js             # Quiz tab logic (stub)
│   │   ├── flashcards.js       # Flashcards tab logic (stub)
│   │   ├── classes.js          # Dashboard class list logic (stub)
│   │   ├── chatbot-interface.js    # Chat UI controller
│   │   └── chatbot-class-selector.js  # Class selector UI controller
│   ├── css/
│   │   ├── styles.css
│   │   ├── chatbot-interface.css
│   │   └── chatbot-class-selector.css
│   └── style.css
└── shared/
    └── types.py        # Shared data types (placeholder)
```

## Dependencies

- **Python 3.11+**
- **FastAPI** — REST framework
- **Uvicorn** — ASGI server
- **OpenAI SDK** — Embeddings and LLM calls (via Agents SDK)
- **psycopg2** — PostgreSQL/Supabase connection
- **pypdf / python-docx** — Document parsing
- **Supabase** — Hosted Postgres with pgvector extension (production vector store)

## Environment Variables

Copy `artifacts/.env.example` to `artifacts/.env` and fill in:

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key for embeddings and chat completions |
| `VECTOR_BACKEND` | `supabase` (default) or `local` |
| `SUPABASE_DB_URL` | Postgres connection string for Supabase |
| `EMBEDDING_MODEL` | OpenAI embedding model (default: `text-embedding-3-small`) |
| `EMBEDDING_DIMENSIONS` | Embedding vector size (default: `1536`) |

## Getting Started

```bash
# 1. Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r artifacts/backend/requirements.txt

# 3. Configure environment
cp artifacts/.env.example artifacts/.env
# Edit artifacts/.env with your keys

# 4. Run the backend
cd artifacts/backend
uvicorn app.main:app --reload

# 5. Open the frontend
# Open artifacts/frontend/index.html in a browser
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

## Data Flow

1. **Ingest** — Student uploads files → `ingest.py` extracts text → `vector_store.py` chunks and embeds text → stored in Supabase pgvector (or local JSON fallback)
2. **Chat / Flashcard / Quiz** — Student sends a request → `agent.py` retrieves relevant chunks via `retrieve.py` → builds a system prompt from `prompts.py` → calls OpenAI Agent → returns structured response
3. **Quiz Submission** — Student submits answers → `quizzes.py` scores against stored correct answers → returns results with explanations

## Known Limitations

- Chat sessions and quiz/flashcard data are stored in-memory (lost on server restart). Database persistence is not yet implemented for these resources.
- Frontend auth uses `localStorage` only — no backend authentication.
- `classes.py`, `quiz.py` (tool), `flashcards.py` (tool), `api.js`, `chat.js`, `quiz.js`, `flashcards.js`, and `classes.js` are stubs/placeholders.
- `API_endpoint.py` and `chatbot_adapter.py` contain legacy dummy data and are not integrated with the main agent pipeline.
- CORS is set to allow all origins (`*`); this must be restricted for production.

## Ownership

Team 16
