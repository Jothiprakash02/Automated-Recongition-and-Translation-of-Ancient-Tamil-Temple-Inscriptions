# MarketMind AI - API Examples

Complete examples for all API endpoints with curl, Python, and JavaScript.

---

## Base URL

```
http://localhost:8080
```

For production, replace with your domain.

---

## 1. Health Check

### curl
```bash
curl http://localhost:8080/health
```

### Python
```python
import requests

response = requests.get("http://localhost:8080/health")
print(response.json())
```

### JavaScript
```javascript
fetch('http://localhost:8080/health')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Response
```json
{
  "status": "ok",
  "service": "Product Intelligence Engine"
}
```

---

## 2. Discover Trends (Module 0)

### curl
```bash
curl -X POST http://localhost:8080/discover-trends \
  -H "Content-Type: application/json" \
  -d '{
    "region": "India",
    "category": "electronics",
    "time_range": "3_months"
  }'
```

### Python
```python
import requests

payload = {
    "region": "India",
    "category": "electronics",
    "time_range": "3_months"
}

response = requests.post(
    "http://localhost:8080/discover-trends",
    json=payload,
    timeout=120
)

data = response.json()
print(f"Found {len(data['top_opportunities'])} opportunities")
for opp in data['top_opportunities'][:5]:
    print(f"- {opp['product_name']}: {opp['trend_strength']:.0f}/100")
```

### JavaScript
```javascript
const payload = {
  region: "India",
  category: "electronics",
  time_range: "3_months"
};

fetch('http://localhost:8080/discover-trends', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
  .then(res => res.json())
  .then(data => {
    console.log(`Found ${data.top_opportunities.length} opportunities`);
    data.top_opportunities.slice(0, 5).forEach(opp => {
      console.log(`- ${opp.product_name}: ${opp.trend_strength}/100`);
    });
  });
```

### Response
```json
{
  "emerging_categories": [
    {
      "category": "electronics",
      "trend_strength": 78.5,
      "growth_velocity": "High",
      "suggested_products": [
        "wireless earbuds",
        "smart watch",
        "portable charger"
      ]
    }
  ],
  "seasonal_spikes": [
    "wireless earbuds",
    "fitness tracker"
  ],
  "innovation_signals": [
    "smart home devices",
    "AI-powered gadgets"
  ],
  "top_opportunities": [
    {
      "product_name": "wireless earbuds",
      "category": "electronics",
      "trend_strength": 85.2,
      "growth_velocity": "High",
      "search_volume_estimate": 45000,
      "source": "google_trends",
      "confidence": 0.85,
      "suggested_keywords": [
        "wireless earbuds",
        "bluetooth earbuds",
        "true wireless"
      ]
    }
  ],
  "scan_timestamp": "2024-03-04T10:30:00",
  "data_sources_used": ["google_trends", "amazon_movers", "reddit"],
  "message": "Found 20 opportunities from 3 data sources"
}
```

---

## 3. Analyze Product (Module 2)

### curl
```bash
curl -X POST http://localhost:8080/analyze-product \
  -H "Content-Type": application/json" \
  -d '{
    "product": "portable blender",
    "country": "India",
    "platform": "Amazon",
    "budget": 50000,
    "cost_per_unit": 900
  }'
```

### Python
```python
import requests

payload = {
    "product": "portable blender",
    "country": "India",
    "platform": "Amazon",
    "budget": 50000,
    "cost_per_unit": 900  # Optional
}

response = requests.post(
    "http://localhost:8080/analyze-product",
    json=payload,
    timeout=180
)

data = response.json()
print(f"Product: {data['product']}")
print(f"Demand Score: {data['demand_score']:.1f}/100")
print(f"Competition Score: {data['competition_score']:.1f}/100")
print(f"Viability: {data['viability_label']} ({data['risk_level']} risk)")
print(f"Suggested Price: ₹{data['suggested_price']:.2f}")
print(f"Monthly Profit: ₹{data['estimated_monthly_profit']:.2f}")
print(f"ROI: {data['roi_percent']:.1f}%")
print(f"Break-even: {data['break_even_months']:.1f} months")
print(f"\nRecommendation: {data['final_recommendation']}")
```

### JavaScript
```javascript
const payload = {
  product: "portable blender",
  country: "India",
  platform: "Amazon",
  budget: 50000,
  cost_per_unit: 900
};

