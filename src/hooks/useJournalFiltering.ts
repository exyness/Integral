import { useMemo } from "react";
import { Journal } from "@/types/journal";

export type FilterType =
  | "all"
  | "today"
  | "this-week"
  | "this-month"
  | "project";
export type SortType = "newest" | "oldest" | "title" | "mood" | "energy";

interface UseJournalFilteringProps {
  entries: Journal[];
  filter: FilterType;
  sortBy: SortType;
  searchTerm: string;
  selectedProjectId?: string;
}

export const useJournalFiltering = ({
  entries,
  filter,
  sortBy,
  searchTerm,
  selectedProjectId,
}: UseJournalFilteringProps) => {
  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

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

    return filtered;
  }, [entries, filter, searchTerm, selectedProjectId]);

  const sortedEntries = useMemo(() => {
    const sorted = [...filteredEntries];

    switch (sortBy) {
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "mood":
        return sorted.sort((a, b) => {
          const moodA = a.mood || 0;
          const moodB = b.mood || 0;
          return moodB - moodA;
        });
      case "energy":
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
