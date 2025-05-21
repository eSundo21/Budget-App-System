"use client"

import { useBudget } from "@/context/budget-context"
import type { ExpenseCategory } from "@/types/expense"
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
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, subDays, parseISO } from "date-fns"

type ChartType = "pie" | "bar" | "line" | "area"

export function ExpenseChart() {
  const { expenses } = useBudget()
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
  const [chartType, setChartType] = useState<ChartType>("pie")

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

  // Convert to array for category charts
  const categoryData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
  }))

  // Sort by amount (descending)
  categoryData.sort((a, b) => b.value - a.value)

  // Prepare time-based data for line/area charts
  const getTimeSeriesData = () => {
    // Create an array of the last 14 days
    const days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i)
      return format(date, "yyyy-MM-dd")
    })

    // Map expenses to each day
    return days.map((day) => {
      const dayExpenses = expenses.filter((expense) => expense.date === day)
      const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0)

      return {
        date: day,
        amount: total,
        formattedDate: format(parseISO(day), "MMM dd"),
      }
    })
  }

  const timeSeriesData = getTimeSeriesData()

  // Calculate average daily spending
  const avgDailySpending = timeSeriesData.reduce((sum, day) => sum + day.amount, 0) / timeSeriesData.length

  // Colors for charts
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

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value)
  }

  // Calculate total expenses
  const totalExpenses = categoryData.reduce((sum, item) => sum + item.value, 0)

  // Handle pie sector active state
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(undefined)
  }

  // Render active shape with more details
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 16}
          fill={fill}
        />
        <text x={cx} y={cy - 15} dy={8} textAnchor="middle" fill="currentColor" className="text-sm font-medium">
          {payload.name}
        </text>
        <text x={cx} y={cy + 15} textAnchor="middle" fill="currentColor" className="text-xs">
          {formatCurrency(value)} ({(percent * 100).toFixed(0)}%)
        </text>
      </g>
    )
  }

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-muted-foreground">
            {((payload[0].value / totalExpenses) * 100).toFixed(1)}% of total
          </p>
        </div>
      )
    }
    return null
  }

  // Custom tooltip for time series charts
  const CustomTimeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{payload[0].payload.formattedDate}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  // If no expenses, show empty state
  if (expenses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-[300px] text-center"
      >
        <div className="rounded-full bg-muted p-6 mb-4">
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
            className="text-muted-foreground h-10 w-10"
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

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Total Expenses: <span className="font-medium">{formatCurrency(totalExpenses)}</span>
          </p>
          <Tabs defaultValue="pie" value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
            <TabsList className="grid grid-cols-4 h-8">
              <TabsTrigger value="pie" className="text-xs">
                Pie Chart
              </TabsTrigger>
              <TabsTrigger value="bar" className="text-xs">
                Bar Chart
              </TabsTrigger>
              <TabsTrigger value="line" className="text-xs">
                Line Chart
              </TabsTrigger>
              <TabsTrigger value="area" className="text-xs">
                Area Chart
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={chartType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-[300px]"
          >
            {chartType === "pie" && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                    paddingAngle={2}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    formatter={(value, entry, index) => {
                      return (
                        <span className="flex items-center text-xs">
                          <span
                            className="inline-block w-3 h-3 mr-1"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></span>
                          {value}
                        </span>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            {chartType === "bar" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => `₱${value}`} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="value" name="Amount" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartType === "line" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => `₱${value}`} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTimeTooltip />} />
                  <ReferenceLine
                    y={avgDailySpending}
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
            )}

            {chartType === "area" && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => `₱${value}`} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTimeTooltip />} />
                  <ReferenceLine
                    y={avgDailySpending}
                    stroke="hsl(var(--primary))"
                    strokeDasharray="3 3"
                    label={{
                      value: "Avg",
                      position: "insideTopRight",
                      fill: "hsl(var(--primary))",
                      fontSize: 12,
                    }}
                  />
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                    activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="text-xs text-muted-foreground mt-2">
          {chartType === "pie" && "Showing expenses by category"}
          {chartType === "bar" && "Comparing expenses across categories"}
          {chartType === "line" && "Daily expense trends over the last 14 days"}
          {chartType === "area" && "Expense volume over the last 14 days"}
        </div>
      </div>
    </div>
  )
}

// Sector component for pie chart active shape
function Sector(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

  const RADIAN = Math.PI / 180
  const sin = Math.sin(-RADIAN * startAngle)
  const cos = Math.cos(-RADIAN * startAngle)
  const sin2 = Math.sin(-RADIAN * endAngle)
  const cos2 = Math.cos(-RADIAN * endAngle)
  const dx = cos * outerRadius
  const dy = sin * outerRadius
  const dx2 = cos2 * outerRadius
  const dy2 = sin2 * outerRadius

  return (
    <path
      d={`M ${cx + dx} ${cy + dy} A ${outerRadius} ${outerRadius} 0 ${endAngle - startAngle > 180 ? 1 : 0} 0 ${cx + dx2} ${cy + dy2} L ${cx + cos2 * innerRadius} ${cy + sin2 * innerRadius} A ${innerRadius} ${innerRadius} 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${cx + cos * innerRadius} ${cy + sin * innerRadius} Z`}
      fill={fill}
    />
  )
}

