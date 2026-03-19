"""
User-related API routes.

This module exposes endpoints for interacting with the authenticated
user's profile. All routes require a valid JWT and use the
`get_current_user` dependency to resolve the current user.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.user import RiskProfile, User
from app.schemas.user import UserResponse, UserUpdate


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)) -> UserResponse:
    """
    Return the currently authenticated user's profile.

    The `get_current_user` dependency is expected to:
    - Validate the JWT
    - Load the corresponding user from the database
    - Raise an HTTP 401/403 error if authentication fails
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    Update the current user's profile.

    Only `full_name` and `risk_profile` are allowed to be modified.
    Attempts to change `email`, `kyc_status`, or other fields should be
    ignored or validated at the service layer.

    Risk profile validation:
    - `UserUpdate.risk_profile` is typed as `RiskProfile`, so Pydantic
      will validate incoming values against the enum automatically.

    Persistence:
    - This function updates the in-memory `current_user` object.
    - The actual database commit should be handled in a service layer
      or via an injected session once business logic is implemented.
    """

    if payload.full_name is not None:
        current_user.full_name = payload.full_name

    if payload.risk_profile is not None:
        # `risk_profile` is already validated as a `RiskProfile` enum by Pydantic.
        if not isinstance(payload.risk_profile, RiskProfile):
            # This branch is defensive; with correct typing it should not be hit.
            raise ValueError("Invalid risk profile value.")

        current_user.risk_profile = payload.risk_profile

    # NOTE: Do not modify `email`, `kyc_status`, or other sensitive fields here.
    db.commit()
    db.refresh(current_user)

    return current_user

