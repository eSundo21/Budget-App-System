"use client"

import { useState } from "react"
import { useBudget } from "@/context/budget-context"
import { ExpenseCategory } from "@/types/expense"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Edit, Trash2, Search, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCategoryIcon } from "@/lib/category-icons"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export function ExpenseList() {
  const { expenses, editExpense, deleteExpense } = useBudget()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "ALL">("ALL")
  const [sortField, setSortField] = useState<"date" | "amount">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Edit expense state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<{
    id: string
    amount: string
    category: ExpenseCategory
    description: string
    date: Date
  } | null>(null)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter((expense) => {
      // Filter by search term
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase())

      // Filter by category
      const matchesCategory = categoryFilter === "ALL" || expense.category === categoryFilter

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      // Sort by field
      if (sortField === "date") {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      } else {
        return sortDirection === "asc" ? a.amount - b.amount : b.amount - a.amount
      }
    })

  // Toggle sort
  const toggleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Handle edit expense
  const handleEditClick = (expense: (typeof expenses)[0]) => {
    setEditingExpense({
      id: expense.id,
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description,
      date: new Date(expense.date),
    })
    setIsEditDialogOpen(true)
  }

  // Save edited expense
  const handleSaveEdit = () => {
    if (!editingExpense) return

    const amountValue = Number.parseFloat(editingExpense.amount)

    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than zero",
        variant: "destructive",
      })
      return
    }

    editExpense(editingExpense.id, {
      amount: amountValue,
      category: editingExpense.category,
      description: editingExpense.description,
      date: format(editingExpense.date, "yyyy-MM-dd"),
    })

    setIsEditDialogOpen(false)
    setEditingExpense(null)

    toast({
      title: "Expense updated",
      description: "Your expense has been updated successfully",
    })
  }

  // Handle delete expense
  const handleDeleteExpense = (id: string) => {
    deleteExpense(id)
    toast({
      title: "Expense deleted",
      description: "Your expense has been deleted successfully",
    })
  }

  return (
    <Card className="shadow-sm">
      <Toaster />
      <CardHeader>
        <CardTitle>Expense History</CardTitle>
        <CardDescription>View and manage your past expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  className="pl-8 bg-background border-border focus-visible:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value as ExpenseCategory | "ALL")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {Object.values(ExpenseCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-muted-foreground">No expenses found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or add new expenses</p>
            </div>
          ) : (
            <div className="rounded-md border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="flex items-center p-0 h-auto font-medium"
                        onClick={() => toggleSort("date")}
                      >
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="flex items-center p-0 h-auto font-medium"
                        onClick={() => toggleSort("amount")}
                      >
                        Amount
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => {
                    const CategoryIcon = getCategoryIcon(expense.category)
                    return (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <CategoryIcon className="mr-2 h-4 w-4" />
                            {expense.category}
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(expense.date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{formatCurrency(expense.amount)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-primary/10 hover:text-primary"
                              onClick={() => handleEditClick(expense)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Edit Expense Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
              <DialogDescription>Make changes to your expense here</DialogDescription>
            </DialogHeader>
            {editingExpense && (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount (₱)</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    value={editingExpense.amount}
                    onChange={(e) =>
                      setEditingExpense({
                        ...editingExpense,
                        amount: e.target.value,
                      })
                    }
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editingExpense.category}
                    onValueChange={(value) =>
                      setEditingExpense({
                        ...editingExpense,
                        category: value as ExpenseCategory,
                      })
                    }
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ExpenseCategory).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingExpense.description}
                    onChange={(e) =>
                      setEditingExpense({
                        ...editingExpense,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="edit-date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editingExpense.date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingExpense.date ? format(editingExpense.date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editingExpense.date}
                        onSelect={(date) =>
                          date &&
                          setEditingExpense({
                            ...editingExpense,
                            date,
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

