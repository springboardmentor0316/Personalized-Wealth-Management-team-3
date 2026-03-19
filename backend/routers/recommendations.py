from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.recommendation import MarketPriceResponse, RecommendationResponse
from app.services.market import refresh_portfolio_prices
from app.services.recommendations import (
    generate_and_save_recommendation,
    generate_rebalance_suggestions,
    list_recommendations,
)

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("/generate", response_model=RecommendationResponse)
def generate_recommendation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a fresh personalised allocation recommendation
    based on the user's risk profile and save it.
    """
    return generate_and_save_recommendation(db, current_user)


@router.get("", response_model=list[RecommendationResponse])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List the 10 most recent recommendations for the current user."""
    return list_recommendations(db, current_user.id)


@router.get("/rebalance")
def get_rebalance_suggestions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Compare current portfolio allocation vs target for the user's risk profile.
    Returns actionable rebalance suggestions.
    """
    profile = current_user.risk_profile.value if current_user.risk_profile else "Moderate"
    suggestions = generate_rebalance_suggestions(db, current_user.id, profile)
    return {
        "risk_profile": profile,
        "suggestions": suggestions,
    }


@router.post("/refresh-prices")
def refresh_prices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Trigger an on-demand market price refresh for the current user's portfolio.
    Uses yfinance — no API key required.
    """
    prices = refresh_portfolio_prices(db, current_user.id)
    return {
        "refreshed": len(prices),
        "prices": {
            symbol: {"price": price, "found": price is not None}
            for symbol, price in prices.items()
        },
    }
