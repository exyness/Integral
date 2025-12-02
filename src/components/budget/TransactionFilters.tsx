import { Search, X } from "lucide-react";
import React from "react";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import { useTheme } from "@/contexts/ThemeContext";
import { Budget } from "@/types/budget";

export type TransactionTypeFilter = "all" | "budgeted" | "quick";
export type DateRangeFilter = "all" | "week" | "month" | "year";

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  transactionType: TransactionTypeFilter;
  onTransactionTypeChange: (type: TransactionTypeFilter) => void;
  dateRange: DateRangeFilter;
  onDateRangeChange: (range: DateRangeFilter) => void;
  selectedBudgets: string[];
  onBudgetsChange: (budgets: string[]) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  budgets: Budget[];
  categories: string[];
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchTerm,
  onSearchChange,
  transactionType,
  onTransactionTypeChange,
  dateRange,
  onDateRangeChange,
  selectedBudgets,
  onBudgetsChange,
  selectedCategories,
  onCategoriesChange,
  budgets,
  categories,
}) => {
  const { isDark, isHalloweenMode } = useTheme();

  const transactionTypeOptions: DropdownOption[] = [
    { value: "all", label: "All Transactions" },
    { value: "budgeted", label: "Budgets" },
    { value: "quick", label: "Quick Expenses" },
  ];

  const dateRangeOptions: DropdownOption[] = [
    { value: "all", label: "All Time" },
    { value: "week", label: "Last Week" },
    { value: "month", label: "Last Month" },
    { value: "year", label: "Last Year" },
  ];

  const toggleBudget = (budgetId: string) => {
    if (selectedBudgets.includes(budgetId)) {
      onBudgetsChange(selectedBudgets.filter((id) => id !== budgetId));
    } else {
      onBudgetsChange([...selectedBudgets, budgetId]);
    }
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  return (
    <div
      className={`px-2 md:px-4 py-3 md:py-4 border-b ${
        isHalloweenMode
          ? "border-[#60c9b6]/20"
          : "border-[rgba(139,92,246,0.2)]"
      }`}
    >
      {/* Search and Dropdowns */}
      <div className="space-y-2 md:space-y-0 md:flex md:gap-3 mb-3 md:mb-4">
        {/* Search */}
        <div className="relative md:flex-1">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : "text-gray-400 dark:text-[#B4B4B8]"
            }`}
          />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-10 py-2 rounded-lg border focus:outline-none transition-colors text-sm ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                : "bg-white dark:bg-[rgba(255,255,255,0.05)] border-gray-300 dark:border-[rgba(255,255,255,0.1)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#B4B4B8] focus:border-[#10B981]"
            }`}
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                isHalloweenMode
                  ? "hover:bg-[#60c9b6]/20 text-[#60c9b6]"
                  : isDark
                    ? "hover:bg-[rgba(255,255,255,0.1)]"
                    : "hover:bg-gray-100"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-[60%_1fr] gap-2 md:flex md:gap-3">
          <Dropdown
            value={transactionType}
            onValueChange={(value) =>
              onTransactionTypeChange(value as TransactionTypeFilter)
            }
            options={transactionTypeOptions}
            placeholder="Type"
          />

          <Dropdown
            value={dateRange}
            onValueChange={(value) =>
              onDateRangeChange(value as DateRangeFilter)
            }
            options={dateRangeOptions}
            placeholder="Date Range"
          />
        </div>
      </div>

      {/* Budgets Filter */}
      {budgets.length > 0 && (
        <div className="mb-2.5 md:mb-3">
          <label
            className={`block text-[10px] md:text-xs font-medium mb-1.5 md:mb-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]/70"
                : isDark
                  ? "text-[#B4B4B8]"
                  : "text-gray-600"
            }`}
          >
            Filter by Budget
          </label>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {budgets.map((budget) => (
              <button
                key={budget.id}
                onClick={() => toggleBudget(budget.id)}
                className={`px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg text-[10px] md:text-xs font-medium transition-colors flex items-center space-x-1 md:space-x-1.5 ${
                  selectedBudgets.includes(budget.id)
                    ? "text-white"
                    : isHalloweenMode
                      ? "bg-[#60c9b6]/10 hover:bg-[#60c9b6]/20 text-[#60c9b6]"
                      : isDark
                        ? "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#B4B4B8]"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                style={{
                  backgroundColor: selectedBudgets.includes(budget.id)
                    ? budget.color
                    : undefined,
                }}
              >
                <div
                  className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
                  style={{ backgroundColor: budget.color }}
                />
                <span>{budget.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories Filter */}
      {categories.length > 0 && (
        <div>
          <label
            className={`block text-[10px] md:text-xs font-medium mb-1.5 md:mb-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]/70"
                : isDark
                  ? "text-[#B4B4B8]"
                  : "text-gray-600"
            }`}
          >
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {categories
              .filter((category) => category && category.trim() !== "")
              .map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all capitalize cursor-pointer ${
                    selectedCategories.includes(category)
                      ? isHalloweenMode
                        ? "bg-[#60c9b6] text-black shadow-[0_0_10px_rgba(96,201,182,0.3)]"
                        : "bg-[#8B5CF6] text-white shadow-sm"
                      : isHalloweenMode
                        ? "bg-[#60c9b6]/10 hover:bg-[#60c9b6]/20 text-[#60c9b6] border border-[#60c9b6]/20 hover:border-[#60c9b6]/40"
                        : isDark
                          ? "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#B4B4B8] border border-[rgba(255,255,255,0.1)]"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
