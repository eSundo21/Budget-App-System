"use client"

import { useBudget } from "@/context/budget-context"
import type { ExpenseCategory } from "@/types/expense"
import { getCategoryIcon } from "@/lib/category-icons"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

export function ExpenseSummary() {
  const { expenses } = useBudget()

  // Group expenses by category
  const expensesByCategory = expenses.reduce(
    (acc, expense) => {
      const category = expense.category
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += expense.amount
      return acc
    },
    {} as Record<ExpenseCategory, number>,
  )

  // Convert to array for display
  const categoryData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category as ExpenseCategory,
    value: amount,
  }))

  // Sort by amount (descending)
  categoryData.sort((a, b) => b.value - a.value)

  // Calculate total expenses
  const totalExpenses = categoryData.reduce((sum, item) => sum + item.value, 0)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  }

  // If no expenses, show empty state
  if (categoryData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-[200px] text-center"
      >
        <div className="rounded-full bg-muted p-4 mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground h-6 w-6"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-muted-foreground font-medium">No expense data to display</p>
        <p className="text-sm text-muted-foreground mt-1">Add expenses to see your spending breakdown</p>
      </motion.div>
    )
  }

  // Colors for categories
  const getCategoryColor = (index: number) => {
    const colors = [
      "bg-primary",
      "bg-blue-500",
      "bg-amber-500",
      "bg-emerald-500",
      "bg-violet-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ]
    return colors[index % colors.length]
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 h-[200px] overflow-auto pr-2"
    >
      {categoryData.map((category, index) => {
        const CategoryIcon = getCategoryIcon(category.name)
        const percentage = (category.value / totalExpenses) * 100

        return (
          <motion.div key={category.name} variants={itemVariants} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getCategoryColor(index)}`}></div>
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{formatCurrency(category.value)}</span>
            </div>
            <div className="mt-1">
              <Progress value={percentage} className="h-1.5" indicatorClassName={getCategoryColor(index)} />
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
