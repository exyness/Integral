import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Calendar, X } from "lucide-react";
import React from "react";
import { spiderHairyCrawling, witchBrew } from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import { getMoodEmoji } from "@/lib/journalUtils";
import { Journal } from "@/types/journal";

interface JournalEntriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  entries: Journal[];
  onEntryClick?: (entryId: string) => void;
}

export const JournalEntriesModal: React.FC<JournalEntriesModalProps> = ({
  isOpen,
  onClose,
  date,
  entries,
  onEntryClick,
}) => {
  const { isDark, isHalloweenMode } = useTheme();

  const getEnergyColor = (energy?: number | null) => {
    if (!energy) return "#6B7280";
    const colors = ["#EF4444", "#F97316", "#EAB308", "#22C55E", "#10B981"];
    return colors[energy - 1];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              className={`w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-xl ${
                isHalloweenMode
                  ? "border bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]! relative"
                  : isDark
                    ? "bg-[#1A1A1A] border border-[rgba(255,255,255,0.1)]"
                    : "bg-white border border-gray-200"
              } shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {isHalloweenMode && (
                <>
                  <div className="absolute -bottom-10 -left-10 pointer-events-none z-0">
                    <img
                      src={witchBrew}
                      alt=""
                      className="w-48 h-48 -rotate-12 opacity-10"
                    />
                  </div>
                  <div className="absolute -top-10 -right-10 pointer-events-none z-0">
                    <img
                      src={spiderHairyCrawling}
                      alt=""
                      className="w-48 h-48 rotate-12 opacity-10"
                    />
                  </div>
                </>
              )}
              {/* Header */}
              <div
                className={`p-3 border-b ${
                  isDark ? "border-[rgba(255,255,255,0.1)]" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                    <Calendar
                      className={`w-5 h-5 md:w-6 md:h-6 shrink-0 ${
                        isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"
                      }`}
                    />
                    <div className="min-w-0">
                      <h2
                        className={`text-sm md:text-xl font-semibold truncate ${
                          isHalloweenMode
                            ? "text-[#60c9b6]"
                            : isDark
                              ? "text-white"
                              : "text-gray-900"
                        }`}
                      >
                        <span className="hidden sm:inline">Entries for </span>
                        {date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </h2>
                      <p
                        className={`text-xs md:text-sm ${
                          isDark ? "text-[#B4B4B8]" : "text-gray-600"
                        }`}
                      >
                        {entries.length} entr
                        {entries.length !== 1 ? "ies" : "y"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className={`p-2 rounded-lg transition-colors shrink-0 ${
                      isDark
                        ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.1)]"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 overflow-y-auto mobile-scrollbar-hide max-h-[60vh]">
                {entries.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen
                      className={`w-12 h-12 mx-auto mb-4 ${
                        isDark ? "text-[#6B7280]" : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`text-lg font-medium ${
                        isDark ? "text-[#B4B4B8]" : "text-gray-600"
                      }`}
                    >
                      No entries for this day
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {entries.map((entry) => (
                      <motion.div
                        key={entry.id}
                        className={`p-2 rounded-lg cursor-pointer transition-all ${
                          isHalloweenMode
                            ? isDark
                              ? "bg-[rgba(96,201,182,0.05)] hover:bg-[rgba(96,201,182,0.1)] hover:shadow-[0_0_15px_rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.1)] hover:border-[rgba(96,201,182,0.3)]"
                              : "bg-white hover:bg-[rgba(96,201,182,0.1)] hover:shadow-[0_0_15px_rgba(96,201,182,0.15)] border border-[rgba(96,201,182,0.2)] hover:border-[rgba(96,201,182,0.4)]"
                            : isDark
                              ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.08)]"
                              : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                        }`}
                        onClick={() => {
                          onEntryClick?.(entry.id);
                          onClose();
                        }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.1 }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex items-start space-x-2 md:space-x-3 flex-1 min-w-0">
                            <div
                              className="w-2 h-2 md:w-3 md:h-3 rounded-full shrink-0 mt-1"
                              style={{
                                backgroundColor: isHalloweenMode
                                  ? "rgba(96,201,182,0.2)"
                                  : entry.project?.color || "#8B5CF6",
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4
                                className={`font-medium text-sm md:text-base truncate ${
                                  isDark ? "text-white" : "text-gray-900"
                                }`}
                                style={{
                                  color: isHalloweenMode
                                    ? "#60c9b6"
                                    : entry.project?.color ||
                                      (isDark ? "#fff" : "#111827"),
                                }}
                              >
                                {entry.title}
                              </h4>
                              <p
                                className={`text-xs md:text-sm mt-1 line-clamp-2 ${
                                  isDark ? "text-[#B4B4B8]" : "text-gray-600"
                                }`}
                              >
                                {entry.content}
                              </p>
                              {entry.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {entry.tags.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full ${
                                        isHalloweenMode
                                          ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6]"
                                          : "bg-[rgba(139,92,246,0.2)] text-[#8B5CF6]"
                                      }`}
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                  {entry.tags.length > 3 && (
                                    <span
                                      className={`text-[10px] md:text-xs ${
                                        isDark
                                          ? "text-[#B4B4B8]"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      +{entry.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 sm:ml-4 sm:flex-col sm:items-end">
                            {entry.mood && (
                              <span className="text-base md:text-lg">
                                {getMoodEmoji(entry.mood)}
                              </span>
                            )}
                            {entry.energy_level && (
                              <div
                                className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full"
                                style={{
                                  backgroundColor: getEnergyColor(
                                    entry.energy_level,
                                  ),
                                }}
                                title={`Energy: ${entry.energy_level}/5`}
                              />
                            )}
                            {entry.project && (
                              <span
                                className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-medium whitespace-nowrap"
                                style={{
                                  backgroundColor: isHalloweenMode
                                    ? "rgba(96,201,182,0.2)"
                                    : `${entry.project.color}20`,
                                  color: isHalloweenMode
                                    ? "#60c9b6"
                                    : entry.project.color,
                                }}
                              >
                                {entry.project.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
