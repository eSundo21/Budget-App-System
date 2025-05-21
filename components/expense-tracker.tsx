"use client"

import { useState } from "react"
import { ExpenseForm } from "./expense-form"
import { ExpenseList } from "./expense-list"
import { ExpenseAnalytics } from "./expense-analytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

export function ExpenseTracker() {
  const [activeTab, setActiveTab] = useState("add")

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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expense Tracker</h1>
        <p className="text-muted-foreground">Add, view, and manage your expenses</p>
      </div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="add" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add">Add Expense</TabsTrigger>
            <TabsTrigger value="history">Expense History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="add" className="mt-4">
            <ExpenseForm />
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <ExpenseList />
          </TabsContent>
          <TabsContent value="analytics" className="mt-4">
            <ExpenseAnalytics />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
