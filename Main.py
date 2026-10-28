from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Personal Expense Tracker")

# Lets index.html (opened from a file or Live Server) call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)


class Expense(BaseModel):
    description: str
    amount: float
    category: str


# In-memory storage: {expense_id: {"description": ..., "amount": ..., "category": ...}}
expenses = {}
next_id = 1


def check(expense: Expense):
    """Reject an empty description or an amount that is zero or negative."""
    if expense.description.strip() == "":
        raise HTTPException(status_code=400, detail="Description cannot be empty")
    if expense.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")


def clean(expense: Expense):
    return {
        "description": expense.description.strip(),
        "amount": round(expense.amount, 2),
        "category": expense.category.strip() or "Other",
    }


# VIEW all expenses
@app.get("/expenses")
def get_expenses():
    return [{"id": expense_id, **data} for expense_id, data in expenses.items()]


# ADD an expense
@app.post("/expenses")
def add_expense(expense: Expense):
    global next_id
    check(expense)
    new_id = next_id
    next_id += 1
    expenses[new_id] = clean(expense)
    return {
        "message": "Expense added successfully",
        "expense": {"id": new_id, **expenses[new_id]},
    }


# UPDATE an expense by ID
@app.put("/expenses/{expense_id}")
def update_expense(expense_id: int, expense: Expense):
    if expense_id not in expenses:
        raise HTTPException(status_code=404, detail="Expense not found")
    check(expense)
    expenses[expense_id] = clean(expense)
    return {
        "message": "Expense updated successfully",
        "expense": {"id": expense_id, **expenses[expense_id]},
    }


# DELETE an expense by ID
@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int):
    if expense_id not in expenses:
        raise HTTPException(status_code=404, detail="Expense not found")
    removed = expenses.pop(expense_id)
    return {
        "message": "Expense deleted successfully",
        "expense": {"id": expense_id, **removed},
    }
