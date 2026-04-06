from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, create_engine, SQLModel
from typing import List, Optional
from datetime import date
from dotenv import load_dotenv
from models import Expense
import os

# Load environment variables
load_dotenv()

# Database connection
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "expense_tracker")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)

# Create tables on startup
SQLModel.metadata.create_all(engine)

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# CREATE
@app.post("/expenses", response_model=Expense)
def create_expense(expense: Expense):
    with Session(engine) as session:
        session.add(expense)
        session.commit()
        session.refresh(expense)
        return expense

# READ ALL
@app.get("/expenses", response_model=List[Expense])
def get_expenses():
    with Session(engine) as session:
        return session.exec(select(Expense)).all()

# READ ONE
@app.get("/expenses/{expense_id}", response_model=Expense)
def get_expense(expense_id: int):
    with Session(engine) as session:
        expense = session.get(Expense, expense_id)
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        return expense

# UPDATE
@app.put("/expenses/{expense_id}", response_model=Expense)
def update_expense(expense_id: int, updated: Expense):
    with Session(engine) as session:
        expense = session.get(Expense, expense_id)
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        expense.title = updated.title
        expense.category = updated.category
        expense.amount = updated.amount
        expense.date = updated.date
        expense.description = updated.description
        session.commit()
        session.refresh(expense)
        return expense

# DELETE
@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int):
    with Session(engine) as session:
        expense = session.get(Expense, expense_id)
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        session.delete(expense)
        session.commit()
        return {"message": "Expense deleted"}