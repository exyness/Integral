import { motion } from "framer-motion";
import { Settings as SettingsIcon } from "lucide-react";
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  batSwoop,
  bgWitchGraveyard,
  fenceLeaning,
  fenceTall,
  gateArched,
  ghostGenie,
  mansionCrooked,
  spiderSharpHanging,
} from "@/assets";
import { PomodoroSettingsModal } from "@/components/pomodoro/PomodoroSettingsModal";
import { PomodoroStats } from "@/components/pomodoro/PomodoroStats";
import { PomodoroTimer } from "@/components/pomodoro/PomodoroTimer";
import {
  PomodoroHistorySkeleton,
  PomodoroSkeleton,
} from "@/components/skeletons/PomodoroSkeletons";
import { useTheme } from "@/contexts/ThemeContext";
import { PomodoroMode, usePomodoro } from "@/hooks/usePomodoro";

export const Pomodoro: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();
  const { loading, refreshSessions, getAllTimeStats } = usePomodoro();
  const stats = getAllTimeStats();
  const [showSettings, setShowSettings] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const modeFromUrl =
    (searchParams.get("mode") as PomodoroMode | "history") || "work";
  const [currentMode, setCurrentMode] = useState<PomodoroMode | "history">(
    modeFromUrl,
  );

  const handleModeChange = (mode: PomodoroMode | "history") => {
    setCurrentMode(mode);
    setSearchParams({ mode });
  };

  const handleSessionComplete = () => {
    refreshSessions();
  };

  const hasActiveSessions = stats.total > 0;

  const getModeColor = () => {
    if (isHalloweenMode) {
      switch (currentMode) {
        case "work":
          return "#60c9b6";
        case "short_break":
          return "#72bba8";
        case "long_break":
          return "#40e0d0";
        case "history":
          return "#2dd4bf";
        default:
          return "#60c9b6";
      }
    }
    switch (currentMode) {
      case "work":
        return "#EF4444";
      case "short_break":
        return "#10B981";
      case "long_break":
        return "#3B82F6";
      case "history":
        return "#8B5CF6";
      default:
        return "#8B5CF6";
    }
  };

  const getModeDescription = () => {
    switch (currentMode) {
      case "work":
        return "Boost your productivity with focused work sessions";
      case "short_break":
        return "Take a short break to recharge";
      case "long_break":
        return "Enjoy a longer break after completing multiple sessions";
      case "history":
        return "View and manage your completed Pomodoro sessions";
      default:
        return "Boost your productivity with focused work sessions";
    }
  };

  const modeColor = getModeColor();

  if (loading) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {currentMode === "history" ? (
          <PomodoroHistorySkeleton />
        ) : (
          <PomodoroSkeleton />
        )}
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
      {/* Header Section - Responsive */}
      <div className="mb-6 pt-4 md:pt-0">
        <div
          className={`relative overflow-hidden md:p-6 md:rounded-xl md:backdrop-blur-xl md:border ${
            isHalloweenMode
              ? "md:bg-[rgba(96,201,182,0.1)] md:border-[rgba(96,201,182,0.2)] group"
              : isDark
                ? "md:bg-[rgba(26,26,31,0.6)] md:border-[rgba(255,255,255,0.1)]"
                : "md:bg-white/90 md:border-gray-200/60 md:shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
          }`}
        >
          {isHalloweenMode && (
            <>
              {/* Background Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-10 z-0"
                style={{
                  backgroundImage: `url(${bgWitchGraveyard})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "grayscale(100%)",
                }}
              />

              {/* Spooky House */}
              <motion.img
                src={mansionCrooked}
                alt=""
                className="absolute -right-4 bottom-0 w-32 h-32 md:w-40 md:h-40 opacity-20 pointer-events-none z-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 0.2, x: 0 }}
                transition={{ duration: 1 }}
              />

              {/* Fence */}
              <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden pointer-events-none z-0 opacity-20">
                <div className="flex w-full h-full items-end justify-between">
                  <img
                    src={fenceTall}
                    alt=""
                    className="h-full w-1/4 object-contain object-bottom"
                  />
                  <img
                    src={fenceTall}
                    alt=""
                    className="h-full w-1/4 object-contain object-bottom"
                  />
                  <img
                    src={fenceLeaning}
                    alt=""
                    className="h-full w-1/4 object-contain object-bottom"
                  />
                  <img
                    src={gateArched}
                    alt=""
                    className="h-full w-1/4 object-contain object-bottom scale-110 origin-bottom"
                  />
                </div>
              </div>

              {/* Swooping Bat */}
              <motion.img
                src={batSwoop}
                alt=""
                className="absolute right-1/4 top-4 w-12 h-12 md:w-16 md:h-16 opacity-40 pointer-events-none z-0"
                initial={{ x: "100%", y: -20 }}
                animate={{
                  x: ["100%", "-100%"],
                  y: [-20, 20, -20],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Hanging Spider */}
              <motion.img
                src={spiderSharpHanging}
                alt=""
                className="absolute top-0 left-10 w-10 h-20 md:w-12 md:h-24 opacity-60 pointer-events-none z-10"
                initial={{ y: -50 }}
                animate={{ y: [-50, 0, -20, 0, -50] }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
              />
            </>
          )}
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5 relative">
                  {/* Ghost appearing on hover */}
                  {isHalloweenMode && (
                    <motion.img
                      src={ghostGenie}
                      alt=""
                      className="absolute -top-8 -left-4 w-12 h-12 opacity-0 transition-opacity duration-300 group-hover:opacity-70 pointer-events-none"
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  )}
                  <h1
                    className={`text-xl md:text-2xl font-bold ${
                      isHalloweenMode
                        ? "text-[#60c9b6]"
                        : currentMode === "work"
                          ? "text-[#EF4444]"
                          : currentMode === "short_break"
                            ? "text-[#10B981]"
                            : currentMode === "long_break"
                              ? "text-[#3B82F6]"
                              : "text-[#8B5CF6]"
                    }`}
                  >
                    Pomodoro Timer
                  </h1>
                  {hasActiveSessions && (
                    <span
                      className="px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-medium rounded-full border"
                      style={{
                        backgroundColor: `${modeColor}33`,
                        color: modeColor,
                        borderColor: `${modeColor}66`,
                      }}
                    >
                      {stats.completed} Total
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs md:text-sm ${
                    isDark ? "text-[#B4B4B8]" : "text-gray-600"
                  }`}
                >
                  {getModeDescription()}
                </p>
              </div>
              <motion.button
                onClick={() => setShowSettings(true)}
                className="hidden md:flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg transition-colors text-sm font-medium shrink-0 cursor-pointer border"
                style={{
                  backgroundColor: `${modeColor}33`,
                  borderColor: `${modeColor}66`,
                  color: modeColor,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SettingsIcon className="w-4 h-4" />
                <span>Settings</span>
              </motion.button>
            </div>

            <motion.button
              onClick={() => setShowSettings(true)}
              className="md:hidden flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium cursor-pointer border self-start"
              style={{
                backgroundColor: `${modeColor}33`,
                borderColor: `${modeColor}66`,
                color: modeColor,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Settings</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <PomodoroStats />

      {/* Timer Section */}
      <PomodoroTimer
        onSessionComplete={handleSessionComplete}
        onModeChange={handleModeChange}
        initialMode={currentMode}
      />

      {/* Settings Modal */}
      <PomodoroSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </motion.div>
  );
};
