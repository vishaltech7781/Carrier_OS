# CareerOS AI — Personal Career Intelligence Platform

> **Final-Year Computer Science Engineering Major Flagship Project**  
> Built by Vishal Biradar | Full Stack & AI Software Engineer

---

## 1. Project Overview & Central Question

**CareerOS AI** is a production-grade career intelligence and readiness platform engineered to answer one central question:

> *"What should I learn and do next to become job-ready for my target software engineering role?"*

Rather than a static dashboard or simple collection of CRUD pages, CareerOS acts as a continuous closed-loop feedback engine. It evaluates a student candidate's resumes, coding practice, target job descriptions, and interview responses to synthesize an explainable, personalized career roadmap and **Career Digital Twin**.

---

## 2. System Architecture

CareerOS AI implements a clean three-tier microservice architecture with dual database persistence:

```
                    ┌───────────────────────────────────────────────┐
                    │          React 18 + TypeScript Client         │
                    │        (Vite, Tailwind CSS, Recharts)         │
                    │            http://localhost:5173              │
                    └───────────────────────┬───────────────────────┘
                                            │
                                  REST API / JSON / Cookies
                                            │
                    ┌───────────────────────▼───────────────────────┐
                    │          Node.js Express API Gateway          │
                    │       (JWT Auth, Zod Validation, Helmet)      │
                    │            http://localhost:5000              │
                    └───┬───────────────────────┬───────────────┬───┘
                        │                       │               │
        ┌───────────────▼────────┐     ┌────────▼────────┐      │ HTTP Internal
        │      MongoDB 7.0       │     │    MySQL 8.0    │      │
        │  (Mongoose Connection) │     │  (Prisma ORM)   │      │
        │  • User Accounts       │     │  • Skills       │      │
        │  • Student Profiles    │     │  • Benchmarks   │      │
        │  • Resumes & Parsings  │     │  • Curated Jobs │      │
        │  • Interview Sessions  │     │  • Applications │      │
        │  • Activity Events     │     │  • Roadmaps     │      │
        └────────────────────────┘     │  • DSA Tracker  │      │
                                       │  • Resources    │      │
                                       └─────────────────┘      │
                                                                │
                                ┌───────────────────────────────▼───┐
                                │       Python AI Microservice      │
                                │   (FastAPI, Uvicorn, scikit-learn)│
                                │        http://localhost:8000      │
                                └───────────────────────────────────┘
```

### Why Dual Databases?
- **MongoDB (Document Model):** Ideal for semi-structured and rapidly evolving documents: raw resume text, variable nested sections (education arrays, project highlights), turn-based interview transcripts with unstructured feedback, and chronological event streams.
- **MySQL via Prisma (Relational Model):** Essential for strict referential integrity, foreign key relations, relational indexing, and transactional consistency: normalized canonical skills taxonomy, hierarchical roadmap tasks linked to weekly milestones, categorized DSA problem attempts, and job application pipeline state machines.

---

## 3. Mathematical & Machine Learning Algorithms

### 3.1 Explainable Job Match Scoring
Rather than an opaque black-box percentage, match scores use a deterministic weighted ratio:

$$\text{Job Match \%} = \frac{2 \times N_{\text{matched, required}} + 1 \times N_{\text{matched, preferred}}}{2 \times N_{\text{total, required}} + 1 \times N_{\text{total, preferred}}} \times 100$$

Where required competencies carry **double the weight (2.0×)** of preferred competencies. If no explicit requirements are parsed, the engine computes TF-IDF term vectors across the job description and candidate profile, measuring cosine similarity:

$$\text{Cosine Similarity} = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|}$$

### 3.2 Multi-Factor Career Readiness Score
The headline Career Readiness Score calculates progress toward placement across five documented dimensions:

$$\text{Readiness Score} = 0.35 \times S_{\text{skills}} + 0.20 \times S_{\text{dsa}} + 0.20 \times S_{\text{projects}} + 0.15 \times S_{\text{interview}} + 0.10 \times S_{\text{resume}}$$

1. **Skill Coverage (35%):** Ratio of verified candidate skills to target role benchmark (10 core skills baseline).
2. **DSA Problem Solving (20%):** Number of solved algorithmic problems tracked across 15 standard topics.
3. **Project Portfolio (20%):** Verified engineering projects documented with architecture challenges and tech stack evidence.
4. **Mock Interview Performance (15%):** Historical average of completed interview sessions graded on technical concept grounding.
5. **Resume Completeness (10%):** Structural completeness across contact coordinates, sections, and quantifiable metrics.

### 3.3 Deterministic NLP Concept Grounding (Mock Interviews)
Interview evaluations avoid fake keyword counts by measuring:
- **Technical Accuracy ($45\%$):** Linguistic boundary match against domain concept banks (e.g. event loop, libuv, non-blocking, callbacks for Node.js).
- **Completeness ($35\%$):** Structural depth, presence of real-world illustrations, and consideration of architectural trade-offs.
- **Communication Clarity ($20\%$):** Structured sentences, readability, and concise delivery.

---

## 4. Visual Direction & Anti-Pattern Compliance

The interface is designed with a restrained editorial aesthetic:
- **Color Palette:** Warm ivory background (`#FBFBF9`), deep ink typography (`#14181F`), muted forest-green accents (`#1B4332`), and neutral hairline borders (`#E2DFD6`).
- **Typography:** Refined serif headings (*Fraunces*), clean geometric body (*Plus Jakarta Sans*), and tabular monospace numerals (*JetBrains Mono*).
- **Anti-Pattern Compliance:** Strictly audited against all 30 common AI tropes:
  - ✕ No harsh or excessive gradients
  - ✕ No floating glassmorphism cards or backdrop blur
  - ✕ No purple-and-black neon startup aesthetic
  - ✕ No fake reviews, invented user numbers, or fabricated ATS scores
  - ✕ No decorative floating particles or dot-grid backgrounds
  - ✕ Includes authentic Privacy Policy and Terms of Service

