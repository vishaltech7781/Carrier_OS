"""
Personalized Career Roadmap Generator
Generates weekly actionable tasks tailored to student skill gaps and available study hours.
"""

import uuid
from typing import List, Dict, Any
from app.core.config import ROLE_BENCHMARKS, SKILL_TAXONOMY
from app.schemas.roadmap import (
    RoadmapGenerateRequest,
    RoadmapGenerateResponse,
    RoadmapWeekItem,
    RoadmapTaskItem,
)

RESOURCE_DIRECTORY: Dict[str, Dict[str, str]] = {
    "typescript": {
        "title": "TypeScript Handbook & Practical Type System",
        "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
        "type": "Docs"
    },
    "react": {
        "title": "React.dev: Modern State, Hooks & Component Architecture",
        "url": "https://react.dev/learn",
        "type": "Docs"
    },
    "node.js": {
        "title": "Node.js Architecture & Asynchronous Event Loop Guide",
        "url": "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs",
        "type": "Docs"
    },
    "express": {
        "title": "Express.js RESTful API Design & Middleware Pipeline",
        "url": "https://expressjs.com/en/starter/installing.html",
        "type": "Docs"
    },
    "mongodb": {
        "title": "MongoDB University: Data Modeling & Aggregation Pipelines",
        "url": "https://learn.mongodb.com/",
        "type": "Practice"
    },
    "sql": {
        "title": "SQL Practice: Multi-Table Joins, Indexing & Query Plans",
        "url": "https://sqlzoo.net/",
        "type": "Practice"
    },
    "docker": {
        "title": "Docker Getting Started: Multi-stage Builds & Compose",
        "url": "https://docs.docker.com/get-started/",
        "type": "Hands-on Project"
    },
    "redis": {
        "title": "Redis University: In-Memory Caching & Session Patterns",
        "url": "https://university.redis.com/",
        "type": "Practice"
    },
    "dsa": {
        "title": "NeetCode 150 & Core Algorithm Patterns",
        "url": "https://neetcode.io/practice",
        "type": "Practice"
    },
    "system design": {
        "title": "System Design Primer by Donne Martin",
        "url": "https://github.com/donnemartin/system-design-primer",
        "type": "Docs"
    },
    "git": {
        "title": "Pro Git Book: Branching Strategies & Interactive Rebasing",
        "url": "https://git-scm.com/book/en/v2",
        "type": "Docs"
    },
    "unit testing": {
        "title": "Vitest / Jest Testing Guide: Mocking & Coverage",
        "url": "https://vitest.dev/guide/",
        "type": "Hands-on Project"
    },
    "rest api": {
        "title": "RESTful API Guidelines & HTTP Status Code Semantics",
        "url": "https://restfulapi.net/",
        "type": "Docs"
    },
}

def generate_custom_roadmap(req: RoadmapGenerateRequest) -> RoadmapGenerateResponse:
    """Generate structured multi-week career roadmap addressing specific student gaps"""
    role_key = req.target_role.strip().lower()
    benchmark = ROLE_BENCHMARKS.get(role_key, ROLE_BENCHMARKS["full stack developer"])
    role_required = benchmark["required"]

    current_skills_set = {s.lower().strip() for s in req.current_skills}
    # Prioritize missing required skills
    gaps_to_cover = [s for s in role_required if s not in current_skills_set]

    # If student already knows everything required, add preferred skills
    if not gaps_to_cover:
        gaps_to_cover = [s for s in benchmark["preferred"] if s not in current_skills_set]

    # If still few gaps, add standard DSA & System Design
    if "dsa" not in gaps_to_cover and "dsa" not in current_skills_set:
        gaps_to_cover.append("dsa")
    if "system design" not in gaps_to_cover:
        gaps_to_cover.append("system design")

    weeks_count = max(4, min(12, req.timeline_weeks))
    weekly_hours = max(5, min(40, req.available_hours_per_week))

    weeks: List[RoadmapWeekItem] = []
    total_hours = 0

    themes = [
        "Core Skill Gaps & Fundamental Deep Dive",
        "Architectural Patterns & Hands-on Implementation",
        "Data Persistence, Caching & Performance Optimization",
        "Containerization, Testing & CI/CD Pipeline",
        "System Scalability & Advanced Algorithmic Patterns",
        "Mock Interview Drills, Portfolio Finalization & Production Readiness",
    ]

    for w_idx in range(weeks_count):
        week_num = w_idx + 1
        theme = themes[w_idx % len(themes)]
        week_tasks: List[RoadmapTaskItem] = []
        allocated_hours = 0

        # Assign 2 to 3 tasks per week
        for task_idx in range(2):
            skill_focus = gaps_to_cover[(w_idx * 2 + task_idx) % len(gaps_to_cover)] if gaps_to_cover else "DSA"
            resource_info = RESOURCE_DIRECTORY.get(
                skill_focus,
                {
                    "title": f"Comprehensive {skill_focus.title()} Engineering Guide",
                    "url": "https://developer.mozilla.org/",
                    "type": "Docs"
                }
            )

            est_hours = round(weekly_hours / 2)
            allocated_hours += est_hours

            category = SKILL_TAXONOMY.get(skill_focus, {}).get("category", "Software Engineering")
            task_title = f"Master {skill_focus.title()}: Concepts & Practical Implementation"
            task_desc = f"Study core {skill_focus.title()} patterns, construct a standalone module with clean typing, and verify edge cases."

            week_tasks.append(RoadmapTaskItem(
                id=str(uuid.uuid4())[:8],
                title=task_title,
                description=task_desc,
                related_skill=skill_focus.title(),
                category=category,
                priority="high" if task_idx == 0 else "medium",
                estimated_hours=est_hours,
                prerequisites=[],
                recommended_resource_title=resource_info["title"],
                recommended_resource_url=resource_info["url"],
                recommended_resource_type=resource_info["type"],
                is_completed=False
            ))

        weeks.append(RoadmapWeekItem(
            week_number=week_num,
            focus_theme=f"Week {week_num}: {theme}",
            total_hours=allocated_hours,
            tasks=week_tasks
        ))
        total_hours += allocated_hours

    summary = (
        f"Custom {weeks_count}-week structured plan tailored for {req.target_role}. "
        f"Addresses {len(gaps_to_cover)} identified skill gaps with {weekly_hours} hours/week allocated."
    )

    return RoadmapGenerateResponse(
        target_role=req.target_role,
        timeline_weeks=weeks_count,
        total_planned_hours=total_hours,
        weeks=weeks,
        summary_advice=summary
    )

