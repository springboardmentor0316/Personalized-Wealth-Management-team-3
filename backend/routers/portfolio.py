from __future__ import annotations

from datetime import date
from io import BytesIO
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.portfolio import (
    InvestmentCreate,
    InvestmentResponse,
    SavingsStreakResponse,
    TransactionListItem,
    InvestmentUpdate,
    PortfolioSummaryItem,
    TransactionCreate,
    TransactionResponse,
    TransactionUpdate,
)
from app.services.portfolio import (
    build_portfolio_summary,
    calculate_savings_streak,
    create_investment,
    create_transaction,
    delete_investment,
    delete_transaction,
    export_portfolio_summary_csv,
    get_investment,
    get_transaction,
    list_investments,
    list_transactions_filtered,
    list_transactions,
    update_investment,
    update_transaction,
)


router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/investments", response_model=list[InvestmentResponse])
def read_investments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[InvestmentResponse]:
    return list_investments(db, current_user.id)


@router.post("/investments", response_model=InvestmentResponse, status_code=status.HTTP_201_CREATED)
def add_investment(
    payload: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InvestmentResponse:
    """
    Example request:
    POST /portfolio/investments
    {
      "symbol": "AAPL",
      "asset_type": "stock"
    }
    """
    return create_investment(db, current_user.id, payload)


@router.get("/investments/{investment_id}", response_model=InvestmentResponse)
def read_investment(
    investment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InvestmentResponse:
    investment = get_investment(db, current_user.id, investment_id)
    if not investment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment not found")
    return investment


@router.put("/investments/{investment_id}", response_model=InvestmentResponse)
def edit_investment(
    investment_id: UUID,
    payload: InvestmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InvestmentResponse:
    investment = get_investment(db, current_user.id, investment_id)
    if not investment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment not found")
    return update_investment(db, investment, payload)


@router.delete("/investments/{investment_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_investment(
    investment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    investment = get_investment(db, current_user.id, investment_id)
    if not investment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment not found")
    delete_investment(db, investment)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/investments/{investment_id}/transactions", response_model=list[TransactionResponse])
def read_transactions(
    investment_id: UUID,
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    asset_type: str | None = Query(default=None),
    profit_loss: bool | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TransactionResponse]:
    investment = get_investment(db, current_user.id, investment_id)
    if not investment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment not found")
    if start_date or end_date or asset_type or profit_loss is not None:
        filtered = list_transactions_filtered(
            db,
            current_user.id,
            start_date=start_date,
            end_date=end_date,
            asset_type=asset_type,
            profit_loss=profit_loss,
            investment_id=investment.id,
        )
        return [
            TransactionResponse(
                id=row["id"],
                investment_id=row["investment_id"],
                type=row["type"],
                quantity=row["quantity"],
                price=row["price"],
                date=row["date"],
                created_at=row["created_at"],
            )
            for row in filtered
        ]
    return list_transactions(db, investment.id)


@router.get("/transactions", response_model=list[TransactionListItem])
def read_transactions_with_filters(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    asset_type: str | None = Query(default=None),
    profit_loss: bool | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TransactionListItem]:
    return list_transactions_filtered(
        db,
        current_user.id,
        start_date=start_date,
        end_date=end_date,
        asset_type=asset_type,
        profit_loss=profit_loss,
    )


@router.post(
    "/investments/{investment_id}/transactions",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_transaction(
    investment_id: UUID,
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TransactionResponse:
    """
    Example request:
    POST /portfolio/investments/{investment_id}/transactions
    {
      "type": "buy",
      "quantity": 10,
      "price": 170.5,
      "date": "2026-02-20"
    }
    """
    investment = get_investment(db, current_user.id, investment_id)
    if not investment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment not found")
    return create_transaction(db, investment.id, payload)


@router.put("/transactions/{transaction_id}", response_model=TransactionResponse)
def edit_transaction(
    transaction_id: UUID,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TransactionResponse:
    txn = get_transaction(db, transaction_id)
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    investment = get_investment(db, current_user.id, txn.investment_id)
    if not investment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    return update_transaction(db, txn, payload)


@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_transaction(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    txn = get_transaction(db, transaction_id)
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    investment = get_investment(db, current_user.id, txn.investment_id)
    if not investment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    delete_transaction(db, txn)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/summary", response_model=list[PortfolioSummaryItem])
def portfolio_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[PortfolioSummaryItem]:
    return build_portfolio_summary(db, current_user.id)


@router.get("/export")
def export_portfolio_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    csv_text = export_portfolio_summary_csv(db, current_user.id)
    return StreamingResponse(
        BytesIO(csv_text.encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="portfolio_report.csv"'},
    )


@router.get("/streak", response_model=SavingsStreakResponse)
def get_savings_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SavingsStreakResponse:
    streak = calculate_savings_streak(db, current_user.id)
    month_label = "month" if streak == 1 else "months"
    message = f"You've invested for {streak} {month_label} in a row"
    return SavingsStreakResponse(streak_months=streak, message=message)
