@echo off
echo ===================================================
echo   CareerOS AI — Personal Career Intelligence Platform
echo   Launching Microservices and Frontend Development Server
echo ===================================================

echo [1/3] Starting Python AI Microservice on http://localhost:8000 ...
start "CareerOS - AI Service (FastAPI)" cmd /k "cd ai-service && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Node.js Backend API on http://localhost:5000 ...
start "CareerOS - Backend API (Express)" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Starting React Vite Frontend on http://localhost:5173 ...
start "CareerOS - Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo ===================================================
echo   All services launched!
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:5000
echo   AI Engine: http://localhost:8000/docs
echo ===================================================

