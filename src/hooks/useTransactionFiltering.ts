import { useMemo } from "react";
import {
  DateRangeFilter,
  TransactionTypeFilter,
} from "@/components/budget/TransactionFilters";
import { BudgetTransaction } from "@/types/budget";

interface UseTransactionFilteringProps {
  transactions: BudgetTransaction[];
  searchTerm: string;
  transactionType: TransactionTypeFilter;
  dateRange: DateRangeFilter;
  selectedBudgets: string[];
  selectedCategories: string[];
}

export const useTransactionFiltering = ({
  transactions,
  searchTerm,
  transactionType,
  dateRange,
  selectedBudgets,
  selectedCategories,
}: UseTransactionFilteringProps) => {
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(lowerSearch) ||
          t.category.toLowerCase().includes(lowerSearch),
      );
    }

    switch (transactionType) {
      case "budgeted":
        filtered = filtered.filter((t) => t.budget_id !== null);
        break;
      case "quick":
        filtered = filtered.filter((t) => t.budget_id === null);
        break;
      default:
        break;
    }

    if (selectedBudgets.length > 0) {
      filtered = filtered.filter(
        (t) => t.budget_id && selectedBudgets.includes(t.budget_id),
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((t) =>
        selectedCategories.includes(t.category),
      );
    }

    if (dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(
        (t) => new Date(t.transaction_date) >= filterDate,
      );
    }

    return filtered;
  }, [
    transactions,
    searchTerm,
    transactionType,
    dateRange,
    selectedBudgets,
    selectedCategories,
  ]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort(
      (a, b) =>
        new Date(b.transaction_date).getTime() -
        new Date(a.transaction_date).getTime(),
    );
  }, [filteredTransactions]);

  return { filteredTransactions, sortedTransactions };
};
