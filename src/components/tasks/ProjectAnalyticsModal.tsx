import { motion } from "framer-motion";
import { Activity, Calendar, Clock, Target, TrendingUp } from "lucide-react";
import React, { useMemo } from "react";
import {
  batGlide,
  candleFive,
  catArched,
  catFluffy,
  ghostGenie,
  pumpkinSneaky,
  spiderHairyCrawling,
} from "@/assets";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/contexts/ThemeContext";
import { useTimeCalculations } from "@/hooks/tasks/useTimeCalculations";
import { useTimeTracking } from "@/hooks/tasks/useTimeTracking";
import { Task } from "@/types/task";

interface ProjectAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  tasks: Task[];
}

export const ProjectAnalyticsModal: React.FC<ProjectAnalyticsModalProps> = ({
  isOpen,
  onClose,
  projectName,
  tasks,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { timeEntries } = useTimeTracking();
  const { getProjectTimeStats, formatDuration } = useTimeCalculations(tasks);
  const [taskFilter, setTaskFilter] = React.useState<
    "all" | "active" | "completed"
  >("all");
  const [dayFilter, setDayFilter] = React.useState<7 | 14 | 30>(7);

  const analytics = useMemo(() => {
    const projectTimeStats = getProjectTimeStats(projectName);

    const filteredTasks =
      taskFilter === "all"
        ? tasks
        : taskFilter === "completed"
          ? tasks.filter((t) => t.completed)
          : tasks.filter((t) => !t.completed);

    const projectTimeEntries = timeEntries.filter((entry) => {
      const task = filteredTasks.find((t) => t.id === entry.task_id);
      return (
        task &&
        (task.project === projectName ||
          (projectName === "Unassigned" && !task.project))
      );
    });

    const taskAnalytics = filteredTasks
      .map((task) => {
        const taskEntries = timeEntries.filter(
          (entry) => entry.task_id === task.id,
        );
        const totalTime = taskEntries.reduce((sum, entry) => {
          if (entry.is_running) {
            const duration = Math.floor(
              (Date.now() - new Date(entry.start_time).getTime()) / 1000,
            );
            return sum + Math.max(0, duration);
          }
          return sum + (entry.duration_seconds || 0);
        }, 0);

        return {
          task,
          totalTime,
          sessionCount: taskEntries.length,
          averageSession:
            taskEntries.length > 0 ? totalTime / taskEntries.length : 0,
          lastWorked:
            taskEntries.length > 0
              ? taskEntries.sort(
                  (a, b) =>
                    new Date(b.start_time).getTime() -
                    new Date(a.start_time).getTime(),
                )[0].start_time
              : null,
          isActive: taskEntries.some((entry) => entry.is_running),
        };
      })
      .sort((a, b) => b.totalTime - a.totalTime);

    const lastNDays = Array.from({ length: dayFilter }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    }).reverse();

    const dailyStats = lastNDays.map((dateString) => {
      const dayEntries = projectTimeEntries.filter((entry) => {
        try {
          return new Date(entry.start_time).toDateString() === dateString;
        } catch {
          return false;
        }
      });

      const totalTime = dayEntries.reduce((sum, entry) => {
        if (
          entry.is_running &&
          new Date(entry.start_time).toDateString() === dateString
        ) {
          const duration = Math.floor(
            (Date.now() - new Date(entry.start_time).getTime()) / 1000,
          );
          return sum + Math.max(0, duration);
        }
        return sum + (entry.duration_seconds || 0);
      }, 0);

      return {
        date: dateString,
        totalTime,
        sessionCount: dayEntries.length,
        tasksWorkedOn: new Set(dayEntries.map((entry) => entry.task_id)).size,
      };
    });

    const completedTasksLast7Days = tasks.filter((task) => {
      if (!task.completed || !task.completion_date) return false;
      try {
        const completionDate = new Date(task.completion_date);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return completionDate >= sevenDaysAgo;
      } catch {
        return false;
      }
    });

    const activeDays = dailyStats.filter((day) => day.totalTime > 0);
    const daysWithCompletions = new Set(
      completedTasksLast7Days
        .map((task) => {
          try {
            return task.completion_date
              ? new Date(task.completion_date).toDateString()
              : null;
          } catch {
            return null;
          }
        })
        .filter(Boolean),
    ).size;

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.completed).length,
      pendingTasks: tasks.filter((t) => !t.completed).length,
      totalSessions: projectTimeStats.sessionCount,
      totalTime: projectTimeStats.totalTime,
      averageSessionTime:
        projectTimeStats.sessionCount > 0
          ? projectTimeStats.totalTime / projectTimeStats.sessionCount
          : 0,
      taskAnalytics,
      dailyStats,
      activeDays,
      completionVelocity:
        daysWithCompletions > 0
          ? completedTasksLast7Days.length / daysWithCompletions
          : 0,
      mostProductiveDay:
        activeDays.length > 0
          ? activeDays.reduce(
              (max, day) => (day.totalTime > max.totalTime ? day : max),
              activeDays[0],
            )
          : null,
      averageDailyTime:
        activeDays.length > 0
          ? activeDays.reduce((sum, day) => sum + day.totalTime, 0) /
            activeDays.length
          : 0,
    };
  }, [
    projectName,
    tasks,
    timeEntries,
    getProjectTimeStats,
    taskFilter,
    dayFilter,
  ]);

  const [hoveredStat, setHoveredStat] = React.useState<number | null>(null);
  const [hoveredInsight, setHoveredInsight] = React.useState<number | null>(
    null,
  );

  const topStats = [
    {
      title: "Total Time",
      value: formatDuration(analytics.totalTime),
      icon: Clock,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(139,92,246,0.1)]"
          : "bg-purple-50",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(139,92,246,0.2)]",
      decor: ghostGenie,
    },
    {
      title: "Sessions",
      value: analytics.totalSessions,
      icon: Activity,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#10B981]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(16,185,129,0.1)]"
          : "bg-emerald-50",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(16,185,129,0.2)]",
      decor: pumpkinSneaky,
    },
    {
      title: "Completion",
      value: `${Math.round((analytics.completedTasks / analytics.totalTasks) * 100 || 0)}%`,
      icon: Target,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#F59E0B]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(245,158,11,0.1)]"
          : "bg-amber-50",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(245,158,11,0.2)]",
      decor: catFluffy,
    },
    {
      title: "Velocity",
      value: (
        <>
          {analytics.completionVelocity.toFixed(1)}
          <span className="text-[10px] md:text-xs font-normal ml-1 opacity-70">
            /day
          </span>
        </>
      ),
      icon: TrendingUp,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#EC4899]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(236,72,153,0.1)]"
          : "bg-pink-50",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(236,72,153,0.2)]",
      decor: candleFive,
    },
  ];

  const insightStats = [
    {
      title: "Average Session",
      value: formatDuration(analytics.averageSessionTime),
      subtext: `Across ${analytics.totalSessions} sessions`,
      icon: Clock,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#10B981]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(16,185,129,0.1)]"
          : "bg-emerald-50",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(16,185,129,0.2)]",
      decor: spiderHairyCrawling,
    },
    {
      title: "Most Productive",
      value: analytics.mostProductiveDay
        ? new Date(analytics.mostProductiveDay.date).toLocaleDateString(
            "en-US",
            { weekday: "long" },
          )
        : "N/A",
      subtext: `${
        analytics.mostProductiveDay
          ? formatDuration(analytics.mostProductiveDay.totalTime)
          : "0m"
      } worked`,
      icon: Calendar,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(139,92,246,0.1)]"
          : "bg-purple-50",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(139,92,246,0.2)]",
      decor: catArched,
    },
    {
      title: "Daily Average",
      value: formatDuration(analytics.averageDailyTime),
      subtext:
        analytics.activeDays.length > 0
          ? `Over ${analytics.activeDays.length} active days`
          : "No activity yet",
      icon: TrendingUp,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#F59E0B]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(245,158,11,0.1)]"
          : "bg-amber-50",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(245,158,11,0.2)]",
      decor: batGlide,
    },
  ];

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Project Analytics: ${projectName}`}
      size="xl"
      className="max-w-6xl"
    >
      <div className="space-y-6 md:space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {topStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredStat(index)}
              onMouseLeave={() => setHoveredStat(null)}
              className={`relative overflow-hidden p-3 md:p-4 rounded-xl ${stat.bgColor} border ${stat.borderColor} ${
                isHalloweenMode ? "shadow-[0_0_10px_rgba(96,201,182,0.2)]" : ""
              }`}
            >
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p
                    className={`text-[10px] md:text-xs font-medium ${stat.color} mb-0.5 md:mb-1`}
                  >
                    {stat.title}
                  </p>
                  <p className={`text-lg md:text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl ${stat.bgColor} flex items-center justify-center`}
                >
                  {isHalloweenMode ? (
                    <motion.img
                      src={stat.decor}
                      alt=""
                      className="w-5 h-5 md:w-8 md:h-8 object-contain"
                      animate={
                        hoveredStat === index
                          ? {
                              scale: [1, 1.2, 1],
                              rotate:
                                index % 2 === 0
                                  ? [-10, 10, -10, 0]
                                  : [0, 5, -5, 0],
                              y: index % 2 !== 0 ? [0, -5, 0] : 0,
                            }
                          : { scale: 1, rotate: 0, y: 0 }
                      }
                      transition={{
                        duration: 0.6,
                        ease: "easeInOut",
                      }}
                    />
                  ) : (
                    <stat.icon
                      className={`w-4 h-4 md:w-6 md:h-6 ${stat.color}`}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Time Spent by Task */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 md:mb-4">
              <h3
                className={`text-sm md:text-lg font-semibold flex items-center space-x-2 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                <Clock
                  className={`w-4 h-4 md:w-5 md:h-5 ${
                    isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"
                  }`}
                />
                <span>Time Spent by Task</span>
              </h3>
              <div className="w-full sm:w-40">
                <Dropdown
                  value={taskFilter}
                  onValueChange={(value) =>
                    setTaskFilter(value as "all" | "active" | "completed")
                  }
                  options={[
                    { value: "all", label: "All Tasks" },
                    { value: "active", label: "Active" },
                    { value: "completed", label: "Completed" },
                  ]}
                />
              </div>
            </div>
            <div
              className={`rounded-xl p-3 md:p-4 h-[300px] md:h-[400px] overflow-y-auto scrollbar-none ${
                isHalloweenMode
                  ? "bg-[#1a1a1f]/50 border border-[#60c9b6]/20"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]"
                    : "bg-gray-50 border border-gray-100"
              }`}
            >
              <div className="space-y-3 md:space-y-4">
                {analytics.taskAnalytics.map((taskData, index) => {
                  const maxTime = Math.max(
                    ...analytics.taskAnalytics.map((t) => t.totalTime),
                  );
                  const percentage =
                    maxTime > 0 ? (taskData.totalTime / maxTime) * 100 : 0;

                  const getRankColor = () => {
                    if (index === 0)
                      return {
                        bg: isHalloweenMode
                          ? "rgba(255, 215, 0, 0.1)"
                          : "rgba(255,215,0,0.15)",
                        border: isHalloweenMode
                          ? "rgba(255, 215, 0, 0.3)"
                          : "rgba(255,215,0,0.3)",
                        text: "#FFD700",
                        label: "🥇",
                      };
                    if (index === 1)
                      return {
                        bg: isHalloweenMode
                          ? "rgba(192, 192, 192, 0.1)"
                          : "rgba(192,192,192,0.15)",
                        border: isHalloweenMode
                          ? "rgba(192, 192, 192, 0.3)"
                          : "rgba(192,192,192,0.3)",
                        text: "#C0C0C0",
                        label: "🥈",
                      };
                    if (index === 2)
                      return {
                        bg: isHalloweenMode
                          ? "rgba(205, 127, 50, 0.1)"
                          : "rgba(205,127,50,0.15)",
                        border: isHalloweenMode
                          ? "rgba(205, 127, 50, 0.3)"
                          : "rgba(205,127,50,0.3)",
                        text: "#CD7F32",
                        label: "🥉",
                      };
                    return null;
                  };

                  const rankColor = getRankColor();

                  return (
                    <div
                      key={taskData.task.id}
                      className={`p-2 md:p-3 rounded-lg transition-colors border ${
                        rankColor
                          ? ""
                          : isHalloweenMode
                            ? "hover:bg-[#60c9b6]/10 border-transparent"
                            : isDark
                              ? "hover:bg-[rgba(255,255,255,0.05)] border-transparent"
                              : "hover:bg-white hover:shadow-sm border-transparent"
                      }`}
                      style={
                        rankColor
                          ? {
                              backgroundColor: rankColor.bg,
                              borderColor: rankColor.border,
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5 md:mb-2">
                        <div className="flex items-center space-x-2 md:space-x-3 overflow-hidden">
                          <span
                            className="text-xs md:text-sm font-bold"
                            style={{
                              color:
                                rankColor?.text ||
                                (isDark ? "#B4B4B8" : "#6B7280"),
                            }}
                          >
                            {rankColor?.label || `#${index + 1}`}
                          </span>
                          <p
                            className={`text-xs md:text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}
                          >
                            {taskData.task.title}
                          </p>
                          {taskData.isActive && (
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#10B981] rounded-full animate-pulse" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-4 mt-0.5 md:mt-1">
                          <span
                            className={`text-[10px] md:text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                          >
                            {taskData.sessionCount} sessions
                          </span>
                          <span
                            className={`text-xs md:text-sm font-bold ${
                              isHalloweenMode
                                ? "text-[#60c9b6]"
                                : isDark
                                  ? "text-white"
                                  : "text-gray-900"
                            }`}
                          >
                            {formatDuration(taskData.totalTime)}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-full rounded-full h-1.5 md:h-2 ${isDark ? "bg-[rgba(255,255,255,0.05)]" : "bg-gray-200"}`}
                      >
                        <div
                          className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                            rankColor
                              ? ""
                              : isHalloweenMode
                                ? "bg-linear-to-r from-[#60c9b6] to-[#4db3a2]"
                                : "bg-linear-to-r from-[#8B5CF6] to-[#7C3AED]"
                          }`}
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: rankColor?.text,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Daily Activity */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 md:mb-4">
              <h3
                className={`text-sm md:text-lg font-semibold flex items-center space-x-2 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                <Calendar
                  className={`w-4 h-4 md:w-5 md:h-5 ${
                    isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"
                  }`}
                />
                <span>Daily Activity</span>
              </h3>
              <div className="w-full sm:w-40">
                <Dropdown
                  value={String(dayFilter)}
                  onValueChange={(value) =>
                    setDayFilter(Number(value) as 7 | 14 | 30)
                  }
                  options={[
                    { value: "7", label: "Last 7 Days" },
                    { value: "14", label: "Last 14 Days" },
                    { value: "30", label: "Last 30 Days" },
                  ]}
                />
              </div>
            </div>
            <div
              className={`rounded-xl p-3 md:p-4 h-[300px] md:h-[400px] overflow-y-auto scrollbar-none ${
                isHalloweenMode
                  ? "bg-[#1a1a1f]/50 border border-[#60c9b6]/20"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]"
                    : "bg-gray-50 border border-gray-100"
              }`}
            >
              <div className="space-y-2 md:space-y-3">
                {analytics.dailyStats.map((day) => {
                  const maxTime = Math.max(
                    ...analytics.dailyStats.map((d) => d.totalTime),
                  );
                  const percentage =
                    maxTime > 0 ? (day.totalTime / maxTime) * 100 : 0;

                  return (
                    <div key={day.date} className="space-y-1.5 md:space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs md:text-sm ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : isDark
                                ? "text-white"
                                : "text-gray-900"
                          }`}
                        >
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <div className="flex items-center space-x-1.5 md:space-x-2">
                          <span
                            className={`text-[10px] md:text-xs ${
                              isHalloweenMode
                                ? "text-[#60c9b6]/70"
                                : isDark
                                  ? "text-[#B4B4B8]"
                                  : "text-gray-600"
                            }`}
                          >
                            {day.sessionCount} sessions
                          </span>
                          <span
                            className={`text-xs md:text-sm font-medium ${
                              isHalloweenMode
                                ? "text-[#60c9b6]"
                                : isDark
                                  ? "text-white"
                                  : "text-gray-900"
                            }`}
                          >
                            {formatDuration(day.totalTime)}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-full rounded-full h-1.5 md:h-2 ${isDark ? "bg-[rgba(255,255,255,0.05)]" : "bg-gray-200"}`}
                      >
                        <div
                          className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                            isHalloweenMode
                              ? "bg-linear-to-r from-[#60c9b6] to-[#4db3a2]"
                              : "bg-linear-to-r from-[#8B5CF6] to-[#7C3AED]"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="mt-6 md:mt-8">
          <h3
            className={`text-sm md:text-lg font-semibold mb-3 md:mb-4 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {insightStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredInsight(index)}
                onMouseLeave={() => setHoveredInsight(null)}
                className={`relative overflow-hidden p-3 md:p-4 rounded-xl ${stat.bgColor} border ${stat.borderColor} ${
                  isHalloweenMode
                    ? "shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                    : ""
                }`}
              >
                {isHalloweenMode && stat.title === "Most Productive" && (
                  <img
                    src={stat.decor}
                    alt=""
                    className="absolute top-0 left-0 w-8 h-8 md:w-12 md:h-12 opacity-30 pointer-events-none"
                  />
                )}
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p
                      className={`text-[10px] md:text-xs font-medium ${stat.color} mb-0.5 md:mb-1`}
                    >
                      {stat.title}
                    </p>
                    <p
                      className={`text-xl md:text-2xl font-bold ${stat.color}`}
                    >
                      {stat.value}
                    </p>
                    <p
                      className={`text-[10px] md:text-xs mt-0.5 md:mt-1 ${
                        isDark ? "text-[#71717A]" : "text-gray-500"
                      }`}
                    >
                      {stat.subtext}
                    </p>
                  </div>
                  <div
                    className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl ${stat.bgColor} flex items-center justify-center`}
                  >
                    {isHalloweenMode ? (
                      <motion.img
                        src={stat.decor}
                        alt=""
                        className="w-5 h-5 md:w-8 md:h-8 object-contain"
                        animate={
                          hoveredInsight === index
                            ? {
                                scale: [1, 1.2, 1],
                                rotate:
                                  index % 2 === 0
                                    ? [-10, 10, -10, 0]
                                    : [0, 5, -5, 0],
                                y: index % 2 !== 0 ? [0, -5, 0] : 0,
                              }
                            : { scale: 1, rotate: 0, y: 0 }
                        }
                        transition={{
                          duration: 0.6,
                          ease: "easeInOut",
                        }}
                      />
                    ) : (
                      <stat.icon
                        className={`w-4 h-4 md:w-6 md:h-6 ${stat.color}`}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
