import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/contexts/ThemeContext";

export const TasksTabSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  const halloweenColors = [
    { color: "96,201,182" },
    { color: "72,187,168" },
    { color: "120,215,196" },
    { color: "64,224,208" },
  ];

  const regularColors = [
    { color: "16,185,129" },
    { color: "59,130,246" },
    { color: "239,68,68" },
    { color: "245,158,11" },
  ];

  const colors = isHalloweenMode ? halloweenColors : regularColors;

  return (
    <>
      {/* Task Stats Skeleton */}
      <div className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {colors.map((stat, i) => (
            <div
              key={i}
              className={`p-3 md:p-6 rounded-xl border ${
                isDark
                  ? `bg-[rgba(${stat.color},0.1)] border-[rgba(${stat.color},0.2)]`
                  : `bg-[rgba(${stat.color},0.05)] border-[rgba(${stat.color},0.2)]`
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="h-2.5 md:h-3 w-16 md:w-20 mb-0.5 md:mb-1" />
                  <Skeleton className="h-5 md:h-8 w-8 md:w-12" />
                </div>
                <Skeleton className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="space-y-3 md:space-y-4 px-4 md:px-6 pb-4 md:pb-6">
        {/* Mobile: Search and filters stacked */}
        <div className="md:hidden space-y-3">
          {/* Search Input */}
          <Skeleton className="h-10 w-full rounded-lg" />

          {/* Filters Row - 2 columns on mobile */}
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 col-span-2 rounded-lg" />
          </div>
        </div>

        {/* Desktop: Search and filters in one row */}
        <div className="hidden md:flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
          {/* Search Input */}
          <Skeleton className="h-10 flex-1 rounded-lg" />

          {/* Filters and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3 lg:shrink-0">
            <Skeleton className="h-10 w-full sm:w-48 rounded-lg" />
            <Skeleton className="h-10 w-full sm:w-40 rounded-lg" />
            <Skeleton className="h-10 w-full sm:w-48 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Task List Skeleton */}
      <div className="p-4">
        <div
          className={`divide-y space-y-1 ${
            isHalloweenMode
              ? isDark
                ? "divide-[rgba(96,201,182,0.1)]"
                : "divide-[rgba(96,201,182,0.1)]"
              : isDark
                ? "divide-[rgba(255,255,255,0.06)]"
                : "divide-gray-200"
          }`}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className={`p-3 md:p-4 transition-colors rounded-lg ${
                isHalloweenMode
                  ? isDark
                    ? "hover:bg-[rgba(96,201,182,0.05)]"
                    : "hover:bg-[rgba(96,201,182,0.05)]"
                  : isDark
                    ? "hover:bg-[rgba(255,255,255,0.02)]"
                    : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start md:items-center space-x-2 md:space-x-4">
                {/* Select checkbox skeleton */}
                <Skeleton className="h-4 w-4 rounded shrink-0 mt-0.5 md:mt-0" />

                {/* Complete checkbox skeleton */}
                <Skeleton className="h-5 w-5 rounded-full shrink-0 mt-0.5 md:mt-0" />

                {/* Priority bar skeleton - hidden on mobile */}
                <Skeleton className="hidden md:block w-1 h-8 rounded-full shrink-0" />

                {/* Content area */}
                <div className="flex-1 min-w-0 space-y-1 md:space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                    <Skeleton className="h-4 md:h-5 w-2/3 md:w-1/3" />
                    <Skeleton className="h-5 md:h-6 w-20 md:w-24 rounded" />
                  </div>
                  <Skeleton className="h-3 md:h-4 w-full" />
                  <div className="flex items-center space-x-2 md:space-x-4">
                    <Skeleton className="h-3 w-16 md:w-20 hidden md:block" />
                    <Skeleton className="h-3 w-12 md:w-16 hidden md:block" />
                    <Skeleton className="h-3 w-14 md:w-16 hidden md:block" />
                    <Skeleton className="h-3 w-16 md:hidden" />
                  </div>
                </div>

                {/* Delete button skeleton */}
                <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-lg shrink-0" />
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

      {/* Projects Grid */}
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
                    : "bg-[rgba(96,201,182,0.05)] border border-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[rgba(26,26,31,0.6)] border border-[rgba(255,255,255,0.08)]"
                    : "bg-white border border-gray-200 shadow-xs"
              }`}
            >
              {/* Three Dots Menu - Top Right */}
              <div className="absolute top-2 right-2">
                <Skeleton className="w-6 h-6 rounded-md" />
              </div>

              <div className="flex flex-col items-center space-y-3">
                {/* Folder Icon */}
                <Skeleton className="w-12 h-12 rounded-lg" />

                {/* Project Name & Task Count */}
                <div className="text-center w-full">
                  <Skeleton className="h-4 w-16 mx-auto mb-1" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                </div>

                {/* Stats Row - Hidden on mobile */}
                <div
                  className={`hidden md:flex items-center justify-center gap-4 w-full py-2 px-3 rounded-lg ${
                    isHalloweenMode
                      ? isDark
                        ? "bg-[rgba(96,201,182,0.1)]"
                        : "bg-[rgba(96,201,182,0.05)]"
                      : isDark
                        ? "bg-[rgba(255,255,255,0.03)]"
                        : "bg-gray-50"
                  }`}
                >
                  <Skeleton className="h-3 w-6" />
                  <div
                    className={`w-px h-3 ${
                      isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.2)]"
                        : isDark
                          ? "bg-[rgba(255,255,255,0.1)]"
                          : "bg-gray-300"
                    }`}
                  ></div>
                  <Skeleton className="h-3 w-6" />
                </div>

                {/* Progress Bar - Hidden on mobile */}
                <div className="hidden md:block w-full space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
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
    { color: "96,201,182" }, // Teal
    { color: "72,187,168" }, // Darker Teal
    { color: "120,215,196" }, // Lighter Teal
    { color: "64,224,208" }, // Turquoise
  ];

  const regularColors = [
    { color: "139,92,246" },
    { color: "16,185,129" },
    { color: "245,158,11" },
    { color: "239,68,68" },
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

      {/* Calendar Stats - 2x2 on mobile, 4 columns on larger screens */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {colors.map((stat, i) => (
          <div
            key={i}
            className={`p-3 md:p-4 rounded-xl transition-all ${
              isDark
                ? `bg-[rgba(${stat.color},0.1)] border border-[rgba(${stat.color},0.2)]`
                : `bg-[rgba(${stat.color},0.05)] border border-[rgba(${stat.color},0.2)]`
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="h-3 w-16 mb-0.5 md:mb-1" />
                <Skeleton className="h-5 md:h-6 w-8 md:w-10" />
              </div>
              <Skeleton className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
