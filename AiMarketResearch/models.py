"""
Pydantic request / response models.
"""

from __future__ import annotations
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


# ─────────────────────────────────────────────
#  Request
# ─────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    product: str = Field(..., example="portable blender")
    country: str = Field("India", example="India")
    budget: float = Field(..., gt=0, example=50000)
    platform: str = Field("Amazon", example="Amazon")
    cost_per_unit: Optional[float] = Field(
        None,
        gt=0,
        description="Your cost per unit in local currency. "
        "If not provided, a default 40% of market price is assumed.",
        example=900,
    )


# ─────────────────────────────────────────────
#  Sub-models
# ─────────────────────────────────────────────
class ProfitScenario(BaseModel):
    scenario: str
    estimated_monthly_sales: float
    revenue: float
    cogs: float
    platform_fee: float
    ad_spend: float
    net_profit: float
    roi_percent: float
    break_even_months: float


class RawSignals(BaseModel):
    trend_avg: float
    trend_growth: float
    seasonality_variance: float
    avg_reviews: float
    seller_count: int
    avg_price: float
    review_velocity: float          # real: reviews/month scraped from Amazon
    bsr: int                        # Amazon Best Seller Rank (0 = not available)
    cpc_score: float                # real CPC in USD from keyword research
    monthly_search_volume: int      # real monthly search volume from keyword research
    keyword_competition: str        # LOW / MEDIUM / HIGH
    supplier_cost_local: float      # landed cost per unit in local currency
    supplier_cost_source: str       # alibaba / aliexpress / category_formula
    data_confidence: float          # 0-1: fraction of real-data sources that succeeded


# ─────────────────────────────────────────────
#  Response
# ─────────────────────────────────────────────
class AnalyzeResponse(BaseModel):
    product: str
    country: str
    platform: str

    # Scores
    demand_score: float
    competition_score: float
    viability_score: float
    confidence_score: float

    # Pricing
    avg_market_price: float
    suggested_price: float
    profit_margin: float           # percentage

    # Expected scenario highlights
    estimated_monthly_sales: float
    estimated_monthly_profit: float
    roi_percent: float
    break_even_months: float

    # Risk
    risk_level: str                # Low / Medium / High
    viability_label: str           # Good / Moderate / Risky

    # Profit simulation — all three scenarios
    profit_scenarios: List[ProfitScenario]

    # LLM strategy outputs
    risk_explanation: str
    positioning_strategy: str
    final_recommendation: str
    market_entry_advice: str

    # Sales basis transparency
    sales_basis: str               # "bsr" (BSR-derived) or "demand_score" (fallback)

    # Raw signals (transparency)
    raw_signals: RawSignals
