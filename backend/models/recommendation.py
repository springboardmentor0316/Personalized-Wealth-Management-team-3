from __future__ import annotations

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSON, UUID

from app.database import Base


class Recommendation(Base):
    """
    Stores a personalized allocation recommendation for a user.

    - suggested_allocation: JSON dict e.g. {"equity": 60, "debt": 30, "gold": 10}
    - recommendation_text:  human-readable explanation
    """

    __tablename__ = "recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(length=255), nullable=False)
    recommendation_text = Column(Text, nullable=False)
    suggested_allocation = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
