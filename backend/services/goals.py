from __future__ import annotations

from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalUpdate


def list_goals(db: Session, user_id: UUID) -> list[Goal]:
    return (
        db.query(Goal)
        .filter(Goal.user_id == user_id)
        .order_by(Goal.target_date.asc(), Goal.created_at.desc())
        .all()
    )


def create_goal(db: Session, user_id: UUID, payload: GoalCreate) -> Goal:
    goal = Goal(
        user_id=user_id,
        name=payload.name,
        notes=payload.notes,
        target_amount=payload.target_amount,
        target_date=payload.target_date,
        monthly_contribution=payload.monthly_contribution,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def get_goal(db: Session, user_id: UUID, goal_id: UUID) -> Goal | None:
    return db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()


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
    if not goal.target_amount or goal.target_amount <= 0:
        return 0.0, 0.0

    months_passed = max(
        0,
        (date.today().year - goal.created_at.date().year) * 12
        + (date.today().month - goal.created_at.date().month),
    )
    estimated_contributed = float(goal.monthly_contribution) * months_passed
    target_amount = float(goal.target_amount)
    progress = min(100.0, (estimated_contributed / target_amount) * 100) if target_amount else 0.0
    return estimated_contributed, round(progress, 2)
