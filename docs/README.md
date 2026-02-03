# Study Buddy

LLM-powered study app that helps students learn through interactive chat, flashcards, and quizzes.

## Project Overview

Study Buddy is a full-stack application that uses AI to help students study more effectively. It allows students to:
- Create and manage study classes
- Chat with an AI tutor about their course materials
- Generate flashcards from uploaded documents
- Take AI-generated quizzes to test their knowledge

The application consists of three main components:
1. **Frontend** - HTML/CSS/JavaScript interface
2. **Backend** - FastAPI server that handles API requests
3. **MCP Server** - Model Context Protocol server that provides AI-powered tools

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
│   │   ├── orchestrator.py         # LLM "brain" that chooses MCP tools
│   │   │                           # Decides which tools to call based on user input
│   │   │                           # Coordinates between LLM and MCP server
│   │   │
│   │   ├── mcp_client.py           # Client for calling MCP tool server
│   │   │                           # Communicates with the MCP server
│   │   │                           # Sends tool requests and receives results
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
├── mcp/                            # MCP tool server (Python)
│   ├── server.py                   # MCP server entry + tool registration
│   │                               # Starts the MCP server
│   │                               # Registers all available tools
│   │
│   ├── tools/
│   │   ├── ingest.py               # Tool: ingest + embed documents
│   │   │                           # Processes uploaded documents
│   │   │                           # Creates embeddings and stores in vector DB
│   │   │
│   │   ├── retrieve.py             # Tool: retrieve chunks from vector DB
│   │   │                           # Searches vector database
│   │   │                           # Returns relevant document chunks
│   │   │
│   │   ├── flashcards.py           # Tool: generate flashcards (strict JSON)
│   │   │                           # Creates flashcard sets from content
│   │   │                           # Returns structured JSON output
│   │   │
│   │   └── quiz.py                 # Tool: generate quizzes (strict JSON)
│   │                               # Creates quiz questions from content
│   │                               # Returns structured JSON output
│   │
│   ├── schemas/
│   │   ├── flashcards.py           # Flashcard output schema
│   │   │                           # Pydantic model for flashcard structure
│   │   │
│   │   └── quiz.py                 # Quiz output schema
│   │                               # Pydantic model for quiz structure
│   │
│   ├── vector_store.py             # Vector database wrapper
│   │                               # Abstracts vector DB operations
│   │                               # Handles embeddings storage and retrieval
│   │
│   └── requirements.txt            # MCP server Python dependencies
│                                   # MCP SDK, vector DB client, embeddings lib
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

3. **Install MCP Server Dependencies**
   ```bash
   cd artifacts/mcp
   pip install -r requirements.txt
   ```

4. **Run the Application**
   ```bash
   # Terminal 1 - Start MCP server
   cd artifacts/mcp
   python server.py

   # Terminal 2 - Start backend
   cd artifacts/backend
   python run.py

   # Terminal 3 - Serve frontend (or open index.html in browser)
   cd artifacts/frontend
   python -m http.server 8000
   ```

5. **Access the Application**
   Open your browser to `http://localhost:8000`

## Architecture

### Frontend
- Pure HTML/CSS/JavaScript (no framework required)
- Single-page application with tab-based navigation
- Communicates with backend via REST API

### Backend (FastAPI)
- REST API endpoints for frontend
- Orchestrates LLM interactions
- Manages communication with MCP server
- Handles business logic and data validation

### MCP Server
- Provides specialized tools for the LLM
- Document ingestion and embedding
- Vector database operations
- Structured output generation (flashcards, quizzes)

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python 3.10+, FastAPI, Pydantic
- **MCP Server**: Python 3.10+, MCP SDK
- **AI/ML**: OpenAI API (or compatible), Vector Database
- **Data Storage**: Vector DB for embeddings, JSON for class data