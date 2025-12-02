import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  Clock,
  DollarSign,
  StickyNote,
  Timer,
  TrendingUp,
  Wallet,
} from "lucide-react";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  batHang,
  batSwoop,
  bgWitchGraveyard,
  candleTrio,
  cardBlueCemetary,
  cardLargeTree,
  cardPumpkinsStaring,
  catWitchHat,
  ghostDroopy,
  pumpkinScary,
  pumpkinSneaky,
  spiderCuteHanging,
  spiderSharpHanging,
  webCenter,
  webCornerLeft,
} from "@/assets";
import { DashboardDecorations } from "@/components/halloween/DashboardDecorations";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { useTheme } from "@/contexts/ThemeContext";
import { useJournalQuery } from "@/hooks/queries/useJournalQuery";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useTimeTracking } from "@/hooks/tasks/useTimeTracking";
import { useZombieTasks } from "@/hooks/tasks/useZombieTasks";
import { useAccounts } from "@/hooks/useAccounts";
import { useBudgets, useBudgetTransactions } from "@/hooks/useBudgets";
import { usePomodoro } from "@/hooks/usePomodoro";
import { FinancialInsightsCard } from "../components/budget/FinancialInsightsCard";
import { ProductivitySummaryCard } from "../components/dashboard/ProductivitySummaryCard";
import { GlassCard } from "../components/GlassCard";
import { ProductivityInsightsCard } from "../components/tasks/ProductivityInsightsCard";
import { ZombieTaskModal } from "../components/tasks/ZombieTaskModal";
import { useAuth } from "../contexts/AuthContext";
import { useNotes } from "../hooks/useNotes";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark, isHalloweenMode } = useTheme();
  const { notes, loading: notesLoading } = useNotes();
  const { tasks, loading: tasksLoading } = useTasks();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { budgets, loading: budgetsLoading } = useBudgets();
  const { transactions, loading: transactionsLoading } =
    useBudgetTransactions();
  const { data: journalEntries = [], isLoading: journalLoading } =
    useJournalQuery();
  const { getAllTimeStats, loading: pomodoroLoading } = usePomodoro();
  const { timeEntries, loading: timeLoading } = useTimeTracking();

  const { deadTasks } = useZombieTasks(tasks);
  const [showZombieModal, setShowZombieModal] = React.useState(false);
  const { resurrectTask, deleteTask } = useTasks();

  const dashboardStats = useMemo(() => {
    const completedTasks = tasks.filter((task) => task.completed).length;
    const activeTasks = tasks.filter((task) => !task.completed).length;
    const completionRate =
      tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    const highPriorityTasks = tasks.filter(
      (task) => task.priority === "high" && !task.completed,
    ).length;

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
    const budgetRemaining = totalBudget - totalSpent;

    const activeAccounts = accounts.filter((a) => a.is_active).length;

    const pomodoroStats = getAllTimeStats();

    const totalTimeTracked = timeEntries
      .filter((e) => e.duration_seconds)
      .reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
    const totalTimeHours = Math.floor(totalTimeTracked / 3600);

    return {
      completedTasks,
      activeTasks,
      completionRate,
      highPriorityTasks,
      totalBudget,
      totalSpent,
      budgetRemaining,
      activeAccounts,
      pomodoroStats,
      totalTimeHours,
    };
  }, [tasks, budgets, accounts, getAllTimeStats, timeEntries]);

  const quickActions = useMemo(
    () => [
      {
        title: "Tasks",
        description: "Manage your tasks",
        icon: CheckCircle,
        href: "/tasks",
        color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#10B981]",
        bgColor: isHalloweenMode
          ? "bg-[rgba(96,201,182,0.15)]"
          : isDark
            ? "bg-[rgba(16,185,129,0.1)]"
            : "bg-green-50",
      },
      {
        title: "Time Tracking",
        description: "Track your time",
        icon: Clock,
        href: "/time",
        color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#F59E0B]",
        bgColor: isHalloweenMode
          ? "bg-[rgba(96,201,182,0.15)]"
          : isDark
            ? "bg-[rgba(245,158,11,0.1)]"
            : "bg-amber-50",
      },
      {
        title: "Notes",
        description: "Your notes",
        icon: StickyNote,
        href: "/notes",
        color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]",
        bgColor: isHalloweenMode
          ? "bg-[rgba(96,201,182,0.15)]"
          : isDark
            ? "bg-[rgba(139,92,246,0.1)]"
            : "bg-purple-50",
      },
      {
        title: "Journal",
        description: "Daily entries",
        icon: BookOpen,
        href: "/journal",
        color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#3B82F6]",
        bgColor: isHalloweenMode
          ? "bg-[rgba(96,201,182,0.15)]"
          : isDark
            ? "bg-[rgba(59,130,246,0.1)]"
            : "bg-blue-50",
      },
      {
        title: "Pomodoro",
        description: "Focus sessions",
        icon: Timer,
        href: "/pomodoro",
        color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#EF4444]",
        bgColor: isHalloweenMode
          ? "bg-[rgba(96,201,182,0.15)]"
          : isDark
            ? "bg-[rgba(239,68,68,0.1)]"
            : "bg-red-50",
      },
      {
        title: "Finances",
        description: "Track spending",
        icon: DollarSign,
        href: "/finances",
        color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#06B6D4]",
        bgColor: isHalloweenMode
          ? "bg-[rgba(96,201,182,0.15)]"
          : isDark
            ? "bg-[rgba(6,182,212,0.1)]"
            : "bg-cyan-50",
      },
      {
        title: "Accounts",
        description: "Manage accounts",
        icon: Wallet,
        href: "/accounts",
        color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#EC4899]",
        bgColor: isHalloweenMode
          ? "bg-[rgba(96,201,182,0.15)]"
          : isDark
            ? "bg-[rgba(236,72,153,0.1)]"
            : "bg-pink-50",
      },
    ],
    [isDark, isHalloweenMode],
  );

  const isLoading =
    notesLoading ||
    tasksLoading ||
    accountsLoading ||
    budgetsLoading ||
    transactionsLoading ||
    journalLoading ||
    pomodoroLoading ||
    timeLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <DashboardDecorations />

      {/* Header Section */}
      <div
        className={`relative overflow-hidden md:p-6 md:rounded-xl md:backdrop-blur-xl md:border mb-4 md:mb-6 ${
          isDark
            ? "md:bg-[rgba(26,26,31,0.6)] md:border-[rgba(255,255,255,0.1)]"
            : "md:bg-white/90 md:border-gray-200/60 md:shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
        } ${
          isHalloweenMode
            ? "md:border-[rgba(96,201,182,0.2)] md:shadow-[0_0_20px_rgba(96,201,182,0.15)]"
            : ""
        } group`}
      >
        {isHalloweenMode && (
          <>
            {/* Background Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-5 z-0"
              style={{
                backgroundImage: `url(${bgWitchGraveyard})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "grayscale(100%)",
              }}
            />

            {/* Flying Bat Animation */}
            <motion.img
              src={batSwoop}
              alt=""
              className="absolute w-12 h-12 md:w-16 md:h-16 opacity-60 pointer-events-none z-0"
              initial={{ x: "-10%", y: "20%", rotate: -10 }}
              animate={{
                x: ["-10%", "110%"],
                y: ["20%", "40%", "10%"],
                rotate: [-10, 10, -5],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear",
                delay: 2,
              }}
            />

            {/* Peeking Pumpkin */}
            <motion.img
              src={pumpkinSneaky}
              alt=""
              className="absolute -bottom-4 -right-2 w-16 h-16 md:w-20 md:h-20 opacity-80 pointer-events-none z-10"
              initial={{ y: 20, rotate: 10 }}
              animate={{
                y: [20, 0, 20],
                rotate: [10, 0, 10],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Spider web thread */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-px bg-[#60c9b6] opacity-30 pointer-events-none"
              initial={{ top: "0%", height: "0%" }}
              animate={{ top: "0%", height: "55%" }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
            <img
              src={webCenter}
              alt=""
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 md:w-24 opacity-30 pointer-events-none"
            />
            <motion.img
              src={spiderSharpHanging}
              alt=""
              className="absolute left-1/2 -translate-x-1/2 w-5 md:w-6 opacity-50 pointer-events-none"
              initial={{ top: "0%", opacity: 0 }}
              animate={{
                top: "50%",
                opacity: 0.5,
                y: [0, 5, 0],
              }}
              transition={{
                top: { duration: 2, ease: "easeOut" },
                opacity: { duration: 1, delay: 0.5 },
                y: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                },
              }}
            />

            {/* Cute Spider Hanging */}
            <motion.img
              src={spiderCuteHanging}
              alt=""
              className="absolute top-0 right-10 w-8 md:w-10 opacity-60 pointer-events-none"
              initial={{ y: -50 }}
              animate={{ y: -10 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 10,
                delay: 1,
              }}
            />
          </>
        )}

        <div className="relative z-10 rounded-xl p-4 md:p-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1
                className={`text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2 ${
                  isHalloweenMode
                    ? "text-[#60c9b6] drop-shadow-[0_0_8px_rgba(96,201,182,0.5)]"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
                !
              </h1>
              <p
                className={`text-sm md:text-base ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
              >
                Here's an overview of your productivity workspace
              </p>
            </div>
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="text-left md:text-right">
                <p
                  className={`text-xs md:text-sm ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                >
                  Task Completion
                </p>
                <p
                  className={`text-xl md:text-2xl font-bold ${
                    isHalloweenMode ? "text-[#60c9b6]" : "text-[#10B981]"
                  }`}
                >
                  {dashboardStats.completionRate}%
                </p>
              </div>
              <TrendingUp
                className={`w-6 h-6 md:w-8 md:h-8 ${
                  isHalloweenMode ? "text-[#60c9b6]" : "text-[#10B981]"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
        {(() => {
          const cardDecorations = [
            spiderCuteHanging,
            batHang,
            ghostDroopy,
            candleTrio,
            pumpkinScary,
            catWitchHat,
            spiderCuteHanging,
          ];

          return [
            {
              title: "Tasks",
              value: tasks.length,
              icon: CheckCircle,
              color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#10B981]",
              bgColor: isHalloweenMode
                ? "bg-[rgba(96,201,182,0.15)]"
                : isDark
                  ? "bg-[rgba(16,185,129,0.1)]"
                  : "bg-green-50",
              borderColor: isHalloweenMode
                ? "border-[rgba(96,201,182,0.3)]"
                : "border-[rgba(16,185,129,0.2)]",
            },
            {
              title: "Notes",
              value: notes.length,
              icon: StickyNote,
              color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]",
              bgColor: isHalloweenMode
                ? "bg-[rgba(96,201,182,0.15)]"
                : isDark
                  ? "bg-[rgba(139,92,246,0.1)]"
                  : "bg-purple-50",
              borderColor: isHalloweenMode
                ? "border-[rgba(96,201,182,0.3)]"
                : "border-[rgba(139,92,246,0.2)]",
            },
            {
              title: "Journal",
              value: journalEntries.length,
              icon: BookOpen,
              color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#3B82F6]",
              bgColor: isHalloweenMode
                ? "bg-[rgba(96,201,182,0.15)]"
                : isDark
                  ? "bg-[rgba(59,130,246,0.1)]"
                  : "bg-blue-50",
              borderColor: isHalloweenMode
                ? "border-[rgba(96,201,182,0.3)]"
                : "border-[rgba(59,130,246,0.2)]",
            },
            {
              title: "Pomodoros",
              value: dashboardStats.pomodoroStats.completed,
              icon: Timer,
              color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#EF4444]",
              bgColor: isHalloweenMode
                ? "bg-[rgba(96,201,182,0.15)]"
                : isDark
                  ? "bg-[rgba(239,68,68,0.1)]"
                  : "bg-red-50",
              borderColor: isHalloweenMode
                ? "border-[rgba(96,201,182,0.3)]"
                : "border-[rgba(239,68,68,0.2)]",
            },
            {
              title: "Time (hrs)",
              value: dashboardStats.totalTimeHours,
              icon: Clock,
              color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#F59E0B]",
              bgColor: isHalloweenMode
                ? "bg-[rgba(96,201,182,0.15)]"
                : isDark
                  ? "bg-[rgba(245,158,11,0.1)]"
                  : "bg-amber-50",
              borderColor: isHalloweenMode
                ? "border-[rgba(96,201,182,0.3)]"
                : "border-[rgba(245,158,11,0.2)]",
            },
            {
              title: "Budgets",
              value: budgets.length,
              icon: DollarSign,
              color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#06B6D4]",
              bgColor: isHalloweenMode
                ? "bg-[rgba(96,201,182,0.15)]"
                : isDark
                  ? "bg-[rgba(6,182,212,0.1)]"
                  : "bg-cyan-50",
              borderColor: isHalloweenMode
                ? "border-[rgba(96,201,182,0.3)]"
                : "border-[rgba(6,182,212,0.2)]",
            },
            {
              title: "Accounts",
              value: dashboardStats.activeAccounts,
              icon: Wallet,
              color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#EC4899]",
              bgColor: isHalloweenMode
                ? "bg-[rgba(96,201,182,0.15)]"
                : isDark
                  ? "bg-[rgba(236,72,153,0.1)]"
                  : "bg-pink-50",
              borderColor: isHalloweenMode
                ? "border-[rgba(96,201,182,0.3)]"
                : "border-[rgba(236,72,153,0.2)]",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`relative overflow-hidden p-3 md:p-4 rounded-xl ${stat.bgColor} border ${stat.borderColor} ${
                isHalloweenMode ? "shadow-[0_0_10px_rgba(96,201,182,0.2)]" : ""
              }`}
            >
              {isHalloweenMode && (
                <img
                  src={cardDecorations[index]}
                  alt=""
                  className="absolute top-1 right-1 w-4 md:w-5 opacity-12 pointer-events-none"
                />
              )}
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p
                    className={`text-[10px] md:text-xs font-medium ${stat.color} mb-0.5 md:mb-1`}
                  >
                    {stat.title}
                  </p>
                  <p className={`text-base md:text-xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}
                >
                  <stat.icon
                    className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`}
                  />
                </div>
              </div>
            </motion.div>
          ));
        })()}
      </div>

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
                backgroundImage: `url(${[cardBlueCemetary, cardPumpkinsStaring, cardLargeTree][Math.floor(Math.random() * 3)]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            <img
              src={webCornerLeft}
              alt=""
              className="absolute top-0 left-0 w-12 md:w-16 opacity-20 pointer-events-none"
            />
            <img
              src={pumpkinSneaky}
              alt=""
              className="absolute top-2 right-2 w-8 md:w-10 opacity-15 pointer-events-none"
            />
          </>
        )}
        <div className="p-4 md:p-6 relative z-10">
          <h3
            className={`text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center space-x-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            <span>Quick Actions</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3 lg:gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.href}>
                <div
                  className={`group p-3 md:p-4 rounded-lg transition-all duration-200 cursor-pointer ${
                    isDark
                      ? isHalloweenMode
                        ? "bg-[rgba(40,40,45,0.3)] hover:bg-[rgba(96,201,182,0.08)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(96,201,182,0.3)]"
                        : "bg-[rgba(40,40,45,0.3)] hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]"
                      : "bg-white/50 hover:bg-white/80 border border-gray-200/50 hover:border-gray-300/70"
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-2 md:space-y-3">
                    <div
                      className={`p-2 md:p-3 rounded-lg ${action.bgColor} group-hover:scale-105 transition-transform duration-150`}
                    >
                      <action.icon
                        className={`w-4 h-4 md:w-5 md:h-5 ${action.color}`}
                      />
                    </div>
                    <div>
                      <h4
                        className={`font-medium text-xs md:text-sm transition-colors ${
                          isDark ? "text-white" : "text-gray-900"
                        } ${
                          isHalloweenMode
                            ? "group-hover:text-[#60c9b6]"
                            : "group-hover:text-[#8B5CF6]"
                        }`}
                      >
                        {action.title}
                      </h4>
                      <p
                        className={`text-[10px] md:text-xs mt-0.5 md:mt-1 hidden sm:block ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                      >
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* AI Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <FinancialInsightsCard
            transactions={transactions}
            budgets={budgets}
          />
        </div>
        <div className="lg:col-span-1">
          <ProductivityInsightsCard
            deadTasks={deadTasks}
            onResurrectClick={() => setShowZombieModal(true)}
          />
        </div>
      </div>

      {/* Daily Rituals Section */}
      <div className="w-full">
        <ProductivitySummaryCard
          tasks={tasks}
          dashboardStats={dashboardStats}
          journalEntries={journalEntries}
        />
      </div>

      <ZombieTaskModal
        isOpen={showZombieModal}
        onClose={() => setShowZombieModal(false)}
        deadTasks={deadTasks}
        onResurrect={resurrectTask}
        onDelete={async (taskId) => {
          await deleteTask(taskId);
        }}
      />
    </div>
  );
};
