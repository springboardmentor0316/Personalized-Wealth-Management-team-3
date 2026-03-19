from __future__ import annotations

from datetime import date as dt_date, datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class InvestmentBase(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20)
    asset_type: str = Field(..., min_length=1, max_length=50)


class InvestmentCreate(InvestmentBase):
    pass


class InvestmentUpdate(BaseModel):
    symbol: str | None = Field(default=None, min_length=1, max_length=20)
    asset_type: str | None = Field(default=None, min_length=1, max_length=50)


class InvestmentResponse(InvestmentBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionBase(BaseModel):
    type: Literal["buy", "sell"]
    quantity: float = Field(..., gt=0)
    price: float = Field(..., ge=0)
    date: dt_date


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    type: Optional[Literal["buy", "sell"]] = None
    quantity: Optional[float] = Field(default=None, gt=0)
    price: Optional[float] = Field(default=None, ge=0)
    date: Optional[dt_date] = None


class TransactionResponse(TransactionBase):
    id: UUID
    investment_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionListItem(BaseModel):
    id: UUID
    investment_id: UUID
    symbol: str
    asset_type: str
    type: Literal["buy", "sell"]
    quantity: float
    price: float
    date: dt_date
    profit_loss: float


class PortfolioSummaryItem(BaseModel):
    symbol: str
    total_quantity: float
    avg_cost_basis: float
    current_value: float
    profit_loss: float


class SavingsStreakResponse(BaseModel):
    streak_months: int
    message: str
