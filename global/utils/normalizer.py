"""
Utility helpers for normalizing raw metric values to a 0–100 scale.
"""

from __future__ import annotations
from typing import Union


def clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    """Clamp a value between lo and hi."""
    return max(lo, min(hi, value))


def normalize_linear(
    value: float,
    min_val: float,
    max_val: float,
    invert: bool = False,
) -> float:
    """
    Linear min-max normalization → 0-100 scale.

    Parameters
    ----------
    value    : raw numeric value
    min_val  : expected minimum (maps to 0)
    max_val  : expected maximum (maps to 100)
    invert   : if True, high raw value → low score (e.g. more sellers = more competition)
    """
    if max_val == min_val:
        return 50.0
    score = (value - min_val) / (max_val - min_val) * 100.0
    score = clamp(score)
    return round(100.0 - score if invert else score, 2)


def normalize_reviews(avg_reviews: float) -> float:
    """
    Review count → 0-100 competition contribution.
    More reviews = more entrenched competition.
    Assumes 0 reviews → 0, 5000+ reviews → ~100.
    """
    return normalize_linear(avg_reviews, 0, 5000)


def normalize_seller_count(count: int) -> float:
    """
    Seller / result count → 0-100 competition signal.
    0 sellers → 0, 10000+ → 100.
    """
    return normalize_linear(count, 0, 10_000)


def normalize_trend(avg: float) -> float:
    """Google Trends interest 0-100 → already in scale; just clamp."""
    return clamp(avg)


def normalize_cpc(cpc: float) -> float:
    """
    CPC (cost-per-click in USD) → 0-100 commercial intent proxy.
    $0 → 0,  $2.0+ → 100
    """
    return normalize_linear(cpc, 0.0, 2.0)


def normalize_review_velocity(velocity: float) -> float:
    """
    Reviews per month (estimated) → 0-100 demand signal.
    0 → 0,  500+ → 100
    """
    return normalize_linear(velocity, 0, 500)


def normalize_search_volume(volume: Union[float, int]) -> float:
    """
    Monthly search volume proxy → 0-100.
    0 → 0, 100_000+ → 100
    """
    return normalize_linear(volume, 0, 100_000)


def normalize_sponsored_density(density: float) -> float:
    """
    Fraction of first-page results that are sponsored (0–1).
    0 → 0,  1.0 → 100
    """
    return normalize_linear(density * 100, 0, 100)
