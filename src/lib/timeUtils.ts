export type TimeUnit = "seconds" | "minutes" | "hours" | "days";
export type DurationFormat = "compact" | "detailed" | "timer" | "standard";

const validateSeconds = (seconds: number | null | undefined): number => {
  if (
    seconds == null ||
    typeof seconds !== "number" ||
    isNaN(seconds) ||
    seconds < 0
  ) {
    return 0;
  }
  return Math.floor(seconds);
};

const getTimeComponents = (seconds: number) => {
  const validSeconds = validateSeconds(seconds);
  return {
    hours: Math.floor(validSeconds / 3600),
    minutes: Math.floor((validSeconds % 3600) / 60),
    secs: validSeconds % 60,
    totalSeconds: validSeconds,
  };
};

export const formatDurationCompact = (seconds: number): string => {
  const { hours, minutes, totalSeconds } = getTimeComponents(seconds);

  if (totalSeconds === 0) return "0m";
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const formatDurationForTimer = (seconds: number): string => {
  const { hours, minutes, secs } = getTimeComponents(seconds);

  return [hours, minutes, secs]
    .map((unit) => unit.toString().padStart(2, "0"))
    .join(":");
};

export const getCurrentDuration = (
  startTime: string,
  isPaused?: boolean,
  pausedAt?: string | null,
  totalPausedSeconds?: number | null,
): number => {
  try {
    const start = new Date(startTime).getTime();
    if (isNaN(start)) return 0;

    let totalElapsed = Math.max(0, Math.floor((Date.now() - start) / 1000));

    if (totalPausedSeconds) {
      totalElapsed -= totalPausedSeconds;
    }

    if (isPaused && pausedAt) {
      const pauseStart = new Date(pausedAt).getTime();
      if (!isNaN(pauseStart)) {
        const currentPauseDuration = Math.floor(
          (Date.now() - pauseStart) / 1000,
        );
        totalElapsed -= currentPauseDuration;
      }
    }

    return Math.max(0, totalElapsed);
  } catch {
    return 0;
  }
};

export const formatDuration = (seconds: number): string => {
  const { hours, minutes, secs, totalSeconds } = getTimeComponents(seconds);

  if (totalSeconds === 0) return "0s";

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export const formatDetailedDuration = (seconds: number): string => {
  const { hours, minutes, secs, totalSeconds } = getTimeComponents(seconds);

  if (totalSeconds === 0) return "0 minutes";

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  }
  if (secs > 0 && hours === 0) {
    parts.push(`${secs} second${secs !== 1 ? "s" : ""}`);
  }

  return parts.join(", ");
};

export const isToday = (dateString: string): boolean => {
  try {
    return new Date(dateString).toDateString() === new Date().toDateString();
  } catch {
    return false;
  }
};

export const isThisWeek = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    return date >= weekStart;
  } catch {
    return false;
  }
};

const formatCache = new Map<string, string>();
const CACHE_SIZE_LIMIT = 100;

export const formatDurationCached = (
  seconds: number,
  format: DurationFormat = "standard",
): string => {
  const cacheKey = `${seconds}-${format}`;

  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey)!;
  }

  let result: string;
  switch (format) {
    case "compact":
      result = formatDurationCompact(seconds);
      break;
    case "timer":
      result = formatDurationForTimer(seconds);
      break;
    case "detailed":
      result = formatDetailedDuration(seconds);
      break;
    default:
      result = formatDuration(seconds);
  }

  if (formatCache.size >= CACHE_SIZE_LIMIT) {
    const firstKey = formatCache.keys().next().value;
    formatCache.delete(firstKey);
  }

  formatCache.set(cacheKey, result);
  return result;
};
