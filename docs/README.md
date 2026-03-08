# MarketMind AI
### Autonomous Product Discovery & Launch Intelligence System

> **Module 0**: Global Trend Scouting Engine (NEW)  
> **Module 1**: Seller Profile Configuration  
> **Module 2**: Real-Time Market Intelligence  
> **Module 3**: Profit Optimization Engine  

**Zero static data. Zero fallbacks. 100% real market signals.**

---

## 🚀 What Makes This Different

Most market research tools tell you about products **you already know**.  
MarketMind discovers opportunities **before you have an idea**.

### The Innovation: Module 0 - Trend Scouting

Before analyzing a specific product, MarketMind scans:
- **Google Trends** - Rising searches and related queries
- **Amazon Movers & Shakers** - Products with biggest sales rank gains
- **Reddit** - Trending product discussions across buy-focused subreddits

Then ranks opportunities by:
- Trend strength (0-100)
- Growth velocity (High/Medium/Low)
- Search volume estimates
- Data confidence scores

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  MODULE 0: TREND SCOUTING ENGINE                            │
│  ↓ What's trending globally right now?                      │
│  • Google Trends (rising searches)                          │
│  • Amazon Movers & Shakers                                  │
│  • Reddit product discussions                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  MODULE 1: SELLER PROFILE                                   │
│  ↓ Who is the seller? What are their constraints?           │
│  • Budget, platform, country, risk tolerance                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  MODULE 2: MARKET INTELLIGENCE                              │
│  ↓ Is this product viable?                                  │
│  • Google Trends (12-month analysis)                        │
│  • Amazon scraping (price, reviews, BSR, velocity)          │
│  • Keyword research (3-tier: Google Ads → SerpAPI → SERP)   │
│  • Supplier pricing (Alibaba/AliExpress → formula)          │
│  • Scoring engine (demand, competition, viability)          │
│  • LLM strategy (Llama3:8B via Ollama)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  MODULE 3: PROFIT OPTIMIZATION                              │
│  ↓ What price maximizes profit?                             │
│  • 3-scenario simulation (conservative/expected/aggressive) │
│  • ROI calculation, break-even timeline                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Sources (All Real-Time)

| Source | What It Provides | API Key Required? |
|--------|------------------|-------------------|
| **Google Trends** | 12-month interest, growth, seasonality | No |
| **Amazon Scraping** | Price, reviews, BSR, sponsored density | No |
| **Amazon Review Pages** | Real review velocity (reviews/month) | No |
| **Google Ads API** | CPC, search volume (Tier 1) | Yes (optional) |
| **SerpAPI** | CPC, search volume (Tier 2) | Yes (optional) |
| **SERP Scraping** | Ad count → CPC proxy (Tier 3) | No |
| **Alibaba** | Supplier FOB pricing | No |
| **AliExpress** | B2C pricing → B2B estimate | No |
| **Exchange Rate API** | Live USD → local currency | No |
| **Reddit API** | Trending product discussions | Yes (optional) |
| **Ollama (Llama3)** | Strategic assessment | No (local) |

---

## 🛠 Quick Start

### Prerequisites

```bash
# 1. Python 3.10+
python --version

# 2. Node.js 18+ (for React UI)
node --version

# 3. Ollama (for LLM strategy)
# Install from: https://ollama.com
ollama pull llama3:8b
ollama serve  # Keep running in separate terminal
```

### Installation

```bash
# 1. Clone repository
git clone <your-repo-url>
cd MarketMindAI

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Install UI dependencies
cd commerceos-ui
npm install
cd ..

# 4. Configure environment
cp .env.example .env
# Edit .env with your API keys (optional - see below)

# 5. Start backend
python main.py
# Or: uvicorn main:app --reload --port 8000

# 6. Start frontend (new terminal)
cd commerceos-ui
npm run dev
```

### Access

- **Frontend UI**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## 🔑 API Keys (Optional but Recommended)

### Minimum Setup (No Keys Required)

The system works **without any API keys** using:
- Google Trends (no key)
- Amazon scraping (no key)
- SERP ad-count scraping for CPC (no key)
- Alibaba scraping (no key)
- Ollama local LLM (no key)

### Recommended Setup (Better Accuracy)

#### 1. SerpAPI (Easy, Free Tier)
- Sign up: https://serpapi.com/
- Free: 100 searches/month
- Add to `.env`: `SERPAPI_KEY=your_key_here`
- **Benefit**: More accurate CPC and search volume

#### 2. Reddit API (Optional, for Trend Scouting)
- Create app: https://www.reddit.com/prefs/apps
- Choose "script" type
- Add to `.env`:
  ```
  REDDIT_CLIENT_ID=your_id
  REDDIT_CLIENT_SECRET=your_secret
  ```
- **Benefit**: Discover trending products from Reddit discussions

#### 3. Google Ads API (Advanced, Most Accurate)
- Guide: https://developers.google.com/google-ads/api/docs/first-call/overview
- Requires: Developer token, OAuth credentials, customer ID
- **Benefit**: Official Google keyword data (most accurate)

---

## 📡 API Endpoints

### Module 0: Trend Scouting

```bash
POST /discover-trends
{
  "region": "India",
  "category": "electronics",  # optional
  "time_range": "3_months"
}
```

**Returns**: Emerging categories, seasonal spikes, top opportunities

### Module 2: Product Analysis

```bash
POST /analyze-product
{
  "product": "portable blender",
  "country": "India",
  "platform": "Amazon",
  "budget": 50000,
  "cost_per_unit": 900  # optional
}
```

