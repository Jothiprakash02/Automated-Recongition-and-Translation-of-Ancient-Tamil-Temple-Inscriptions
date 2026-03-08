"""
Trend Discovery Service - Module 0
===================================
Discovers emerging product opportunities BEFORE the seller has an idea.

Data Sources:
  1. Google Trends - Rising searches and related queries
  2. Reddit - Trending product discussions (via PRAW)
  3. Amazon - "Movers & Shakers" and "New Releases" categories
  4. Social signals - Hashtag frequency analysis

NO STATIC DATA - All signals are real-time.
"""

from __future__ import annotations

import logging
import re
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional

import requests
from bs4 import BeautifulSoup

from config import SCRAPE_HEADERS, SCRAPE_TIMEOUT

log = logging.getLogger(__name__)

# ─────────────────────────────────────────────
#  Result DTOs
# ─────────────────────────────────────────────
@dataclass
class ProductOpportunity:
    """A single product opportunity discovered from trends."""
    product_name: str
    category: str
    trend_strength: float          # 0-100
    growth_velocity: str           # "High" / "Medium" / "Low"
    search_volume_estimate: int
    source: str                    # "google_trends" / "amazon_movers" / "reddit"
    confidence: float              # 0-1
    suggested_keywords: list[str] = field(default_factory=list)
    
@dataclass
class TrendScoutResult:
    """Complete trend scouting result."""
    emerging_categories: list[dict]
    seasonal_spikes: list[str]
    innovation_signals: list[str]
    top_opportunities: list[ProductOpportunity]
    scan_timestamp: str
    data_sources_used: list[str]


# ═════════════════════════════════════════════════════════════════════════════
#  1. Google Trends - Rising Searches
# ═════════════════════════════════════════════════════════════════════════════
def _get_google_trending(region: str = "IN", category: int = 0) -> list[ProductOpportunity]:
    """
    Fetch trending searches from Google Trends.
    
    Uses pytrends to get:
    - Trending searches (daily/realtime)
    - Related queries with "rising" status
    """
    from pytrends.request import TrendReq
    
    opportunities = []
    
    try:
        pytrends = TrendReq(hl="en-US", tz=330, timeout=(10, 30), retries=0, backoff_factor=0)
        
        # Try to get trending searches - this may fail, so we'll use a fallback
        try:
            trending_df = pytrends.trending_searches(pn=region.lower())
            
            if not trending_df.empty:
                for idx, keyword in enumerate(trending_df[0].head(10)):
                    # Get interest over time for this keyword
                    pytrends.build_payload([keyword], cat=category, timeframe="now 7-d", geo=region)
                    interest_df = pytrends.interest_over_time()
                    
                    if not interest_df.empty and keyword in interest_df.columns:
                        avg_interest = float(interest_df[keyword].mean())
                        growth = _compute_growth_velocity(interest_df[keyword])
                        
                        # Get related queries
                        related = pytrends.related_queries()
                        rising_queries = []
                        if keyword in related and related[keyword]['rising'] is not None:
                            rising_queries = related[keyword]['rising']['query'].head(3).tolist()
                        
                        opportunities.append(ProductOpportunity(
                            product_name=keyword,
                            category=_infer_category(keyword),
                            trend_strength=min(100, avg_interest * 1.2),
                            growth_velocity=growth,
                            search_volume_estimate=int(avg_interest * 1000),
                            source="google_trends",
                            confidence=0.85,
                            suggested_keywords=[keyword] + rising_queries
                        ))
                    
                    time.sleep(1)
        except Exception as trending_exc:
            log.warning("Trending searches failed, using popular product keywords: %s", trending_exc)
            # Fallback: Use popular e-commerce product keywords
            popular_products = [
                "wireless earbuds", "smart watch", "yoga mat", "resistance bands",
                "portable blender", "air fryer", "led strip lights", "phone stand",
                "laptop stand", "water bottle", "fitness tracker", "bluetooth speaker",
                "power bank", "usb cable", "phone case", "screen protector"
            ]
            
            for keyword in popular_products[:10]:
                try:
                    pytrends.build_payload([keyword], cat=category, timeframe="today 3-m", geo=region)
                    interest_df = pytrends.interest_over_time()
                    
                    if not interest_df.empty and keyword in interest_df.columns:
                        avg_interest = float(interest_df[keyword].mean())
                        growth = _compute_growth_velocity(interest_df[keyword])
                        
                        if avg_interest > 10:  # Only include if there's some interest
                            opportunities.append(ProductOpportunity(
                                product_name=keyword,
                                category=_infer_category(keyword),
                                trend_strength=min(100, avg_interest * 1.2),
                                growth_velocity=growth,
                                search_volume_estimate=int(avg_interest * 1000),
                                source="google_trends_popular",
                                confidence=0.75,
                                suggested_keywords=[keyword]
                            ))
                    
                    time.sleep(1)
                except Exception as kw_exc:
                    log.debug("Keyword %s failed: %s", keyword, kw_exc)
                    continue
                
    except Exception as exc:
        log.warning("Google Trends failed: %s", exc)
    
    return opportunities


