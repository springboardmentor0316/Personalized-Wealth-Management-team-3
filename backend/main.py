"""
Final app/main.py — registers ALL routers including reports.
Replace your existing app/main.py with this file.
"""

from __future__ import annotations

import logging
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette import status

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from app.db.base import Base
from app.db.session import engine
from app.models.goal import Goal
from app.models.investment import Investment
from app.models.recommendation import Recommendation
from app.models.simulation import Simulation
from app.models.transaction import Transaction
from app.models.user import User
from app.routers import auth, goals, portfolio, users
from app.routers import simulations, recommendations, reports

logger = logging.getLogger(__name__)

app = FastAPI(
    title="WealthTrack API",
    version="1.0.0",
    description="Personalized Wealth Management & Goal Tracker — Full Build",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(goals.router)
app.include_router(portfolio.router)
app.include_router(simulations.router)
app.include_router(recommendations.router)
app.include_router(reports.router)


@app.get("/health", tags=["health"])
async def health_check() -> dict:
    return {"status": "ok", "version": "1.0.0"}


@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    from fastapi import HTTPException
    from fastapi.exceptions import RequestValidationError
    if isinstance(exc, (HTTPException, RequestValidationError)):
        raise exc
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error."},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
