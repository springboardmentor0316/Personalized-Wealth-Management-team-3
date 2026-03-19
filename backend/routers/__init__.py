"""
API routers package.

This package should contain FastAPI router modules that group related
endpoints. Each module typically defines an `APIRouter` instance and
registers routes on it.

Examples:
- `users.py` for user management endpoints
- `auth.py` for authentication and authorization
- `transactions.py` for financial transaction operations

Routers should be included in `app.main` using `app.include_router(...)`.
"""

from fastapi import APIRouter


# Root router for aggregating sub-routers, if desired.
router = APIRouter()

# Example (to be implemented later):
# from . import users
# router.include_router(users.router, prefix="/users", tags=["users"])

