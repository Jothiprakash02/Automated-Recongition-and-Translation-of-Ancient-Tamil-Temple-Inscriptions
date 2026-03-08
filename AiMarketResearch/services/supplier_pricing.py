"""
Supplier Pricing Service
========================
Fetches REAL supplier / wholesale cost per unit via:

  Tier 1 — Alibaba.com HTML scraping
             Searches alibaba.com/trade/search, parses min-order price ranges.
             Returns median FOB price in USD, then converts to local currency
             using a live exchange-rate fetch (exchangerate-api free tier).

  Tier 2 — AliExpress mobile lite scraping
             Fetches https://m.aliexpress.com/w/wholesale-{keyword}.html
             Parses prices from the static-rendered listing.

  Tier 3 — Category-regression formula
             If both scraping tiers fail, applies published Alibaba→retail
             margin data to back-calculate supplier cost:
               Electronics   → 18–25% of retail
               Appliances     → 20–30%
               Accessories    → 25–40%
               Default        → 28% of retail

Landed cost calculation
-----------------------
Raw Alibaba price is FOB China.
For India (primary market) we add:
  + Freight / CIF               ~8–12% of FOB
  + Basic Customs Duty (BCD)    ~10–20% (category-specific)
  + IGST on imports             18%
  + CESS / other charges        ~2%

Final landed_cost = fob_price × landed_multiplier
"""

from __future__ import annotations

import logging
import os
import re
import time
from typing import Optional

import requests

from config import SCRAPE_HEADERS, SCRAPE_TIMEOUT

log = logging.getLogger(__name__)

# ─── Category → import duty rate (India BCD) ─────────────────────────────────
_DUTY_RATES: dict[str, float] = {
    "electronics": 0.20,
    "phone": 0.20,
    "laptop": 0.20,
    "headphone": 0.15,
    "earphone": 0.15,
    "speaker": 0.15,
    "camera": 0.15,
    "blender": 0.12,
    "appliance": 0.12,
    "kitchen": 0.12,
    "fitness": 0.10,
    "toy": 0.12,
    "clothing": 0.20,
    "accessory": 0.15,
    "default": 0.15,
}

_FREIGHT_RATE = 0.10     # 10% of FOB as average sea freight + CIF
_IGST_RATE = 0.18
_CESS_RATE = 0.02

# ─── Category → retail margin range (Alibaba research, 2024) ─────────────────
_CATEGORY_MARGINS: dict[str, float] = {
    "electronics": 0.22,
    "phone": 0.20,
    "laptop": 0.18,
    "headphone": 0.25,
    "blender": 0.28,
    "kitchen": 0.28,
    "appliance": 0.28,
    "fitness": 0.30,
    "toy": 0.32,
    "clothing": 0.35,
    "accessory": 0.30,
    "default": 0.28,
}


def _get_duty_rate(product: str) -> float:
    lower = product.lower()
    for key, rate in _DUTY_RATES.items():
        if key in lower:
            return rate
    return _DUTY_RATES["default"]


def _get_category_cost_ratio(product: str) -> float:
    """FOB cost as fraction of retail price (inverse of gross margin)."""
    lower = product.lower()
    for key, margin in _CATEGORY_MARGINS.items():
        if key in lower:
            return margin
    return _CATEGORY_MARGINS["default"]


# ═════════════════════════════════════════════════════════════════════════════
#  Exchange rate — live fetch (exchangerate-api free tier, no key needed)
# ═════════════════════════════════════════════════════════════════════════════
_CURRENCY_CODES = {
    "india": "INR",
    "us": "USD",
    "uk": "GBP",
    "canada": "CAD",
    "australia": "AUD",
    "default": "INR",
}

_rate_cache: dict[str, float] = {}   # simple in-process cache


