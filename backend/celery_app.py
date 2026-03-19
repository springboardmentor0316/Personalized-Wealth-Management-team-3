"""
Celery application and scheduled tasks.

Setup:
    pip install celery redis

Run worker (in project root):
    celery -A app.celery_app worker --loglevel=info

Run beat scheduler (nightly task):
    celery -A app.celery_app beat --loglevel=info

Environment variables needed in .env:
    CELERY_BROKER_URL=redis://localhost:6379/0
    CELERY_RESULT_BACKEND=redis://localhost:6379/0
"""

from __future__ import annotations

import logging
import os

from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv

from pathlib import Path
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

logger = logging.getLogger(__name__)

BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

celery_app = Celery(
    "wealthtrack",
    broker=BROKER_URL,
    backend=RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    # Nightly at 11 PM UTC
    beat_schedule={
        "nightly-price-refresh": {
            "task": "app.celery_app.nightly_price_refresh",
            "schedule": crontab(hour=23, minute=0),
        },
    },
)


@celery_app.task(name="app.celery_app.nightly_price_refresh", bind=True, max_retries=3)
def nightly_price_refresh(self):
    """
    Celery task: refresh market prices for all investments.
    Runs every night at 11 PM UTC via beat scheduler.
    """
    try:
        from app.db.session import SessionLocal
        from app.services.market import refresh_all_portfolio_prices

        db = SessionLocal()
        try:
            updated = refresh_all_portfolio_prices(db)
            logger.info("Nightly refresh complete: %d investments updated", updated)
            return {"status": "ok", "updated": updated}
        finally:
            db.close()

    except Exception as exc:
        logger.error("Nightly price refresh failed: %s", exc)
        raise self.retry(exc=exc, countdown=60 * 10)  # retry after 10 min
