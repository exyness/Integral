import { useMemo } from "react";
import { Journal } from "@/types/journal";

export type FilterType =
  | "all"
  | "today"
  | "this-week"
  | "this-month"
  | "project"
  | "date-range";

export type SortType =
  | "newest"
  | "oldest"
  | "title-asc"
  | "title-desc"
  | "mood-asc"
  | "mood-desc"
  | "energy-asc"
  | "energy-desc";

interface UseJournalFilteringProps {
  entries: Journal[];
  filter: FilterType;
  sortBy: SortType;
  searchTerm: string;
  selectedProjectId?: string;
  dateRange?: {
    start: string | null;
    end: string | null;
  };
}

export const useJournalFiltering = ({
  entries,
  filter,
  sortBy,
  searchTerm,
  selectedProjectId,
  dateRange,
}: UseJournalFilteringProps) => {
  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(search) ||
          entry.content.toLowerCase().includes(search) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(search)) ||
          entry.project?.name.toLowerCase().includes(search),
      );
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Time-based filters
    switch (filter) {
      case "today":
        filtered = filtered.filter((entry) => entry.entry_date === today);
        break;
      case "this-week":
        filtered = filtered.filter((entry) => {
          const entryDate = new Date(entry.entry_date);
          return entryDate >= startOfWeek;
        });
        break;
      case "this-month":
        filtered = filtered.filter((entry) => {
          const entryDate = new Date(entry.entry_date);
          return entryDate >= startOfMonth;
        });
        break;
      case "project":
        if (selectedProjectId) {
          filtered = filtered.filter(
            (entry) => entry.project_id === selectedProjectId,
          );
        }
        break;
      case "all":
      default:
        break;
    }

    // Date range filter - applies independently of other filters
    if (dateRange?.start || dateRange?.end) {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.entry_date);
        const start = dateRange.start ? new Date(dateRange.start) : null;
        const end = dateRange.end ? new Date(dateRange.end) : null;

        if (start && end) {
          return entryDate >= start && entryDate <= end;
        }
        if (start) {
          return entryDate >= start;
        }
        if (end) {
          return entryDate <= end;
        }
        return true;
      });
    }

    return filtered;
  }, [entries, filter, searchTerm, selectedProjectId, dateRange]);

  const sortedEntries = useMemo(() => {
    const sorted = [...filteredEntries];

    switch (sortBy) {
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
      case "title-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "title-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case "mood-asc":
        return sorted.sort((a, b) => {
          const moodA = a.mood || 0;
          const moodB = b.mood || 0;
          return moodA - moodB;
        });
      case "mood-desc":
        return sorted.sort((a, b) => {
          const moodA = a.mood || 0;
          const moodB = b.mood || 0;
          return moodB - moodA;
        });
      case "energy-asc":
        return sorted.sort((a, b) => {
          const energyA = a.energy_level || 0;
          const energyB = b.energy_level || 0;
          return energyA - energyB;
        });
      case "energy-desc":
        return sorted.sort((a, b) => {
          const energyA = a.energy_level || 0;
          const energyB = b.energy_level || 0;
          return energyB - energyA;
        });
      case "newest":
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
    }
  }, [filteredEntries, sortBy]);

  return {
    filteredEntries,
    sortedEntries,
  };
};
