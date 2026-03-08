#!/bin/bash

# MarketMind AI - Stop All Services Script (Linux/Mac)
# =====================================================

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         MarketMind AI - Stopping All Services                ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Stop Frontend (port 5174)
echo "→ Stopping Frontend..."
if lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    kill $(lsof -t -i:5174) 2>/dev/null
    echo "✓ Frontend stopped"
else
    echo "✓ Frontend not running"
fi

# Stop Backend (port 8080)
echo "→ Stopping Backend..."
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    kill $(lsof -t -i:8080) 2>/dev/null
    echo "✓ Backend stopped"
else
    echo "✓ Backend not running"
fi

# Stop Ollama (port 11434)
echo "→ Stopping Ollama..."
if lsof -Pi :11434 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    kill $(lsof -t -i:11434) 2>/dev/null
    echo "✓ Ollama stopped"
else
    echo "✓ Ollama not running"
fi

echo ""
echo "All services stopped."
