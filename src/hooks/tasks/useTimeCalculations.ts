import { useCallback, useMemo } from "react";
import { formatDetailedDuration, formatDurationCompact } from "@/lib/timeUtils";
import { Task } from "@/types/task";
import { useTimeTracking } from "./useTimeTracking";

export const useTimeCalculations = (tasks: Task[]) => {
  const { timeEntries } = useTimeTracking();

  const timeStats = useMemo(() => {
    const taskTimeMap = new Map<
      string,
      {
        totalTime: number;
        sessionCount: number;
        averageSession: number;
        lastWorked: string | null;
        isActive: boolean;
      }
    >();

    const projectTimeMap = new Map<
      string,
      {
        totalTime: number;
        taskCount: number;
        sessionCount: number;
      }
    >();

    timeEntries.forEach((entry) => {
      const task = tasks.find((t) => t.id === entry.task_id);
      if (!task) return;

      const duration = entry.duration_seconds || 0;
      const taskId = entry.task_id;
      const projectName = task.project || "No Project";

      const existing = taskTimeMap.get(taskId) || {
        totalTime: 0,
        sessionCount: 0,
        averageSession: 0,
        lastWorked: null,
        isActive: false,
      };

      taskTimeMap.set(taskId, {
        totalTime: existing.totalTime + duration,
        sessionCount: existing.sessionCount + 1,
        averageSession:
          (existing.totalTime + duration) / (existing.sessionCount + 1),
        lastWorked:
          entry.start_time > (existing.lastWorked || "")
            ? entry.start_time
            : existing.lastWorked,
        isActive: entry.is_running || existing.isActive,
      });

      const projectExisting = projectTimeMap.get(projectName) || {
        totalTime: 0,
        taskCount: 0,
        sessionCount: 0,
      };

      projectTimeMap.set(projectName, {
        totalTime: projectExisting.totalTime + duration,
        taskCount:
          projectExisting.taskCount + (projectExisting.taskCount === 0 ? 1 : 0),
        sessionCount: projectExisting.sessionCount + 1,
      });
    });

    return {
      taskTimeMap,
      projectTimeMap,
    };
  }, [timeEntries, tasks]);

  const getTaskTimeStats = useCallback(
    (taskId: string) => {
      return (
        timeStats.taskTimeMap.get(taskId) || {
          totalTime: 0,
          sessionCount: 0,
          averageSession: 0,
          lastWorked: null,
          isActive: false,
        }
      );
    },
    [timeStats.taskTimeMap],
  );

  const getProjectTimeStats = useCallback(
    (projectName: string) => {
      return (
        timeStats.projectTimeMap.get(projectName || "No Project") || {
          totalTime: 0,
          taskCount: 0,
          sessionCount: 0,
        }
      );
    },
    [timeStats.projectTimeMap],
  );

  const getTaskTimeEntries = useCallback(
    (taskId: string) => {
      return timeEntries.filter((entry) => entry.task_id === taskId);
    },
    [timeEntries],
  );

  const formatDuration = useCallback((seconds: number): string => {
    return formatDurationCompact(seconds);
  }, []);

  const formatDetailedDurationWrapper = useCallback(
    (seconds: number): string => {
      return formatDetailedDuration(seconds);
    },
    [],
  );

  const getTotalTimeToday = useCallback(() => {
    try {
      const today = new Date().toDateString();
      return timeEntries
        .filter((entry) => {
          try {
            return new Date(entry.start_time).toDateString() === today;
          } catch {
            return false;
          }
        })
        .reduce((total, entry) => {
          if (entry.is_running) {
            try {
              const duration = Math.floor(
                (Date.now() - new Date(entry.start_time).getTime()) / 1000,
              );
              return total + Math.max(0, duration);
            } catch {
              return total;
            }
          }
          return total + (entry.duration_seconds || 0);
        }, 0);
    } catch (error) {
      console.error("Error calculating today time:", error);
      return 0;
    }
  }, [timeEntries]);

  const getTotalTimeThisWeek = useCallback(() => {
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      return timeEntries
        .filter((entry) => {
          try {
            return new Date(entry.start_time) >= weekStart;
          } catch {
            return false;
          }
        })
        .reduce((total, entry) => {
          if (entry.is_running) {
            try {
              const duration = Math.floor(
                (Date.now() - new Date(entry.start_time).getTime()) / 1000,
              );
              return total + Math.max(0, duration);
            } catch {
              return total;
            }
          }
          return total + (entry.duration_seconds || 0);
        }, 0);
    } catch (error) {
      console.error("Error calculating week time:", error);
      return 0;
    }
  }, [timeEntries]);

  return {
    getTaskTimeStats,
    getProjectTimeStats,
    getTaskTimeEntries,
    formatDuration,
    formatDetailedDuration: formatDetailedDurationWrapper,
    getTotalTimeToday,
    getTotalTimeThisWeek,
    timeStats,
  };
};
