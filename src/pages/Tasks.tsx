import { motion } from "framer-motion";
import { Calendar, FolderOpen, Kanban, List, Plus, Skull } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  bgPumpkinOutsideWindow,
  candleFive,
  catFluffy,
  ghostJagged,
  skullStaring,
  spiderHairyCrawling,
} from "@/assets";
import { GlassCard } from "@/components/GlassCard";
import {
  CalendarTabSkeleton,
  ProjectsTabSkeleton,
  TasksTabSkeleton,
} from "@/components/skeletons/TaskSkeletons";
import { BulkOperationsBar } from "@/components/tasks/BulkOperationsBar";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { KanbanProjectSelector } from "@/components/tasks/KanbanProjectSelector";
import { ProjectDetails } from "@/components/tasks/ProjectDetails.tsx";
import { ProjectList } from "@/components/tasks/ProjectList";
import { TaskCreationModal } from "@/components/tasks/TaskCreationModal";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskStats } from "@/components/tasks/TaskStats";
import { TasksCalendar } from "@/components/tasks/TasksCalendar.tsx";
import { ZombieTaskModal } from "@/components/tasks/ZombieTaskModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { FilterType, SortType, TaskFormData } from "@/constants/taskConstants";
import { useTheme } from "@/contexts/ThemeContext";
import { useTaskFiltering } from "@/hooks/tasks/useTaskFiltering";
import { useTaskOperations } from "@/hooks/tasks/useTaskOperations";
import { useTaskSelection } from "@/hooks/tasks/useTaskSelection";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useZombieTasks } from "@/hooks/tasks/useZombieTasks";
import { useArchivedProjects } from "@/hooks/useArchivedProjects";
import { useProjects } from "@/hooks/useProjects";
import { useSpookyAI } from "@/hooks/useSpookyAI";
import { Task } from "@/types/task";

type TabType = "tasks" | "calendar" | "projects" | "kanban";

