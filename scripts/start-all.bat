@echo off
REM MarketMind AI - Complete Startup Script (Windows)
REM ==================================================
REM This script starts ALL services automatically

echo ================================================================
echo          MarketMind AI - Starting All Services
echo ================================================================
echo.

REM Check if setup has been run
if not exist .env (
    echo [!] .env file not found. Running setup first...
    call scripts\setup.bat
    if errorlevel 1 exit /b 1
    echo.
)

REM Check if Ollama is installed
ollama --version >nul 2>&1
if errorlevel 1 (
    echo [X] Ollama not installed. Please install from https://ollama.com
    pause
    exit /b 1
)

echo [*] Starting services...
echo.

REM Start Ollama in background
echo [1/3] Starting Ollama server...
start "Ollama Server" cmd /k "ollama serve"
timeout /t 3 /nobreak >nul
echo [+] Ollama started on port 11434
echo.

REM Start Backend in background
echo [2/3] Starting Backend (FastAPI)...
start "MarketMind Backend" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload"
timeout /t 5 /nobreak >nul
echo [+] Backend started on port 8080
echo.

REM Start Frontend in background
echo [3/3] Starting Frontend (React)...
start "MarketMind Frontend" cmd /k "cd marketmind-ui && npm run dev"
timeout /t 5 /nobreak >nul
echo [+] Frontend starting on port 5173
echo.

echo ================================================================
echo                All Services Started!
echo ================================================================
echo.
echo Three terminal windows have been opened:
echo   1. Ollama Server (port 11434)
echo   2. Backend API (port 8080)
echo   3. Frontend UI (port 5174)
echo.
echo Wait 10-15 seconds for all services to fully start, then open:
echo   Frontend: http://localhost:5174
echo   API Docs: http://localhost:8080/docs
echo.
echo To stop all services: Close all three terminal windows
echo.
echo Happy analyzing! 🚀
echo.
pause
