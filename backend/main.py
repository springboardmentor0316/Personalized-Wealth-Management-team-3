"""
Updated app/main.py — registers all new routers for Milestones 3 & 4.
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

load_dotenv(Path(__file__).resolve().parent / ".env")

from app.db.base import Base
from app.db.session import engine
from app.models.goal import Goal                          # noqa: F401
from app.models.investment import Investment              # noqa: F401
from app.models.transaction import Transaction            # noqa: F401
from app.models.user import User                         # noqa: F401
from app.models.simulation import Simulation             # noqa: F401  ← NEW
from app.models.recommendation import Recommendation     # noqa: F401  ← NEW
from app.routers import auth, goals, portfolio, users
from app.routers import simulations, recommendations      # ← NEW

logger = logging.getLogger(__name__)

app = FastAPI(
    title="WealthTrack API",
    version="0.2.0",
    description="Personalized Wealth Management & Goal Tracker",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Existing routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(goals.router)
app.include_router(portfolio.router)

# New routers (Milestones 3 & 4)
app.include_router(simulations.router)
app.include_router(recommendations.router)


@app.get("/health", tags=["health"])
async def health_check() -> dict:
    return {"status": "ok"}


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
