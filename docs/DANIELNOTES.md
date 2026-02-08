### General Notes
- work on "working backwards"
    - develop overall programming intuition by building key function then seeing what parameters it requires, etc. and keep going


### General Agent Functionality

User uploads files → chunks + embeddings → stored in vector store
                                                    ↓
Frontend sends request → Route → agent → queries vector store
                                                    ↓
                                        retrieves relevant chunks
                                                    ↓
                                        injects into system prompt
                                                    ↓
                                        calls OpenAI → response


### How "mode" Flows from Frontend to Agent
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND (JavaScript)                                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  User clicks "Chat" tab                                             │
│    ↓                                                                │
│  chat.js calls api.js:                                              │
│    fetch('/api/study/chat', {                                       │
│      method: 'POST',                                                │
│      body: JSON.stringify({                                         │
│        class_id: "123",                                             │
│        message: "Explain photosynthesis",                           │
│        mode: "chat"  ←────────────────── mode set here             │
│      })                                                             │
│    })                                                               │
│                                                                     │
│  User clicks "Flashcards" tab                                       │
│    ↓                                                                │
│  flashcards.js calls api.js:                                        │
│    fetch('/api/study/flashcards', {                                 │
│      method: 'POST',                                                │
│      body: JSON.stringify({                                         │
│        class_id: "123",                                             │
│        focus: "chapter 3",                                          │
│        mode: "flashcards"  ←────────────── mode set here           │
│      })                                                             │
│    })                                                               │
│                                                                     │
│  User clicks "Quiz" tab                                             │
│    ↓                                                                │
│  quiz.js calls api.js:                                              │
│    fetch('/api/study/quiz', {                                       │
│      method: 'POST',                                                │
│      body: JSON.stringify({                                         │
│        class_id: "123",                                             │
│        focus: "final exam prep",                                    │
│        mode: "quiz"  ←──────────────────── mode set here           │
│      })                                                             │
│    })                                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND (FastAPI)                                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  artifacts/backend/app/routes/study.py                              │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                                                               │ │
│  │  @router.post("/chat")                                        │ │
│  │  def chat(request: ChatRequest):                              │ │
│  │      mode = request.mode  ←───────────── extracted from JSON  │ │
│  │      result = agent.run(                                      │ │
│  │          mode=mode,           ←────────── passed to agent.    │ │
│  │          class_id=request.class_id,                           │ │
│  │          message=request.message                              │ │
│  │      )                                                        │ │
│  │      return result                                            │ │
│  │                                                               │ │
│  │  @router.post("/flashcards")                                  │ │
│  │  def flashcards(request: FlashcardRequest):                   │ │
│  │      mode = request.mode  ←───────────── extracted from JSON  │ │
│  │      result = agent.run(                               │ │
│  │          mode=mode,           ←────────── passed to agent.  . │ │
│  │          class_id=request.class_id,                           │ │
│  │          focus=request.focus                                  │ │
│  │      )                                                        │ │
│  │      return result                                            │ │
│  │                                                               │ │
│  │  @router.post("/quiz")                                        │ │
│  │  def quiz(request: QuizRequest):                              │ │
│  │      mode = request.mode  ←───────────── extracted from JSON  │ │
│  │      result = agent.run(                               │ │
│  │          mode=mode,           ←────────── passed to agent.    │ │
│  │          class_id=request.class_id,                           │ │
│  │          focus=request.focus                                  │ │
│  │      )                                                        │ │
│  │      return result                                            │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│ AGENT                                                               │
│ artifacts/backend/app/agent.py                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  def run(mode, class_id, message=None, focus=None):                │
│                                                                     │
│      # Step 1: Pick the right system prompt based on mode          │
│      if mode == "chat":                                             │
│          system_prompt = CHAT_PROMPT                                │
│      elif mode == "flashcards":                                     │
│          system_prompt = FLASHCARDS_PROMPT                          │
│      elif mode == "quiz":                                           │
│          system_prompt = QUIZ_PROMPT                                │
│                                                                     │
│      # Step 2: Retrieve relevant chunks from vector store          │
│      chunks = vector_store.retrieve(class_id, message or focus)    │
│                                                                     │
│      # Step 3: Inject chunks into system prompt                    │
│      final_prompt = system_prompt.format(                           │
│          class_name=get_class_name(class_id),                       │
│          retrieved_chunks=chunks,                                   │
│          user_focus_prompt=focus or ""                              │
│      )                                                              │
│                                                                     │
│      # Step 4: Call OpenAI                                          │
│      response = openai_client.chat.completions.create(              │
│          model="gpt-4",                                             │
│          messages=[                                                 │
│              {"role": "system", "content": final_prompt},           │
│              {"role": "user", "content": message or focus}          │
│          ]                                                          │
│      )                                                              │
│                                                                     │
│      # Step 5: Return response                                      │
│      return response.choices[0].message.content                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                                