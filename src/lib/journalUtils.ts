import { getTodayDate } from "@/lib/dateUtils";
import { Journal } from "@/types/journal";

export const createEntriesByDateMap = (
  entries: Journal[],
): Record<string, Journal> => {
  return entries.reduce(
    (acc, entry) => {
      acc[entry.entry_date] = entry;
      return acc;
    },
    {} as Record<string, Journal>,
  );
};

export const getTodayEntry = (entries: Journal[]): Journal | undefined => {
  const today = getTodayDate();
  return entries.find((entry) => entry.entry_date === today);
};

export const getEntryByDate = (
  entries: Journal[],
  date: string,
): Journal | undefined => {
  return entries.find((entry) => entry.entry_date === date);
};

export const sortEntriesByDate = (
  entries: Journal[],
  ascending = false,
): Journal[] => {
  return [...entries].sort((a, b) => {
    const dateA = new Date(a.entry_date);
    const dateB = new Date(b.entry_date);
    return ascending
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });
};

export const filterEntriesByMonth = (
  entries: Journal[],
  year: number,
  month: number,
): Journal[] => {
  return entries.filter((entry) => {
    const entryDate = new Date(entry.entry_date);
    return entryDate.getFullYear() === year && entryDate.getMonth() === month;
  });
};

export const getMoodEmoji = (mood?: number | null): string | null => {
  if (!mood || mood < 1 || mood > 5) return null;
  const moodEmojis = ["😞", "😕", "😐", "😊", "😄"];
  return moodEmojis[mood - 1];
};
