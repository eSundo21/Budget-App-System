"use client"

import { Sidebar } from "@/components/sidebar"
import { ExpenseTracker } from "@/components/expense-tracker"

export default function ExpensesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 md:ml-64">
        <ExpenseTracker />
      </main>
    </div>
  )
}
