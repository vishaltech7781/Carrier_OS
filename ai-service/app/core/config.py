"""
Configuration and Taxonomy for CareerOS AI Microservice
"""

import os
from typing import Dict, List, Set

# Environment configuration
PORT = int(os.getenv("AI_SERVICE_PORT", 8000))
HOST = os.getenv("AI_SERVICE_HOST", "0.0.0.0")

# Normalized Skill Taxonomy with Categories and Aliases
SKILL_TAXONOMY: Dict[str, Dict] = {
    # Programming Languages
    "python": {"category": "Programming Languages", "aliases": ["python3", "py", "python 3"]},
    "javascript": {"category": "Programming Languages", "aliases": ["js", "es6", "ecmascript", "vanilla js"]},
    "typescript": {"category": "Programming Languages", "aliases": ["ts"]},
    "java": {"category": "Programming Languages", "aliases": ["core java", "j2ee", "java 8", "java 11", "java 17"]},
    "c++": {"category": "Programming Languages", "aliases": ["cpp", "c plus plus"]},
    "c": {"category": "Programming Languages", "aliases": ["c lang", "c language"]},
    "c#": {"category": "Programming Languages", "aliases": ["csharp", "c sharp", ".net c#"]},
    "go": {"category": "Programming Languages", "aliases": ["golang"]},
    "rust": {"category": "Programming Languages", "aliases": ["rustlang"]},
    "sql": {"category": "Programming Languages", "aliases": ["structured query language", "ansi sql"]},

    # Frontend Development
    "react": {"category": "Frontend Development", "aliases": ["reactjs", "react.js", "react js"]},
    "next.js": {"category": "Frontend Development", "aliases": ["nextjs", "next.js 14", "next.js 15"]},
    "vue": {"category": "Frontend Development", "aliases": ["vuejs", "vue.js", "vue 3"]},
    "angular": {"category": "Frontend Development", "aliases": ["angularjs", "angular 2+"]},
    "html": {"category": "Frontend Development", "aliases": ["html5"]},
    "css": {"category": "Frontend Development", "aliases": ["css3"]},
    "tailwind css": {"category": "Frontend Development", "aliases": ["tailwind", "tailwindcss"]},
    "redux": {"category": "Frontend Development", "aliases": ["redux toolkit", "rtk"]},
    "zustand": {"category": "Frontend Development", "aliases": []},
    "sass": {"category": "Frontend Development", "aliases": ["scss"]},

    # Backend Development
    "node.js": {"category": "Backend Development", "aliases": ["nodejs", "node"]},
    "express": {"category": "Backend Development", "aliases": ["expressjs", "express.js"]},
    "fastapi": {"category": "Backend Development", "aliases": ["fast-api"]},
    "django": {"category": "Backend Development", "aliases": ["django rest framework", "drf"]},
    "flask": {"category": "Backend Development", "aliases": []},
    "spring boot": {"category": "Backend Development", "aliases": ["springboot", "spring"]},
    "graphql": {"category": "Backend Development", "aliases": ["apollo graphql"]},
    "rest api": {"category": "Backend Development", "aliases": ["restful api", "rest", "rest apis"]},
    "grpc": {"category": "Backend Development", "aliases": []},
    "microservices": {"category": "Backend Development", "aliases": ["microservice architecture"]},

    # Databases & Storage
    "mongodb": {"category": "Databases", "aliases": ["mongo", "mongoose"]},
    "postgresql": {"category": "Databases", "aliases": ["postgres", "pgsql"]},
    "mysql": {"category": "Databases", "aliases": ["mariadb"]},
    "redis": {"category": "Databases", "aliases": ["redis cache"]},
    "sqlite": {"category": "Databases", "aliases": ["sqlite3"]},
    "prisma": {"category": "Databases", "aliases": ["prisma orm"]},
    "elasticsearch": {"category": "Databases", "aliases": ["elastic search", "opensearch"]},

    # Cloud & DevOps
    "docker": {"category": "Cloud & DevOps", "aliases": ["docker containers", "dockerfile", "docker-compose"]},
    "kubernetes": {"category": "Cloud & DevOps", "aliases": ["k8s"]},
    "aws": {"category": "Cloud & DevOps", "aliases": ["amazon web services", "ec2", "s3", "lambda"]},
    "azure": {"category": "Cloud & DevOps", "aliases": ["microsoft azure"]},
    "gcp": {"category": "Cloud & DevOps", "aliases": ["google cloud", "google cloud platform"]},
    "ci/cd": {"category": "Cloud & DevOps", "aliases": ["github actions", "gitlab ci", "jenkins", "continuous integration"]},
    "git": {"category": "Cloud & DevOps", "aliases": ["github", "gitlab", "version control"]},
    "linux": {"category": "Cloud & DevOps", "aliases": ["bash", "shell scripting", "ubuntu"]},

    # Data Structures & Algorithms
    "dsa": {"category": "Computer Science Fundamentals", "aliases": ["data structures", "algorithms", "data structures & algorithms"]},
    "system design": {"category": "Computer Science Fundamentals", "aliases": ["distributed systems", "high level design", "low level design", "hld", "lld"]},
    "oop": {"category": "Computer Science Fundamentals", "aliases": ["object oriented programming", "oops"]},
    "dbms": {"category": "Computer Science Fundamentals", "aliases": ["database management systems", "relational database design"]},
    "operating systems": {"category": "Computer Science Fundamentals", "aliases": ["os concepts", "concurrency", "multithreading"]},
    "computer networks": {"category": "Computer Science Fundamentals", "aliases": ["networking", "tcp/ip", "http/https"]},

    # AI & Machine Learning
    "machine learning": {"category": "AI & Machine Learning", "aliases": ["ml", "scikit-learn", "sklearn"]},
    "deep learning": {"category": "AI & Machine Learning", "aliases": ["neural networks", "pytorch", "tensorflow", "keras"]},
    "nlp": {"category": "AI & Machine Learning", "aliases": ["natural language processing", "spacy", "nltk", "transformers", "llm"]},
    "pandas": {"category": "AI & Machine Learning", "aliases": []},
    "numpy": {"category": "AI & Machine Learning", "aliases": []},

    # Testing & Security
    "unit testing": {"category": "Testing & Quality", "aliases": ["jest", "pytest", "mocha", "vitest", "testing"]},
    "cybersecurity": {"category": "Testing & Quality", "aliases": ["web security", "owasp", "oauth", "jwt", "authentication"]},
}

