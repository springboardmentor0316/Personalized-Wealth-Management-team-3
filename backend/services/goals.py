from __future__ import annotations

from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalUpdate


def list_goals(db: Session, user_id) -> list[Goal]:
    return (
        db.query(Goal)
        .filter(Goal.user_id == str(user_id))
        .order_by(Goal.target_date.asc(), Goal.created_at.desc())
        .all()
    )


def create_goal(db: Session, user_id, payload: GoalCreate) -> Goal:
    goal = Goal(
        user_id=str(user_id),
        name=payload.name,
        goal_type=payload.goal_type or "custom",
        notes=payload.notes,
        target_amount=payload.target_amount,
        target_date=payload.target_date,
        monthly_contribution=payload.monthly_contribution,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def get_goal(db: Session, user_id, goal_id) -> Goal | None:
    return (
        db.query(Goal)
        .filter(
            Goal.id == str(goal_id),
            Goal.user_id == str(user_id),
        )
        .first()
    )


def update_goal(db: Session, goal: Goal, payload: GoalUpdate) -> Goal:
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)
    db.commit()
    db.refresh(goal)
    return goal


def delete_goal(db: Session, goal: Goal) -> None:
    db.delete(goal)
    db.commit()


def compute_goal_progress(goal: Goal) -> tuple[float, float]:
    if not goal.target_amount or float(goal.target_amount) <= 0:
        return 0.0, 0.0

    today = date.today()
    created = goal.created_at.date() if hasattr(goal.created_at, 'date') else date.today()

    months_passed = max(
        0,
        (today.year - created.year) * 12 + (today.month - created.month),
    )
    estimated_contributed = float(goal.monthly_contribution) * months_passed
    target_amount = float(goal.target_amount)
    progress = min(100.0, (estimated_contributed / target_amount) * 100) if target_amount else 0.0
    return estimated_contributed, round(progress, 2)