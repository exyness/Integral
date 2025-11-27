import { Activity, BarChart3, Clock, Timer } from "lucide-react";
import React from "react";
import { useTimeCalculations } from "@/hooks/tasks/useTimeCalculations";
import { Task } from "@/types/task";

interface TaskTimeStatsProps {
  task: Task;
}

export const TaskTimeStats: React.FC<TaskTimeStatsProps> = React.memo(
  ({ task }) => {
    const {
      getTaskTimeStats,
      getProjectTimeStats,
      getTaskTimeEntries,
      formatDuration,
    } = useTimeCalculations([task]);

    const timeStats = getTaskTimeStats(task.id);
    const timeEntries = getTaskTimeEntries(task.id);
    const projectStats = task.project
      ? getProjectTimeStats(task.project)
      : null;

    if (timeStats.totalTime === 0) {
      return (
        <div className="text-center py-4 text-[#71717A]">
          <Timer className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No time tracked for this task yet.</p>
          <p className="text-xs mt-1">
            Use the Time Tracker tab to start tracking time.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-3 h-3 text-[#8B5CF6]" />
              <span className="text-xs text-[#B4B4B8]">Total Time</span>
            </div>
            <p className="text-lg font-bold text-[#8B5CF6]">
              {formatDuration(timeStats.totalTime)}
            </p>
          </div>

          <div className="bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Activity className="w-3 h-3 text-[#3B82F6]" />
              <span className="text-xs text-[#B4B4B8]">Sessions</span>
            </div>
            <p className="text-lg font-bold text-[#3B82F6]">
              {timeStats.sessionCount}
            </p>
          </div>
        </div>

        {timeStats.sessionCount > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <BarChart3 className="w-3 h-3 text-[#10B981]" />
                <span className="text-xs text-[#B4B4B8]">Avg Session</span>
              </div>
              <p className="text-lg font-bold text-[#10B981]">
                {formatDuration(Math.round(timeStats.averageSession))}
              </p>
            </div>

            <div className="bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Timer className="w-3 h-3 text-[#F59E0B]" />
                <span className="text-xs text-[#B4B4B8]">Status</span>
              </div>
              <p className="text-sm font-medium text-[#F59E0B]">
                {timeStats.isActive ? "● Active" : "Inactive"}
              </p>
            </div>
          </div>
        )}

        {timeStats.lastWorked && (
          <div className="flex items-center space-x-3 text-sm">
            <Clock className="w-3 h-3 text-[#71717A]" />
            <span className="text-[#B4B4B8]">Last worked:</span>
            <span className="text-white">
              {new Date(timeStats.lastWorked).toLocaleDateString()} at{" "}
              {new Date(timeStats.lastWorked).toLocaleTimeString()}
            </span>
          </div>
        )}

        {task.project && projectStats && (
          <div className="border-t border-[rgba(255,255,255,0.1)] pt-3 mt-3">
            <h5 className="text-sm font-medium text-[#B4B4B8] mb-2">
              Project: {task.project}
            </h5>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-[#71717A]">
                Total project time:{" "}
                <span className="text-[#8B5CF6] font-medium">
                  {formatDuration(projectStats.totalTime)}
                </span>
              </span>
              <span className="text-[#71717A]">
                Sessions:{" "}
                <span className="text-[#3B82F6] font-medium">
                  {projectStats.sessionCount}
                </span>
              </span>
            </div>
          </div>
        )}

        {timeEntries.length > 0 && (
          <div className="border-t border-[rgba(255,255,255,0.1)] pt-3 mt-3">
            <h5 className="text-sm font-medium text-[#B4B4B8] mb-2">
              Recent Sessions ({timeEntries.length})
            </h5>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {timeEntries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-xs bg-[rgba(255,255,255,0.02)] rounded p-2"
                >
                  <div className="flex items-center space-x-2">
                    {entry.is_running ? (
                      <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 bg-[#71717A] rounded-full" />
                    )}
                    <span className="text-[#B4B4B8]">
                      {new Date(entry.start_time).toLocaleDateString()}
                    </span>
                    {entry.description && (
                      <span className="text-[#71717A]">
                        - {entry.description}
                      </span>
                    )}
                  </div>
                  <span className="text-white font-mono">
                    {entry.is_running
                      ? formatDuration(
                          Math.floor(
                            (Date.now() -
                              new Date(entry.start_time).getTime()) /
                              1000,
                          ),
                        )
                      : formatDuration(entry.duration_seconds || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);

TaskTimeStats.displayName = "TaskTimeStats";
