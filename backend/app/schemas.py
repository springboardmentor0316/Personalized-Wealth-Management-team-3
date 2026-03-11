from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional


# ---------------- USER ----------------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    risk_profile: str
    kyc_status: str

    class Config:
        from_attributes = True


# ---------------- TOKEN ----------------

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


# ---------------- PROFILE UPDATE (ADVANCED RISK) ----------------

class ProfileUpdate(BaseModel):
    risk_profile: str
    risk_profile: Optional[str] = None
    kyc_status: Optional[str] = None
    age: Optional[int] = None
    monthly_income: Optional[int] = None
    investment_duration: Optional[int] = None
    preferred_sector: Optional[str] = None
    expected_return: Optional[int] = None


# ---------------- GOALS ----------------

class GoalCreate(BaseModel):
    goal_type: str
    target_amount: float
    target_date: date
    monthly_contribution: float


class GoalOut(BaseModel):
    id: int
    goal_type: str
    target_amount: float
    target_date: date
    monthly_contribution: float
    status: str
    progress: int 

    class Config:
        from_attributes = True
        
        from pydantic import BaseModel

class RiskInput(BaseModel):
    age: int
    annual_income: float
    investment_years: int


class RiskResult(BaseModel):
    score: int
    risk_profile: str


class PortfolioOut(BaseModel):
    risk_profile: str
    equity: int
    debt: int
    gold: int



# -------- INVESTMENTS --------

from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class InvestmentCreate(BaseModel):
    asset_type: str
    symbol: str
    units: Decimal
    avg_buy_price: Decimal
    cost_basis: Decimal


class InvestmentOut(BaseModel):
    id: int
    asset_type: str
    symbol: str
    units: Decimal
    avg_buy_price: Decimal
    cost_basis: Decimal
    current_value: Decimal
    last_price: Decimal

    class Config:
         from_attributes = True
        
        
# -------- Transaction --------
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class TransactionType(str, Enum):
    buy = "buy"
    sell = "sell"
    dividend = "dividend"
    contribution = "contribution"
    withdrawal = "withdrawal"


class TransactionCreate(BaseModel):
    symbol: str
    type: str
    quantity: Decimal
    price: Decimal
    fees: Decimal = 0


class TransactionOut(BaseModel):
    id: int
    symbol: str
    type: str
    quantity: Decimal
    price: Decimal
    fees: Decimal

    class Config:
        from_attributes = True