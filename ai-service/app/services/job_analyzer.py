"""
Job Description Analyzer & Skill Match Engine
Uses taxonomy extraction, TF-IDF cosine similarity, and explainable weighted scoring.
"""

import re
from typing import List, Dict, Set, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.core.config import SKILL_TAXONOMY, ALIAS_LOOKUP
from app.schemas.job import (
    JobAnalyzeRequest,
    JobAnalyzeResponse,
    SkillMatchItem,
)

REQUIRED_CLUES = ["required", "must have", "qualifications", "minimum", "requirements", "essential", "core"]
PREFERRED_CLUES = ["preferred", "nice to have", "plus", "bonus", "good to have", "desired", "beneficial"]

def segment_jd_requirements(jd_text: str) -> Tuple[List[str], List[str], List[str]]:
    """Segment job description into required skills, preferred skills, and key responsibilities"""
    # Normalize and break down by lines or major clause separators
    normalized_text = jd_text.replace("\r", "\n")
    # Also separate common in-line dividers like "Preferred:" or "Required:"
    normalized_text = re.sub(r"(?i)(preferred\s*(?:skills|qualifications)?:)", r"\n\1\n", normalized_text)
    normalized_text = re.sub(r"(?i)(required\s*(?:skills|qualifications)?:)", r"\n\1\n", normalized_text)
    normalized_text = re.sub(r"(?i)(responsibilities:)", r"\n\1\n", normalized_text)

    lines = [l.strip() for l in normalized_text.split("\n") if l.strip()]
    required_skills: Set[str] = set()
    preferred_skills: Set[str] = set()
    responsibilities: List[str] = []

    current_mode = "required"  # default mode

    for line in lines:
        lower = line.lower()
        if any(c in lower for c in PREFERRED_CLUES) and not any(c in lower for c in REQUIRED_CLUES):
            current_mode = "preferred"
        elif any(c in lower for c in REQUIRED_CLUES):
            current_mode = "required"
        elif any(c in lower for c in ["responsibilities", "what you will do", "duties"]):
            current_mode = "responsibilities"

        # Check for skills in this line
        for alias, canonical in ALIAS_LOOKUP.items():
            if len(alias) <= 2:
                pattern = rf"(?:^|[\s,;/()|])({re.escape(alias)})(?:$|[\s,;/()|])"
            else:
                pattern = rf"\b{re.escape(alias)}\b"

            if re.search(pattern, lower):
                if current_mode == "preferred":
                    preferred_skills.add(canonical)
                else:
                    required_skills.add(canonical)

        if current_mode == "responsibilities" and len(line) > 20:
            responsibilities.append(line.lstrip("-*• "))

    # Ensure required takes precedence over preferred
    preferred_skills = preferred_skills - required_skills

    return list(required_skills), list(preferred_skills), responsibilities[:6]

def analyze_job_posting(req: JobAnalyzeRequest) -> JobAnalyzeResponse:
    """Analyze job requirements against student candidate profile with TF-IDF similarity"""
    required_canonical, preferred_canonical, responsibilities = segment_jd_requirements(req.job_description)

    # Candidate skills normalized
    candidate_skills_set = set()
    for s in req.candidate_skills:
        clean = s.strip().lower()
        if clean in ALIAS_LOOKUP:
            candidate_skills_set.add(ALIAS_LOOKUP[clean])
        else:
            candidate_skills_set.add(clean)

    # Format project descriptions for TF-IDF evidence
    project_corpus = []
    for p in req.candidate_projects:
        desc = p.get("description", "")
        tech = " ".join(p.get("technologies", []))
        project_corpus.append(f"{p.get('title', '')} {desc} {tech}")
    all_candidate_text = " ".join(req.candidate_skills) + " " + " ".join(project_corpus)

    # Match Required Skills
    required_matches: List[SkillMatchItem] = []
    missing_required: List[str] = []
    matched_req_count = 0

    for skill in required_canonical:
        category = SKILL_TAXONOMY.get(skill, {}).get("category", "Technical")
        skill_name = skill.title() if len(skill) > 3 else skill.upper()
        if skill in candidate_skills_set:
            matched_req_count += 1
            required_matches.append(SkillMatchItem(
                skill=skill_name,
                category=category,
                status="matched",
                weight=2.0,
                evidence="Verified in student profile skills"
            ))
        else:
            missing_required.append(skill_name)
            required_matches.append(SkillMatchItem(
                skill=skill_name,
                category=category,
                status="missing",
                weight=2.0,
                evidence=None
            ))

    # Match Preferred Skills
    preferred_matches: List[SkillMatchItem] = []
    missing_preferred: List[str] = []
    matched_pref_count = 0

    for skill in preferred_canonical:
        category = SKILL_TAXONOMY.get(skill, {}).get("category", "Technical")
        skill_name = skill.title() if len(skill) > 3 else skill.upper()
        if skill in candidate_skills_set:
            matched_pref_count += 1
            preferred_matches.append(SkillMatchItem(
                skill=skill_name,
                category=category,
                status="matched",
                weight=1.0,
                evidence="Present in profile skills"
            ))
        else:
            missing_preferred.append(skill_name)
            preferred_matches.append(SkillMatchItem(
                skill=skill_name,
                category=category,
                status="missing",
                weight=1.0,
                evidence=None
            ))

    # Explainable Weighted Score:
    # Match = (2 * matched_required + 1 * matched_preferred) / (2 * total_required + 1 * total_preferred) * 100
    total_weights = (2.0 * len(required_canonical)) + (1.0 * len(preferred_canonical))
    achieved_weights = (2.0 * matched_req_count) + (1.0 * matched_pref_count)

    if total_weights > 0:
        base_match_pct = round((achieved_weights / total_weights) * 100)
    else:
        # Fallback to TF-IDF cosine similarity between candidate profile and JD text
        try:
            vectorizer = TfidfVectorizer(stop_words="english")
            tfidf_matrix = vectorizer.fit_transform([req.job_description, all_candidate_text])
            sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            base_match_pct = min(95, max(15, round(sim * 100)))
        except Exception:
            base_match_pct = 50

    # Determine readiness level
    if base_match_pct >= 75 and len(missing_required) <= 1:
        readiness_level = "Ready to Apply"
    elif base_match_pct >= 50:
        readiness_level = "Needs Preparation"
    else:
        readiness_level = "Significant Skill Gaps"

    rationale = (
        f"Score calculated using weighted skill coverage: {matched_req_count}/{len(required_canonical)} required skills "
        f"matched (weight 2.0x) and {matched_pref_count}/{len(preferred_canonical)} preferred skills matched (weight 1.0x)."
    )

    action_steps = []
    if missing_required:
        action_steps.append(f"Priority 1: Build practical project proof for high-demand missing skills: {', '.join(missing_required[:3])}.")
    if missing_preferred:
        action_steps.append(f"Priority 2: Review foundational concepts for preferred topics: {', '.join(missing_preferred[:3])}.")
    action_steps.append("Tailor your resume project bullet points to highlight direct engineering contributions matching these responsibilities.")

    return JobAnalyzeResponse(
        job_title=req.job_title,
        company=req.company,
        extracted_required_skills=[s.title() for s in required_canonical],
        extracted_preferred_skills=[s.title() for s in preferred_canonical],
        extracted_responsibilities=responsibilities,
        required_matches=required_matches,
        preferred_matches=preferred_matches,
        missing_required_skills=missing_required,
        missing_preferred_skills=missing_preferred,
        match_percentage=base_match_pct,
        readiness_level=readiness_level,
        scoring_rationale=rationale,
        actionable_prep_steps=action_steps
    )