def _usd_to_local(usd_amount: float, country: str) -> float:
    """Convert USD amount to local currency using live exchange rate."""
    currency = _CURRENCY_CODES.get(country.lower(), "INR")
    if currency == "USD":
        return usd_amount

    cache_key = f"USD_{currency}"
    if cache_key in _rate_cache:
        return round(usd_amount * _rate_cache[cache_key], 2)

    try:
        url = f"https://open.er-api.com/v6/latest/USD"
        resp = requests.get(url, timeout=8)
        resp.raise_for_status()
        rates = resp.json().get("rates", {})
        rate = rates.get(currency, 83.0)  # fallback: ~INR 83 per USD
        _rate_cache[cache_key] = rate
        log.info("Exchange rate USD→%s = %.2f", currency, rate)
        return round(usd_amount * rate, 2)
    except Exception as exc:
        log.warning("Exchange rate fetch failed (%s). Using hardcoded rate.", exc)
        hardcoded = {"INR": 83.5, "GBP": 0.79, "CAD": 1.36, "AUD": 1.53}
        rate = hardcoded.get(currency, 83.5)
        return round(usd_amount * rate, 2)


# ═════════════════════════════════════════════════════════════════════════════
#  TIER 1 — Alibaba.com scraping
# ═════════════════════════════════════════════════════════════════════════════
def _tier1_alibaba(product: str) -> float:
    """
    Scrape Alibaba.com search results for *product*.
    Returns median FOB price in USD.
    """
    url = "https://www.alibaba.com/trade/search"
    params = {
        "SearchText": product,
        "IndexArea": "product_en",
        "tab": "all",
    }
    headers = {
        **SCRAPE_HEADERS,
        "Referer": "https://www.alibaba.com/",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    time.sleep(1.5)
    resp = requests.get(url, params=params, headers=headers, timeout=SCRAPE_TIMEOUT)
    resp.raise_for_status()

    from bs4 import BeautifulSoup

    soup = BeautifulSoup(resp.text, "lxml")

    prices: list[float] = []

    # Alibaba renders price ranges like "$1.50 - $5.00" per unit
    # Selectors: .price, .search-card-e-price-main, .product-price
    price_tags = soup.select(
        ".price, .search-card-e-price-main, .product-price, "
        "[class*='price'],[class*='Price']"
    )

    price_pattern = re.compile(r"\$[\d,]+(?:\.\d{1,2})?")

    for tag in price_tags[:30]:
        text = tag.get_text(separator=" ")
        found = price_pattern.findall(text)
        for p_str in found:
            try:
                val = float(p_str.replace("$", "").replace(",", ""))
                if 0.10 <= val <= 500:    # sanity range for a single unit
                    prices.append(val)
            except ValueError:
                pass

    if not prices:
        raise RuntimeError("No prices found on Alibaba")

    prices.sort()
    # Use 25th percentile — typical competitive sourcing price
    idx = max(0, len(prices) // 4)
    fob_price = prices[idx]

    log.info(
        "Alibaba → %d prices found, 25th pct FOB=USD%.2f for '%s'",
        len(prices), fob_price, product,
    )
    return fob_price


# ═════════════════════════════════════════════════════════════════════════════
#  TIER 2 — AliExpress mobile lite scraping
# ═════════════════════════════════════════════════════════════════════════════
def _tier2_aliexpress(product: str) -> float:
    """
    Scrape AliExpress mobile listing for *product*.
    Returns median listing price (USD) as a conservative B2C supplier cost.
    Note: AliExpress is B2C so prices are higher than Alibaba B2B;
          apply a 0.60 discount factor to approximate B2B/MOQ pricing.
    """
    keyword_slug = product.strip().lower().replace(" ", "-")
    url = f"https://www.aliexpress.com/wholesale"
    params = {"SearchText": product, "SortType": "price_asc"}

    headers = {
        **SCRAPE_HEADERS,
        "Referer": "https://www.aliexpress.com/",
    }

    time.sleep(2)
    resp = requests.get(url, params=params, headers=headers, timeout=SCRAPE_TIMEOUT)
    resp.raise_for_status()

    from bs4 import BeautifulSoup

    soup = BeautifulSoup(resp.text, "lxml")

    prices: list[float] = []
    # AliExpress prices shown as "US $X.XX"
    price_pattern = re.compile(r"US \$[\d,]+(?:\.\d{1,2})?")

    for tag in soup.find_all(string=price_pattern):
        try:
            match = price_pattern.search(tag)
            if match:
                val = float(match.group().replace("US $", "").replace(",", ""))
                if 0.10 <= val <= 500:
                    prices.append(val)
        except (ValueError, AttributeError):
            pass

    if not prices:
        raise RuntimeError("No prices found on AliExpress")

    prices.sort()
    median_price = prices[len(prices) // 2]
    # Apply B2C-to-B2B discount factor
    fob_estimate = round(median_price * 0.60, 2)

    log.info(
        "AliExpress → %d prices, median B2C=USD%.2f → B2B est=USD%.2f for '%s'",
        len(prices), median_price, fob_estimate, product,
    )
    return fob_estimate


# ═════════════════════════════════════════════════════════════════════════════
#  TIER 3 — Category-regression formula
# ═════════════════════════════════════════════════════════════════════════════
def _tier3_formula(product: str, retail_price_local: float, country: str) -> float:
    """
    Back-calculate FOB cost from retail price using published category margins.
    Converts to USD for consistency with other tiers.
    """
    ratio = _get_category_cost_ratio(product)
    # retail_price_local is in local currency — convert to USD
    currency = _CURRENCY_CODES.get(country.lower(), "INR")
    usd_per_local: dict[str, float] = {
        "INR": 1 / 83.5, "GBP": 1 / 0.79,
        "CAD": 1 / 1.36, "AUD": 1 / 1.53, "USD": 1.0,
    }
    retail_usd = retail_price_local * usd_per_local.get(currency, 1 / 83.5)
    fob_usd = retail_usd * ratio
    log.info(
        "Formula tier → product='%s' retail_local=%.2f → FOB_USD=%.2f (ratio=%.2f)",
        product, retail_price_local, fob_usd, ratio,
    )
    return round(fob_usd, 2)


# ═════════════════════════════════════════════════════════════════════════════
#  Landed cost computation
# ═════════════════════════════════════════════════════════════════════════════
def _fob_to_landed(fob_usd: float, product: str, country: str) -> float:
    """
    Convert FOB (factory price) to fully landed cost in local currency.

    Landed = FOB × (1 + freight + duty + IGST + CESS)

    Returns landed cost in local currency.
    """
    duty = _get_duty_rate(product)
    landed_multiplier = 1 + _FREIGHT_RATE + duty + _IGST_RATE + _CESS_RATE
    landed_usd = fob_usd * landed_multiplier
    landed_local = _usd_to_local(landed_usd, country)

    log.info(
        "Landed cost → FOB=USD%.2f duty=%.0f%% → landed_local=%.2f",
        fob_usd, duty * 100, landed_local,
    )
    return landed_local


# ═════════════════════════════════════════════════════════════════════════════
#  Public entry point
# ═════════════════════════════════════════════════════════════════════════════
def get_supplier_cost(
    product: str,
    country: str = "India",
    retail_price: Optional[float] = None,
) -> dict:
    """
    Return real supplier cost per unit (landed, in local currency).

    Parameters
    ----------
    product       : search keyword (e.g. "portable blender")
    country       : destination market
    retail_price  : current market price (used by Tier 3 only)

    Returns
    -------
    {
        "fob_price_usd"        : float,   # factory price
        "landed_cost_local"    : float,   # total import cost, local currency
        "source"               : str,     # alibaba / aliexpress / formula
    }
    """
    fob_usd: Optional[float] = None
    source = "unknown"

    # Tier 1 — Alibaba
    try:
        fob_usd = _tier1_alibaba(product)
        source = "alibaba"
    except Exception as exc:
        log.info("Alibaba scrape failed (%s), trying AliExpress", exc)

    # Tier 2 — AliExpress
    if fob_usd is None:
        try:
            fob_usd = _tier2_aliexpress(product)
            source = "aliexpress"
        except Exception as exc:
            log.info("AliExpress scrape failed (%s), using formula", exc)

    # Tier 3 — formula
    if fob_usd is None:
        rp = retail_price or 0.0
        if rp > 0:
            fob_usd = _tier3_formula(product, rp, country)
            source = "category_formula"
        else:
            log.error("No retail price provided and all supplier tiers failed. Cannot proceed.")
            raise RuntimeError(
                "Supplier cost lookup failed across all tiers (Alibaba, AliExpress, formula). "
                "Please provide a retail_price parameter or check network connectivity."
            )

    landed = _fob_to_landed(fob_usd, product, country)

    return {
        "fob_price_usd": round(fob_usd, 2),
        "landed_cost_local": landed,
        "source": source,
    }
