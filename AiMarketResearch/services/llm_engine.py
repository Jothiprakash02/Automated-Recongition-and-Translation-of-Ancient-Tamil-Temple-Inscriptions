"""
LLM Strategy Engine
===================
Sends a structured prompt to Llama3:8B via Ollama's REST API and
extracts a JSON strategy response.

The LLM does NOT compute numbers — it interprets scores and provides
qualitative strategic guidance.

Ollama endpoint: POST http://localhost:11434/api/generate
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass
from typing import Optional

import requests

from config import OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_TIMEOUT

log = logging.getLogger(__name__)


# ─────────────────────────────────────────────
#  Result DTO
# ─────────────────────────────────────────────
@dataclass
class LLMStrategy:
    risk_explanation: str
    positioning_strategy: str
    final_recommendation: str
    market_entry_advice: str


# ─────────────────────────────────────────────
#  Prompt Builder
# ─────────────────────────────────────────────
_SYSTEM_PROMPT = """\
You are a senior e-commerce product strategist. 
You MUST respond ONLY with a valid JSON object — no markdown, no explanation outside the JSON.

Your JSON must contain exactly these keys:
{
  "risk_explanation": "<2-3 sentences about the main risks>",
  "positioning_strategy": "<2-3 sentences on how to position this product>",
  "final_recommendation": "<one of: Proceed with full launch | Proceed with controlled launch | Test with small budget | Do not launch>",
  "market_entry_advice": "<3-4 specific actionable steps to enter this market>"
}
"""


def _build_user_prompt(
    product: str,
    country: str,
    platform: str,
    demand_score: float,
    competition_score: float,
    viability_score: float,
    risk_level: str,
    viability_label: str,
    margin_pct: float,
    avg_market_price: float,
    suggested_price: float,
    estimated_monthly_profit: float,
    roi_percent: float,
    break_even_months: float,
    budget: float,
    confidence_score: float,
) -> str:
    return f"""\
Analyze the following product opportunity and provide a strategic assessment.

Product       : {product}
Platform      : {platform}
Country       : {country}
Budget        : {budget:,.0f} (local currency)

===== QUANTITATIVE SIGNALS =====
Demand Score       : {demand_score:.1f} / 100
Competition Score  : {competition_score:.1f} / 100  (higher = more saturated)
Viability Score    : {viability_score:.1f}          (>30 Good, 15-30 Moderate, <15 Risky)
Viability Label    : {viability_label}
Risk Level         : {risk_level}
Data Confidence    : {confidence_score:.0f}%

===== FINANCIAL =====
Avg Market Price   : {avg_market_price:,.2f}
Suggested Price    : {suggested_price:,.2f}
Profit Margin      : {margin_pct:.1f}%
Est. Monthly Profit: {estimated_monthly_profit:,.2f}
ROI                : {roi_percent:.1f}%
Break-even         : {break_even_months:.1f} months

