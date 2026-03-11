from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, Numeric, Date, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
import enum


class RiskProfile(str, enum.Enum):
    conservative = "conservative"
    moderate = "moderate"
    aggressive = "aggressive"


class KYCStatus(str, enum.Enum):
    unverified = "unverified"
    verified = "verified"


class GoalStatus(str, enum.Enum):
    active = "active"
    paused = "paused"
    completed = "completed"


class AssetType(str, enum.Enum):
    stock = "stock"
    etf = "etf"
    mutual_fund = "mutual_fund"
    bond = "bond"
    cash = "cash"


class TransactionType(str, enum.Enum):
    buy = "buy"
    sell = "sell"
    dividend = "dividend"
    contribution = "contribution"
    withdrawal = "withdrawal"


# =========================
# USER
# =========================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    risk_profile = Column(Enum(RiskProfile), default=RiskProfile.moderate)
    kyc_status = Column(Enum(KYCStatus), default=KYCStatus.unverified)

    created_at = Column(TIMESTAMP, server_default=func.now())

    goals = relationship("Goal", back_populates="user")
    investments = relationship("Investment", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")


# =========================
# GOALS
# =========================

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    goal_type = Column(String)
    target_amount = Column(Numeric)
    target_date = Column(Date)

    monthly_contribution = Column(Numeric, default=0)
    progress = Column(Integer, default=0)

    status = Column(Enum(GoalStatus), default=GoalStatus.active)

    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="goals")


# =========================
# INVESTMENTS
# =========================

class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    asset_type = Column(Enum(AssetType))
    symbol = Column(String)

    units = Column(Numeric, default=0)
    avg_buy_price = Column(Numeric, default=0)

    cost_basis = Column(Numeric, default=0)
    current_value = Column(Numeric, default=0)

    last_price = Column(Numeric, default=0)
    last_price_at = Column(TIMESTAMP, server_default=func.now())

    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="investments")


# =========================
# TRANSACTIONS
# =========================

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    investment_id = Column(Integer, ForeignKey("investments.id"))

    symbol = Column(String)
    type = Column(Enum(TransactionType))

    quantity = Column(Numeric)
    price = Column(Numeric)
    fees = Column(Numeric, default=0)

    executed_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="transactions")