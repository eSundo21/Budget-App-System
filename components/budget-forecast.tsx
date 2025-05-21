"use client"

import { useBudget } from "@/context/budget-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, PiggyBank, Wallet, AlertCircle, TrendingUp, TrendingDown, BarChart } from "lucide-react"
import { useState } from "react"
import { ExpenseCategory } from "@/types/expense"
import { statsService } from "@/services/stats"
import { Progress } from "@/components/ui/progress"

export function BudgetForecast() {
  const { expenses, dailyBudget, balance } = useBudget()
  const [showDetails, setShowDetails] = useState(false)
  const defaultSavingsGoal = 10000 // Default savings goal of ₱10,000

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  // Generate personalized recommendation
  const generateRecommendation = () => {
    const forecast = statsService.calculateMonthlyForecast(expenses, dailyBudget)
    const savingsPotential = statsService.calculateSavingsPotential(expenses, dailyBudget)
    const topExpenseCategory = statsService.getTopExpenseCategory(expenses)
    
    if (forecast.difference > 0) {
      // Over budget
      if (spendingTrend.trend === 'increasing') {
        return `Your spending is increasing by ${spendingTrend.percentage}%. At this rate, you'll exceed your budget by ${formatCurrency(forecast.difference)} this month. Consider reducing ${topExpenseCategory.toLowerCase()} expenses.`
      } else if (spendingTrend.trend === 'decreasing') {
        return `Although your spending is decreasing by ${spendingTrend.percentage}%, you're still on track to exceed your budget by ${formatCurrency(forecast.difference)}. Keep reducing your expenses.`
      } else {
        return `You're on track to exceed your budget by ${formatCurrency(forecast.difference)} this month. Consider reducing your ${topExpenseCategory.toLowerCase()} expenses.`
      }
    } else {
      // Under budget
      if (savingsPotential > 0) {
        if (spendingTrend.trend === 'decreasing') {
          return `Great job! Your spending is decreasing by ${spendingTrend.percentage}% and you're on track to be under budget by ${formatCurrency(Math.abs(forecast.difference))}. Consider saving ${formatCurrency(savingsPotential)} to reach your goals faster.`
        } else if (spendingTrend.trend === 'increasing') {
          return `You're under budget by ${formatCurrency(Math.abs(forecast.difference))}, but your spending is increasing by ${spendingTrend.percentage}%. Be mindful of your ${topExpenseCategory.toLowerCase()} expenses to stay under budget.`
        } else {
          return `You're on track to be under budget by ${formatCurrency(Math.abs(forecast.difference))} this month. Consider saving ${formatCurrency(savingsPotential)} to reach your financial goals faster.`
        }
      } else {
        return `You're managing your budget well. Keep up the good work!`
      }
    }
  }

  const forecast = statsService.calculateMonthlyForecast(expenses, dailyBudget)
  const savingsPotential = statsService.calculateSavingsPotential(expenses, dailyBudget)
  const topExpenseCategory = statsService.getTopExpenseCategory(expenses)
  const spendingTrend = statsService.analyzeSpendingTrend(expenses)
  const savingsGoalDate = statsService.calculateSavingsGoalDate(expenses, dailyBudget, defaultSavingsGoal)
  const formattedGoalDate = statsService.formatRelativeDate(savingsGoalDate)
  const monthlyComparison = statsService.compareWithPreviousMonth(expenses)
  
  return (
    <Card className="bg-zinc-950 text-white border-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Budgeting & Forecasting</span>
          <div className="text-xs bg-blue-900/30 text-blue-100 rounded-full px-2 py-1 flex items-center gap-1">
            <div className="w-16 h-1.5 bg-blue-900/50 rounded-full overflow-hidden mr-1">
              <div 
                className="h-full bg-blue-400" 
                style={{ width: `${forecast.confidence}%` }}
              ></div>
            </div>
            {forecast.confidence}% confidence
          </div>
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Financial prediction based on your spending patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
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
            <span className={`font-medium flex items-center gap-1 ${forecast.difference <= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {forecast.difference <= 0 
                ? <span className="flex items-center">{formatCurrency(Math.abs(forecast.difference))} under budget</span>
                : <span className="flex items-center">{formatCurrency(forecast.difference)} over budget</span>
              }
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span>Spending Trend:</span>
            <span className="flex items-center gap-1">
              {spendingTrend.trend === 'increasing' ? (
                <span className="flex items-center text-amber-400">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {spendingTrend.percentage}% increase
                </span>
              ) : spendingTrend.trend === 'decreasing' ? (
                <span className="flex items-center text-green-400">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  {spendingTrend.percentage}% decrease
                </span>
              ) : (
                <span className="flex items-center text-blue-400">
                  <BarChart className="w-4 h-4 mr-1" />
                  Stable spending
                </span>
              )}
            </span>
          </div>
          
          <Alert className="bg-blue-900/20 border border-blue-900/50 text-blue-100 mt-2">
            <AlertDescription className="text-sm">
              {generateRecommendation()}
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-center mt-2 text-zinc-400 hover:text-white hover:bg-zinc-900"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? (
              <>
                Hide Details <ChevronUp className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Show Details <ChevronDown className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
          
          {showDetails && (
            <div className="space-y-3 pt-2">
              <div className="bg-green-900/20 border border-green-900/40 rounded-md p-3 flex items-start">
                <PiggyBank className="w-5 h-5 text-green-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-green-400 font-medium text-sm">Savings Opportunity</h4>
                  <p className="text-sm text-zinc-300">
                    You could save {formatCurrency(savingsPotential)} this month
                    {savingsGoalDate && (
                      <>
                        <br />
                        <span className="text-xs mt-1 block">
                          You could reach a savings goal of {formatCurrency(defaultSavingsGoal)} {formattedGoalDate}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-900/40 rounded-md p-3 flex items-start">
                <Wallet className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-blue-400 font-medium text-sm">Financial Health</h4>
                  <p className="text-sm text-zinc-300">
                    Your e-wallet balance of {formatCurrency(balance)} can cover your entire projected expenses for this month
                  </p>
                </div>
              </div>
              
              <div className="bg-purple-900/20 border border-purple-900/40 rounded-md p-3 flex items-start">
                <AlertCircle className="w-5 h-5 text-purple-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-purple-400 font-medium text-sm">Top Expense</h4>
                  <p className="text-sm text-zinc-300">
                    Your highest spending category is {topExpenseCategory.toLowerCase()}
                  </p>
                </div>
              </div>
              
              <div className="bg-indigo-900/20 border border-indigo-900/40 rounded-md p-3 flex items-start">
                <BarChart className="w-5 h-5 text-indigo-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-indigo-400 font-medium text-sm">Monthly Comparison</h4>
                  <p className="text-sm text-zinc-300">
                    {monthlyComparison.currentMonth > 0 && monthlyComparison.previousMonth > 0 ? (
                      monthlyComparison.difference > 0 ? (
                        <>
                          This month you've spent {formatCurrency(monthlyComparison.difference)} ({monthlyComparison.percentageChange}%) more than last month
                        </>
                      ) : monthlyComparison.difference < 0 ? (
                        <>
                          This month you've spent {formatCurrency(Math.abs(monthlyComparison.difference))} ({Math.abs(monthlyComparison.percentageChange)}%) less than last month
                        </>
                      ) : (
                        <>
                          Your spending this month is the same as last month
                        </>
                      )
                    ) : (
                      <>
                        Insufficient data to compare with previous month
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 