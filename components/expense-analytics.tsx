"use client"

import { useState, useEffect } from "react"
import { api } from "@/services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { format, parseISO } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts"

type TimeRange = "7d" | "14d" | "30d" | "90d"

export function ExpenseAnalytics() {
  const [trends, setTrends] = useState<any>(null)
  const [breakdown, setBreakdown] = useState<any>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>("14d")
  const [isLoading, setIsLoading] = useState(true)

  const timeRanges: Record<TimeRange, number> = {
    "7d": 7,
    "14d": 14,
    "30d": 30,
    "90d": 90,
  }

  const COLORS = [
    "hsl(var(--primary))",
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#10b981", // emerald
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#6366f1", // indigo
    "#14b8a6", // teal
  ]

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const days = timeRanges[timeRange]
        const [trendsData, breakdownData] = await Promise.all([
          api.analytics.getTrends(days),
          api.analytics.getCategoryBreakdown(days),
        ])
        setTrends(trendsData)
        setBreakdown(breakdownData)
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      }
      setIsLoading(false)
    }

    fetchData()
  }, [timeRange])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!trends || !breakdown) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Expense Analytics</h2>
        <div className="flex gap-2">
          {Object.keys(timeRanges).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range as TimeRange)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Spending Card */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Spending</CardTitle>
            <CardDescription>Your spending patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.trends} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(parseISO(date), "MMM dd")}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tickFormatter={(value) => `₱${value}`} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => format(parseISO(label as string), "MMM dd, yyyy")}
                  />
                  <ReferenceLine
                    y={trends.statistics.average_daily}
                    stroke="hsl(var(--primary))"
                    strokeDasharray="3 3"
                    label={{
                      value: "Avg",
                      position: "insideTopRight",
                      fill: "hsl(var(--primary))",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Average Daily</p>
                <p className="text-lg font-medium">{formatCurrency(trends.statistics.average_daily)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-lg font-medium">{formatCurrency(trends.statistics.total_amount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown Card */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Your spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown.breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="amount"
                    nameKey="category"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {breakdown.breakdown.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-4">
              {breakdown.breakdown.map((item: any, index: number) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-medium">{item.category}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(item.amount)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
