# Study Buddy

LLM-powered study app that helps students learn through interactive chat, flashcards, and quizzes.

## Project Overview

Study Buddy is a full-stack application that uses AI to help students study more effectively. It allows students to:

- Create and manage study classes
- Chat with an AI tutor about their course materials
- Generate flashcards from uploaded documents
- Take AI-generated quizzes to test their knowledge

The application consists of two main components:

1. **Frontend** - HTML/CSS/JavaScript interface
2. **Backend** - FastAPI server that handles API requests and agent logic

## File Structure

```
artifacts/
├── .env.example                    # Environment variable template
│                                   # Copy to .env and fill in API keys and configuration
│
├── frontend/                       # Frontend (HTML / CSS / JavaScript)
│   ├── index.html                  # Dashboard page - displays list of classes
│   │                               # Main entry point for the application
│   │
│   ├── class.html                  # Single class page with tabs for:
│   │                               # - Chat with AI tutor
│   │                               # - Flashcard review
│   │                               # - Quiz mode
│   │
│   ├── css/
│   │   └── styles.css              # Global frontend styles
│   │                               # All CSS styling for the application
│   │
│   ├── js/
│   │   ├── api.js                  # Helper for fetch() calls to backend
│   │   │                           # Centralizes all API communication
│   │   │
│   │   ├── classes.js              # Dashboard logic (load/create classes)
│   │   │                           # Handles class list display and creation
│   │   │
│   │   ├── chat.js                 # Chat tab logic
│   │   │                           # Manages chat interface and messages
│   │   │
│   │   ├── flashcards.js           # Flashcards tab logic
│   │   │                           # Handles flashcard display and navigation
│   │   │
│   │   └── quiz.js                 # Quiz tab logic
│   │                               # Manages quiz questions and scoring
│   │
│   └── assets/                     # Images, icons, fonts
│                                   # Static assets for the UI
│
├── backend/                        # Python backend (FastAPI)
│   ├── app/                        # Application source code
│   │   ├── main.py                 # FastAPI app entry point
│   │   │                           # Initializes the FastAPI application
│   │   │                           # Sets up CORS, routes, and middleware
│   │   │
│   │   ├── routes/
│   │   │   ├── classes.py          # Class-related API endpoints
│   │   │   │                       # GET /classes - list all classes
│   │   │   │                       # POST /classes - create new class
│   │   │   │                       # GET /classes/{id} - get class details
│   │   │   │
│   │   │   └── study.py            # Chat / flashcards / quiz endpoints
│   │   │                           # POST /chat - send chat message
│   │   │                           # POST /flashcards - generate flashcards
│   │   │                           # POST /quiz - generate quiz questions
│   │   │
│   │   ├── orchestrator.py         # Simple agent orchestrator
│   │   │                           # Simple agent flow used by /chat
│   │   │
│   │   ├── vector_store.py         # In-memory store for notes and chunks
│   │   │                           # Placeholder for future DB/vector store
│   │   │
│   │   ├── tools/                  # In-process tools used by the agent
│   │   │   ├── ingest.py           # Ingest notes into the store
│   │   │   ├── retrieve.py         # Retrieve relevant chunks
│   │   │   ├── flashcards.py       # Generate simple flashcards
│   │   │   └── quiz.py             # Generate simple quiz questions
│   │   │
│   │   ├── models/
│   │   │   ├── requests.py         # Request schemas (Pydantic)
│   │   │   │                       # Defines structure for incoming API requests
│   │   │   │
│   │   │   └── responses.py        # Response schemas (Pydantic)
│   │   │                           # Defines structure for API responses
│   │   │
│   │   └── config.py               # App configuration + env loading
│   │                               # Loads environment variables
│   │                               # Manages application settings
│   │
│   ├── requirements.txt            # Backend Python dependencies
│   │                               # FastAPI, Pydantic, httpx, etc.
│   │
│   └── run.py                      # Starts the FastAPI server
│                                   # Entry point to run the backend
│
└── shared/
    └── types.py                    # Shared data types (optional)
                                    # Common types used across components
```

## Getting Started

1. **Environment Setup**

   ```bash
   cp artifacts/.env.example artifacts/.env
   # Edit .env with your API keys
   ```

2. **Install Backend Dependencies**

   ```bash
   cd artifacts/backend
   pip install -r requirements.txt
   ```

3. **Run the Application**

   ```bash
   # Terminal 1 - Start backend
   cd artifacts/backend
   python run.py

   # Terminal 2 - Serve frontend (or open index.html in browser)
   cd artifacts/frontend
   python -m http.server 8000
   ```

4. **Access the Application**
   Open your browser to `http://localhost:8000`

## Architecture

### Frontend

- Pure HTML/CSS/JavaScript (no framework required)
- Single-page application with tab-based navigation
- Communicates with backend via REST API

### Backend (FastAPI)

- REST API endpoints for frontend
- Orchestrates LLM interactions
- Uses in-process tools for ingest, retrieval, flashcards, and quiz
- Handles business logic and data validation

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python 3.10+, FastAPI, Pydantic
- **AI/ML**: OpenAI API (or compatible)
- **Data Storage**: In-memory store (placeholder), JSON for class data
