from flask import Flask, request, jsonify
from flask_cors import CORS
from models import Database, Expense, Category
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Initialize database
db = Database()
expense_manager = Expense(db)
category_manager = Category(db)

@app.route('/')
def index():
    return jsonify({
        'name': 'Budget App API',
        'version': '1.0',
        'endpoints': {
            'expenses': {
                'GET /api/expenses': 'Get all expenses',
                'POST /api/expenses': 'Add a new expense',
                'DELETE /api/expenses/<id>': 'Delete an expense',
                'GET /api/expenses/summary': 'Get expense summary'
            },
            'categories': {
                'GET /api/categories': 'Get all categories',
                'POST /api/categories': 'Add a new category'
            },
            'analytics': {
                'GET /api/analytics/trends': 'Get expense trends',
                'GET /api/analytics/category-breakdown': 'Get category breakdown'
            }
        }
    })

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    category = request.args.get('category')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    limit = request.args.get('limit')
    
    if limit:
        limit = int(limit)
    
    expenses = expense_manager.get_expenses(
        limit=limit,
        category=category,
        start_date=start_date,
        end_date=end_date
    )
    return jsonify(expenses)

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    data = request.json
    required_fields = ['amount', 'category']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        amount = float(data['amount'])
        category = data['category']
        description = data.get('description', '')
        date = data.get('date', datetime.now().strftime("%Y-%m-%d"))
        
        expense_id = expense_manager.add_expense(
            amount=amount,
            category=category,
            description=description,
            date=date
        )
        return jsonify({'id': expense_id, 'message': 'Expense added successfully'})
    except ValueError:
        return jsonify({'error': 'Invalid amount'}), 400

@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    if expense_manager.delete_expense(expense_id):
        return jsonify({'message': 'Expense deleted successfully'})
    return jsonify({'error': 'Expense not found'}), 404

@app.route('/api/expenses/summary', methods=['GET'])
def get_expense_summary():
    summary = expense_manager.get_expense_summary()
    return jsonify(summary)

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = category_manager.get_categories()
    return jsonify(categories)

@app.route('/api/categories', methods=['POST'])
def add_category():
    data = request.json
    if 'name' not in data:
        return jsonify({'error': 'Category name is required'}), 400
    
    category_id = category_manager.add_category(data['name'])
    if category_id:
        return jsonify({'id': category_id, 'message': 'Category added successfully'})
    return jsonify({'error': 'Category already exists'}), 400

@app.route('/api/analytics/trends', methods=['GET'])
def get_expense_trends():
    days = int(request.args.get('days', 14))
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    expenses = expense_manager.get_expenses(
        start_date=start_date.strftime("%Y-%m-%d"),
        end_date=end_date.strftime("%Y-%m-%d")
    )
    
    # Initialize daily totals
    daily_totals = {}
    current = start_date
    while current <= end_date:
        daily_totals[current.strftime("%Y-%m-%d")] = 0
        current += timedelta(days=1)
    
    # Calculate daily totals
    for expense in expenses:
        date = expense['date']
        daily_totals[date] = daily_totals.get(date, 0) + expense['amount']
    
    # Convert to list format
    trends = [
        {
            'date': date,
            'amount': amount
        }
        for date, amount in daily_totals.items()
    ]
    
    # Calculate statistics
    total_amount = sum(day['amount'] for day in trends)
    avg_daily = total_amount / len(trends) if trends else 0
    max_daily = max((day['amount'] for day in trends), default=0)
    min_daily = min((day['amount'] for day in trends if day['amount'] > 0), default=0)
    
    return jsonify({
        'trends': trends,
        'statistics': {
            'total_amount': total_amount,
            'average_daily': avg_daily,
            'maximum_daily': max_daily,
            'minimum_daily': min_daily
        }
    })

@app.route('/api/analytics/category-breakdown', methods=['GET'])
def get_category_breakdown():
    days = int(request.args.get('days', 30))
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    expenses = expense_manager.get_expenses(
        start_date=start_date.strftime("%Y-%m-%d"),
        end_date=end_date.strftime("%Y-%m-%d")
    )
    
    # Calculate category totals and percentages
    category_totals = {}
    total_amount = 0
    
    for expense in expenses:
        category = expense['category']
        amount = expense['amount']
        category_totals[category] = category_totals.get(category, 0) + amount
        total_amount += amount
    
    # Convert to list and calculate percentages
    breakdown = [
        {
            'category': category,
            'amount': amount,
            'percentage': (amount / total_amount * 100) if total_amount > 0 else 0
        }
        for category, amount in category_totals.items()
    ]
    
    # Sort by amount descending
    breakdown.sort(key=lambda x: x['amount'], reverse=True)
    
    return jsonify({
        'breakdown': breakdown,
        'total_amount': total_amount
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