fetch('http://localhost:8080/analyze-product', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
  .then(res => res.json())
  .then(data => {
    console.log(`Product: ${data.product}`);
    console.log(`Demand: ${data.demand_score}/100`);
    console.log(`Competition: ${data.competition_score}/100`);
    console.log(`Viability: ${data.viability_label}`);
    console.log(`Recommendation: ${data.final_recommendation}`);
  });
```

### Response
```json
{
  "product": "portable blender",
  "country": "India",
  "platform": "Amazon",
  "budget": 50000,
  "demand_score": 72.4,
  "competition_score": 58.1,
  "viability_score": 20.1,
  "confidence_score": 100.0,
  "avg_market_price": 2100.0,
  "suggested_price": 2454.0,
  "profit_margin": 28.5,
  "estimated_monthly_sales": 580,
  "estimated_monthly_profit": 38200.0,
  "roi_percent": 76.4,
  "break_even_months": 1.3,
  "risk_level": "Medium",
  "viability_label": "Moderate",
  "sales_basis": "demand_score",
  "profit_scenarios": [
    {
      "scenario": "Conservative",
      "estimated_monthly_sales": 377,
      "revenue": 925398.0,
      "cogs": 339300.0,
      "platform_fee": 138809.7,
      "ad_spend": 92539.8,
      "net_profit": 354748.5,
      "roi_percent": 709.5,
      "break_even_months": 0.14
    },
    {
      "scenario": "Expected",
      "estimated_monthly_sales": 580,
      "revenue": 1423320.0,
      "cogs": 522000.0,
      "platform_fee": 213498.0,
      "ad_spend": 142332.0,
      "net_profit": 545490.0,
      "roi_percent": 1090.98,
      "break_even_months": 0.09
    },
    {
      "scenario": "Aggressive",
      "estimated_monthly_sales": 812,
      "revenue": 1992648.0,
      "cogs": 730800.0,
      "platform_fee": 298897.2,
      "ad_spend": 199264.8,
      "net_profit": 763686.0,
      "roi_percent": 1527.37,
      "break_even_months": 0.07
    }
  ],
  "raw_signals": {
    "trend_avg": 65.2,
    "trend_growth": 12.5,
    "seasonality_variance": 8.3,
    "avg_price": 2100.0,
    "avg_reviews": 1250.0,
    "seller_count": 18,
    "review_velocity": 45.2,
    "sponsored_density": 0.35,
    "bsr": 15420,
    "cpc_score": 0.85,
    "monthly_search_volume": 12000,
    "keyword_competition": "MEDIUM",
    "supplier_cost_local": 900.0,
    "supplier_cost_source": "alibaba",
    "data_confidence": 1.0
  },
  "risk_explanation": "Demand is strong (72.4/100) and competition is manageable (58.1/100). Primary risk is sustaining demand post-launch.",
  "positioning_strategy": "Position as a quality-first option with strong product imagery and keyword-optimized listings to capture organic traffic quickly.",
  "final_recommendation": "Proceed with controlled launch",
  "market_entry_advice": "1. Source and list within 4 weeks. 2. Run PPC campaigns at 10% of revenue. 3. Gather 15+ reviews in month one. 4. Scale ad budget after break-even."
}
```

---

## 4. Full Pipeline (Module 1 → 2 → 3)

### curl
```bash
curl -X POST http://localhost:8080/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "product": "yoga mat",
    "country": "India",
    "budget": 30000,
    "platform": "Amazon",
    "risk_level": "medium",
    "experience": "beginner"
  }'
```

### Python
```python
import requests

payload = {
    "product": "yoga mat",
    "country": "India",
    "budget": 30000,
    "platform": "Amazon",
    "risk_level": "medium",
    "experience": "beginner"
}

response = requests.post(
    "http://localhost:8080/analyze",
    json=payload,
    timeout=180
)

data = response.json()
print(f"Status: {data['status']}")
print(f"\nProfile:")
print(f"  Budget: {data['profile']['effective_budget']}")
print(f"  Platform: {data['profile']['platform']}")
print(f"\nMarket:")
print(f"  Demand: {data['market']['demand_score']}")
print(f"  Competition: {data['market']['competition_score']}")
print(f"\nOptimization:")
print(f"  Selling Price: {data['optimization']['selling_price']}")
print(f"  Monthly Profit: {data['optimization']['monthly_profit']}")
```

### Response
```json
{
  "status": "success",
  "profile": {
    "niche": "yoga mat",
    "country": "India",
    "platform": "Amazon",
    "budget": 30000,
    "effective_budget": 30000,
    "risk_level": "medium",
    "experience": "beginner",
    "target_margin": 0.28,
    "country_fee": 0.15,
    "currency_symbol": "₹"
  },
  "market": {
    "demand_score": 65.3,
    "competition_score": 72.1,
    "trend_direction": "stable",
    "top_keywords": ["yoga mat", "yoga mat buy online", "yoga mat best price"],
    "supplier_cost": 250.0,
    "estimated_sales": 520,
    "llm_strategy": "Position in an ultra-specific niche..."
  },
  "optimization": {
    "selling_price": 850.0,
    "monthly_profit": 12500.0,
    "roi_percent": 41.7,
    "break_even_months": 2.4,
    "risk_level": "Medium",
    "profit_margin": 28.5
  },
  "message": "Full analysis complete for 'yoga mat' in India. Risk: Medium. Recommended price: $850.00."
}
```

---

## 5. History

### curl
```bash
curl "http://localhost:8080/history?limit=10"
```

### Python
```python
import requests

