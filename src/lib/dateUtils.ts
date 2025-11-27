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
