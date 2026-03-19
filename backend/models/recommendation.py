"""
Fixed app/models/recommendation.py — compatible with both SQLite and PostgreSQL.
Replace your existing app/models/recommendation.py with this file.
"""

from __future__ import annotations

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.types import JSON

from app.database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id      = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title                  = Column(String(255), nullable=False)
    recommendation_text    = Column(Text,        nullable=False)
    suggested_allocation   = Column(JSON,        nullable=False, default=dict)
    created_at             = Column(DateTime,    nullable=False, server_default=func.now())
