"use client"

import { useBudget } from "@/context/budget-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, TrendingUp, TrendingDown, Wallet, PiggyBank, Shield, ChevronDown, ChevronUp } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

// Define interfaces for our data structures
interface SpendingTrend {
  trend: 'increasing' | 'decreasing' | 'neutral';
  percentage: number;
}

interface BudgetAlert {
  category: string;
  percentage: number;
  amount: number;
  remaining: number;
}

interface MonthlyForecast {
  forecastedSpending: number;
  budget: number;
  difference: number;
  confidence: number;
}

export function FinancialForecast() {
  const { expenses, dailyBudget, balance } = useBudget()
  const [showDetails, setShowDetails] = useState(false)

  // Format currency - moved to the top so it can be used by other functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  // Calculate average daily spending with weighted recent bias
  const calculateAverageDailySpending = () => {
    if (expenses.length === 0) return 0
    
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    
    const recentExpenses = expenses.filter(expense => 
      new Date(expense.date) >= thirtyDaysAgo
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
  }

  // Analyze spending trends
  const analyzeSpendingTrend = (): SpendingTrend => {
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
  }

  // Calculate savings potential
  const calculateSavingsPotential = () => {
    const forecast = calculateMonthlyForecast()
    if (forecast.difference >= 0) return 0 // No savings if over budget
    
    return Math.abs(forecast.difference) * 0.5 // Suggest saving 50% of the surplus
  }

  // Calculate monthly forecast with confidence level
  const calculateMonthlyForecast = (): MonthlyForecast => {
    const averageDaily = calculateAverageDailySpending()
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
  }

  // Get top expense category for the current month
  const getTopExpenseCategory = () => {
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    
    const monthlyExpenses = expenses.filter(expense => 
      new Date(expense.date) >= monthStart
    )
    
    const categoryTotals = monthlyExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)
    
    let topCategory = 'miscellaneous'
    let maxAmount = 0
    
    Object.entries(categoryTotals).forEach(([category, amount]) => {
      if (amount > maxAmount) {
        topCategory = category
        maxAmount = amount
      }
    })
    
    return topCategory
  }

  // Generate personalized recommendation
  const generateRecommendation = () => {
    const forecast = calculateMonthlyForecast()
    const trend = analyzeSpendingTrend()
    const savingsPotential = calculateSavingsPotential()
    
    if (forecast.difference > 0) {
      // Over budget
      if (trend.trend === 'increasing') {
        return `Your spending is increasing by ${trend.percentage}% compared to the previous 15 days. At this rate, you'll spend ${formatCurrency(forecast.difference)} more than your budget this month. Consider reviewing your recent ${getTopExpenseCategory()} expenses.`
      } else {
        return `At your current rate, you'll spend ${formatCurrency(forecast.difference)} more than your budget this month. Try to reduce spending on ${getTopExpenseCategory()} to stay within budget.`
      }
    } else {
      // Under budget
      if (savingsPotential > 0) {
        return `You're on track to be under budget by ${formatCurrency(Math.abs(forecast.difference))} this month. Consider saving ${formatCurrency(savingsPotential)} to reach your financial goals faster.`
      } else {
        return `You're managing your budget well. Keep up the good work!`
      }
    }
  }

  // Check budget alerts
  const checkBudgetAlerts = (): BudgetAlert[] => {
    const alerts: BudgetAlert[] = []
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    
    // Calculate spending by category
    const categorySpending = expenses
      .filter(expense => new Date(expense.date) >= monthStart)
      .reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      }, {} as Record<string, number>)

    // Add alerts for categories approaching budget
    Object.entries(categorySpending).forEach(([category, amount]) => {
      const categoryBudget = dailyBudget * 0.3 * 30 // Assuming 30% of daily budget per category for a month
      const percentage = (amount / categoryBudget) * 100
      
      if (percentage >= 85) {
        alerts.push({
          category,
          percentage: Math.round(percentage),
          amount,
          remaining: Math.max(0, categoryBudget - amount)
        })
      }
    })

    return alerts
  }

  const forecast = calculateMonthlyForecast()
  const trend = analyzeSpendingTrend()
  const alerts = checkBudgetAlerts()
  const savingsPotential = calculateSavingsPotential()
  const recommendation = generateRecommendation()
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Budgeting & Forecasting</span>
            <div className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">
              {forecast.confidence}% confidence
            </div>
          </CardTitle>
          <CardDescription>Financial prediction based on your spending patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Forecasted Monthly Spending:</span>
              <span className="font-medium">{formatCurrency(forecast.forecastedSpending)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Monthly Budget:</span>
              <span className="font-medium">{formatCurrency(forecast.budget)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Forecast:</span>
              <span className={`font-medium ${forecast.difference > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {forecast.difference > 0 ? (
                  <span className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {formatCurrency(forecast.difference)} over budget
                  </span>
                ) : (
                  <span className="flex items-center">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    {formatCurrency(Math.abs(forecast.difference))} under budget
                  </span>
                )}
              </span>
            </div>
            
            {trend.trend !== 'neutral' && (
              <div className="flex items-center justify-between">
                <span>Spending Trend:</span>
                <span className={`font-medium ${trend.trend === 'increasing' ? 'text-red-500' : 'text-green-500'}`}>
                  {trend.trend === 'increasing' ? (
                    <span className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {trend.percentage}% increase
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      {trend.percentage}% decrease
                    </span>
                  )}
                </span>
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
              <p className="text-sm text-blue-800">{recommendation}</p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full mt-2 flex items-center justify-center"
            >
              {showDetails ? (
                <>Hide Details <ChevronUp className="ml-1 h-4 w-4" /></>
              ) : (
                <>Show Details <ChevronDown className="ml-1 h-4 w-4" /></>
              )}
            </Button>
            
            {showDetails && (
              <div className="mt-4 space-y-4">
                {savingsPotential > 0 && (
                  <div className="p-3 bg-green-50 rounded-md border border-green-100 flex items-center">
                    <PiggyBank className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Savings Opportunity</p>
                      <p className="text-xs text-green-700">You could save {formatCurrency(savingsPotential)} this month</p>
                    </div>
                  </div>
                )}
                
                <div className="p-3 bg-blue-50 rounded-md border border-blue-100 flex items-center">
                  <Wallet className="h-5 w-5 text-blue-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Financial Health</p>
                    <p className="text-xs text-blue-700">
                      Your e-wallet balance of {formatCurrency(balance)} can cover 
                      {balance > forecast.forecastedSpending ? ' your entire ' : ' '}
                      projected expenses 
                      {balance > forecast.forecastedSpending ? ' for this month' : ` for ${Math.floor((balance / forecast.forecastedSpending) * 30)} days`}
                    </p>
                  </div>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-md border border-purple-100 flex items-center">
                  <Shield className="h-5 w-5 text-purple-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-purple-800">Top Expense</p>
                    <p className="text-xs text-purple-700">Your highest spending category is <span className="font-medium">{getTopExpenseCategory()}</span></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Alerts</CardTitle>
            <CardDescription>Categories approaching budget limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert, index) => (
              <Alert key={index}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{alert.category}</AlertTitle>
                <AlertDescription>
                  <p>You've spent {alert.percentage}% of your {alert.category.toLowerCase()} budget this month ({formatCurrency(alert.amount)})</p>
                  {alert.remaining > 0 && (
                    <p className="text-xs mt-1">Remaining: {formatCurrency(alert.remaining)}</p>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 