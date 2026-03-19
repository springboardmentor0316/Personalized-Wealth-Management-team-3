# Week 8 — Final Build Installation Guide

## Files in this package

| File | Action |
|------|--------|
| `app/models/goal.py` | **Replace** — adds goal_type enum |
| `app/schemas/goal.py` | **Replace** — adds goal_type to schemas |
| `app/services/pdf_report.py` | **New** — PDF generation service |
| `app/routers/reports.py` | **New** — /reports/pdf and /reports/csv endpoints |
| `app/main.py` | **Replace** — registers reports router |
| `requirements.txt` | **Replace** — adds reportlab |
| `frontend/src/App.js` | **Replace** — adds ErrorBoundary |
| `frontend/src/components/ErrorBoundary.jsx` | **New** — crash safety net |
| `frontend/src/pages/Goals.jsx` | **Replace** — adds goal_type dropdown |
| `frontend/src/pages/GoalDetails.jsx` | **Replace** — full redesign with metrics |
| `Dockerfile` | **New** — production Docker image |
| `docker-compose.yml` | **New** — full stack deployment |

---

## Step 1 — Install reportlab

```bash
pip install reportlab
# or replace requirements.txt and run:
pip install -r requirements.txt
```

---

## Step 2 — Copy all files

```bash
# Backend
cp app/models/goal.py          YOUR_PROJECT/app/models/goal.py
cp app/schemas/goal.py         YOUR_PROJECT/app/schemas/goal.py
cp app/services/pdf_report.py  YOUR_PROJECT/app/services/pdf_report.py
cp app/routers/reports.py      YOUR_PROJECT/app/routers/reports.py
cp app/main.py                 YOUR_PROJECT/app/main.py
cp requirements.txt            YOUR_PROJECT/requirements.txt

# Frontend
cp frontend/src/App.js                          YOUR_PROJECT/frontend/src/App.js
cp frontend/src/components/ErrorBoundary.jsx   YOUR_PROJECT/frontend/src/components/ErrorBoundary.jsx
cp frontend/src/pages/Goals.jsx                YOUR_PROJECT/frontend/src/pages/Goals.jsx
cp frontend/src/pages/GoalDetails.jsx          YOUR_PROJECT/frontend/src/pages/GoalDetails.jsx

# Docker (optional — for deployment)
cp Dockerfile         YOUR_PROJECT/Dockerfile
cp docker-compose.yml YOUR_PROJECT/docker-compose.yml
```

---

## Step 3 — Add PDF download button to Portfolio page

Open `frontend/src/pages/Portfolio.jsx` and add this button
next to the existing "Download CSV" button:

```jsx
const handleDownloadPdf = async () => {
  try {
    const response = await api.get("/reports/pdf", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "wealthtrack_report.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    setError("Failed to download PDF report");
  }
};

// In the JSX, next to the CSV button:
<button type="button" className="secondary-button" onClick={handleDownloadPdf}>
  📄 Download PDF
</button>
```

---

## New API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/reports/pdf` | Full PDF report (portfolio + goals) |
| GET | `/reports/csv` | Combined CSV (portfolio + goals) |

---

## Deploy with Docker (optional)

Make sure Docker Desktop is installed, then:

```bash
# Build and start everything (DB + Redis + API + Celery)
docker-compose up --build

# App will be live at:
http://localhost:8000
```

Before deploying, change the secrets in `docker-compose.yml`:
```yaml
ACCESS_TOKEN_SECRET: your_very_long_random_secret_here
REFRESH_TOKEN_SECRET: your_other_very_long_random_secret_here
```

---

## Project Completion Status

After applying this package:

| Milestone | Status |
|-----------|--------|
| M1 — Auth & Foundations | ✅ Complete |
| M2 — Goals & Portfolio  | ✅ Complete |
| M3 — Market Sync & Simulations | ✅ Complete |
| M4 — Recommendations, Reports, Deployment | ✅ Complete |

**Your project is 100% done!** 🎉
