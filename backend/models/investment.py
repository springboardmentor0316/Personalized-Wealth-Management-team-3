"""
Fixed app/models/investment.py — compatible with both SQLite and PostgreSQL.
Includes last_price and last_price_at fields for market data.
Replace your existing app/models/investment.py with this file.
"""

from __future__ import annotations

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, func

from app.database import Base


class Investment(Base):
    __tablename__ = "investments"

    id      = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    symbol     = Column(String(20),  nullable=False, index=True)
    asset_type = Column(String(50),  nullable=False)

    # Market price fields (populated by yfinance refresh)
    last_price    = Column(Numeric(18, 6), nullable=True)
    last_price_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, nullable=False, server_default=func.now())
