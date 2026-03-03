"""
Data Collection Layer
=====================
All signals are sourced from REAL data — no simulated values.

Sources:
  1. Google Trends (pytrends)          → trend_avg, trend_growth, seasonality_variance
  2. Amazon search page scraping       → avg_price, avg_reviews, seller_count,
                                         sponsored_density, top_asin_list
  3. Amazon product page scraping      → BSR (Best Seller Rank) per top ASIN
  4. Amazon review page scraping       → real review_velocity (reviews/month)
                                         by parsing actual review timestamps
  5. keyword_research service          → cpc, monthly_search_volume (real keyword data)

Review Velocity methodology
----------------------------
  For the top 5 ASINs from search results:
    - Fetch the "Most Recent" reviews page
    - Count reviews posted within the last 30 days using the review date text
    - Average across all fetched ASINs
  This gives true monthly review inflow — a strong demand proxy.

BSR methodology
---------------
  Scrape the product detail page for each top ASIN.
  Parse "Best Sellers Rank" from the product information table.
  Return the primary category BSR. Used by the profit simulation engine
  to estimate real monthly unit sales (see profit_simulation.py).
"""

from __future__ import annotations

import logging
import re
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Optional

import requests
from bs4 import BeautifulSoup

from config import SCRAPE_HEADERS, SCRAPE_TIMEOUT
from services.keyword_research import get_keyword_data

log = logging.getLogger(__name__)

# ─────────────────────────────────────────────
#  Country → Amazon domain map
# ─────────────────────────────────────────────
_COUNTRY_DOMAINS: dict[str, str] = {
    "india": "in",
    "us": "com",
    "uk": "co.uk",
    "canada": "ca",
    "australia": "com.au",
    "uae": "ae",
}


def _domain(country: str) -> str:
    return _COUNTRY_DOMAINS.get(country.lower(), "in")


# ─────────────────────────────────────────────
#  Collected signals DTO
# ─────────────────────────────────────────────
@dataclass
class CollectedSignals:
    # Google Trends
    trend_avg: float = 0.0
    trend_growth: float = 0.0
    seasonality_variance: float = 0.0
    trend_ok: bool = False

    # Amazon
    avg_price: float = 0.0
    avg_reviews: float = 0.0
    seller_count: int = 0
    review_velocity: float = 0.0            # real: reviews/month from date parsing
    sponsored_density: float = 0.0
    top_asins: list = field(default_factory=list)
    bsr: int = 0                            # Best Seller Rank (0 = not found)
    amazon_ok: bool = False

    # CPC / search volume (real keyword data)
    cpc_score: float = 0.0
    monthly_search_volume: int = 0
    keyword_competition: str = "MEDIUM"
    keyword_ok: bool = False

    # Overall data confidence 0-1
    data_confidence: float = field(init=False)

    def __post_init__(self) -> None:
        hits = sum([self.trend_ok, self.amazon_ok, self.keyword_ok])
        self.data_confidence = round(hits / 3, 2)


# ═════════════════════════════════════════════════════════════════════════════
#  1. Google Trends
# ═════════════════════════════════════════════════════════════════════════════
def _get_trend_data(product: str, country: str) -> dict:
    from pytrends.request import TrendReq

    geo_map = {
        "india": "IN", "us": "US", "uk": "GB",
        "united states": "US", "united kingdom": "GB",
        "canada": "CA", "australia": "AU",
    }
    geo = geo_map.get(country.lower(), country[:2].upper())

    # urllib3 v2 removed method_whitelist; pytrends uses it when retries>0.
    # Always pass retries=0 — our outer exception handler manages retries.
    try:
        pytrends = TrendReq(hl="en-US", tz=330, timeout=(10, 30), retries=0, backoff_factor=0)
    except TypeError:
        pytrends = TrendReq(hl="en-US", tz=330, timeout=(10, 30))
    pytrends.build_payload([product], cat=0, timeframe="today 12-m", geo=geo)
    df = pytrends.interest_over_time()

    if df.empty or product not in df.columns:
        raise RuntimeError("Empty trends response")

    series = df[product].astype(float)
    trend_avg = float(series.mean())
    trend_growth = _compute_growth(series)
    seasonality_variance = float(series.std())

    return {
        "trend_avg": round(trend_avg, 2),
        "trend_growth": round(trend_growth, 2),
        "seasonality_variance": round(seasonality_variance, 2),
    }


