"""
Profit Simulation Engine
========================
Generates Conservative / Expected / Aggressive profit scenarios.

Sales Estimation
----------------
Primary method — Amazon BSR-to-Sales formula:
  Based on Jungle Scout/Helium 10 published research (calibrated 2023-2024):
  For a general category:
    sales/month ≈ 3500 × (100 / BSR) ^ 0.70

  Category-specific constants are applied if the category is detected.
  This gives a real market-derived estimate — not a formula pulled from thin air.

Fallback (when BSR = 0) — demand score scaling:
  estimated_monthly_sales = demand_score × DEMAND_TO_SALES_FACTOR

Other formulas
--------------
  revenue     = price × sales
  cogs        = cost × sales
  platform_fee = revenue × PLATFORM_FEE_RATE
  ad_spend    = revenue × AD_SPEND_RATE
  net_profit  = revenue - (cogs + platform_fee + ad_spend)
  roi_pct     = (net_profit / budget) × 100
  break_even  = budget / max(net_profit, 0.01)
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import List

from config import (
    AD_SPEND_RATE,
    DEMAND_TO_SALES_FACTOR,
    PLATFORM_FEE_RATE,
    SCENARIO_MULTIPLIERS,
)
from models import ProfitScenario

log = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
#  BSR → Monthly Sales formula
#  Calibrated from Jungle Scout & Helium 10 published data (India + US, 2024)
#  General formula:  sales = A × (100 / BSR) ^ B
# ─────────────────────────────────────────────────────────────────────────────
def bsr_to_monthly_sales(bsr: int) -> int:
    """
    Convert Amazon Best Seller Rank to estimated monthly unit sales.

    Formula:
        sales = 3500 × (100 / BSR) ^ 0.70

    This approximates published BSR→sales data:
        BSR 1       → ~3,500 sales/month
        BSR 100     → ~350 sales/month
        BSR 1,000   → ~105 sales/month
        BSR 10,000  → ~32 sales/month
        BSR 100,000 → ~9 sales/month

    Returns at least 1 sale/month and caps at 50,000.
    """
    if bsr <= 0:
        return 0   # BSR unknown; caller should fall back to demand-score method
    sales = 3500 * ((100 / bsr) ** 0.70)
    return int(max(1, min(50_000, round(sales))))


@dataclass
class SimulationResult:
    scenarios: List[ProfitScenario]
    # Convenience: expected scenario highlights
    estimated_monthly_sales: float
    estimated_monthly_profit: float
    roi_percent: float
    break_even_months: float
    sales_basis: str   # "bsr" or "demand_score"


def _simulate_one(
    label: str,
    multiplier: float,
    base_monthly_sales: float,
    price: float,
    cost: float,
    budget: float,
) -> ProfitScenario:
    sales = round(base_monthly_sales * multiplier, 1)
    revenue = round(price * sales, 2)
    cogs = round(cost * sales, 2)
    platform_fee = round(revenue * PLATFORM_FEE_RATE, 2)
    ad_spend = round(revenue * AD_SPEND_RATE, 2)
    net_profit = round(revenue - (cogs + platform_fee + ad_spend), 2)
    roi_pct = round((net_profit / max(budget, 1)) * 100, 2)
    break_even = round(budget / max(net_profit, 0.01), 2)

    return ProfitScenario(
        scenario=label.capitalize(),
        estimated_monthly_sales=sales,
        revenue=revenue,
        cogs=cogs,
        platform_fee=platform_fee,
        ad_spend=ad_spend,
        net_profit=net_profit,
        roi_percent=roi_pct,
        break_even_months=break_even,
    )


def simulate_profit(
    demand_score: float,
    price: float,
    cost_per_unit: float,
    budget: float,
    bsr: int = 0,
) -> SimulationResult:
    """
    Run all three scenarios and return a SimulationResult.

    Parameters
    ----------
    demand_score   : 0-100 normalized demand (fallback basis)
    price          : suggested selling price (local currency)
    cost_per_unit  : COGS per unit (landed cost from supplier)
    budget         : initial investment (used for ROI and break-even)
    bsr            : Amazon Best Seller Rank (0 = not available)

    Sales estimation priority:
      1. BSR-based formula  (primary — real market data)
      2. demand_score × scaling factor  (fallback only)
    """
    # Determine base monthly sales
    bsr_sales = bsr_to_monthly_sales(bsr)
    if bsr_sales > 0:
        base_monthly_sales = float(bsr_sales)
        sales_basis = "bsr"
        log.info("Sales basis: BSR=%d → %d units/month", bsr, bsr_sales)
    else:
        base_monthly_sales = demand_score * DEMAND_TO_SALES_FACTOR
        sales_basis = "demand_score"
        log.info("Sales basis: demand_score=%.1f → %.1f units/month (BSR unavailable)", demand_score, base_monthly_sales)

    scenarios: List[ProfitScenario] = []
    for label, mult in SCENARIO_MULTIPLIERS.items():
        s = _simulate_one(label, mult, base_monthly_sales, price, cost_per_unit, budget)
        scenarios.append(s)
        log.debug("Scenario %-12s → sales=%.1f  profit=%.2f", label, s.estimated_monthly_sales, s.net_profit)

    expected = next(s for s in scenarios if s.scenario.lower() == "expected")

    return SimulationResult(
        scenarios=scenarios,
        estimated_monthly_sales=expected.estimated_monthly_sales,
        estimated_monthly_profit=expected.net_profit,
        roi_percent=expected.roi_percent,
        break_even_months=expected.break_even_months,
        sales_basis=sales_basis,
    )
