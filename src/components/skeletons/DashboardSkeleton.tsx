import React from "react";
import { GlassCard } from "@/components/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/contexts/ThemeContext";

export const DashboardSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  const halloweenColors = [
    { color: "96,201,182" },
    { color: "72,187,168" },
    { color: "120,215,196" },
    { color: "64,224,208" },
    { color: "45,212,191" },
    { color: "20,184,166" },
    { color: "13,148,136" },
  ];

  const regularColors = [
    { color: "16,185,129" },
    { color: "139,92,246" },
    { color: "59,130,246" },
    { color: "239,68,68" },
    { color: "245,158,11" },
    { color: "6,182,212" },
    { color: "236,72,153" },
  ];

  const colors = isHalloweenMode ? halloweenColors : regularColors;

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Welcome Header Skeleton */}
      <GlassCard
        className={`mb-4 md:mb-6 ${isHalloweenMode ? "border-[rgba(96,201,182,0.2)]" : ""}`}
      >
        <div className="rounded-xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <Skeleton className="h-6 md:h-8 lg:h-9 w-48 md:w-64 mb-2" />
              <Skeleton className="h-4 md:h-5 w-64 md:w-80" />
            </div>
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="text-left md:text-right">
                <Skeleton className="h-3 md:h-4 w-24 mb-1" />
                <Skeleton className="h-6 md:h-8 w-16" />
              </div>
              <Skeleton className="w-6 h-6 md:w-8 md:h-8 rounded-full" />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
        {colors.map((stat, i) => (
          <div
            key={i}
            className={`p-3 md:p-4 rounded-xl border ${
              isDark
                ? `bg-[rgba(${stat.color},0.1)] border-[rgba(${stat.color},0.2)]`
                : `bg-[rgba(${stat.color},0.05)] border-[rgba(${stat.color},0.2)]`
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="h-2.5 md:h-3 w-12 md:w-16 mb-0.5 md:mb-1" />
                <Skeleton className="h-4 md:h-5 w-8 md:w-10" />
              </div>
              <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <GlassCard
        className={isHalloweenMode ? "border-[rgba(96,201,182,0.2)]" : ""}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center space-x-2 mb-3 md:mb-4">
            <Skeleton className="w-4 h-4 md:w-5 md:h-5 rounded" />
            <Skeleton className="h-4 md:h-5 w-24 md:w-32" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3 lg:gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className={`p-3 md:p-4 rounded-lg border ${
                  isHalloweenMode
                    ? isDark
                      ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                      : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)]"
                    : isDark
                      ? "bg-[rgba(40,40,45,0.3)] border-[rgba(255,255,255,0.08)]"
                      : "bg-white/50 border-gray-200/50"
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-2 md:space-y-3">
                  <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-lg" />
                  <div className="w-full">
                    <Skeleton className="h-3 md:h-4 w-16 md:w-20 mx-auto mb-1" />
                    <Skeleton className="h-2 md:h-3 w-12 md:w-16 mx-auto hidden sm:block" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Task Overview & Budget Summary Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Task Overview */}
        <GlassCard
          className={isHalloweenMode ? "border-[rgba(96,201,182,0.2)]" : ""}
        >
          <div className="p-4 md:p-6">
            <div className="flex items-center space-x-2 mb-3 md:mb-4">
              <Skeleton className="w-4 h-4 md:w-5 md:h-5 rounded" />
              <Skeleton className="h-4 md:h-5 w-24 md:w-32" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-3 md:h-4 w-16 md:w-20" />
                    <Skeleton className="h-3 md:h-4 w-8 md:w-10" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Budget Summary */}
        <GlassCard
          className={isHalloweenMode ? "border-[rgba(96,201,182,0.2)]" : ""}
        >
          <div className="p-4 md:p-6">
            <div className="flex items-center space-x-2 mb-3 md:mb-4">
              <Skeleton className="w-4 h-4 md:w-5 md:h-5 rounded" />
              <Skeleton className="h-4 md:h-5 w-24 md:w-32" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-3 md:h-4 w-20 md:w-24" />
                    <Skeleton className="h-3 md:h-4 w-16 md:w-20" />
                  </div>
                  {i === 2 && <Skeleton className="h-2 w-full rounded-full" />}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Bottom Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {(isHalloweenMode
          ? halloweenColors.slice(0, 3)
          : [
              { color: "239,68,68" },
              { color: "59,130,246" },
              { color: "236,72,153" },
            ]
        ).map((stat, i) => (
          <GlassCard
            key={i}
            className={isHalloweenMode ? "border-[rgba(96,201,182,0.2)]" : ""}
          >
            <div className="p-4 md:p-6">
              <div className="flex items-center space-x-2 mb-3 md:mb-4">
                <Skeleton className="w-4 h-4 md:w-5 md:h-5 rounded" />
                <Skeleton className="h-4 md:h-5 w-24 md:w-32" />
              </div>
              <div className="space-y-3">
                {[1, 2].map((j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-3 md:h-4 w-16 md:w-20" />
                    <Skeleton className="h-3 md:h-4 w-8 md:w-12" />
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
