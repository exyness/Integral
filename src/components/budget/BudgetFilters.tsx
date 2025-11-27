import { Search } from "lucide-react";
import React from "react";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import { useTheme } from "@/contexts/ThemeContext";
import { Budget } from "@/types/budget";

export type BudgetFilterType =
  | "all"
  | "active"
  | "over-budget"
  | "near-limit"
  | "category";
export type BudgetSortType =
  | "newest"
  | "oldest"
  | "name"
  | "amount-high"
  | "amount-low"
  | "spent-high"
  | "spent-low";

interface BudgetFiltersProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  filter: BudgetFilterType;
  onFilterChange: (filter: BudgetFilterType) => void;
  sortBy: BudgetSortType;
  onSortChange: (sort: BudgetSortType) => void;
  selectedCategory?: string;
  onCategoryChange: (category: string) => void;
  budgets: Budget[];
}

export const BudgetFilters: React.FC<BudgetFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  selectedCategory,
  onCategoryChange,
  budgets,
}) => {
  const { isHalloweenMode } = useTheme();
  const filterOptions: DropdownOption[] = [
    { value: "all", label: "All Budgets" },
    { value: "active", label: "Active" },
    { value: "over-budget", label: "Over Budget" },
    { value: "near-limit", label: "Near Limit (>80%)" },
    { value: "category", label: "By Category" },
  ];

  const sortOptions: DropdownOption[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name", label: "Name A-Z" },
    { value: "amount-high", label: "Amount (High-Low)" },
    { value: "amount-low", label: "Amount (Low-High)" },
    { value: "spent-high", label: "Spent (High-Low)" },
    { value: "spent-low", label: "Spent (Low-High)" },
  ];

  const categories = Array.from(new Set(budgets.map((b) => b.category)));
  const categoryOptions: DropdownOption[] = categories.map((category) => ({
    value: category,
    label: category.charAt(0).toUpperCase() + category.slice(1),
  }));

  const handleFilterChange = (value: string) => {
    const filterValue = value as BudgetFilterType;
    onFilterChange(filterValue);

    if (filterValue !== "category") {
      onCategoryChange("");
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Search and Filters - stacked on mobile, side by side on desktop */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : "text-gray-400 dark:text-[#B4B4B8]"
            }`}
          />
          <input
            type="text"
            placeholder="Search budgets..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition-colors text-xs md:text-sm ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/50 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                : "bg-white dark:bg-[rgba(255,255,255,0.05)] border-gray-300 dark:border-[rgba(255,255,255,0.1)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#B4B4B8] focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]"
            }`}
          />
        </div>

        {/* Filters and Sort - side by side */}
        <div className="flex gap-3">
          {/* Filter Dropdown */}
          <div className="flex-1 md:w-40">
            <Dropdown
              value={filter}
              onValueChange={handleFilterChange}
              options={filterOptions}
              placeholder="Filter by"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex-1 md:w-40">
            <Dropdown
              value={sortBy}
              onValueChange={(value) => onSortChange(value as BudgetSortType)}
              options={sortOptions}
              placeholder="Sort by"
            />
          </div>
        </div>
      </div>

      {/* Category Dropdown (only shown when filter is 'category') */}
      {filter === "category" && (
        <div className="mt-3 md:w-40 md:ml-auto">
          <Dropdown
            value={selectedCategory}
            onValueChange={onCategoryChange}
            options={categoryOptions}
            placeholder="Choose category"
          />
        </div>
      )}

      {/* Active Filter Display */}
      {(filter !== "all" || searchTerm) && (
        <div
          className={`flex items-center gap-2 text-sm mt-3 ${
            isHalloweenMode ? "text-[#60c9b6]/70" : "text-[#B4B4B8]"
          }`}
        >
          <span>Active filters:</span>
          {searchTerm && (
            <span
              className={`px-2 py-1 rounded ${
                isHalloweenMode
                  ? "bg-[#60c9b6]/20 text-[#60c9b6]"
                  : "bg-[rgba(139,92,246,0.2)] text-[#8B5CF6]"
              }`}
            >
              "{searchTerm}"
            </span>
          )}
          {filter !== "all" && (
            <span
              className={`px-2 py-1 rounded ${
                isHalloweenMode
                  ? "bg-[#60c9b6]/20 text-[#60c9b6]"
                  : "bg-[rgba(139,92,246,0.2)] text-[#8B5CF6]"
              }`}
            >
              {filter === "category" && selectedCategory
                ? selectedCategory.charAt(0).toUpperCase() +
                  selectedCategory.slice(1)
                : filterOptions.find((opt) => opt.value === filter)?.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
