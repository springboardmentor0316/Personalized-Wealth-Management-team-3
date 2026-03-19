"""
Fixed app/models/simulation.py — compatible with both SQLite and PostgreSQL.
Replace your existing app/models/simulation.py with this file.
"""

from __future__ import annotations

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.types import JSON

from app.database import Base


class Simulation(Base):
    __tablename__ = "simulations"

    id      = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    goal_id = Column(String(36), ForeignKey("goals.id",  ondelete="SET NULL"), nullable=True)

    scenario_name = Column(String(255), nullable=False, default="My Scenario")
    assumptions   = Column(JSON, nullable=False, default=dict)
    results       = Column(JSON, nullable=False, default=dict)
    created_at    = Column(DateTime, nullable=False, server_default=func.now())
