import type { Expense, ExpenseCategory } from "@/types/expense"

const API_BASE_URL = "http://127.0.0.1:5000/api"

interface ExpenseTrend {
  date: string
  amount: number
}

interface TrendStatistics {
  total_amount: number
  average_daily: number
  maximum_daily: number
  minimum_daily: number
}

interface CategoryBreakdown {
  category: ExpenseCategory
  amount: number
  percentage: number
}

interface AnalyticsTrendsResponse {
  trends: ExpenseTrend[]
  statistics: TrendStatistics
}

interface CategoryBreakdownResponse {
  breakdown: CategoryBreakdown[]
  total_amount: number
}

export const api = {
  // Expense endpoints
  expenses: {
    getAll: async (params?: { category?: ExpenseCategory; startDate?: string; endDate?: string; limit?: number }) => {
      const queryParams = new URLSearchParams()
      if (params?.category) queryParams.append("category", params.category)
      if (params?.startDate) queryParams.append("start_date", params.startDate)
      if (params?.endDate) queryParams.append("end_date", params.endDate)
      if (params?.limit) queryParams.append("limit", params.limit.toString())

      const response = await fetch(`${API_BASE_URL}/expenses?${queryParams.toString()}`)
      const data = await response.json()
      return data as Expense[]
    },

    add: async (expense: Omit<Expense, "id">) => {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expense),
      })
      const data = await response.json()
      return data as { id: number; message: string }
    },

    delete: async (id: number) => {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: "DELETE",
      })
      const data = await response.json()
      return data as { message: string }
    },

    getSummary: async () => {
      const response = await fetch(`${API_BASE_URL}/expenses/summary`)
      const data = await response.json()
      return data as { total: number; categories: Record<ExpenseCategory, number> }
    },
  },

  // Category endpoints
  categories: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/categories`)
      const data = await response.json()
      return data as ExpenseCategory[]
    },

    add: async (name: string) => {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })
      const data = await response.json()
      return data as { id: number; message: string }
    },
  },

  // Analytics endpoints
  analytics: {
    getTrends: async (days: number = 14) => {
      const response = await fetch(`${API_BASE_URL}/analytics/trends?days=${days}`)
      const data = await response.json()
      return data as AnalyticsTrendsResponse
    },

    getCategoryBreakdown: async (days: number = 30) => {
      const response = await fetch(`${API_BASE_URL}/analytics/category-breakdown?days=${days}`)
      const data = await response.json()
      return data as CategoryBreakdownResponse
    },
  },
}
