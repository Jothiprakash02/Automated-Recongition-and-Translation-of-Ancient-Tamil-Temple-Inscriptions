# MarketMind AI - Scripts

This folder contains automation scripts for setup and running the application.

## Setup Scripts (Run Once)

### `setup.sh` / `setup.bat`
Prepares your environment by:
- Checking prerequisites (Python, Node.js, Ollama)
- Installing Python dependencies
- Installing frontend dependencies
- Creating .env file from template
- Downloading Ollama model (llama3:8b)

**Usage:**
```bash
# Linux/Mac
./scripts/setup.sh

# Windows
scripts\setup.bat
```

## Startup Scripts (Run Every Time)

### `start-all.sh` / `start-all.bat` ⭐ RECOMMENDED
**Automatically starts ALL services** in the background:
1. Ollama server (port 11434)
2. Backend API (port 8080)
3. Frontend UI (port 5174)

**Usage:**
```bash
# Linux/Mac
./scripts/start-all.sh

# Windows
scripts\start-all.bat
```

**What happens:**
- Opens 3 terminal windows (Windows) or runs in background (Linux/Mac)
- Waits for services to start
- Shows you the URLs to access

**After running:**
- Wait 10-15 seconds for all services to fully start
- Open http://localhost:5174 in your browser
- API docs available at http://localhost:8080/docs

## Stop Scripts

### `stop-all.sh` / `stop-all.bat`
Stops all running services gracefully.

**Usage:**
```bash
# Linux/Mac
./scripts/stop-all.sh

# Windows
scripts\stop-all.bat
```

**What it does:**
- Finds processes on ports 5174, 8080, 11434
- Terminates them cleanly
- Confirms when done

## Troubleshooting

### "Port already in use"
The start-all scripts automatically detect and stop existing processes on the required ports.

### "Ollama not found"
Install Ollama first:
1. Download from https://ollama.com
2. Run `ollama pull llama3:8b`
3. Try again

### "Permission denied" (Linux/Mac)
Make scripts executable:
```bash
chmod +x scripts/*.sh
```

### Services won't start
1. Run setup script first: `./scripts/setup.sh`
2. Check logs:
   - Linux/Mac: `/tmp/marketmind-backend.log`, `/tmp/marketmind-frontend.log`
   - Windows: Check the terminal windows that opened

## Manual Start (Alternative)

If you prefer to start services manually in separate terminals:

**Terminal 1 - Ollama:**
```bash
ollama serve
```

**Terminal 2 - Backend:**
```bash
python main.py
```

**Terminal 3 - Frontend:**
```bash
cd commerceos-ui
npm run dev
```

## File Overview

| File | Purpose | When to Use |
|------|---------|-------------|
| `setup.sh` / `setup.bat` | Install dependencies | First time setup |
| `start-all.sh` / `start-all.bat` | Start all services | Every time you want to run the app |
| `stop-all.sh` / `stop-all.bat` | Stop all services | When you're done working |

## Quick Workflow

```bash
# First time only
./scripts/setup.sh

# Every time you want to work
./scripts/start-all.sh

# When you're done
./scripts/stop-all.sh
```

That's it! 🚀
