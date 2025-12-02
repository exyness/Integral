import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/contexts/ThemeContext";

export const BudgetsTabSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  const halloweenColors = [
    { color: "96,201,182" },
    { color: "72,187,168" },
    { color: "120,215,196" },
    { color: "64,224,208" },
  ];

  const regularColors = [
    { color: "139,92,246" },
    { color: "16,185,129" },
    { color: "245,158,11" },
    { color: "239,68,68" },
  ];

  const colors = isHalloweenMode ? halloweenColors : regularColors;

  return (
    <>
      {/* Budget Stats Skeleton */}
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
                  <Skeleton className="h-5 md:h-8 w-12 md:w-16" />
                </div>
                <Skeleton className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Skeleton */}
      <div
        className={`space-y-3 md:space-y-4 px-4 md:px-6 pb-4 md:pb-6 border-b ${
          isHalloweenMode
            ? "border-[rgba(96,201,182,0.2)]"
            : "border-[rgba(255,255,255,0.1)]"
        }`}
      >
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
          <Skeleton className="h-10 w-full lg:flex-1 rounded-lg" />
          <div className="flex flex-col sm:flex-row gap-3 lg:shrink-0">
            <Skeleton className="h-10 w-full sm:w-40 rounded-lg" />
            <Skeleton className="h-10 w-full sm:w-40 rounded-lg" />
            <Skeleton className="h-10 w-full sm:w-48 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Budget Cards Grid Skeleton */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`p-4 md:p-6 rounded-xl border ${
                isHalloweenMode
                  ? isDark
                    ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                    : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]"
                    : "bg-white border-gray-200"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Skeleton className="w-3 h-3 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              </div>

              {/* Amount */}
              <div className="mb-4">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-8 w-24" />
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>

              {/* Footer Stats */}
              <div
                className={`flex items-center justify-between pt-4 border-t ${
                  isHalloweenMode
                    ? "border-[rgba(96,201,182,0.2)]"
                    : "border-[rgba(255,255,255,0.1)]"
                }`}
              >
                <div>
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export const ExpensesTabSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <>
      {/* Filters Skeleton */}
      <div
        className={`space-y-3 md:space-y-4 px-4 md:px-6 py-4 md:py-6 border-b ${
          isHalloweenMode
            ? "border-[rgba(96,201,182,0.2)]"
            : "border-[rgba(255,255,255,0.1)]"
        }`}
      >
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
          <Skeleton className="h-10 w-full lg:flex-1 rounded-lg" />
          <div className="flex flex-col sm:flex-row gap-3 lg:shrink-0">
            <Skeleton className="h-10 w-full sm:w-40 rounded-lg" />
            <Skeleton className="h-10 w-full sm:w-40 rounded-lg" />
            <Skeleton className="h-10 w-full sm:w-48 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Transaction List Skeleton */}
      <div className="p-4 md:p-6">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border ${
                isHalloweenMode
                  ? isDark
                    ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                    : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]"
                    : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 md:h-5 w-32 md:w-48 mb-2" />
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <Skeleton className="h-5 w-16 rounded-lg" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 md:h-6 w-16 md:w-20 mb-1" />
                  <Skeleton className="h-3 w-12 md:w-16" />
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
    { color: "96,201,182" },
    { color: "72,187,168" },
    { color: "120,215,196" },
    { color: "64,224,208" },
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
            className={`aspect-square sm:aspect-auto sm:h-24 md:h-28 w-full rounded-lg ${
              isHalloweenMode ? "bg-[rgba(96,201,182,0.05)]" : ""
            }`}
          />
        ))}
      </div>

      {/* Calendar Stats */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {colors.map((stat, i) => (
          <div
            key={i}
            className={`p-3 md:p-4 rounded-xl ${
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

export const CategoriesTabSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <div className="space-y-8">
      {/* Expense, Income, Goal Categories Sections */}
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-4">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 md:mb-6">
            <div>
              <Skeleton
                className={`h-4 md:h-5 w-32 md:w-40 mb-1 ${
                  isHalloweenMode ? "bg-[rgba(96,201,182,0.2)]" : ""
                }`}
              />
              <Skeleton
                className={`h-3 w-24 ${
                  isHalloweenMode ? "bg-[rgba(96,201,182,0.15)]" : ""
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton
                className={`h-7 md:h-8 w-16 md:w-20 rounded-lg ${
                  isHalloweenMode ? "bg-[rgba(96,201,182,0.15)]" : ""
                }`}
              />
              <Skeleton
                className={`h-7 md:h-8 w-32 md:w-40 rounded-lg ${
                  isHalloweenMode ? "bg-[rgba(96,201,182,0.2)]" : ""
                }`}
              />
            </div>
          </div>

          {/* Category Grid - Matches CategoryManager exactly */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`group rounded-xl border transition-all overflow-hidden ${
                  isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.15)] border-[#60c9b6]/30"
                    : isDark
                      ? "bg-white/5 border-white/10"
                      : "bg-white border-gray-200"
                }`}
              >
                <div className="p-2 md:p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Skeleton
                        className={`w-7 h-7 md:w-8 md:h-8 rounded-md shrink-0 ${
                          isHalloweenMode ? "bg-[rgba(96,201,182,0.2)]" : ""
                        }`}
                      />
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <Skeleton
                          className={`h-3 md:h-4 w-16 md:w-20 ${
                            isHalloweenMode ? "bg-[rgba(96,201,182,0.2)]" : ""
                          }`}
                        />
                        <Skeleton
                          className={`h-2 md:h-2.5 w-10 md:w-12 ${
                            isHalloweenMode ? "bg-[rgba(96,201,182,0.15)]" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const AnalyticsTabSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  // Halloween-themed colors for skeleton cards (teal/cyan theme)
  const halloweenColors = [
    { color: "96,201,182" }, // Teal (main Halloween color)
    { color: "72,187,168" }, // Darker teal
    { color: "120,215,196" }, // Lighter teal
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
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with Date Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <Skeleton className="h-6 sm:h-7 w-40 sm:w-48 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-32 sm:w-40" />
        </div>
        <div className="flex space-x-1.5 sm:space-x-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-12 sm:w-14 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Summary Cards */}
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

      {/* Spending Insights Card */}
      <div
        className={`p-4 md:p-6 rounded-xl border ${
          isHalloweenMode
            ? isDark
              ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
              : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
            : isDark
              ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]"
              : "bg-white border-gray-200"
        }`}
      >
        <Skeleton className="h-5 md:h-6 w-40 md:w-48 mb-4" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`p-3 md:p-4 rounded-lg border ${
                isHalloweenMode
                  ? isDark
                    ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                    : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]"
                    : "bg-gray-50 border-gray-200"
              }`}
            >
              <Skeleton className="h-16 w-16 rounded-full mx-auto mb-2" />
              <Skeleton className="h-3 w-20 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category Chart */}
        <div
          className={`p-4 md:p-6 rounded-xl border ${
            isHalloweenMode
              ? isDark
                ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
              : isDark
                ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]"
                : "bg-white border-gray-200"
          }`}
        >
          <Skeleton className="h-5 md:h-6 w-40 md:w-48 mb-4" />
          <Skeleton className="h-48 md:h-64 w-full rounded-lg" />
        </div>

        {/* Spending Comparison Chart */}
        <div
          className={`p-4 md:p-6 rounded-xl border ${
            isHalloweenMode
              ? isDark
                ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
              : isDark
                ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]"
                : "bg-white border-gray-200"
          }`}
        >
          <Skeleton className="h-5 md:h-6 w-40 md:w-48 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Expenses */}
      <div
        className={`p-4 md:p-6 rounded-xl border ${
          isHalloweenMode
            ? isDark
              ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
              : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
            : isDark
              ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]"
              : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 md:h-6 w-32 md:w-40" />
          <Skeleton className="h-8 w-24 md:w-32 rounded-lg" />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-7 w-16 md:w-20 rounded-lg" />
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`p-3 md:p-4 rounded-xl border ${
                isHalloweenMode
                  ? isDark
                    ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                    : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]"
                    : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                  <Skeleton className="w-9 h-9 md:w-12 md:h-12 rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 md:h-5 w-32 md:w-48 mb-2" />
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <Skeleton className="h-5 w-16 rounded-lg" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 md:h-6 w-16 md:w-20 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AccountsTabSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Account Groups */}
      {[1, 2].map((section) => (
        <div key={section}>
          {/* Section Header */}
          <Skeleton className="h-4 w-32 mb-3" />

          {/* Account Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${
                  isHalloweenMode
                    ? isDark
                      ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                      : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
                    : isDark
                      ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]"
                      : "bg-white border-gray-200"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                </div>

                {/* Balance */}
                <div className="mb-3">
                  <Skeleton className="h-7 w-28" />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Goals Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-52" />
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`p-4 md:p-6 rounded-xl border ${
                isHalloweenMode
                  ? isDark
                    ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                    : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]"
                    : "bg-white border-gray-200"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const RecurringTabSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <div className="space-y-6">
      {/* Recurring Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className={`p-3 sm:p-4 rounded-xl border ${
              isHalloweenMode
                ? isDark
                  ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                  : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]"
                  : "bg-white border-gray-200"
            }`}
          >
            {/* Header with Icon, Title, and Amount */}
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-24 sm:w-32 mb-1" />
                  <Skeleton className="h-3 w-16 sm:w-20" />
                </div>
              </div>
              <Skeleton className="h-6 sm:h-7 w-16 sm:w-20 ml-3" />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>

            {/* Account Info */}
            <div className="mb-3">
              <Skeleton className="h-3 w-16 mb-1" />
              <div className="flex items-center gap-1.5">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 w-20 sm:w-24" />
              </div>
            </div>

            {/* Next Payment */}
            <div className="pt-2 sm:pt-2.5 mt-2 sm:mt-2.5 border-t border-white/10">
              <div className="flex items-center gap-1">
                <Skeleton className="w-3.5 h-3.5 rounded" />
                <Skeleton className="h-3 w-32 sm:w-40" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BalanceSheetTabSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      {/* Net Worth Summary */}
      <div
        className={`p-4 md:p-6 rounded-xl border ${
          isHalloweenMode
            ? isDark
              ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
              : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
            : isDark
              ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]"
              : "bg-white border-gray-200"
        }`}
      >
        <div className="text-center">
          <Skeleton className="h-3 md:h-4 w-20 md:w-24 mx-auto mb-2" />
          <Skeleton className="h-8 md:h-12 lg:h-14 w-40 md:w-56 mx-auto mb-4 md:mb-6" />
          <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 md:gap-8">
            <div className="text-center">
              <Skeleton className="h-3 w-20 mx-auto mb-1" />
              <Skeleton className="h-5 md:h-6 w-24 md:w-32 mx-auto" />
            </div>
            <Skeleton className="h-6 w-4" />
            <div className="text-center">
              <Skeleton className="h-3 w-24 mx-auto mb-1" />
              <Skeleton className="h-5 md:h-6 w-24 md:w-32 mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Net Worth Chart */}
      <div
        className={`p-4 md:p-6 rounded-xl border ${
          isHalloweenMode
            ? isDark
              ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
              : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
            : isDark
              ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]"
              : "bg-white border-gray-200"
        }`}
      >
        <Skeleton className="h-5 md:h-6 w-32 md:w-40 mb-4" />
        <Skeleton className="h-64 md:h-80 w-full rounded-lg" />
      </div>

      {/* Breakdown Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {[1, 2].map((card) => (
          <div
            key={card}
            className={`p-4 md:p-6 rounded-xl border ${
              isHalloweenMode
                ? isDark
                  ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                  : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]"
                  : "bg-white border-gray-200"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 md:h-6 w-32 md:w-40" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>

            {/* Total Amount */}
            <Skeleton className="h-8 md:h-10 w-32 md:w-40 mb-4" />

            {/* Mini Chart */}
            <Skeleton className="h-40 md:h-48 w-full rounded-lg mb-4" />

            {/* Items List */}
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <Skeleton className="h-3 w-20 md:w-24" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-3 w-16 md:w-20" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* All Accounts Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border ${
                isHalloweenMode
                  ? isDark
                    ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                    : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]"
                    : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-28 mb-3" />
              <div className="flex items-center justify-between text-xs">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Liabilities Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border ${
                isHalloweenMode
                  ? isDark
                    ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                    : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]"
                    : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-5 w-28 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-32 mb-3" />
              <div className="flex items-center justify-between text-xs">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
