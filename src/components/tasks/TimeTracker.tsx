import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Edit2,
  Edit3,
  Pause,
  Play,
  RadioTower,
  Save,
  Search,
  Square,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import {
  batGlide,
  bgWitchGraveyard,
  candleTrio,
  cardCatFence,
  skullStaring,
  spiderHairyCrawling,
  webCornerLeft,
  witchBrew,
} from "@/assets";
import { GlassCard } from "@/components/GlassCard";
import { ComboBox } from "@/components/ui/ComboBox";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Dropdown } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
import { useTheme } from "@/contexts/ThemeContext";
import { useTimeCalculations } from "@/hooks/tasks/useTimeCalculations";
import { useTimeTracking } from "@/hooks/tasks/useTimeTracking";
import { useArchivedProjects } from "@/hooks/useArchivedProjects";
import { formatDurationForTimer, getCurrentDuration } from "@/lib/timeUtils";
import { Task } from "@/types/task";
import { TimeStats } from "./TimeStats";

interface TimeTrackerProps {
  tasks: Task[];
}

const LoadingSkeleton = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <GlassCard key={i} className="p-6">
            <div className="animate-pulse">
              <div
                className={`h-4 rounded w-1/2 mb-2 ${
                  isDark ? "bg-gray-700" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`h-8 rounded w-3/4 ${
                  isDark ? "bg-gray-700" : "bg-gray-300"
                }`}
              ></div>
            </div>
          </GlassCard>
        ))}
      </div>
      <GlassCard className="p-6">
        <div className="animate-pulse">
          <div
            className={`h-6 rounded w-1/3 mb-4 ${
              isDark ? "bg-gray-700" : "bg-gray-300"
            }`}
          ></div>
          <div className="space-y-3">
            <div
              className={`h-4 rounded ${
                isDark ? "bg-gray-700" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`h-4 rounded w-5/6 ${
                isDark ? "bg-gray-700" : "bg-gray-300"
              }`}
            ></div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export const TimeTracker: React.FC<TimeTrackerProps> = ({ tasks }) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { isArchived } = useArchivedProjects();

  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const {
    timeEntries,
    loading,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    updateTimeEntry,
    deleteTimeEntry,
    loadMore,
    hasMore,
  } = useTimeTracking();

  const runningEntries = useMemo(
    () => timeEntries.filter((entry) => entry.is_running),
    [timeEntries],
  );

  const [selectedTask, setSelectedTask] = useState<string>("");
  const [description, setDescription] = useState("");
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [filterPeriod, setFilterPeriod] = useState<
    "today" | "week" | "month" | "all"
  >("week");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newTimerProjectFilter, setNewTimerProjectFilter] =
    useState<string>("all");

  const [entryToDelete, setEntryToDelete] = useState<{
    id: string;
    taskTitle: string;
    description: string;
    duration: number;
  } | null>(null);

  const { formatDuration, getTotalTimeToday, getTotalTimeThisWeek } =
    useTimeCalculations(tasks);

  const [, forceUpdate] = useState({});

  const activeTasks = useMemo(
    () => tasks.filter((task) => !task.completed),
    [tasks],
  );

  const timeStats = useMemo(() => {
    try {
      return {
        todayTime: getTotalTimeToday(),
        weekTime: getTotalTimeThisWeek(),
      };
    } catch (error) {
      console.error("Error calculating time stats:", error);
      return { todayTime: 0, weekTime: 0 };
    }
  }, [getTotalTimeToday, getTotalTimeThisWeek]);

  const activeSessions = useMemo(() => {
    return timeEntries.filter((entry) => entry.is_running === true);
  }, [timeEntries]);

  const completedSessions = useMemo(() => {
    return timeEntries.filter((entry) => entry.is_running === false);
  }, [timeEntries]);

  const getTaskById = useCallback(
    (taskId: string) => tasks.find((t) => t.id === taskId),
    [tasks],
  );

  const availableProjects = useMemo(() => {
    const projects = new Set<string>();
    tasks.forEach((task) => {
      if (task.project && !isArchived(task.project)) {
        projects.add(task.project);
      }
    });
    return Array.from(projects).sort();
  }, [tasks, isArchived]);

  const filteredTimeEntries = useMemo(() => {
    let filtered = activeTab === "active" ? activeSessions : completedSessions;

    if (filterPeriod !== "all") {
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.created_at);
        switch (filterPeriod) {
          case "today":
            return entryDate >= startOfToday;
          case "week":
            return entryDate >= startOfWeek;
          case "month":
            return entryDate >= startOfMonth;
          default:
            return true;
        }
      });
    }

    if (selectedProject) {
      filtered = filtered.filter((entry) => {
        const task = getTaskById(entry.task_id);
        return task?.project === selectedProject;
      });
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((entry) => {
        const task = getTaskById(entry.task_id);
        const taskTitle = task?.title?.toLowerCase() || "";
        const taskProject = task?.project?.toLowerCase() || "";
        const entryDescription = entry.description?.toLowerCase() || "";

        return (
          taskTitle.includes(searchLower) ||
          taskProject.includes(searchLower) ||
          entryDescription.includes(searchLower)
        );
      });
    }

    return filtered;
  }, [
    activeSessions,
    completedSessions,
    filterPeriod,
    activeTab,
    searchTerm,
    selectedProject,
    getTaskById,
  ]);

  const filteredTotalTime = useMemo(() => {
    return filteredTimeEntries.reduce((total, entry) => {
      if (entry.is_running) {
        return (
          total +
          getCurrentDuration(
            entry.start_time,
            entry.is_paused,
            entry.paused_at,
            entry.total_paused_seconds,
          )
        );
      }
      return total + (entry.duration_seconds || 0);
    }, 0);
  }, [filteredTimeEntries]);

  const handleStartTimer = useCallback(
    async (taskId: string) => {
      try {
        await startTimer(taskId, description);
        setDescription("");
        setSelectedTask("");
      } catch (error) {
        /* empty */
      }
    },
    [startTimer, description],
  );

  const handleStopTimer = useCallback(
    async (entryId: string) => {
      try {
        await stopTimer(entryId);
      } catch (error) {
        /* empty */
      }
    },
    [stopTimer],
  );

  const handleDeleteEntry = useCallback(async () => {
    if (entryToDelete) {
      try {
        await deleteTimeEntry(entryToDelete.id);
        setEntryToDelete(null);
      } catch (error) {
        /* empty */
      }
    }
  }, [deleteTimeEntry, entryToDelete]);

  const handlePauseTimer = useCallback(
    async (entryId: string) => {
      try {
        await pauseTimer(entryId);
      } catch (error) {
        /* empty */
      }
    },
    [pauseTimer],
  );

  const handleResumeTimer = useCallback(
    async (entryId: string) => {
      try {
        await resumeTimer(entryId);
      } catch (error) {
        /* empty */
      }
    },
    [resumeTimer],
  );

  const handleUpdateDescription = useCallback(
    async (entryId: string, newDescription: string) => {
      try {
        await updateTimeEntry(entryId, { description: newDescription });
        setEditingEntry(null);
        setEditDescription("");
      } catch (error) {
        /* empty */
      }
    },
    [updateTimeEntry],
  );

  const getPriorityColor = useCallback((priority: string) => {
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
  }, []);

  const formatCompactDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  useEffect(() => {
    if (runningEntries.length > 0) {
      const interval = setInterval(() => {
        forceUpdate({});
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [runningEntries]);

  if (loading && timeEntries.length === 0) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <TimeStats
        todayTime={timeStats.todayTime}
        activeTimersCount={runningEntries.length}
        weekTime={timeStats.weekTime}
        filteredTime={filteredTotalTime}
      />

      {/* Running Timers - Mobile Responsive */}
      {runningEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 md:space-y-4"
        >
          <h3
            className={`text-base md:text-xl font-semibold flex items-center space-x-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            <span>Active Timers ({runningEntries.length})</span>
          </h3>

          <div className="grid gap-3 md:gap-4">
            {runningEntries.map((entry, index) => {
              const task = getTaskById(entry.task_id);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-lg md:rounded-xl p-3 md:p-6 backdrop-blur-sm border transition-all duration-300 relative overflow-hidden ${
                    isHalloweenMode
                      ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.4)]! shadow-[0_0_15px_rgba(96,201,182,0.15)]!"
                      : "bg-linear-to-r from-[rgba(16,185,129,0.1)] to-[rgba(139,92,246,0.1)] border-[rgba(16,185,129,0.3)]"
                  }`}
                >
                  {isHalloweenMode && (
                    <img
                      src={spiderHairyCrawling}
                      alt=""
                      className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 opacity-20 pointer-events-none rotate-12"
                    />
                  )}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 relative z-10">
                    {/* Timer Info */}
                    <div className="flex items-start md:items-center space-x-3 md:space-x-4 flex-1">
                      {/* Pulse Indicator */}
                      <div className="relative shrink-0 mt-1 md:mt-0">
                        <div
                          className={`w-6 h-6 md:w-8 md:h-8 rounded-full animate-pulse shadow-lg ${
                            isHalloweenMode
                              ? "bg-linear-to-r from-[#60c9b6] to-[#48bba8] shadow-[rgba(96,201,182,0.4)]"
                              : "bg-linear-to-r from-[#10B981] to-[#059669] shadow-[rgba(16,185,129,0.4)]"
                          }`}
                        />
                        <div
                          className={`absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-2 h-2 md:w-3 md:h-3 rounded-full animate-ping ${
                            isHalloweenMode ? "bg-[#F59E0B]" : "bg-[#EF4444]"
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Duration and Status */}
                        <div className="flex items-center flex-wrap gap-2 mb-1 md:mb-2">
                          <h4
                            className={`text-xl md:text-2xl font-bold font-mono tracking-wider ${
                              isHalloweenMode
                                ? "text-[#60c9b6]"
                                : isDark
                                  ? "text-white"
                                  : "text-gray-900"
                            }`}
                          >
                            {formatDurationForTimer(
                              getCurrentDuration(
                                entry.start_time,
                                entry.is_paused,
                                entry.paused_at,
                                entry.total_paused_seconds,
                              ),
                            )}
                          </h4>
                          {entry.is_paused ? (
                            <span className="px-2 md:px-3 py-0.5 md:py-1 bg-[rgba(245,158,11,0.2)] text-[#F59E0B] text-[10px] md:text-xs font-medium rounded-full border border-[rgba(245,158,11,0.4)] flex items-center gap-1">
                              <Pause className="w-3 h-3" />
                              PAUSED
                            </span>
                          ) : (
                            <span
                              className={`px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-medium rounded-full border animate-pulse flex items-center gap-1 ${
                                isHalloweenMode
                                  ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6] border-[rgba(96,201,182,0.4)]"
                                  : "bg-[rgba(16,185,129,0.2)] text-[#10B981] border-[rgba(16,185,129,0.4)]"
                              }`}
                            >
                              <RadioTower className="w-3 h-3" />
                              LIVE
                            </span>
                          )}
                        </div>

                        {/* Task Title */}
                        <p
                          className={`text-sm md:text-lg font-medium mb-1 ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : isDark
                                ? "text-[#E5E5E5]"
                                : "text-gray-700"
                          }`}
                        >
                          {task?.title || "Unknown Task"}
                        </p>

                        {/* Description */}
                        {entry.description && (
                          <p
                            className={`text-xs md:text-sm mb-1 md:mb-2 line-clamp-1 md:line-clamp-none ${
                              isHalloweenMode
                                ? "text-[#60c9b6]/70"
                                : isDark
                                  ? "text-[#B4B4B8]"
                                  : "text-gray-600"
                            }`}
                          >
                            {entry.description}
                          </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center flex-wrap gap-2 text-xs">
                          {task && (
                            <div className="flex items-center space-x-1">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: getPriorityColor(
                                    task.priority,
                                  ),
                                }}
                              />
                              <span
                                className={`capitalize ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                              >
                                {task.priority}
                              </span>
                            </div>
                          )}
                          {task?.project && (
                            <span className="px-2 py-0.5 bg-[rgba(139,92,246,0.2)] text-[#A855F7] text-xs rounded">
                              {task.project}
                            </span>
                          )}
                          <span
                            className={
                              isDark ? "text-[#71717A]" : "text-gray-500"
                            }
                          >
                            {new Date(entry.start_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 md:gap-2 md:ml-4">
                      {entry.is_paused ? (
                        <button
                          onClick={() => handleResumeTimer(entry.id)}
                          className={`flex-1 md:flex-none flex items-center justify-center cursor-pointer space-x-1 md:space-x-2 px-3 md:px-4 py-2 border rounded-lg transition-all duration-200 font-medium text-xs md:text-sm ${
                            isHalloweenMode
                              ? "bg-[rgba(96,201,182,0.2)] border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                              : "bg-linear-to-r from-[rgba(16,185,129,0.2)] to-[rgba(5,150,105,0.2)] border-[rgba(16,185,129,0.3)] text-[#10B981] hover:from-[rgba(16,185,129,0.3)] hover:to-[rgba(5,150,105,0.3)]"
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span>Resume</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePauseTimer(entry.id)}
                          className="flex-1 md:flex-none flex items-center justify-center cursor-pointer space-x-1 md:space-x-2 px-3 md:px-4 py-2 bg-linear-to-r from-[rgba(245,158,11,0.2)] to-[rgba(217,119,6,0.2)] border border-[rgba(245,158,11,0.3)] rounded-lg text-[#F59E0B] hover:from-[rgba(245,158,11,0.3)] hover:to-[rgba(217,119,6,0.3)] transition-all duration-200 font-medium text-xs md:text-sm"
                        >
                          <Pause className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span>Pause</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleStopTimer(entry.id)}
                        className="flex-1 md:flex-none flex items-center justify-center cursor-pointer space-x-1 md:space-x-2 px-3 md:px-4 py-2 bg-linear-to-r from-[rgba(239,68,68,0.2)] to-[rgba(220,38,38,0.2)] border border-[rgba(239,68,68,0.3)] rounded-lg text-[#EF4444] hover:from-[rgba(239,68,68,0.3)] hover:to-[rgba(220,38,38,0.3)] transition-all duration-200 font-medium text-xs md:text-sm"
                      >
                        <Square className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>Stop</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Start New Timer - Mobile Responsive */}
      <GlassCard
        className={`p-4 md:p-6 relative ${
          isHalloweenMode
            ? "bg-[#1a1a1f] border-[rgba(96,201,182,0.4)]! shadow-[0_0_15px_rgba(96,201,182,0.15)]!"
            : isDark
              ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.06)]"
              : "bg-white border-gray-200"
        }`}
      >
        {isHalloweenMode && (
          <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none z-0">
            {/* Background Image */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url(${cardCatFence})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "grayscale(100%)",
              }}
            />
            <img
              src={webCornerLeft}
              alt=""
              className="absolute top-0 left-0 w-16 md:w-24 opacity-20"
            />
            <motion.img
              src={batGlide}
              alt=""
              className="absolute top-4 right-4 w-8 md:w-12 opacity-30"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        )}
        <h3
          className={`text-base md:text-xl font-semibold mb-4 md:mb-6 relative z-10 ${
            isHalloweenMode
              ? "text-[#60c9b6]"
              : isDark
                ? "text-white"
                : "text-gray-900"
          }`}
        >
          Start New Timer
        </h3>
        <div className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-4">
            <div>
              <Dropdown
                title="Filter by Project"
                value={newTimerProjectFilter}
                onValueChange={setNewTimerProjectFilter}
                options={[
                  { value: "all", label: "All Projects" },
                  ...availableProjects.map((project) => ({
                    value: project,
                    label: project,
                  })),
                ]}
                placeholder="Filter by project"
              />
            </div>
            <div>
              <ComboBox
                title="Select Task"
                value={selectedTask}
                onChange={setSelectedTask}
                options={activeTasks
                  .filter(
                    (task) =>
                      newTimerProjectFilter === "all" ||
                      task.project === newTimerProjectFilter,
                  )
                  .map((task: Task) => ({
                    value: task.id,
                    label: `${task.title}${task.project ? ` (${task.project})` : ""}`,
                  }))}
                placeholder={
                  activeTasks.length > 0
                    ? "Choose a task to track time..."
                    : "No Available Tasks to track time"
                }
              />
            </div>
          </div>

          <div>
            <label
              className={`block text-xs md:text-sm mb-1.5 md:mb-2 ${
                isDark ? "text-[#B4B4B8]" : "text-gray-600"
              }`}
            >
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
              className={`w-full rounded-lg px-3 md:px-4 py-2 md:py-3 text-sm md:text-base transition-colors ${
                isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.05)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6] placeholder-[rgba(96,201,182,0.5)] focus:border-[#60c9b6] focus:outline-hidden"
                  : isDark
                    ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6] focus:outline-hidden"
                    : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6] focus:outline-hidden"
              }`}
            />
          </div>

          <button
            onClick={() => selectedTask && handleStartTimer(selectedTask)}
            disabled={!selectedTask || loading}
            className={`w-full md:w-auto flex items-center justify-center cursor-pointer space-x-2 px-4 md:px-6 py-2.5 md:py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base font-medium relative z-10 ${
              isHalloweenMode
                ? "bg-[rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                : "bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] text-[#10B981] hover:bg-[rgba(16,185,129,0.3)]"
            }`}
          >
            <Play className="w-4 h-4 md:w-5 md:h-5" />
            <span>{loading ? "Loading..." : "Start Timer"}</span>
          </button>
        </div>
      </GlassCard>

      {/* Time Entries */}
      <GlassCard
        className={`overflow-hidden relative ${
          isHalloweenMode
            ? "border-[rgba(96,201,182,0.4)]! shadow-[0_0_15px_rgba(96,201,182,0.15)]!"
            : ""
        }`}
      >
        {isHalloweenMode && (
          <div
            className="absolute inset-0 opacity-10 pointer-events-none z-0"
            style={{
              backgroundImage: `url(${bgWitchGraveyard})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "grayscale(100%)",
            }}
          />
        )}
        <div
          className={`p-4 md:p-6 border-b ${
            isDark ? "border-[rgba(255,255,255,0.06)]" : "border-gray-200"
          }`}
        >
          <div className="mb-3 md:mb-4">
            <h3
              className={`text-sm md:text-xl font-semibold ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              Time Sessions
            </h3>
          </div>

          {/* Search and Filters Bar - Responsive */}
          <motion.div
            className="mb-3 md:mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Mobile Layout - Stacked */}
            <div className="md:hidden space-y-2">
              {/* Search Bar */}
              <div className="relative">
                <Search
                  className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : isDark
                        ? "text-[#71717A]"
                        : "text-gray-400"
                  }`}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search sessions..."
                  className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs transition-colors ${
                    isHalloweenMode
                      ? "bg-[rgba(96,201,182,0.05)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6] placeholder-[rgba(96,201,182,0.5)] focus:border-[#60c9b6]"
                      : isDark
                        ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#10B981] focus:bg-[rgba(40,40,45,0.8)]"
                        : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#10B981] focus:bg-gray-50"
                  } focus:outline-hidden`}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                      isDark
                        ? "hover:bg-[rgba(255,255,255,0.1)] text-[#71717A] hover:text-white"
                        : "hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters Row - 60/40 split on mobile */}
              <div className="flex gap-2">
                <div className="w-[60%]">
                  <Dropdown
                    value={selectedProject}
                    onValueChange={setSelectedProject}
                    options={[
                      { value: "", label: "All Projects" },
                      ...availableProjects.map((project) => ({
                        value: project,
                        label: project,
                      })),
                    ]}
                    placeholder="Project"
                  />
                </div>
                <div className="w-[40%]">
                  <Dropdown
                    value={filterPeriod}
                    onValueChange={(value) =>
                      setFilterPeriod(
                        value as "today" | "week" | "month" | "all",
                      )
                    }
                    options={[
                      { value: "all", label: "All Time" },
                      { value: "today", label: "Today" },
                      { value: "week", label: "Week" },
                      { value: "month", label: "Month" },
                    ]}
                    placeholder="Period"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Layout - Single Row */}
            <div className="hidden md:flex gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : isDark
                        ? "text-[#71717A]"
                        : "text-gray-400"
                  }`}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by task, project, or description..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-colors ${
                    isHalloweenMode
                      ? "bg-[rgba(96,201,182,0.05)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6] placeholder-[rgba(96,201,182,0.5)] focus:border-[#60c9b6]"
                      : isDark
                        ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#10B981] focus:bg-[rgba(40,40,45,0.8)]"
                        : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#10B981] focus:bg-gray-50"
                  } focus:outline-hidden`}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                      isDark
                        ? "hover:bg-[rgba(255,255,255,0.1)] text-[#71717A] hover:text-white"
                        : "hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Project Filter */}
              <div className="w-48">
                <Dropdown
                  value={selectedProject}
                  onValueChange={setSelectedProject}
                  options={[
                    { value: "", label: "All Projects" },
                    ...availableProjects.map((project) => ({
                      value: project,
                      label: project,
                    })),
                  ]}
                  placeholder="Filter by project"
                />
              </div>

              {/* Period Filter */}
              <div className="w-40">
                <Dropdown
                  value={filterPeriod}
                  onValueChange={(value) =>
                    setFilterPeriod(value as "today" | "week" | "month" | "all")
                  }
                  options={[
                    { value: "all", label: "All Time" },
                    { value: "today", label: "Today" },
                    { value: "week", label: "This Week" },
                    { value: "month", label: "This Month" },
                  ]}
                  placeholder="Select period"
                />
              </div>
            </div>
          </motion.div>

          {/* Compact Tab Navigation - 50/50 on mobile, auto on desktop */}
          <motion.div
            className="flex items-center gap-2 mb-4 md:mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <button
              onClick={() => setActiveTab("active")}
              className={`flex-1 md:flex-none flex items-center justify-center cursor-pointer space-x-1.5 md:space-x-2 px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all duration-200 text-xs md:text-sm ${
                activeTab === "active"
                  ? isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6] border border-[rgba(96,201,182,0.3)]"
                    : "bg-[rgba(16,185,129,0.2)] text-[#10B981] border border-[rgba(16,185,129,0.3)]"
                  : isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.05)] text-[#60c9b6]/70 hover:bg-[rgba(96,201,182,0.1)] border border-[rgba(96,201,182,0.1)]"
                    : isDark
                      ? "bg-[rgba(255,255,255,0.05)] text-[#B4B4B8] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)]"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              <Timer className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>Active</span>
              {activeSessions.length > 0 && (
                <span
                  className={`ml-0.5 md:ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === "active"
                      ? isHalloweenMode
                        ? "bg-[#60c9b6] text-[#1a1a1f]"
                        : "bg-[#10B981] text-white"
                      : isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6]"
                        : isDark
                          ? "bg-[rgba(255,255,255,0.1)] text-[#B4B4B8]"
                          : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {activeSessions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`flex-1 md:flex-none flex items-center justify-center cursor-pointer space-x-1.5 md:space-x-2 px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all duration-200 text-xs md:text-sm ${
                activeTab === "completed"
                  ? isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6] border border-[rgba(96,201,182,0.3)]"
                    : "bg-[rgba(16,185,129,0.2)] text-[#10B981] border border-[rgba(16,185,129,0.3)]"
                  : isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.05)] text-[#60c9b6]/70 hover:bg-[rgba(96,201,182,0.1)] border border-[rgba(96,201,182,0.1)]"
                    : isDark
                      ? "bg-[rgba(255,255,255,0.05)] text-[#B4B4B8] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)]"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>Completed</span>
              {completedSessions.length > 0 && (
                <span
                  className={`ml-0.5 md:ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === "completed"
                      ? isHalloweenMode
                        ? "bg-[#60c9b6] text-[#1a1a1f]"
                        : "bg-[#10B981] text-white"
                      : isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6]"
                        : isDark
                          ? "bg-[rgba(255,255,255,0.1)] text-[#B4B4B8]"
                          : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {completedSessions.length}
                </span>
              )}
            </button>
          </motion.div>
        </div>

        <div className="pb-4">
          <div>
            {loading ? (
              <div
                className={`p-12 text-center ${
                  isDark ? "text-[#71717A]" : "text-gray-500"
                }`}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-16 h-16 mx-auto mb-4"
                >
                  <Timer className="w-16 h-16 opacity-50" />
                </motion.div>
                <h4
                  className={`text-lg font-medium mb-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Loading time sessions...
                </h4>
                <p>Please wait while we fetch your time tracking data.</p>
              </div>
            ) : filteredTimeEntries.length === 0 ? (
              <div className="relative overflow-hidden rounded-xl min-h-[400px] flex items-center justify-center p-8 md:p-12">
                {isHalloweenMode && (
                  <>
                    <div
                      className="absolute inset-0 pointer-events-none opacity-5 z-0"
                      style={{
                        backgroundImage: `url(${cardCatFence})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <motion.img
                      src={candleTrio}
                      alt=""
                      className="absolute top-10 right-10 w-16 md:w-20 opacity-12 pointer-events-none z-0"
                      style={{
                        filter: "drop-shadow(0 0 20px rgba(245, 158, 11, 0.4))",
                      }}
                      animate={{
                        opacity: [0.12, 0.18, 0.12],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.img
                      src={witchBrew}
                      alt=""
                      className="absolute bottom-10 left-10 w-20 md:w-24 opacity-10 pointer-events-none z-0"
                      style={{
                        filter: "drop-shadow(0 0 15px rgba(96, 201, 182, 0.3))",
                      }}
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </>
                )}
                <motion.div
                  className="relative z-10 text-center max-w-md mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {isHalloweenMode ? (
                    <motion.img
                      src={skullStaring}
                      alt=""
                      className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 opacity-80"
                      style={{
                        filter: "drop-shadow(0 0 30px rgba(96, 201, 182, 0.5))",
                      }}
                      animate={{
                        rotate: [-5, 5, -5],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ) : (
                    <Timer
                      className={`w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 ${isDark ? "text-[#71717A]" : "text-gray-300"}`}
                    />
                  )}
                  <h4
                    className={`text-xl md:text-2xl font-bold mb-3 ${
                      isHalloweenMode
                        ? "text-[#60c9b6] font-creepster tracking-wide"
                        : isDark
                          ? "text-white"
                          : "text-gray-900"
                    }`}
                  >
                    {isHalloweenMode
                      ? activeTab === "active"
                        ? "No Souls Ticking"
                        : "No Rituals Completed"
                      : `No ${activeTab === "active" ? "active" : "completed"} sessions found`}
                  </h4>
                  <p
                    className={`text-sm md:text-base ${
                      isHalloweenMode
                        ? "text-[#60c9b6]/70"
                        : isDark
                          ? "text-[#B4B4B8]"
                          : "text-gray-600"
                    }`}
                  >
                    {activeTab === "active"
                      ? isHalloweenMode
                        ? "The eternal clock awaits. Begin tracking your mystical time journeys."
                        : "Start your first timer to begin tracking time sessions!"
                      : isHalloweenMode
                        ? "No temporal spirits have been captured in this realm. Complete some time rituals to see them manifest."
                        : "No completed sessions found in the selected period. Complete some timer sessions to see them here."}
                  </p>
                </motion.div>
              </div>
            ) : (
              <Virtuoso
                useWindowScroll
                data={filteredTimeEntries}
                itemContent={(index, entry) => {
                  const task = getTaskById(entry.task_id);
                  const duration = entry.is_running
                    ? getCurrentDuration(
                        entry.start_time,
                        entry.is_paused,
                        entry.paused_at,
                        entry.total_paused_seconds,
                      )
                    : entry.duration_seconds || 0;
                  const isEditing = editingEntry === entry.id;

                  return (
                    <div key={entry.id} className="pb-4">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`mx-4 p-3 md:p-4 rounded-lg transition-all duration-200 group cursor-pointer ${
                          isHalloweenMode
                            ? isDark
                              ? "bg-[rgba(40,40,45,0.4)] border border-[rgba(96,201,182,0.1)] hover:border-[rgba(96,201,182,0.3)] hover:bg-[rgba(96,201,182,0.08)]"
                              : "bg-gray-50 border border-[rgba(96,201,182,0.2)] hover:border-[rgba(96,201,182,0.4)] hover:bg-[rgba(96,201,182,0.1)]"
                            : isDark
                              ? "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(139,92,246,0.3)] hover:bg-[rgba(255,255,255,0.05)]"
                              : "bg-white border border-gray-200 hover:border-[rgba(139,92,246,0.3)] hover:bg-gray-50"
                        }`}
                      >
                        {/* Mobile Layout - Stacked */}
                        <div className="md:hidden space-y-2.5">
                          {/* Top Row: Title and Actions */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4
                                  className={`font-medium text-sm truncate ${
                                    isHalloweenMode
                                      ? "text-[#60c9b6]"
                                      : isDark
                                        ? "text-white"
                                        : "text-gray-900"
                                  }`}
                                >
                                  {task?.title || "Unknown Task"}
                                </h4>
                                {entry.is_running && (
                                  <span className="px-1.5 py-0.5 bg-[rgba(239,68,68,0.2)] text-[#EF4444] text-[10px] font-bold rounded shrink-0">
                                    LIVE
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              {!isEditing && !entry.is_running && (
                                <button
                                  onClick={() => {
                                    setEditingEntry(entry.id);
                                    setEditDescription(entry.description || "");
                                  }}
                                  className={`p-1.5 rounded transition-colors ${
                                    isHalloweenMode
                                      ? "hover:bg-[rgba(96,201,182,0.15)] text-[#60c9b6]"
                                      : isDark
                                        ? "hover:bg-[rgba(255,255,255,0.08)] text-[#B4B4B8]"
                                        : "hover:bg-gray-200 text-gray-600"
                                  }`}
                                  title="Edit description"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {entry.is_running ? (
                                <button
                                  onClick={() => handleStopTimer(entry.id)}
                                  className="p-1.5 bg-[rgba(239,68,68,0.15)] hover:bg-[rgba(239,68,68,0.25)] rounded transition-colors"
                                  title="Stop timer"
                                >
                                  <Square className="w-3.5 h-3.5 text-[#EF4444]" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    const task = getTaskById(entry.task_id);
                                    setEntryToDelete({
                                      id: entry.id,
                                      taskTitle: task?.title || "Unknown Task",
                                      description:
                                        entry.description || "No description",
                                      duration: entry.duration_seconds || 0,
                                    });
                                  }}
                                  className="p-1.5 bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.2)] rounded transition-colors opacity-0 group-hover:opacity-100"
                                  title="Delete session"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Edit Description Section - Full Width Below */}
                          {isEditing && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 pt-3 border-t border-[rgba(139,92,246,0.2)]"
                            >
                              <div className="flex items-center gap-2">
                                <Input
                                  type="text"
                                  value={editDescription}
                                  onChange={(e) =>
                                    setEditDescription(e.target.value)
                                  }
                                  placeholder="Add description..."
                                  className={`text-xs md:text-sm h-8 md:h-9 flex-1 ${
                                    isHalloweenMode
                                      ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)] text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[rgba(96,201,182,0.5)]! focus:ring-[rgba(96,201,182,0.2)]! focus:ring-1!"
                                      : ""
                                  }`}
                                  autoFocus
                                />
                                <button
                                  onClick={() =>
                                    handleUpdateDescription(
                                      entry.id,
                                      editDescription,
                                    )
                                  }
                                  className={`p-2 rounded-lg transition-colors shrink-0 cursor-pointer ${
                                    isHalloweenMode
                                      ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                                      : "bg-[rgba(16,185,129,0.2)] text-[#10B981] hover:bg-[rgba(16,185,129,0.3)]"
                                  }`}
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingEntry(null);
                                    setEditDescription("");
                                  }}
                                  className="p-2 rounded-lg bg-[rgba(239,68,68,0.2)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.3)] transition-colors shrink-0 cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Desktop Layout - Single Row */}
                        <div className="hidden md:flex items-center justify-between gap-3">
                          {/* Duration Badge */}
                          <div
                            className={`flex items-center justify-center space-x-2 px-2.5 py-1.5 rounded-md min-w-[90px] ${
                              isDark
                                ? "bg-[rgba(16,185,129,0.1)]"
                                : "bg-green-50"
                            }`}
                          >
                            {entry.is_running ? (
                              <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                            ) : (
                              <Clock className="w-3 h-3 text-[#10B981]" />
                            )}
                            <span
                              className={`text-sm font-mono font-bold tabular-nums text-[#10B981]`}
                            >
                              {formatCompactDuration(duration)}
                            </span>
                          </div>

                          {/* Task Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4
                                className={`font-medium text-base truncate ${
                                  isHalloweenMode
                                    ? "text-[#60c9b6]"
                                    : isDark
                                      ? "text-white"
                                      : "text-gray-900"
                                }`}
                              >
                                {task?.title || "Unknown Task"}
                              </h4>
                              {entry.is_running && (
                                <span className="px-1.5 py-0.5 bg-[rgba(239,68,68,0.2)] text-[#EF4444] text-[10px] font-bold rounded shrink-0">
                                  LIVE
                                </span>
                              )}
                            </div>

                            {/* Meta Info */}
                            <div className="flex items-center gap-2 text-xs">
                              {task?.project && (
                                <span
                                  className={`flex items-center gap-1 ${isDark ? "text-[#A855F7]" : "text-purple-600"}`}
                                >
                                  {task.project}
                                </span>
                              )}
                              {task && task?.project && (
                                <span
                                  className={
                                    isDark ? "text-[#71717A]" : "text-gray-400"
                                  }
                                >
                                  •
                                </span>
                              )}
                              {task && (
                                <span
                                  className={`flex items-center gap-1 capitalize ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                                >
                                  <div
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{
                                      backgroundColor: getPriorityColor(
                                        task.priority,
                                      ),
                                    }}
                                  />
                                  {task.priority}
                                </span>
                              )}
                              <span
                                className={
                                  isDark ? "text-[#71717A]" : "text-gray-400"
                                }
                              >
                                •
                              </span>
                              <span
                                className={
                                  isDark ? "text-[#71717A]" : "text-gray-500"
                                }
                              >
                                {new Date(entry.start_time).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </span>
                            </div>

                            {/* Description */}
                            <p
                              className={`text-xs mt-1.5 line-clamp-2 ${
                                isDark ? "text-[#B4B4B8]" : "text-gray-600"
                              }`}
                            >
                              {entry.description || "No description"}
                            </p>
                          </div>

                          {/* Actions - Hover visible on desktop */}
                          <div className="flex items-center gap-1 shrink-0">
                            {!isEditing && !entry.is_running && (
                              <button
                                onClick={() => {
                                  setEditingEntry(entry.id);
                                  setEditDescription(entry.description || "");
                                }}
                                className={`p-1.5 rounded transition-colors cursor-pointer opacity-0 group-hover:opacity-100 ${
                                  isHalloweenMode
                                    ? "hover:bg-[rgba(96,201,182,0.15)] text-[#60c9b6]"
                                    : isDark
                                      ? "hover:bg-[rgba(255,255,255,0.08)]"
                                      : "hover:bg-gray-200"
                                }`}
                                title="Edit description"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {entry.is_running ? (
                              <button
                                onClick={() => handleStopTimer(entry.id)}
                                className="p-1.5 bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.2)] rounded transition-colors"
                                title="Stop timer"
                              >
                                <Square className="w-4 h-4 text-[#EF4444]" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const task = getTaskById(entry.task_id);
                                  setEntryToDelete({
                                    id: entry.id,
                                    taskTitle: task?.title || "Unknown Task",
                                    description:
                                      entry.description || "No description",
                                    duration: entry.duration_seconds || 0,
                                  });
                                }}
                                className="p-1.5 bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.2)] rounded transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                                title="Delete session"
                              >
                                <Trash2 className="w-4 h-4 text-[#EF4444]" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Edit Description Section - Desktop (renders below the row) */}
                        {isEditing && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="hidden md:block mt-3 pt-3 border-t border-[rgba(139,92,246,0.2)]"
                          >
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={editDescription}
                                onChange={(e) =>
                                  setEditDescription(e.target.value)
                                }
                                placeholder="Add description..."
                                className={`text-sm h-9 flex-1 ${
                                  isHalloweenMode
                                    ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)] text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[rgba(96,201,182,0.5)]! focus:ring-[rgba(96,201,182,0.2)]! focus:ring-1!"
                                    : ""
                                }`}
                                autoFocus
                              />
                              <button
                                onClick={() =>
                                  handleUpdateDescription(
                                    entry.id,
                                    editDescription,
                                  )
                                }
                                className={`p-2 rounded-lg transition-colors shrink-0 cursor-pointer ${
                                  isHalloweenMode
                                    ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                                    : "bg-[rgba(16,185,129,0.2)] text-[#10B981] hover:bg-[rgba(16,185,129,0.3)]"
                                }`}
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingEntry(null);
                                  setEditDescription("");
                                }}
                                className="p-2 rounded-lg bg-[rgba(239,68,68,0.2)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.3)] transition-colors shrink-0 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                  );
                }}
              />
            )}
          </div>
        </div>
        {hasMore && (
          <div
            className={`p-4 md:p-6 border-t flex justify-center relative z-10 ${
              isDark ? "border-[rgba(255,255,255,0.06)]" : "border-gray-200"
            }`}
          >
            <button
              onClick={loadMore}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                  : isDark
                    ? "bg-[rgba(16,185,129,0.2)] text-[#10B981] hover:bg-[rgba(16,185,129,0.3)]"
                    : "bg-green-100 text-green-600 hover:bg-green-200"
              }`}
            >
              Load More
            </button>
          </div>
        )}
      </GlassCard>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={handleDeleteEntry}
        title="Delete Time Session"
        description="Are you sure you want to delete this time tracking session?"
        itemTitle={entryToDelete?.taskTitle}
        itemDescription={
          entryToDelete
            ? `${entryToDelete.description} • ${formatDuration(entryToDelete.duration)}`
            : undefined
        }
        confirmText="Delete Session"
        type="danger"
      />
    </div>
  );
};
