"""
SQLite database setup using SQLAlchemy.
"""

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    DateTime,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

from config import DATABASE_URL

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ─────────────────────────────────────────────
#  ORM Table: product_analysis
# ─────────────────────────────────────────────
class ProductAnalysis(Base):
    __tablename__ = "product_analysis"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, index=True, nullable=False)
    country = Column(String, nullable=True)
    platform = Column(String, nullable=True)
    budget = Column(Float, nullable=True)

    # Scores
    demand_score = Column(Float, nullable=True)
    competition_score = Column(Float, nullable=True)
    viability_score = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)

    # Price & margin
    suggested_price = Column(Float, nullable=True)
    profit_margin = Column(Float, nullable=True)
    avg_market_price = Column(Float, nullable=True)

    # Profit simulation (expected scenario)
    estimated_monthly_profit = Column(Float, nullable=True)
    roi_percent = Column(Float, nullable=True)
    break_even_months = Column(Float, nullable=True)
    estimated_monthly_sales = Column(Float, nullable=True)

    # Risk & recommendation
    risk_level = Column(String, nullable=True)
    final_recommendation = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)


def init_db() -> None:
    """Create all tables."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency: yield a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
