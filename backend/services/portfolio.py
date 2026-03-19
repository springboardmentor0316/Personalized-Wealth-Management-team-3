from __future__ import annotations

import csv
import io
from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.investment import Investment
from app.models.transaction import Transaction
from app.schemas.portfolio import InvestmentCreate, InvestmentUpdate, TransactionCreate, TransactionUpdate


def list_investments(db: Session, user_id: UUID) -> list[Investment]:
    return (
        db.query(Investment)
        .filter(Investment.user_id == user_id)
        .order_by(Investment.created_at.desc())
        .all()
    )


def create_investment(db: Session, user_id: UUID, payload: InvestmentCreate) -> Investment:
    investment = Investment(
        user_id=user_id,
        symbol=payload.symbol.upper(),
        asset_type=payload.asset_type,
    )
    db.add(investment)
    db.commit()
    db.refresh(investment)
    return investment


def get_investment(db: Session, user_id: UUID, investment_id: UUID) -> Investment | None:
    return (
        db.query(Investment)
        .filter(Investment.id == investment_id, Investment.user_id == user_id)
        .first()
    )


def update_investment(db: Session, investment: Investment, payload: InvestmentUpdate) -> Investment:
    update_data = payload.model_dump(exclude_unset=True)
    if "symbol" in update_data and update_data["symbol"]:
        update_data["symbol"] = update_data["symbol"].upper()
    for field, value in update_data.items():
        setattr(investment, field, value)
    db.commit()
    db.refresh(investment)
    return investment


def delete_investment(db: Session, investment: Investment) -> None:
    db.delete(investment)
    db.commit()


def list_transactions(db: Session, investment_id: UUID) -> list[Transaction]:
    return (
        db.query(Transaction)
        .filter(Transaction.investment_id == investment_id)
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .all()
    )


def list_transactions_filtered(
    db: Session,
    user_id: UUID,
    *,
    start_date: date | None = None,
    end_date: date | None = None,
    asset_type: str | None = None,
    profit_loss: bool | None = None,
    investment_id: UUID | None = None,
) -> list[dict]:
    query = (
        db.query(Transaction, Investment.symbol, Investment.asset_type)
        .join(Investment, Transaction.investment_id == Investment.id)
        .filter(Investment.user_id == user_id)
    )

    if investment_id:
        query = query.filter(Investment.id == investment_id)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if asset_type:
        query = query.filter(Investment.asset_type == asset_type)

    rows = query.order_by(Transaction.date.desc(), Transaction.created_at.desc()).all()

    avg_buy_price_by_investment: dict[UUID, float] = {}
    for investment in list_investments(db, user_id):
        buys = (
            db.query(Transaction)
            .filter(Transaction.investment_id == investment.id, Transaction.type == "buy")
            .all()
        )
        buy_qty = sum(float(txn.quantity) for txn in buys)
        buy_cost = sum(float(txn.quantity) * float(txn.price) for txn in buys)
        avg_buy_price_by_investment[investment.id] = (buy_cost / buy_qty) if buy_qty > 0 else 0.0

    result: list[dict] = []
    for txn, symbol, txn_asset_type in rows:
        pnl = 0.0
        if txn.type == "sell":
            avg_cost = avg_buy_price_by_investment.get(txn.investment_id, 0.0)
            pnl = (float(txn.price) - avg_cost) * float(txn.quantity)

        if profit_loss is not None:
            if txn.type != "sell":
                continue
            if profit_loss and pnl <= 0:
                continue
            if not profit_loss and pnl >= 0:
                continue

        result.append(
            {
                "id": txn.id,
                "investment_id": txn.investment_id,
                "symbol": symbol,
                "asset_type": txn_asset_type,
                "type": txn.type,
                "quantity": float(txn.quantity),
                "price": float(txn.price),
                "date": txn.date,
                "created_at": txn.created_at,
                "profit_loss": round(pnl, 2),
            }
        )

    return result


def create_transaction(db: Session, investment_id: UUID, payload: TransactionCreate) -> Transaction:
    txn = Transaction(
        investment_id=investment_id,
        type=payload.type,
        quantity=payload.quantity,
        price=payload.price,
        date=payload.date,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


def get_transaction(db: Session, transaction_id: UUID) -> Transaction | None:
    return db.query(Transaction).filter(Transaction.id == transaction_id).first()


def update_transaction(db: Session, txn: Transaction, payload: TransactionUpdate) -> Transaction:
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(txn, field, value)
    db.commit()
    db.refresh(txn)
    return txn


def delete_transaction(db: Session, txn: Transaction) -> None:
    db.delete(txn)
    db.commit()


def build_portfolio_summary(db: Session, user_id: UUID) -> list[dict]:
    investments = list_investments(db, user_id)
    summary: list[dict] = []

    for investment in investments:
        txns = list_transactions(db, investment.id)
        buy_qty = sum(float(t.quantity) for t in txns if t.type == "buy")
        sell_qty = sum(float(t.quantity) for t in txns if t.type == "sell")
        total_buy_cost = sum(float(t.quantity) * float(t.price) for t in txns if t.type == "buy")

        net_qty = max(0.0, buy_qty - sell_qty)
        avg_cost_basis = (total_buy_cost / buy_qty) if buy_qty > 0 else 0.0
        invested_amount = net_qty * avg_cost_basis

        # Placeholder for market pricing integration.
        current_value = invested_amount * 1.03
        profit_loss = current_value - invested_amount

        summary.append(
            {
                "symbol": investment.symbol,
                "total_quantity": round(net_qty, 6),
                "avg_cost_basis": round(avg_cost_basis, 2),
                "current_value": round(current_value, 2),
                "profit_loss": round(profit_loss, 2),
            }
        )

    return summary


def export_portfolio_summary_csv(db: Session, user_id: UUID) -> str:
    summary = build_portfolio_summary(db, user_id)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["symbol", "quantity", "avg_cost", "value", "profit"])
    for row in summary:
        writer.writerow(
            [
                row["symbol"],
                row["total_quantity"],
                row["avg_cost_basis"],
                row["current_value"],
                row["profit_loss"],
            ]
        )
    return output.getvalue()


def calculate_savings_streak(db: Session, user_id: UUID) -> int:
    buys = (
        db.query(Transaction.date)
        .join(Investment, Transaction.investment_id == Investment.id)
        .filter(Investment.user_id == user_id, Transaction.type == "buy")
        .order_by(Transaction.date.desc())
        .all()
    )

    if not buys:
        return 0

    months = sorted({(row.date.year, row.date.month) for row in buys}, reverse=True)
    streak = 1
    prev_year, prev_month = months[0]

    for year, month in months[1:]:
        expected_year = prev_year
        expected_month = prev_month - 1
        if expected_month == 0:
            expected_month = 12
            expected_year -= 1

        if (year, month) != (expected_year, expected_month):
            break

        streak += 1
        prev_year, prev_month = year, month

    return streak
