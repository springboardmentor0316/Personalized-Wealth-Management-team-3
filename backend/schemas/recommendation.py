from __future__ import annotations

from datetime import datetime
from typing import Any, Dict
from uuid import UUID

from pydantic import BaseModel


class RecommendationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    recommendation_text: str
    suggested_allocation: Dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}


class MarketPriceResponse(BaseModel):
    symbol: str
    price: float | None
    last_price_at: datetime | None
