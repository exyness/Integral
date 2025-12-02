import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/contexts/ThemeContext";

export const BalanceSheetSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Net Worth Summary Skeleton */}
      <div
        className={`p-4 md:p-6 rounded-xl border ${
          isHalloweenMode
            ? "bg-[#1a1a1f] border-[#60c9b6]/30"
            : isDark
              ? "bg-white/5 border-white/10"
              : "bg-white border-gray-200"
        }`}
      >
        <div className="text-center space-y-4">
          <Skeleton className="h-4 w-24 mx-auto" />
          <Skeleton className="h-10 md:h-12 w-48 mx-auto" />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-4 md:mt-6">
            <div className="text-center space-y-2">
              <Skeleton className="h-3 w-20 mx-auto" />
              <Skeleton className="h-6 w-28 mx-auto" />
            </div>
            <Skeleton className="h-8 w-4" />
            <div className="text-center space-y-2">
              <Skeleton className="h-3 w-24 mx-auto" />
              <Skeleton className="h-6 w-28 mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Skeleton */}
      <div
        className={`p-4 md:p-6 rounded-xl border ${
          isHalloweenMode
            ? "bg-[#1a1a1f] border-[#60c9b6]/30"
            : isDark
              ? "bg-white/5 border-white/10"
              : "bg-white border-gray-200"
        }`}
      >
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-48 md:h-64 w-full" />
      </div>

      {/* Assets and Liabilities Skeleton */}
      <div className="space-y-8">
        {/* Assets Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Chart */}
          <div className="h-[200px] flex items-center justify-center">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>

          {/* Asset List */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${
                  isHalloweenMode
                    ? "bg-[#1a1a1f] border-[#60c9b6]/20"
                    : isDark
                      ? "bg-white/5 border-white/10"
                      : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liabilities Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>

          {/* Chart */}
          <div className="h-[200px] flex items-center justify-center">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>

          {/* Liability List */}
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${
                  isHalloweenMode
                    ? "bg-[#1a1a1f] border-[#60c9b6]/20"
                    : isDark
                      ? "bg-white/5 border-white/10"
                      : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="w-8 h-8 rounded-lg" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
