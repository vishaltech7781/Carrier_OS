"""
Deterministic NLP Interview Evaluator Service
Transparent, explainable grading based on concept grounding, terminology coverage, and structural clarity.
"""

import re
from typing import List, Dict, Any, Optional
from app.schemas.interview import (
    InterviewEvaluateRequest,
    InterviewEvaluateResponse,
    DimensionScore,
)

# Domain Concept Bank for Grounded Heuristics
DOMAIN_CONCEPTS = {
    "node": ["event loop", "non-blocking", "asynchronous", "single threaded", "libuv", "callbacks", "promises", "stream"],
    "backend": ["rest api", "database", "orm", "authentication", "caching", "middleware", "latency", "scalability"],
    "frontend": ["component", "virtual dom", "state management", "react", "rendering", "responsive", "css", "props"],
    "rest": ["stateless", "http methods", "get", "post", "put", "delete", "status codes", "idempotent", "resource", "json"],
    "react": ["virtual dom", "reconciliation", "hooks", "useeffect", "usestate", "state", "props", "lifecycle", "rendering"],
    "sql": ["indexes", "b-tree", "joins", "acid", "transactions", "normalization", "foreign key", "primary key", "query plan"],
    "mongodb": ["document", "collection", "aggregation pipeline", "sharding", "replica set", "bson", "index", "nosql"],
    "docker": ["container", "image", "dockerfile", "layer", "isolation", "namespaces", "cgroups", "volume"],
    "dsa": ["time complexity", "space complexity", "big o", "worst case", "edge case", "recursion", "iteration", "pointer", "hashmap"],
    "system_design": ["scalability", "load balancer", "caching", "database sharding", "microservices", "latency", "throughput", "cap theorem", "fault tolerance"],
}

def evaluate_answer_heuristics(req: InterviewEvaluateRequest) -> InterviewEvaluateResponse:
    """Evaluate interview response with deterministic concept extraction and linguistic scoring"""
    ans = req.student_answer.strip()
    words = ans.split()
    word_count = len(words)
    lower_ans = ans.lower()

    if word_count < 10:
        return InterviewEvaluateResponse(
            overall_score=20,
            technical_accuracy=20,
            completeness=15,
            communication_clarity=35,
            dimensions=[
                DimensionScore(dimension="Technical Accuracy", score=20, commentary="Answer is too brief to evaluate technical depth."),
                DimensionScore(dimension="Completeness", score=15, commentary="Missing foundational explanations, examples, and edge cases."),
                DimensionScore(dimension="Communication Clarity", score=35, commentary="Express ideas in complete sentences with technical terminology."),
            ],
            positive_observations=["Attempted to submit an initial response."],
            missing_key_concepts=["Core definition", "Practical example", "Trade-offs and architectural considerations"],
            suggested_improvements=["Expand answer to at least 3-4 structured sentences explaining the 'what', 'why', and 'how'."],
            recommended_model_answer_outline="Define the core concept, contrast with alternatives, describe a practical production scenario, and mention trade-offs.",
            evaluation_method="Deterministic Length & Keyword Grounding"
        )

    # Concept grounding check
    target_concepts = req.ideal_concepts or []
    if not target_concepts:
        # Infer relevant domain concepts from question and type
        q_clean = req.question.lower().replace(".", "").replace("-", " ")
        type_clean = req.interview_type.lower()
        for key, concepts in DOMAIN_CONCEPTS.items():
            if key in q_clean or key in type_clean:
                target_concepts.extend(concepts[:5])
                break
        if not target_concepts:
            target_concepts = ["architecture", "performance", "trade-offs", "scalability", "implementation"]

    matched_concepts = []
    missing_concepts = []
    for concept in target_concepts:
        clean_c = concept.lower()
        if re.search(rf"\b{re.escape(clean_c)}\b", lower_ans):
            matched_concepts.append(concept)
        else:
            missing_concepts.append(concept)

    # Technical Accuracy Score
    concept_ratio = len(matched_concepts) / max(1, len(target_concepts))
    accuracy_score = min(95, max(30, int(40 + (concept_ratio * 55))))

    # Completeness Score based on depth, examples, and length
    has_example = any(kw in lower_ans for kw in ["for example", "e.g.", "such as", "in my project", "instance", "case"])
    has_tradeoff = any(kw in lower_ans for kw in ["trade-off", "tradeoff", "however", "on the other hand", "drawback", "advantage"])

    completeness_score = 40
    if word_count >= 25:
        completeness_score += 15
    if word_count >= 60:
        completeness_score += 15
    if has_example:
        completeness_score += 15
    if has_tradeoff:
        completeness_score += 10
    completeness_score = min(95, completeness_score)

    # Communication Clarity Score
    sentences = [s for s in re.split(r"[.!?]+", ans) if s.strip()]
    clarity_score = 70
    if len(sentences) >= 2:
        clarity_score += 15
    if word_count > 300:
        clarity_score -= 10
    clarity_score = min(95, max(30, clarity_score))

    # Overall Weighted Score
    overall_score = round((accuracy_score * 0.45) + (completeness_score * 0.35) + (clarity_score * 0.20))

    # Observations and feedback
    positive_observations = []
    if matched_concepts:
        positive_observations.append(f"Successfully integrated technical terminology: {', '.join(matched_concepts[:4])}.")
    if has_example:
        positive_observations.append("Provided practical illustration/example to ground the theoretical concept.")
    if word_count >= 30:
        positive_observations.append("Good elaboration depth with structured sentence progression.")

    suggested_improvements = []
    if missing_concepts:
        suggested_improvements.append(f"Incorporate missing core concepts: {', '.join(missing_concepts[:3])}.")
    if not has_tradeoff:
        suggested_improvements.append("Discuss trade-offs, limitations, or alternative design approaches.")
    if not has_example:
        suggested_improvements.append("Ground your answer with a real-world software architecture example.")

    dimensions = [
        DimensionScore(
            dimension="Technical Accuracy",
            score=accuracy_score,
            commentary=f"Addressed {len(matched_concepts)}/{len(target_concepts)} target technical concepts."
        ),
        DimensionScore(
            dimension="Completeness",
            score=completeness_score,
            commentary="Evaluates structural depth, practical examples, and trade-off considerations."
        ),
        DimensionScore(
            dimension="Communication Clarity",
            score=clarity_score,
            commentary="Measures readability, structured flow, and concise delivery."
        ),
    ]

    return InterviewEvaluateResponse(
        overall_score=overall_score,
        technical_accuracy=accuracy_score,
        completeness=completeness_score,
        communication_clarity=clarity_score,
        dimensions=dimensions,
        positive_observations=positive_observations or ["Answer successfully recorded and parsed."],
        missing_key_concepts=missing_concepts[:4],
        suggested_improvements=suggested_improvements,
        recommended_model_answer_outline="1. Direct definition & purpose; 2. Core mechanics; 3. Real-world scenario; 4. Known trade-offs.",
        evaluation_method="Deterministic Concept Grounding & Heuristics"
    )
