"""
Authentication-related API routes.

Endpoints:
- POST /auth/register
- POST /auth/login
- POST /auth/refresh

These routes form the core of the Week 2 authentication flow.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    ALGORITHM,
    REFRESH_TOKEN_SECRET,
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    Token,
    TokenRefreshRequest,
    UserCreate,
    UserLogin,
    UserResponse,
)


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    """
    Register a new user.

    - Ensures the email is unique
    - Hashes the password before storing
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        risk_profile=payload.risk_profile,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> Token:
    """
    Authenticate a user and issue access/refresh tokens.
    """
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/refresh", response_model=Token)
def refresh_tokens(payload: TokenRefreshRequest) -> Token:
    """
    Issue a new access token (and refresh token) from a valid refresh token.
    """
    from jose import JWTError, jwt

    try:
        refresh_payload = jwt.decode(
            payload.refresh_token, REFRESH_TOKEN_SECRET, algorithms=[ALGORITHM]
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if refresh_payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token type",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = refresh_payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=str(user_id))
    new_refresh_token = create_refresh_token(subject=str(user_id))

    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
    )
