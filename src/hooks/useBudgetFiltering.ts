import { useMemo } from "react";
import {
  BudgetFilterType,
  BudgetSortType,
} from "@/components/budget/BudgetFilters";
import { Budget } from "@/types/budget";

interface UseBudgetFilteringProps {
  budgets: Budget[];
  filter: BudgetFilterType;
  sortBy: BudgetSortType;
  searchTerm: string;
  selectedCategory: string;
}

export const useBudgetFiltering = ({
  budgets,
  filter,
  sortBy,
  searchTerm,
  selectedCategory,
}: UseBudgetFilteringProps) => {
  const filteredBudgets = useMemo(() => {
    let filtered = [...budgets];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (budget) =>
          budget.name.toLowerCase().includes(lowerSearch) ||
          budget.description?.toLowerCase().includes(lowerSearch) ||
          budget.category.toLowerCase().includes(lowerSearch),
      );
    }

    switch (filter) {
      case "active":
        filtered = filtered.filter((budget) => {
          const endDate = new Date(budget.end_date);
          return endDate >= new Date();
        });
        break;
      case "over-budget":
        filtered = filtered.filter((budget) => budget.spent > budget.amount);
        break;
      case "near-limit":
        filtered = filtered.filter((budget) => {
          const percentage = (budget.spent / budget.amount) * 100;
          return percentage > 80 && percentage <= 100;
        });
        break;
      case "category":
        if (selectedCategory) {
          filtered = filtered.filter(
            (budget) => budget.category === selectedCategory,
          );
        }
        break;
      default:
        break;
    }

    return filtered;
  }, [budgets, filter, searchTerm, selectedCategory]);

  const sortedBudgets = useMemo(() => {
    const sorted = [...filteredBudgets];

    switch (sortBy) {
      case "newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "amount-high":
        return sorted.sort((a, b) => b.amount - a.amount);
      case "amount-low":
        return sorted.sort((a, b) => a.amount - b.amount);
      case "spent-high":
        return sorted.sort((a, b) => b.spent - a.spent);
      case "spent-low":
        return sorted.sort((a, b) => a.spent - b.spent);
      default:
        return sorted;
    }
  }, [filteredBudgets, sortBy]);

  return { filteredBudgets, sortedBudgets };
};
