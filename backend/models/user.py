"""
User model definition.

This module defines the SQLAlchemy ORM model for application users.
It is designed to be:
- PostgreSQL friendly (UUID primary key, native enums)
- Extensible for future user-related features (roles, permissions, etc.)
"""

from __future__ import annotations

import enum
import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum, String, func
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class RiskProfile(enum.Enum):
    """Represents the user's investment risk appetite."""

    CONSERVATIVE = "Conservative"
    MODERATE = "Moderate"
    AGGRESSIVE = "Aggressive"


class KYCStatus(enum.Enum):
    """Represents the user's KYC (Know Your Customer) verification status."""

    PENDING = "Pending"
    VERIFIED = "Verified"
    REJECTED = "Rejected"


class User(Base):
    """
    Core user entity.

    Notes:
    - `id` uses PostgreSQL's UUID type for scalability and security.
    - `email` is indexed and unique to support fast lookup and enforce uniqueness.
    - `hashed_password` should store a securely hashed password (e.g. using bcrypt/argon2).
    - Enum fields are implemented as native PostgreSQL enums for integrity and performance.
    """

    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )

    email = Column(
        String(length=255),
        unique=True,
        index=True,
        nullable=False,
    )

    full_name = Column(
        String(length=255),
        nullable=True,
    )

    hashed_password = Column(
        String(length=255),
        nullable=False,
    )

    risk_profile = Column(
        Enum(
            RiskProfile,
            name="risk_profile_enum",
            native_enum=True,
        ),
        nullable=False,
        default=RiskProfile.MODERATE,
    )

    kyc_status = Column(
        Enum(
            KYCStatus,
            name="kyc_status_enum",
            native_enum=True,
        ),
        nullable=False,
        default=KYCStatus.PENDING,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

