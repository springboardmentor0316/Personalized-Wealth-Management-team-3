"""
Fixed app/models/user.py — compatible with both SQLite and PostgreSQL.
Uses String for UUID columns so SQLite works without any changes.
Replace your existing app/models/user.py with this file.
"""

from __future__ import annotations

import enum
import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum, String, func

from app.database import Base


class RiskProfile(enum.Enum):
    CONSERVATIVE = "Conservative"
    MODERATE     = "Moderate"
    AGGRESSIVE   = "Aggressive"


class KYCStatus(enum.Enum):
    PENDING  = "Pending"
    VERIFIED = "Verified"
    REJECTED = "Rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)

    risk_profile = Column(
        Enum(RiskProfile, name="risk_profile_enum", native_enum=False),
        nullable=False,
        default=RiskProfile.MODERATE,
    )

    kyc_status = Column(
        Enum(KYCStatus, name="kyc_status_enum", native_enum=False),
        nullable=False,
        default=KYCStatus.PENDING,
    )

    is_active = Column(Boolean, nullable=False, default=True, server_default="1")
    created_at = Column(DateTime, nullable=False, server_default=func.now())
