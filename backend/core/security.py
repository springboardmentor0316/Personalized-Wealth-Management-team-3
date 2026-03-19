"""
Security utilities: password hashing, JWT creation, and current user retrieval.

This module provides:
- `hash_password` / `verify_password` for secure password handling
- `create_access_token` / `create_refresh_token` for JWT issuance
- `get_current_user` dependency for JWT-based authentication

Configuration is driven by environment variables (see below). For local
development, these can be set in a `.env` file.

Required env variables (recommended):
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`

Optional env variables:
- `ACCESS_TOKEN_EXPIRE_MINUTES` (default: 15)
- `REFRESH_TOKEN_EXPIRE_DAYS` (default: 7)
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, Optional
from uuid import UUID

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import bcrypt
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User


load_dotenv(Path(__file__).resolve().parent.parent / ".env")

security = HTTPBearer()


# ACCESS_TOKEN_SECRET = os.getenv("ACCESS_TOKEN_SECRET", "")
# REFRESH_TOKEN_SECRET = os.getenv("REFRESH_TOKEN_SECRET", "")
ACCESS_TOKEN_SECRET = os.getenv("ACCESS_TOKEN_SECRET", "access-secret-key")
REFRESH_TOKEN_SECRET = os.getenv("REFRESH_TOKEN_SECRET", "refresh-secret-key")

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))


# if not ACCESS_TOKEN_SECRET or not REFRESH_TOKEN_SECRET:
    # Fail fast if secrets are not configured.
   # raise RuntimeError(
      #  "ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be set "
      #  "in the environment or .env file."
   # )


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify that a plaintext password matches the stored hash."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def _create_token(
    *,
    subject: str,
    expires_delta: timedelta,
    secret: str,
    token_type: str,
) -> str:
    """Internal helper to create a signed JWT."""

    now = datetime.now(timezone.utc)
    expire = now + expires_delta

    to_encode: Dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }

    return jwt.encode(to_encode, secret, algorithm=ALGORITHM)


def create_access_token(subject: str) -> str:
    """Create a short-lived access token for a given subject (user id)."""

    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return _create_token(
        subject=subject,
        expires_delta=expires_delta,
        secret=ACCESS_TOKEN_SECRET,
        token_type="access",
    )


def create_refresh_token(subject: str) -> str:
    """Create a long-lived refresh token for a given subject (user id)."""

    expires_delta = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    return _create_token(
        subject=subject,
        expires_delta=expires_delta,
        secret=REFRESH_TOKEN_SECRET,
        token_type="refresh",
    )


def _decode_token(token: str, secret: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Resolve the currently authenticated user from a Bearer access token.

    - Validates and decodes the JWT
    - Loads the corresponding user from the database
    - Ensures the user is active
    """

    token = credentials.credentials
    payload = _decode_token(token, ACCESS_TOKEN_SECRET)

    token_type: Optional[str] = payload.get("type")
    if token_type != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )

    subject: Optional[str] = payload.get("sub")
    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = UUID(subject)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user: Optional[User] = db.query(User).filter(User.id == user_id).first()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive or unknown user",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

