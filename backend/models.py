import sqlite3
from datetime import datetime

class Database:
    def __init__(self, db_name="budget.db"):
        self.db_name = db_name
        self.init_db()

    def get_connection(self):
        return sqlite3.connect(self.db_name)

    def init_db(self):
        conn = self.get_connection()
        cursor = conn.cursor()

        # Create expenses table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                date TEXT NOT NULL
            )
        ''')

        # Create categories table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            )
        ''')

        # Insert default categories
        default_categories = ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Other']
        for category in default_categories:
            try:
                cursor.execute('INSERT INTO categories (name) VALUES (?)', (category,))
            except sqlite3.IntegrityError:
                pass

        conn.commit()
        conn.close()

class Expense:
    def __init__(self, db):
        self.db = db

    def add_expense(self, amount, category, description="", date=None):
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")
        
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
            (amount, category, description, date)
        )
        conn.commit()
        expense_id = cursor.lastrowid
        conn.close()
        return expense_id

    def get_expenses(self, limit=None, category=None, start_date=None, end_date=None):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        query = 'SELECT * FROM expenses WHERE 1=1'
        params = []

        if category:
            query += ' AND category = ?'
            params.append(category)
        
        if start_date:
            query += ' AND date >= ?'
            params.append(start_date)
            
        if end_date:
            query += ' AND date <= ?'
            params.append(end_date)

        query += ' ORDER BY date DESC'
        
        if limit:
            query += ' LIMIT ?'
            params.append(limit)

        cursor.execute(query, params)
        expenses = cursor.fetchall()
        conn.close()
        
        return [
            {
                'id': exp[0],
                'amount': exp[1],
                'category': exp[2],
                'description': exp[3],
                'date': exp[4]
            }
            for exp in expenses
        ]

    def get_expense_summary(self):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT category, SUM(amount) as total
            FROM expenses
            GROUP BY category
        ''')
        
        summary = cursor.fetchall()
        conn.close()
        
        return [{'category': cat, 'total': total} for cat, total in summary]

    def delete_expense(self, expense_id):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM expenses WHERE id = ?', (expense_id,))
        conn.commit()
        conn.close()
        return True

class Category:
    def __init__(self, db):
        self.db = db

    def get_categories(self):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM categories')
        categories = cursor.fetchall()
        conn.close()
        return [{'id': cat[0], 'name': cat[1]} for cat in categories]

    def add_category(self, name):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('INSERT INTO categories (name) VALUES (?)', (name,))
            conn.commit()
            category_id = cursor.lastrowid
            conn.close()
            return category_id
        except sqlite3.IntegrityError:
            conn.close()
            return None
