# MarketMind AI - Testing Guide

## 🧪 Verify Your Installation

Run these tests to ensure everything is working correctly.

---

## 1. Backend Health Check

```bash
# Start backend first
python main.py

# In another terminal, test health endpoint
curl http://localhost:8080/health
```

**Expected Output:**
```json
{
  "status": "ok",
  "service": "Product Intelligence Engine"
}
```

---

## 2. Test Module 0 - Trend Discovery

### Without Reddit API (Minimum Setup)

```bash
curl -X POST http://localhost:8080/discover-trends \
  -H "Content-Type: application/json" \
  -d '{
    "region": "India",
    "time_range": "3_months"
  }'
```

**Expected**: JSON with `emerging_categories`, `top_opportunities`, `data_sources_used` (should include "google_trends" and "amazon_movers")

### With Reddit API

```bash
curl -X POST http://localhost:8080/discover-trends \
  -H "Content-Type: application/json" \
  -d '{
    "region": "US",
    "category": "electronics",
    "time_range": "6_months"
  }'
```

**Expected**: `data_sources_used` should include "reddit"

---

## 3. Test Module 2 - Product Analysis

### Basic Analysis (No API Keys Required)

```bash
curl -X POST http://localhost:8080/analyze-product \
  -H "Content-Type: application/json" \
  -d '{
    "product": "yoga mat",
    "country": "India",
    "platform": "Amazon",
    "budget": 30000
  }'
```

**Expected Output Structure:**
```json
{
  "product": "yoga mat",
  "demand_score": 45.2,
  "competition_score": 62.1,
  "viability_score": 2.3,
  "confidence_score": 100.0,
  "suggested_price": 850.0,
  "profit_margin": 28.5,
  "estimated_monthly_profit": 12500.0,
  "roi_percent": 41.7,
  "break_even_months": 2.4,
  "risk_level": "Medium",
  "viability_label": "Moderate",
  "profit_scenarios": [...],
  "raw_signals": {...},
  "risk_explanation": "...",
  "positioning_strategy": "...",
  "final_recommendation": "...",
  "market_entry_advice": "..."
}
```

### With Manual Cost Override

```bash
curl -X POST http://localhost:8080/analyze-product \
  -H "Content-Type: application/json" \
  -d '{
    "product": "portable blender",
    "country": "India",
    "platform": "Amazon",
    "budget": 50000,
    "cost_per_unit": 900
  }'
```

**Expected**: `raw_signals.supplier_cost_local` should be 900

---

## 4. Test Full Pipeline

```bash
curl -X POST http://localhost:8080/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "product": "resistance bands",
    "country": "India",
    "budget": 40000,
    "platform": "Amazon"
  }'
```

**Expected**: Complete response with `profile`, `market`, `optimization` sections

---

## 5. Test History Endpoint

```bash
# After running a few analyses
curl http://localhost:8080/history?limit=5
```

**Expected**: Array of past analyses with timestamps

---

## 6. Frontend Tests

### Manual UI Testing

1. **Discover Page**
   - [ ] Form loads correctly
   - [ ] Region dropdown works
   - [ ] Category dropdown works
   - [ ] "DISCOVER OPPORTUNITIES" button triggers scan
   - [ ] Loading animation appears
   - [ ] Results display after scan
   - [ ] Clicking "ANALYZE →" navigates to Analyze page with pre-filled product

2. **Analyze Page**
   - [ ] Form loads correctly
   - [ ] All dropdowns work
   - [ ] Number inputs accept values
   - [ ] "RUN ANALYSIS" button triggers analysis
   - [ ] Loading steps animate
   - [ ] Results page loads after analysis

3. **Dashboard Page**
   - [ ] Score arcs animate
   - [ ] KPI tiles display correctly
   - [ ] Demand/Competition bars render
   - [ ] All numbers format correctly (commas, decimals)

4. **Scenarios Page**
   - [ ] Three scenario cards display
   - [ ] "Expected" card has glow effect
   - [ ] Profit comparison bars animate
   - [ ] Negative profits show in red

5. **Signals Page**
   - [ ] All signal groups display
   - [ ] Data confidence circle animates
   - [ ] Values match backend response

6. **Strategy Page**
   - [ ] Final recommendation displays with correct color
   - [ ] Risk analysis and positioning cards render
   - [ ] Market entry advice shows
   - [ ] Decision matrix displays

7. **History Page**
   - [ ] Past analyses load
   - [ ] Cards display correctly
   - [ ] Dates format properly

---

## 7. Data Source Verification

### Google Trends

```python
# Run this in Python REPL
from pytrends.request import TrendReq
pytrends = TrendReq(hl='en-US', tz=330, retries=0, backoff_factor=0)
pytrends.build_payload(['yoga mat'], timeframe='today 12-m', geo='IN')
df = pytrends.interest_over_time()
print(df.head())
```

**Expected**: DataFrame with interest values

### Amazon Scraping

```python
import requests
from bs4 import BeautifulSoup

url = "https://www.amazon.in/s"
params = {"k": "yoga mat"}
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
resp = requests.get(url, params=params, headers=headers, timeout=15)
soup = BeautifulSoup(resp.text, "lxml")
results = soup.select('[data-component-type="s-search-result"]')
print(f"Found {len(results)} products")
```

**Expected**: At least 10 products found

### Ollama

```bash
curl http://localhost:11434/api/tags
```

**Expected**: JSON with list of installed models (should include llama3:latest)

---

## 8. Error Handling Tests

### Invalid Product

