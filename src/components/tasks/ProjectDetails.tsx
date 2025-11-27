import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, Folder, Search } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  batHang,
  batSwoop,
  candleTrio,
  cardThemedHouses,
  catWitchHat,
  ghostDroopy,
  ghostScare,
  pumpkinScary,
  spiderCuteHanging,
  witchFly,
} from "@/assets";
import { GlassCard } from "@/components/GlassCard";
import { Dropdown } from "@/components/ui/Dropdown";
import { FilterType, SortType } from "@/constants/taskConstants";
import { useTheme } from "@/contexts/ThemeContext";
import { Project } from "@/hooks/useProjects";
import { Task } from "@/types/task";
import { ProjectAnalyticsModal } from "./ProjectAnalyticsModal";
import { TaskList } from "./TaskList";

interface ProjectDetailsProps {
  project: Project;
  tasks: Task[];
  selectedTasks: string[];
  onSelectTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onTaskClick: (taskId: string) => void;
  onBack: () => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  tasks,
  selectedTasks,
  onSelectTask,
  onToggleTask,
  onDeleteTask,
  onTaskClick,
  onBack,
}) => {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { isDark, isHalloweenMode } = useTheme();
  const [_searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("created");

  React.useEffect(() => {
    setSearchParams({ tab: "projects", project: project.name });
  }, [project.name, setSearchParams]);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filter === "completed") {
      filtered = filtered.filter((task) => task.completed);
    } else if (filter === "pending") {
      filtered = filtered.filter((task) => !task.completed);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "created":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "dueDate":
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return (
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          );
        case "priority": {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        default:
          return 0;
      }
    });

    return sorted;
  }, [tasks, searchTerm, filter, sortBy]);

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const taskCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = taskCount - completedCount;
  const completionRate =
    taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  const statCards = [
    {
      title: "Total Tasks",
      value: taskCount,
      icon: Folder,
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
      title: "Completed",
      value: completedCount,
      icon: null, // Custom rendering for dot
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
      title: "Pending",
      value: pendingCount,
      icon: null, // Custom rendering for dot
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
      title: "Progress",
      value: `${completionRate}%`,
      icon: BarChart3,
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
  ];

  const halloweenIcons = [pumpkinScary, catWitchHat, ghostScare, candleTrio];
  const cardDecorations = [spiderCuteHanging, batHang, ghostDroopy, batSwoop];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <GlassCard
        className={`mb-6 ${
          isHalloweenMode
            ? "bg-[#1a1a1f] border border-[#60c9b6]/30 shadow-[0_0_15px_rgba(96,201,182,0.2)]"
            : ""
        }`}
      >
        <div className="p-6">
          {/* Top Section - Back Button and Title */}
          <div className="mb-6">
            {/* Back Button */}
            <button
              onClick={onBack}
              className={`p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer mb-3 ${
                isHalloweenMode
                  ? "hover:bg-[#60c9b6]/20"
                  : isDark
                    ? "hover:bg-[rgba(255,255,255,0.05)]"
                    : "hover:bg-gray-100"
              }`}
            >
              <ArrowLeft
                className={`w-4 h-4 md:w-5 md:h-5 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-[#B4B4B8]"
                      : "text-gray-600"
                }`}
              />
            </button>

            {/* Project Info and Analytics Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div
                  className={`p-2 md:p-3 rounded-lg ${
                    isHalloweenMode
                      ? "bg-[#60c9b6]/10"
                      : isDark
                        ? "bg-[rgba(139,92,246,0.1)]"
                        : "bg-purple-100"
                  }`}
                >
                  <Folder
                    className={`w-5 h-5 md:w-6 md:h-6 ${
                      isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"
                    }`}
                  />
                </div>
                <div>
                  <h1
                    className={`text-lg md:text-2xl font-bold ${
                      isHalloweenMode
                        ? "text-[#60c9b6] font-creepster tracking-wide"
                        : isDark
                          ? "text-white"
                          : "text-gray-900"
                    }`}
                  >
                    {project.name}
                  </h1>
                  <p
                    className={`text-xs md:text-sm ${
                      isHalloweenMode
                        ? "text-[#60c9b6]/70"
                        : isDark
                          ? "text-[#B4B4B8]"
                          : "text-gray-600"
                    }`}
                  >
                    Project Overview
                  </p>
                </div>
              </div>

              {/* Full Analytics Button - Desktop Only */}
              <motion.button
                onClick={() => setShowAnalytics(true)}
                className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/10 border border-[#60c9b6]/30 text-[#60c9b6] hover:bg-[#60c9b6]/20"
                    : isDark
                      ? "bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)]"
                      : "bg-purple-100 border border-purple-200 text-[#8B5CF6] hover:bg-purple-200"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Full Analytics</span>
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 relative">
            {isHalloweenMode && (
              <>
                <img
                  src={batSwoop}
                  alt=""
                  className="absolute -top-6 -left-4 w-12 md:w-16 opacity-20 pointer-events-none z-0 animate-pulse"
                />
                <img
                  src={witchFly}
                  alt=""
                  className="absolute -top-8 right-10 w-16 md:w-20 opacity-15 pointer-events-none z-0"
                />
              </>
            )}
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`relative overflow-hidden p-3 md:p-4 rounded-xl ${stat.bgColor} border ${stat.borderColor} ${
                  isHalloweenMode
                    ? "shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                    : ""
                }`}
              >
                {isHalloweenMode && (
                  <img
                    src={cardDecorations[index]}
                    alt=""
                    className="absolute top-1 right-1 w-4 md:w-5 opacity-12 pointer-events-none"
                  />
                )}
                <div className="flex items-center justify-between relative z-10 mb-1 md:mb-2">
                  <span
                    className={`text-[10px] md:text-xs font-medium ${stat.color}`}
                  >
                    {stat.title}
                  </span>
                  {stat.icon ? (
                    <stat.icon
                      className={`w-3 h-3 md:w-4 md:h-4 ${stat.color}`}
                    />
                  ) : (
                    <div
                      className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${
                        isHalloweenMode
                          ? "bg-[#60c9b6]"
                          : stat.title === "Completed"
                            ? "bg-[#10B981]"
                            : "bg-[#F59E0B]"
                      }`}
                    ></div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-lg md:text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  {isHalloweenMode && (
                    <motion.img
                      src={halloweenIcons[index]}
                      alt=""
                      className="w-6 h-6 md:w-8 md:h-8 object-contain opacity-80"
                      animate={
                        hoveredCard === index
                          ? {
                              scale: [1, 1.2, 1],
                              rotate:
                                index === 0
                                  ? [-10, 10, -10, 0]
                                  : index === 2
                                    ? [0, 5, -5, 0]
                                    : 0,
                              y: index === 1 ? [0, -5, 0] : 0,
                            }
                          : { scale: 1, rotate: 0, y: 0 }
                      }
                      transition={{
                        duration: 0.6,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-sm font-medium ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
              >
                Overall Progress
              </span>
              <span
                className={`text-sm ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
              >
                {completedCount} of {taskCount} completed
              </span>
            </div>
            <div
              className={`w-full rounded-full h-2.5 ${isDark ? "bg-[rgba(255,255,255,0.08)]" : "bg-gray-200"}`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-linear-to-r from-[#10B981] to-[#059669] h-2.5 rounded-full"
              />
            </div>
          </div>

          {/* Full Analytics Button - Mobile Only */}
          <motion.button
            onClick={() => setShowAnalytics(true)}
            className={`md:hidden w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-[#8B5CF6] transition-colors cursor-pointer text-sm ${isDark ? "bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] hover:bg-[rgba(139,92,246,0.3)]" : "bg-purple-100 border border-purple-200 hover:bg-purple-200"}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Full Analytics</span>
          </motion.button>
        </div>
      </GlassCard>

      {/* Tasks List with Filters */}
      <GlassCard variant="secondary" className="overflow-hidden relative">
        {isHalloweenMode && (
          <div
            className="absolute inset-0 pointer-events-none opacity-10 z-0"
            style={{
              backgroundImage: `url(${cardThemedHouses})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "grayscale(100%)",
            }}
          />
        )}
        {/* Search and Filters */}
        <div className="space-y-4 p-4 md:p-6 border-b border-[rgba(255,255,255,0.1)] relative z-10">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-[#71717A]"
                      : "text-gray-500"
                }`}
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none transition-colors text-sm ${
                  isHalloweenMode
                    ? "bg-[#1a1a1f]/50 border border-[#60c9b6]/20 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6]"
                    : isDark
                      ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6]"
                      : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6]"
                }`}
              />
            </div>

            {/* Filters and Sort Controls - Side by Side on Mobile */}
            <div className="flex gap-3 lg:shrink-0">
              {/* Status Filter - Takes 1/3 on mobile */}
              <div className="flex-1 lg:w-40 lg:flex-none">
                <Dropdown
                  value={filter}
                  onValueChange={(value) => setFilter(value as FilterType)}
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "all", label: "All" },
                    { value: "completed", label: "Completed" },
                  ]}
                  placeholder="Filter"
                />
              </div>

              {/* Sort Dropdown - Takes 2/3 on mobile */}
              <div className="flex-2 lg:w-48 lg:flex-none">
                <Dropdown
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortType)}
                  options={[
                    { value: "created", label: "Created" },
                    { value: "dueDate", label: "Due Date" },
                    { value: "priority", label: "Priority" },
                  ]}
                  placeholder="Sort"
                />
              </div>
            </div>
          </div>

          {/* Results count */}
          <div
            className={`text-xs md:text-sm ${isDark ? "text-[#71717A]" : "text-gray-500"}`}
          >
            {filteredAndSortedTasks.length}{" "}
            {filteredAndSortedTasks.length === 1 ? "task" : "tasks"} found
          </div>
        </div>

        <div className="relative z-10">
          <TaskList
            tasks={filteredAndSortedTasks}
            selectedTasks={selectedTasks}
            onSelectTask={onSelectTask}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            onTaskClick={onTaskClick}
          />
        </div>
      </GlassCard>

      {/* Analytics Modal */}
      <ProjectAnalyticsModal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        projectName={project.name}
        tasks={tasks}
      />
    </motion.div>
  );
};
