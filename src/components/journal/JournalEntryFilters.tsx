import { Search } from "lucide-react";
import React from "react";
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
}) => {
  const { isHalloweenMode } = useTheme();

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
    { value: "title", label: "Title A-Z" },
    { value: "mood", label: "Mood (High-Low)" },
    { value: "energy", label: "Energy (High-Low)" },
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
              onValueChange={(value) => onSortChange(value as SortType)}
              options={sortOptions}
              placeholder="Sort by"
            />
          </div>
        </div>
      </div>

      {/* Project Dropdown (only shown when filter is 'project') */}
      {filter === "project" && (
        <div className="md:w-40 md:ml-auto mt-2">
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
        <div className="flex items-center gap-2 text-sm text-[#B4B4B8]">
          <span>Active filters:</span>
          {searchTerm && (
            <span className="px-2 py-1 bg-[rgba(16,185,129,0.2)] text-[#10B981] rounded">
              "{searchTerm}"
            </span>
          )}
          {filter !== "all" && (
            <span className="px-2 py-1 bg-[rgba(139,92,246,0.2)] text-[#8B5CF6] rounded">
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
