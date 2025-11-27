import { motion } from "framer-motion";
import { Calendar, Edit, FolderOpen, List, Plus, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  batHang,
  batSwoop,
  bgSacredCatMoon,
  cardPumpkinsFullMoon,
  cardPumpkinThree,
  catArched,
  ghostJagged,
  ghostScare,
  pumpkinSneaky,
  spiderCuteHanging,
  spiderHairyCrawling,
  spiderSharpHanging,
  webCenter,
  webHanging,
  witchFly,
} from "@/assets";
import { GlassCard } from "@/components/GlassCard";
import { JournalCalendar } from "@/components/journal/JournalCalendar";
import { JournalEntriesModal } from "@/components/journal/JournalEntriesModal";
import { JournalEntryCreationModal } from "@/components/journal/JournalEntryCreationModal";
import { JournalEntryFilters } from "@/components/journal/JournalEntryFilters";
import { JournalEntryList } from "@/components/journal/JournalEntryList";
import { JournalEntryModal } from "@/components/journal/JournalEntryModal";
import { ProjectCreationModal } from "@/components/journal/ProjectCreationModal";
import { ProjectDetailsModal } from "@/components/journal/ProjectDetailsModal";
import { ProjectsList } from "@/components/journal/ProjectsList";
import {
  CalendarTabSkeleton,
  EntriesTabSkeleton,
  ProjectsTabSkeleton,
} from "@/components/skeletons/JournalSkeletons";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useCreateJournal,
  useDeleteJournal,
  useJournalQuery,
  useUpdateJournal,
} from "@/hooks/queries/useJournalQuery";
import { useProjectsQuery } from "@/hooks/queries/useProjectsQuery";
import {
  FilterType,
  SortType,
  useJournalFiltering,
} from "@/hooks/useJournalFiltering";
import {
  Journal as JournalEntry,
  JournalFormData,
  Project,
} from "@/types/journal";

type TabType = "entries" | "projects" | "calendar";

