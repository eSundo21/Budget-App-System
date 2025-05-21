"use client"

import { useState, useEffect } from "react"
import { useBudget } from "@/context/budget-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Moon, Sun } from "lucide-react"

export function Settings() {
  const { balance, setBalance, dailyBudget, setDailyBudget } = useBudget()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  // Use state with undefined initial values to prevent hydration mismatch
  const [newBalance, setNewBalance] = useState<string>()
  const [newDailyBudget, setNewDailyBudget] = useState<string>()
  const [isDarkMode, setIsDarkMode] = useState<boolean>()
  const [mounted, setMounted] = useState(false)

  // Initialize values after component mounts to prevent hydration mismatch
  useEffect(() => {
    setNewBalance(balance.toString())
    setNewDailyBudget(dailyBudget.toString())
    setIsDarkMode(theme === "dark")
    setMounted(true)
  }, [balance, dailyBudget, theme])

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

  // Handle balance update
  const handleBalanceUpdate = () => {
    const balanceValue = Number.parseFloat(newBalance || "0")

    if (isNaN(balanceValue) || balanceValue < 0) {
      toast({
        title: "Invalid balance",
        description: "Please enter a valid balance amount",
        variant: "destructive",
      })
      return
    }

    if (balanceValue === balance) {
      toast({
        title: "No changes made",
        description: "The balance amount is the same as the current value",
      })
      return
    }

    setBalance(balanceValue)
    toast({
      title: "Success!",
      description: `Your balance has been updated to ₱${balanceValue.toFixed(2)}`,
      variant: "default",
    })
  }

  // Handle daily budget update
  const handleDailyBudgetUpdate = () => {
    const budgetValue = Number.parseFloat(newDailyBudget || "0")

    if (isNaN(budgetValue) || budgetValue <= 0) {
      toast({
        title: "Invalid budget",
        description: "Please enter a valid daily budget amount greater than zero",
        variant: "destructive",
      })
      return
    }

    // Check if the value is the same as current budget
    if (budgetValue === dailyBudget) {
      toast({
        title: "No changes made",
        description: "The daily budget amount is the same as the current value",
      })
      return
    }

    // Compare with previous value
    const changePercentage = ((budgetValue - dailyBudget) / dailyBudget) * 100
    const changeType = changePercentage > 0 ? "increased" : "decreased"

    setDailyBudget(budgetValue)
    toast({
      title: "Success!",
      description: `Your daily budget has been ${changeType} by ${Math.abs(changePercentage).toFixed(1)}% to ₱${budgetValue.toFixed(2)}`,
      variant: "default",
    })
  }

  // Handle theme toggle
  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked)
    setTheme(checked ? "dark" : "light")

    toast({
      title: "Theme updated",
      description: checked ? "Dark mode enabled" : "Light mode enabled",
    })
  }

  // Don't render until after hydration
  if (!mounted) return null

  return (
    <>
      <Toaster />
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mt-2">Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your budget management app</p>
        </div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>E-Wallet Balance</CardTitle>
              <CardDescription>Update your starting balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="balance">Balance (₱)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="balance"
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    step="0.01"
                    min="0"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleBalanceUpdate} 
                    variant="default"
                    className="min-w-[100px]"
                  >
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-l-4 border-l-secondary">
            <CardHeader>
              <CardTitle>Daily Budget Limit</CardTitle>
              <CardDescription>Set your daily spending limit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="daily-budget">Daily Budget (₱)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="daily-budget"
                    type="number"
                    value={newDailyBudget}
                    onChange={(e) => setNewDailyBudget(e.target.value)}
                    step="0.01"
                    min="0"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleDailyBudgetUpdate}
                    variant="default"
                    className="min-w-[100px]"
                  >
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the app appearance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                </div>
                <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={handleThemeToggle} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  )
}

