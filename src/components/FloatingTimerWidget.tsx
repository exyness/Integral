import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Pause,
  Play,
  Square,
  Timer,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { batGlide, pumpkinScary } from "@/assets";
import { GlassCard } from "@/components/GlassCard";
import { useFloatingWidget } from "@/contexts/FloatingWidgetContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useTimeTracking } from "@/hooks/tasks/useTimeTracking";
import { formatDurationForTimer, getCurrentDuration } from "@/lib/timeUtils";
import Counter from "@/components/ui/Counter";

const TimerCounter = ({ 
  duration, 
  isHalloweenMode, 
  isDark, 
  fontSize = 16 
}: { 
  duration: number; 
  isHalloweenMode: boolean; 
  isDark: boolean; 
  fontSize?: number;
}) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  const textColor = isHalloweenMode 
    ? "#60c9b6" 
    : isDark 
      ? "#ffffff" 
      : "#0f172a";

  return (
    <div className="flex items-center gap-0.5">
      <Counter 
        value={hours} 
        places={[10, 1]} 
        fontSize={fontSize} 
        padding={2} 
        gap={0} 
        textColor={textColor}
      />
      <span className={`font-bold ${isHalloweenMode ? "text-[#60c9b6]" : "text-foreground"}`} style={{ fontSize }}>:</span>
      <Counter 
        value={minutes} 
        places={[10, 1]} 
        fontSize={fontSize} 
        padding={2} 
        gap={0} 
        textColor={textColor}
      />
      <span className={`font-bold ${isHalloweenMode ? "text-[#60c9b6]" : "text-foreground"}`} style={{ fontSize }}>:</span>
      <Counter 
        value={seconds} 
        places={[10, 1]} 
        fontSize={fontSize} 
        padding={2} 
        gap={0} 
        textColor={textColor}
      />
    </div>
  );
};

