"""
Fixed app/core/security.py — handles string UUIDs from SQLite.
Replace your existing app/core/security.py with this file.
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import bcrypt
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User

# Load .env from project root
load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

security = HTTPBearer()

ACCESS_TOKEN_SECRET  = os.getenv("ACCESS_TOKEN_SECRET",  "dev_access_secret_change_in_prod")
REFRESH_TOKEN_SECRET = os.getenv("REFRESH_TOKEN_SECRET", "dev_refresh_secret_change_in_prod")
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS   = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS",   "7"))


def hash_password(password: str) -> str:
    salt   = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def _create_token(*, subject: str, expires_delta: timedelta, secret: str, token_type: str) -> str:
    now    = datetime.now(timezone.utc)
    expire = now + expires_delta
    payload: Dict[str, Any] = {
        "sub":  subject,
        "type": token_type,
        "iat":  int(now.timestamp()),
        "exp":  int(expire.timestamp()),
    }
    return jwt.encode(payload, secret, algorithm=ALGORITHM)


def create_access_token(subject: str) -> str:
    return _create_token(
        subject=subject,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        secret=ACCESS_TOKEN_SECRET,
        token_type="access",
    )


def create_refresh_token(subject: str) -> str:
    return _create_token(
        subject=subject,
        expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        secret=REFRESH_TOKEN_SECRET,
        token_type="refresh",
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, ACCESS_TOKEN_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    subject: Optional[str] = payload.get("sub")
    if not subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    # Works with both UUID objects and plain strings (SQLite stores as string)
    user: Optional[User] = db.query(User).filter(User.id == subject).first()

    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive or unknown user")

    return user
