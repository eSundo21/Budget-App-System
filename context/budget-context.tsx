"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Expense } from "@/types/expense"
import { api } from "@/services/api"
import { toast } from "@/components/ui/use-toast"

interface BudgetContextType {
  balance: number
  setBalance: (balance: number) => void
  dailyBudget: number
  setDailyBudget: (budget: number) => void
  expenses: Expense[]
  addExpense: (expense: Omit<Expense, 'id'>) => void
  editExpense: (id: string, updatedExpense: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  weeklyBudgetProgress: number
  isLoading: boolean
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(500)
  const [dailyBudget, setDailyBudget] = useState(100)
  const [expenses, setExpenses] = useState<Expense[]>([
    // Default example expenses
    {
      id: '1',
      amount: 25,
      category: 'Food',
      description: 'Lunch',
      date: new Date().toISOString(),
    },
    {
      id: '2',
      amount: 50,
      category: 'Transport',
      description: 'Gas',
      date: new Date().toISOString(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  // Calculate weekly budget progress (spent / (dailyBudget * 7))
  const weeklyBudgetProgress = calculateWeeklyProgress(expenses, dailyBudget)

  // Load data from localStorage and API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load local settings
        const savedBalance = localStorage.getItem("balance")
        const savedDailyBudget = localStorage.getItem("dailyBudget")

        if (savedBalance) setBalance(Number.parseFloat(savedBalance))
        if (savedDailyBudget) setDailyBudget(Number.parseFloat(savedDailyBudget))

        // Load expenses from API
        setIsLoading(true)
        const expensesData = await api.expenses.getAll()
        setExpenses(expensesData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load expenses",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("balance", balance.toString())
      localStorage.setItem("dailyBudget", dailyBudget.toString())
    } catch (error) {
      console.error("Error saving settings to localStorage:", error)
    }
  }, [balance, dailyBudget])

  // Add a new expense
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      setIsLoading(true)
      const { id } = await api.expenses.add(expense)
      const newExpense = { ...expense, id }
      setExpenses((prevExpenses: Expense[]) => [newExpense, ...prevExpenses])
      setBalance((prevBalance: number) => prevBalance - expense.amount)
    } catch (error) {
      console.error("Error adding expense:", error)
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Edit an existing expense
  const editExpense: (id: string, updatedExpense: Partial<Expense>) => Promise<void> = async (id, updatedExpense) => {
    try {
      setIsLoading(true)
      // First update local state
      setExpenses((prevExpenses: Expense[]) => {
        const expenseIndex = prevExpenses.findIndex((exp: Expense) => exp.id === id)
        if (expenseIndex === -1) return prevExpenses

        const oldExpense = prevExpenses[expenseIndex]
        const newExpense = { ...oldExpense, ...updatedExpense }

        // Adjust balance if amount changed
        if (typeof updatedExpense.amount === 'number' && updatedExpense.amount !== oldExpense.amount) {
          setBalance((prevBalance: number) => prevBalance + oldExpense.amount - updatedExpense.amount)
        }

        const updatedExpenses = [...prevExpenses]
        updatedExpenses[expenseIndex] = newExpense
        return updatedExpenses
      })

      // Then update in the backend using the add endpoint since we don't have an update endpoint
      const currentExpense = expenses.find(exp => exp.id === id)
      if (currentExpense) {
        await api.expenses.add({ ...currentExpense, ...updatedExpense })
      }
    } catch (error) {
      console.error("Error editing expense:", error)
      toast({
        title: "Error",
        description: "Failed to edit expense",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Delete an expense
  const deleteExpense: (id: string) => Promise<void> = async (id) => {
    try {
      setIsLoading(true)
      await api.expenses.delete(id)
      setExpenses((prevExpenses: Expense[]) => {
        const expense = prevExpenses.find((exp: Expense) => exp.id === id)
        if (expense) {
          setBalance((prevBalance: number) => prevBalance + expense.amount)
        }
        return prevExpenses.filter((exp: Expense) => exp.id !== id)
      })
    } catch (error) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BudgetContext.Provider
      value={{
        balance,
        setBalance,
        dailyBudget,
        setDailyBudget,
        expenses,
        addExpense,
        editExpense,
        deleteExpense,
        weeklyBudgetProgress,
        isLoading
      }}
    >
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget() {
  const context = useContext(BudgetContext)
  if (context === undefined) {
    throw new Error("useBudget must be used within a BudgetProvider")
  }
  return context
}

// Helper function to calculate weekly budget progress
function calculateWeeklyProgress(expenses: Expense[], dailyBudget: number): number {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay()) // Start from Sunday
  startOfWeek.setHours(0, 0, 0, 0)

  const weeklyExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate >= startOfWeek && expenseDate <= today
  })

  const weeklySpent = weeklyExpenses.reduce((total, expense) => total + expense.amount, 0)
  const weeklyBudget = dailyBudget * 7

  return Math.min(weeklySpent / weeklyBudget, 1) // Cap at 100%
}
