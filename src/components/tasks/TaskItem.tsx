import {
  Calendar,
  CheckCircle,
  CheckSquare,
  Circle,
  Clock,
  Flag,
  Folder,
  Skull,
  Trash,
  User,
} from "lucide-react";
import React, { memo, useMemo } from "react";
import { PRIORITY_COLORS } from "@/constants/taskConstants";
import { useTheme } from "@/contexts/ThemeContext";
import { useTimeCalculations } from "@/hooks/tasks/useTimeCalculations";
import { Task } from "@/types/task";

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = memo(
  ({ task, isSelected, onSelect, onToggle, onDelete, onClick }) => {
    const { isDark, isHalloweenMode } = useTheme();
    const { getTaskTimeStats, formatDuration } = useTimeCalculations([task]);

    const timeStats = useMemo(
      () => getTaskTimeStats(task.id),
      [getTaskTimeStats, task.id],
    );

    const priorityColor = useMemo(() => {
      return (
        PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] ||
        "#71717A"
      );
    }, [task.priority]);

    const isOverdue = useMemo(() => {
      if (!task.due_date || task.completed) return false;
      const dueDate = new Date(task.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate < today;
    }, [task.due_date, task.completed]);

    return (
      <div
        className={`p-3 md:p-4 transition-colors rounded-lg ${
          isHalloweenMode
            ? "hover:bg-[#60c9b6]/10 border border-transparent hover:border-[#60c9b6]/30"
            : isDark
              ? "hover:bg-[rgba(255,255,255,0.02)]"
              : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-start md:items-center rounded-md space-x-2 md:space-x-4">
          <button
            onClick={onSelect}
            className="shrink-0 cursor-pointer mt-0.5 md:mt-0"
          >
            {isSelected ? (
              <CheckSquare
                className={`w-4 h-4 ${
                  isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"
                }`}
              />
            ) : (
              <div
                className={`w-4 h-4 border rounded transition-colors ${
                  isHalloweenMode
                    ? "border-[#60c9b6]/50 hover:border-[#60c9b6]"
                    : isDark
                      ? "border-[rgba(255,255,255,0.3)] hover:border-[#8B5CF6]"
                      : "border-gray-300 hover:border-[#8B5CF6]"
                }`}
              />
            )}
          </button>

          <button
            onClick={onToggle}
            className="shrink-0 cursor-pointer mt-0.5 md:mt-0"
          >
            {task.completed ? (
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
            ) : (
              <Circle
                className={`w-5 h-5 transition-colors ${
                  isDark
                    ? "text-[#71717A] hover:text-[#B4B4B8]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              />
            )}
          </button>

          <div
            className="w-1 h-8 rounded-full shrink-0 hidden md:block"
            style={{ backgroundColor: priorityColor }}
          />

          <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-3 mb-1 gap-1 md:gap-0">
              <h3
                className={`font-medium transition-colors text-sm md:text-base ${
                  isHalloweenMode
                    ? task.completed
                      ? "text-[#60c9b6]/50 line-through font-creepster tracking-wide"
                      : "text-[#60c9b6] font-creepster tracking-wide hover:text-[#4db8a5]"
                    : task.completed
                      ? isDark
                        ? "text-[#71717A] line-through hover:text-[#8B5CF6]"
                        : "text-gray-500 line-through hover:text-[#8B5CF6]"
                      : isDark
                        ? "text-white hover:text-[#8B5CF6]"
                        : "text-gray-900 hover:text-[#8B5CF6]"
                }`}
              >
                {task.title}
              </h3>
              <div className="flex items-center gap-2">
                {isOverdue && (
                  <span
                    className={`flex items-center gap-x-1.5 px-2 py-0.5 text-xs rounded w-fit ${
                      isHalloweenMode
                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Overdue</span>
                  </span>
                )}
                {task.project && (
                  <span
                    className={`flex items-center gap-x-1.5 px-2 py-0.5 text-xs rounded w-fit ${
                      isHalloweenMode
                        ? "bg-[#60c9b6]/10 text-[#60c9b6]"
                        : "bg-[rgba(139,92,246,0.2)] text-[#A855F7]"
                    }`}
                  >
                    <Folder className="w-3 h-3" />
                    <span>{task.project}</span>
                  </span>
                )}
              </div>
            </div>

            {task.description && (
              <p
                className={`text-xs md:text-sm mb-2 line-clamp-2 md:line-clamp-none ${
                  isDark ? "text-[#B4B4B8]" : "text-gray-600"
                }`}
              >
                {task.description}
              </p>
            )}

            <div
              className={`flex flex-wrap items-center gap-2 md:gap-4 text-xs ${
                isDark ? "text-[#71717A]" : "text-gray-500"
              }`}
            >
              {task.due_date && (
                <div className="hidden md:flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Due {task.due_date}</span>
                </div>
              )}
              {task.assignee && (
                <div className="hidden md:flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{task.assignee}</span>
                </div>
              )}
              <div className="hidden md:flex items-center space-x-1">
                <Flag className="w-3 h-3" style={{ color: priorityColor }} />
                <span className="capitalize">{task.priority}</span>
              </div>
              {timeStats.totalTime > 0 && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-[#8B5CF6]" />
                  <span className="text-[#8B5CF6]">
                    {formatDuration(timeStats.totalTime)}
                  </span>
                  {timeStats.isActive && (
                    <span className="text-[#10B981]">●</span>
                  )}
                </div>
              )}
            </div>

            {task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.labels.map((label, index) => {
                  if (label.toLowerCase() === "resurrected") {
                    return (
                      <span
                        key={index}
                        className={`flex items-center gap-1 px-2 py-1 text-xs rounded font-medium border ${
                          isHalloweenMode
                            ? "bg-[#60c9b6]/20 text-[#60c9b6] border-[#60c9b6]/30"
                            : "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800"
                        }`}
                      >
                        <Skull className="w-3 h-3" />
                        Resurrected
                      </span>
                    );
                  }
                  return (
                    <span
                      key={index}
                      className={`px-2 py-1 text-xs rounded ${
                        isDark
                          ? "bg-[rgba(255,255,255,0.05)] text-[#B4B4B8]"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={onDelete}
            className={`shrink-0 p-2 md:p-4 rounded-lg transition-colors cursor-pointer ${
              isDark ? "hover:bg-[rgba(255,255,255,0.05)]" : "hover:bg-red-50"
            }`}
          >
            <Trash className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    );
  },
);