**Returns**: Demand score, competition score, profit scenarios, LLM strategy

### Full Pipeline

```bash
POST /analyze
{
  "product": "yoga mat",
  "country": "India",
  "budget": 30000,
  "platform": "Amazon"
}
```

**Returns**: Complete analysis (Module 1 → 2 → 3)

---

## 🎯 Scoring Formulas

### Demand Score (0-100)
```
(0.35 × trend_avg) +
(0.20 × trend_growth) +
(0.25 × review_velocity) +
(0.10 × cpc_score) +
(0.10 × search_volume)
```

### Competition Score (0-100)
```
(0.40 × seller_count) +
(0.35 × avg_reviews) +
(0.25 × sponsored_density)
```

### Viability Score
```
(0.60 × demand_score) − (0.40 × competition_score)
```

**Interpretation**:
- `> 30` → **Good** (proceed with full launch)
- `15-30` → **Moderate** (controlled launch)
- `< 15` → **Risky** (test with small budget)

---

## 🧪 Testing Without API Keys

```bash
# Test trend discovery (works without Reddit API)
curl -X POST http://localhost:8000/discover-trends \
  -H "Content-Type: application/json" \
  -d '{"region":"India","time_range":"3_months"}'

# Test product analysis (works without any keys)
curl -X POST http://localhost:8000/analyze-product \
  -H "Content-Type: application/json" \
  -d '{
    "product":"portable blender",
    "country":"India",
    "platform":"Amazon",
    "budget":50000
  }'
```

---

## 🏆 Hackathon Highlights

### Innovation Points

1. **Pre-Idea Discovery**: Only system that discovers opportunities before you have a product idea
2. **Zero Synthetic Data**: Every number comes from real APIs or scraping
3. **Cascading Fallbacks**: 3-tier keyword research ensures data availability
4. **Real Review Velocity**: Parses actual Amazon review timestamps (not estimates)
5. **BSR → Sales Formula**: Converts Amazon Best Seller Rank to unit sales
6. **Live Supplier Costs**: Scrapes Alibaba/AliExpress for real FOB pricing
7. **LLM Strategy**: Qualitative insights from Llama3:8B (local, no API cost)

### Technical Depth

- **Backend**: FastAPI, SQLAlchemy, pytrends, BeautifulSoup, Ollama
- **Frontend**: React 19, Vite, custom cyberpunk UI (no component library)
- **Data**: 8 real-time sources, 0 mock data
- **Architecture**: Modular (4 independent modules)
- **Deployment**: Docker-ready, PostgreSQL-compatible

---

## 📁 Project Structure

```
MarketMindAI/
├── TrendScout/              # Module 0 - Trend Discovery
│   ├── services/
│   │   └── trend_discovery.py
│   ├── routers/
│   │   └── discover.py
│   └── schemas/
│       └── trend_schema.py
├── InputConfig/             # Module 1 - Profile
├── AiMarketResearch/        # Module 2 - Intelligence
│   ├── services/
│   │   ├── data_collection.py
│   │   ├── keyword_research.py
│   │   ├── supplier_pricing.py
│   │   ├── scoring_engine.py
│   │   ├── profit_simulation.py
│   │   └── llm_engine.py
│   └── routers/
├── ProfitOptimizer/         # Module 3 - Optimization
├── pipeline/                # Full pipeline orchestration
├── global/                  # Shared config, database
├── commerceos-ui/           # React frontend
│   └── src/
│       └── App.jsx          # Single-file UI (632 lines)
├── main.py                  # FastAPI entry point
├── requirements.txt
└── README.md
```

---

## 🐛 Troubleshooting

### "Ollama not reachable"
```bash
# Start Ollama server
ollama serve

# Pull model if not already downloaded
ollama pull llama3:8b
```

### "All keyword research tiers failed"
- **Solution 1**: Add `SERPAPI_KEY` to `.env` (free tier available)
- **Solution 2**: Check internet connection (Tier 3 scraping needs access to Google)

### "Supplier cost lookup failed"
- **Cause**: Alibaba/AliExpress blocking requests
- **Solution**: Provide `cost_per_unit` manually in request

### "No Amazon search results"
- **Cause**: Amazon changed HTML structure or blocking
- **Solution**: Update selectors in `data_collection.py`

---

## 🚀 Production Deployment

### Environment Variables

```bash
# Use PostgreSQL
DATABASE_URL=postgresql://user:pass@host:5432/marketmind

# Add API keys for better accuracy
SERPAPI_KEY=your_production_key
GOOGLE_ADS_DEVELOPER_TOKEN=your_token
REDDIT_CLIENT_ID=your_id
REDDIT_CLIENT_SECRET=your_secret
```

### Docker Deployment

```dockerfile
# Dockerfile (create this)
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t marketmind-ai .
docker run -p 8000:8000 --env-file .env marketmind-ai
```

---

## 📈 Future Enhancements

- [ ] Time-series forecasting (Prophet/ARIMA) for demand projection
- [ ] ML-based demand prediction model
- [ ] Amazon SP-API integration (official API)
- [ ] Multi-marketplace support (Flipkart, eBay, Etsy)
- [ ] Competitor tracking dashboard
- [ ] Email alerts for trend spikes
- [ ] Chrome extension for instant analysis

---

## 📄 License

MIT License - See LICENSE file

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

---

## 📞 Support

- **Issues**: GitHub Issues
- **Docs**: http://localhost:8000/docs (when running)
- **Email**: [your-email]

---

**Built for hackathons. Designed for production. Powered by real data.**
