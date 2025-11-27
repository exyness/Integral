import React from "react";
import { GlassCard } from "@/components/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/contexts/ThemeContext";

export const TimePageSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  const halloweenColors = [
    { color: "96,201,182" },
    { color: "72,187,168" },
    { color: "120,215,196" },
    { color: "64,224,208" },
  ];

  const regularColors = [
    { color: "16,185,129" },
    { color: "139,92,246" },
    { color: "59,130,246" },
    { color: "245,158,11" },
  ];

  const colors = isHalloweenMode ? halloweenColors : regularColors;

  return (
    <div className="space-y-6">
      {/* Header Section Skeleton */}
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
            <Skeleton className="h-6 md:h-7 w-32 md:w-40" />
            <Skeleton className="h-6 md:h-7 w-20 md:w-24 rounded-lg" />
          </div>
          <Skeleton className="h-3 md:h-4 w-48 md:w-64" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
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

      {/* Start New Timer Section Skeleton */}
      <GlassCard
        className={`p-4 md:p-6 ${isHalloweenMode ? "border-[rgba(96,201,182,0.2)]" : ""}`}
      >
        <Skeleton className="h-5 md:h-6 w-32 md:w-40 mb-4 md:mb-6" />
        <div className="space-y-3 md:space-y-4">
          <div>
            <Skeleton className="h-3 md:h-4 w-20 md:w-24 mb-1.5 md:mb-2" />
            <Skeleton className="h-10 md:h-12 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-3 md:h-4 w-32 md:w-40 mb-1.5 md:mb-2" />
            <Skeleton className="h-10 md:h-12 w-full rounded-lg" />
          </div>
          <Skeleton className="h-10 md:h-12 w-full rounded-lg" />
        </div>
      </GlassCard>

      {/* Time Sessions Section Skeleton */}
      <GlassCard
        className={`overflow-hidden ${isHalloweenMode ? "border-[rgba(96,201,182,0.2)]" : ""}`}
      >
        <div
          className={`p-4 md:p-6 border-b ${
            isHalloweenMode
              ? "border-[rgba(96,201,182,0.2)]"
              : isDark
                ? "border-[rgba(255,255,255,0.06)]"
                : "border-gray-200"
          }`}
        >
          <Skeleton className="h-5 md:h-6 w-32 md:w-40 mb-3 md:mb-4" />

          {/* Search and Filters - Mobile */}
          <div className="md:hidden space-y-2 mb-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-[3] rounded-lg" />
              <Skeleton className="h-10 flex-[2] rounded-lg" />
            </div>
          </div>

          {/* Search and Filters - Desktop */}
          <div className="hidden md:flex gap-3 mb-4">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-48 rounded-lg" />
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 md:h-9 w-24 md:w-32 rounded-lg" />
            <Skeleton className="h-8 md:h-9 w-28 md:w-36 rounded-lg" />
          </div>
        </div>

        {/* Session Cards Skeleton */}
        <div className="pb-4">
          <div className="space-y-3 mt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`mx-4 p-3 md:p-4 rounded-lg border ${
                  isHalloweenMode
                    ? isDark
                      ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                      : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
                    : isDark
                      ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]"
                      : "bg-white border-gray-200"
                }`}
              >
                {/* Mobile Layout */}
                <div className="md:hidden space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-4 w-32 flex-1" />
                    <Skeleton className="h-5 w-8 rounded-lg" />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-16 rounded" />
                      <Skeleton className="h-6 w-16 rounded" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-full" />
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-3 w-3 rounded-sm" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-between gap-3">
                  <Skeleton className="h-8 w-24 rounded-md" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div
            className={`px-4 md:px-6 py-4 mt-4 border-t ${
              isHalloweenMode
                ? "border-[rgba(96,201,182,0.2)]"
                : isDark
                  ? "border-[rgba(255,255,255,0.06)]"
                  : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-48 md:w-64" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-4 w-12 md:w-16" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export const ActiveTimerSkeleton: React.FC = () => {
  const { isHalloweenMode } = useTheme();

  return (
    <div className="space-y-3 md:space-y-4">
      <Skeleton className="h-5 md:h-6 w-40 md:w-48" />
      <div className="grid gap-3 md:gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className={`border rounded-lg md:rounded-xl p-3 md:p-6 backdrop-blur-sm ${
              isHalloweenMode
                ? "bg-linear-to-r from-[rgba(96,201,182,0.1)] to-[rgba(72,187,168,0.1)] border-[rgba(96,201,182,0.3)]"
                : "bg-linear-to-r from-[rgba(16,185,129,0.1)] to-[rgba(139,92,246,0.1)] border-[rgba(16,185,129,0.3)]"
            }`}
          >
            {/* Mobile Layout */}
            <div className="md:hidden space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 flex-1 rounded-lg" />
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between gap-4">
              <div className="flex items-center space-x-4 flex-1">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full max-w-md" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-24 rounded-lg" />
                <Skeleton className="h-10 w-20 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
