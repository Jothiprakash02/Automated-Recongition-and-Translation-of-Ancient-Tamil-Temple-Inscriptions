#!/bin/bash

# MarketMind AI - Complete Startup Script (Linux/Mac)
# ====================================================
# This script starts ALL services automatically

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         MarketMind AI - Starting All Services                ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check if setup has been run
if [ ! -f .env ]; then
    echo "⚠ .env file not found. Running setup first..."
    ./scripts/setup.sh
    echo ""
fi

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "✗ Ollama not installed. Please install from https://ollama.com"
    exit 1
fi

echo "→ Starting services..."
echo ""

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Start Ollama in background
echo "[1/3] Starting Ollama server..."
if check_port 11434; then
    echo "✓ Ollama already running on port 11434"
else
    nohup ollama serve > /tmp/ollama.log 2>&1 &
    sleep 3
    echo "✓ Ollama started on port 11434"
fi
echo ""

# Start Backend in background
echo "[2/3] Starting Backend (FastAPI)..."
if check_port 8080; then
    echo "⚠ Port 8080 already in use. Stopping existing process..."
    kill $(lsof -t -i:8080) 2>/dev/null || true
    sleep 2
fi
nohup python -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload > /tmp/marketmind-backend.log 2>&1 &
BACKEND_PID=$!
sleep 5
echo "✓ Backend started on port 8080 (PID: $BACKEND_PID)"
echo ""

# Start Frontend in background
echo "[3/3] Starting Frontend (React)..."
if check_port 5174; then
    echo "⚠ Port 5174 already in use. Stopping existing process..."
    kill $(lsof -t -i:5174) 2>/dev/null || true
    sleep 2
fi
cd commerceos-ui
nohup npm run dev > /tmp/marketmind-frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 5
echo "✓ Frontend started on port 5174 (PID: $FRONTEND_PID)"
echo ""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                All Services Started!                          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Services running:"
echo "  • Ollama Server: http://localhost:11434"
echo "  • Backend API: http://localhost:8080"
echo "  • Frontend UI: http://localhost:5174"
echo ""
echo "Wait 10-15 seconds for all services to fully start, then open:"
echo "  Frontend: http://localhost:5174"
echo "  API Docs: http://localhost:8080/docs"
echo ""
echo "Logs:"
echo "  • Ollama: /tmp/ollama.log"
echo "  • Backend: /tmp/marketmind-backend.log"
echo "  • Frontend: /tmp/marketmind-frontend.log"
echo ""
echo "To stop all services, run:"
echo "  ./scripts/stop-all.sh"
echo ""
echo "Happy analyzing! 🚀"
