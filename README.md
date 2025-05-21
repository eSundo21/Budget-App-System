# Budget Management App

A modern, full-stack budget tracking application built with Next.js and Python Flask, featuring real-time expense tracking, analytics, and daily budget management.

## Features

- 💰 **E-Wallet Balance Management**
  - Track your total available balance
  - Real-time balance updates
  - Secure balance modification

- 📊 **Daily Budget Control**
  - Set and manage daily spending limits
  - Automatic budget tracking
  - Percentage-based budget adjustments
  - Visual progress indicators

- 💳 **Expense Tracking**
  - Add and manage expenses
  - Categorize expenses
  - Add descriptions and dates
  - View expense history

- 📈 **Analytics & Insights**
  - Visual expense breakdowns
  - Category-wise analysis
  - Spending trends
  - Daily/Weekly/Monthly views

- 🎨 **Modern UI/UX**
  - Clean, responsive design
  - Dark/Light mode support
  - Smooth animations
  - Toast notifications
  - Intuitive navigation

## Tech Stack

### Frontend
- Next.js 15.1.0
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Radix UI (components)
- date-fns (date handling)

### Backend
- Python Flask
- SQLite Database
- Flask-CORS

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd budget-management-app
```

2. Install frontend dependencies:
```bash
npm install --legacy-peer-deps
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### Running the Application

1. Start the backend server:
```bash
cd backend
python app.py
```

2. In a new terminal, start the frontend development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

### Setting Up Your Budget

1. Navigate to the Settings page
2. Update your E-Wallet Balance
3. Set your Daily Budget Limit
4. Choose your preferred theme (Dark/Light mode)

### Managing Expenses

1. Add new expenses from the dashboard
2. Categorize your expenses
3. Add descriptions and dates
4. View your expense history in the Expenses tab

### Viewing Analytics

1. Access the Analytics section
2. View spending patterns
3. Analyze category-wise expenses
4. Track daily/weekly trends
