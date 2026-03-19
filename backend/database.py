"""
Database configuration and session management.

This module is responsible for:
- Creating the SQLAlchemy engine
- Creating a configured SessionLocal class
- Providing a base class for ORM models
- Defining common database dependencies (e.g. `get_db`)

The database connection URL is read from the `DATABASE_URL` environment
variable, which can be populated via a `.env` file for local development.

Example `DATABASE_URL` for PostgreSQL:
    DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/fintech

For production:
- Use strong credentials and least-privilege database users
- Ensure connections are encrypted (TLS) where applicable
- Prefer connection URLs managed by your deployment platform's secret store
"""

from __future__ import annotations

import os
from collections.abc import Generator

from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker


# Load .env from app directory so DATABASE_URL is found when run from project root.
load_dotenv(Path(__file__).resolve().parent / ".env")


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fintech.db")


#if not DATABASE_URL:
    # Fail fast in case the environment is misconfigured.
    # This makes deployment issues obvious at startup time.
   # raise RuntimeError(
    #    "DATABASE_URL environment variable is not set. "
     #   "Configure it in your environment or .env file, e.g. "
     #   "'postgresql+psycopg://user:password@host:5432/db_name'."
  #  )



# Create the SQLAlchemy engine.
# `pool_pre_ping=True` helps gracefully handle stale connections.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

# Configured session factory.
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session,
)

# Base class for all ORM models.
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency that provides a SQLAlchemy session.

    Usage:
        from fastapi import Depends
        from app.database import get_db

        def endpoint(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