---

## 5. Complete Page Directory (All 18 Pages)

1. **Landing Page (`/`):** Editorial hero, value proposition, live interactive skill audit tester, architecture overview.
2. **Registration Page (`/register`):** Secure signup with terms agreement and 1-click demo access.
3. **Login Page (`/login`):** Email/password authentication with 1-click Student & Admin demo buttons.
4. **Forgot Password Page (`/forgot-password`):** Secure recovery dispatch.
5. **Onboarding Wizard (`/onboarding`):** 4-step wizard calibrating education, target role, technical skills, and initial readiness.
6. **Main Dashboard (`/dashboard`):** Real-time aggregation of readiness score, best job match, DSA streak, and recommended actions.
7. **Student Profile (`/profile`):** Verified vs. claimed skills management, project portfolio, and career preferences.
8. **Resume Analyzer (`/resume-analyzer`):** PDF and plain-text extraction, skill taxonomy parsing, project detection, and privacy deletion.
9. **Job Description Analyzer (`/job-analyzer`):** Pasted JD evaluation with TF-IDF cosine similarity, weighted match, and gap identification.
10. **Career Roadmap (`/roadmap`):** Dynamic multi-week curriculum with task toggles, documentation links, and regeneration.
11. **Job Recommendations (`/jobs`):** Ranked roles with real-time match scores and 7-stage application pipeline tracker.
12. **DSA Practice Tracker (`/dsa-tracker`):** 15-topic problem logger, difficulty distributions, activity streak, and weak area analysis.
13. **AI Mock Interview (`/mock-interview`):** Turn-based Q&A with concept grounding evaluation, scores, and performance report cards.
14. **Career Analytics (`/analytics`):** Recharts visualizations and 7-pillar Career Digital Twin.
15. **Learning Resources (`/resources`):** Curated directory of official docs, tutorials, and algorithmic practice sets with bookmarking.
16. **Settings & Diagnostics (`/settings`):** Account settings, real-time database health monitors, and full JSON portfolio export.
17. **Admin Dashboard (`/admin`):** Protected platform management: aggregate metrics, user directory, and canonical skill taxonomy editor.
18. **404 Not Found (`*`):** Navigational recovery page.
- **Legal Pages:** `/privacy` (Privacy Policy) and `/terms` (Terms of Service).

---

## 6. Local Setup & Execution Guide

### Prerequisites
- **Node.js:** v18+ (verified on v22.14.0)
- **Python:** v3.10+ (verified on v3.13.2)
- **MySQL:** v8.0 running on localhost:3306 (database: `careeros_db`, user: `root`, password: `root`)
- **MongoDB:** running on localhost:27017

### Option A: One-Click Unified Launcher (Windows)
Double-click `scripts/run-all.bat` or run in PowerShell:
```powershell
.\scripts\run-all.ps1
```
This automatically launches the Python AI microservice, Node.js API Gateway, and React Vite frontend in separate dedicated windows.

### Option B: Manual Multi-Terminal Execution

#### 1. Python AI Microservice
```bash
# From workspace root
pip install -r ai-service/requirements.txt
python -m uvicorn app.main:app --app-dir ai-service --host 127.0.0.1 --port 8000 --reload
```
*Health Check:* `http://localhost:8000/api/v1/health`  
*Swagger Documentation:* `http://localhost:8000/docs`

#### 2. Node.js Backend Gateway
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed    # Seeds skills, roles, starter jobs & resources
npm run dev
```
*Health Check:* `http://localhost:5000/api/v1/health`

#### 3. React Frontend Client
```bash
cd frontend
npm install
npm run dev
```
*Frontend Application:* `http://localhost:5173`

---

## 7. Demo Accounts & Examiner Quick-Access

To evaluate the application immediately without filling in manual forms, use the quick-access buttons on the login screen (`http://localhost:5173/login`):

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Student Candidate** | `student.demo@careeros.ai` | `CareerOS@Demo2026` | Complete profile, projects, verified skills, and analytics |
| **Administrator** | `admin@careeros.ai` | `CareerOS@Admin2026` | Platform aggregate counts, user directory, taxonomy manager |

---

## 8. Verification & Test Suite

Run automated unit and integration tests:

```bash
# Test Python AI microservice (NLP extraction, matching, roadmap, heuristics)
python ai-service/tests/test_ai_service.py

# Verify backend TypeScript compilation
cd backend && npm run build

# Verify frontend TypeScript & Vite production build
cd frontend && npm run build
```

---

## 9. Major Project Evaluation / Viva Guide

When presenting this project to examiners or interviewers, highlight:
1. **The Core Problem:** Most career portals just display job ads. CareerOS answers *"What specifically should I learn next?"* by identifying skill deltas between student portfolios and market requirements.
2. **Architectural Separation:** Clean three-tier decoupled microservices. The Node.js gateway handles auth and data orchestration; Python handles deterministic NLP/ML; MySQL stores relational roadmaps and taxonomy; MongoDB stores rich document profiles.
3. **Graceful Fallbacks:** If the Python microservice is offline, the Node.js backend seamlessly defaults to local deterministic heuristics without crashing or fabricating fake outputs.
4. **Honest AI:** Transparent mathematical scoring instead of fabricated "99% ATS guaranteed" marketing claims.

=======
# Carrier_OS