def _compute_growth(series) -> float:
    """Compare last-3-month mean vs first-3-month mean → % change."""
    if len(series) < 6:
        return 0.0
    start = series.iloc[:3].mean()
    end = series.iloc[-3:].mean()
    if start == 0:
        return 0.0
    growth = ((end - start) / start) * 100
    return float(max(-100.0, min(100.0, growth)))


# ═════════════════════════════════════════════════════════════════════════════
#  2. Amazon Search Page
# ═════════════════════════════════════════════════════════════════════════════
def _fetch_page(url: str, params: Optional[dict] = None) -> BeautifulSoup:
    """Fetch a URL and return a parsed BeautifulSoup tree."""
    resp = requests.get(url, params=params, headers=SCRAPE_HEADERS, timeout=SCRAPE_TIMEOUT)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "lxml")


def _get_amazon_search_data(product: str, country: str) -> dict:
    """
    Scrape Amazon search results page.
    Returns: avg_price, avg_reviews, seller_count, sponsored_density, top_asins
    """
    dom = _domain(country)
    url = f"https://www.amazon.{dom}/s"
    soup = _fetch_page(url, params={"k": product})

    results = soup.select('[data-component-type="s-search-result"]')
    if not results:
        raise RuntimeError(f"No Amazon search results parsed for '{product}'")

    prices: list[float] = []
    reviews: list[float] = []
    asins: list[str] = []
    sponsored_count = 0

    for item in results[:20]:
        # ── ASIN (embedded in data-asin attribute) ─────────────────────────
        asin = item.get("data-asin", "").strip()
        if asin:
            asins.append(asin)

        # ── Price ──────────────────────────────────────────────────────────
        price_tag = item.select_one(".a-price .a-offscreen")
        if price_tag:
            raw = re.sub(r"[^\d.]", "", price_tag.get_text())
            try:
                val = float(raw)
                if val > 0:
                    prices.append(val)
            except ValueError:
                pass

        # ── Review count ───────────────────────────────────────────────────
        # aria-label="4,521 ratings" is the most reliable selector
        rating_tag = item.select_one(
            'span[aria-label*="rating"], '
            'span[aria-label*="ratings"], '
            '.a-size-small .a-size-base, '
            '[class*="review"] .a-size-base'
        )
        if rating_tag:
            text = rating_tag.get("aria-label", "") or rating_tag.get_text()
            raw_num = re.sub(r"[^\d]", "", text.replace(",", ""))
            try:
                val = float(raw_num)
                if val > 0:
                    reviews.append(val)
            except ValueError:
                pass

        # ── Sponsored density ──────────────────────────────────────────────
        # All known Amazon ad markup patterns
        is_sponsored = bool(
            item.select_one(
                '[data-component-type="sp-sponsored-result"], '
                '.puis-sponsored-label-text, '
                '[aria-label*="Sponsored"], '
                '[data-ad-type], '
                '.s-sponsored-label-info-icon'
            )
        )
        if is_sponsored:
            sponsored_count += 1

    n = len(results)
    avg_price = round(sum(prices) / len(prices), 2) if prices else 0.0
    avg_reviews = round(sum(reviews) / len(reviews), 2) if reviews else 0.0
    sponsored_density = round(sponsored_count / max(n, 1), 4)

    log.info(
        "Amazon search → %d results | price=%.2f | reviews=%.1f | sponsored=%.0f%%",
        n, avg_price, avg_reviews, sponsored_density * 100,
    )

    return {
        "avg_price": avg_price,
        "avg_reviews": avg_reviews,
        "seller_count": n,
        "sponsored_density": sponsored_density,
        "top_asins": asins[:5],
    }