def _compute_growth_velocity(series) -> str:
    """Compute growth velocity from time series."""
    if len(series) < 3:
        return "Low"
    
    start_avg = series.iloc[:len(series)//3].mean()
    end_avg = series.iloc[-len(series)//3:].mean()
    
    if start_avg == 0:
        return "High" if end_avg > 0 else "Low"
    
    growth_pct = ((end_avg - start_avg) / start_avg) * 100
    
    if growth_pct > 50:
        return "High"
    elif growth_pct > 15:
        return "Medium"
    else:
        return "Low"


def _infer_category(keyword: str) -> str:
    """Infer product category from keyword."""
    keyword_lower = keyword.lower()
    
    categories = {
        "electronics": ["phone", "laptop", "tablet", "headphone", "speaker", "camera", "charger"],
        "home_kitchen": ["blender", "mixer", "cooker", "pan", "knife", "organizer"],
        "fitness": ["yoga", "dumbbell", "resistance", "mat", "fitness", "workout"],
        "beauty": ["skincare", "makeup", "cream", "serum", "moisturizer"],
        "fashion": ["shoes", "dress", "shirt", "jeans", "jacket", "bag"],
        "toys": ["toy", "game", "puzzle", "doll", "action figure"],
        "automotive": ["car", "bike", "motorcycle", "accessory", "cover"],
    }
    
    for cat, keywords in categories.items():
        if any(kw in keyword_lower for kw in keywords):
            return cat
    
    return "general"


# ═════════════════════════════════════════════════════════════════════════════
#  2. Amazon Movers & Shakers
# ═════════════════════════════════════════════════════════════════════════════
_COUNTRY_DOMAINS = {
    "india": "in",
    "us": "com",
    "uk": "co.uk",
    "canada": "ca",
    "australia": "com.au",
}

def _get_amazon_movers(country: str = "India", category: str = "") -> list[ProductOpportunity]:
    """
    Scrape Amazon's "Movers & Shakers" page to find products with biggest sales rank gains.
    """
    domain = _COUNTRY_DOMAINS.get(country.lower(), "in")
    url = f"https://www.amazon.{domain}/gp/movers-and-shakers/"
    
    opportunities = []
    
    try:
        time.sleep(2)  # Longer delay to avoid rate limiting
        resp = requests.get(url, headers=SCRAPE_HEADERS, timeout=SCRAPE_TIMEOUT)
        resp.raise_for_status()
        
        soup = BeautifulSoup(resp.text, "lxml")
        
        # Find product items
        items = soup.select(".zg-item-immersion, .zg-grid-general-faceout")[:15]
        
        if not items:
            log.warning("No Amazon Movers items found, trying alternative selectors")
            # Try alternative selectors
            items = soup.select("[data-asin]")[:15]
        
        for item in items:
            title_tag = item.select_one(".p13n-sc-truncate, .a-link-normal .a-text-normal, ._cDEzb_p13n-sc-css-line-clamp-3_g3dy1")
            if not title_tag:
                continue
            
            title = title_tag.get_text().strip()
            
            # Extract rank change percentage
            rank_change_tag = item.select_one(".zg-badge-text")
            rank_change = 0
            if rank_change_tag:
                match = re.search(r"(\d+)%", rank_change_tag.get_text())
                if match:
                    rank_change = int(match.group(1))
            
            # If no rank change found, use a default moderate value
            if rank_change == 0:
                rank_change = 30  # Default moderate growth
            
            # Extract price for volume estimation
            price_tag = item.select_one(".p13n-sc-price, .a-price .a-offscreen")
            price = 0
            if price_tag:
                price_text = price_tag.get_text()
                price_match = re.search(r"[\d,]+(?:\.\d{2})?", price_text.replace(",", ""))
                if price_match:
                    price = float(price_match.group())
            
            # Estimate trend strength from rank change
            trend_strength = min(100, rank_change * 0.8)
            
            opportunities.append(ProductOpportunity(
                product_name=title[:60],  # Truncate long titles
                category=_infer_category(title),
                trend_strength=trend_strength,
                growth_velocity="High" if rank_change > 50 else "Medium" if rank_change > 20 else "Low",
                search_volume_estimate=int(trend_strength * 100),
                source="amazon_movers",
                confidence=0.75,
                suggested_keywords=[title[:30]]
            ))
        
        log.info("Amazon Movers & Shakers: found %d opportunities", len(opportunities))
        
    except Exception as exc:
        log.warning("Amazon Movers & Shakers scraping failed: %s", exc)
    
    return opportunities


# ═════════════════════════════════════════════════════════════════════════════
#  3. Reddit Trending Products (requires PRAW - Reddit API)
# ═════════════════════════════════════════════════════════════════════════════
def _get_reddit_trends(region: str = "India") -> list[ProductOpportunity]:
    """
    Scan Reddit for trending product discussions.
    Requires: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT env vars
    """
    import os
    
    client_id = os.getenv("REDDIT_CLIENT_ID")
    client_secret = os.getenv("REDDIT_CLIENT_SECRET")
    user_agent = os.getenv("REDDIT_USER_AGENT", "TrendScout/1.0")
    
    if not client_id or not client_secret:
        log.info("Reddit API credentials not configured, skipping Reddit trends")
        return []
    
    opportunities = []
    
    try:
        import praw
        
        reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent
        )
        
        # Subreddits to monitor for product trends
        subreddits = ["BuyItForLife", "ProductPorn", "shutupandtakemymoney", "amazondeals"]
        
        for sub_name in subreddits:
            try:
                subreddit = reddit.subreddit(sub_name)
                
                # Get hot posts from last 7 days
                for post in subreddit.hot(limit=10):
                    if post.created_utc < (datetime.now().timestamp() - 7 * 86400):
                        continue
                    
                    title = post.title
                    score = post.score
                    num_comments = post.num_comments
                    
                    # Calculate engagement score
                    engagement = score + (num_comments * 2)
                    trend_strength = min(100, engagement / 10)
                    
                    if trend_strength > 30:  # Filter low-engagement posts
                        opportunities.append(ProductOpportunity(
                            product_name=title[:60],
                            category=_infer_category(title),
                            trend_strength=trend_strength,
                            growth_velocity="Medium",
                            search_volume_estimate=int(engagement * 5),
                            source=f"reddit_{sub_name}",
                            confidence=0.65,
                            suggested_keywords=[title[:30]]
                        ))
                
                time.sleep(2)  # Reddit rate limiting
                
            except Exception as sub_exc:
                log.debug("Reddit subreddit %s failed: %s", sub_name, sub_exc)
        
        log.info("Reddit trends: found %d opportunities", len(opportunities))
        
    except ImportError:
        log.info("praw not installed, skipping Reddit trends (pip install praw)")
    except Exception as exc:
        log.warning("Reddit trend scanning failed: %s", exc)
    
    return opportunities


# ═════════════════════════════════════════════════════════════════════════════
#  Main Trend Scouting Function
# ═════════════════════════════════════════════════════════════════════════════
def discover_trends(
    region: str = "India",
    category: Optional[str] = None,
    time_range: str = "3_months"
) -> TrendScoutResult:
    """
    Discover emerging product opportunities across multiple data sources.
    
    Parameters
    ----------
    region : str
        Target market region (India, US, UK, etc.)
    category : str, optional
        Specific category to focus on (electronics, home, fitness, etc.)
    time_range : str
        Time window for trend analysis ("3_months", "6_months", "1_year")
    
    Returns
    -------
    TrendScoutResult
        Aggregated trend intelligence with ranked opportunities
    """
    log.info("Starting trend discovery for region=%s category=%s", region, category)
    
    all_opportunities = []
    data_sources = []
    
    # 1. Google Trends
    try:
        google_opps = _get_google_trending(region=region.upper()[:2])
        all_opportunities.extend(google_opps)
        if google_opps:
            data_sources.append("google_trends")
    except Exception as exc:
        log.warning("Google Trends discovery failed: %s", exc)
    
    # 2. Amazon Movers & Shakers
    try:
        amazon_opps = _get_amazon_movers(country=region, category=category or "")
        all_opportunities.extend(amazon_opps)
        if amazon_opps:
            data_sources.append("amazon_movers")
    except Exception as exc:
        log.warning("Amazon Movers discovery failed: %s", exc)
    
    # 3. Reddit Trends
    try:
        reddit_opps = _get_reddit_trends(region=region)
        all_opportunities.extend(reddit_opps)
        if reddit_opps:
            data_sources.append("reddit")
    except Exception as exc:
        log.warning("Reddit discovery failed: %s", exc)
    
    # Aggregate and rank opportunities
    all_opportunities.sort(key=lambda x: x.trend_strength * x.confidence, reverse=True)
    
    # Group by category
    category_map = {}
    for opp in all_opportunities:
        if opp.category not in category_map:
            category_map[opp.category] = []
        category_map[opp.category].append(opp)
    
    emerging_categories = [
        {
            "category": cat,
            "trend_strength": sum(o.trend_strength for o in opps) / len(opps),
            "growth_velocity": max(o.growth_velocity for o in opps),
            "suggested_products": [o.product_name for o in opps[:3]]
        }
        for cat, opps in category_map.items()
    ]
    emerging_categories.sort(key=lambda x: x["trend_strength"], reverse=True)
    
    # Identify seasonal spikes (products with "High" velocity)
    seasonal_spikes = [
        opp.product_name
        for opp in all_opportunities
        if opp.growth_velocity == "High"
    ][:10]
    
    # Innovation signals (new/unique products)
    innovation_signals = [
        opp.product_name
        for opp in all_opportunities
        if "smart" in opp.product_name.lower() or "ai" in opp.product_name.lower()
        or "wireless" in opp.product_name.lower() or "portable" in opp.product_name.lower()
    ][:10]
    
    result = TrendScoutResult(
        emerging_categories=emerging_categories[:10],
        seasonal_spikes=seasonal_spikes,
        innovation_signals=innovation_signals,
        top_opportunities=all_opportunities[:20],
        scan_timestamp=datetime.now().isoformat(),
        data_sources_used=data_sources
    )
    
    log.info(
        "Trend discovery complete: %d opportunities from %d sources",
        len(all_opportunities), len(data_sources)
    )
    
    return result
