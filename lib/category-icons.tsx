import {
  Coffee,
  Bus,
  Film,
  ShoppingBag,
  Receipt,
  Stethoscope,
  GraduationCap,
  HelpCircle,
  type LucideIcon,
} from "lucide-react"
import { ExpenseCategory } from "@/types/expense"

export function getCategoryIcon(category: ExpenseCategory): LucideIcon {
  switch (category) {
    case ExpenseCategory.FOOD:
      return Coffee
    case ExpenseCategory.TRANSPORTATION:
      return Bus
    case ExpenseCategory.ENTERTAINMENT:
      return Film
    case ExpenseCategory.SHOPPING:
      return ShoppingBag
    case ExpenseCategory.BILLS:
      return Receipt
    case ExpenseCategory.HEALTH:
      return Stethoscope
    case ExpenseCategory.EDUCATION:
      return GraduationCap
    case ExpenseCategory.OTHER:
    default:
      return HelpCircle
  }
}

