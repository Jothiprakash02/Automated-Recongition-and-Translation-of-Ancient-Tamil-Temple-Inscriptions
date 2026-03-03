"""
Configuration settings for the Product & Market Intelligence Engine.
"""

import os

# --- Database ---
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./product_intelligence.db")

# --- Ollama / LLM ---
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3:8b")
OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "120"))  # seconds

# --- Scoring weights ---
DEMAND_WEIGHTS = {
    "trend_avg": 0.35,
    "trend_growth": 0.20,
    "review_velocity": 0.25,
    "cpc_score": 0.10,
    "search_volume": 0.10,
}

COMPETITION_WEIGHTS = {
    "seller_count": 0.40,
    "avg_reviews": 0.35,
    "sponsored_density": 0.25,
}

VIABILITY_WEIGHTS = {
    "demand": 0.6,
    "competition": -0.4,
}

# --- Profit simulation ---
DEMAND_TO_SALES_FACTOR = 8          # sales units = demand_score × factor
PLATFORM_FEE_RATE = 0.15
AD_SPEND_RATE = 0.10

# Conservative / Expected / Aggressive sales multipliers
SCENARIO_MULTIPLIERS = {
    "conservative": 0.65,
    "expected": 1.00,
    "aggressive": 1.40,
}

# --- Amazon scraping ---
AMAZON_BASE_URL = "https://www.amazon.in/s"
SCRAPE_TIMEOUT = 15   # seconds
SCRAPE_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# --- Keyword Research API keys (optional — service cascades through tiers) ---
# Tier 1: Google Ads Keyword Planner
GOOGLE_ADS_DEVELOPER_TOKEN = os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN", "")
GOOGLE_ADS_CLIENT_ID = os.getenv("GOOGLE_ADS_CLIENT_ID", "")
GOOGLE_ADS_CLIENT_SECRET = os.getenv("GOOGLE_ADS_CLIENT_SECRET", "")
GOOGLE_ADS_REFRESH_TOKEN = os.getenv("GOOGLE_ADS_REFRESH_TOKEN", "")
GOOGLE_ADS_LOGIN_CUSTOMER_ID = os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID", "")

# Tier 2: SerpAPI
SERPAPI_KEY = os.getenv("SERPAPI_KEY", "")
# Tier 3: Direct SERP scraping with ad-count proxy (no key needed)