Based on these signals, provide your strategic assessment as JSON only.
"""


def _resolve_model() -> str:
    """
    Return the model name to use.
    1. If OLLAMA_MODEL is available in /api/tags, use it.
    2. If not, use the first model that is available.
    3. If no models at all, return OLLAMA_MODEL so the 500 triggers the fallback.
    """
    try:
        resp = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if not resp.ok:
            return OLLAMA_MODEL
        models = [m["name"] for m in resp.json().get("models", [])]
        if not models:
            log.warning(
                "Ollama has no models loaded. "
                "Run: ollama pull %s", OLLAMA_MODEL
            )
            return OLLAMA_MODEL
        # Exact match
        if OLLAMA_MODEL in models:
            return OLLAMA_MODEL
        # Prefix match (e.g. "llama3:8b" vs "llama3:8b-instruct-q4_0")
        for m in models:
            if m.startswith(OLLAMA_MODEL.split(":")[0]):
                log.info("Using available model '%s' (configured: '%s')", m, OLLAMA_MODEL)
                return m
        # Fall back to whatever is installed
        log.info("Model '%s' not found; using '%s'", OLLAMA_MODEL, models[0])
        return models[0]
    except Exception:
        return OLLAMA_MODEL


# ─────────────────────────────────────────────
#  Ollama API call
# ─────────────────────────────────────────────
def _call_ollama(system_prompt: str, user_prompt: str) -> str:
    """
    Call Ollama's /api/chat endpoint and return the raw text response.
    """
    model = _resolve_model()
    url = f"{OLLAMA_BASE_URL}/api/chat"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
        "options": {
            "temperature": 0.3,       # low temp for consistent JSON
            "num_predict": 512,
        },
    }

    try:
        resp = requests.post(url, json=payload, timeout=OLLAMA_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        return data["message"]["content"]
    except requests.exceptions.ConnectionError as exc:
        raise RuntimeError(
            "Ollama not reachable. Make sure `ollama serve` is running on "
            f"{OLLAMA_BASE_URL}"
        ) from exc
    except requests.exceptions.Timeout as exc:
        raise RuntimeError(
            f"Ollama request timed out after {OLLAMA_TIMEOUT}s"
        ) from exc
    except (KeyError, ValueError) as exc:
        raise RuntimeError(f"Unexpected Ollama response format: {exc}") from exc


# ─────────────────────────────────────────────
#  JSON extraction
# ─────────────────────────────────────────────
def _extract_json(raw: str) -> dict:
    """
    Extract the first valid JSON object from *raw* text.
    Handles cases where the model wraps JSON in markdown code blocks.
    """
    # Strip markdown fences if present
    cleaned = re.sub(r"```(?:json)?", "", raw).strip()

    # Find first { ... } block
    match = re.search(r"\{[\s\S]+\}", cleaned)
    if not match:
        raise ValueError(f"No JSON object found in LLM response:\n{raw[:300]}")

    try:
        return json.loads(match.group())
    except json.JSONDecodeError as exc:
        raise ValueError(f"JSON parse error: {exc}\nRaw:\n{match.group()[:300]}") from exc


# ─────────────────────────────────────────────
#  Fallback when LLM is unavailable
# ─────────────────────────────────────────────
def _fallback_strategy(
    risk_level: str,
    viability_label: str,
    demand_score: float,
    competition_score: float,
) -> LLMStrategy:
    """Return a rule-based fallback strategy when Ollama is not available."""
    if viability_label == "Good":
        rec = "Proceed with full launch"
        risk_exp = (
            f"Demand is strong ({demand_score:.0f}/100) and competition is manageable "
            f"({competition_score:.0f}/100). Primary risk is sustaining demand post-launch."
        )
        pos = (
            "Position as a quality-first option with strong product imagery and "
            "keyword-optimized listings to capture organic traffic quickly."
        )
        entry = (
            "1. Source and list within 4 weeks. "
            "2. Run PPC campaigns at 10% of revenue. "
            "3. Gather 15+ reviews in month one. "
            "4. Scale ad budget after break-even."
        )
    elif viability_label == "Moderate":
        rec = "Proceed with controlled launch"
        risk_exp = (
            f"Market shows moderate demand ({demand_score:.0f}/100) with notable competition "
            f"({competition_score:.0f}/100). Differentiation is essential."
        )
        pos = (
            "Find a defensible niche angle — bundle, unique feature, or underserved "
            "customer segment — to avoid direct price war with incumbents."
        )
        entry = (
            "1. Start with a limited SKU. "
            "2. Target long-tail keywords with lower CPC. "
            "3. Price 3-5% below average to gain initial reviews. "
            "4. Reassess after 60 days of sales data."
        )
    else:
        rec = "Test with small budget"
        risk_exp = (
            f"Low demand ({demand_score:.0f}/100) or very high competition "
            f"({competition_score:.0f}/100) makes this market challenging. "
            "Risk of capital loss is significant."
        )
        pos = (
            "If proceeding, position in an ultra-specific niche and build a "
            "direct-to-consumer channel alongside marketplace listings."
        )
        entry = (
            "1. Validate with a 50-unit test order. "
            "2. Collect customer feedback before scaling. "
            "3. Set strict break-even KPI before reinvesting. "
            "4. Consider adjacent products with better scores."
        )

    return LLMStrategy(
        risk_explanation=risk_exp,
        positioning_strategy=pos,
        final_recommendation=rec,
        market_entry_advice=entry,
    )


# ─────────────────────────────────────────────
#  Public entry point
# ─────────────────────────────────────────────
def get_llm_strategy(
    *,
    product: str,
    country: str,
    platform: str,
    demand_score: float,
    competition_score: float,
    viability_score: float,
    risk_level: str,
    viability_label: str,
    margin_pct: float,
    avg_market_price: float,
    suggested_price: float,
    estimated_monthly_profit: float,
    roi_percent: float,
    break_even_months: float,
    budget: float,
    confidence_score: float,
) -> LLMStrategy:
    """
    Call Llama3:8B via Ollama to get a strategic assessment.
    Falls back to rule-based strategy if Ollama is unavailable.
    """
    user_prompt = _build_user_prompt(
        product=product,
        country=country,
        platform=platform,
        demand_score=demand_score,
        competition_score=competition_score,
        viability_score=viability_score,
        risk_level=risk_level,
        viability_label=viability_label,
        margin_pct=margin_pct,
        avg_market_price=avg_market_price,
        suggested_price=suggested_price,
        estimated_monthly_profit=estimated_monthly_profit,
        roi_percent=roi_percent,
        break_even_months=break_even_months,
        budget=budget,
        confidence_score=confidence_score,
    )

    try:
        raw = _call_ollama(_SYSTEM_PROMPT, user_prompt)
        log.debug("LLM raw response:\n%s", raw[:600])
        parsed = _extract_json(raw)

        return LLMStrategy(
            risk_explanation=parsed.get("risk_explanation", ""),
            positioning_strategy=parsed.get("positioning_strategy", ""),
            final_recommendation=parsed.get("final_recommendation", ""),
            market_entry_advice=parsed.get("market_entry_advice", ""),
        )

    except Exception as exc:
        log.warning("LLM call failed (%s). Using rule-based fallback.", exc)
        return _fallback_strategy(risk_level, viability_label, demand_score, competition_score)
