from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.goal import GoalCreate, GoalProgressResponse, GoalResponse, GoalUpdate
from app.services.goals import (
    compute_goal_progress,
    create_goal,
    delete_goal,
    get_goal,
    list_goals,
    update_goal,
)


router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("", response_model=list[GoalResponse])
def list_user_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[GoalResponse]:
    """
    Example request:
    GET /goals
    Authorization: Bearer <access_token>
    """
    return list_goals(db, current_user.id)


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_user_goal(
    payload: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GoalResponse:
    """
    Example request:
    POST /goals
    {
      "name": "Retirement",
      "target_amount": 500000,
      "target_date": "2035-12-31",
      "monthly_contribution": 1500
    }
    """
    return create_goal(db, current_user.id, payload)


@router.get("/{goal_id}", response_model=GoalResponse)
def read_goal(
    goal_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GoalResponse:
    goal = get_goal(db, current_user.id, goal_id)
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return goal


@router.put("/{goal_id}", response_model=GoalResponse)
def edit_goal(
    goal_id: UUID,
    payload: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GoalResponse:
    goal = get_goal(db, current_user.id, goal_id)
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return update_goal(db, goal, payload)


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_goal(
    goal_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    goal = get_goal(db, current_user.id, goal_id)
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    delete_goal(db, goal)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{goal_id}/progress", response_model=GoalProgressResponse)
def goal_progress(
    goal_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GoalProgressResponse:
    goal = get_goal(db, current_user.id, goal_id)
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")

    contributed, progress_percentage = compute_goal_progress(goal)
    return GoalProgressResponse(
        goal_id=goal.id,
        target_amount=float(goal.target_amount),
        estimated_contributed=round(contributed, 2),
        progress_percentage=progress_percentage,
    )
