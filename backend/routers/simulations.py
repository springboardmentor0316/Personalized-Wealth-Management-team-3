from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.simulation import SimulationCreate, SimulationResponse, SimulationResults
from app.services.simulation import (
    delete_simulation,
    get_simulation,
    list_simulations,
    run_simulation,
    save_simulation,
)

router = APIRouter(prefix="/simulations", tags=["simulations"])


@router.post("/run", response_model=SimulationResults)
def run_scenario(
    payload: SimulationCreate,
    current_user: User = Depends(get_current_user),
):
    """
    Run a what-if simulation WITHOUT saving it.
    Great for real-time UI updates as the user adjusts sliders.

    Example request:
    POST /simulations/run
    {
      "scenario_name": "Aggressive SIP",
      "assumptions": {
        "initial_amount": 50000,
        "monthly_contribution": 10000,
        "annual_return_pct": 12,
        "inflation_pct": 6,
        "years": 15,
        "target_amount": 5000000
      }
    }
    """
    return run_simulation(payload.assumptions)


@router.post("", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
def save_scenario(
    payload: SimulationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run a simulation AND save it for future reference."""
    results = run_simulation(payload.assumptions)
    sim = save_simulation(db, current_user.id, payload, results)
    return sim


@router.get("", response_model=list[SimulationResponse])
def list_user_simulations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all saved simulations for the current user."""
    return list_simulations(db, current_user.id)


@router.get("/{sim_id}", response_model=SimulationResponse)
def get_user_simulation(
    sim_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sim = get_simulation(db, current_user.id, sim_id)
    if not sim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")
    return sim


@router.delete("/{sim_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_simulation(
    sim_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sim = get_simulation(db, current_user.id, sim_id)
    if not sim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")
    delete_simulation(db, sim)
