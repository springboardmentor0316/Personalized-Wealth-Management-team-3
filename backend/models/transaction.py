"""
Fixed app/models/transaction.py — compatible with both SQLite and PostgreSQL.
Replace your existing app/models/transaction.py with this file.
"""

from __future__ import annotations

import uuid

from sqlalchemy import Column, Date, DateTime, ForeignKey, Numeric, String, func

from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id            = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    investment_id = Column(String(36), ForeignKey("investments.id", ondelete="CASCADE"), nullable=False, index=True)

    type     = Column(String(10),    nullable=False)   # buy / sell
    quantity = Column(Numeric(18, 6), nullable=False)
    price    = Column(Numeric(18, 6), nullable=False)
    date     = Column(Date,           nullable=False)
    created_at = Column(DateTime,     nullable=False, server_default=func.now())
