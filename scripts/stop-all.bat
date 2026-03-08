@echo off
REM MarketMind AI - Stop All Services Script (Windows)
REM ===================================================

echo ================================================================
echo          MarketMind AI - Stopping All Services
echo ================================================================
echo.

echo [*] Stopping Frontend (port 5174)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5174 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo [+] Frontend stopped
echo.

echo [*] Stopping Backend (port 8080)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo [+] Backend stopped
echo.

echo [*] Stopping Ollama (port 11434)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :11434 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo [+] Ollama stopped
echo.

echo All services stopped.
pause
