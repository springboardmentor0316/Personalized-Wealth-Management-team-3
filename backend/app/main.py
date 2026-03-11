from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from app import models, schemas, database, auth
import yfinance as yf

def get_live_price(symbol):
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period="1d")

        if data.empty:
            return None

        return float(data["Close"].iloc[-1])

    except Exception:
        return None

app = FastAPI(title="Wealth Management API")


# CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=database.engine)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------- REGISTER --------
@app.post("/auth/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pwd = auth.hash_password(user.password)

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_pwd
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# -------- LOGIN --------
from fastapi.security import OAuth2PasswordRequestForm

@app.post("/auth/login", response_model=schemas.Token)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    db_user = db.query(models.User).filter(
        models.User.email == form_data.username
    ).first()

    if not db_user or not auth.verify_password(form_data.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = auth.create_access_token(
        data={"sub": db_user.email}
    )

    refresh_token = auth.create_refresh_token(
    data={"sub": db_user.email}
)

    return {
    "access_token": access_token,
    "refresh_token": refresh_token,
    "token_type": "bearer"
}
    
@app.post("/auth/refresh")
def refresh_token(refresh_token: str):

    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if email is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        new_access_token = auth.create_access_token(data={"sub": email})

        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@app.get("/")
def home():
    return {"message": "Wealth Project API is running. Go to /docs for documentation."}

from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception

    return user



@app.get("/profile", response_model=schemas.UserResponse)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.put("/profile", response_model=schemas.UserResponse)
def update_profile(
    profile: schemas.ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    if profile.risk_profile:
        current_user.risk_profile = profile.risk_profile

    if profile.kyc_status:
        current_user.kyc_status = profile.kyc_status

    db.commit()
    db.refresh(current_user)

    return current_user

# -------- GOALS --------

@app.post("/goals", response_model=schemas.GoalOut)
def create_goal(
    goal: schemas.GoalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # calculate progress %
    invested = float(goal.monthly_contribution)
    target = float(goal.target_amount)

    progress = int((invested / target) * 100) if target > 0 else 0

    if progress > 100:
        progress = 100

    g = models.Goal(
        user_id=current_user.id,
        goal_type=goal.goal_type,
        target_amount=goal.target_amount,
        target_date=goal.target_date,
        monthly_contribution=goal.monthly_contribution,
        progress=progress
    )

    db.add(g)
    db.commit()
    db.refresh(g)

    return g



@app.get("/goals", response_model=list[schemas.GoalOut])
def list_goals(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Goal).filter(
        models.Goal.user_id == current_user.id
    ).all()
    
@app.put("/goals/{goal_id}", response_model=schemas.GoalOut)
def update_goal(
    goal_id: int,
    updated_goal: schemas.GoalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    goal = db.query(models.Goal).filter(
        models.Goal.id == goal_id,
        models.Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    goal.goal_type = updated_goal.goal_type
    goal.target_amount = updated_goal.target_amount
    goal.target_date = updated_goal.target_date
    goal.monthly_contribution = updated_goal.monthly_contribution

    db.commit()
    db.refresh(goal)

    return goal


@app.delete("/goals/{goal_id}")
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    goal = db.query(models.Goal).filter(
        models.Goal.id == goal_id,
        models.Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    db.delete(goal)
    db.commit()

    return {"message": "Goal deleted successfully"}

# -------- SMART RISK ENGINE --------

@app.post("/risk/score", response_model=schemas.RiskResult)
def calculate_risk(
    data: schemas.RiskInput,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    score = 0

    # age
    if data.age < 30:
        score += 3
    elif data.age <= 50:
        score += 2
    else:
        score += 1

    # income
    if data.annual_income > 1000000:
        score += 3
    elif data.annual_income >= 500000:
        score += 2
    else:
        score += 1

    # duration
    if data.investment_years > 10:
        score += 3
    elif data.investment_years >= 5:
        score += 2
    else:
        score += 1

    # map to profile
    if score >= 7:
        rp = "aggressive"
    elif score >= 5:
        rp = "moderate"
    else:
        rp = "conservative"

    current_user.risk_profile = rp
    db.commit()

    return {
        "score": score,
        "risk_profile": rp
    }
    
    
   # =========================
# 📊 REAL COST BASIS PORTFOLIO
# =========================

@app.get("/portfolio")
def get_portfolio(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    symbols = db.query(models.Transaction.symbol).filter(
        models.Transaction.user_id == current_user.id
    ).distinct().all()

    portfolio = []

    total_invested = 0
    total_current_value = 0

    for s in symbols:

        symbol = s[0]

        transactions = db.query(models.Transaction).filter(
            models.Transaction.user_id == current_user.id,
            models.Transaction.symbol == symbol
        ).all()

        total_units = 0
        total_cost = 0

        for t in transactions:

            if t.type == "buy":
                total_units += float(t.quantity)
                total_cost += float(t.quantity) * float(t.price)

            elif t.type == "sell":
                total_units -= float(t.quantity)
                total_cost -= float(t.quantity) * float(t.price)

        if total_units <= 0:
            continue

        avg_price = total_cost / total_units

        # LIVE MARKET PRICE
        market_price = get_live_price(symbol)

        if market_price is None:
            market_price = avg_price

        current_value = total_units * market_price

        profit_loss = current_value - total_cost

        profit_percent = (profit_loss / total_cost) * 100

        total_invested += total_cost
        total_current_value += current_value

        portfolio.append({
            "symbol": symbol,
            "units": round(total_units, 2),
            "avg_buy_price": round(avg_price, 2),
            "cost_basis": round(total_cost, 2),
            "current_value": round(current_value, 2),
            "profit_loss": round(profit_loss, 2),
            "profit_percent": round(profit_percent, 2)
        })

    summary = {
        "total_invested": round(total_invested, 2),
        "total_current_value": round(total_current_value, 2),
        "total_profit": round(total_current_value - total_invested, 2),
        "total_profit_percent": round(
            ((total_current_value - total_invested) / total_invested * 100)
            if total_invested > 0 else 0,
            2
        )
    }

    return {
        "summary": summary,
        "positions": portfolio
    }
    
    
    # =========================
# 💰 INVESTMENTS
# =========================

@app.post("/investments", response_model=schemas.InvestmentOut)
def create_investment(
    inv: schemas.InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    investment = models.Investment(
        user_id=current_user.id,
        asset_type=inv.asset_type,
        symbol=inv.symbol,
        units=inv.units,
        avg_buy_price=inv.avg_buy_price,
        cost_basis=inv.cost_basis,
        current_value=0,
        last_price=0
    )

    db.add(investment)
    db.commit()
    db.refresh(investment)

    return investment


@app.get("/investments", response_model=list[schemas.InvestmentOut])
def list_investments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Investment).filter(
        models.Investment.user_id == current_user.id
    ).all()
    
@app.put("/investments/{investment_id}", response_model=schemas.InvestmentOut)
def update_investment(
    investment_id: int,
    updated: schemas.InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    investment = db.query(models.Investment).filter(
        models.Investment.id == investment_id,
        models.Investment.user_id == current_user.id
    ).first()

    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")

    investment.asset_type = updated.asset_type
    investment.symbol = updated.symbol
    investment.units = updated.units
    investment.avg_buy_price = updated.avg_buy_price
    investment.cost_basis = updated.cost_basis

    db.commit()
    db.refresh(investment)

    return investment


@app.delete("/investments/{investment_id}")
def delete_investment(
    investment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    investment = db.query(models.Investment).filter(
        models.Investment.id == investment_id,
        models.Investment.user_id == current_user.id
    ).first()

    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")

    db.delete(investment)
    db.commit()

    return {"message": "Investment deleted successfully"}
    
    # =========================
# 💰 NET WORTH ENGINE
# =========================

@app.get("/networth")
def get_networth(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    investments = db.query(models.Investment).filter(
        models.Investment.user_id == current_user.id
    ).all()

    total_invested = sum(i.cost_basis for i in investments)
    return {
        "total_invested": total_invested,
        "net_worth": total_invested
    }




# =========================
# 💰 ADD CONTRIBUTION
# =========================

from decimal import Decimal

@app.patch("/goals/{goal_id}/contribute", response_model=schemas.GoalOut)
def add_contribution(
    goal_id: int,
    amount: float,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    goal = db.query(models.Goal).filter(
        models.Goal.id == goal_id,
        models.Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    new_amount = Decimal(str(amount))

    goal.monthly_contribution = Decimal(goal.monthly_contribution) + new_amount

    progress = int(
        (float(goal.monthly_contribution) / float(goal.target_amount)) * 100
    )

    if progress > 100:
        progress = 100

    goal.progress = progress

    db.commit()
    db.refresh(goal)

    return goal



# =========================
# 📈 NET WORTH HISTORY
# =========================

from datetime import date

@app.get("/networth/history")
def networth_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    investments = db.query(models.Investment).filter(
        models.Investment.user_id == current_user.id
    ).all()

    total = float(sum(i.current_value for i in investments))

    history = [
        {"month": "Jan", "value": total * 0.4},
        {"month": "Feb", "value": total * 0.6},
        {"month": "Mar", "value": total * 0.8},
        {"month": "Apr", "value": total},
    ]

    return history


# =========================
# 💰 TRANSACTIONS
# =========================

@app.post("/transactions", response_model=schemas.TransactionOut)
def add_transaction(
    txn: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # Step 1: Check investment exists
    investment = db.query(models.Investment).filter(
        models.Investment.id == txn.investment_id,
        models.Investment.user_id == current_user.id
    ).first()

    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")

    # Step 2: Create transaction
    new_txn = models.Transaction(
        user_id=current_user.id,
        investment_id=txn.investment_id,
        amount=txn.amount,
        type=txn.type
    )

    db.add(new_txn)

    # Step 3: Auto Update Investment Amount
    if txn.type == "buy":
        investment.amount += txn.amount
    elif txn.type == "sell":
        investment.amount -= txn.amount

    db.commit()
    db.refresh(new_txn)

    return new_txn


@app.get("/transactions", response_model=list[schemas.TransactionOut])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).all()


@app.put("/transactions/{txn_id}", response_model=schemas.TransactionOut)
def update_transaction(
    txn_id: int,
    updated: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    txn = db.query(models.Transaction).filter(
        models.Transaction.id == txn_id,
        models.Transaction.user_id == current_user.id
    ).first()

    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    txn.amount = updated.amount
    txn.type = updated.type

    db.commit()
    db.refresh(txn)

    return txn


@app.delete("/transactions/{txn_id}")
def delete_transaction(
    txn_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    txn = db.query(models.Transaction).filter(
        models.Transaction.id == txn_id,
        models.Transaction.user_id == current_user.id
    ).first()

    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(txn)
    db.commit()

    return {"message": "Transaction deleted successfully"}


import yfinance as yf

def get_live_price(symbol):
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period="1d")
        return float(data["Close"].iloc[-1])
    except:
        return None
    
@app.post("/simulate")
def simulate_investment(
    monthly_investment: float,
    years: int,
    expected_return: float
):

    months = years * 12
    monthly_rate = expected_return / 100 / 12

    future_value = 0
    yearly_data = []

    for month in range(1, months + 1):

        future_value = (future_value + monthly_investment) * (1 + monthly_rate)

        if month % 12 == 0:
            yearly_data.append({
                "year": month // 12,
                "value": round(future_value, 2)
            })

    total_invested = monthly_investment * months
    profit = future_value - total_invested

    return {
        "total_invested": round(total_invested,2),
        "final_value": round(future_value,2),
        "profit": round(profit,2),
        "growth_chart": yearly_data
    }