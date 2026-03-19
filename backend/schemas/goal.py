from __future__ import annotations

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


class GoalBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    notes: str | None = None
    target_amount: float = Field(..., gt=0)
    target_date: date
    monthly_contribution: float = Field(..., ge=0)


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    notes: str | None = None
    target_amount: float | None = Field(default=None, gt=0)
    target_date: date | None = None
    monthly_contribution: float | None = Field(default=None, ge=0)


class GoalResponse(GoalBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class GoalProgressResponse(BaseModel):
    goal_id: UUID
    target_amount: float
    estimated_contributed: float
    progress_percentage: float
