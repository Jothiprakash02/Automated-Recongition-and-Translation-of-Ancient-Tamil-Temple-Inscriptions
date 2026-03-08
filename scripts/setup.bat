@echo off
REM MarketMind AI - Quick Setup Script (Windows)
REM ==============================================

echo ================================================================
echo          MarketMind AI - Setup and Installation
echo ================================================================
echo.

REM Check Python
echo [*] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [X] Python not found. Please install Python 3.10+ first.
    echo     Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo [+] Python %PYTHON_VERSION% found
echo.

REM Check Node.js
echo [*] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js not found. Please install Node.js 18+ first.
    echo     Download from: https://nodejs.org/
    pause
    exit /b 1
)
for /f %%i in ('node --version') do set NODE_VERSION=%%i
echo [+] Node.js %NODE_VERSION% found
echo.

REM Check Ollama
echo [*] Checking Ollama installation...
ollama --version >nul 2>&1
if errorlevel 1 (
    echo [!] Ollama not found. LLM strategy will not work.
    echo     Install from: https://ollama.com
    echo     Then run: ollama pull llama3:8b
    echo.
) else (
    for /f "tokens=*" %%i in ('ollama --version 2^>^&1') do set OLLAMA_VERSION=%%i
    echo [+] Ollama found: %OLLAMA_VERSION%
    
    REM Check if llama3:8b is installed
    ollama list | findstr /C:"llama3:8b" >nul 2>&1
    if errorlevel 1 (
        echo [*] Downloading llama3:8b model (this may take a few minutes)...
        ollama pull llama3:8b
        echo [+] llama3:8b model installed
    ) else (
        echo [+] llama3:8b model already installed
    )
    echo.
)

REM Install Python dependencies
echo [*] Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo [X] Failed to install Python dependencies
    pause
    exit /b 1
)
echo [+] Python dependencies installed
echo.

REM Install UI dependencies
echo [*] Installing UI dependencies...
cd commerceos-ui
call npm install
if errorlevel 1 (
    echo [X] Failed to install UI dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo [+] UI dependencies installed
echo.

REM Setup environment file
if not exist .env (
    echo [*] Creating .env file from template...
    copy .env.example .env
    echo [+] .env file created
    echo.
    echo [!] IMPORTANT: Edit .env file to add your API keys (optional but recommended)
    echo     - SERPAPI_KEY: Get free key from https://serpapi.com/
    echo     - REDDIT_CLIENT_ID/SECRET: Create app at https://www.reddit.com/prefs/apps
    echo.
) else (
    echo [+] .env file already exists
    echo.
)

REM Create database directory
if not exist temp mkdir temp
echo [+] Database directory created
echo.

echo ================================================================
echo                    Setup Complete!
echo ================================================================
echo.
echo To start the application:
echo.
echo   1. Start Ollama (in a separate terminal):
echo      ollama serve
echo.
echo   2. Start the backend:
echo      python main.py
echo      or
echo      uvicorn main:app --reload --port 8080
echo.
echo   3. Start the frontend (in another terminal):
echo      cd commerceos-ui
echo      npm run dev
echo.
echo   4. Open your browser:
echo      Frontend: http://localhost:5173
echo      API Docs: http://localhost:8080/docs
echo.
echo For better accuracy, add API keys to .env file:
echo   - SERPAPI_KEY (recommended, free tier available)
echo   - REDDIT_CLIENT_ID/SECRET (optional, for trend scouting)
echo.
echo Happy analyzing! 🚀
echo.
pause
