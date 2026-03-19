from __future__ import annotations

import uuid

from sqlalchemy import Column, Date, DateTime, ForeignKey, Numeric, String, Text, func

from app.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id      = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    name                 = Column(String(255), nullable=False)
    goal_type            = Column(String(20),  nullable=False, default="custom")
    notes                = Column(Text,        nullable=True)
    target_amount        = Column(Numeric(12, 2), nullable=False)
    target_date          = Column(Date,          nullable=False)
    monthly_contribution = Column(Numeric(12, 2), nullable=False, default=0)
    created_at           = Column(DateTime,      nullable=False, server_default=func.now())