import { AnimatePresence, motion } from "framer-motion";
import { Calendar, X } from "lucide-react";
import React from "react";
import { pumpkinScary, treeSceneryCurly } from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import { Task } from "@/types/task";

interface DayTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export const DayTasksModal: React.FC<DayTasksModalProps> = ({
  isOpen,
  onClose,
  date,
  tasks,
  onTaskClick,
}) => {
  const { isDark, isHalloweenMode } = useTheme();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#71717A";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return "None";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4"
            onClick={onClose}
          >
            <div
              className={`w-full max-w-2xl max-h-[85vh] md:max-h-[80vh] overflow-hidden rounded-xl relative ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border border-[#60c9b6]/30 shadow-[0_0_15px_rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[#1A1A1A] border border-[rgba(255,255,255,0.1)]"
                    : "bg-white border border-gray-200"
              } shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {isHalloweenMode && (
                <>
                  <div className="absolute -bottom-10 -left-10 pointer-events-none z-0">
                    <img
                      src={pumpkinScary}
                      alt=""
                      className="w-32 h-32 md:w-48 md:h-48 opacity-10"
                    />
                  </div>
                  <div className="absolute -top-10 -right-10 pointer-events-none z-0">
                    <img
                      src={treeSceneryCurly}
                      alt=""
                      className="w-32 h-32 md:w-48 md:h-48 opacity-10"
                    />
                  </div>
                </>
              )}
              {/* Header */}
              <div
                className={`p-4 md:p-6 border-b relative z-10 ${
                  isHalloweenMode
                    ? "border-[#60c9b6]/20"
                    : isDark
                      ? "border-[rgba(255,255,255,0.1)]"
                      : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                    <Calendar
                      className={`w-5 h-5 md:w-6 md:h-6 shrink-0 ${
                        isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <h2
                        className={`text-sm md:text-xl font-semibold ${
                          isHalloweenMode
                            ? "text-[#60c9b6] font-creepster tracking-wider"
                            : isDark
                              ? "text-white"
                              : "text-gray-900"
                        }`}
                      >
                        Tasks for {formatDate(date)}
                      </h2>
                      <p
                        className={`text-xs md:text-sm ${
                          isHalloweenMode
                            ? "text-[#60c9b6]/70"
                            : isDark
                              ? "text-[#B4B4B8]"
                              : "text-gray-600"
                        }`}
                      >
                        {tasks.length} task{tasks.length !== 1 ? "s" : ""}{" "}
                        scheduled
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className={`p-1.5 md:p-2 rounded-lg transition-colors shrink-0 ml-2 ${
                      isHalloweenMode
                        ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                        : isDark
                          ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.1)]"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(85vh-120px)] md:max-h-[60vh] scrollbar-hide relative z-10">
                {tasks.length === 0 ? (
                  <div className="text-center py-6 md:py-8">
                    <Calendar
                      className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 ${
                        isDark ? "text-[#6B7280]" : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`text-base md:text-lg font-medium ${
                        isHalloweenMode
                          ? "text-[#60c9b6]"
                          : isDark
                            ? "text-[#B4B4B8]"
                            : "text-gray-600"
                      }`}
                    >
                      No tasks scheduled for this day
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-3">
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        className={`p-2.5 md:p-3 rounded-lg cursor-pointer transition-all ${
                          task.completed
                            ? "bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.15)]"
                            : isHalloweenMode
                              ? "bg-[#1a1a1f] border border-[#60c9b6]/20 hover:bg-[#60c9b6]/10 hover:border-[#60c9b6]/50"
                              : isDark
                                ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.08)]"
                                : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                        }`}
                        onClick={() => {
                          onTaskClick?.(task);
                          onClose();
                        }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.1 }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start space-x-2 md:space-x-3 flex-1 min-w-0">
                            <div
                              className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shrink-0 mt-0.5 md:mt-1"
                              style={{
                                backgroundColor: task.completed
                                  ? "#10B981"
                                  : getPriorityColor(task.priority),
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4
                                className={`text-sm md:text-base font-medium wrap-break-word ${
                                  task.completed
                                    ? "line-through text-[#10B981]"
                                    : isHalloweenMode
                                      ? "text-[#60c9b6]"
                                      : isDark
                                        ? "text-white"
                                        : "text-gray-900"
                                }`}
                              >
                                {task.title}
                              </h4>
                              {task.description && (
                                <p
                                  className={`text-xs md:text-sm mt-0.5 md:mt-1 wrap-break-word ${
                                    task.completed
                                      ? "line-through text-[#6EE7B7]"
                                      : isHalloweenMode
                                        ? "text-[#60c9b6]/70"
                                        : isDark
                                          ? "text-[#B4B4B8]"
                                          : "text-gray-600"
                                  }`}
                                >
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center shrink-0">
                            <span
                              className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-medium whitespace-nowrap ${
                                task.completed
                                  ? "bg-[rgba(16,185,129,0.2)] text-[#10B981]"
                                  : task.priority === "high"
                                    ? "bg-[rgba(239,68,68,0.2)] text-[#EF4444]"
                                    : task.priority === "medium"
                                      ? "bg-[rgba(245,158,11,0.2)] text-[#F59E0B]"
                                      : "bg-[rgba(16,185,129,0.2)] text-[#10B981]"
                              }`}
                            >
                              {task.completed
                                ? "Done"
                                : getPriorityLabel(task.priority)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
