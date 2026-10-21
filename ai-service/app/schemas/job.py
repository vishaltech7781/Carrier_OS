from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SkillMatchItem(BaseModel):
    skill: str
    category: str
    status: str  # "matched", "missing", "partially_evidenced"
    weight: float
    evidence: Optional[str] = None

class JobAnalyzeRequest(BaseModel):
    job_title: str
    company: Optional[str] = None
    job_description: str
    candidate_skills: List[str] = []
    candidate_projects: List[Dict[str, Any]] = []
    candidate_experience_years: Optional[float] = 0.0

class JobAnalyzeResponse(BaseModel):
    job_title: str
    company: Optional[str] = None
    extracted_required_skills: List[str] = []
    extracted_preferred_skills: List[str] = []
    extracted_responsibilities: List[str] = []
    required_matches: List[SkillMatchItem] = []
    preferred_matches: List[SkillMatchItem] = []
    missing_required_skills: List[str] = []
    missing_preferred_skills: List[str] = []
    match_percentage: int
    readiness_level: str  # "Ready to Apply", "Needs Preparation", "Significant Gaps"
    scoring_rationale: str
    actionable_prep_steps: List[str] = []

