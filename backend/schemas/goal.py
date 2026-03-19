"""
Fixed app/schemas/goal.py — resolves GoalType enum serialization error.
Replace your existing app/schemas/goal.py with this file.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field

GoalTypeEnum = Literal["retirement", "home", "education", "custom"]


class GoalBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    goal_type: GoalTypeEnum = "custom"
    notes: Optional[str] = None
    target_amount: float = Field(..., gt=0)
    target_date: date
    monthly_contribution: float = Field(..., ge=0)


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    goal_type: Optional[GoalTypeEnum] = None
    notes: Optional[str] = None
    target_amount: Optional[float] = Field(default=None, gt=0)
    target_date: Optional[date] = None
    monthly_contribution: Optional[float] = Field(default=None, ge=0)


class GoalResponse(GoalBase):
    id: str
    user_id: str
    created_at: datetime

    model_config = {
        "from_attributes": True,
        "use_enum_values": True,   # ← THIS is the fix — converts GoalType.CUSTOM → "custom"
    }


class GoalProgressResponse(BaseModel):
    goal_id: str
    target_amount: float
    estimated_contributed: float
    progress_percentage: float