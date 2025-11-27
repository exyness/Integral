import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import React from "react";
import {
  batGlide,
  cardHauntedHouse,
  catWitchHat,
  ghostGenie,
  pumpkinWitchhat,
  spiderHairyCrawling,
  webCornerLeft,
} from "@/assets";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TimePageSkeleton } from "@/components/skeletons/TimeSkeletons";
import { TimeTracker } from "@/components/tasks/TimeTracker";
import { useFloatingWidget } from "@/contexts/FloatingWidgetContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useTimeTracking } from "@/hooks/tasks/useTimeTracking";

export const Time: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();
  const { tasks, loading } = useTasks();
  const { timeEntries } = useTimeTracking();
  const { isWidgetVisible, toggleWidget } = useFloatingWidget();

  const runningEntries = timeEntries.filter((entry) => entry.is_running);
  const hasRunningTimers = runningEntries.length > 0;

  if (loading && tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <TimePageSkeleton />
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
                className="absolute inset-0 pointer-events-none opacity-10 z-0"
                style={{
                  backgroundImage: `url(${cardHauntedHouse})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "grayscale(100%)",
                }}
              />

              {/* Flying Bat Animation */}
              <motion.img
                src={batGlide}
                alt=""
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 opacity-60 pointer-events-none z-0"
                initial={{ x: "-10%", y: "10%", rotate: 5 }}
                animate={{
                  x: ["-10%", "110%"],
                  y: ["10%", "30%", "5%"],
                  rotate: [5, -5, 5],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 1,
                }}
              />

              {/* Corner Web */}
              <img
                src={webCornerLeft}
                alt=""
                className="absolute top-0 left-0 w-32 md:w-40 opacity-40 pointer-events-none"
              />

              {/* Crawling Spider */}
              <motion.img
                src={spiderHairyCrawling}
                alt=""
                className="absolute bottom-0 left-20 w-12 h-12 md:w-16 md:h-16 opacity-70 pointer-events-none z-10"
                initial={{ x: 0 }}
                animate={{
                  x: [0, 100, 0],
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Cat with Witch Hat */}
              <motion.img
                src={catWitchHat}
                alt=""
                className="absolute bottom-0 right-24 w-14 h-14 md:w-16 md:h-16 opacity-80 pointer-events-none z-10"
                initial={{ y: 10 }}
                animate={{ y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.5,
                }}
              />
            </>
          )}
          <div className="relative z-10 flex items-start justify-between gap-3 mb-1.5">
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
                isHalloweenMode ? "text-[#60c9b6]" : "text-[#10B981]"
              }`}
            >
              Time Tracking
              {hasRunningTimers && (
                <span
                  className={`ml-2 px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-medium rounded-full border animate-pulse ${
                    isHalloweenMode
                      ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6] border-[rgba(96,201,182,0.4)]"
                      : "bg-[rgba(16,185,129,0.2)] text-[#10B981] border-[rgba(16,185,129,0.4)]"
                  }`}
                >
                  {runningEntries.length} Active
                </span>
              )}
            </h1>
            {hasRunningTimers && (
              <motion.button
                onClick={toggleWidget}
                className={`hidden md:flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                  isWidgetVisible
                    ? isHalloweenMode
                      ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)] border border-[rgba(96,201,182,0.3)]"
                      : "bg-[rgba(245,158,11,0.2)] text-[#F59E0B] hover:bg-[rgba(245,158,11,0.3)] border border-[rgba(245,158,11,0.3)]"
                    : isHalloweenMode
                      ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)] border border-[rgba(96,201,182,0.3)]"
                      : "bg-[rgba(16,185,129,0.2)] text-[#10B981] hover:bg-[rgba(16,185,129,0.3)] border border-[rgba(16,185,129,0.3)]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isWidgetVisible ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide Widget</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show Widget</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
          <p
            className={`relative z-10 text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
          >
            Track time spent on tasks and projects
            {hasRunningTimers &&
              " • Use the floating widget to manage timers from any page"}
          </p>
          {hasRunningTimers && (
            <motion.button
              onClick={toggleWidget}
              className={`flex md:hidden items-center justify-center space-x-1 px-3 py-1.5 mt-3 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                isWidgetVisible
                  ? isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)] border border-[rgba(96,201,182,0.3)]"
                    : "bg-[rgba(245,158,11,0.2)] text-[#F59E0B] hover:bg-[rgba(245,158,11,0.3)] border border-[rgba(245,158,11,0.3)]"
                  : isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)] border border-[rgba(96,201,182,0.3)]"
                    : "bg-[rgba(16,185,129,0.2)] text-[#10B981] hover:bg-[rgba(16,185,129,0.3)] border border-[rgba(16,185,129,0.3)]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isWidgetVisible ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide Widget</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Show Widget</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>

      <ErrorBoundary>
        <TimeTracker tasks={tasks} />
      </ErrorBoundary>
    </motion.div>
  );
};
