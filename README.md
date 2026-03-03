# Product & Market Intelligence Engine
### Module 2 — Pre-Launch Decision System

> Combines Google Trends · Amazon scraping · Mathematical scoring · Profit simulation · LLM strategy (Llama3:8B)

---

## Architecture

```
User Input (POST /analyze-product)
           ↓
  Data Collection Layer
  ├── Google Trends (pytrends)
  ├── Amazon Scraping (requests + BS4)
  └── Static CPC Table

           ↓
  Feature Engineering / Scoring Engine
  ├── Demand Score     (0–100)
  ├── Competition Score (0–100)
  └── Viability Score

           ↓
  Profit Simulation Engine
  ├── Conservative scenario
  ├── Expected scenario
  └── Aggressive scenario

           ↓
  LLM Strategy Engine (Llama3:8B via Ollama)
  └── Risk · Positioning · Recommendation · Entry advice

           ↓
  SQLite (persist history)

           ↓
  Final JSON Response
```

---

## Quick Start

### 1. Prerequisites

```bash
# Python 3.10+
python --version

# Ollama — install from https://ollama.com
ollama pull llama3:8b
ollama serve          # keep this running in a separate terminal
```

### 2. Install dependencies

```bash
cd d:\AIDev
pip install -r requirements.txt
```

### 3. Run the server

```bash
uvicorn main:app --reload --port 8000
```

### 4. Open interactive docs

```
http://localhost:8000/docs
```

---

## API Reference

### POST `/analyze-product`

**Request body**
```json
{
  "product": "portable blender",
  "country": "India",
  "budget": 50000,
  "platform": "Amazon",
  "cost_per_unit": 900
}
```

**Response (excerpt)**
```json
{
  "demand_score": 72.4,
  "competition_score": 58.1,
  "viability_score": 20.1,
  "confidence_score": 100.0,
  "suggested_price": 2454.0,
  "profit_margin": 28.5,
  "estimated_monthly_profit": 38200.0,
  "roi_percent": 76.4,
  "break_even_months": 1.3,
  "risk_level": "Medium",
  "viability_label": "Moderate",
  "profit_scenarios": [ ... ],
  "risk_explanation": "...",
  "positioning_strategy": "...",
  "final_recommendation": "Proceed with controlled launch",
  "market_entry_advice": "..."
}
```

### GET `/history?limit=20`
Returns the last N analyses stored in SQLite.

### GET `/health`
Liveness check.

---

## Scoring Formulas

### Demand Score
```
(0.35 × trend_avg_norm)
+ (0.20 × trend_growth_norm)
+ (0.25 × review_velocity_norm)
+ (0.10 × cpc_score_norm)
+ (0.10 × search_volume_norm)
```

### Competition Score
```
(0.40 × seller_count_norm)
+ (0.35 × avg_reviews_norm)
+ (0.25 × sponsored_density_norm)
```

### Viability Score
```
(0.60 × demand_score) − (0.40 × competition_score)
```
- `> 30` → **Good**
- `15–30` → **Moderate**
- `< 15` → **Risky**

---

## Profit Simulation

```
monthly_sales  = demand_score × 8 × scenario_multiplier
revenue        = price × sales
cogs           = cost_per_unit × sales
platform_fee   = revenue × 15%
ad_spend       = revenue × 10%
net_profit     = revenue − (cogs + platform_fee + ad_spend)
roi_pct        = (net_profit / budget) × 100
break_even     = budget / net_profit
```

Multipliers: Conservative `0.65` · Expected `1.00` · Aggressive `1.40`

---

## LLM Integration (Llama3:8B)

- Scores and financials are passed as structured context.
- The LLM provides **qualitative interpretation only** — it never recalculates numbers.
- Output is forced to JSON via system prompt.
- Falls back to rule-based responses if Ollama is unreachable.

---

## Project Structure

```
d:\AIDev\
├── main.py                     # FastAPI app + startup
├── config.py                   # All configuration
├── database.py                 # SQLAlchemy + SQLite schema
├── models.py                   # Pydantic request/response models
├── requirements.txt
├── routers/
│   └── analyze.py              # /analyze-product + /history endpoints
├── services/
│   ├── data_collection.py      # Google Trends + Amazon + CPC
│   ├── scoring_engine.py       # Demand / Competition / Viability
│   ├── profit_simulation.py    # 3-scenario profit engine
│   └── llm_engine.py           # Ollama Llama3:8B integration
└── utils/
    └── normalizer.py           # 0-100 normalization helpers
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3:8b` | Model to use |
| `OLLAMA_TIMEOUT` | `120` | Request timeout (seconds) |
| `DATABASE_URL` | `sqlite:///./product_intelligence.db` | DB connection string |

---

## Production Upgrade Path

- Replace SQLite with PostgreSQL (`DATABASE_URL` env var)
- Integrate Amazon SP-API for real product data
- Add Google Ads API for live CPC
- Add time-series forecasting (Prophet / ARIMA) for demand projection
- ML-based demand prediction model
- Rate limiting + API key authentication
