"""
PDF Report generation service.

Generates a professional portfolio + goals report as a PDF.

Install:
    pip install reportlab

Produces a multi-page PDF with:
  Page 1 — Cover (user name, date, risk profile)
  Page 2 — Portfolio Summary table
  Page 3 — Goals summary with progress bars
"""

from __future__ import annotations

import io
from datetime import datetime, timezone
from uuid import UUID

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    HRFlowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from sqlalchemy.orm import Session

from app.models.user import User
from app.services.goals import compute_goal_progress, list_goals
from app.services.portfolio import build_portfolio_summary

# ── Colours ────────────────────────────────────────────────────────────────
PRIMARY   = colors.HexColor("#4f46e5")
ACCENT    = colors.HexColor("#06b6d4")
SUCCESS   = colors.HexColor("#10b981")
DANGER    = colors.HexColor("#ef4444")
MUTED     = colors.HexColor("#8888aa")
DARK      = colors.HexColor("#1a1a2e")
LIGHT_BG  = colors.HexColor("#f0eeff")
WHITE     = colors.white


# ── Styles ─────────────────────────────────────────────────────────────────
def _styles():
    base = getSampleStyleSheet()
    return {
        "h1": ParagraphStyle("h1", fontSize=26, textColor=DARK,    leading=32, spaceAfter=6,  fontName="Helvetica-Bold"),
        "h2": ParagraphStyle("h2", fontSize=14, textColor=PRIMARY,  leading=18, spaceAfter=4,  fontName="Helvetica-Bold"),
        "h3": ParagraphStyle("h3", fontSize=11, textColor=DARK,    leading=14, spaceAfter=2,  fontName="Helvetica-Bold"),
        "body": ParagraphStyle("body", fontSize=9,  textColor=DARK,    leading=13, spaceAfter=2),
        "muted": ParagraphStyle("muted", fontSize=8, textColor=MUTED,  leading=12),
        "small": ParagraphStyle("small", fontSize=8, textColor=DARK,   leading=11),
    }


