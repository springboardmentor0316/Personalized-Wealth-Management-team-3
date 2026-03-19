"""
Fixed database.py — works with both SQLite and PostgreSQL.
Looks for .env in project root (one level above app/).
Replace your existing app/database.py with this file.
"""

from __future__ import annotations

import os
from collections.abc import Generator
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, declarative_base, sessionmaker

# Look for .env in project root (parent of app/)
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Default to SQLite so the app works out of the box without any config
    _db_path = Path(__file__).resolve().parent.parent / "fintech.db"
    DATABASE_URL = f"sqlite:///{_db_path}"
    print(f"[DB] No DATABASE_URL found — using SQLite at {_db_path}")

# ── Engine setup ───────────────────────────────────────────────────────────
_is_sqlite = DATABASE_URL.startswith("sqlite")

if _is_sqlite:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},  # needed for SQLite + FastAPI
        pool_pre_ping=True,
    )

    # Enable WAL mode and foreign keys for SQLite
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragmas(dbapi_conn, _):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# ── Session factory ────────────────────────────────────────────────────────
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session,
)

# ── Base class for all ORM models ──────────────────────────────────────────
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
