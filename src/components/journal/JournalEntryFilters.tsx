import { Search } from "lucide-react";
import React from "react";
import { Calendar } from "@/components/ui/Calendar";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import { useTheme } from "@/contexts/ThemeContext";
import { FilterType, SortType } from "@/hooks/useJournalFiltering";
import { Project } from "@/types/journal.ts";

interface JournalFiltersProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  selectedProjectId?: string;
  onProjectChange: (projectId: string) => void;
  projects: Project[];
  dateRange?: {
    start: string | null;
    end: string | null;
  };
  onDateRangeChange?: (range: {
    start: string | null;
    end: string | null;
  }) => void;
}

export const JournalEntryFilters: React.FC<JournalFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  selectedProjectId,
  onProjectChange,
  projects,
  dateRange,
  onDateRangeChange,
}) => {
  const { isHalloweenMode, isDark } = useTheme();

  const filterOptions: DropdownOption[] = [
    { value: "all", label: "All Entries" },
    { value: "today", label: "Today" },
    { value: "this-week", label: "This Week" },
    { value: "this-month", label: "This Month" },
    ...(projects.length > 0 ? [{ value: "project", label: "By Project" }] : []),
  ];

  const sortOptions: DropdownOption[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "title-asc", label: "Title (A-Z)" },
    { value: "title-desc", label: "Title (Z-A)" },
    { value: "mood-desc", label: "Mood (High-Low)" },
    { value: "mood-asc", label: "Mood (Low-High)" },
    { value: "energy-desc", label: "Energy (High-Low)" },
    { value: "energy-asc", label: "Energy (Low-High)" },
  ];

  const projectOptions: DropdownOption[] = projects.map((project) => ({
    value: project.id,
    label: project.name,
  }));

  const handleFilterChange = (value: string) => {
    const filterValue = value as FilterType;
    onFilterChange(filterValue);

    if (filterValue !== "project") {
      onProjectChange("");
    }
  };

  const getSelectedProject = () => {
    return projects.find((p) => p.id === selectedProjectId);
  };

  return (
    <div className="space-y-3 md:space-y-4 p-4 md:p-6">
      {/* Mobile layout */}
      <div className="md:hidden space-y-3">
        {/* Search */}
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : "text-gray-400 dark:text-[#B4B4B8]"
            }`}
          />
          <input
            type="text"
            placeholder="Search entries, tags..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition-colors text-sm ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/50 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6]"
                : "bg-white dark:bg-[rgba(255,255,255,0.05)] border-gray-300 dark:border-[rgba(255,255,255,0.1)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#B4B4B8] focus:border-[#8B5CF6]"
            }`}
          />
        </div>

        {/* Filter and Sort */}
        <div className="grid grid-cols-2 gap-2">
          <Dropdown
            value={filter}
            onValueChange={handleFilterChange}
            options={filterOptions}
            placeholder="Filter"
          />
          <Dropdown
            value={sortBy}
            onValueChange={(value) => onSortChange(value as SortType)}
            options={sortOptions}
            placeholder="Sort"
          />
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
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
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition-colors text-sm ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/50 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6]"
                : "bg-white dark:bg-[rgba(255,255,255,0.05)] border-gray-300 dark:border-[rgba(255,255,255,0.1)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#B4B4B8] focus:border-[#8B5CF6]"
            }`}
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row gap-3 lg:shrink-0">
          <div className="w-full sm:w-40">
            <Dropdown
              value={filter}
              onValueChange={handleFilterChange}
              options={filterOptions}
              placeholder="Filter"
            />
          </div>

          {/* Date Range Calendar */}
          {onDateRangeChange && (
            <div className="w-full sm:w-48">
              <Calendar
                mode="range"
                startDate={dateRange?.start || undefined}
                endDate={dateRange?.end || undefined}
                onStartDateChange={(date) =>
                  onDateRangeChange({
                    start: date,
                    end: dateRange?.end || null,
                  })
                }
                onEndDateChange={(date) =>
                  onDateRangeChange({
                    start: dateRange?.start || null,
                    end: date,
                  })
                }
                onChange={() => {
                  /* no-op */
                }}
                placeholder="Entry Date"
                value=""
              />
            </div>
          )}

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

      {/* Project Dropdown (shown when filter is project) */}
      {filter === "project" && (
        <div className="md:w-40">
          <Dropdown
            value={selectedProjectId}
            onValueChange={onProjectChange}
            options={projectOptions}
            placeholder="Choose project"
          />
        </div>
      )}

      {/* Active Filter Display */}
      {(filter !== "all" || searchTerm) && (
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
          <span
            className={isHalloweenMode ? "text-[#60c9b6]" : "text-[#B4B4B8]"}
          >
            Active filters:
          </span>
          {searchTerm && (
            <span className="px-2 py-1 bg-[rgba(16,185,129,0.2)] text-[#10B981] rounded text-xs">
              "{searchTerm}"
            </span>
          )}
          {filter !== "all" && (
            <span className="px-2 py-1 bg-[rgba(139,92,246,0.2)] text-[#8B5CF6] rounded text-xs">
              {filter === "project" && getSelectedProject()
                ? getSelectedProject()?.name
                : filterOptions.find((opt) => opt.value === filter)?.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
