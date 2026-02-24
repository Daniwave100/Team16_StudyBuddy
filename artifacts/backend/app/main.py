"""FastAPI app entry point.

Import routers from app.routes and create the app instance here.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import study, quizzes

app = FastAPI(title="StudyBuddy API", version="1.0.0")

# CORS configuration - adjust origins as needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(study.router, prefix="/api", tags=["study"])
app.include_router(quizzes.router, prefix="/api", tags=["quizzes"])

@app.get("/")
async def root():
    return {"message": "StudyBuddy API", "status": "running"}