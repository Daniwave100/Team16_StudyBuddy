# Known Limitations & Technical Debt

This document lists known issues, limitations, and technical debt as of Sprint 9 final delivery. Items are categorized by severity and include suggested next steps.

---

## Critical / Blocking for Production

### 1. All data is in-memory only
**What:** Chat sessions, quiz sets, flashcard sets, and submission history are stored in Python dicts in memory. All data is lost on every server restart.

**Why:** SQLAlchemy ORM models are fully defined in `models/database.py` and the `db.py` setup exists, but the routes never call `db.add()` / `db.commit()`. In-memory dicts were used as a development shortcut.

**Next steps:** Wire the existing SQLAlchemy models into each route — replace `in_memory_store` dicts with actual DB session operations. `DATABASE_URL` defaults to SQLite so no infrastructure change is needed to start.

---

### 2. No backend authentication
**What:** All `/api/*` endpoints are publicly accessible with no token or session validation. Anyone who can reach the server can read, write, or delete any data.

**Why:** Auth was scoped to the frontend using Supabase Auth. Backend auth integration was deferred.

**Next steps:** Add a FastAPI dependency that validates Supabase JWTs on each request. Supabase issues standard JWTs — verify with the Supabase public key and inject the user identity into route handlers.

---

### 3. CORS allows all origins
**What:** `main.py` sets `allow_origins=["*"]`, meaning any website can make requests to the API.

**Next steps:** Replace `"*"` with the specific frontend origin(s) before any public deployment.

---

## Moderate

### 4. Frontend JS modules are stubs
**What:** `js/api.js`, `js/chat.js`, `js/quiz.js`, `js/flashcards.js`, and `js/classes.js` are empty or placeholder files. The working frontend pages (`chatbot-interface.html`, `quiz.html`, `flashcards-homepage.html`) use inline or separate controller scripts instead.

**Next steps:** Either flesh out the modular JS files and connect them to the backend via `api.js`, or remove the stubs and consolidate the working controller scripts.

---

### 5. Legacy / duplicate files in backend
**What:** `routes/API_endpoint.py` (a legacy quiz endpoint with a `random` import bug), `tools/chatbot_adapter.py` (dummy hardcoded data), `run.py`, and a duplicate `API_endpoint.py` at the backend root are not integrated into the main application.

**Next steps:** Delete unused files or move them to an `archive/` directory to reduce confusion.

---

### 6. Flashcard filenames with typos
**What:** `flashcards-indivdual.html` (missing 'i') exists alongside `flashcards-individual.html`. Old versions (`-old.html`) are also checked in.

**Next steps:** Delete the typo'd and `-old` files; confirm all links point to the correct files.

---

## Minor / Future Improvements

### 7. No test suite
**What:** There are no automated tests — no unit tests, integration tests, or end-to-end tests.

**Next steps:** Add `pytest` + `httpx` for FastAPI route integration tests. Start with the ingest and chat endpoints as they are the most critical.

---

### 8. Vector store has no class isolation for local backend
**What:** When `VECTOR_BACKEND=local`, the JSON file stores all chunks together. Retrieval does filter by `class_id`, but there's no index — it scans all chunks linearly.

**Next steps:** For production, use Supabase (`VECTOR_BACKEND=supabase`) which handles this efficiently. The local backend is intended for development only.

---

### 9. No file size or type validation on ingest
**What:** The `/api/ingest` endpoint accepts any file. Unsupported types will cause a silent failure or stack trace.

**Next steps:** Add explicit MIME type and file size validation at the route level before passing to `ingest.py`.

---

### 10. Supabase Auth not enforcing class ownership
**What:** The frontend authenticates users via Supabase, but there is no relationship between a user's identity and the classes/data they can access. Any `class_id` can be passed to any endpoint.

**Next steps:** After adding backend auth (#2 above), scope all queries to the authenticated user's ID.

---

## QA Summary (Sprint 9)

| Flow | Status | Notes |
|------|--------|-------|
| Signup / Login | Passing | Supabase Auth works; localStorage session persists |
| Document Upload | Passing | PDF, DOCX, TXT ingest and chunk correctly |
| Flashcard Generation | Passing | AI returns structured flashcard JSON |
| Quiz Generation | Passing | AI returns structured quiz JSON with explanations |
| Quiz Submission + Scoring | Passing | Score calculated correctly |
| Semantic Chat | Passing | Retrieves relevant chunks; context-aware responses |
| Data persistence across restart | Known issue | In-memory only — see item #1 above |
| Backend auth | Known issue | No token validation — see item #2 above |
