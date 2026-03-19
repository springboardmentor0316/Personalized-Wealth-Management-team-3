from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class SimulationAssumptions(BaseModel):
    """Input parameters for a simulation run."""

    initial_amount: float = Field(0.0, ge=0, description="Starting investment amount")
    monthly_contribution: float = Field(..., gt=0, description="Monthly SIP amount")
    annual_return_pct: float = Field(..., gt=0, le=100, description="Expected annual return %")
    inflation_pct: float = Field(6.0, ge=0, le=30, description="Expected annual inflation %")
    years: int = Field(..., gt=0, le=50, description="Investment horizon in years")
    target_amount: Optional[float] = Field(None, ge=0, description="Goal target amount")


class SimulationResults(BaseModel):
    """Computed outputs from a simulation run."""

    projected_value: float
    total_invested: float
    total_returns: float
    real_value_inflation_adjusted: float
    months_to_goal: Optional[int]
    goal_achievable: bool
    monthly_data: list[Dict[str, Any]]  # month-by-month growth for chart


class SimulationCreate(BaseModel):
    scenario_name: str = Field("My Scenario", min_length=1, max_length=255)
    goal_id: Optional[UUID] = None
    assumptions: SimulationAssumptions


class SimulationResponse(BaseModel):
    id: UUID
    user_id: UUID
    goal_id: Optional[UUID]
    scenario_name: str
    assumptions: Dict[str, Any]
    results: Dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}
