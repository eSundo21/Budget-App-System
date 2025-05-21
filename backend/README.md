# Budget App Backend

This is the backend API for the Budget App built with Python, Flask, and SQLite.

## Setup Instructions

1. Make sure you have Python 3.8+ installed
2. Install the required dependencies:
```bash
pip install -r requirements.txt
```

3. Start the server:
```bash
python app.py
```

The server will start on http://localhost:5000

## API Endpoints

### Expenses
- GET `/api/expenses` - Get all expenses (supports query parameters: category, start_date, end_date, limit)
- POST `/api/expenses` - Add a new expense
- DELETE `/api/expenses/<id>` - Delete an expense
- GET `/api/expenses/summary` - Get expense summary by category

### Categories
- GET `/api/categories` - Get all categories
- POST `/api/categories` - Add a new category

## Database

The application uses SQLite database (budget.db) which will be automatically created when you first run the application.
