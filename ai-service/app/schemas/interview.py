from pydantic import BaseModel
from typing import List, Optional

class InterviewEvaluateRequest(BaseModel):
    role: str
    interview_type: str  # "technical", "dsa", "backend", "frontend", "system_design", "behavioral"
    question: str
    student_answer: str
    ideal_concepts: Optional[List[str]] = []
    difficulty: Optional[str] = "Intermediate"

class DimensionScore(BaseModel):
    dimension: str
    score: int  # 0 to 100
    commentary: str

class InterviewEvaluateResponse(BaseModel):
    overall_score: int  # 0 to 100
    technical_accuracy: int
    completeness: int
    communication_clarity: int
    dimensions: List[DimensionScore] = []
    positive_observations: List[str] = []
    missing_key_concepts: List[str] = []
    suggested_improvements: List[str] = []
    recommended_model_answer_outline: str
    evaluation_method: str = "Deterministic NLP Heuristic with Concept Grounding"

