# Fintech Full-Stack Project

This repository contains a full-stack fintech app:
- `app/`: FastAPI backend with JWT auth and user profile endpoints
- `frontend/`: React frontend (Create React App)

## Tech Stack

- Backend: FastAPI, SQLAlchemy, PostgreSQL, python-jose, bcrypt
- Frontend: React, React Router, Axios

## Project Structure

```text
fintech/
  app/
    core/
    models/
    routers/
    schemas/
    main.py
    database.py
  frontend/
    src/
    public/
    package.json
  requirements.txt
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL

## Backend Setup

1. Create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install Python dependencies:

```powershell
pip install -r requirements.txt
```

3. Create `app/.env` with values like:

```env
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/fintech
ACCESS_TOKEN_SECRET=change_me_access_secret
REFRESH_TOKEN_SECRET=change_me_refresh_secret
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
```

4. Run backend:

```powershell
python -m uvicorn app.main:app --reload
```

Backend default URL: `http://127.0.0.1:8000`

## Frontend Setup

1. Install dependencies:

```powershell
cd frontend
npm install
```

2. Create `frontend/.env`:

```env
REACT_APP_API_URL=http://127.0.0.1:8000
```

3. Run frontend:

```powershell
npm start
```

Frontend default URL: `http://localhost:3000`

## API Endpoints

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /users/me` (Bearer token required)
- `PUT /users/me` (Bearer token required)

## Notes

- Root `.gitignore` excludes `.env`, `node_modules`, and build output.
- If you cloned this from GitHub and want a clean workspace, you can keep `frontend/.git.frontend.backup/` ignored as-is.
