export enum ExpenseCategory {
  FOOD = "Food",
  TRANSPORTATION = "Transportation",
  ENTERTAINMENT = "Entertainment",
  SHOPPING = "Shopping",
  BILLS = "Bills",
  HEALTH = "Health",
  EDUCATION = "Education",
  OTHER = "Other",
}

export interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  description: string
  date: string
}

