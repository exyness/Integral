import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Coffee,
  FileText,
  Folder,
  ListTodo,
  Pause,
  Play,
  RotateCcw,
  Square,
  Zap,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  cardBlueCemetary,
  cardPurpleWitchhouse,
  cardStaryCatEyes,
} from "@/assets";
import { GlassCard } from "@/components/GlassCard";
import { Checkbox } from "@/components/ui/Checkbox";
import { ComboBox } from "@/components/ui/ComboBox";
import { Dropdown } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
import { useTheme } from "@/contexts/ThemeContext";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useArchivedProjects } from "@/hooks/useArchivedProjects";
import { PomodoroMode, usePomodoro } from "@/hooks/usePomodoro";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import AnimatedCount from "./AnimatedNumbers";
import { PomodoroHistory } from "./PomodoroHistory";

interface PomodoroTimerProps {
  onSessionComplete?: () => void;
  onModeChange?: (mode: PomodoroMode | "history") => void;
  initialMode?: PomodoroMode | "history";
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  onSessionComplete,
  onModeChange,
  initialMode,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const {
    settings,
    createSession,
    pauseSession,
    resumeSession,
    completeSession,
  } = usePomodoro();
  const { tasks } = useTasks();
  const { isArchived } = useArchivedProjects();
  const [mode, setMode] = useState<PomodoroMode | "history">(
    initialMode || "work",
  );
  const [timeLeft, setTimeLeft] = useState(settings.work_duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [sessionNotes, setSessionNotes] = useState<string>("");
  const [customDuration, setCustomDuration] = useState<number>(
    settings.work_duration,
  );
  const [showCustomTimer, setShowCustomTimer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<
    PomodoroMode | "history" | null
  >(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("pomodoroState");
    if (savedState) {
      const {
        mode: savedMode,
        timeLeft: savedTimeLeft,
        isRunning: savedIsRunning,
        isPaused: savedIsPaused,
        currentSessionId: savedSessionId,
        lastTick,
        customDuration: savedCustomDuration,
        sessionNotes: savedNotes,
        selectedTaskId: savedTaskId,
      } = JSON.parse(savedState);

      // Calculate elapsed time if running
      let adjustedTimeLeft = savedTimeLeft;
      if (savedIsRunning && lastTick) {
        const elapsed = Math.floor((Date.now() - lastTick) / 1000);
        adjustedTimeLeft = Math.max(0, savedTimeLeft - elapsed);
      }

      setMode(savedMode);
      setTimeLeft(adjustedTimeLeft);
      setIsRunning(savedIsRunning);
      setIsPaused(savedIsPaused);
      setCurrentSessionId(savedSessionId);
      setCustomDuration(savedCustomDuration);
      setSessionNotes(savedNotes);
      setSelectedTaskId(savedTaskId);
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    const state = {
      mode,
      timeLeft,
      isRunning,
      isPaused,
      currentSessionId,
      lastTick: Date.now(),
      customDuration,
      sessionNotes,
      selectedTaskId,
    };
    localStorage.setItem("pomodoroState", JSON.stringify(state));
  }, [
    mode,
    timeLeft,
    isRunning,
    isPaused,
    currentSessionId,
    customDuration,
    sessionNotes,
    selectedTaskId,
  ]);

  const availableProjects = useMemo(() => {
    const projects = new Set<string>();
    tasks.forEach((task) => {
      if (task.project && !isArchived(task.project)) {
        projects.add(task.project);
      }
    });
    return Array.from(projects).sort();
  }, [tasks, isArchived]);

  const activeTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          !task.completed &&
          (selectedProject === "all" || task.project === selectedProject),
      ),
    [tasks, selectedProject],
  );

