"""
Unit tests for CareerOS AI Microservice
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.resume_parser import parse_resume_content, extract_skills_from_text
from app.services.job_analyzer import analyze_job_posting
from app.schemas.job import JobAnalyzeRequest
from app.services.roadmap_generator import generate_custom_roadmap
from app.schemas.roadmap import RoadmapGenerateRequest
from app.services.interview_evaluator import evaluate_answer_heuristics
from app.schemas.interview import InterviewEvaluateRequest

def test_resume_extraction():
    text = """
    Jane Doe
    jane.doe@example.com | +1 555-019-2831
    Education: BS Computer Science
    Technical Skills: Python, TypeScript, React, Docker, PostgreSQL, Redis, Git
    Projects:
    Distributed Cache: Engineered custom caching layer using Redis and Python.
    """
    res = parse_resume_content(text)
    assert res.candidate_name == "Jane Doe"
    assert res.email == "jane.doe@example.com"
    skills = [s.name.lower() for s in res.skills]
    assert "python" in skills
    assert "react" in skills
    assert "docker" in skills
    assert res.completeness_score > 50

def test_job_analyzer_matching():
    req = JobAnalyzeRequest(
        job_title="Backend Engineer",
        job_description="Requirements: Node.js, Express, PostgreSQL, Redis, Docker.\nPreferred: Kubernetes, AWS.",
        candidate_skills=["Node.js", "Express", "PostgreSQL", "Git"]
    )
    res = analyze_job_posting(req)
    assert res.match_percentage > 0
    assert "Redis" in res.missing_required_skills
    assert "Docker" in res.missing_required_skills
    assert len(res.actionable_prep_steps) > 0

def test_roadmap_generation():
    req = RoadmapGenerateRequest(
        target_role="Full Stack Developer",
        current_skills=["HTML", "CSS", "JavaScript"],
        missing_skills=["React", "TypeScript", "Node.js", "SQL", "Docker"],
        available_hours_per_week=15,
        timeline_weeks=6
    )
    res = generate_custom_roadmap(req)
    assert len(res.weeks) == 6
    assert res.total_planned_hours > 50
    assert all(len(w.tasks) > 0 for w in res.weeks)

def test_interview_evaluator_concept_grounding():
    req = InterviewEvaluateRequest(
        role="Backend Engineer",
        interview_type="backend",
        question="How does the Node.js event loop handle asynchronous I/O?",
        student_answer="Node.js utilizes an event loop on top of libuv. It is non-blocking and delegates I/O calls to the kernel or worker pool, triggering callbacks upon completion."
    )
    res = evaluate_answer_heuristics(req)
    assert res.overall_score >= 50
    assert res.technical_accuracy >= 50
    assert len(res.positive_observations) > 0
    assert res.evaluation_method == "Deterministic Concept Grounding & Heuristics"

if __name__ == "__main__":
    test_resume_extraction()
    test_job_analyzer_matching()
    test_roadmap_generation()
    test_interview_evaluator_concept_grounding()
    print("All AI service tests passed successfully!")

