"""
Investment model — updated with market price fields.

Replace your existing app/models/investment.py with this file.
New columns: last_price, last_price_at
These are populated by app/services/market.py (yfinance).
"""

from __future__ import annotations

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Investment(Base):
    __tablename__ = "investments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    symbol = Column(String(length=20), nullable=False, index=True)
    asset_type = Column(String(length=50), nullable=False)

    # ── Market price fields (populated by nightly Celery task / on-demand refresh) ──
    last_price = Column(Numeric(18, 6), nullable=True)
    last_price_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
