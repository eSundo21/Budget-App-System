"use client"

import { useBudget } from "@/context/budget-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Wallet, Calendar, TrendingUp, ArrowUp, ArrowDown, PieChart, BarChart, LineChart, Activity } from "lucide-react"
import { motion } from "framer-motion"
import { ExpenseChart } from "./expense-chart"
import { RecentExpenses } from "./recent-expenses"
import { ExpenseSummary } from "./expense-summary"
import { BudgetForecast } from "./budget-forecast"

export function Dashboard() {
  const { balance, dailyBudget, weeklyBudgetProgress, expenses } = useBudget()

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  // Calculate remaining budget for today
  const today = new Date().toISOString().split("T")[0]
  const todayExpenses = expenses.filter((expense) => expense.date === today)
  const todaySpent = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const remainingToday = dailyBudget - todaySpent

  // Calculate total spent this week
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const weeklyExpenses = expenses.filter((expense) => new Date(expense.date) >= startOfWeek)
  const weeklySpent = weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const weeklyBudget = dailyBudget * 7

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight mt-2">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your budget and expenses</p>
      </div>

      <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">E-Wallet Balance</CardTitle>
              <div className="rounded-full bg-primary/10 p-1">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
              <p className="text-xs text-muted-foreground mt-1">Available to spend</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-l-4 border-l-secondary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Budget</CardTitle>
              <div className="rounded-full bg-secondary/10 p-1">
                <Calendar className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dailyBudget)}</div>
              <div className="flex items-center mt-1">
                <p className="text-xs text-muted-foreground">
                  {remainingToday >= 0 ? (
                    <span className="flex items-center">
                      <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
                      {formatCurrency(remainingToday)} remaining today
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <ArrowUp className="h-3 w-3 text-destructive mr-1" />
                      {formatCurrency(Math.abs(remainingToday))} over budget today
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Budget Progress</CardTitle>
              <div className="rounded-full bg-blue-500/10 p-1">
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Progress
                  value={Math.min(weeklyBudgetProgress * 100, 100)}
                  className="h-2"
                  indicatorClassName={weeklyBudgetProgress >= 1 ? "bg-destructive" : ""}
                />
                <span className="text-sm font-medium">{Math.round(weeklyBudgetProgress * 100)}%</span>
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs text-muted-foreground">{formatCurrency(weeklySpent)} spent</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(weeklyBudget)} budget</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Expense Analytics</CardTitle>
                  <CardDescription>Visualize your spending patterns</CardDescription>
                </div>
                <div className="flex space-x-1">
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ExpenseChart />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3 space-y-6">
          <BudgetForecast />
          
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentExpenses />
            </CardContent>
          </Card>
        </div>
      </div>

      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>Expense Summary</CardTitle>
            <CardDescription>Your spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseSummary />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