response = requests.get("http://localhost:8080/history", params={"limit": 10})
history = response.json()

for i, record in enumerate(history, 1):
    print(f"{i}. {record['product_name']} - {record['country']}")
    print(f"   Demand: {record['demand_score']:.1f}, Competition: {record['competition_score']:.1f}")
    print(f"   Risk: {record['risk_level']}, Profit: ₹{record['estimated_monthly_profit']:.0f}")
    print()
```

### JavaScript
```javascript
fetch('http://localhost:8080/history?limit=10')
  .then(res => res.json())
  .then(history => {
    history.forEach((record, i) => {
      console.log(`${i+1}. ${record.product_name} - ${record.country}`);
      console.log(`   Demand: ${record.demand_score}, Competition: ${record.competition_score}`);
      console.log(`   Risk: ${record.risk_level}, Profit: ₹${record.estimated_monthly_profit}`);
    });
  });
```

### Response
```json
[
  {
    "id": 1,
    "product_name": "portable blender",
    "country": "India",
    "platform": "Amazon",
    "demand_score": 72.4,
    "competition_score": 58.1,
    "viability_score": 20.1,
    "risk_level": "Medium",
    "profit_margin": 28.5,
    "estimated_monthly_profit": 38200.0,
    "created_at": "2024-03-04T10:30:00"
  }
]
```

---

## Error Responses

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "product"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Keyword research failed across all tiers (Google Ads API, SerpAPI, SERP scraping). Please check your API credentials or network connection."
}
```

---

## Batch Processing Example

### Python - Analyze Multiple Products
```python
import requests
import time

products = [
    "yoga mat",
    "portable blender",
    "resistance bands",
    "foam roller",
    "water bottle"
]

results = []

for product in products:
    print(f"Analyzing {product}...")
    
    payload = {
        "product": product,
        "country": "India",
        "platform": "Amazon",
        "budget": 50000
    }
    
    try:
        response = requests.post(
            "http://localhost:8080/analyze-product",
            json=payload,
            timeout=180
        )
        
        if response.status_code == 200:
            data = response.json()
            results.append({
                "product": product,
                "demand": data["demand_score"],
                "competition": data["competition_score"],
                "viability": data["viability_label"],
                "profit": data["estimated_monthly_profit"]
            })
            print(f"  ✓ {data['viability_label']} - ₹{data['estimated_monthly_profit']:.0f}/month")
        else:
            print(f"  ✗ Failed: {response.status_code}")
    
    except Exception as e:
        print(f"  ✗ Error: {e}")
    
    # Rate limiting
    time.sleep(5)

# Sort by profit
results.sort(key=lambda x: x["profit"], reverse=True)

print("\n=== Top Opportunities ===")
for i, r in enumerate(results[:3], 1):
    print(f"{i}. {r['product']}: ₹{r['profit']:.0f}/month ({r['viability']})")
```

---

## WebSocket Example (Future Feature)

```javascript
// Real-time analysis updates
const ws = new WebSocket('ws://localhost:8080/ws/analyze');

ws.onopen = () => {
  ws.send(JSON.stringify({
    product: "yoga mat",
    country: "India",
    budget: 30000
  }));
};

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log(`Step: ${update.step}`);
  console.log(`Progress: ${update.progress}%`);
  
  if (update.complete) {
    console.log('Analysis complete!', update.result);
  }
};
```

---

## Rate Limiting

Current limits (can be configured):
- `/discover-trends`: 10 requests/hour
- `/analyze-product`: 30 requests/hour
- `/analyze`: 20 requests/hour
- `/history`: 100 requests/hour

Headers returned:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1709550000
```

---

## Authentication (Future Feature)

```bash
# Get API key
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure123"}'

# Use API key
curl -X POST http://localhost:8080/analyze-product \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"product":"yoga mat",...}'
```

---

**For more examples, see the interactive API docs at http://localhost:8080/docs**
