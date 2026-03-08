"""
Pydantic schemas for Trend Scouting API
"""

from pydantic import BaseModel, Field
from typing import Optional


class TrendDiscoveryRequest(BaseModel):
    """Request for trend discovery."""
    region: str = Field(default="India", description="Target market region")
    category: Optional[str] = Field(default=None, description="Specific category filter")
    time_range: str = Field(default="3_months", description="Time window: 3_months, 6_months, 1_year")


class ProductOpportunityResponse(BaseModel):
    """Single product opportunity."""
    product_name: str
    category: str
    trend_strength: float
    growth_velocity: str
    search_volume_estimate: int
    source: str
    confidence: float
    suggested_keywords: list[str]


class EmergingCategoryResponse(BaseModel):
    """Emerging category summary."""
    category: str
    trend_strength: float
    growth_velocity: str
    suggested_products: list[str]


class TrendDiscoveryResponse(BaseModel):
    """Complete trend discovery response."""
    emerging_categories: list[EmergingCategoryResponse]
    seasonal_spikes: list[str]
    innovation_signals: list[str]
    top_opportunities: list[ProductOpportunityResponse]
    scan_timestamp: str
    data_sources_used: list[str]
    message: str
