#!/bin/bash

# MarketMind AI - Quick Setup Script
# ===================================

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         MarketMind AI - Setup & Installation                 ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check Python
echo "→ Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "✗ Python 3 not found. Please install Python 3.10+ first."
    exit 1
fi
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "✓ Python $PYTHON_VERSION found"
echo ""

# Check Node.js
echo "→ Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✓ Node.js $NODE_VERSION found"
echo ""

# Check Ollama
echo "→ Checking Ollama installation..."
if ! command -v ollama &> /dev/null; then
    echo "⚠ Ollama not found. LLM strategy will not work."
    echo "  Install from: https://ollama.com"
    echo "  Then run: ollama pull llama3:8b"
else
    OLLAMA_VERSION=$(ollama --version 2>&1 | head -n1)
    echo "✓ Ollama found: $OLLAMA_VERSION"
    
    # Check if llama3:8b is installed
    if ollama list | grep -q "llama3:8b"; then
        echo "✓ llama3:8b model already installed"
    else
        echo "→ Downloading llama3:8b model (this may take a few minutes)..."
        ollama pull llama3:8b
        echo "✓ llama3:8b model installed"
    fi
fi
echo ""

# Install Python dependencies
echo "→ Installing Python dependencies..."
pip3 install -r requirements.txt
echo "✓ Python dependencies installed"
echo ""

# Install UI dependencies
echo "→ Installing UI dependencies..."
cd marketmind-ui
npm install
cd ..
echo "✓ UI dependencies installed"
echo ""

# Setup environment file
if [ ! -f .env ]; then
    echo "→ Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠ IMPORTANT: Edit .env file to add your API keys (optional but recommended)"
    echo "  - SERPAPI_KEY: Get free key from https://serpapi.com/"
    echo "  - REDDIT_CLIENT_ID/SECRET: Create app at https://www.reddit.com/prefs/apps"
    echo ""
else
    echo "✓ .env file already exists"
    echo ""
fi

# Create database directory
mkdir -p temp
echo "✓ Database directory created"
echo ""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete!                            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "To start the application:"
echo ""
echo "  1. Start Ollama (in a separate terminal):"
echo "     $ ollama serve"
echo ""
echo "  2. Start the backend:"
echo "     $ python main.py"
echo "     or"
echo "     $ uvicorn main:app --reload --port 8080"
echo ""
echo "  3. Start the frontend (in another terminal):"
echo "     $ cd commerceos-ui"
echo "     $ npm run dev"
echo ""
echo "  4. Open your browser:"
echo "     Frontend: http://localhost:5173"
echo "     API Docs: http://localhost:8000/docs"
echo ""
echo "For better accuracy, add API keys to .env file:"
echo "  - SERPAPI_KEY (recommended, free tier available)"
echo "  - REDDIT_CLIENT_ID/SECRET (optional, for trend scouting)"
echo ""
echo "Happy analyzing! 🚀"