# ── Table style helpers ────────────────────────────────────────────────────
HEADER_STYLE = TableStyle([
    ("BACKGROUND",  (0, 0), (-1, 0), PRIMARY),
    ("TEXTCOLOR",   (0, 0), (-1, 0), WHITE),
    ("FONTNAME",    (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE",    (0, 0), (-1, 0), 9),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
    ("FONTSIZE",    (0, 1), (-1, -1), 8),
    ("GRID",        (0, 0), (-1, -1), 0.25, colors.HexColor("#e8e4f0")),
    ("TOPPADDING",  (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("ALIGN",       (1, 0), (-1, -1), "RIGHT"),
])


def _profit_color(val: float) -> colors.Color:
    return SUCCESS if val >= 0 else DANGER


# ── Main report generator ──────────────────────────────────────────────────
def generate_portfolio_pdf(db: Session, user: User) -> bytes:
    """
    Generate a full PDF report for the user.
    Returns raw PDF bytes — stream directly to the HTTP response.
    """
    buffer = io.BytesIO()
    W, H = A4
    margin = 2 * cm

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=margin,
        rightMargin=margin,
        topMargin=margin,
        bottomMargin=margin,
        title=f"WealthTrack Report — {user.full_name or user.email}",
        author="WealthTrack",
    )

    s = _styles()
    story = []
    now = datetime.now(timezone.utc)

    # ── PAGE 1: Cover ──────────────────────────────────────────────────────
    story.append(Spacer(1, 3 * cm))

    # Accent bar
    story.append(HRFlowable(width="100%", thickness=4, color=PRIMARY, spaceAfter=20))

    story.append(Paragraph("WealthTrack", ParagraphStyle("brand", fontSize=11, textColor=MUTED, fontName="Helvetica")))
    story.append(Paragraph("Portfolio &amp; Goals Report", s["h1"]))
    story.append(Spacer(1, 0.4 * cm))

    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_BG, spaceAfter=16))

    meta = [
        ["Prepared for", user.full_name or "—"],
        ["Email",        user.email],
        ["Risk Profile", user.risk_profile.value if user.risk_profile else "—"],
        ["KYC Status",   user.kyc_status.value  if user.kyc_status  else "—"],
        ["Generated",    now.strftime("%d %B %Y, %H:%M UTC")],
    ]
    meta_table = Table(meta, colWidths=[4 * cm, 10 * cm])
    meta_table.setStyle(TableStyle([
        ("FONTNAME",  (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE",  (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (0, -1), MUTED),
        ("TEXTCOLOR", (1, 0), (1, -1), DARK),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LINEBELOW", (0, 0), (-1, -2), 0.25, colors.HexColor("#e8e4f0")),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 2 * cm))
    story.append(HRFlowable(width="100%", thickness=4, color=ACCENT, spaceAfter=0))
    story.append(PageBreak())

    # ── PAGE 2: Portfolio Summary ──────────────────────────────────────────
    story.append(Paragraph("Portfolio Summary", s["h2"]))
    story.append(HRFlowable(width="100%", thickness=0.5, color=LIGHT_BG, spaceAfter=10))

    summary = build_portfolio_summary(db, user.id)

    if summary:
        total_value = sum(r["current_value"] for r in summary)
        total_pl    = sum(r["profit_loss"]    for r in summary)

        # Summary metrics row
        metrics = [["Total Portfolio Value", "Total P&L", "No. of Assets"]]
        metrics.append([
            f"₹{total_value:,.2f}",
            f"{'+'if total_pl>=0 else ''}₹{total_pl:,.2f}",
            str(len(summary)),
        ])
        mt = Table(metrics, colWidths=[(W - 2 * margin) / 3] * 3)
        mt.setStyle(TableStyle([
            ("BACKGROUND",   (0, 0), (-1, 0), LIGHT_BG),
            ("TEXTCOLOR",    (0, 0), (-1, 0), PRIMARY),
            ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",     (0, 0), (-1, 0), 8),
            ("FONTNAME",     (0, 1), (-1, 1), "Helvetica-Bold"),
            ("FONTSIZE",     (0, 1), (-1, 1), 13),
            ("TEXTCOLOR",    (1, 1), (1, 1),  SUCCESS if total_pl >= 0 else DANGER),
            ("ALIGN",        (0, 0), (-1, -1), "CENTER"),
            ("TOPPADDING",   (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 8),
            ("GRID",         (0, 0), (-1, -1), 0.25, colors.HexColor("#e8e4f0")),
        ]))
        story.append(mt)
        story.append(Spacer(1, 0.5 * cm))

        # Holdings table
        headers = ["Symbol", "Qty", "Avg Cost (₹)", "Current Value (₹)", "P&L (₹)"]
        rows    = [headers]
        for r in summary:
            pl    = r["profit_loss"]
            rows.append([
                r["symbol"],
                f"{r['total_quantity']:,.4f}",
                f"{r['avg_cost_basis']:,.2f}",
                f"{r['current_value']:,.2f}",
                f"{'+'if pl>=0 else ''}{ pl:,.2f}",
            ])

        tbl = Table(rows, colWidths=[3*cm, 3*cm, 3.5*cm, 4*cm, 3.5*cm])
        style = TableStyle(HEADER_STYLE.getCommands())
        # Colour P&L column per row
        for i, r in enumerate(summary, start=1):
            c = SUCCESS if r["profit_loss"] >= 0 else DANGER
            style.add("TEXTCOLOR", (4, i), (4, i), c)
            style.add("FONTNAME",  (4, i), (4, i), "Helvetica-Bold")
        tbl.setStyle(style)
        story.append(tbl)
    else:
        story.append(Paragraph("No portfolio data found.", s["muted"]))

    story.append(PageBreak())

    # ── PAGE 3: Goals ──────────────────────────────────────────────────────
    story.append(Paragraph("Goals Overview", s["h2"]))
    story.append(HRFlowable(width="100%", thickness=0.5, color=LIGHT_BG, spaceAfter=10))

    goals = list_goals(db, user.id)

    if goals:
        g_headers = ["Goal", "Type", "Target (₹)", "Monthly (₹)", "Target Date", "Progress"]
        g_rows    = [g_headers]
        for goal in goals:
            contributed, pct = compute_goal_progress(goal)
            g_rows.append([
                goal.name,
                goal.goal_type.value if goal.goal_type else "custom",
                f"{float(goal.target_amount):,.0f}",
                f"{float(goal.monthly_contribution):,.0f}",
                str(goal.target_date),
                f"{pct:.1f}%",
            ])

        col_w = [(W - 2 * margin) / 6] * 6
        g_tbl = Table(g_rows, colWidths=col_w)
        g_style = TableStyle(HEADER_STYLE.getCommands())
        # Colour progress column
        for i, goal in enumerate(goals, start=1):
            _, pct = compute_goal_progress(goal)
            c = SUCCESS if pct >= 50 else (ACCENT if pct >= 25 else DANGER)
            g_style.add("TEXTCOLOR", (5, i), (5, i), c)
            g_style.add("FONTNAME",  (5, i), (5, i), "Helvetica-Bold")
        g_tbl.setStyle(g_style)
        story.append(g_tbl)
    else:
        story.append(Paragraph("No goals found.", s["muted"]))

    story.append(Spacer(1, 1 * cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=LIGHT_BG, spaceAfter=6))
    story.append(Paragraph(
        f"This report was auto-generated by WealthTrack on {now.strftime('%d %B %Y')}. "
        "Past performance is not indicative of future results.",
        s["muted"],
    ))

    doc.build(story)
    return buffer.getvalue()
