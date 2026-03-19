"""
Recommendations engine.

Generates personalized asset allocation suggestions based on:
- User's risk profile (conservative / moderate / aggressive)
- Current portfolio composition (actual vs target allocation)
- Goal timelines

No ML needed — rule-based logic that maps cleanly to the spec.
"""

from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.recommendation import Recommendation
from app.models.user import RiskProfile, User
from app.services.portfolio import build_portfolio_summary, list_investments


# ── Target allocations by risk profile ────────────────────────────────────

TARGET_ALLOCATIONS: dict[str, dict[str, int]] = {
    "Conservative": {
        "debt_bonds": 50,
        "large_cap_equity": 20,
        "gold": 20,
        "cash": 10,
    },
    "Moderate": {
        "large_cap_equity": 40,
        "mid_cap_equity": 15,
        "debt_bonds": 30,
        "gold": 10,
        "cash": 5,
    },
    "Aggressive": {
        "large_cap_equity": 40,
        "mid_cap_equity": 25,
        "small_cap_equity": 15,
        "international_equity": 10,
        "gold": 5,
        "cash": 5,
    },
}

ALLOCATION_DESCRIPTIONS: dict[str, str] = {
    "Conservative": (
        "Your conservative risk profile means capital preservation is the priority. "
        "We recommend a debt-heavy portfolio with sovereign bonds and fixed deposits forming "
        "the backbone (50%), complemented by large-cap blue-chip equities (20%) for moderate "
        "growth, gold as an inflation hedge (20%), and a cash buffer (10%). "
        "Avoid mid/small-cap and international exposure until your risk appetite increases."
    ),
    "Moderate": (
        "A balanced approach suits your moderate risk profile. We recommend splitting "
        "between equity and debt — large-cap equities (40%) and mid-caps (15%) drive growth, "
        "while debt instruments (30%) provide stability. Gold (10%) hedges against volatility "
        "and a small cash reserve (5%) keeps you agile for opportunities. "
        "Review and rebalance quarterly."
    ),
    "Aggressive": (
        "Your aggressive profile supports a growth-first strategy. Equities dominate — "
        "large-caps (40%), mid-caps (25%), and small-caps (15%) form a diversified equity "
        "core. International exposure (10%) adds currency diversification. "
        "Gold (5%) and cash (5%) act as minor cushions. "
        "Expect higher short-term volatility in exchange for long-term wealth creation. "
        "Rebalance every 6 months."
    ),
}


# ── Rebalance suggestions ──────────────────────────────────────────────────


def _classify_asset(asset_type: str) -> str:
    """Map raw asset_type string to an allocation bucket."""
    a = asset_type.lower()
    if a in ("bond", "debt", "fd"):
        return "debt_bonds"
    if a in ("etf", "mutual_fund"):
        return "large_cap_equity"
    if a in ("stock",):
        return "large_cap_equity"
    if a in ("gold", "gold_etf"):
        return "gold"
    if a in ("cash",):
        return "cash"
    return "large_cap_equity"


def generate_rebalance_suggestions(
    db: Session,
    user_id: UUID,
    risk_profile: str,
) -> list[dict]:
    """
    Compare user's current portfolio allocation vs target.
    Returns list of suggestions like:
        {"bucket": "debt_bonds", "current_pct": 10, "target_pct": 50, "action": "increase"}
    """
    summary = build_portfolio_summary(db, user_id)
    total_value = sum(row["current_value"] for row in summary)

    if total_value == 0:
        return []

    investments = list_investments(db, user_id)
    inv_map = {inv.symbol: inv for inv in investments}

    # Current bucket totals
    current_buckets: dict[str, float] = {}
    for row in summary:
        inv = inv_map.get(row["symbol"])
        bucket = _classify_asset(inv.asset_type if inv else "stock")
        current_buckets[bucket] = current_buckets.get(bucket, 0) + row["current_value"]

    target = TARGET_ALLOCATIONS.get(risk_profile, TARGET_ALLOCATIONS["Moderate"])
    suggestions = []

    for bucket, target_pct in target.items():
        current_val = current_buckets.get(bucket, 0)
        current_pct = round((current_val / total_value) * 100, 1)
        diff = target_pct - current_pct

        if abs(diff) < 3:
            action = "on_track"
        elif diff > 0:
            action = "increase"
        else:
            action = "reduce"

        suggestions.append(
            {
                "bucket": bucket.replace("_", " ").title(),
                "current_pct": current_pct,
                "target_pct": target_pct,
                "diff_pct": round(diff, 1),
                "action": action,
                "amount_to_move": round(abs(diff / 100) * total_value, 2),
            }
        )

    return suggestions


# ── DB persistence ─────────────────────────────────────────────────────────


def generate_and_save_recommendation(db: Session, user: User) -> Recommendation:
    """
    Generate a fresh recommendation for the user based on their risk profile
    and save it to the DB.
    """
    profile = user.risk_profile.value if user.risk_profile else "Moderate"
    target = TARGET_ALLOCATIONS.get(profile, TARGET_ALLOCATIONS["Moderate"])
    text = ALLOCATION_DESCRIPTIONS.get(profile, "")
    rebalance = generate_rebalance_suggestions(db, user.id, profile)

    rec = Recommendation(
        user_id=user.id,
        title=f"Personalised Allocation — {profile} Profile",
        recommendation_text=text,
        suggested_allocation={
            "target_allocation": target,
            "rebalance_suggestions": rebalance,
        },
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


def list_recommendations(db: Session, user_id: UUID) -> list[Recommendation]:
    return (
        db.query(Recommendation)
        .filter(Recommendation.user_id == user_id)
        .order_by(Recommendation.created_at.desc())
        .limit(10)
        .all()
    )
