# MarketMind AI - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Prerequisites

Install these first:

1. **Python 3.10+**
   - Download: https://www.python.org/downloads/
   - Verify: `python --version`

2. **Node.js 18+**
   - Download: https://nodejs.org/
   - Verify: `node --version`

3. **Ollama** (for AI strategy)
   - Download: https://ollama.com
   - Install model: `ollama pull llama3:latest`
   - Start server: `ollama serve` (keep running)

### Step 2: Automated Setup

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```cmd
setup.bat
```

### Step 3: Start the Application

**Terminal 1 - Backend:**
```bash
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd marketmind-ui
npm run dev
```

**Terminal 3 - Ollama (if not already running):**
```bash
ollama serve
```

### Step 4: Open Browser

- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8080/docs

---

## 🎯 First Analysis

### Option 1: Discover Trends First (Recommended)

1. Go to **Discover** tab
2. Select region (e.g., "India")
3. Click "DISCOVER OPPORTUNITIES"
4. Wait 30-60 seconds for scan
5. Click "ANALYZE →" on any opportunity

### Option 2: Direct Product Analysis

1. Go to **Analyze** tab
2. Enter product: "portable blender"
3. Select country: "India"
4. Enter budget: "50000"
5. Click "RUN ANALYSIS"
6. Wait 60-90 seconds for complete analysis

---

## 🔑 Optional: Add API Keys for Better Accuracy

### SerpAPI (Recommended - Free Tier)

1. Sign up: https://serpapi.com/
2. Get API key (100 free searches/month)
3. Edit `.env` file:
   ```
   SERPAPI_KEY=your_key_here
   ```
4. Restart backend

**Benefit**: More accurate CPC and search volume data

### Reddit API (Optional - For Trend Discovery)

1. Go to: https://www.reddit.com/prefs/apps
2. Click "create another app"
3. Choose "script" type
4. Copy client ID and secret
5. Edit `.env` file:
   ```
   REDDIT_CLIENT_ID=your_id
   REDDIT_CLIENT_SECRET=your_secret
   ```
6. Restart backend

**Benefit**: Discover trending products from Reddit discussions

---

## 📊 Understanding the Results

### Discover Page

- **Emerging Categories**: Product categories with highest trend strength
- **Seasonal Spikes**: Products with rapid growth (High velocity)
- **Top Opportunities**: Ranked by trend strength × confidence

### Dashboard Page

- **Demand Score**: 0-100, higher = more demand
- **Competition Score**: 0-100, higher = more saturated
- **Viability Score**: Demand - Competition (>30 = Good)
- **Confidence**: % of data sources that returned valid data

### Scenarios Page

- **Conservative**: 65% of expected sales
- **Expected**: Base case scenario
- **Aggressive**: 140% of expected sales

### Strategy Page

- **Risk Analysis**: Main risks identified
- **Positioning Strategy**: How to differentiate
- **Market Entry Advice**: Step-by-step launch plan

---

## 🐛 Common Issues

### "API OFFLINE" in top-right corner

**Solution**: Backend not running
```bash
python main.py
```

### "Ollama not reachable"

**Solution**: Start Ollama server
```bash
ollama serve
ollama pull llama3:latest
```

### "All keyword research tiers failed"

**Solution 1**: Add SERPAPI_KEY to `.env`  
**Solution 2**: Check internet connection (needs Google access)

### "No Amazon search results"

**Cause**: Amazon blocking or changed HTML  
**Solution**: Try different product or check logs

### Frontend shows blank page

**Solution**: Check browser console (F12) for errors  
**Common fix**: Clear cache and reload

---

## 📈 What Data is Real vs Estimated?

### 100% Real Data (No Fallbacks)

- ✅ Google Trends (12-month interest)
- ✅ Amazon prices
- ✅ Amazon review counts
- ✅ Amazon Best Seller Rank (BSR)
- ✅ Review velocity (parsed from timestamps)
- ✅ Sponsored ad density
- ✅ Supplier costs (Alibaba/AliExpress)
- ✅ Exchange rates

### Estimated (Based on Real Signals)

- 📊 Monthly sales (calculated from BSR using Amazon's formula)
- 📊 Search volume (Tier 3: estimated from SERP results)
- 📊 CPC (Tier 3: estimated from ad count)

### Never Used

- ❌ Static/hardcoded data
- ❌ Random numbers
- ❌ Synthetic datasets

---

## 🎓 Tips for Best Results

### For Trend Discovery

1. **Start broad**: Don't filter by category initially
2. **Check multiple regions**: Trends vary by market
3. **Look for "High" velocity**: These are emerging opportunities
4. **Cross-reference sources**: Products appearing in multiple sources are stronger signals

### For Product Analysis

1. **Provide accurate budget**: Affects break-even calculation
2. **Let supplier cost auto-fetch**: More accurate than manual entry
3. **Check confidence score**: >67% is ideal for launch decisions
4. **Review all scenarios**: Don't just look at "Expected"

### For Launch Strategy

1. **Read LLM strategy carefully**: It considers all signals holistically
2. **Check break-even timeline**: Must fit your cash flow
3. **Verify supplier MOQ**: Auto-fetched cost may have minimum order quantity
4. **Test with small batch first**: Even "Good" viability has risks

---

## 🚀 Next Steps

1. **Analyze 5-10 products** to understand scoring patterns
2. **Compare similar products** to find white space
3. **Export data** (use /history endpoint or browser dev tools)
4. **Add API keys** for production-grade accuracy
5. **Customize scoring weights** in `global/config.py`

---

## 📞 Need Help?

- **API Documentation**: http://localhost:8080/docs
- **Check logs**: Terminal where `python main.py` is running
- **GitHub Issues**: [your-repo-url]/issues
- **Email**: [your-email]

---

**You're ready to discover your next product opportunity! 🎯**
