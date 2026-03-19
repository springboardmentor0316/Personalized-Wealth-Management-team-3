from __future__ import annotations

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import JSON, UUID

from app.database import Base


class Simulation(Base):
    """
    Stores a saved what-if simulation for a user.

    - assumptions: JSON dict of inputs (monthly_contribution, annual_return_pct, etc.)
    - results:     JSON dict of computed outputs (projected_value, months_to_goal, etc.)
    - goal_id:     optional FK — simulation can be tied to a specific goal
    """

    __tablename__ = "simulations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    goal_id = Column(
        UUID(as_uuid=True),
        ForeignKey("goals.id", ondelete="SET NULL"),
        nullable=True,
    )
    scenario_name = Column(String(length=255), nullable=False, default="My Scenario")
    assumptions = Column(JSON, nullable=False, default=dict)
    results = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
