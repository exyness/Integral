import { useCallback, useEffect } from "react";
import { formatDurationForTimer, getCurrentDuration } from "@/lib/timeUtils";
import { useTasks } from "./tasks/useTasks";
import { useTimeTracking } from "./tasks/useTimeTracking";

export const useDocumentTitle = () => {
  const { timeEntries } = useTimeTracking();
  const { tasks } = useTasks();

  const runningEntries = timeEntries.filter((entry) => entry.is_running);

  const getTaskById = useCallback(
    (taskId: string) => tasks.find((t) => t.id === taskId),
    [tasks],
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (runningEntries.length > 0) {
      const updateTitle = () => {
        if (runningEntries.length === 1) {
          const entry = runningEntries[0];
          const task = getTaskById(entry.task_id);
          const duration = getCurrentDuration(
            entry.start_time,
            entry.is_paused,
            entry.paused_at,
            entry.total_paused_seconds,
          );
          const timeStr = formatDurationForTimer(duration);
          const status = entry.is_paused ? " (Paused)" : "";
          const taskTitle = task?.title || "Timer";
          document.title = `${timeStr}${status} - ${taskTitle} | Integral`;
        } else {
          const totalDuration = runningEntries.reduce((total, entry) => {
            return (
              total +
              getCurrentDuration(
                entry.start_time,
                entry.is_paused,
                entry.paused_at,
                entry.total_paused_seconds,
              )
            );
          }, 0);
          const timeStr = formatDurationForTimer(totalDuration);
          document.title = `${timeStr} - ${runningEntries.length} Timers | Integral`;
        }
      };

      updateTitle();

      interval = setInterval(updateTitle, 1000);
    } else {
      document.title = "Integral";
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [runningEntries, getTaskById]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && runningEntries.length > 0) {
        setTimeout(() => {
          if (runningEntries.length === 1) {
            const entry = runningEntries[0];
            const task = getTaskById(entry.task_id);
            const duration = getCurrentDuration(
              entry.start_time,
              entry.is_paused,
              entry.paused_at,
              entry.total_paused_seconds,
            );
            const timeStr = formatDurationForTimer(duration);
            const status = entry.is_paused ? " (Paused)" : "";
            const taskTitle = task?.title || "Timer";
            document.title = `${timeStr}${status} - ${taskTitle} | Integral`;
          }
        }, 100);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [runningEntries, getTaskById]);

  return {
    runningTimersCount: runningEntries.length,
    hasRunningTimers: runningEntries.length > 0,
  };
};
