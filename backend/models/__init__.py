"""
Database models package.

This package should contain SQLAlchemy ORM models that define the
database schema for the application.

Recommended structure:
- `user.py` for user-related models
- `transaction.py` for financial transaction models
- `account.py` for account-related models

All models should inherit from `app.database.Base` to ensure they
are included in metadata for migrations and table creation.
"""

from .goal import Goal
from .investment import Investment
from .transaction import Transaction
from .user import User

__all__ = ["User", "Goal", "Investment", "Transaction"]