# Inverted index for fast alias lookups
ALIAS_LOOKUP: Dict[str, str] = {}
for canonical, data in SKILL_TAXONOMY.items():
    ALIAS_LOOKUP[canonical.lower()] = canonical
    for alias in data.get("aliases", []):
        ALIAS_LOOKUP[alias.lower()] = canonical

# Target Role Benchmarks (Essential & Desirable Skills)
ROLE_BENCHMARKS = {
    "full stack developer": {
        "required": ["javascript", "typescript", "react", "node.js", "express", "mongodb", "sql", "git", "rest api"],
        "preferred": ["docker", "tailwind css", "redis", "dsa", "unit testing", "system design", "ci/cd"],
    },
    "frontend developer": {
        "required": ["javascript", "typescript", "react", "html", "css", "tailwind css", "git", "rest api"],
        "preferred": ["next.js", "redux", "unit testing", "dsa", "responsive design", "graphql"],
    },
    "backend developer": {
        "required": ["node.js", "python", "sql", "mongodb", "rest api", "git", "oop", "dbms"],
        "preferred": ["docker", "redis", "system design", "dsa", "fastapi", "ci/cd", "microservices"],
    },
    "software engineer": {
        "required": ["dsa", "oop", "dbms", "operating systems", "git", "sql", "computer networks"],
        "preferred": ["python", "java", "c++", "system design", "docker", "unit testing"],
    },
    "ai/ml engineer": {
        "required": ["python", "machine learning", "pandas", "numpy", "sql", "git"],
        "preferred": ["deep learning", "nlp", "fastapi", "docker", "dsa"],
    },
    "devops engineer": {
        "required": ["linux", "docker", "kubernetes", "ci/cd", "git", "aws"],
        "preferred": ["python", "bash", "system design", "terraform", "monitoring"],
    }
}

