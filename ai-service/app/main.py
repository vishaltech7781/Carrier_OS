"""
CareerOS AI Microservice Entrypoint
FastAPI application providing deterministic NLP, skill extraction, matching, and roadmap generation.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import PORT, HOST

app = FastAPI(
    title="CareerOS AI Microservice",
    description="Career Intelligence, Resume Parsing, Job Description Analysis & Roadmap Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "service": "CareerOS AI Microservice",
        "status": "online",
        "docs": "/docs",
        "health": "/api/v1/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)

