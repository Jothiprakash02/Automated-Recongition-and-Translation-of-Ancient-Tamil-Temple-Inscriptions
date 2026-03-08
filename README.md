# MarketMind AI

**Autonomous Product Discovery & Launch Intelligence**

> Zero static data. Zero fallbacks. 100% real market signals.

---

## Overview

MarketMind AI is a full-stack commerce intelligence platform that discovers trending product opportunities, validates them with live market data, and optimizes pricing and profit margins — all in a single pipeline.

| Module | Role |
|--------|------|
| **M0 — TrendScout** | Scans Google Trends, Amazon Movers & Shakers, Reddit for emerging opportunities |
| **M1 — InputConfig** | Validates seller profile: budget, risk level, experience, country |
| **M2 — AiMarketResearch** | Fetches demand score, competition, keywords, supplier cost, LLM strategy |
| **M3 — ProfitOptimizer** | 7-step MPI engine: selling price, margin, inventory, monthly profit |

---

## Quick Start

### Automatic (recommended)

```bash
# Windows
scripts\start-all.bat

# Linux / macOS
./scripts/start-all.sh
```

Wait 10–15 seconds, then open **http://localhost:5174**

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
cd commerceos-ui
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/discover-trends` | Discover emerging product opportunities |
| POST | `/analyze` | Full pipeline (M1 + M2 + M3) |
| POST | `/analyze-product` | Analyze a specific product |
| GET | `/history` | Past analysis records |
| GET | `/health` | Health check |

Interactive docs: **http://localhost:8080/docs**

---

## Configuration

Copy `.env.example` to `.env` and fill in optional keys:

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `SERPAPI_KEY` | Optional | Accurate CPC / search volume (100 free/month) |
| `REDDIT_CLIENT_ID` | Optional | Reddit trend data |
| `REDDIT_CLIENT_SECRET` | Optional | Reddit trend data |
| `DATABASE_URL` | Auto-set | SQLite path (default: `data/product_intelligence.db`) |

The system works without any API keys using open scraping.

---

## Project Structure

```
MarketMind AI/
├── main.py                  # FastAPI entry point (port 8080)
├── requirements.txt         # Python dependencies
├── .env.example             # Environment template
│
├── TrendScout/              # M0 — Trend discovery
├── InputConfig/             # M1 — Seller profile & validation
├── AiMarketResearch/        # M2 — Market intelligence
├── ProfitOptimizer/         # M3 — Profit optimization
├── BusinessStrategy/        # M4 — AI strategy (LLM layer)
├── pipeline/                # Full pipeline orchestration
├── global/                  # Shared config, database, utilities
│
├── commerceos-ui/           # React frontend (Vite, port 5174)
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
| Frontend (Vite) | 5174 |
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
ollama pull llama3:8b
```

**Port conflict** — another process is using 8080 or 5174. Check with:
```bash
netstat -ano | findstr :8080
```

---

*Built for rapid validation. Designed for production. Powered by real data.*