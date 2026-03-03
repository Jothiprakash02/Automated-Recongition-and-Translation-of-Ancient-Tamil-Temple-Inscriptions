"""
Product & Market Intelligence Engine
=====================================
FastAPI application entry point.

Run locally:
    uvicorn main:app --reload --port 8000

Docs:
    http://localhost:8000/docs
"""

import logging
import os
import sys

from dotenv import load_dotenv

load_dotenv()   # load .env file before anything else reads os.getenv()

# ─────────────────────────────────────────────
#  Path setup — make sub-folders importable
# ─────────────────────────────────────────────
_BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(_BASE, "global"))          # config, database, utils
sys.path.insert(0, os.path.join(_BASE, "AiMarketResearch")) # services, routers, models

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from database import init_db
from routers.analyze import router as analyze_router

# ─────────────────────────────────────────────
#  Logging
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# ─────────────────────────────────────────────
#  App
# ─────────────────────────────────────────────
app = FastAPI(
    title="Product & Market Intelligence Engine",
    description=(
        "Pre-launch decision system for beginner e-commerce sellers. "
        "Combines Google Trends, Amazon signals, mathematical scoring, "
        "profit simulation, and LLM strategic reasoning (Llama3:8B via Ollama)."
    ),
    version="1.0.0",
    contact={"name": "Module 2 — Hackathon Build"},
)

# ─────────────────────────────────────────────
#  CORS (open for hackathon / restrict in prod)
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
#  Routes
# ─────────────────────────────────────────────
app.include_router(analyze_router, tags=["Intelligence"])

# ─────────────────────────────────────────────
#  Frontend — served at /
# ─────────────────────────────────────────────
_FRONTEND = os.path.join(os.path.dirname(__file__), "AiMarketResearch", "frontend")

if os.path.isdir(_FRONTEND):
    app.mount("/ui", StaticFiles(directory=_FRONTEND, html=True), name="frontend")


@app.get("/", include_in_schema=False)
async def serve_frontend():
    index = os.path.join(_FRONTEND, "index.html")
    if os.path.exists(index):
        return FileResponse(index, media_type="text/html")
    return {"message": "Market Intelligence Engine API", "docs": "/docs"}


# ─────────────────────────────────────────────
#  Startup event
# ─────────────────────────────────────────────
@app.on_event("startup")
async def on_startup() -> None:
    init_db()
    logging.getLogger(__name__).info("Database initialized. Server ready.")


# ─────────────────────────────────────────────
#  Health check
# ─────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health():
    return {"status": "ok", "service": "Product Intelligence Engine"}


# ─────────────────────────────────────────────
#  Dev entry point
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
