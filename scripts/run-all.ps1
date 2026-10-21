# CareerOS AI — PowerShell Unified Launcher

Write-Host "===================================================" -ForegroundColor Green
Write-Host "  CareerOS AI — Personal Career Intelligence Platform" -ForegroundColor Cyan
Write-Host "  Starting Python AI Service, Backend Gateway & Frontend" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Green

# 1. Start AI Microservice
Write-Host "[1/3] Starting Python AI Microservice on Port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'ai-service'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Start-Sleep -Seconds 3

# 2. Start Backend API Gateway
Write-Host "[2/3] Starting Node.js Express Gateway on Port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'backend'; npm run dev"

Start-Sleep -Seconds 3

# 3. Start Frontend Client
Write-Host "[3/3] Starting React Vite Frontend on Port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'frontend'; npm run dev"

Write-Host "`nAll tiers dispatched!" -ForegroundColor Green
Write-Host "Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:   http://localhost:5000/api/v1/health" -ForegroundColor Cyan
Write-Host "AI Engine: http://localhost:8000/docs" -ForegroundColor Cyan

