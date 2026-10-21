from pydantic import BaseModel
from typing import List, Optional

class RoadmapTaskItem(BaseModel):
    id: str
    title: str
    description: str
    related_skill: str
    category: str
    priority: str  # "high", "medium", "low"
    estimated_hours: int
    prerequisites: List[str] = []
    recommended_resource_title: str
    recommended_resource_url: str
    recommended_resource_type: str  # "Docs", "Hands-on Project", "Practice", "Video"
    is_completed: bool = False

class RoadmapWeekItem(BaseModel):
    week_number: int
    focus_theme: str
    total_hours: int
    tasks: List[RoadmapTaskItem] = []

class RoadmapGenerateRequest(BaseModel):
    target_role: str
    current_skills: List[str]
    missing_skills: List[str]
    available_hours_per_week: int = 15
    timeline_weeks: int = 6
    focus_areas: Optional[List[str]] = None

class RoadmapGenerateResponse(BaseModel):
    target_role: str
    timeline_weeks: int
    total_planned_hours: int
    weeks: List[RoadmapWeekItem] = []
    summary_advice: str

