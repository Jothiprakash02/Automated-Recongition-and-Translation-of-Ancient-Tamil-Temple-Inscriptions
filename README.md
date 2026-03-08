# MarketMind AI

**Autonomous Product Discovery & Launch Intelligence**

> Zero static data. Zero fallbacks. 100% real market signals.

---

## Overview

MarketMind AI is a full-stack commerce intelligence platform that discovers trending product opportunities, taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nulvalidates them with live market data, optimizes pricing and profit margins, and generates ready-to-publish content — all in a single pipeline.

| Module | Role |
|--------|------|
| **M0 — TrendScout** | Scans Google Trends, Amazon Movers & Shakers, Reddit for emerging opportunities |
| **M1 — InputConfig** | Validates seller profile: budget, risk level, experience, country |
| **M2 — AiMarketResearch** | Fetches demand score, competition, keywords, supplier cost, LLM strategy |
| **M3 — ProfitOptimizer** | 7-step MPI engine: selling price, margin, inventory, monthly profit |
| **M4 — BusinessStrategy** | AI-generated launch strategy, positioning, and risk assessment (Ollama) |
| **AiAssistant** | Ollama-powered chat assistant — context-aware answers for every page |
| **ContentGenerator** | SEO content, hashtags, and platform posts for Instagram / Twitter / Facebook |

---

## Quick Start

### Automatic (recommended)

```bash
# Windows
scripts\start-all.bat

# Linux / macOS
./scripts/start-all.sh
```

Wait 10–15 seconds, then open **http://localhost:5173**

```bash
# Stop all services
scripts\stop-all.bat        # Windows
./scripts/stop-all.sh       # Linux / macOS
```

### Manual

```bash
# First-time setup
./scripts/setup.sh          # Linux / macOS
scripts\setup.bat           # Windows

# Terminal 1 — LLM
ollama serve

# Terminal 2 — Backend
python main.py

# Terminal 3 — Frontend
cd marketmind-ui
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/discover-trends` | Discover emerging product opportunities (M0) |
| POST | `/analyze` | Full pipeline — M1 + M2 + M3 |
| POST | `/profile` | Validate seller profile (M1) |
| POST | `/analyze-product` | Analyze a specific product (M2) |
| POST | `/strategy` | Generate AI business strategy (M4) |
| POST | `/chat` | Chat with Ollama AI assistant |
| POST | `/generate-content` | Generate SEO content & social posts |
| GET/PUT | `/settings` | Read or update platform settings |
| GET | `/history` | Past analysis records |
| GET | `/health` | Health check |

Interactive docs: **http://localhost:8080/docs** (Swagger UI)

---

## Configuration

Copy `.env.example` to `.env` and fill in optional keys:

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `OLLAMA_BASE_URL` | Optional | Ollama LLM endpoint (default: `http://localhost:11434`) |
| `OLLAMA_MODEL` | Optional | Ollama model to use (default: `llama3:latest`) |
| `SERPAPI_KEY` | Optional | Accurate CPC / search volume (100 free/month) |
| `REDDIT_CLIENT_ID` | Optional | Reddit trend signals |
| `REDDIT_CLIENT_SECRET` | Optional | Reddit trend signals |
| `DATABASE_URL` | Auto-set | SQLite path (default: `data/product_intelligence.db`) |

The system works without any API keys using open scraping and local LLM inference.

---

## Project Structure

```
MarketMind AI/
├── main.py                  # FastAPI entry point (port 8080)
├── requirements.txt         # Python dependencies
├── .env / .env.example      # Environment config
│
├── TrendScout/              # M0 — Trend discovery engine
├── InputConfig/             # M1 — Seller profile & validation
├── AiMarketResearch/        # M2 — Market intelligence & scoring
├── ProfitOptimizer/         # M3 — Profit optimization engine
├── BusinessStrategy/        # M4 — AI strategy generation (Ollama)
├── AiAssistant/             # Gemini chat assistant
├── ContentGenerator/        # SEO content & social media posts (Ollama)
├── pipeline/                # Full pipeline orchestration
├── global/                  # Shared config, database, settings API
│
├── marketmind-ui/           # React frontend (Vite, port 5173)
├── data/                    # SQLite database (git-ignored)
├── docs/                    # Extended documentation
└── scripts/                 # Setup & start/stop automation
```

---

## Documentation

Full documentation lives in [`docs/`](docs/):

- [`README.md`](docs/README.md) — Architecture deep-dive
- [`QUICKSTART.md`](docs/QUICKSTART.md) — 5-minute setup guide
- [`TESTING.md`](docs/TESTING.md) — 14 test categories with curl examples
- [`API_EXAMPLES.md`](docs/API_EXAMPLES.md) — curl / Python / JS samples
- [`DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Docker, VPS, cloud options
- [`IMPLEMENTATION_SUMMARY.md`](docs/IMPLEMENTATION_SUMMARY.md) — What was built

---

## Service Ports

| Service | Port |
|---------|------|
| Frontend (Vite) | 5173 |
| Backend (FastAPI) | 8080 |
| Ollama (LLM) | 11434 |

---

## Troubleshooting

**API OFFLINE in UI**
```bash
python main.py
```

**Ollama not reachable**
```bash
ollama serve
ollama pull llama3:latest
```

**Port conflict** — another process is using 8080 or 5174. Check with:
```bash
netstat -ano | findstr :8080
```

---

*Built for rapid validation. Designed for production. Powered by real data.*