# ═════════════════════════════════════════════════════════════════════════════
#  3. Amazon Product Page — BSR scraping
# ═════════════════════════════════════════════════════════════════════════════
def _get_bsr(asin: str, country: str) -> int:
    """
    Fetch the product detail page for *asin* and extract Best Seller Rank.

    Amazon renders BSR in two ways:
      a) Dedicated "#SalesRank" element
      b) "Best Sellers Rank" row in the product details table

    Returns the numeric BSR (1 = best seller). Returns 0 if not found.
    """
    dom = _domain(country)
    url = f"https://www.amazon.{dom}/dp/{asin}"
    soup = _fetch_page(url)

    bsr_text = ""

    # Method A: dedicated sales rank section
    rank_div = soup.select_one("#SalesRank, #detailBulletsWrapper_feature_div")
    if rank_div:
        bsr_text = rank_div.get_text(separator=" ")

    # Method B: product details table row
    if not bsr_text:
        for row in soup.select("tr, li"):
            heading = row.select_one("td.a-span3, span.a-text-bold, th")
            if heading and "best sellers rank" in heading.get_text().lower():
                bsr_text = row.get_text(separator=" ")
                break

    if not bsr_text:
        log.debug("BSR not found for ASIN=%s", asin)
        return 0

    # Extract first rank number, e.g. "#1,234" or "1,234"
    match = re.search(r"#?([\d,]+)", bsr_text)
    if match:
        try:
            return int(match.group(1).replace(",", ""))
        except ValueError:
            pass

    return 0


def _scrape_bsr_from_top_asins(asins: list[str], country: str, max_try: int = 3) -> int:
    """Try each of the top *max_try* ASINs; return the first valid BSR found."""
    for asin in asins[:max_try]:
        try:
            time.sleep(1.2)
            bsr = _get_bsr(asin, country)
            if bsr > 0:
                log.info("BSR=%d obtained from ASIN=%s", bsr, asin)
                return bsr
        except Exception as exc:
            log.debug("BSR fetch failed for ASIN=%s: %s", asin, exc)
    return 0


