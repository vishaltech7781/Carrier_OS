from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ExtractedSkill(BaseModel):
    name: str
    category: str
    canonical: str
    confidence: float
    evidence_snippet: Optional[str] = None

class ExtractedProject(BaseModel):
    title: str
    description: str
    technologies: List[str] = []
    impact_metrics: List[str] = []

class ExtractedEducation(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    year: Optional[str] = None
    grade: Optional[str] = None

class ExtractedWorkExperience(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    duration: Optional[str] = None
    highlights: List[str] = []

class ResumeParseRequest(BaseModel):
    raw_text: Optional[str] = None
    file_name: Optional[str] = None

class ResumeParseResponse(BaseModel):
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    education: List[ExtractedEducation] = []
    experience: List[ExtractedWorkExperience] = []
    projects: List[ExtractedProject] = []
    skills: List[ExtractedSkill] = []
    skills_by_category: Dict[str, List[str]] = {}
    completeness_score: int
    completeness_reasons: List[str] = []
    strengths: List[str] = []
    improvement_recommendations: List[str] = []
    raw_character_count: int

