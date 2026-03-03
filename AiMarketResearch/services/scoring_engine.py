"""
Scoring Engine
==============
Converts raw signals from data_collection into three composite scores:

  - Demand Score      (0–100)
  - Competition Score (0–100, higher = more saturated)
  - Viability Score   (derived, can be negative)

Also determines:
  - Margin range
  - Suggested price factor
  - Risk level label
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from config import DEMAND_WEIGHTS, COMPETITION_WEIGHTS, VIABILITY_WEIGHTS
from services.data_collection import CollectedSignals
from utils.normalizer import (
    clamp,
    normalize_trend,
    normalize_reviews,
    normalize_seller_count,
    normalize_cpc,
    normalize_review_velocity,
    normalize_sponsored_density,
    normalize_search_volume,
)

log = logging.getLogger(__name__)


# ─────────────────────────────────────────────
#  Result DTO
# ─────────────────────────────────────────────
@dataclass
class ScoringResult:
    demand_score: float
    competition_score: float
    viability_score: float
    confidence_score: float

    # Margin & price
    margin_pct: float           # e.g. 32.0  → 32%
    price_factor: float         # multiply avg_market_price

    # Labels
    risk_level: str             # Low / Medium / High
    viability_label: str        # Good / Moderate / Risky


# ─────────────────────────────────────────────
#  Demand Score
# ─────────────────────────────────────────────
def compute_demand_score(signals: CollectedSignals) -> float:
    """
    Demand Score = weighted sum of normalized demand signals.
    Uses real monthly_search_volume from keyword research (not a proxy).
    """
    # Normalize growth: -100→0 to +100→100
    trend_growth_norm = clamp((signals.trend_growth + 100) / 2)

    components = {
        "trend_avg":      normalize_trend(signals.trend_avg),
        "trend_growth":   trend_growth_norm,
        "review_velocity": normalize_review_velocity(signals.review_velocity),
        "cpc_score":      normalize_cpc(signals.cpc_score),
        # Real monthly search volume from Google Ads API / SERP (0–100K+ → 0–100)
        "search_volume":  normalize_search_volume(signals.monthly_search_volume),
    }

    score = sum(
        DEMAND_WEIGHTS[k] * v for k, v in components.items()
    )
    log.debug("Demand components: %s  → %.2f", components, score)
    return round(clamp(score), 2)


# ─────────────────────────────────────────────
#  Competition Score
# ─────────────────────────────────────────────
def compute_competition_score(signals: CollectedSignals) -> float:
    """
    Competition Score = weighted sum of saturation signals.
    Higher = more competitive market.
    """
    components = {
        "seller_count":       normalize_seller_count(signals.seller_count),
        "avg_reviews":        normalize_reviews(signals.avg_reviews),
        "sponsored_density":  normalize_sponsored_density(signals.sponsored_density),
    }

    score = sum(
        COMPETITION_WEIGHTS[k] * v for k, v in components.items()
    )
    log.debug("Competition components: %s  → %.2f", components, score)
    return round(clamp(score), 2)


# ─────────────────────────────────────────────
#  Viability Score
# ─────────────────────────────────────────────
def compute_viability_score(demand: float, competition: float) -> float:
    """
    Viability = (0.6 × demand) - (0.4 × competition)
    Range roughly: -40 … +60
    """
    score = (
        VIABILITY_WEIGHTS["demand"] * demand
        + VIABILITY_WEIGHTS["competition"] * competition
    )
    return round(score, 2)


# ─────────────────────────────────────────────
#  Margin logic
# ─────────────────────────────────────────────
def decide_margin(demand: float, competition: float) -> float:
    """Demand-based margin selection, returns midpoint of chosen range (%)."""
    if demand > 75 and competition < 50:
        return 40.0    # 35-45% → midpoint
    if demand > 70 and competition > 70:
        return 22.5    # 20-25% → midpoint
    if demand < 40:
        return 15.0    # 12-18% → midpoint
    return 28.5        # 25-32% → midpoint


# ─────────────────────────────────────────────
#  Price factor
# ─────────────────────────────────────────────
def decide_price_factor(competition: float) -> float:
    """
    High competition → 3% below average (0.97)
    Low competition  → 6% above average (1.06)
    """
    if competition >= 60:
        return 0.97
    return 1.06


# ─────────────────────────────────────────────
#  Risk level
# ─────────────────────────────────────────────
def decide_risk(viability: float) -> tuple[str, str]:
    """Returns (risk_level, viability_label)."""
    if viability >= 30:
        return "Low", "Good"
    if viability >= 15:
        return "Medium", "Moderate"
    return "High", "Risky"


# ─────────────────────────────────────────────
#  Public entry point
# ─────────────────────────────────────────────
def score_product(signals: CollectedSignals) -> ScoringResult:
    demand = compute_demand_score(signals)
    competition = compute_competition_score(signals)
    viability = compute_viability_score(demand, competition)

    margin = decide_margin(demand, competition)
    price_factor = decide_price_factor(competition)
    risk_level, viability_label = decide_risk(viability)

    # Confidence: data_confidence (0-1) → 0-100
    confidence = round(signals.data_confidence * 100, 1)

    result = ScoringResult(
        demand_score=demand,
        competition_score=competition,
        viability_score=viability,
        confidence_score=confidence,
        margin_pct=margin,
        price_factor=price_factor,
        risk_level=risk_level,
        viability_label=viability_label,
    )

    log.info(
        "Scores → D=%.1f  C=%.1f  V=%.1f  risk=%s  margin=%.1f%%",
        demand, competition, viability, risk_level, margin,
    )
    return result
