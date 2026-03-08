"""
Trend Discovery Router
======================
API endpoint for Module 0 - Trend Scouting
"""

import logging
import sys
import os

# Path setup
_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_GLOBAL = os.path.join(_ROOT, "global")
for _p in (_ROOT, _GLOBAL):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from fastapi import APIRouter, HTTPException
from TrendScout.schemas.trend_schema import (
    TrendDiscoveryRequest,
    TrendDiscoveryResponse,
    ProductOpportunityResponse,
    EmergingCategoryResponse
)
from TrendScout.services.trend_discovery import discover_trends

log = logging.getLogger(__name__)

router = APIRouter()


@router.post("/discover-trends", response_model=TrendDiscoveryResponse)
async def discover_product_trends(request: TrendDiscoveryRequest):
    """
    Discover emerging product opportunities before you have a specific idea.
    
    This is Module 0 - the innovation layer that scans:
    - Google Trends (rising searches)
    - Amazon Movers & Shakers
    - Reddit product discussions
    
    Returns ranked opportunities with trend strength, growth velocity, and suggested keywords.
    """
    try:
        log.info(
            "Trend discovery request: region=%s category=%s time_range=%s",
            request.region, request.category, request.time_range
        )
        
        result = discover_trends(
            region=request.region,
            category=request.category,
            time_range=request.time_range
        )
        
        # Convert dataclasses to Pydantic models
        opportunities = [
            ProductOpportunityResponse(
                product_name=opp.product_name,
                category=opp.category,
                trend_strength=opp.trend_strength,
                growth_velocity=opp.growth_velocity,
                search_volume_estimate=opp.search_volume_estimate,
                source=opp.source,
                confidence=opp.confidence,
                suggested_keywords=opp.suggested_keywords
            )
            for opp in result.top_opportunities
        ]
        
        categories = [
            EmergingCategoryResponse(
                category=cat["category"],
                trend_strength=cat["trend_strength"],
                growth_velocity=cat["growth_velocity"],
                suggested_products=cat["suggested_products"]
            )
            for cat in result.emerging_categories
        ]
        
        return TrendDiscoveryResponse(
            emerging_categories=categories,
            seasonal_spikes=result.seasonal_spikes,
            innovation_signals=result.innovation_signals,
            top_opportunities=opportunities,
            scan_timestamp=result.scan_timestamp,
            data_sources_used=result.data_sources_used,
            message=f"Found {len(opportunities)} opportunities from {len(result.data_sources_used)} data sources"
        )
        
    except Exception as exc:
        log.error("Trend discovery failed: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Trend discovery failed: {str(exc)}"
        )