export const Tasks: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();
  const {
    tasks,
    loading,
    createTask,
    toggleTask,
    deleteTask,
    updateTask,
    isCreating,
    resurrectTask,
  } = useTasks();
  const { addToGrimoire } = useSpookyAI();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = (searchParams.get("tab") as TabType) || "tasks";
  const projectFromUrl = searchParams.get("project");
  const [currentView, setCurrentView] = useState<TabType>(tabFromUrl);

  const handleTabChange = (tab: TabType) => {
    setCurrentView(tab);
    const params: Record<string, string> = { tab };
    setSearchParams(params);
  };

  const [selectedProject, setSelectedProject] = useState<string | null>(
    projectFromUrl,
  );
  const [selectedKanbanProject, setSelectedKanbanProject] = useState<
    string | null
  >(projectFromUrl && tabFromUrl === "kanban" ? projectFromUrl : null);

  React.useEffect(() => {
    if (projectFromUrl && currentView === "projects") {
      setSelectedProject(projectFromUrl);
    }
    if (projectFromUrl && currentView === "kanban") {
      setSelectedKanbanProject(projectFromUrl);
    }
  }, [projectFromUrl, currentView]);

  const handleKanbanProjectSelect = (projectName: string) => {
    setSelectedKanbanProject(projectName);
    setSearchParams({ tab: "kanban", project: projectName });
  };

  const handleKanbanBack = () => {
    setSelectedKanbanProject(null);
    setSearchParams({ tab: "kanban" });
  };
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("pending");
  const [sortBy, setSortBy] = useState<SortType>("created");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [prefilledProject, setPrefilledProject] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showZombieModal, setShowZombieModal] = useState(false);

  const { deadTasks, hasZombies } = useZombieTasks(tasks);

  const tabsRef = useRef<HTMLDivElement>(null);
  const tasksTabRef = useRef<HTMLButtonElement>(null);
  const calendarTabRef = useRef<HTMLButtonElement>(null);
  const projectsTabRef = useRef<HTMLButtonElement>(null);
  const kanbanTabRef = useRef<HTMLButtonElement>(null);

  const [tabPosition, setTabPosition] = useState({
    left: 0,
    width: 0,
    top: 0,
    height: 0,
  });

  useEffect(() => {
    const initializeTabPosition = () => {
      const activeTab = tasksTabRef.current;
      if (activeTab && tabsRef.current) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const activeRect = activeTab.getBoundingClientRect();
        setTabPosition({
          left: activeRect.left - tabsRect.left,
          width: activeRect.width,
          top: activeRect.top - tabsRect.top,
          height: activeRect.height,
        });
      }
    };

    const timer = setTimeout(initializeTabPosition, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateTabPosition = () => {
      let activeTab: HTMLButtonElement | null;
      switch (currentView) {
        case "tasks":
          activeTab = tasksTabRef.current;
          break;
        case "calendar":
          activeTab = calendarTabRef.current;
          break;
        case "projects":
          activeTab = projectsTabRef.current;
          break;
        case "kanban":
          activeTab = kanbanTabRef.current;
          break;
        default:
          activeTab = null;
      }

      if (activeTab && tabsRef.current) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const activeRect = activeTab.getBoundingClientRect();
        setTabPosition({
          left: activeRect.left - tabsRect.left,
          width: activeRect.width,
          top: activeRect.top - tabsRect.top,
          height: activeRect.height,
        });
      }
    };

    const timer1 = setTimeout(updateTabPosition, 50);
    const timer2 = setTimeout(updateTabPosition, 100);
    const timer3 = setTimeout(updateTabPosition, 200);

    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateTabPosition();
      }, 150);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", debouncedResize);
    };
  }, [currentView]);

  const taskSelection = useTaskSelection({ tasks });
  const {
    selectedTasks,
    handleSelectTask,
    handleSelectAll,
    handleDeselectAll,
  } = taskSelection;

  const taskOperations = useTaskOperations({
    updateTask: async (
      taskId: string,
      updates: { completed: boolean; updated_at: string },
    ) => {
      await updateTask(taskId, updates);
    },
    deleteTask: async (taskId: string) => {
      await deleteTask(taskId);
    },
    onSelectionClear: taskSelection.clearSelection,
  });

  const { filteredTasks, sortedTasks } = useTaskFiltering({
    tasks,
    filter,
    sortBy,
    searchTerm,
    projectFilter,
  });

  const { projects, getTasksByProject } = useProjects(tasks);
  const { isArchived } = useArchivedProjects();

  const handleCreateTask = useCallback(
    async (taskData: TaskFormData) => {
      if (!taskData.title.trim()) return;

      setFormError(null);

      try {
        await createTask({
          ...taskData,
          due_date: taskData.due_date || undefined,
        });

        // Auto-index for search
        const content = taskData.description
          ? `${taskData.title}\n\n${taskData.description}`
          : taskData.title;
        await addToGrimoire(content, {
          type: "task",
          priority: taskData.priority || "medium",
          status: "pending",
          due_date: taskData.due_date,
          project: taskData.project,
        });

        setShowTaskForm(false);
        toast.success("Task created successfully!");
      } catch (error) {
        console.error("Failed to create task:", error);
        setFormError("Failed to create task. Please try again.");
        toast.error("Failed to create task. Please try again.");
        throw error;
      }
    },
    [createTask, addToGrimoire],
  );

  const handleBulkComplete = useCallback(async () => {
    await taskOperations.handleBulkComplete(selectedTasks);
  }, [selectedTasks, taskOperations]);

  const handleBulkIncomplete = useCallback(async () => {
    try {
      await taskOperations.markTasksIncomplete(selectedTasks);
      taskSelection.clearSelection();
      toast.success(`${selectedTasks.length} tasks marked as incomplete`);
    } catch (error) {
      toast.error("Failed to mark tasks as incomplete");
    }
  }, [selectedTasks, taskOperations, taskSelection]);

  const handleBulkDelete = useCallback(() => {
    setShowBulkDeleteModal(true);
  }, []);

  const confirmBulkDelete = useCallback(async () => {
    await taskOperations.handleBulkDelete(selectedTasks);
    setShowBulkDeleteModal(false);
  }, [selectedTasks, taskOperations]);

  const getViewDescription = useCallback(() => {
    switch (currentView) {
      case "calendar":
        return "View your tasks in a monthly calendar layout";
      case "projects":
        return selectedProject
          ? `Managing tasks for ${selectedProject} project`
          : "Organize your tasks by projects";
      case "kanban":
        return selectedKanbanProject
          ? `Kanban board for ${selectedKanbanProject} project`
          : "Select a project to visualize your workflow with drag-and-drop";
      default:
        return "Organize and track all your tasks in one place";
    }
  }, [currentView, selectedProject, selectedKanbanProject]);

  if (loading && tasks.length === 0) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section Skeleton */}
        <div className="mb-6 pt-4 md:pt-0">
          <div className="md:p-6 md:rounded-xl md:backdrop-blur-xl md:bg-[rgba(26,26,31,0.6)] md:border md:border-[rgba(255,255,255,0.1)]">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <Skeleton className="h-6 md:h-7 w-28 md:w-32" />
              <Skeleton className="h-6 md:h-7 w-20 md:w-24 rounded-lg" />
            </div>
            <Skeleton className="h-3 md:h-4 w-48 md:w-64" />
          </div>
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="mb-8">
          <div className="relative flex space-x-2">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>

        {/* Content Skeleton - Tab-specific */}
        <GlassCard variant="secondary" className="overflow-hidden">
          {currentView === "tasks" && <TasksTabSkeleton />}
          {currentView === "projects" && <ProjectsTabSkeleton />}
          {currentView === "calendar" && <CalendarTabSkeleton />}
          {currentView === "kanban" && <TasksTabSkeleton />}
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <div className="mb-6 pt-4 md:pt-0">
        <div
          className={`relative overflow-hidden md:p-6 md:rounded-xl md:backdrop-blur-xl md:border ${
            isHalloweenMode
              ? "md:bg-[rgba(26,26,31,0.6)] md:border-[rgba(96,201,182,0.2)] md:shadow-[0_0_20px_rgba(96,201,182,0.15)]"
              : isDark
                ? "md:bg-[rgba(26,26,31,0.6)] md:border-[rgba(255,255,255,0.1)]"
                : "md:bg-white/90 md:border-gray-200/60 md:shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
          } group`}
        >
          {isHalloweenMode && (
            <>
              {/* Background Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-10 z-0"
                style={{
                  backgroundImage: `url(${bgPumpkinOutsideWindow})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "grayscale(100%)",
                }}
              />

              {/* Fluffy Cat Sitting */}
              <motion.img
                src={catFluffy}
                alt=""
                className="absolute -bottom-2 right-4 w-12 h-12 md:w-16 md:h-16 opacity-80 pointer-events-none z-10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 0.8, x: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              />

              {/* Candles */}
              <motion.img
                src={candleFive}
                alt=""
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-20 md:w-20 opacity-60 pointer-events-none z-10"
                animate={{ opacity: [0.6, 0.8, 0.6] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Crawling Spider */}
              <motion.img
                src={spiderHairyCrawling}
                alt=""
                className="absolute top-10 left-10 w-8 md:w-10 opacity-50 pointer-events-none"
                animate={{
                  y: [0, 20, 0],
                  x: [0, 10, 0],
                  rotate: [0, 10, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}
          <div className="relative z-10 flex items-start justify-between gap-3 mb-1.5">
            {/* Ghost appearing on hover */}
            {isHalloweenMode && (
              <motion.img
                src={ghostJagged}
                alt=""
                className="absolute -top-8 right-20 w-12 h-12 opacity-0 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none"
                animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            )}
            <h1
              className={`text-xl md:text-2xl font-bold ${
                isHalloweenMode
                  ? "text-[#60c9b6] drop-shadow-[0_0_8px_rgba(96,201,182,0.5)]"
                  : currentView === "tasks"
                    ? "text-[#10B981]"
                    : currentView === "projects"
                      ? "text-[#F59E0B]"
                      : currentView === "kanban"
                        ? "text-[#EC4899]"
                        : "text-[#8B5CF6]"
              }`}
            >
              Task Manager
            </h1>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setShowZombieModal(true)}
                className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/20 border border-[#60c9b6]/30 text-[#60c9b6] hover:bg-[#60c9b6]/30"
                    : "bg-red-100 border border-red-200 text-red-600 hover:bg-red-200"
                } ${hasZombies ? "animate-pulse" : ""}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isHalloweenMode ? (
                  <img src={skullStaring} alt="" className="w-4 h-4" />
                ) : (
                  <Skull className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  Resurrect {hasZombies ? `(${deadTasks.length})` : ""}
                </span>
              </motion.button>
              <motion.button
                onClick={() => {
                  setShowTaskForm(true);
                  setFormError(null);
                }}
                className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                  isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                    : "bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] text-[#10B981] hover:bg-[rgba(16,185,129,0.3)]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </motion.button>
            </div>
          </div>
          <p
            className={`relative z-10 text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
          >
            {getViewDescription()}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 md:mb-8">
        <div ref={tabsRef} className="relative flex flex-wrap gap-1 sm:gap-2">
          {/* Sliding Background */}
          <motion.div
            className="absolute rounded-lg border"
            animate={{
              left: tabPosition.left,
              width: tabPosition.width,
              top: tabPosition.top,
              height: tabPosition.height,
              backgroundColor: isHalloweenMode
                ? "rgba(96,201,182,0.2)"
                : currentView === "tasks"
                  ? "rgba(16,185,129,0.2)"
                  : currentView === "projects"
                    ? "rgba(245,158,11,0.2)"
                    : currentView === "kanban"
                      ? "rgba(236,72,153,0.2)"
                      : "rgba(139,92,246,0.2)",
              borderColor: isHalloweenMode
                ? "rgba(96,201,182,0.3)"
                : currentView === "tasks"
                  ? "rgba(16,185,129,0.3)"
                  : currentView === "projects"
                    ? "rgba(245,158,11,0.3)"
                    : currentView === "kanban"
                      ? "rgba(236,72,153,0.3)"
                      : "rgba(139,92,246,0.3)",
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          />
          {isHalloweenMode && (
            <motion.div
              className="absolute rounded-lg"
              animate={{
                left: tabPosition.left,
                width: tabPosition.width,
                top: tabPosition.top,
                height: tabPosition.height,
                boxShadow: [
                  "0 0 8px rgba(96,201,182,0.25), inset 0 0 6px rgba(96,201,182,0.15)",
                  "0 0 12px rgba(96,201,182,0.35), inset 0 0 8px rgba(96,201,182,0.2)",
                  "0 0 8px rgba(96,201,182,0.25), inset 0 0 6px rgba(96,201,182,0.15)",
                ],
              }}
              transition={{
                left: { type: "spring", stiffness: 400, damping: 30 },
                width: { type: "spring", stiffness: 400, damping: 30 },
                top: { type: "spring", stiffness: 400, damping: 30 },
                height: { type: "spring", stiffness: 400, damping: 30 },
                boxShadow: {
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            />
          )}

          <button
            ref={tasksTabRef}
            onClick={() => handleTabChange("tasks")}
            className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
              currentView === "tasks"
                ? isHalloweenMode
                  ? "text-[#60c9b6]"
                  : "text-[#10B981]"
                : isDark
                  ? isHalloweenMode
                    ? "text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                    : "text-[#B4B4B8] hover:bg-[rgba(16,185,129,0.1)] hover:text-[#10B981]"
                  : isHalloweenMode
                    ? "text-gray-600 hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                    : "text-gray-600 hover:bg-[rgba(16,185,129,0.1)] hover:text-[#10B981]"
            }`}
          >
            <List className="w-4 h-4 inline mr-1 sm:mr-2" />
            Tasks
          </button>
          <button
            ref={kanbanTabRef}
            onClick={() => handleTabChange("kanban")}
            className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
              currentView === "kanban"
                ? isHalloweenMode
                  ? "text-[#60c9b6]"
                  : "text-[#EC4899]"
                : isDark
                  ? isHalloweenMode
                    ? "text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                    : "text-[#B4B4B8] hover:bg-[rgba(236,72,153,0.1)] hover:text-[#EC4899]"
                  : isHalloweenMode
                    ? "text-gray-600 hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                    : "text-gray-600 hover:bg-[rgba(236,72,153,0.1)] hover:text-[#EC4899]"
            }`}
          >
            <Kanban className="w-4 h-4 inline mr-1 sm:mr-2" />
            Kanban
          </button>
          <button
            ref={projectsTabRef}
            onClick={() => {
              handleTabChange("projects");
              setSelectedProject(null);
            }}
            className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
              currentView === "projects"
                ? isHalloweenMode
                  ? "text-[#60c9b6]"
                  : "text-[#F59E0B]"
                : isDark
                  ? isHalloweenMode
                    ? "text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                    : "text-[#B4B4B8] hover:bg-[rgba(245,158,11,0.1)] hover:text-[#F59E0B]"
                  : isHalloweenMode
                    ? "text-gray-600 hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                    : "text-gray-600 hover:bg-[rgba(245,158,11,0.1)] hover:text-[#F59E0B]"
            }`}
          >
            <FolderOpen className="w-4 h-4 inline mr-1 sm:mr-2" />
            Projects
          </button>

          {/* Force break on mobile/tablet */}
          <div className="w-full h-0 md:hidden" />

          <button
            ref={calendarTabRef}
            onClick={() => handleTabChange("calendar")}
            className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
              currentView === "calendar"
                ? isHalloweenMode
                  ? "text-[#60c9b6]"
                  : "text-[#8B5CF6]"
                : isDark
                  ? isHalloweenMode
                    ? "text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                    : "text-[#B4B4B8] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8B5CF6]"
                  : isHalloweenMode
                    ? "text-gray-600 hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                    : "text-gray-600 hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8B5CF6]"
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-1 sm:mr-2" />
            Calendar
          </button>
        </div>
      </div>

      {currentView === "calendar" ? (
        <TasksCalendar
          tasks={tasks}
          onTaskClick={(task) => setSelectedTask(task.id)}
        />
      ) : currentView === "kanban" ? (
        selectedKanbanProject ? (
          <KanbanBoard
            tasks={tasks}
            projectName={selectedKanbanProject}
            onBack={handleKanbanBack}
            onUpdateTask={async (taskId: string, updates: Partial<Task>) => {
              await updateTask(taskId, updates);
            }}
            onDeleteTask={async (taskId: string) => {
              setTaskToDelete(taskId);
            }}
            onTaskClick={setSelectedTask}
            onCreateTask={() => {
              setPrefilledProject(selectedKanbanProject);
              setShowTaskForm(true);
              setFormError(null);
            }}
          />
        ) : (
          <KanbanProjectSelector
            projects={projects}
            onProjectSelect={handleKanbanProjectSelect}
          />
        )
      ) : currentView === "projects" ? (
        selectedProject ? (
          <ProjectDetails
            project={projects.find((p) => p.name === selectedProject)!}
            tasks={getTasksByProject(selectedProject)}
            selectedTasks={selectedTasks}
            onSelectTask={handleSelectTask}
            onToggleTask={async (taskId: string) => {
              await toggleTask(taskId);
            }}
            onDeleteTask={async (taskId: string) => {
              setTaskToDelete(taskId);
            }}
            onTaskClick={setSelectedTask}
            onBack={() => setSelectedProject(null)}
          />
        ) : (
          <ProjectList
            projects={projects}
            onProjectClick={setSelectedProject}
          />
        )
      ) : (
        <div className="space-y-6">
          <TaskStats tasks={tasks} />

          {selectedTasks.length > 0 && (
            <BulkOperationsBar
              selectedCount={selectedTasks.length}
              totalCount={filteredTasks.length}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onBulkComplete={handleBulkComplete}
              onBulkIncomplete={handleBulkIncomplete}
              onBulkDelete={handleBulkDelete}
            />
          )}

          <GlassCard variant="secondary" className="overflow-hidden">
            <TaskFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filter={filter}
              onFilterChange={setFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              projectFilter={projectFilter}
              onProjectFilterChange={setProjectFilter}
              availableProjects={projects.map((p) => p.name)}
            />
            <TaskList
              tasks={sortedTasks}
              selectedTasks={selectedTasks}
              onSelectTask={handleSelectTask}
              onToggleTask={async (taskId: string) => {
                await toggleTask(taskId);
              }}
              onDeleteTask={async (taskId: string) => {
                setTaskToDelete(taskId);
              }}
              onTaskClick={setSelectedTask}
            />
          </GlassCard>
        </div>
      )}

      <TaskCreationModal
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setFormError(null);
          setPrefilledProject("");
        }}
        onSubmit={handleCreateTask}
        isCreating={isCreating}
        error={formError}
        defaultProject={prefilledProject}
        existingProjects={projects
          .map((p) => p.name)
          .filter((name) => name !== "Unassigned" && !isArchived(name))}
      />

      <TaskDetailModal
        task={
          selectedTask ? tasks.find((t) => t.id === selectedTask) || null : null
        }
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={async (taskId, updates) => {
          await updateTask(taskId, updates);
        }}
        onDelete={async (taskId) => {
          await deleteTask(taskId);
          setSelectedTask(null);
        }}
        onToggleComplete={async (taskId) => {
          await toggleTask(taskId);
        }}
        existingProjects={projects
          .map((p) => p.name)
          .filter((name) => name !== "Unassigned" && !isArchived(name))}
      />

      <ConfirmationModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={async () => {
          if (taskToDelete) {
            try {
              await deleteTask(taskToDelete);
              setTaskToDelete(null);
              toast.success("Task deleted successfully!");
            } catch (error) {
              console.error("Failed to delete task:", error);
              toast.error("Failed to delete task. Please try again.");
            }
          }
        }}
        title="Delete Task"
        description="Are you sure you want to delete this task?"
        itemTitle={
          taskToDelete
            ? tasks.find((t) => t.id === taskToDelete)?.title
            : undefined
        }
        itemDescription={
          taskToDelete
            ? tasks.find((t) => t.id === taskToDelete)?.description
            : undefined
        }
        confirmText="Delete"
        type="danger"
      />

      <ConfirmationModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Tasks"
        description={`Are you sure you want to delete ${selectedTasks.length} selected tasks? This action cannot be undone.`}
        confirmText={`Delete ${selectedTasks.length} Tasks`}
        type="danger"
      />

      <ZombieTaskModal
        isOpen={showZombieModal}
        onClose={() => setShowZombieModal(false)}
        deadTasks={deadTasks}
        onResurrect={resurrectTask}
        onDelete={async (taskId) => {
          await deleteTask(taskId);
        }}
      />
    </motion.div>
  );
};
