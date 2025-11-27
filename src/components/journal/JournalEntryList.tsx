import { motion } from "framer-motion";
import { BookOpen, Edit, Heart, Tag, Trash2, Zap } from "lucide-react";
import React from "react";
import { Virtuoso } from "react-virtuoso";
import { batSwoop, catFluffy, ghostGenie, spiderHairyCrawling } from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import { Journal } from "@/types/journal";

interface JournalListProps {
  entries: Journal[];
  onEntryClick: (entryId: string) => void;
  onDeleteEntry: (entryId: string) => void;
}

export const JournalEntryList: React.FC<JournalListProps> = ({
  entries,
  onEntryClick,
  onDeleteEntry,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMoodEmoji = (mood?: number | null) => {
    if (!mood) return null;
    const moodEmojis = ["😞", "😕", "😐", "😊", "😄"];
    return moodEmojis[mood - 1];
  };

  const getEnergyColor = (energy?: number | null) => {
    if (!energy) return "#6B7280";
    const colors = ["#EF4444", "#F97316", "#EAB308", "#22C55E", "#10B981"];
    return colors[energy - 1];
  };

  if (entries.length === 0) {
    return (
      <motion.div
        className="p-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {isHalloweenMode ? (
            <img
              src={ghostGenie}
              alt="No entries"
              className="w-24 h-24 mx-auto mb-4 opacity-80 drop-shadow-[0_0_10px_rgba(96,201,182,0.5)]"
            />
          ) : (
            <BookOpen className="w-16 h-16 text-[#8B5CF6] mx-auto mb-4" />
          )}
        </motion.div>
        <motion.h3
          className={`text-xl font-semibold mb-2 ${
            isHalloweenMode
              ? "text-[#60c9b6]"
              : isDark
                ? "text-white"
                : "text-gray-900"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          No Journal Entries Yet
        </motion.h3>
        <motion.p
          className={`mb-6 ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Start documenting your daily progress and reflections
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="space-y-3">
        <Virtuoso
          useWindowScroll
          data={entries}
          itemContent={(index, entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`group p-3 rounded-lg cursor-pointer transition-colors relative overflow-hidden mb-3 ${
                isHalloweenMode
                  ? isDark
                    ? "bg-[rgba(40,40,45,0.4)] hover:bg-[rgba(96,201,182,0.08)] hover:shadow-[0_0_15px_rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.1)] hover:border-[rgba(96,201,182,0.3)]"
                    : "bg-gray-50 hover:bg-[rgba(96,201,182,0.1)] hover:shadow-[0_0_15px_rgba(96,201,182,0.15)] border border-[rgba(96,201,182,0.2)] hover:border-[rgba(96,201,182,0.4)]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.08)]"
                    : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
              }`}
              onClick={() => onEntryClick(entry.id)}
            >
              {isHalloweenMode && index % 3 === 0 && (
                <motion.img
                  src={
                    index % 6 === 0
                      ? batSwoop
                      : index % 9 === 0
                        ? spiderHairyCrawling
                        : catFluffy
                  }
                  alt=""
                  className="absolute -top-1 -right-1 w-5 md:w-6 opacity-30 pointer-events-none z-10"
                  animate={{
                    rotate: [0, 5, -5, 0],
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-medium truncate text-xs sm:text-sm md:text-base"
                    style={{
                      color: isHalloweenMode
                        ? "#60c9b6"
                        : entry.project?.color || (isDark ? "#fff" : "#111827"),
                    }}
                  >
                    {entry.title}
                  </h4>
                  <p
                    className={`text-[11px] sm:text-xs md:text-sm mt-0.5 sm:mt-1 line-clamp-2 wrap-break-word ${
                      isDark ? "text-[#B4B4B8]" : "text-gray-600"
                    }`}
                  >
                    {entry.content}
                  </p>
                  <div
                    className={`text-[10px] sm:text-xs mt-1 sm:mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 ${
                      isDark ? "text-[#71717A]" : "text-gray-500"
                    }`}
                  >
                    <span className="hidden sm:inline">
                      {formatDate(entry.entry_date)}
                    </span>
                    <span className="sm:hidden">
                      {new Date(entry.entry_date).toLocaleDateString()}
                    </span>
                    {entry.mood && (
                      <span className="flex items-center space-x-0.5 sm:space-x-1">
                        <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span>{getMoodEmoji(entry.mood)}</span>
                      </span>
                    )}
                    {entry.energy_level && (
                      <span className="flex items-center space-x-0.5 sm:space-x-1">
                        <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                          style={{
                            backgroundColor: getEnergyColor(entry.energy_level),
                          }}
                        />
                      </span>
                    )}
                    {entry.tags.length > 0 && (
                      <span className="flex items-center space-x-0.5 sm:space-x-1">
                        <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span>{entry.tags.length}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-start sm:flex-col gap-1.5 sm:gap-0 sm:space-y-1.5 sm:ml-4">
                  {entry.project && (
                    <span
                      className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium whitespace-nowrap`}
                      style={{
                        backgroundColor: `${entry.project.color}20`,
                        color: entry.project.color,
                      }}
                    >
                      {entry.project.name}
                    </span>
                  )}
                  <div className="flex sm:flex-col space-x-1 sm:space-x-0 sm:space-y-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEntryClick(entry.id);
                      }}
                      className="p-1.5 sm:p-2 rounded transition-colors cursor-pointer"
                      style={{
                        backgroundColor: `${entry.project?.color || "#10B981"}15`,
                        border: `1px solid ${entry.project?.color || "#10B981"}30`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${entry.project?.color || "#10B981"}25`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${entry.project?.color || "#10B981"}15`;
                      }}
                      title="Edit entry"
                    >
                      <Edit
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                        style={{
                          color: entry.project?.color || "#10B981",
                        }}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEntry(entry.id);
                      }}
                      className={`p-1.5 sm:p-2 rounded transition-colors cursor-pointer hover:bg-[rgba(239,68,68,0.15)] ${
                        isDark
                          ? "bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]"
                          : "bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]"
                      }`}
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        />
      </div>
    </div>
  );
};
