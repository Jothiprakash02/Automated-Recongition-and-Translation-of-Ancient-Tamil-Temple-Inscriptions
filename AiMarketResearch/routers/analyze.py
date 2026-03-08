"""
API Router — /analyze-product
==============================
Orchestrates:
  1. Data collection
  2. Scoring
  3. Profit simulation
  4. LLM strategy
  5. Persist to SQLite
  6. Return unified JSON response
"""

from __future__ import annotations

import logging
import sys
import os

# Path setup
_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_GLOBAL = os.path.join(_ROOT, "global")
for _p in (_ROOT, _GLOBAL):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import ProductAnalysis, get_db
from models import AnalyzeRequest, AnalyzeResponse, RawSignals
from services.data_collection import collect_signals
from services.llm_engine import get_llm_strategy
from services.profit_simulation import simulate_profit
from services.scoring_engine import score_product
from services.supplier_pricing import get_supplier_cost

log = logging.getLogger(__name__)
router = APIRouter()


# ─────────────────────────────────────────────
#  POST /analyze-product
# ─────────────────────────────────────────────
@router.post(
    "/analyze-product",
    response_model=AnalyzeResponse,
    summary="Analyze a product for launch viability",
    description=(
        "Collects market signals, scores demand/competition, simulates profit "
        "across three scenarios, and returns LLM strategic guidance."
    ),
)
async def analyze_product(
    req: AnalyzeRequest,
    db: Session = Depends(get_db),
) -> AnalyzeResponse:

    log.info("New analysis request: product='%s' country='%s' budget=%.0f",
             req.product, req.country, req.budget)

    # ── Step 1: Data collection ──────────────────────────
    try:
        signals = collect_signals(req.product, req.country)
    except Exception as exc:
        log.error("Data collection hard failure: %s", exc)
        raise HTTPException(status_code=500, detail=f"Data collection error: {exc}")

    # ── Step 2: Scoring ──────────────────────────────────
    scores = score_product(signals)

    # ── Step 3: Price ─────────────────────────────────────
    avg_market_price = signals.avg_price
    suggested_price = round(avg_market_price * scores.price_factor, 2)

    # ── Step 4: REAL supplier cost (Alibaba/AliExpress scraping) ──────────
    if req.cost_per_unit:
        cost_per_unit = req.cost_per_unit
        supplier_source = "user_provided"
        fob_usd = 0.0
    else:
        try:
            sc = get_supplier_cost(req.product, req.country, retail_price=avg_market_price)
            cost_per_unit = sc["landed_cost_local"]
            supplier_source = sc["source"]
            fob_usd = sc["fob_price_usd"]
            log.info(
                "Supplier cost ✓  landed=%.2f  source=%s (FOB=USD%.2f)",
                cost_per_unit, supplier_source, fob_usd,
            )
        except Exception as exc:
            log.warning("Supplier cost failed (%s); using margin-back-calc", exc)
            cost_per_unit = round(suggested_price * (1 - scores.margin_pct / 100), 2)
            supplier_source = "margin_fallback"
            fob_usd = 0.0

    # ── Step 5: Profit simulation (BSR-first, then demand-score fallback) ──
    sim = simulate_profit(
        demand_score=scores.demand_score,
        price=suggested_price,
        cost_per_unit=cost_per_unit,
        budget=req.budget,
        bsr=signals.bsr,
    )

    # ── Step 6: LLM strategy ─────────────────────────────
    strategy = get_llm_strategy(
        product=req.product,
        country=req.country,
        platform=req.platform,
        demand_score=scores.demand_score,
        competition_score=scores.competition_score,
        viability_score=scores.viability_score,
        risk_level=scores.risk_level,
        viability_label=scores.viability_label,
        margin_pct=scores.margin_pct,
        avg_market_price=avg_market_price,
        suggested_price=suggested_price,
        estimated_monthly_profit=sim.estimated_monthly_profit,
        roi_percent=sim.roi_percent,
        break_even_months=sim.break_even_months,
        budget=req.budget,
        confidence_score=scores.confidence_score,
    )

    # ── Step 7: Persist to database ─────────────────────
    try:
        record = ProductAnalysis(
            product_name=req.product,
            country=req.country,
            platform=req.platform,
            budget=req.budget,
            demand_score=scores.demand_score,
            competition_score=scores.competition_score,
            viability_score=scores.viability_score,
            confidence_score=scores.confidence_score,
            suggested_price=suggested_price,
            profit_margin=scores.margin_pct,
            avg_market_price=avg_market_price,
            estimated_monthly_profit=sim.estimated_monthly_profit,
            roi_percent=sim.roi_percent,
            break_even_months=sim.break_even_months,
            estimated_monthly_sales=sim.estimated_monthly_sales,
            risk_level=scores.risk_level,
            final_recommendation=strategy.final_recommendation,
        )
        db.add(record)
        db.commit()
        log.info("Persisted analysis id=%d for '%s'", record.id, req.product)
    except Exception as exc:
        log.warning("DB persist failed (non-fatal): %s", exc)
        db.rollback()

    # ── Step 8: Build and return response ───────────────
    raw_signals_out = RawSignals(
        trend_avg=signals.trend_avg,
        trend_growth=signals.trend_growth,
        seasonality_variance=signals.seasonality_variance,
        avg_reviews=signals.avg_reviews,
        seller_count=signals.seller_count,
        avg_price=avg_market_price,
        review_velocity=signals.review_velocity,
        bsr=signals.bsr,
        cpc_score=signals.cpc_score,
        monthly_search_volume=signals.monthly_search_volume,
        keyword_competition=signals.keyword_competition,
        supplier_cost_local=cost_per_unit,
        supplier_cost_source=supplier_source,
        data_confidence=signals.data_confidence,
    )

    return AnalyzeResponse(
        product=req.product,
        country=req.country,
        platform=req.platform,
        demand_score=scores.demand_score,
        competition_score=scores.competition_score,
        viability_score=scores.viability_score,
        confidence_score=scores.confidence_score,
        avg_market_price=avg_market_price,
        suggested_price=suggested_price,
        profit_margin=scores.margin_pct,
        estimated_monthly_sales=sim.estimated_monthly_sales,
        estimated_monthly_profit=sim.estimated_monthly_profit,
        roi_percent=sim.roi_percent,
        break_even_months=sim.break_even_months,
        risk_level=scores.risk_level,
        viability_label=scores.viability_label,
        profit_scenarios=sim.scenarios,
        risk_explanation=strategy.risk_explanation,
        positioning_strategy=strategy.positioning_strategy,
        final_recommendation=strategy.final_recommendation,
        market_entry_advice=strategy.market_entry_advice,
        sales_basis=sim.sales_basis,
        raw_signals=raw_signals_out,
    )


# ─────────────────────────────────────────────
#  GET /history  — retrieve past analyses
# ─────────────────────────────────────────────
@router.get(
    "/history",
    summary="List past product analyses",
)
async def get_history(
    limit: int = 20,
    db: Session = Depends(get_db),
):
    records = (
        db.query(ProductAnalysis)
        .order_by(ProductAnalysis.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "product_name": r.product_name,
            "country": r.country,
            "platform": r.platform,
            "demand_score": r.demand_score,
            "competition_score": r.competition_score,
            "viability_score": r.viability_score,
            "suggested_price": r.suggested_price,
            "profit_margin": r.profit_margin,
            "estimated_monthly_profit": r.estimated_monthly_profit,
            "roi_percent": r.roi_percent,
            "risk_level": r.risk_level,
            "final_recommendation": r.final_recommendation,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in records
    ]