export const Journal: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();
  const { data: entries = [], isLoading: entriesLoading } = useJournalQuery();
  const { data: projects = [], isLoading: projectsLoading } =
    useProjectsQuery();

  const createEntryMutation = useCreateJournal();
  const updateEntryMutation = useUpdateJournal();
  const deleteEntryMutation = useDeleteJournal();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = (searchParams.get("tab") as TabType) || "entries";
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayEntries, setSelectedDayEntries] = useState<JournalEntry[]>(
    [],
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("newest");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const tabsRef = useRef<HTMLDivElement>(null);
  const entriesTabRef = useRef<HTMLButtonElement>(null);
  const projectsTabRef = useRef<HTMLButtonElement>(null);
  const calendarTabRef = useRef<HTMLButtonElement>(null);

  const [tabPosition, setTabPosition] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const initializeTabPosition = () => {
      const currentTab = entriesTabRef.current;
      if (currentTab && tabsRef.current) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const activeRect = currentTab.getBoundingClientRect();
        setTabPosition({
          left: activeRect.left - tabsRect.left,
          width: activeRect.width,
        });
      }
    };

    const timer = setTimeout(initializeTabPosition, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateTabPosition = () => {
      let currentTab: HTMLButtonElement | null;
      switch (activeTab) {
        case "entries":
          currentTab = entriesTabRef.current;
          break;
        case "projects":
          currentTab = projectsTabRef.current;
          break;
        case "calendar":
          currentTab = calendarTabRef.current;
          break;
        default:
          currentTab = null;
      }

      if (currentTab && tabsRef.current) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const activeRect = currentTab.getBoundingClientRect();
        setTabPosition({
          left: activeRect.left - tabsRect.left,
          width: activeRect.width,
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
  }, [activeTab]);

  const { sortedEntries } = useJournalFiltering({
    entries,
    filter,
    sortBy,
    searchTerm,
    selectedProjectId,
  });

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const todayEntries = entries.filter(
    (entry) => entry.entry_date === getTodayDate(),
  );

  const handleCreateEntry = useCallback(
    async (entryData: JournalFormData) => {
      if (!entryData.title.trim() || !entryData.content.trim()) return;

      setFormError(null);

      try {
        await createEntryMutation.mutateAsync(entryData);
        setShowEntryForm(false);
      } catch (error) {
        console.error("Failed to create daily entry:", error);
        setFormError("Failed to create daily entry. Please try again.");
        throw error;
      }
    },
    [createEntryMutation],
  );

  const handleUpdateEntry = useCallback(
    async (id: string, updates: Partial<JournalFormData>) => {
      try {
        await updateEntryMutation.mutateAsync({ id, updates });
      } catch (error) {
        console.error("Failed to update daily entry:", error);
        throw error;
      }
    },
    [updateEntryMutation],
  );

  const handleDeleteEntry = useCallback(
    async (id: string) => {
      try {
        await deleteEntryMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete daily entry:", error);
        throw error;
      }
    },
    [deleteEntryMutation],
  );

  const handleProjectDetailsClick = useCallback((project: Project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  }, []);

  const handleProjectDetailsEntryClick = useCallback((entryId: string) => {
    setShowProjectDetails(false);
    setSelectedEntry(entryId);
  }, []);

  const handleCreateProject = useCallback(() => {
    setEditingProject(null);
    setShowProjectForm(true);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  }, []);

  const closeProjectForm = useCallback(() => {
    setShowProjectForm(false);
    setEditingProject(null);
  }, []);

  const getTabDescription = () => {
    switch (activeTab) {
      case "entries":
        return "Track your daily progress and reflections";
      case "projects":
        return "Manage and organize your projects";
      case "calendar":
        return "View your journal entries in calendar format";
      default:
        return "Track your progress and reflections";
    }
  };

  const isLoading = entriesLoading || projectsLoading;

  if (isLoading && entries.length === 0) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section Skeleton */}
        <div className="mb-6 pt-4 md:pt-0">
          <div
            className={`md:p-6 md:rounded-xl md:backdrop-blur-xl md:border ${
              isHalloweenMode
                ? isDark
                  ? "md:bg-[rgba(96,201,182,0.1)] md:border-[rgba(96,201,182,0.2)]"
                  : "md:bg-white md:border-[rgba(96,201,182,0.2)] md:shadow-[0_0_20px_rgba(96,201,182,0.15)]"
                : isDark
                  ? "md:bg-[rgba(26,26,31,0.6)] md:border-[rgba(255,255,255,0.1)]"
                  : "md:bg-white/90 md:border-gray-200/60 md:shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
            }`}
          >
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
          {activeTab === "entries" && <EntriesTabSkeleton />}
          {activeTab === "projects" && <ProjectsTabSkeleton />}
          {activeTab === "calendar" && <CalendarTabSkeleton />}
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
                  backgroundImage: `url(${bgSacredCatMoon})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "grayscale(100%)",
                }}
              />

              {/* Flying Witch Animation */}
              <motion.img
                src={witchFly}
                alt=""
                className="absolute w-16 h-16 md:w-24 md:h-24 opacity-40 pointer-events-none z-0"
                initial={{ x: "-10%", y: "10%", rotate: -5 }}
                animate={{
                  x: ["-10%", "110%"],
                  y: ["10%", "30%", "5%"],
                  rotate: [-5, 5, -5],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 1,
                }}
              />

              {/* Arched Cat */}
              <motion.img
                src={catArched}
                alt=""
                className="absolute -bottom-2 -right-2 w-12 h-12 md:w-16 md:h-16 opacity-60 pointer-events-none z-10"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 0.6 }}
                transition={{ duration: 1, delay: 0.5 }}
              />

              {/* Spider web thread */}
              <motion.div
                className="absolute left-1/3 -translate-x-1/2 w-[1px] bg-[#60c9b6] opacity-30 pointer-events-none"
                initial={{ top: "0%", height: "0%" }}
                animate={{ top: "0%", height: "40%" }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
              <img
                src={webHanging}
                alt=""
                className="absolute top-0 left-1/3 -translate-x-1/2 w-16 md:w-20 opacity-30 pointer-events-none"
              />
              <motion.img
                src={spiderHairyCrawling}
                alt=""
                className="absolute left-1/3 -translate-x-1/2 w-6 md:w-8 opacity-50 pointer-events-none"
                initial={{ top: "0%", opacity: 0 }}
                animate={{
                  top: "40%",
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

              {/* Hanging Bat */}
              <motion.img
                src={batHang}
                alt=""
                className="absolute top-0 right-1/4 w-8 md:w-10 opacity-60 pointer-events-none"
                initial={{ y: -50 }}
                animate={{ y: -5 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 10,
                  delay: 1.5,
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
                className="absolute -top-6 -left-6 w-10 h-10 opacity-0 transition-opacity duration-300 group-hover:opacity-60 pointer-events-none rotate-12"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <h1
              className={`text-xl md:text-2xl font-bold ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : activeTab === "entries"
                    ? "text-[#10B981]"
                    : activeTab === "projects"
                      ? "text-[#8B5CF6]"
                      : "text-[#F59E0B]"
              } ${isHalloweenMode ? "drop-shadow-[0_0_8px_rgba(96,201,182,0.5)]" : ""}`}
            >
              {isHalloweenMode ? (
                <span className="font-creepster tracking-wider text-2xl md:text-3xl">
                  Journal
                </span>
              ) : (
                "Journal"
              )}
            </h1>
            {activeTab === "entries" && (
              <motion.button
                onClick={() => {
                  setShowEntryForm(true);
                  setFormError(null);
                }}
                className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                  isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                    : "bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] text-[#10B981] hover:bg-[rgba(16,185,129,0.3)]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Create new daily entry"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Entry</span>
              </motion.button>
            )}
            {activeTab === "projects" && (
              <motion.button
                onClick={handleCreateProject}
                className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                  isHalloweenMode
                    ? "bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)]"
                    : "bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Create new project"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </motion.button>
            )}
          </div>
          <p
            className={`relative z-10 text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
          >
            {getTabDescription()}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 md:mb-8">
        <div ref={tabsRef} className="relative flex space-x-1 sm:space-x-2">
          {/* Sliding Background */}
          <motion.div
            className="absolute top-0 bottom-0 rounded-lg border"
            animate={{
              left: tabPosition.left,
              width: tabPosition.width,
              backgroundColor: isHalloweenMode
                ? "rgba(96,201,182,0.2)"
                : activeTab === "entries"
                  ? "rgba(16,185,129,0.2)"
                  : activeTab === "projects"
                    ? "rgba(139,92,246,0.2)"
                    : "rgba(245,158,11,0.2)",
              borderColor: isHalloweenMode
                ? "rgba(96,201,182,0.3)"
                : activeTab === "entries"
                  ? "rgba(16,185,129,0.3)"
                  : activeTab === "projects"
                    ? "rgba(139,92,246,0.3)"
                    : "rgba(245,158,11,0.3)",
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          />
          {isHalloweenMode && (
            <motion.div
              className="absolute top-0 bottom-0 rounded-lg"
              animate={{
                left: tabPosition.left,
                width: tabPosition.width,
                boxShadow: [
                  "0 0 8px rgba(96,201,182,0.25), inset 0 0 6px rgba(96,201,182,0.15)",
                  "0 0 12px rgba(96,201,182,0.35), inset 0 0 8px rgba(96,201,182,0.2)",
                  "0 0 8px rgba(96,201,182,0.25), inset 0 0 6px rgba(96,201,182,0.15)",
                ],
              }}
              transition={{
                left: { type: "spring", stiffness: 400, damping: 30 },
                width: { type: "spring", stiffness: 400, damping: 30 },
                boxShadow: {
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            />
          )}

          <button
            ref={entriesTabRef}
            onClick={() => handleTabChange("entries")}
            className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
              activeTab === "entries"
                ? isHalloweenMode
                  ? "text-[#60c9b6]"
                  : "text-[#10B981]"
                : isHalloweenMode
                  ? "text-gray-500 dark:text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                  : "text-gray-500 dark:text-[#B4B4B8] hover:bg-[rgba(16,185,129,0.1)] hover:text-[#10B981]"
            }`}
          >
            <List className="w-4 h-4 inline mr-1 sm:mr-2" />
            Entries
          </button>
          <button
            ref={projectsTabRef}
            onClick={() => handleTabChange("projects")}
            className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
              activeTab === "projects"
                ? isHalloweenMode
                  ? "text-[#60c9b6]"
                  : "text-[#8B5CF6]"
                : isHalloweenMode
                  ? "text-gray-500 dark:text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                  : "text-gray-500 dark:text-[#B4B4B8] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8B5CF6]"
            }`}
          >
            <FolderOpen className="w-4 h-4 inline mr-1 sm:mr-2" />
            Projects
          </button>
          <button
            ref={calendarTabRef}
            onClick={() => handleTabChange("calendar")}
            className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
              activeTab === "calendar"
                ? isHalloweenMode
                  ? "text-[#60c9b6]"
                  : "text-[#F59E0B]"
                : isHalloweenMode
                  ? "text-gray-500 dark:text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                  : "text-gray-500 dark:text-[#B4B4B8] hover:bg-[rgba(245,158,11,0.1)] hover:text-[#F59E0B]"
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-1 sm:mr-2" />
            Calendar
          </button>
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "entries" && (
          <GlassCard variant="secondary" className="overflow-hidden relative">
            {isHalloweenMode && (
              <>
                <div
                  className="absolute inset-0 pointer-events-none opacity-5 z-0"
                  style={{
                    backgroundImage: `url(${cardPumpkinThree})`,
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

                <img
                  src={webCenter}
                  alt=""
                  className="absolute -top-2 right-1 w-20 md:w-24 opacity-40 pointer-events-none"
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
            <div className="relative z-10">
              {todayEntries.length > 0 && (
                <div className="p-4 md:p-6 border-b border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.03)]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base md:text-lg font-semibold text-[#10B981]">
                      Today's Entries ({todayEntries.length})
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {todayEntries.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                          isHalloweenMode
                            ? isDark
                              ? "bg-[rgba(40,40,45,0.4)] hover:bg-[rgba(96,201,182,0.08)] hover:shadow-[0_0_15px_rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.1)] hover:border-[rgba(96,201,182,0.3)]"
                              : "bg-gray-50 hover:bg-[rgba(96,201,182,0.1)] hover:shadow-[0_0_15px_rgba(96,201,182,0.15)] border border-[rgba(96,201,182,0.2)] hover:border-[rgba(96,201,182,0.4)]"
                            : isDark
                              ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.08)]"
                              : "bg-white border border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedEntry(entry.id)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4
                              className="font-medium truncate text-sm md:text-base"
                              style={{
                                color: isHalloweenMode
                                  ? "#60c9b6"
                                  : entry.project?.color ||
                                    (isDark ? "#fff" : "#111827"),
                              }}
                            >
                              {entry.title}
                            </h4>
                            <p
                              className={`text-xs md:text-sm mt-1 line-clamp-2 break-words ${
                                isDark ? "text-[#B4B4B8]" : "text-gray-600"
                              }`}
                            >
                              {entry.content}
                            </p>
                            <div
                              className={`text-xs mt-2 ${
                                isDark ? "text-[#71717A]" : "text-gray-500"
                              }`}
                            >
                              <span>
                                {new Date(entry.created_at).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-start sm:flex-col gap-2 sm:gap-0 sm:space-y-1.5 sm:ml-4">
                            {entry.project && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap`}
                                style={{
                                  backgroundColor: `${entry.project.color}20`,
                                  color: entry.project.color,
                                }}
                              >
                                {entry.project.name}
                              </span>
                            )}
                            <div className="flex sm:flex-col space-x-1.5 sm:space-x-0 sm:space-y-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEntry(entry.id);
                                }}
                                className={`p-2 rounded transition-colors cursor-pointer ${
                                  isDark
                                    ? "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]"
                                    : "bg-gray-100 hover:bg-gray-200"
                                }`}
                                title="Edit entry"
                              >
                                <Edit
                                  className="w-4 h-4"
                                  style={{
                                    color: entry.project?.color || "#10B981",
                                  }}
                                />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEntryToDelete(entry.id);
                                }}
                                className={`p-2 rounded transition-colors cursor-pointer ${
                                  isDark
                                    ? "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]"
                                    : "bg-gray-100 hover:bg-gray-200"
                                }`}
                                title="Delete entry"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              <JournalEntryFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filter={filter}
                onFilterChange={setFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                selectedProjectId={selectedProjectId}
                onProjectChange={setSelectedProjectId}
                projects={projects}
              />
              <JournalEntryList
                entries={sortedEntries}
                onEntryClick={setSelectedEntry}
                onDeleteEntry={setEntryToDelete}
              />
            </div>
          </GlassCard>
        )}

        {activeTab === "projects" && (
          <GlassCard variant="secondary" className="overflow-hidden relative">
            {isHalloweenMode && (
              <>
                <div
                  className="absolute inset-0 pointer-events-none opacity-5 z-0"
                  style={{
                    backgroundImage: `url(${cardPumpkinsFullMoon})`,
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
                  initial={{ x: "110%", y: "10%", rotate: 10 }}
                  animate={{
                    x: ["110%", "-10%"],
                    y: ["10%", "30%", "5%"],
                    rotate: [10, -10, 5],
                  }}
                  transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 5,
                  }}
                />

                {/* Ghost appearing on hover */}
                <motion.img
                  src={ghostScare}
                  alt=""
                  className="absolute -top-6 -left-6 w-10 h-10 opacity-0 transition-opacity duration-300 group-hover:opacity-60 pointer-events-none rotate-12"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </>
            )}
            <div className="relative z-10">
              <ProjectsList
                onEntryClick={setSelectedEntry}
                onProjectDetailsClick={handleProjectDetailsClick}
                onCreateProject={handleCreateProject}
                onEditProject={handleEditProject}
              />
            </div>
          </GlassCard>
        )}

        {activeTab === "calendar" && (
          <GlassCard variant="secondary" className="overflow-hidden">
            <JournalCalendar
              entries={entries}
              onEntryClick={setSelectedEntry}
              onDayClick={(date, dayEntries) => {
                setSelectedDate(date);
                setSelectedDayEntries(dayEntries);
              }}
            />
          </GlassCard>
        )}
      </motion.div>

      <JournalEntryCreationModal
        isOpen={showEntryForm}
        onClose={() => {
          setShowEntryForm(false);
          setFormError(null);
        }}
        onSubmit={handleCreateEntry}
        projects={projects}
        isCreating={createEntryMutation.isPending}
        error={formError}
      />

      <JournalEntryModal
        entry={
          selectedEntry
            ? entries.find((e) => e.id === selectedEntry) || null
            : null
        }
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onUpdate={handleUpdateEntry}
        onDelete={async (entryId) => {
          await handleDeleteEntry(entryId);
          setSelectedEntry(null);
        }}
        projects={projects}
      />

      <ConfirmationModal
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={async () => {
          if (entryToDelete) {
            await handleDeleteEntry(entryToDelete);
            setEntryToDelete(null);
          }
        }}
        title="Delete Entry"
        description="Are you sure you want to delete this entry?"
        itemTitle={
          entryToDelete
            ? entries.find((e) => e.id === entryToDelete)?.title
            : undefined
        }
        itemDescription={
          entryToDelete
            ? entries
                .find((e) => e.id === entryToDelete)
                ?.content.slice(0, 100) + "..."
            : undefined
        }
        confirmText="Delete Entry"
        type="danger"
      />

      <ProjectCreationModal
        isOpen={showProjectForm}
        onClose={closeProjectForm}
        project={editingProject}
      />

      <ProjectDetailsModal
        project={selectedProject}
        isOpen={showProjectDetails}
        onClose={() => setShowProjectDetails(false)}
        entries={entries}
        onEntryClick={handleProjectDetailsEntryClick}
      />

      <JournalEntriesModal
        isOpen={selectedDate !== null}
        onClose={() => {
          setSelectedDate(null);
          setSelectedDayEntries([]);
        }}
        date={selectedDate || new Date()}
        entries={selectedDayEntries}
        onEntryClick={(entryId) => {
          setSelectedEntry(entryId);
          setSelectedDate(null);
          setSelectedDayEntries([]);
        }}
      />
    </motion.div>
  );
};