  const getModeConfig = () => {
    if (isHalloweenMode) {
      return {
        text: "text-[#60c9b6]",
        bg: "bg-[rgba(96,201,182,0.1)]",
        border: "border-[rgba(96,201,182,0.2)]",
        from: "#60c9b6",
        to: "#2dd4bf",
        label:
          mode === "work"
            ? "Focus Time"
            : mode === "short_break"
              ? "Short Break"
              : "Long Break",
        icon:
          mode === "work"
            ? Zap
            : mode === "short_break" || mode === "long_break"
              ? Coffee
              : Calendar,
      };
    }

    switch (mode) {
      case "work":
        return {
          text: "text-[#EF4444]",
          bg: isDark ? "bg-[rgba(239,68,68,0.1)]" : "bg-red-50",
          border: isDark ? "border-[rgba(239,68,68,0.2)]" : "border-red-100",
          from: "#EF4444",
          to: "#F87171",
          label: "Focus Time",
          icon: Zap,
        };
      case "short_break":
        return {
          text: "text-[#10B981]",
          bg: isDark ? "bg-[rgba(16,185,129,0.1)]" : "bg-emerald-50",
          border: isDark
            ? "border-[rgba(16,185,129,0.2)]"
            : "border-emerald-100",
          from: "#10B981",
          to: "#34D399",
          label: "Short Break",
          icon: Coffee,
        };
      case "long_break":
        return {
          text: "text-[#3B82F6]",
          bg: isDark ? "bg-[rgba(59,130,246,0.1)]" : "bg-blue-50",
          border: isDark ? "border-[rgba(59,130,246,0.2)]" : "border-blue-100",
          from: "#3B82F6",
          to: "#60A5FA",
          label: "Long Break",
          icon: Coffee,
        };
      default:
        return {
          text: "text-[#8B5CF6]",
          bg: isDark ? "bg-[rgba(139,92,246,0.1)]" : "bg-purple-50",
          border: isDark
            ? "border-[rgba(139,92,246,0.2)]"
            : "border-purple-100",
          from: "#8B5CF6",
          to: "#A78BFA",
          label: "History",
          icon: Calendar,
        };
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      minutes: mins.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
      display: `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
    };
  };

  const startTimer = useCallback(async () => {
    if (mode === "history") return;

    if (!currentSessionId) {
      let duration;
      if (showCustomTimer) {
        duration = customDuration;
      } else {
        duration =
          mode === "work"
            ? settings.work_duration
            : mode === "short_break"
              ? settings.short_break_duration
              : settings.long_break_duration;
      }

      const session = await createSession(
        mode,
        duration,
        selectedTaskId || undefined,
        sessionNotes || undefined,
      );
      if (session) {
        setCurrentSessionId(session.id);
      }
    }
    setIsRunning(true);
  }, [
    mode,
    settings,
    createSession,
    currentSessionId,
    selectedTaskId,
    sessionNotes,
    showCustomTimer,
    customDuration,
  ]);

  const pauseTimer = useCallback(async () => {
    setIsRunning(false);
    setIsPaused(true);
    if (currentSessionId) {
      await pauseSession(currentSessionId);
    }
  }, [currentSessionId, pauseSession]);

  const resumeTimer = useCallback(async () => {
    setIsRunning(true);
    setIsPaused(false);
    if (currentSessionId) {
      await resumeSession(currentSessionId);
    }
  }, [currentSessionId, resumeSession]);

  const stopTimer = useCallback(async () => {
    setIsRunning(false);
    setIsPaused(false);
    if (currentSessionId) {
      await completeSession(currentSessionId);
      setCurrentSessionId(null);
    }
    const duration =
      mode === "work"
        ? settings.work_duration
        : mode === "short_break"
          ? settings.short_break_duration
          : settings.long_break_duration;
    setTimeLeft(duration * 60);
  }, [mode, settings, currentSessionId, completeSession]);

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    const duration =
      mode === "work"
        ? settings.work_duration
        : mode === "short_break"
          ? settings.short_break_duration
          : settings.long_break_duration;
    setTimeLeft(duration * 60);
  };

  const switchMode = useCallback(
    (newMode: PomodoroMode | "history") => {
      // If timer is running, just change the view mode (handled by setMode)
      // But we need to decide if we want to stop the timer or not.
      // For now, let's allow switching tabs without stopping if it's just a view change.
      // However, standard Pomodoro behavior usually implies switching mode = switching timer type.
      // But user requested "if I change tabs... it marks as incomplete".
      // So we will ONLY reset if the user explicitly resets or if the timer is NOT running.

      if (isPaused) {
        // If paused, we warn the user to prevent accidental loss of session state
        if (newMode === "history") {
          setMode(newMode);
          return;
        }

        setPendingMode(newMode);
        setIsConfirmDialogOpen(true);
        return;
      }

      setMode(newMode);
      onModeChange?.(newMode);

      if (newMode === "history") return;

      setIsRunning(false);
      setIsPaused(false);
      setCurrentSessionId(null);

      const defaultDuration =
        newMode === "work"
          ? settings.work_duration
          : newMode === "short_break"
            ? settings.short_break_duration
            : settings.long_break_duration;

      setCustomDuration(defaultDuration);

      setTimeLeft(defaultDuration * 60);
    },
    [settings, onModeChange, isPaused],
  );

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && currentSessionId) {
      setIsRunning(false);
      completeSession(currentSessionId);
      setCurrentSessionId(null);

      if (mode === "work") {
        const newCompletedSessions = completedSessions + 1;
        setCompletedSessions(newCompletedSessions);
        if (newCompletedSessions % settings.sessions_until_long_break === 0) {
          switchMode("long_break");
        } else {
          switchMode("short_break");
        }
      } else {
        switchMode("work");
      }

      onSessionComplete?.();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    isRunning,
    timeLeft,
    mode,
    completedSessions,
    settings,
    switchMode,
    currentSessionId,
    completeSession,
    onSessionComplete,
  ]);

  const progress = () => {
    const totalDuration =
      mode === "work"
        ? settings.work_duration * 60
        : mode === "short_break"
          ? settings.short_break_duration * 60
          : settings.long_break_duration * 60;
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  const config = getModeConfig();
  const time = formatTime(timeLeft);
  const ModeIcon = config.icon;

  const tabsRef = useRef<HTMLDivElement>(null);
  const workTabRef = useRef<HTMLButtonElement>(null);
  const shortBreakTabRef = useRef<HTMLButtonElement>(null);
  const longBreakTabRef = useRef<HTMLButtonElement>(null);
  const historyTabRef = useRef<HTMLButtonElement>(null);
  const [tabPosition, setTabPosition] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const updateTabPosition = () => {
      let activeTab: HTMLButtonElement | null;
      switch (mode) {
        case "work":
          activeTab = workTabRef.current;
          break;
        case "short_break":
          activeTab = shortBreakTabRef.current;
          break;
        case "long_break":
          activeTab = longBreakTabRef.current;
          break;
        case "history":
          activeTab = historyTabRef.current;
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
  }, [mode]);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div>
        <div ref={tabsRef} className="relative flex space-x-1 sm:space-x-2">
          {/* Sliding Background */}
          <motion.div
            className="absolute top-0 bottom-0 rounded-lg border"
            animate={{
              left: tabPosition.left,
              width: tabPosition.width,
              backgroundColor: isHalloweenMode
                ? "rgba(96,201,182,0.2)"
                : mode === "work"
                  ? "rgba(239,68,68,0.2)"
                  : mode === "short_break"
                    ? "rgba(16,185,129,0.2)"
                    : mode === "long_break"
                      ? "rgba(59,130,246,0.2)"
                      : "rgba(139,92,246,0.2)",
              borderColor: isHalloweenMode
                ? "rgba(96,201,182,0.3)"
                : mode === "work"
                  ? "rgba(239,68,68,0.3)"
                  : mode === "short_break"
                    ? "rgba(16,185,129,0.3)"
                    : mode === "long_break"
                      ? "rgba(59,130,246,0.3)"
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
            ref={workTabRef}
            onClick={() => switchMode("work")}
            className={`relative z-10 px-2 sm:px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
              mode === "work"
                ? isHalloweenMode
                  ? "text-[#60c9b6]"
                  : "text-[#EF4444]"
                : isHalloweenMode
                  ? "text-gray-500 dark:text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                  : isDark
                    ? "text-[#B4B4B8] hover:bg-[rgba(239,68,68,0.1)] hover:text-[#EF4444]"
                    : "text-gray-600 hover:bg-[rgba(239,68,68,0.1)] hover:text-[#EF4444]"
            }`}
          >
            <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 inline mr-1 sm:mr-1.5 md:mr-2" />
            <span>Focus</span>
          </button>
          <button
            ref={shortBreakTabRef}
            onClick={() => switchMode("short_break")}
            className={`relative z-10 px-2 sm:px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
              mode === "short_break"
                ? isHalloweenMode
                  ? "text-[#60c9b6]"
                  : "text-[#10B981]"
                : isHalloweenMode
                  ? "text-gray-500 dark:text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                  : isDark
                    ? "text-[#B4B4B8] hover:bg-[rgba(16,185,129,0.1)] hover:text-[#10B981]"
                    : "text-gray-600 hover:bg-[rgba(16,185,129,0.1)] hover:text-[#10B981]"
            }`}
          >
            <Coffee className="w-3.5 h-3.5 md:w-4 md:h-4 inline mr-1 sm:mr-1.5 md:mr-2" />
            <span className="hidden sm:inline">Short Break</span>
            <span className="sm:hidden">Short</span>
          </button>
          <button
            ref={longBreakTabRef}
            onClick={() => switchMode("long_break")}
            className={`relative z-10 px-2 sm:px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
              mode === "long_break"
                ? isHalloweenMode
                  ? "text-[#60c9b6]"
                  : "text-[#3B82F6]"
                : isHalloweenMode
                  ? "text-gray-500 dark:text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                  : isDark
                    ? "text-[#B4B4B8] hover:bg-[rgba(59,130,246,0.1)] hover:text-[#3B82F6]"
                    : "text-gray-600 hover:bg-[rgba(59,130,246,0.1)] hover:text-[#3B82F6]"
            }`}
          >
            <Coffee className="w-3.5 h-3.5 md:w-4 md:h-4 inline mr-1 sm:mr-1.5 md:mr-2" />
            <span className="hidden sm:inline">Long Break</span>
            <span className="sm:hidden">Long</span>
          </button>
          <button
            ref={historyTabRef}
            onClick={() => switchMode("history")}
            className={`relative z-10 px-2 sm:px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
              mode === "history"
                ? isHalloweenMode
                  ? "text-[#60c9b6]"
                  : "text-[#8B5CF6]"
                : isHalloweenMode
                  ? "text-gray-500 dark:text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                  : isDark
                    ? "text-[#B4B4B8] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8B5CF6]"
                    : "text-gray-600 hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8B5CF6]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 inline mr-1 sm:mr-1.5 md:mr-2" />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* Conditional Content - Timer or History */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {mode === "history" ? (
          <div className="space-y-6">
            {/* Active Session Indicator */}
            {(isRunning || isPaused) && (
              <GlassCard
                className={`p-4 flex items-center justify-between relative overflow-hidden ${
                  isHalloweenMode
                    ? "border-[rgba(96,201,182,0.4)]! shadow-[0_0_15px_rgba(96,201,182,0.2)]!"
                    : isDark
                      ? "border-purple-500/20 bg-purple-500/5"
                      : "border-purple-200 bg-purple-50"
                }`}
              >
                {isHalloweenMode && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-10 z-0"
                    style={{
                      backgroundImage: `url(${cardPurpleWitchhouse})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: "grayscale(100%)",
                    }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.1)] text-[#60c9b6]"
                        : isDark
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isHalloweenMode
                          ? "text-[#60c9b6]"
                          : isDark
                            ? "text-white"
                            : "text-gray-900"
                      }`}
                    >
                      Active Session
                    </p>
                    <p
                      className={`text-2xl font-bold font-mono ${
                        isHalloweenMode
                          ? "text-[#60c9b6]"
                          : isDark
                            ? "text-white"
                            : "text-gray-900"
                      }`}
                    >
                      {time.display}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex items-center gap-2">
                  {isRunning ? (
                    <button
                      onClick={pauseTimer}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        isHalloweenMode
                          ? "bg-[rgba(96,201,182,0.1)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.2)]"
                          : isDark
                            ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                            : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                      }`}
                    >
                      <Pause className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={resumeTimer}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        isHalloweenMode
                          ? "bg-[rgba(96,201,182,0.1)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.2)]"
                          : isDark
                            ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                            : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                      }`}
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={stopTimer}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isHalloweenMode
                        ? "bg-[rgba(239,68,68,0.1)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)]"
                        : isDark
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                    }`}
                  >
                    <Square className="w-5 h-5" />
                  </button>
                </div>
              </GlassCard>
            )}
            <PomodoroHistory />
          </div>
        ) : (
          /* Main Timer Display */
          <GlassCard
            className={`p-4 md:p-8 lg:p-12 relative overflow-hidden transition-all duration-500 ${
              isHalloweenMode
                ? "border-[rgba(96,201,182,0.4)]! shadow-[0_0_20px_rgba(96,201,182,0.2)]!"
                : mode === "work"
                  ? "border-[rgba(139,92,246,0.4)]! shadow-[0_0_20px_rgba(139,92,246,0.2)]!"
                  : mode === "short_break"
                    ? "border-[rgba(16,185,129,0.4)]! shadow-[0_0_20px_rgba(16,185,129,0.2)]!"
                    : "border-[rgba(59,130,246,0.4)]! shadow-[0_0_20px_rgba(59,130,246,0.2)]!"
            }`}
          >
            {isHalloweenMode && (
              <div
                className="absolute inset-0 pointer-events-none opacity-10 z-0"
                style={{
                  backgroundImage:
                    mode === "work"
                      ? `url(${cardPurpleWitchhouse})`
                      : mode === "short_break"
                        ? `url(${cardBlueCemetary})`
                        : `url(${cardStaryCatEyes})`, // fallback / long_break
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "grayscale(100%)",
                }}
              />
            )}
            <div className="flex flex-col relative z-10">
              {/* Task and Notes Selection - Show when not running */}
              {!isRunning && !isPaused && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full mb-4 md:mb-8 space-y-3 md:space-y-4"
                >
                  <div className="space-y-2 md:space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
                      <div>
                        <label
                          className={`flex items-center space-x-1 md:space-x-1.5 text-[10px] md:text-xs font-medium mb-1 md:mb-1.5 ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : isDark
                                ? "text-slate-300"
                                : "text-slate-700"
                          }`}
                        >
                          <Folder className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          <span>Project</span>
                        </label>
                        <Dropdown
                          value={selectedProject}
                          onValueChange={setSelectedProject}
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
                        <label
                          className={`flex items-center space-x-1 md:space-x-1.5 text-[10px] md:text-xs font-medium mb-1 md:mb-1.5 ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : isDark
                                ? "text-slate-300"
                                : "text-slate-700"
                          }`}
                        >
                          <ListTodo className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          <span>Task</span>
                        </label>
                        <ComboBox
                          value={selectedTaskId}
                          onChange={setSelectedTaskId}
                          options={
                            activeTasks.length > 0
                              ? activeTasks.map((task) => ({
                                  value: task.id,
                                  label: `${task.title}${task.project ? ` (${task.project})` : ""}`,
                                }))
                              : []
                          }
                          placeholder={
                            activeTasks.length > 0
                              ? "Select a task..."
                              : "No active tasks"
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className={`flex items-center space-x-1 md:space-x-1.5 text-[10px] md:text-xs font-medium mb-1 md:mb-1.5 ${
                          isHalloweenMode
                            ? "text-[#60c9b6]"
                            : isDark
                              ? "text-slate-300"
                              : "text-slate-700"
                        }`}
                      >
                        <FileText className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span>Notes</span>
                      </label>
                      <Input
                        type="text"
                        value={sessionNotes}
                        onChange={(e) => setSessionNotes(e.target.value)}
                        placeholder="What are you working on?"
                        className={`text-xs md:text-sm ${
                          isHalloweenMode
                            ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)] text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[rgba(96,201,182,0.5)]! focus:ring-[rgba(96,201,182,0.2)]! focus:ring-1!"
                            : ""
                        }`}
                      />
                    </div>

                    {/* Custom Timer Option */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <Checkbox
                        checked={showCustomTimer}
                        onChange={(checked) => {
                          setShowCustomTimer(checked);

                          if (!isRunning && !isPaused) {
                            if (checked) {
                              setTimeLeft(customDuration * 60);
                            } else {
                              const duration =
                                mode === "work"
                                  ? settings.work_duration
                                  : mode === "short_break"
                                    ? settings.short_break_duration
                                    : settings.long_break_duration;
                              setTimeLeft(duration * 60);
                            }
                          }
                        }}
                        label="Custom Duration"
                      />
                      {showCustomTimer && (
                        <div className="flex items-center space-x-1.5 md:space-x-2">
                          <Input
                            type="number"
                            min="1"
                            max="120"
                            value={customDuration}
                            onChange={(e) => {
                              const newDuration =
                                parseInt(e.target.value) || 25;
                              setCustomDuration(newDuration);

                              if (!isRunning && !isPaused) {
                                setTimeLeft(newDuration * 60);
                              }
                            }}
                            className={`w-12 md:w-16 text-center text-xs md:text-sm ${
                              isHalloweenMode
                                ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)] text-[#60c9b6] focus:border-[rgba(96,201,182,0.5)]! focus:ring-[rgba(96,201,182,0.2)]! focus:ring-1!"
                                : ""
                            }`}
                          />
                          <span
                            className={`text-[10px] md:text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}
                          >
                            min
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Active Timer Display - Show when running or paused */}
              {(isRunning || isPaused) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full mb-4 md:mb-8"
                >
                  <div
                    className={`rounded-lg p-3 md:p-4 backdrop-blur-sm border transition-all duration-300 relative overflow-hidden ${
                      isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.4)]! shadow-[0_0_15px_rgba(96,201,182,0.15)]!"
                        : isDark
                          ? "bg-purple-500/10 border-purple-500/20"
                          : "bg-purple-50 border-purple-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 relative z-10">
                      {/* Timer Info */}
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* Pulse Indicator */}
                        <div className="relative shrink-0">
                          <div
                            className={`w-3 h-3 md:w-4 md:h-4 rounded-full animate-pulse shadow-lg ${
                              isHalloweenMode
                                ? "bg-[#60c9b6] shadow-[rgba(96,201,182,0.4)]"
                                : isPaused
                                  ? "bg-amber-500 shadow-amber-500/40"
                                  : "bg-purple-500 shadow-purple-500/40"
                            }`}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-lg md:text-xl font-bold font-mono ${
                                isHalloweenMode
                                  ? "text-[#60c9b6]"
                                  : isDark
                                    ? "text-white"
                                    : "text-gray-900"
                              }`}
                            >
                              {time.display}
                            </h4>
                            <span
                              className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                isPaused
                                  ? "bg-amber-500/20 text-amber-500"
                                  : isHalloweenMode
                                    ? "bg-[#60c9b6]/20 text-[#60c9b6]"
                                    : "bg-purple-100 text-purple-600"
                              }`}
                            >
                              {isPaused ? "PAUSED" : "FOCUS"}
                            </span>
                          </div>
                          <p
                            className={`text-xs md:text-sm truncate ${
                              isHalloweenMode
                                ? "text-[#60c9b6]/80"
                                : isDark
                                  ? "text-gray-400"
                                  : "text-gray-600"
                            }`}
                          >
                            {selectedTaskId
                              ? tasks.find((t) => t.id === selectedTaskId)
                                  ?.title
                              : "Focus Session"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Timer Section - Centered */}
              <div className="flex flex-col items-center">
                {/* Mode Badge */}
                <motion.div
                  className={`inline-flex items-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full ${config.bg} ${config.border} border mb-4 md:mb-8`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ModeIcon
                    className={`w-3.5 h-3.5 md:w-4 md:h-4 ${config.text}`}
                  />
                  <span
                    className={`text-xs md:text-sm font-medium ${config.text}`}
                  >
                    {config.label}
                  </span>
                  {isRunning && (
                    <motion.div
                      className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${config.text.replace("text-", "bg-")}`}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  {isPaused && (
                    <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-[rgba(245,158,11,0.2)] text-amber-500 text-[10px] md:text-xs rounded border border-[rgba(245,158,11,0.3)]">
                      PAUSED
                    </span>
                  )}
                </motion.div>

                {/* Timer Display */}
                <div className="relative mb-6 md:mb-12">
                  <div
                    className={`flex items-center justify-center space-x-1 md:space-x-2 text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold ${config.text}`}
                  >
                    <AnimatedCount value={time.minutes} />
                    <span>:</span>
                    <AnimatedCount value={time.seconds} />
                  </div>

                  {/* Progress Bar */}
                  <div
                    className={`mt-4 md:mt-8 w-full max-w-xs md:max-w-md mx-auto h-1.5 md:h-2 rounded-full overflow-hidden ${
                      isDark ? "bg-[rgba(255,255,255,0.1)]" : "bg-gray-200"
                    }`}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundImage: `linear-gradient(to right, ${config.from}, ${config.to})`,
                      }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress()}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8 flex-wrap">
                  {isRunning ? (
                    <motion.button
                      onClick={pauseTimer}
                      className={`flex items-center space-x-1.5 md:space-x-2 px-4 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors border cursor-pointer ${config.bg} ${config.border} ${config.text}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Pause className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Pause</span>
                    </motion.button>
                  ) : isPaused ? (
                    <motion.button
                      onClick={resumeTimer}
                      className={`flex items-center space-x-1.5 md:space-x-2 px-4 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors border cursor-pointer ${config.bg} ${config.border} ${config.text}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Resume</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={startTimer}
                      className={`flex items-center space-x-1.5 md:space-x-2 px-4 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors border cursor-pointer ${config.bg} ${config.border} ${config.text}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Start</span>
                    </motion.button>
                  )}

                  <motion.button
                    onClick={resetTimer}
                    className={`flex items-center space-x-1.5 md:space-x-2 px-4 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors border cursor-pointer ${
                      isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.2)]"
                        : isDark
                          ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.1)]"
                          : "bg-gray-50 border-gray-300 text-gray-900 hover:bg-gray-100"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Reset</span>
                  </motion.button>

                  <AnimatePresence>
                    {isRunning && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={stopTimer}
                        className={`flex items-center space-x-1.5 md:space-x-2 px-4 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors border cursor-pointer ${
                          isHalloweenMode
                            ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.2)]"
                            : isDark
                              ? "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)]"
                              : "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Square className="w-4 h-4 md:w-5 md:h-5" />
                        <span>Stop</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Session Progress */}
                <div className="text-center">
                  <p
                    className={`text-xs md:text-sm font-medium mb-2 md:mb-3 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Session Progress
                  </p>
                  <div className="flex items-center justify-center gap-1.5 md:gap-2">
                    {Array.from({
                      length: settings.sessions_until_long_break,
                    }).map((_, i) => (
                      <motion.div
                        key={i}
                        className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all ${
                          i <
                          completedSessions % settings.sessions_until_long_break
                            ? `${config.text.replace("text-", "bg-")} scale-110 shadow-lg`
                            : isDark
                              ? "bg-slate-700"
                              : "bg-slate-300"
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-[10px] md:text-xs mt-1.5 md:mt-2 ${isDark ? "text-slate-500" : "text-slate-500"}`}
                  >
                    {completedSessions % settings.sessions_until_long_break} of{" "}
                    {settings.sessions_until_long_break} until long break
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        )}
      </motion.div>
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmDialogOpen}
        onClose={() => {
          setIsConfirmDialogOpen(false);
          setPendingMode(null);
        }}
        onConfirm={() => {
          if (pendingMode) {
            setMode(pendingMode);
            onModeChange?.(pendingMode);
            setIsRunning(false);
            setIsPaused(false);
            setCurrentSessionId(null);

            if (pendingMode !== "history") {
              const defaultDuration =
                pendingMode === "work"
                  ? settings.work_duration
                  : pendingMode === "short_break"
                    ? settings.short_break_duration
                    : settings.long_break_duration;

              setCustomDuration(defaultDuration);
              setTimeLeft(defaultDuration * 60);
            }
          }
          setIsConfirmDialogOpen(false);
          setPendingMode(null);
        }}
        title="Stop Timer?"
        description="The timer is currently running. Switching modes will stop the current session."
        confirmText="Stop & Switch"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
};
