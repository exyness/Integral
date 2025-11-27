import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/contexts/ThemeContext";

export const PomodoroSkeleton: React.FC = () => {
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
    { color: "59,130,246" },
  ];

  const colors = isHalloweenMode ? halloweenColors : regularColors;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="mb-6 pt-4 md:pt-0">
        <div
          className={`md:p-6 md:rounded-xl md:backdrop-blur-xl md:border ${
            isHalloweenMode
              ? isDark
                ? "md:bg-[rgba(96,201,182,0.1)] md:border-[rgba(96,201,182,0.2)]"
                : "md:bg-white/90 md:border-[rgba(96,201,182,0.2)]"
              : isDark
                ? "md:bg-[rgba(26,26,31,0.6)] md:border-[rgba(255,255,255,0.1)]"
                : "md:bg-white/90 md:border-gray-200/60 md:shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
          }`}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <Skeleton className="h-6 md:h-7 w-40 md:w-48" />
                  <Skeleton className="h-5 md:h-6 w-16 md:w-20 rounded-full" />
                </div>
                <Skeleton className="h-3 md:h-4 w-48 md:w-64" />
              </div>
              <Skeleton className="hidden md:block h-9 w-28 rounded-lg" />
            </div>
            <Skeleton className="md:hidden h-7 w-24 rounded-lg self-start" />
          </div>
        </div>
      </div>

      {/* Stats Section */}
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
                <Skeleton className="h-5 md:h-8 w-12 md:w-16" />
              </div>
              <Skeleton className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 sm:space-x-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 flex-1 rounded-lg" />
        ))}
      </div>

      {/* Timer Card */}
      <div
        className={`rounded-xl backdrop-blur-xl border p-4 md:p-8 lg:p-12 ${
          isHalloweenMode
            ? isDark
              ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
              : "bg-white border-[rgba(96,201,182,0.2)]"
            : isDark
              ? "bg-[rgba(26,26,31,0.6)] border-[rgba(255,255,255,0.1)]"
              : "bg-white border-gray-200"
        }`}
      >
        <div className="flex flex-col">
          {/* Task and Notes Selection */}
          <div className="w-full mb-4 md:mb-8 space-y-3 md:space-y-4">
            <div className="space-y-2 md:space-y-3">
              <div>
                <Skeleton className="h-3 md:h-4 w-16 md:w-20 mb-1.5 md:mb-2" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-3 md:h-4 w-12 md:w-16 mb-1.5 md:mb-2" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <Skeleton className="h-5 w-32 rounded" />
                <div className="flex items-center space-x-1.5 md:space-x-2">
                  <Skeleton className="h-10 w-12 md:w-16 rounded-lg" />
                  <Skeleton className="h-3 w-6 md:w-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Timer Section - Centered */}
          <div className="flex flex-col items-center">
            {/* Mode Badge */}
            <Skeleton className="h-8 md:h-10 w-32 md:w-40 rounded-full mb-4 md:mb-8" />

            {/* Timer Display */}
            <div className="relative mb-6 md:mb-12">
              <Skeleton className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 w-48 sm:w-56 md:w-64 lg:w-80 xl:w-96 mb-4 md:mb-8" />
              {/* Progress Bar */}
              <Skeleton className="h-1.5 md:h-2 w-full max-w-xs md:max-w-md mx-auto rounded-full" />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8">
              <Skeleton className="h-10 md:h-12 w-24 md:w-32 rounded-lg" />
              <Skeleton className="h-10 md:h-12 w-24 md:w-32 rounded-lg" />
            </div>

            {/* Session Progress */}
            <div className="text-center w-full">
              <Skeleton className="h-3 md:h-4 w-32 md:w-40 mx-auto mb-2 md:mb-3" />
              <div className="flex items-center justify-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full"
                  />
                ))}
              </div>
              <Skeleton className="h-2.5 md:h-3 w-40 md:w-48 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PomodoroHistorySkeleton: React.FC = () => {
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
    { color: "59,130,246" },
  ];

  const colors = isHalloweenMode ? halloweenColors : regularColors;

  return (
    <>
      {/* Header Section */}
      <div className="mb-6 pt-4 md:pt-0">
        <div
          className={`md:p-6 md:rounded-xl md:backdrop-blur-xl md:border ${
            isHalloweenMode
              ? isDark
                ? "md:bg-[rgba(96,201,182,0.1)] md:border-[rgba(96,201,182,0.2)]"
                : "md:bg-white/90 md:border-[rgba(96,201,182,0.2)]"
              : isDark
                ? "md:bg-[rgba(26,26,31,0.6)] md:border-[rgba(255,255,255,0.1)]"
                : "md:bg-white/90 md:border-gray-200/60 md:shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
          }`}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <Skeleton className="h-6 md:h-7 w-40 md:w-48" />
                  <Skeleton className="h-5 md:h-6 w-16 md:w-20 rounded-full" />
                </div>
                <Skeleton className="h-3 md:h-4 w-48 md:w-64" />
              </div>
              <Skeleton className="hidden md:block h-9 w-28 rounded-lg" />
            </div>
            <Skeleton className="md:hidden h-7 w-24 rounded-lg self-start" />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
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
                <Skeleton className="h-5 md:h-8 w-12 md:w-16" />
              </div>
              <Skeleton className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 sm:space-x-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 flex-1 rounded-lg" />
        ))}
      </div>

      {/* History Content */}
      <div
        className={`rounded-xl backdrop-blur-xl border overflow-hidden ${
          isHalloweenMode
            ? isDark
              ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
              : "bg-white border-[rgba(96,201,182,0.2)]"
            : isDark
              ? "bg-[rgba(26,26,31,0.6)] border-[rgba(255,255,255,0.1)]"
              : "bg-white border-gray-200"
        }`}
      >
        {/* Header Section */}
        <div
          className={`p-4 md:p-6 border-b ${
            isHalloweenMode
              ? "border-[rgba(96,201,182,0.2)]"
              : isDark
                ? "border-[rgba(255,255,255,0.06)]"
                : "border-gray-200"
          }`}
        >
          <Skeleton className="h-5 md:h-6 w-32 md:w-40 mb-4" />

          {/* Search Bar */}
          <Skeleton className="h-10 md:h-11 w-full rounded-lg mb-4" />

          {/* Tab Navigation and Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Skeleton className="h-7 w-16 md:w-20 rounded-lg" />
              <Skeleton className="h-7 w-20 md:w-24 rounded-lg" />
              <Skeleton className="h-7 w-20 md:w-24 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-full sm:w-32 md:w-40 rounded-lg" />
          </div>
        </div>

        {/* Session List */}
        <div className="p-4 md:p-6">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className={`p-3 md:p-4 rounded-lg border ${
                  isHalloweenMode
                    ? isDark
                      ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                      : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
                    : isDark
                      ? "bg-[rgba(0,0,0,0.2)] border-[rgba(255,255,255,0.05)]"
                      : "bg-white border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between gap-2 md:gap-3">
                  <div className="flex items-start space-x-2 md:space-x-3 flex-1 min-w-0">
                    <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                        <Skeleton className="h-4 md:h-5 w-24 md:w-32" />
                        <Skeleton className="h-5 w-20 md:w-24 rounded-full" />
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-3 mb-1">
                        <Skeleton className="h-3 w-20 md:w-24" />
                        <Skeleton className="h-3 w-12 md:w-16" />
                      </div>
                      <Skeleton className="h-3 w-full max-w-xs" />
                    </div>
                  </div>
                  <div className="flex items-start space-x-1 md:space-x-1.5 shrink-0">
                    <Skeleton className="w-7 h-7 md:w-8 md:h-8 rounded-lg" />
                    <Skeleton className="w-7 h-7 md:w-8 md:h-8 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-4 border-t ${
              isHalloweenMode
                ? "border-[rgba(96,201,182,0.2)]"
                : isDark
                  ? "border-[rgba(255,255,255,0.06)]"
                  : "border-gray-200"
            }`}
          >
            <Skeleton className="h-3 md:h-4 w-40 md:w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-7 h-7 md:w-8 md:h-8 rounded-lg" />
              <Skeleton className="h-3 md:h-4 w-20 md:w-24" />
              <Skeleton className="w-7 h-7 md:w-8 md:h-8 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
