"use client"

import { useBudget } from "@/context/budget-context"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getCategoryIcon } from "@/lib/category-icons"
import { motion } from "framer-motion"

export function RecentExpenses() {
  const { expenses } = useBudget()

  // Get 5 most recent expenses
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

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
  if (recentExpenses.length === 0) {
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
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
        </div>
        <p className="text-muted-foreground font-medium">No recent expenses</p>
        <p className="text-sm text-muted-foreground mt-1">Add expenses to see them here</p>
      </motion.div>
    )
  }

  return (
    <ScrollArea className="h-[200px] pr-4">
      <motion.div className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
        {recentExpenses.map((expense) => {
          const CategoryIcon = getCategoryIcon(expense.category)
          return (
            <motion.div
              key={expense.id}
              variants={itemVariants}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <CategoryIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium line-clamp-1">{expense.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(expense.date), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className="font-medium text-sm">{formatCurrency(expense.amount)}</span>
                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                  {expense.category}
                </Badge>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </ScrollArea>
  )
}