# ═════════════════════════════════════════════════════════════════════════════
#  4. Amazon Review Page — Real velocity from review timestamps
# ═════════════════════════════════════════════════════════════════════════════
_MONTH_MAP: dict[str, int] = {
    "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
    "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12,
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "jun": 6, "jul": 7,
    "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def _parse_review_date(date_text: str) -> Optional[datetime]:
    """
    Parse Amazon review date strings into timezone-aware datetimes.

    Handles formats:
      "Reviewed in India on 15 March 2024"
      "Reviewed in the United States on March 15, 2024"
      "15 March 2024"
      "March 15, 2024"
    """
    text = date_text.strip().lower()
    # Strip "reviewed in ... on "
    text = re.sub(r"reviewed in .+? on\s*", "", text).strip()

    # DD Month YYYY  (India / UK format)
    m = re.match(r"(\d{1,2})\s+([a-z]+)\s+(\d{4})", text)
    if m:
        day, mon_str, year = m.groups()
        month = _MONTH_MAP.get(mon_str[:3])
        if month:
            try:
                return datetime(int(year), month, int(day), tzinfo=timezone.utc)
            except ValueError:
                pass

    # Month DD, YYYY  (US format)
    m = re.match(r"([a-z]+)\s+(\d{1,2}),?\s+(\d{4})", text)
    if m:
        mon_str, day, year = m.groups()
        month = _MONTH_MAP.get(mon_str[:3])
        if month:
            try:
                return datetime(int(year), month, int(day), tzinfo=timezone.utc)
            except ValueError:
                pass

    return None


def _count_recent_reviews(asin: str, country: str, days: int = 30) -> int:
    """
    Fetch the Most Recent reviews for *asin*, parse dates, and count
    how many fall within the last *days* days.

    This is a real measurement of review inflow rate (monthly velocity proxy).
    """
    dom = _domain(country)
    url = f"https://www.amazon.{dom}/product-reviews/{asin}"
    params = {"sortBy": "recent", "reviewerType": "all_reviews", "pageNumber": "1"}

    time.sleep(1.5)
    soup = _fetch_page(url, params=params)

    cutoff = datetime.now(tz=timezone.utc) - timedelta(days=days)
    recent_count = 0
    total_parsed = 0

    date_tags = soup.select(
        "[data-hook='review-date'], .review-date, span[class*='review-date']"
    )
    for tag in date_tags:
        parsed = _parse_review_date(tag.get_text(separator=" ").strip())
        if parsed:
            total_parsed += 1
            if parsed >= cutoff:
                recent_count += 1

    log.info(
        "Review dates → ASIN=%s total_parsed=%d recent_30d=%d",
        asin, total_parsed, recent_count,
    )
    return recent_count


def _get_real_review_velocity(asins: list[str], country: str) -> float:
    """
    Average the 30-day review counts across the top *N* ASINs.
    Returns reviews/month as a float.
    """
    velocities: list[float] = []
    for asin in asins[:4]:
        try:
            count = _count_recent_reviews(asin, country, days=30)
            velocities.append(float(count))
        except Exception as exc:
            log.debug("Velocity scrape failed for ASIN=%s: %s", asin, exc)

    if not velocities:
        return 0.0

    avg = round(sum(velocities) / len(velocities), 2)
    log.info(
        "Real review velocity = %.1f reviews/month (avg across %d ASINs)",
        avg, len(velocities),
    )
    return avg


# ═════════════════════════════════════════════════════════════════════════════
#  Public entry point
# ═════════════════════════════════════════════════════════════════════════════
def collect_signals(product: str, country: str = "India") -> CollectedSignals:
    """
    Collect ALL raw signals from REAL external data sources.
    Each source sets its own *_ok flag; confidence is computed from those.
    """
    signals = CollectedSignals()

    # ── 1. Google Trends ────────────────────────────────────────────────────
    try:
        td = _get_trend_data(product, country)
        signals.trend_avg = td["trend_avg"]
        signals.trend_growth = td["trend_growth"]
        signals.seasonality_variance = td["seasonality_variance"]
        signals.trend_ok = True
        log.info("Trends ✓  avg=%.1f  growth=%.1f%%", signals.trend_avg, signals.trend_growth)
    except Exception as exc:
        log.warning("Google Trends failed: %s", exc)

    # ── 2. Amazon search page ────────────────────────────────────────────────
    try:
        time.sleep(1)
        ad = _get_amazon_search_data(product, country)
        signals.avg_price = ad["avg_price"]
        signals.avg_reviews = ad["avg_reviews"]
        signals.seller_count = ad["seller_count"]
        signals.sponsored_density = ad["sponsored_density"]
        signals.top_asins = ad["top_asins"]
        signals.amazon_ok = True
        log.info(
            "Amazon search ✓  price=%.2f  reviews=%.1f  sellers=%d  sponsored=%.0f%%",
            signals.avg_price, signals.avg_reviews,
            signals.seller_count, signals.sponsored_density * 100,
        )
    except Exception as exc:
        log.warning("Amazon search failed: %s", exc)

    # ── 3. BSR from product pages ────────────────────────────────────────────
    if signals.top_asins:
        try:
            signals.bsr = _scrape_bsr_from_top_asins(signals.top_asins, country)
            if signals.bsr > 0:
                log.info("BSR ✓  bsr=%d", signals.bsr)
        except Exception as exc:
            log.warning("BSR scrape failed: %s", exc)

    # ── 4. Real review velocity from timestamps ──────────────────────────────
    if signals.top_asins:
        try:
            signals.review_velocity = _get_real_review_velocity(signals.top_asins, country)
            log.info("Review velocity ✓  %.1f reviews/month", signals.review_velocity)
        except Exception as exc:
            log.warning("Review velocity scrape failed: %s", exc)

    # ── 5. Real CPC + search volume ───────────────────────────────────────────
    try:
        kw = get_keyword_data(product, country)
        signals.cpc_score = kw["cpc"]
        signals.monthly_search_volume = kw["monthly_search_volume"]
        signals.keyword_competition = kw.get("competition", "MEDIUM")
        signals.keyword_ok = True
        log.info(
            "Keywords ✓  cpc=%.3f  volume=%d  competition=%s  (via %s)",
            signals.cpc_score, signals.monthly_search_volume,
            signals.keyword_competition, kw.get("source", "?"),
        )
    except Exception as exc:
        log.warning("Keyword research failed: %s", exc)

    # ── Recompute confidence ──────────────────────────────────────────────────
    hits = sum([signals.trend_ok, signals.amazon_ok, signals.keyword_ok])
    signals.data_confidence = round(hits / 3, 2)

    log.info(
        "Collection complete — confidence=%.0f%% (trends=%s amazon=%s keywords=%s)",
        signals.data_confidence * 100,
        "✓" if signals.trend_ok else "✗",
        "✓" if signals.amazon_ok else "✗",
        "✓" if signals.keyword_ok else "✗",
    )

    return signals
