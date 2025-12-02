/**
 * Temporal query detection and date extraction utilities for RAG enhancement
 */

export interface TemporalIntent {
  type:
    | "today"
    | "tomorrow"
    | "yesterday"
    | "this_week"
    | "next_week"
    | "last_week"
    | "this_month"
    | "next_month"
    | "last_month"
    | "date_range"
    | "none";
  startDate: Date | null;
  endDate: Date | null;
  originalQuery: string;
  cleanedQuery: string; // Query with temporal keywords removed
}

/**
 * Extract temporal intent from a natural language query
 */
export function extractTemporalIntent(query: string): TemporalIntent {
  const lowerQuery = query.toLowerCase();
  const now = new Date();

  // Helper to get start and end of day
  const startOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const endOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  // Today
  if (lowerQuery.match(/\b(today|tonight)\b/)) {
    return {
      type: "today",
      startDate: startOfDay(now),
      endDate: endOfDay(now),
      originalQuery: query,
      cleanedQuery: query.replace(/\b(today|tonight)\b/gi, "").trim(),
    };
  }

  // Tomorrow
  if (lowerQuery.match(/\btomorrow\b/)) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      type: "tomorrow",
      startDate: startOfDay(tomorrow),
      endDate: endOfDay(tomorrow),
      originalQuery: query,
      cleanedQuery: query.replace(/\btomorrow\b/gi, "").trim(),
    };
  }

  // Yesterday
  if (lowerQuery.match(/\byesterday\b/)) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      type: "yesterday",
      startDate: startOfDay(yesterday),
      endDate: endOfDay(yesterday),
      originalQuery: query,
      cleanedQuery: query.replace(/\byesterday\b/gi, "").trim(),
    };
  }

  // This week
  if (lowerQuery.match(/\bthis week\b/)) {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    return {
      type: "this_week",
      startDate: startOfDay(startOfWeek),
      endDate: endOfDay(endOfWeek),
      originalQuery: query,
      cleanedQuery: query.replace(/\bthis week\b/gi, "").trim(),
    };
  }

  // Next week
  if (lowerQuery.match(/\bnext week\b/)) {
    const startOfNextWeek = new Date(now);
    startOfNextWeek.setDate(
      startOfNextWeek.getDate() - startOfNextWeek.getDay() + 7,
    );
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(endOfNextWeek.getDate() + 6);

    return {
      type: "next_week",
      startDate: startOfDay(startOfNextWeek),
      endDate: endOfDay(endOfNextWeek),
      originalQuery: query,
      cleanedQuery: query.replace(/\bnext week\b/gi, "").trim(),
    };
  }

  // Last week
  if (lowerQuery.match(/\blast week\b/)) {
    const startOfLastWeek = new Date(now);
    startOfLastWeek.setDate(
      startOfLastWeek.getDate() - startOfLastWeek.getDay() - 7,
    );
    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);

    return {
      type: "last_week",
      startDate: startOfDay(startOfLastWeek),
      endDate: endOfDay(endOfLastWeek),
      originalQuery: query,
      cleanedQuery: query.replace(/\blast week\b/gi, "").trim(),
    };
  }

  // This month
  if (lowerQuery.match(/\bthis month\b/)) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      type: "this_month",
      startDate: startOfDay(startOfMonth),
      endDate: endOfDay(endOfMonth),
      originalQuery: query,
      cleanedQuery: query.replace(/\bthis month\b/gi, "").trim(),
    };
  }

  // Next month
  if (lowerQuery.match(/\bnext month\b/)) {
    const nextMonth = now.getMonth() + 1;
    const year = nextMonth > 11 ? now.getFullYear() + 1 : now.getFullYear();
    const month = nextMonth > 11 ? 0 : nextMonth;

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    return {
      type: "next_month",
      startDate: startOfDay(startOfMonth),
      endDate: endOfDay(endOfMonth),
      originalQuery: query,
      cleanedQuery: query.replace(/\bnext month\b/gi, "").trim(),
    };
  }

  // Last month
  if (lowerQuery.match(/\blast month\b/)) {
    const lastMonth = now.getMonth() - 1;
    const year = lastMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = lastMonth < 0 ? 11 : lastMonth;

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    return {
      type: "last_month",
      startDate: startOfDay(startOfMonth),
      endDate: endOfDay(endOfMonth),
      originalQuery: query,
      cleanedQuery: query.replace(/\blast month\b/gi, "").trim(),
    };
  }

  // No temporal intent detected
  return {
    type: "none",
    startDate: null,
    endDate: null,
    originalQuery: query,
    cleanedQuery: query,
  };
}

/**
 * Format a date range for display in prompts
 */
export function formatDateRange(
  startDate: Date | null,
  endDate: Date | null,
): string {
  if (!startDate || !endDate) return "";

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  if (startDate.toDateString() === endDate.toDateString()) {
    return formatDate(startDate);
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}
