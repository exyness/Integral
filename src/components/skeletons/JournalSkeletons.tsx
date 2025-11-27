import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/contexts/ThemeContext";

export const EntriesTabSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <>
      {/* Search and Filters */}
      <div
        className={`p-4 md:p-6 border-b ${
          isHalloweenMode
            ? "border-[rgba(96,201,182,0.2)]"
            : "border-[rgba(16,185,129,0.2)]"
        }`}
      >
        {/* Search and Filters - stacked on mobile, side by side on desktop */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <Skeleton className="h-10 w-full md:flex-1 rounded-lg" />

          {/* Filters and Sort - side by side */}
          <div className="flex gap-3 w-full md:w-auto">
            <Skeleton className="h-10 flex-1 md:w-40 rounded-lg" />
            <Skeleton className="h-10 flex-1 md:w-40 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Today's Entries Section Skeleton */}
      <div
        className={`p-4 md:p-6 border-b ${
          isHalloweenMode
            ? "border-[rgba(96,201,182,0.2)] bg-[rgba(96,201,182,0.03)]"
            : "border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.03)]"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 md:h-5 w-32 md:w-40" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`group p-3 rounded-lg ${
                isHalloweenMode
                  ? isDark
                    ? "bg-[rgba(96,201,182,0.05)] border border-[rgba(96,201,182,0.1)]"
                    : "bg-white border border-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]"
                    : "bg-white border border-gray-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-3.5 sm:h-4 md:h-4 w-2/3 mb-1" />
                  <Skeleton className="h-3 sm:h-3.5 md:h-3.5 w-full mb-0.5" />
                  <Skeleton className="h-3 sm:h-3.5 md:h-3.5 w-4/5 mb-2" />
                  <Skeleton className="h-2.5 sm:h-3 w-20 md:w-24" />
                </div>
                <div className="flex items-center justify-between sm:justify-start sm:flex-col gap-2 sm:gap-0 sm:space-y-1.5 sm:ml-4">
                  <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-full" />
                  <div className="flex sm:flex-col space-x-1.5 sm:space-x-0 sm:space-y-1.5">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Entry List */}
      <div className="p-4 md:p-6">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`group p-3 rounded-lg ${
                isHalloweenMode
                  ? isDark
                    ? "bg-[rgba(96,201,182,0.05)] border border-[rgba(96,201,182,0.1)]"
                    : "bg-white border border-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]"
                    : "bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <Skeleton className="h-3 sm:h-4 md:h-5 w-2/3 sm:w-1/2 mb-0.5 sm:mb-1" />
                  {/* Content line 1 */}
                  <Skeleton className="h-[11px] sm:h-3 md:h-4 w-full mb-0.5" />
                  {/* Content line 2 */}
                  <Skeleton className="h-[11px] sm:h-3 md:h-4 w-5/6 mb-1 sm:mb-2" />
                  {/* Date and metadata */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3">
                    <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-24 md:w-32" />
                    <Skeleton className="h-2.5 sm:h-3 w-8 sm:w-10" />
                    <Skeleton className="h-2.5 sm:h-3 w-8 sm:w-10" />
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-start sm:flex-col gap-1.5 sm:gap-0 sm:space-y-1.5 sm:ml-4">
                  {/* Project badge */}
                  <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-full" />
                  {/* Action buttons */}
                  <div className="flex sm:flex-col space-x-1 sm:space-x-0 sm:space-y-1.5">
                    <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded" />
                    <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export const ProjectsTabSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <>
      {/* Search and Filters Bar */}
      <div
        className={`space-y-4 p-4 md:p-6 border-b ${
          isHalloweenMode
            ? "border-[rgba(96,201,182,0.2)]"
            : "border-[rgba(255,255,255,0.1)]"
        }`}
      >
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
          {/* Search Input */}
          <Skeleton className="h-10 w-full lg:flex-1 rounded-lg" />

          {/* Filters */}
          <div className="flex gap-3 lg:shrink-0">
            <Skeleton className="h-10 flex-[2] lg:w-48 lg:flex-none rounded-lg" />
            <Skeleton className="h-10 flex-[1] lg:flex-none lg:w-32 rounded-lg" />
          </div>
        </div>

        {/* Results count */}
        <Skeleton className="h-3 md:h-4 w-32 md:w-40" />
      </div>

      {/* Active Projects Section */}
      <div className="p-6">
        <Skeleton className="h-5 md:h-6 w-40 md:w-48 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className={`relative rounded-xl p-4 ${
                isHalloweenMode
                  ? isDark
                    ? "bg-[rgba(96,201,182,0.1)] border border-[rgba(96,201,182,0.2)]"
                    : "bg-white border border-[rgba(96,201,182,0.2)] shadow-xs"
                  : isDark
                    ? "bg-[rgba(26,26,31,0.6)] border border-[rgba(255,255,255,0.08)]"
                    : "bg-white border border-gray-200 shadow-xs"
              }`}
            >
              <div className="flex flex-col items-center space-y-3">
                {/* Folder Icon Skeleton */}
                <Skeleton className="w-12 h-12 rounded-lg" />

                {/* Project Name & Entry Count */}
                <div className="text-center w-full">
                  <Skeleton className="h-4 w-16 mx-auto mb-1" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                </div>
              </div>

              {/* Action Menu Skeleton - Top Right (mobile: three dots, desktop: buttons) */}
              <div className="absolute top-2 right-2">
                <Skeleton className="w-6 h-6 rounded-md" />
              </div>

              {/* Entry Count Badge - Top Left */}
              <div className="absolute top-2 left-2">
                <Skeleton className="w-5 h-5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export const CalendarTabSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  const halloweenColors = [
    { color: "96,201,182" },
    { color: "72,187,168" },
    { color: "120,215,196" },
  ];

  const regularColors = [
    { color: "245,158,11" },
    { color: "16,185,129" },
    { color: "139,92,246" },
  ];

  const colors = isHalloweenMode ? halloweenColors : regularColors;

  return (
    <div className="p-4 md:p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Skeleton className="h-6 sm:h-8 w-32 sm:w-48" />
          <Skeleton className="h-5 sm:h-7 w-12 sm:w-16 rounded-md sm:rounded-lg" />
        </div>
        <div className="flex items-center space-x-0.5 sm:space-x-2 shrink-0 ml-2">
          <Skeleton className="h-6 w-6 sm:h-9 sm:w-9 rounded-md sm:rounded-lg" />
          <Skeleton className="h-6 w-6 sm:h-9 sm:w-9 rounded-md sm:rounded-lg" />
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
        <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
        <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
        <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className={`p-1 sm:p-2 text-center text-xs sm:text-sm font-medium ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-[#B4B4B8]"
                  : "text-gray-600"
            }`}
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.slice(0, 1)}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton
            key={i}
            className={`aspect-square sm:aspect-auto sm:h-28 md:h-32 w-full rounded-lg ${
              isHalloweenMode ? "bg-[rgba(96,201,182,0.05)]" : ""
            }`}
          />
        ))}
      </div>

      {/* Calendar Stats - Mobile: Streak on top, 2 cards below | Desktop: 3 columns */}
      <div className="mt-6">
        {/* Mobile Layout */}
        <div className="md:hidden space-y-3">
          {/* Current Streak - Full Width */}
          <div
            className={`p-3 rounded-xl ${
              isHalloweenMode
                ? isDark
                  ? "bg-[rgba(96,201,182,0.1)] border border-[rgba(96,201,182,0.2)]"
                  : "bg-[rgba(96,201,182,0.05)] border border-[rgba(96,201,182,0.2)]"
                : isDark
                  ? "bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)]"
                  : "bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.2)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-5 w-8" />
              </div>
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>

          {/* Total Entries and This Month - Side by Side */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-3 rounded-xl ${
                isHalloweenMode
                  ? isDark
                    ? "bg-[rgba(96,201,182,0.1)] border border-[rgba(96,201,182,0.2)]"
                    : "bg-[rgba(96,201,182,0.05)] border border-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)]"
                    : "bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.2)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-5 w-8" />
                </div>
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            </div>

            <div
              className={`p-3 rounded-xl ${
                isHalloweenMode
                  ? isDark
                    ? "bg-[rgba(96,201,182,0.1)] border border-[rgba(96,201,182,0.2)]"
                    : "bg-[rgba(96,201,182,0.05)] border border-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)]"
                    : "bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.2)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-5 w-8" />
                </div>
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - 3 Columns */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {colors.map((stat, i) => (
            <div
              key={i}
              className={`p-6 rounded-xl ${
                isDark
                  ? `bg-[rgba(${stat.color},0.1)] border border-[rgba(${stat.color},0.2)]`
                  : `bg-[rgba(${stat.color},0.05)] border border-[rgba(${stat.color},0.2)]`
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="w-12 h-12 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
