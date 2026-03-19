"""
Simulation engine — what-if scenario calculator.

Computes compound growth projections with:
- Monthly SIP contributions
- Annual return rate
- Inflation adjustment
- Goal-achievability check
"""

from __future__ import annotations

import math
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.simulation import Simulation
from app.schemas.simulation import SimulationAssumptions, SimulationCreate, SimulationResults


# ── Core calculation engine ────────────────────────────────────────────────


def run_simulation(assumptions: SimulationAssumptions) -> SimulationResults:
    """
    Run a compound growth simulation month by month.

    Formula: FV with regular contributions + compound interest
        V(n) = P*(1+r)^n + C * [((1+r)^n - 1) / r]
    where:
        P = initial_amount
        C = monthly_contribution
        r = monthly_return_rate = annual_return / 12
        n = total months
    """
    monthly_rate = assumptions.annual_return_pct / 100 / 12
    inflation_monthly = assumptions.inflation_pct / 100 / 12
    total_months = assumptions.years * 12

    value = float(assumptions.initial_amount)
    total_invested = float(assumptions.initial_amount)
    monthly_data: List[Dict[str, Any]] = []
    months_to_goal: Optional[int] = None

    for month in range(1, total_months + 1):
        value = value * (1 + monthly_rate) + assumptions.monthly_contribution
        total_invested += assumptions.monthly_contribution

        if assumptions.target_amount and months_to_goal is None:
            if value >= assumptions.target_amount:
                months_to_goal = month

        # Record every 6 months for the chart (keeps payload small)
        if month % 6 == 0 or month == total_months:
            monthly_data.append(
                {
                    "month": month,
                    "year": round(month / 12, 1),
                    "value": round(value, 2),
                    "invested": round(total_invested, 2),
                    "returns": round(value - total_invested, 2),
                }
            )

    projected_value = round(value, 2)
    total_returns = round(projected_value - total_invested, 2)

    # Inflation-adjusted real value
    real_value = projected_value / ((1 + inflation_monthly) ** total_months)
    real_value = round(real_value, 2)

    goal_achievable = (
        (projected_value >= assumptions.target_amount)
        if assumptions.target_amount
        else True
    )

    return SimulationResults(
        projected_value=projected_value,
        total_invested=round(total_invested, 2),
        total_returns=total_returns,
        real_value_inflation_adjusted=real_value,
        months_to_goal=months_to_goal,
        goal_achievable=goal_achievable,
        monthly_data=monthly_data,
    )


def compare_scenarios(scenarios: list[SimulationAssumptions]) -> list[SimulationResults]:
    """Run multiple scenarios and return all results for comparison."""
    return [run_simulation(s) for s in scenarios]


# ── DB persistence ─────────────────────────────────────────────────────────


def save_simulation(
    db: Session,
    user_id: UUID,
    payload: SimulationCreate,
    results: SimulationResults,
) -> Simulation:
    sim = Simulation(
        user_id=user_id,
        goal_id=payload.goal_id,
        scenario_name=payload.scenario_name,
        assumptions=payload.assumptions.model_dump(),
        results=results.model_dump(),
    )
    db.add(sim)
    db.commit()
    db.refresh(sim)
    return sim


def list_simulations(db: Session, user_id: UUID) -> list[Simulation]:
    return (
        db.query(Simulation)
        .filter(Simulation.user_id == user_id)
        .order_by(Simulation.created_at.desc())
        .all()
    )


def get_simulation(db: Session, user_id: UUID, sim_id: UUID) -> Simulation | None:
    return (
        db.query(Simulation)
        .filter(Simulation.id == sim_id, Simulation.user_id == user_id)
        .first()
    )


def delete_simulation(db: Session, sim: Simulation) -> None:
    db.delete(sim)
    db.commit()
