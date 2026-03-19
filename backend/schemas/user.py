"""
Pydantic schemas for user-related operations.

These schemas define the shapes of:
- Incoming request payloads (registration, login, updates)
- Outgoing response payloads
- Authentication tokens

They are intentionally decoupled from ORM models but aligned with
`app.models.user.User` to keep the API layer clean and stable.
"""

from __future__ import annotations

from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.user import KYCStatus, RiskProfile


class UserBase(BaseModel):
    """Common attributes shared across user schemas."""

    email: EmailStr
    full_name: Optional[str] = None

    model_config = {"from_attributes": True}


class UserCreate(UserBase):
    """
    Payload for creating a new user.

    Note:
    - `password` should be hashed before persisting.
    - Additional signup fields (e.g. referral code) can be added here later.
    """

    password: str = Field(..., min_length=8, description="Plaintext password (min 8 characters).")
    risk_profile: RiskProfile = RiskProfile.MODERATE


class UserLogin(BaseModel):
    """Payload for authenticating an existing user."""

    email: EmailStr
    password: str = Field(..., min_length=8, description="Plaintext password (min 8 characters).")


class UserResponse(UserBase):
    """
    Public representation of a user.

    Sensitive fields such as `hashed_password` are intentionally omitted.
    """

    id: UUID
    risk_profile: RiskProfile
    kyc_status: KYCStatus

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """
    Payload for updating user profile information.

    Fields are optional to support partial updates (PATCH semantics).
    """

    full_name: Optional[str] = None
    risk_profile: Optional[RiskProfile] = None


class Token(BaseModel):
    """
    Authentication token pair.

    Typically returned after a successful login or token refresh.
    """

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefreshRequest(BaseModel):
    """Payload for requesting a new access token using a refresh token."""

    refresh_token: str

