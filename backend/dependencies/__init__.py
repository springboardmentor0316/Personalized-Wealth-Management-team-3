"""
Shared dependencies for FastAPI endpoints.

This package is a good place to define reusable dependency functions
that can be injected via `Depends`, for example:
- Authentication and authorization checks
- Current user retrieval
- Common pagination/query parameter parsing
- Access to external services (e.g. message queues, third-party APIs)

Keep these small, composable, and focused on cross-cutting concerns.
"""

from fastapi import Depends  # noqa: F401  # Imported for convenience in dependency modules.

from app.core.security import get_current_user  # re-export for convenience
from app.database import get_db  # re-export for convenience

__all__ = ["Depends", "get_current_user", "get_db"]
