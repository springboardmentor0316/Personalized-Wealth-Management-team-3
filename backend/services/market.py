"""
Market price service.

Fetches live/latest prices using yfinance (free, no API key needed).
Falls back gracefully if a symbol is not found or the network is unavailable.

Install:
    pip install yfinance

Usage:
    from app.services.market import fetch_price, refresh_portfolio_prices
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

import yfinance as yf
from sqlalchemy.orm import Session

from app.models.investment import Investment

logger = logging.getLogger(__name__)


# ── Single price fetch ─────────────────────────────────────────────────────


def fetch_price(symbol: str) -> Optional[float]:
    """
    Fetch the latest market price for a symbol via yfinance.

    Returns None if the symbol is invalid or the request fails.

    Examples:
        fetch_price("AAPL")     → 189.45
        fetch_price("BTC-USD")  → 62310.50
        fetch_price("NIFTYBEES.NS")  → 245.30   (Indian ETF)
    """
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.fast_info
        price = getattr(info, "last_price", None)

        if price is None or price == 0:
            # Fallback: grab latest close from 5-day history
            hist = ticker.history(period="5d")
            if not hist.empty:
                price = float(hist["Close"].iloc[-1])

        if price and price > 0:
            logger.info("Fetched price for %s: %.4f", symbol, price)
            return float(price)

        logger.warning("No price found for symbol: %s", symbol)
        return None

    except Exception as exc:
        logger.error("Failed to fetch price for %s: %s", symbol, exc)
        return None


def fetch_prices_bulk(symbols: list[str]) -> dict[str, Optional[float]]:
    """
    Fetch prices for multiple symbols in one yfinance call.
    Returns a dict {symbol: price_or_None}.
    """
    if not symbols:
        return {}

    try:
        tickers = yf.download(
            tickers=" ".join(symbols),
            period="2d",
            interval="1d",
            auto_adjust=True,
            progress=False,
        )
        results: dict[str, Optional[float]] = {}

        if tickers.empty:
            return {s: None for s in symbols}

        close = tickers["Close"]
        for symbol in symbols:
            try:
                if symbol in close.columns:
                    price = float(close[symbol].dropna().iloc[-1])
                    results[symbol] = price if price > 0 else None
                else:
                    results[symbol] = fetch_price(symbol)  # single fallback
            except Exception:
                results[symbol] = fetch_price(symbol)

        return results

    except Exception as exc:
        logger.error("Bulk fetch failed: %s — falling back to single fetches", exc)
        return {s: fetch_price(s) for s in symbols}


# ── Portfolio price refresh ────────────────────────────────────────────────


def refresh_portfolio_prices(db: Session, user_id: UUID) -> dict[str, Optional[float]]:
    """
    Refresh last_price on all Investment rows for a user.
    Called on-demand from the API and also by the Celery nightly task.

    Returns a dict {symbol: new_price}.
    """
    investments: list[Investment] = (
        db.query(Investment).filter(Investment.user_id == user_id).all()
    )

    if not investments:
        return {}

    symbols = list({inv.symbol for inv in investments})
    prices = fetch_prices_bulk(symbols)
    now = datetime.now(timezone.utc)

    for inv in investments:
        price = prices.get(inv.symbol)
        if price is not None:
            inv.last_price = price
            inv.last_price_at = now

    db.commit()
    return prices


def refresh_all_portfolio_prices(db: Session) -> int:
    """
    Refresh prices for ALL investments in the DB.
    Designed for the Celery nightly task — runs once globally.

    Returns the number of investments updated.
    """
    investments: list[Investment] = db.query(Investment).all()

    if not investments:
        return 0

    symbols = list({inv.symbol for inv in investments})
    prices = fetch_prices_bulk(symbols)
    now = datetime.now(timezone.utc)
    updated = 0

    for inv in investments:
        price = prices.get(inv.symbol)
        if price is not None:
            inv.last_price = price
            inv.last_price_at = now
            updated += 1

    db.commit()
    logger.info("Nightly price refresh: updated %d investments", updated)
    return updated
