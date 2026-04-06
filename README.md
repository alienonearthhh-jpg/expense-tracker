# 💸 Expense Tracker

A single-page web application that helps users monitor and categorize their personal spending.

## Problem Statement

Managing personal finances is difficult without visibility into spending patterns. This app provides a simple, intuitive interface to log, categorize, and visualize expenses in real time.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) |
| Styling | CSS (custom) |
| HTTP Client | Axios |
| Charts | Recharts |
| Backend | FastAPI (Python) |
| Database | MySQL |
| ORM | SQLModel |

## Features

- Add expenses with title, category, amount, date, and description
- Edit existing expenses via a modal popup
- Delete expenses with instant UI update
- Filter expenses by category
- Summary cards showing total spent and per-category totals
- Bar chart visualizing spending by category
- Responsive single-page layout with no page reloads
- Error handling for failed API calls and empty form submissions

## Folder Structure
```
expense-tracker/
├── backend/
│   ├── main.py        # FastAPI app and all CRUD endpoints
│   ├── models.py      # SQLModel database models
│   ├── .env           # Database connection config
│   └── .venv/         # Python virtual environment
├── frontend/
│   ├── src/
│   │   ├── App.jsx    # Main React component
│   │   └── index.css  # Global styles
│   └── index.html
└── README.md
```

## Challenges Overcome

Setting up MySQL on macOS proved unexpectedly complex due to a conflict between two installations — one via the official installer and one via Homebrew. This was resolved by uninstalling both and performing a clean Homebrew install with no root password for local development. Configuring CORS between FastAPI and the React dev server required adding CORSMiddleware to allow all origins during development. Ensuring the SQLModel table was created automatically on startup removed the need for manual SQL migration steps, simplifying the development workflow.