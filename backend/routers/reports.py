"""
Reports router — PDF and full CSV download.

Endpoints:
  GET /reports/pdf      → download full PDF report
  GET /reports/csv      → download combined CSV (portfolio + goals)
"""

from __future__ import annotations

import csv
import io

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.user import User
from app.services.goals import compute_goal_progress, list_goals
from app.services.pdf_report import generate_portfolio_pdf
from app.services.portfolio import build_portfolio_summary

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/pdf")
def download_pdf_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    """
    Generate and download a full PDF report (portfolio + goals).
    Install reportlab first: pip install reportlab
    """
    pdf_bytes = generate_portfolio_pdf(db, current_user)
    filename = f"wealthtrack_report_{current_user.email.split('@')[0]}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/csv")
def download_full_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    """
    Download a combined CSV with portfolio summary + goals.
    """
    output = io.StringIO()
    writer = csv.writer(output)

    # Portfolio section
    writer.writerow(["=== PORTFOLIO SUMMARY ==="])
    writer.writerow(["Symbol", "Quantity", "Avg Cost (₹)", "Current Value (₹)", "P&L (₹)"])
    summary = build_portfolio_summary(db, current_user.id)
    for row in summary:
        writer.writerow([
            row["symbol"],
            row["total_quantity"],
            row["avg_cost_basis"],
            row["current_value"],
            row["profit_loss"],
        ])

    writer.writerow([])

    # Goals section
    writer.writerow(["=== GOALS ==="])
    writer.writerow(["Name", "Type", "Target (₹)", "Monthly (₹)", "Target Date", "Progress %", "Contributed (₹)"])
    goals = list_goals(db, current_user.id)
    for goal in goals:
        contributed, pct = compute_goal_progress(goal)
        writer.writerow([
            goal.name,
            goal.goal_type.value if goal.goal_type else "custom",
            float(goal.target_amount),
            float(goal.monthly_contribution),
            str(goal.target_date),
            round(pct, 2),
            round(contributed, 2),
        ])

    filename = f"wealthtrack_{current_user.email.split('@')[0]}.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