export const FloatingTimerWidget: React.FC = () => {
  const { timeEntries, stopTimer, pauseTimer, resumeTimer } = useTimeTracking();
  const { tasks } = useTasks();
  const { isWidgetVisible, setWidgetVisible } = useFloatingWidget();
  const { isHalloweenMode, isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [, forceUpdate] = useState({});

  const runningEntries = timeEntries.filter((entry) => entry.is_running);

  const getTaskById = React.useCallback(
    (taskId: string) => tasks.find((t) => t.id === taskId),
    [tasks],
  );

  useEffect(() => {
    if (runningEntries.length > 0) {
      const interval = setInterval(() => {
        forceUpdate({});
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [runningEntries.length]);

  if (runningEntries.length === 0) {
    return null;
  }

  const handleStopTimer = async (entryId: string) => {
    try {
      await stopTimer(entryId);
    } catch (error) {
      console.error("Error stopping timer:", error);
    }
  };

  const handlePauseTimer = async (entryId: string) => {
    try {
      await pauseTimer(entryId);
    } catch (error) {
      console.error("Error pausing timer:", error);
    }
  };

  const handleResumeTimer = async (entryId: string) => {
    try {
      await resumeTimer(entryId);
    } catch (error) {
      console.error("Error resuming timer:", error);
    }
  };

  if (!isWidgetVisible) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setWidgetVisible(true)}
        className={`fixed bottom-3 right-3 md:bottom-4 md:right-4 z-50 w-12 h-12 md:w-14 md:h-14 rounded-xl transition-all shadow-lg flex items-center justify-center cursor-pointer ${
          isHalloweenMode
            ? "bg-[#60c9b6]/20 border border-[#60c9b6]/50 text-[#60c9b6] hover:bg-[#60c9b6]/30 hover:shadow-[0_0_15px_rgba(96,201,182,0.3)]"
            : "bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] text-emerald-500 hover:bg-[rgba(16,185,129,0.3)]"
        } active:scale-95`}
        title="Show Timer Widget"
      >
        <Timer className="w-5 h-5 md:w-6 md:h-6" />
        {runningEntries.length > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-[rgba(239,68,68,0.9)] border border-[rgba(239,68,68,0.3)] rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white dark:text-white text-[10px] md:text-xs font-bold">
              {runningEntries.length}
            </span>
          </div>
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed bottom-3 right-3 md:bottom-4 md:right-4 z-9999 w-[240px] md:w-[320px] rounded-xl ${
        isHalloweenMode
          ? "border-2 border-[#60c9b6]/50 shadow-[0_0_30px_rgba(96,201,182,0.2)]"
          : ""
      }`}
      style={{
        position: "fixed",
        zIndex: 9999,
      }}
    >
      <GlassCard
        className={`overflow-hidden transition-colors ${
          isHalloweenMode
            ? "shadow-[0_0_30px_rgba(96,201,182,0.2)] bg-[#1a1a1f]/95"
            : "shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
        }`}
      >
        {isHalloweenMode && (
          <>
            <img
              src={batGlide}
              alt=""
              className="absolute -top-6 -right-6 w-16 opacity-20 pointer-events-none rotate-12"
            />
            <img
              src={pumpkinScary}
              alt=""
              className="absolute -bottom-4 -left-4 w-16 opacity-10 pointer-events-none -rotate-12"
            />
          </>
        )}
        {/* Header */}
        <div
          className={`flex items-center justify-between p-3 md:p-4 border-b ${isHalloweenMode ? "border-[#60c9b6]/20" : "border-[rgba(255,255,255,0.1)]"}`}
        >
          <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
            <div
              className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isHalloweenMode
                  ? "bg-[#60c9b6]/20 border border-[#60c9b6]/30"
                  : "bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)]"
              }`}
            >
              <Timer
                className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isHalloweenMode ? "text-[#60c9b6]" : "text-emerald-500"}`}
              />
            </div>
            <div className="min-w-0">
              <h3
                className={`font-semibold text-xs md:text-sm truncate ${
                  isHalloweenMode ? "text-[#60c9b6]" : "text-foreground"
                }`}
              >
                Active Timers
              </h3>
              <p className="text-muted-foreground text-[10px] md:text-xs">
                {runningEntries.length} running
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 md:space-x-2 shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1.5 md:p-2 rounded-lg cursor-pointer transition-all active:scale-95 ${
                isHalloweenMode
                  ? "bg-[#60c9b6]/10 border border-[#60c9b6]/20 text-[#60c9b6] hover:bg-[#60c9b6]/20"
                  : "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white hover:text-white hover:bg-[rgba(40,40,45,0.8)]"
              }`}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
              )}
            </button>
            <button
              onClick={() => setWidgetVisible(false)}
              className="p-1.5 md:p-2 bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.3)] rounded-lg cursor-pointer text-red-500 hover:bg-[rgba(239,68,68,0.3)] active:scale-95 transition-all"
              title="Hide Timer Widget"
              aria-label="Hide widget"
            >
              <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
        </div>

        {/* Timer Entries */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-h-[60vh] md:max-h-80 overflow-y-auto"
            >
              {runningEntries.map((entry) => {
                const task = getTaskById(entry.task_id);
                const duration = getCurrentDuration(
                  entry.start_time,
                  entry.is_paused,
                  entry.paused_at,
                  entry.total_paused_seconds,
                );

                return (
                  <div
                    key={entry.id}
                    className={`p-3 md:p-4 border-b last:border-b-0 ${
                      isHalloweenMode
                        ? "border-[#60c9b6]/10"
                        : "border-[rgba(255,255,255,0.05)]"
                    }`}
                  >
                    {/* Mobile: Stacked Layout */}
                    <div className="md:hidden space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-medium text-xs truncate ${
                              isHalloweenMode
                                ? "text-[#60c9b6]"
                                : "text-foreground"
                            }`}
                          >
                            {task?.title || "Unknown Task"}
                          </h4>
                          {entry.description && (
                            <p
                              className={`text-[10px] truncate mt-0.5 ${
                                isHalloweenMode
                                  ? "text-gray-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {entry.description}
                            </p>
                          )}
                        </div>
                        {entry.is_paused && (
                          <span className="px-1.5 py-0.5 bg-[rgba(245,158,11,0.2)] text-amber-500 text-[9px] rounded border border-[rgba(245,158,11,0.3)] shrink-0">
                            PAUSED
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <Clock
                            className={`w-3 h-3 ${isHalloweenMode ? "text-[#60c9b6]" : "text-emerald-500"}`}
                          />
                          <TimerCounter 
                            duration={duration} 
                            isHalloweenMode={isHalloweenMode} 
                            isDark={isDark} 
                            fontSize={16} 
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          {entry.is_paused ? (
                            <button
                              onClick={() => handleResumeTimer(entry.id)}
                              className="p-2 bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] rounded-lg text-emerald-500 hover:bg-[rgba(16,185,129,0.3)] active:scale-95 transition-all"
                              aria-label="Resume Timer"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePauseTimer(entry.id)}
                              className="p-2 bg-[rgba(245,158,11,0.2)] border border-[rgba(245,158,11,0.3)] rounded-lg text-amber-500 hover:bg-[rgba(245,158,11,0.3)] active:scale-95 transition-all"
                              aria-label="Pause Timer"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleStopTimer(entry.id)}
                            className="p-2 bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.3)] rounded-lg text-red-500 hover:bg-[rgba(239,68,68,0.3)] active:scale-95 transition-all"
                            aria-label="Stop Timer"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Desktop: Original Layout */}
                    <div className="hidden md:block">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-medium text-sm truncate ${
                              isHalloweenMode
                                ? "text-[#60c9b6]"
                                : "text-foreground"
                            }`}
                          >
                            {task?.title || "Unknown Task"}
                          </h4>
                          {entry.description && (
                            <p
                              className={`text-xs truncate mt-1 ${
                                isHalloweenMode
                                  ? "text-gray-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {entry.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock
                            className={`w-3 h-3 ${isHalloweenMode ? "text-[#60c9b6]" : "text-emerald-500"}`}
                          />
                          <TimerCounter 
                            duration={duration} 
                            isHalloweenMode={isHalloweenMode} 
                            isDark={isDark} 
                            fontSize={18} 
                          />
                          {entry.is_paused && (
                            <span className="px-2 py-1 bg-[rgba(245,158,11,0.2)] text-amber-500 text-xs rounded border border-[rgba(245,158,11,0.3)]">
                              PAUSED
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          {entry.is_paused ? (
                            <button
                              onClick={() => handleResumeTimer(entry.id)}
                              className="p-2 bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] rounded-lg cursor-pointer text-emerald-500 hover:bg-[rgba(16,185,129,0.3)] transition-colors"
                              title="Resume Timer"
                            >
                              <Play className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePauseTimer(entry.id)}
                              className="p-2 bg-[rgba(245,158,11,0.2)] border border-[rgba(245,158,11,0.3)] rounded-lg cursor-pointer text-amber-500 hover:bg-[rgba(245,158,11,0.3)] transition-colors"
                              title="Pause Timer"
                            >
                              <Pause className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => handleStopTimer(entry.id)}
                            className="p-2 bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.3)] rounded-lg cursor-pointer text-red-500 hover:bg-[rgba(239,68,68,0.3)] transition-colors"
                            title="Stop Timer"
                          >
                            <Square className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed View */}
        {!isExpanded && runningEntries.length > 0 && (
          <div className="p-3 md:p-4">
            {runningEntries.length === 1 ? (
              (() => {
                const entry = runningEntries[0];
                const task = getTaskById(entry.task_id);
                const duration = getCurrentDuration(
                  entry.start_time,
                  entry.is_paused,
                  entry.paused_at,
                  entry.total_paused_seconds,
                );

                return (
                  <>
                    {/* Mobile: Stacked */}
                    <div className="md:hidden space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`font-medium text-xs truncate flex-1 ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : "text-foreground"
                          }`}
                        >
                          {task?.title || "Unknown Task"}
                        </h4>
                        {entry.is_paused && (
                          <span className="px-1.5 py-0.5 bg-[rgba(245,158,11,0.2)] text-amber-500 text-[9px] rounded shrink-0">
                            PAUSED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <TimerCounter 
                          duration={duration} 
                          isHalloweenMode={isHalloweenMode} 
                          isDark={isDark} 
                          fontSize={16} 
                        />
                        <div className="flex items-center gap-1">
                          {entry.is_paused ? (
                            <button
                              onClick={() => handleResumeTimer(entry.id)}
                              className="p-2 bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] rounded-lg text-emerald-500 hover:bg-[rgba(16,185,129,0.3)] active:scale-95 transition-all"
                              aria-label="Resume"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePauseTimer(entry.id)}
                              className="p-2 bg-[rgba(245,158,11,0.2)] border border-[rgba(245,158,11,0.3)] rounded-lg text-amber-500 hover:bg-[rgba(245,158,11,0.3)] active:scale-95 transition-all"
                              aria-label="Pause"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleStopTimer(entry.id)}
                            className="p-2 bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.3)] rounded-lg text-red-500 hover:bg-[rgba(239,68,68,0.3)] active:scale-95 transition-all"
                            aria-label="Stop"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Desktop: Original */}
                    <div className="hidden md:flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-medium text-sm truncate ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : "text-foreground"
                          }`}
                        >
                          {task?.title || "Unknown Task"}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`font-mono text-lg font-bold ${
                              isHalloweenMode
                                ? "text-[#60c9b6]"
                                : "text-foreground"
                            }`}
                          >
                            {formatDurationForTimer(duration)}
                          </span>
                          {entry.is_paused && (
                            <span className="px-2 py-1 bg-[rgba(245,158,11,0.2)] text-amber-500 text-xs rounded">
                              PAUSED
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-3">
                        {entry.is_paused ? (
                          <button
                            onClick={() => handleResumeTimer(entry.id)}
                            className="p-2 bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] rounded-lg cursor-pointer text-emerald-500 hover:bg-[rgba(16,185,129,0.3)] transition-colors"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePauseTimer(entry.id)}
                            className="p-2 bg-[rgba(245,158,11,0.2)] border border-[rgba(245,158,11,0.3)] rounded-lg cursor-pointer text-amber-500 hover:bg-[rgba(245,158,11,0.3)] transition-colors"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleStopTimer(entry.id)}
                          className="p-2 bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.3)] rounded-lg cursor-pointer text-red-500 hover:bg-[rgba(239,68,68,0.3)] transition-colors"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()
            ) : (
              <div className="text-center">
                <div className="text-foreground font-mono text-lg md:text-xl font-bold mb-1">
                  {runningEntries.length} Timers
                </div>
                <div className="text-muted-foreground text-[10px] md:text-xs">
                  Click to expand and manage
                </div>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};
