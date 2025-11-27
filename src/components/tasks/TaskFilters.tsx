import { Search } from "lucide-react";
import React from "react";
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
    { value: "created", label: "Sort by Created" },
    { value: "dueDate", label: "Sort by Due Date" },
    { value: "priority", label: "Sort by Priority" },
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

          {/* Sort Dropdown - full width on mobile when project filter exists */}
          <div
            className={
              activeProjects.length > 0 && onProjectFilterChange
                ? "col-span-2"
                : ""
            }
          >
            <Dropdown
              value={sortBy}
              onValueChange={(value) => onSortChange(value as SortType)}
              options={sortOptions}
              placeholder="Sort"
            />
          </div>
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
        <div className="flex flex-col sm:flex-row gap-3 lg:shrink-0">
          {/* Project Filter Dropdown */}
          {activeProjects.length > 0 && onProjectFilterChange && (
            <div className="w-full sm:w-48">
              <Dropdown
                value={projectFilter}
                onValueChange={onProjectFilterChange}
                options={projectOptions}
                placeholder="Filter by project"
              />
            </div>
          )}

          {/* Status Filter Dropdown */}
          <div className="w-full sm:w-40">
            <Dropdown
              value={filter}
              onValueChange={(value) => onFilterChange(value as FilterType)}
              options={filterOptions}
              placeholder="Filter tasks"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-48">
            <Dropdown
              value={sortBy}
              onValueChange={(value) => onSortChange(value as SortType)}
              options={sortOptions}
              placeholder="Sort tasks"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
