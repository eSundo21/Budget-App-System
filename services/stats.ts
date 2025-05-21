import { ExpenseCategory } from "@/types/expense"
import type { Expense } from "@/types/expense"

interface SpendingTrend {
  trend: 'increasing' | 'decreasing' | 'neutral'
  percentage: number
}

interface MonthlyForecast {
  forecastedSpending: number
  budget: number
  difference: number
  confidence: number
}

interface CategoryBreakdown {
  category: ExpenseCategory
  amount: number
  percentage: number
}

export const statsService = {
  // Calculate average daily spending with weighted recent bias
  calculateAverageDailySpending: (expenses: Expense[], days: number = 30) => {
    if (expenses.length === 0) return 0
    
    const today = new Date()
    const pastDate = new Date(today)
    pastDate.setDate(today.getDate() - days)
    
    const recentExpenses = expenses.filter(expense => 
      new Date(expense.date) >= pastDate
    )
    
    // Give more weight to recent expenses
    let weightedTotal = 0
    let weightSum = 0
    
    recentExpenses.forEach(expense => {
      const daysDiff = Math.max(1, Math.floor((today.getTime() - new Date(expense.date).getTime()) / (1000 * 60 * 60 * 24)))
      const weight = 1 / daysDiff // More recent = higher weight
      weightedTotal += expense.amount * weight
      weightSum += weight
    })
    
    return weightSum > 0 ? weightedTotal / weightSum : 0
  },

  // Calculate monthly forecast with confidence level
  calculateMonthlyForecast: (expenses: Expense[], dailyBudget: number): MonthlyForecast => {
    const averageDaily = statsService.calculateAverageDailySpending(expenses)
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const forecastedMonthlySpending = averageDaily * daysInMonth
    const monthlyBudget = dailyBudget * daysInMonth
    
    // Calculate confidence based on data consistency
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    
    const recentExpenses = expenses.filter(expense => 
      new Date(expense.date) >= thirtyDaysAgo
    )
    
    // Count days with spending data
    const daysWithData = new Set(
      recentExpenses.map(expense => expense.date.split('T')[0])
    ).size
    
    // Confidence is higher with more data points
    const confidenceLevel = Math.min(100, Math.round((daysWithData / 30) * 100))
    
    return {
      forecastedSpending: forecastedMonthlySpending,
      budget: monthlyBudget,
      difference: forecastedMonthlySpending - monthlyBudget,
      confidence: confidenceLevel
    }
  },

  // Analyze spending trends
  analyzeSpendingTrend: (expenses: Expense[]): SpendingTrend => {
    if (expenses.length < 10) return { trend: 'neutral', percentage: 0 }
    
    const today = new Date()
    const fifteenDaysAgo = new Date(today)
    fifteenDaysAgo.setDate(today.getDate() - 15)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    
    const recentExpenses = expenses.filter(expense => 
      new Date(expense.date) >= fifteenDaysAgo && new Date(expense.date) <= today
    )
    
    const olderExpenses = expenses.filter(expense => 
      new Date(expense.date) >= thirtyDaysAgo && new Date(expense.date) < fifteenDaysAgo
    )
    
    const recentTotal = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const olderTotal = olderExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    
    if (olderTotal === 0) return { trend: 'neutral', percentage: 0 }
    
    const changePercentage = ((recentTotal - olderTotal) / olderTotal) * 100
    
    if (changePercentage > 5) {
      return { trend: 'increasing', percentage: Math.abs(Math.round(changePercentage)) }
    } else if (changePercentage < -5) {
      return { trend: 'decreasing', percentage: Math.abs(Math.round(changePercentage)) }
    } else {
      return { trend: 'neutral', percentage: Math.abs(Math.round(changePercentage)) }
    }
  },

  // Get category breakdown for a given time period
  getCategoryBreakdown: (expenses: Expense[], days: number = 30): CategoryBreakdown[] => {
    const today = new Date()
    const pastDate = new Date(today)
    pastDate.setDate(today.getDate() - days)
    
    const filteredExpenses = expenses.filter(expense => 
      new Date(expense.date) >= pastDate
    )
    
    // Calculate total spent
    const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    
    // Group by category
    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0
      }
      acc[expense.category] += expense.amount
      return acc
    }, {} as Record<ExpenseCategory, number>)
    
    // Convert to array and calculate percentages
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category: category as ExpenseCategory,
      amount,
      percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0
    })).sort((a, b) => b.amount - a.amount)
  },
  
  // Get top expense category for the current month
  getTopExpenseCategory: (expenses: Expense[]): ExpenseCategory => {
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    
    const monthlyExpenses = expenses.filter(expense => 
      new Date(expense.date) >= monthStart
    )
    
    const categoryTotals = monthlyExpenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0
      }
      acc[expense.category] += expense.amount
      return acc
    }, {} as Record<ExpenseCategory, number>)
    
    let topCategory = ExpenseCategory.OTHER
    let maxAmount = 0
    
    Object.entries(categoryTotals).forEach(([category, amount]) => {
      if (amount > maxAmount) {
        topCategory = category as ExpenseCategory
        maxAmount = amount
      }
    })
    
    return topCategory
  },
  
  // Calculate savings potential
  calculateSavingsPotential: (expenses: Expense[], dailyBudget: number): number => {
    const forecast = statsService.calculateMonthlyForecast(expenses, dailyBudget)
    if (forecast.difference >= 0) return 0 // No savings if over budget
    
    return Math.abs(forecast.difference) * 0.5 // Suggest saving 50% of the surplus
  },
  
  // Calculate target date for savings goal
  calculateSavingsGoalDate: (expenses: Expense[], dailyBudget: number, savingsGoal: number): Date | null => {
    const monthlySavings = statsService.calculateSavingsPotential(expenses, dailyBudget)
    
    if (monthlySavings <= 0) return null // Can't save, so no target date
    
    // Months needed to reach goal
    const monthsNeeded = Math.ceil(savingsGoal / monthlySavings)
    
    // Calculate target date
    const targetDate = new Date()
    targetDate.setMonth(targetDate.getMonth() + monthsNeeded)
    
    return targetDate
  },
  
  // Format a relative date as a string (e.g. "in 3 months", "in 1 year")
  formatRelativeDate: (date: Date | null): string => {
    if (!date) return "unknown date"
    
    const now = new Date()
    const diffMonths = (date.getFullYear() - now.getFullYear()) * 12 + date.getMonth() - now.getMonth()
    
    if (diffMonths < 1) return "this month"
    if (diffMonths === 1) return "next month"
    if (diffMonths < 12) return `in ${diffMonths} months`
    
    const years = Math.floor(diffMonths / 12)
    const remainingMonths = diffMonths % 12
    
    if (remainingMonths === 0) {
      return years === 1 ? "in 1 year" : `in ${years} years`
    } else {
      return years === 1
        ? `in 1 year and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
        : `in ${years} years and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
    }
  },

  // Compare current month spending with previous month
  compareWithPreviousMonth: (expenses: Expense[]): { 
    currentMonth: number; 
    previousMonth: number; 
    difference: number; 
    percentageChange: number 
  } => {
    const today = new Date()
    
    // Current month
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    // Previous month
    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
    
    const currentMonthExpenses = expenses.filter(expense => {
      const date = new Date(expense.date)
      return date >= currentMonthStart && date <= currentMonthEnd
    })
    
    const previousMonthExpenses = expenses.filter(expense => {
      const date = new Date(expense.date)
      return date >= previousMonthStart && date <= previousMonthEnd
    })
    
    const currentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const previousMonthTotal = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    
    const difference = currentMonthTotal - previousMonthTotal
    const percentageChange = previousMonthTotal === 0 
      ? 0 
      : (difference / previousMonthTotal) * 100
    
    return {
      currentMonth: currentMonthTotal,
      previousMonth: previousMonthTotal,
      difference,
      percentageChange: Math.round(percentageChange)
    }
  },
} 