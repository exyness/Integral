import { ListChecks, Search } from "lucide-react";
import React from "react";
import { Calendar } from "@/components/ui/Calendar";
import { Checkbox } from "@/components/ui/Checkbox";
import { Dropdown } from "@/components/ui/Dropdown";
import { FilterType, SortType } from "@/constants/taskConstants";
import { useTheme } from "@/contexts/ThemeContext";
import { useArchivedProjects } from "@/hooks/useArchivedProjects";

interface TaskFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  projectFilter?: string;
  onProjectFilterChange?: (project: string) => void;
  availableProjects?: string[];
  dateRange?: {
    start: string | null;
    end: string | null;
  };
  onDateRangeChange?: (range: {
    start: string | null;
    end: string | null;
  }) => void;
  isCompact?: boolean;
  onCompactChange?: (isCompact: boolean) => void;
  showCompactToggle?: boolean;
  isManageMode?: boolean;
  onManageModeChange?: (isManageMode: boolean) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  projectFilter = "",
  onProjectFilterChange,
  availableProjects = [],
  dateRange,
  onDateRangeChange,
  isCompact = false,
  onCompactChange,
  showCompactToggle = false,
  isManageMode = false,
  onManageModeChange,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { isArchived } = useArchivedProjects();

  const activeProjects = availableProjects.filter(
    (project) => !isArchived(project),
  );

  const filterOptions = [
    { value: "pending", label: "Pending" },
    { value: "all", label: "All Tasks" },
    { value: "completed", label: "Completed" },
  ];

  const sortOptions = [
    { value: "created-desc", label: "Newest First" },
    { value: "created-asc", label: "Oldest First" },
    { value: "dueDate-asc", label: "Due Soonest" },
    { value: "dueDate-desc", label: "Due Latest" },
    { value: "priority-desc", label: "Priority (High-Low)" },
    { value: "priority-asc", label: "Priority (Low-High)" },
  ];

  const projectOptions = [
    { value: "", label: "All Projects" },
    ...(activeProjects?.map((project) => ({
      value: project,
      label: project,
    })) || []),
  ];

  return (
    <div className="space-y-3 md:space-y-4 p-4 md:p-6">
      {/* Mobile: Search and filters stacked */}
      <div className="md:hidden space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-[#71717A]"
                  : "text-gray-500"
            }`}
          />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none transition-colors text-sm ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                : isDark
                  ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6]"
                  : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6]"
            }`}
          />
        </div>

        {/* Filters Row - 2 columns on mobile */}
        <div className="grid grid-cols-2 gap-2">
          {/* Project Filter Dropdown */}
          {activeProjects.length > 0 && onProjectFilterChange && (
            <div>
              <Dropdown
                value={projectFilter}
                onValueChange={onProjectFilterChange}
                options={projectOptions}
                placeholder="All Projects"
              />
            </div>
          )}

          {/* Status Filter Dropdown */}
          <div>
            <Dropdown
              value={filter}
              onValueChange={(value) => onFilterChange(value as FilterType)}
              options={filterOptions}
              placeholder="Pending"
            />
          </div>

          {/* Date Range Picker - Full width on mobile */}
          <div className="col-span-2">
            <Calendar
              mode="range"
              startDate={dateRange?.start || undefined}
              endDate={dateRange?.end || undefined}
              onStartDateChange={(date) =>
                onDateRangeChange?.({ ...dateRange!, start: date })
              }
              onEndDateChange={(date) =>
                onDateRangeChange?.({ ...dateRange!, end: date })
              }
              onChange={() => {
                /* no-op */
              }}
              placeholder="Filter by Due Date"
            />
          </div>

          {/* Sort Dropdown - full width on mobile */}
          <div className="col-span-2">
            <Dropdown
              value={sortBy}
              onValueChange={(value) => onSortChange(value as SortType)}
              options={sortOptions}
              placeholder="Sort"
            />
          </div>

          {/* Compact View Toggle - Mobile */}
          {showCompactToggle && onCompactChange && (
            <div className="col-span-2 flex items-center justify-between mt-1 mx-1">
              <Checkbox
                checked={isCompact}
                onChange={onCompactChange}
                label="Compact View"
                className="[&_label]:text-[10px] [&_div]:w-3.5 [&_div]:h-3.5"
              />
              {onManageModeChange && (
                <button
                  onClick={() => onManageModeChange(!isManageMode)}
                  className={`flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-md transition-colors ${
                    isManageMode
                      ? isHalloweenMode
                        ? "bg-[#60c9b6] text-[#0f0f13]"
                        : "bg-[#8B5CF6] text-white"
                      : isHalloweenMode
                        ? "bg-[#60c9b6]/20 text-[#60c9b6] border border-[#60c9b6]/30"
                        : isDark
                          ? "bg-[rgba(255,255,255,0.05)] text-gray-300 border border-[rgba(255,255,255,0.1)]"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  <ListChecks className="w-3 h-3" />
                  <span>Manage</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Search and filters in one row */}
      <div className="hidden md:flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
        {/* Search Input (takes up available space) */}
        <div className="relative flex-1">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-[#71717A]"
                  : "text-gray-500"
            }`}
          />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none transition-colors ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                : isDark
                  ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6]"
                  : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6]"
            }`}
          />
        </div>

        {/* Filters and Sort Controls (fixed size, on the right) */}
        <div className="flex flex-col sm:flex-row gap-3 lg:shrink-0 items-center">
          {/* Compact View Toggle - Desktop */}
          {showCompactToggle && onCompactChange && (
            <Checkbox
              checked={isCompact}
              onChange={onCompactChange}
              label="Compact View"
              className="mr-2"
            />
          )}

          {/* Project Filter Dropdown */}
          {activeProjects.length > 0 && onProjectFilterChange && (
            <div className="w-full sm:w-40">
              <Dropdown
                value={projectFilter}
                onValueChange={onProjectFilterChange}
                options={projectOptions}
                placeholder="Project"
              />
            </div>
          )}

          {/* Status Filter Dropdown */}
          <div className="w-full sm:w-32">
            <Dropdown
              value={filter}
              onValueChange={(value) => onFilterChange(value as FilterType)}
              options={filterOptions}
              placeholder="Status"
            />
          </div>

          {/* Date Range Picker */}
          <div className="w-full sm:w-48">
            <Calendar
              mode="range"
              startDate={dateRange?.start || undefined}
              endDate={dateRange?.end || undefined}
              onStartDateChange={(date) =>
                onDateRangeChange?.({ ...dateRange!, start: date })
              }
              onEndDateChange={(date) =>
                onDateRangeChange?.({ ...dateRange!, end: date })
              }
              onChange={() => {
                /* no-op */
              }}
              placeholder="Due Date"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-40">
            <Dropdown
              value={sortBy}
              onValueChange={(value) => onSortChange(value as SortType)}
              options={sortOptions}
              placeholder="Sort"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