```bash
curl -X POST http://localhost:8080/analyze-product \
  -H "Content-Type: application/json" \
  -d '{
    "product": "xyzabc123nonexistent",
    "country": "India",
    "platform": "Amazon",
    "budget": 50000
  }'
```

**Expected**: Should still return a response (may have low confidence score)

### Missing Required Fields

```bash
curl -X POST http://localhost:8080/analyze-product \
  -H "Content-Type: application/json" \
  -d '{
    "product": "yoga mat"
  }'
```

**Expected**: 422 Validation Error

### Ollama Offline

```bash
# Stop Ollama server
# Then run analysis
curl -X POST http://localhost:8080/analyze-product \
  -H "Content-Type: application/json" \
  -d '{
    "product": "yoga mat",
    "country": "India",
    "platform": "Amazon",
    "budget": 30000
  }'
```

**Expected**: Should still work, using rule-based fallback strategy

---

## 9. Performance Tests

### Response Time Benchmarks

| Endpoint | Expected Time | Acceptable Max |
|----------|---------------|----------------|
| `/health` | <100ms | 500ms |
| `/discover-trends` | 30-60s | 120s |
| `/analyze-product` | 60-90s | 180s |
| `/analyze` (full pipeline) | 70-100s | 200s |
| `/history` | <500ms | 2s |

### Load Test (Optional)

```bash
# Install Apache Bench
# Ubuntu: sudo apt-get install apache2-utils
# Mac: brew install ab

# Test health endpoint
ab -n 100 -c 10 http://localhost:8080/health

# Test analysis endpoint (be careful, this is expensive)
ab -n 5 -c 1 -p test_payload.json -T application/json \
  http://localhost:8080/analyze-product
```

---

## 10. Data Quality Checks

### Confidence Score Validation

Run 10 analyses and check:
- [ ] Confidence score is always between 0-100
- [ ] Confidence = 100% when all data sources succeed
- [ ] Confidence < 100% when some sources fail

### Score Consistency

For the same product analyzed twice:
- [ ] Demand score varies by <10 points
- [ ] Competition score varies by <10 points
- [ ] Viability score varies by <15 points

(Small variations are normal due to real-time data changes)

### Price Reasonableness

- [ ] Suggested price > cost_per_unit
- [ ] Profit margin is between 10-50%
- [ ] Break-even months is positive
- [ ] ROI percent is reasonable (-50% to +200%)

---

## 11. Integration Tests

### End-to-End Workflow

1. **Discover** → Find "portable blender"
2. **Analyze** → Click "ANALYZE →" button
3. **Dashboard** → Verify scores loaded
4. **Scenarios** → Check 3 scenarios present
5. **Signals** → Verify raw data
6. **Strategy** → Read LLM recommendation
7. **History** → Confirm analysis saved

**Expected**: Complete workflow without errors

---

## 12. API Key Tests

### With SerpAPI Key

1. Add `SERPAPI_KEY` to `.env`
2. Restart backend
3. Run analysis
4. Check logs for: `"Keyword data from SerpAPI"`

### With Reddit API

1. Add `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` to `.env`
2. Restart backend
3. Run trend discovery
4. Check `data_sources_used` includes "reddit"

### With Google Ads API

1. Add all `GOOGLE_ADS_*` variables to `.env`
2. Restart backend
3. Run analysis
4. Check logs for: `"Keyword data from Google Ads API"`

---

## 13. Database Tests

### SQLite Persistence

```bash
# Run analysis
curl -X POST http://localhost:8080/analyze-product \
  -H "Content-Type: application/json" \
  -d '{"product":"test","country":"India","platform":"Amazon","budget":10000}'

# Check database file exists
ls -lh temp/product_intelligence.db

# Query database
sqlite3 temp/product_intelligence.db "SELECT COUNT(*) FROM analyses;"
```

**Expected**: Database file exists and has records

---

## 14. Troubleshooting Tests

### Check Logs

```bash
# Backend logs should show:
# - "Database initialized. Server ready."
# - "Trends ✓  avg=XX.X  growth=XX.X%"
# - "Amazon search ✓  price=XXX  reviews=XXX"
# - "Keywords ✓  cpc=X.XXX  volume=XXXX"
# - "Scores → D=XX.X  C=XX.X  V=XX.X"
```

### Verify All Modules Loaded

```bash
curl http://localhost:8080/docs
```

**Expected**: Swagger UI with 4 sections:
- Module 0 — Trend Scouting
- Full Pipeline
- Module 1 — Input Config
- Module 2 — Intelligence

---

## ✅ Success Criteria

Your installation is working correctly if:

- [ ] All health checks pass
- [ ] Trend discovery returns opportunities
- [ ] Product analysis completes without errors
- [ ] Frontend loads and displays data
- [ ] Confidence scores are 67-100%
- [ ] LLM strategy generates (or fallback works)
- [ ] History saves analyses
- [ ] No Python errors in logs
- [ ] No JavaScript errors in browser console

---

## 🐛 Common Test Failures

### "pytrends" errors
- **Fix**: `pip install --upgrade pytrends`

### "lxml" errors
- **Fix**: `pip install --upgrade lxml`

### "praw" not found
- **Fix**: `pip install praw` (optional, for Reddit)

### Amazon returns 0 results
- **Cause**: IP blocked or rate limited
- **Fix**: Wait 5 minutes, try different product

### Ollama timeout
- **Fix**: Increase `OLLAMA_TIMEOUT` in `.env`

---

**All tests passing? You're ready for production! 🚀**
