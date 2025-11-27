import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/contexts/ThemeContext";

export const NotesGridSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <div
      className="grid gap-2.5 sm:gap-3"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      }}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
        <div
          key={i}
          className={`rounded-xl border overflow-hidden aspect-square ${
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
          <div
            className={`p-3 border-b relative ${
              isHalloweenMode
                ? "border-[rgba(96,201,182,0.2)]"
                : isDark
                  ? "border-[rgba(255,255,255,0.08)]"
                  : "border-gray-200"
            }`}
          >
            <Skeleton className="h-4 sm:h-5 w-3/4 mb-0 pr-16" />
            {/* Action buttons in top right */}
            <div className="absolute top-3 right-3 flex items-center space-x-1">
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="w-6 h-6 rounded" />
            </div>
          </div>

          {/* Content Preview */}
          <div className="p-3 flex-1 flex flex-col">
            <div className="mb-2 p-3 rounded-md flex-1">
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-11/12 mb-2" />
              <Skeleton className="h-3 w-10/12 mb-2" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-9/12 mb-2" />
              <Skeleton className="h-3 w-11/12 mb-2" />
              <Skeleton className="h-3 w-10/12" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const NotesListSkeleton: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
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
          {/* Mobile Layout - Stacked */}
          <div className="block sm:hidden p-2.5">
            <div className="flex items-start gap-2">
              {/* Icon */}
              <Skeleton className="w-8 h-8 rounded-lg shrink-0 mt-0.5" />

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-3.5 w-2/3 flex-1" />
                  <Skeleton className="h-3 w-12 shrink-0" />
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Skeleton className="w-6 h-6 rounded-md" />
                    <Skeleton className="w-6 h-6 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop/Tablet Layout - Horizontal */}
          <div className="hidden sm:block p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Skeleton className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
              <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
                <div className="flex items-center space-x-1">
                  <Skeleton className="w-6 h-6 rounded" />
                  <Skeleton className="w-6 h-6 rounded" />
                </div>
                <Skeleton className="h-5 w-16 rounded hidden md:inline-block" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const NotesPageSkeleton: React.FC<{ viewMode: "grid" | "list" }> = ({
  viewMode,
}) => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <div className="flex h-[calc(100vh-120px)] lg:h-[calc(100vh-80px)] relative">
      {/* Sidebar Skeleton - Desktop Only - Matches FolderSidebar */}
      <div className="hidden lg:block lg:w-60 pr-3 my-1 lg:-mt-3 lg:mb-0">
        <div
          className={`h-full rounded-xl border backdrop-blur-xl flex flex-col ${
            isHalloweenMode
              ? isDark
                ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                : "bg-white/90 border-[rgba(96,201,182,0.2)]"
              : isDark
                ? "bg-[rgba(26,26,31,0.6)] border-[rgba(255,255,255,0.08)]"
                : "bg-white/90 border-gray-200/60"
          }`}
        >
          {/* Header */}
          <div className="p-2 lg:p-3 shrink-0">
            <div className="flex items-center justify-between mb-2 lg:mb-3">
              <Skeleton className="h-4 w-16" />
              <div className="flex items-center space-x-1">
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
            </div>
          </div>

          {/* Folder List */}
          <div className="flex-1 px-2 pb-2 lg:px-3 lg:pb-3 min-h-0">
            <div className="space-y-1 pr-3">
              {/* All Notes/Accounts */}
              <Skeleton className="h-8 w-full rounded-lg" />

              {/* Folder Items */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-8 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:overflow-hidden overflow-y-auto scrollbar-hide lg:-mt-3">
        {/* Mobile Header - Matches actual Notes page */}
        <div className="mb-4 pt-4 px-3 lg:hidden">
          <div>
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-56 mb-3" />

            {/* Mobile Action Buttons - Below Description */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-32 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-3 lg:px-4 pt-1 pb-3 lg:py-3 mb-2 space-y-2">
          {/* Mobile: Search + View Mode */}
          <div className="flex lg:hidden items-center gap-2">
            <Skeleton className="h-8 flex-1 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-lg" />
          </div>

          {/* Desktop: Search + View Mode + New Button */}
          <div className="hidden lg:flex items-center gap-3 -mt-3">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 lg:gap-2">
              <Skeleton className="h-6 lg:h-8 w-12 lg:w-16 rounded-lg" />
              <Skeleton className="h-6 lg:h-8 w-16 lg:w-20 rounded-lg" />
              <Skeleton className="h-6 lg:h-8 w-20 lg:w-24 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Notes Content */}
        <div className="flex-1 lg:overflow-hidden">
          {/* Desktop: ScrollArea */}
          <div className="hidden lg:block h-full overflow-y-auto px-3 pt-1 pb-3">
            {viewMode === "grid" ? (
              <NotesGridSkeleton />
            ) : (
              <NotesListSkeleton />
            )}
          </div>

          {/* Mobile: Direct scrollable content */}
          <div className="lg:hidden px-3 pt-1 pb-3">
            {viewMode === "grid" ? (
              <NotesGridSkeleton />
            ) : (
              <NotesListSkeleton />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
