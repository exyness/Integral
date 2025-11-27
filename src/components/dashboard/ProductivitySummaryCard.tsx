import { motion } from "framer-motion";
import { Activity, BookOpen, CheckCircle, Timer } from "lucide-react";
import React from "react";
import {
  cardPumpkinsFullMoon,
  cardPumpkinThree,
  cardThemedHouses,
  ghostScare,
  spiderCuteHanging,
} from "@/assets";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/contexts/ThemeContext";
import { Task } from "@/types/task";

interface ProductivitySummaryCardProps {
  tasks: Task[];
  dashboardStats: {
    completionRate: number;
    completedTasks: number;
    activeTasks: number;
    highPriorityTasks: number;
    pomodoroStats: {
      completed: number;
      totalMinutes: number;
    };
  };
  journalEntries: { entry_date: string }[];
}

export const ProductivitySummaryCard: React.FC<
  ProductivitySummaryCardProps
> = ({ tasks, dashboardStats, journalEntries }) => {
  const { isDark, isHalloweenMode } = useTheme();

  const journalThisMonth = journalEntries.filter((e) => {
    const entryDate = new Date(e.entry_date);
    const now = new Date();
    return (
      entryDate.getMonth() === now.getMonth() &&
      entryDate.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <GlassCard
      className={`relative overflow-hidden ${
        isHalloweenMode
          ? "border-[rgba(96,201,182,0.4)]! shadow-[0_0_15px_rgba(96,201,182,0.15)]!"
          : ""
      }`}
    >
      {isHalloweenMode && (
        <>
          {/* Background Image */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none z-0"
            style={{
              backgroundImage: `url(${[cardPumpkinThree, cardPumpkinsFullMoon, cardThemedHouses][Math.floor(Math.random() * 3)]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <motion.img
            src={spiderCuteHanging}
            alt=""
            className="absolute top-0 right-10 w-8 opacity-40 pointer-events-none"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          />
          <img
            src={ghostScare}
            alt=""
            className="absolute -bottom-4 -left-4 w-16 opacity-10 pointer-events-none rotate-12"
          />
        </>
      )}

      <div className="p-4 md:p-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3
            className={`text-lg md:text-xl font-bold flex items-center space-x-2 ${
              isHalloweenMode
                ? "text-[#60c9b6] font-creepster tracking-wide"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            {isHalloweenMode ? null : (
              <Activity className="w-5 h-5 text-blue-500" />
            )}
            <span>
              {isHalloweenMode ? "Daily Rituals" : "Productivity Pulse"}
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700/50">
          {/* Task Section */}
          <div className="space-y-4 pb-4 md:pb-0 md:pr-6">
            <div className="flex items-center justify-between mb-2">
              <h4
                className={`font-medium flex items-center gap-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <CheckCircle
                  className={`w-4 h-4 ${
                    isHalloweenMode ? "text-[#60c9b6]" : "text-green-500"
                  }`}
                />
                Tasks
              </h4>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/10 text-[#60c9b6]"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                }`}
              >
                {dashboardStats.completionRate}% Done
              </span>
            </div>

            <div className="relative pt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                  Progress
                </span>
                <span
                  className={`font-bold ${
                    isHalloweenMode ? "text-[#60c9b6]" : "text-green-600"
                  }`}
                >
                  {dashboardStats.completedTasks} / {tasks.length}
                </span>
              </div>
              <div
                className={`w-full h-2 rounded-full overflow-hidden ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <motion.div
                  className={`h-full rounded-full ${
                    isHalloweenMode ? "bg-[#60c9b6]" : "bg-green-500"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${dashboardStats.completionRate}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div
                className={`p-2 rounded-lg ${
                  isDark ? "bg-gray-800/50" : "bg-gray-50"
                }`}
              >
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  Active
                </p>
                <p
                  className={`text-lg font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {dashboardStats.activeTasks}
                </p>
              </div>
              <div
                className={`p-2 rounded-lg ${
                  isDark ? "bg-gray-800/50" : "bg-gray-50"
                }`}
              >
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  High Priority
                </p>
                <p
                  className={`text-lg font-bold ${
                    isHalloweenMode ? "text-[#F59E0B]" : "text-red-500"
                  }`}
                >
                  {dashboardStats.highPriorityTasks}
                </p>
              </div>
            </div>
          </div>

          {/* Pomodoro Section */}
          <div className="space-y-4 py-4 md:py-0 md:px-6">
            <div className="flex items-center justify-between mb-2">
              <h4
                className={`font-medium flex items-center gap-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Timer
                  className={`w-4 h-4 ${
                    isHalloweenMode ? "text-[#F59E0B]" : "text-red-500"
                  }`}
                />
                Focus
              </h4>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                  isHalloweenMode
                    ? "border-[#F59E0B]/20 text-[#F59E0B]"
                    : "border-red-100 dark:border-red-900/30 text-red-500"
                }`}
              >
                <div className="text-center">
                  <span className="block text-xl font-bold leading-none">
                    {dashboardStats.pomodoroStats.completed}
                  </span>
                </div>
              </div>
              <div>
                <p
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  Sessions Completed
                </p>
                <p
                  className={`text-2xl font-bold ${
                    isHalloweenMode
                      ? "text-[#F59E0B]"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {dashboardStats.pomodoroStats.totalMinutes}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    min
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Journal Section */}
          <div className="space-y-4 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center justify-between mb-2">
              <h4
                className={`font-medium flex items-center gap-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <BookOpen
                  className={`w-4 h-4 ${
                    isHalloweenMode ? "text-[#60c9b6]" : "text-blue-500"
                  }`}
                />
                Journal
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className={`p-3 rounded-xl border ${
                  isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                    : isDark
                      ? "bg-blue-900/10 border-blue-800/30"
                      : "bg-blue-50 border-blue-100"
                }`}
              >
                <p
                  className={`text-xs mb-1 ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  Total Entries
                </p>
                <p
                  className={`text-2xl font-bold ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : "text-blue-700 dark:text-blue-300"
                  }`}
                >
                  {journalEntries.length}
                </p>
              </div>
              <div
                className={`p-3 rounded-xl border ${
                  isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                    : isDark
                      ? "bg-blue-900/10 border-blue-800/30"
                      : "bg-blue-50 border-blue-100"
                }`}
              >
                <p
                  className={`text-xs mb-1 ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  This Month
                </p>
                <p
                  className={`text-2xl font-bold ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : "text-blue-700 dark:text-blue-300"
                  }`}
                >
                  {journalThisMonth}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
