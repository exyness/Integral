export const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const isToday = (dateString: string): boolean => {
  return dateString === getTodayDate();
};

export const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day;

  start.setDate(diff);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return { start, end };
};

/**
 * Parse natural language date strings into ISO format (YYYY-MM-DD)
 * Handles: "tomorrow", "next week", "december 5", "dec 5", "in 3 days", etc.
 */
export const parseNaturalDate = (
  dateStr: string | null | undefined,
): string | null => {
  if (!dateStr) return null;

  const str = dateStr.toLowerCase().trim();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Already in ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Tomorrow
  if (str === "tomorrow") {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  // Next week
  if (str === "next week") {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split("T")[0];
  }

  // In X days/weeks/months
  const inMatch = str.match(/^in (\d+) (day|week|month)s?$/);
  if (inMatch) {
    const amount = Number.parseInt(inMatch[1]);
    const unit = inMatch[2];
    const result = new Date(today);

    if (unit === "day") {
      result.setDate(result.getDate() + amount);
    } else if (unit === "week") {
      result.setDate(result.getDate() + amount * 7);
    } else if (unit === "month") {
      result.setMonth(result.getMonth() + amount);
    }

    return result.toISOString().split("T")[0];
  }

  // Month name + day (e.g., "december 5", "dec 5")
  const monthMatch = str.match(
    /^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})$/,
  );
  if (monthMatch) {
    const monthNames: Record<string, number> = {
      january: 0,
      jan: 0,
      february: 1,
      feb: 1,
      march: 2,
      mar: 2,
      april: 3,
      apr: 3,
      may: 4,
      june: 5,
      jun: 5,
      july: 6,
      jul: 6,
      august: 7,
      aug: 7,
      september: 8,
      sep: 8,
      october: 9,
      oct: 9,
      november: 10,
      nov: 10,
      december: 11,
      dec: 11,
    };

    const month = monthNames[monthMatch[1]];
    const day = Number.parseInt(monthMatch[2]);
    const year = today.getFullYear();

    // If the date has passed this year, use next year
    const result = new Date(year, month, day);
    if (result < today) {
      result.setFullYear(year + 1);
    }

    return result.toISOString().split("T")[0];
  }

  // Try native Date parsing as last resort
  try {
    const parsed = new Date(dateStr);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
  } catch (e) {
    // Ignore parsing errors
  }

  return null;
};
