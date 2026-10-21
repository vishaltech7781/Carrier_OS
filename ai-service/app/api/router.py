"""
FastAPI Router exposing CareerOS AI intelligence endpoints
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.core.config import SKILL_TAXONOMY, ROLE_BENCHMARKS
from app.schemas.resume import ResumeParseRequest, ResumeParseResponse
from app.schemas.job import JobAnalyzeRequest, JobAnalyzeResponse
from app.schemas.roadmap import RoadmapGenerateRequest, RoadmapGenerateResponse
from app.schemas.interview import InterviewEvaluateRequest, InterviewEvaluateResponse
from app.services.resume_parser import (
    parse_resume_content,
    extract_text_from_pdf,
)
from app.services.job_analyzer import analyze_job_posting
from app.services.roadmap_generator import generate_custom_roadmap
from app.services.interview_evaluator import evaluate_answer_heuristics

api_router = APIRouter()

@api_router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "careeros-ai-microservice",
        "version": "1.0.0",
        "taxonomy_skills_count": len(SKILL_TAXONOMY),
        "supported_roles": list(ROLE_BENCHMARKS.keys())
    }

@api_router.get("/taxonomy/skills")
def get_skills_taxonomy():
    return {
        "count": len(SKILL_TAXONOMY),
        "skills": SKILL_TAXONOMY
    }

@api_router.get("/taxonomy/roles")
def get_role_benchmarks():
    return {
        "roles": ROLE_BENCHMARKS
    }

@api_router.post("/resume/parse-text", response_model=ResumeParseResponse)
def parse_resume_text(req: ResumeParseRequest):
    if not req.raw_text or not req.raw_text.strip():
        raise HTTPException(status_code=400, detail="Empty resume text provided.")
    return parse_resume_content(req.raw_text, req.file_name)

@api_router.post("/resume/parse-file", response_model=ResumeParseResponse)
async def parse_resume_file(file: UploadFile = File(...)):
    filename = file.filename or "resume.pdf"
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if filename.lower().endswith(".pdf"):
        try:
            raw_text = extract_text_from_pdf(content)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Failed to extract text from PDF: {str(e)}")
    else:
        # Fallback to UTF-8 text decode
        try:
            raw_text = content.decode("utf-8", errors="ignore")
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Unsupported file format: {str(e)}")

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="No readable text extracted from document.")

    return parse_resume_content(raw_text, filename)

@api_router.post("/job/analyze", response_model=JobAnalyzeResponse)
def analyze_job(req: JobAnalyzeRequest):
    if not req.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")
    return analyze_job_posting(req)

@api_router.post("/roadmap/generate", response_model=RoadmapGenerateResponse)
def generate_roadmap(req: RoadmapGenerateRequest):
    return generate_custom_roadmap(req)

@api_router.post("/interview/evaluate", response_model=InterviewEvaluateResponse)
def evaluate_interview(req: InterviewEvaluateRequest):
    if not req.student_answer.strip():
        raise HTTPException(status_code=400, detail="Student answer cannot be empty.")
    return evaluate_answer_heuristics(req)

