import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/contexts/ThemeContext";

export const AccountsGridSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <div
          key={i}
          className={`rounded-xl border p-3 ${
            isHalloweenMode
              ? isDark
                ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
              : isDark
                ? "bg-[rgba(26,26,31,0.6)] border-[rgba(255,255,255,0.08)]"
                : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>

          {/* Details */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-3 w-16" />
          </div>

          {/* Progress bar */}
          <div className="mt-2">
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const AccountsListSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <div
          key={i}
          className={`rounded-xl border ${
            isHalloweenMode
              ? isDark
                ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
              : isDark
                ? "bg-[rgba(26,26,31,0.6)] border-[rgba(255,255,255,0.08)]"
                : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          {/* Mobile Layout */}
          <div className="block sm:hidden p-2.5">
            <div className="flex items-start gap-2">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <Skeleton className="h-4 w-2/3 flex-1" />
                  <Skeleton className="h-3 w-12 shrink-0" />
                </div>
                <div className="space-y-1 mb-1.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:block p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Skeleton className="w-3 h-3 rounded shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16 rounded" />
                  </div>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-3 w-16 ml-3 shrink-0" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ActivityViewSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`p-3 md:p-4 rounded-xl border ${
              isHalloweenMode
                ? isDark
                  ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                  : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
                : isDark
                  ? "bg-[rgba(26,26,31,0.6)] border-[rgba(255,255,255,0.08)]"
                  : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-6 md:h-8 w-20" />
              </div>
              <Skeleton className="w-10 h-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Activity List */}
      <div
        className={`rounded-xl border overflow-hidden ${
          isHalloweenMode
            ? "border-[rgba(96,201,182,0.2)]"
            : isDark
              ? "bg-[rgba(26,26,31,0.6)] border-[rgba(255,255,255,0.08)]"
              : "bg-white border-gray-200 shadow-sm"
        }`}
      >
        <div className="p-3 sm:p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>

          {/* Filters */}
          <div className="mb-4 space-y-3">
            {/* Desktop: Search + Dropdowns */}
            <div className="hidden lg:flex items-center gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>

            {/* Mobile: Stacked */}
            <div className="lg:hidden space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          </div>

          {/* Activity Cards */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 ${
                  isHalloweenMode
                    ? isDark
                      ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                      : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
                    : isDark
                      ? "bg-[rgba(40,40,45,0.6)] border-[rgba(255,255,255,0.08)]"
                      : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-16 rounded" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Skeleton className="w-8 h-8 rounded" />
                    <Skeleton className="w-8 h-8 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 border-t pt-4">
            <Skeleton className="h-4 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CalendarViewSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        isHalloweenMode
          ? "border-[rgba(96,201,182,0.2)]"
          : isDark
            ? "bg-[rgba(26,26,31,0.6)] border-[rgba(255,255,255,0.08)]"
            : "bg-white border-gray-200 shadow-sm"
      }`}
    >
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="w-8 h-8 rounded" />
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={`header-${i}`} className="h-8 w-full" />
          ))}
          {/* Calendar days */}
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={`day-${i}`} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const AccountsPageSkeleton: React.FC<{
  viewMode: "grid" | "list";
  activeTab: "accounts" | "activity" | "calendar";
}> = ({ viewMode, activeTab }) => {
  const { isDark, isHalloweenMode } = useTheme();

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
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <Skeleton className="h-6 md:h-8 w-48" />
            <div className="hidden lg:flex items-center gap-2">
              <Skeleton className="h-7 w-24 rounded-lg" />
              <Skeleton className="h-7 w-28 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-3 w-64" />

          {/* Mobile Action Buttons */}
          <div className="flex lg:hidden items-center gap-2 mt-3">
            <Skeleton className="h-7 w-28 rounded-lg" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 md:mb-8">
        <div className="relative flex space-x-1 sm:space-x-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "activity" ? (
        <ActivityViewSkeleton />
      ) : activeTab === "calendar" ? (
        <CalendarViewSkeleton />
      ) : (
        <div className="flex h-[calc(100vh-120px)] lg:h-[calc(100vh-280px)] relative">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block w-64 mr-4">
            <div
              className={`rounded-xl border p-4 ${
                isHalloweenMode
                  ? isDark
                    ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                    : "bg-white border-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[rgba(26,26,31,0.6)] border-[rgba(255,255,255,0.08)]"
                    : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              <Skeleton className="h-8 w-full mb-4 rounded-lg" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Search Bar */}
            <div className="lg:px-4 pt-1 pb-3 lg:py-3 mb-2 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 lg:h-10 flex-1" />
                <Skeleton className="h-9 lg:h-10 w-20 rounded-lg" />
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full px-3 pt-1 pb-3">
                {viewMode === "grid" ? (
                  <AccountsGridSkeleton />
                ) : (
                  <AccountsListSkeleton />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
