import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Calendar,
  Eye,
  Folder,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  batHang,
  catWitchHat,
  ghostDroopy,
  ghostScare,
  pumpkinScary,
  spiderCuteHanging,
} from "@/assets";
import { Dropdown } from "@/components/ui/Dropdown";
import { useTheme } from "@/contexts/ThemeContext";
import { Journal, Project } from "@/types/journal.ts";

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  entries: Journal[];
  onEntryClick: (entryId: string) => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  isOpen,
  onClose,
  entries,
  onEntryClick,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "title" | "mood" | "energy"
  >("newest");

  const projectEntries = useMemo(() => {
    if (!project) return [];

    let filtered = entries.filter((entry) => entry.project_id === project.id);

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(search) ||
          entry.content.toLowerCase().includes(search) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(search)),
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "mood":
          return (b.mood || 0) - (a.mood || 0);
        case "energy":
          return (b.energy_level || 0) - (a.energy_level || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [entries, project, searchTerm, sortBy]);

  const projectStats = useMemo(() => {
    if (projectEntries.length === 0) {
      return {
        totalEntries: 0,
        averageMood: 0,
        averageEnergy: 0,
        mostRecentEntry: null,
        dateRange: null,
      };
    }

    const moodEntries = projectEntries.filter((entry) => entry.mood);
    const energyEntries = projectEntries.filter((entry) => entry.energy_level);

    const averageMood =
      moodEntries.length > 0
        ? moodEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0) /
          moodEntries.length
        : 0;

    const averageEnergy =
      energyEntries.length > 0
        ? energyEntries.reduce(
            (sum, entry) => sum + (entry.energy_level || 0),
            0,
          ) / energyEntries.length
        : 0;

    const sortedByDate = [...projectEntries].sort(
      (a, b) =>
        new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime(),
    );

    const firstEntry = sortedByDate[0];
    const lastEntry = sortedByDate[sortedByDate.length - 1];

    return {
      totalEntries: projectEntries.length,
      averageMood: Math.round(averageMood * 10) / 10,
      averageEnergy: Math.round(averageEnergy * 10) / 10,
      mostRecentEntry: projectEntries[0],
      dateRange:
        firstEntry && lastEntry
          ? {
              start: firstEntry.entry_date,
              end: lastEntry.entry_date,
            }
          : null,
    };
  }, [projectEntries]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-9000 ${
            isDark ? "bg-[rgba(10,10,11,0.8)]" : "bg-[rgba(0,0,0,0.5)]"
          }`}
          style={{ margin: 0, padding: "16px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={modalRef}
            className={`backdrop-blur-xl rounded-xl w-full max-w-4xl max-h-[95vh] flex flex-col relative overflow-hidden ${
              isHalloweenMode
                ? "border bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
                : isDark
                  ? "bg-[rgba(30,30,30,0.95)] border border-[rgba(255,255,255,0.1)]"
                  : "bg-white border border-gray-200"
            }`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {isHalloweenMode && (
              <>
                <div className="absolute -bottom-10 -left-10 pointer-events-none z-0">
                  <img
                    src={ghostScare}
                    alt=""
                    className="w-48 h-48 -rotate-12 opacity-10"
                  />
                </div>
                <div className="absolute -top-10 -right-10 pointer-events-none z-0">
                  <img
                    src={pumpkinScary}
                    alt=""
                    className="w-48 h-48 rotate-12 opacity-10"
                  />
                </div>
              </>
            )}
            {/* Header */}
            <div
              className={`flex items-center justify-between p-4 md:p-6 pb-3 md:pb-4 border-b ${isDark ? "border-[rgba(255,255,255,0.1)]" : "border-gray-200"}`}
            >
              <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${project.color}15`,
                    border: `1px solid ${project.color}30`,
                  }}
                >
                  <Folder
                    className="w-5 h-5 md:w-6 md:h-6"
                    style={{ color: project.color }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2
                    className="text-lg md:text-2xl font-bold truncate"
                    style={{ color: project.color }}
                  >
                    {project.name}
                  </h2>
                  {project.description && (
                    <p
                      className={`mt-1 text-xs md:text-sm line-clamp-1 ${
                        isDark ? "text-[#B4B4B8]" : "text-gray-600"
                      }`}
                    >
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={onClose}
                  className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                    isDark
                      ? "hover:bg-[rgba(255,255,255,0.05)]"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <X
                    className={`w-4 h-4 md:w-5 md:h-5 ${
                      isDark ? "text-[#B4B4B8]" : "text-gray-500"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto mobile-scrollbar-hide p-4 md:p-6 pt-3 md:pt-4 space-y-4 md:space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                {[
                  {
                    label: "Total Entries",
                    value: projectStats.totalEntries,
                    icon: BookOpen,
                    color: isHalloweenMode
                      ? "text-[#60c9b6]"
                      : "text-[#10B981]",
                    bgColor: isHalloweenMode
                      ? "bg-[rgba(96,201,182,0.15)]"
                      : isDark
                        ? "bg-[rgba(16,185,129,0.1)]"
                        : "bg-[rgba(16,185,129,0.05)]",
                    borderColor: isHalloweenMode
                      ? "border-[rgba(96,201,182,0.3)]"
                      : "border-[rgba(16,185,129,0.2)]",
                    decoration: spiderCuteHanging,
                    halloweenIcon: ghostScare,
                  },
                  {
                    label: "Avg. Mood",
                    value:
                      projectStats.averageMood > 0
                        ? projectStats.averageMood
                        : "-",
                    icon: TrendingUp,
                    color: isHalloweenMode
                      ? "text-[#60c9b6]"
                      : "text-[#8B5CF6]",
                    bgColor: isHalloweenMode
                      ? "bg-[rgba(96,201,182,0.15)]"
                      : isDark
                        ? "bg-[rgba(139,92,246,0.1)]"
                        : "bg-[rgba(139,92,246,0.05)]",
                    borderColor: isHalloweenMode
                      ? "border-[rgba(96,201,182,0.3)]"
                      : "border-[rgba(139,92,246,0.2)]",
                    decoration: batHang,
                    halloweenIcon: pumpkinScary,
                  },
                  {
                    label: "Avg. Energy",
                    value:
                      projectStats.averageEnergy > 0
                        ? projectStats.averageEnergy
                        : "-",
                    icon: BarChart3,
                    color: isHalloweenMode
                      ? "text-[#60c9b6]"
                      : "text-[#F59E0B]",
                    bgColor: isHalloweenMode
                      ? "bg-[rgba(96,201,182,0.15)]"
                      : isDark
                        ? "bg-[rgba(245,158,11,0.1)]"
                        : "bg-[rgba(245,158,11,0.05)]",
                    borderColor: isHalloweenMode
                      ? "border-[rgba(96,201,182,0.3)]"
                      : "border-[rgba(245,158,11,0.2)]",
                    decoration: ghostDroopy,
                    halloweenIcon: catWitchHat,
                  },
                  {
                    label: "Date Range",
                    value: projectStats.dateRange
                      ? `${formatDate(projectStats.dateRange.start)} - ${formatDate(
                          projectStats.dateRange.end,
                        )}`
                      : "-",
                    icon: Calendar,
                    color: isHalloweenMode
                      ? "text-[#60c9b6]"
                      : "text-[#EC4899]",
                    bgColor: isHalloweenMode
                      ? "bg-[rgba(96,201,182,0.15)]"
                      : isDark
                        ? "bg-[rgba(236,72,153,0.1)]"
                        : "bg-[rgba(236,72,153,0.05)]",
                    borderColor: isHalloweenMode
                      ? "border-[rgba(96,201,182,0.3)]"
                      : "border-[rgba(236,72,153,0.2)]",
                    decoration: null,
                    halloweenIcon: ghostScare,
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`p-3 md:p-4 rounded-xl border relative overflow-hidden group ${
                      stat.bgColor
                    } ${stat.borderColor} ${
                      isHalloweenMode
                        ? "shadow-[0_0_10px_rgba(96,201,182,0.1)]"
                        : ""
                    } ${stat.label === "Date Range" ? "col-span-2 lg:col-span-1" : ""}`}
                  >
                    {isHalloweenMode && stat.decoration && (
                      <img
                        src={stat.decoration}
                        alt=""
                        className="absolute top-1 right-1 w-5 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
                      />
                    )}
                    <div className="flex items-center justify-between mb-2 relative z-10">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${
                            isHalloweenMode
                              ? "text-[#60c9b6]/80"
                              : isDark
                                ? "text-[#B4B4B8]"
                                : stat.color
                          }`}
                        >
                          {stat.label}
                        </p>
                        <div className="flex items-center gap-1 md:gap-2">
                          <p
                            className={`text-lg md:text-xl font-bold truncate ${
                              isHalloweenMode
                                ? "text-[#60c9b6] drop-shadow-[0_0_5px_rgba(96,201,182,0.5)]"
                                : stat.color
                            } ${stat.label === "Date Range" ? "text-[10px] md:text-xs" : ""}`}
                          >
                            {stat.value}
                          </p>
                          {stat.label === "Avg. Mood" &&
                            projectStats.averageMood > 0 &&
                            !isHalloweenMode && (
                              <span className="text-base md:text-xl">
                                {getMoodEmoji(
                                  Math.round(projectStats.averageMood),
                                )}
                              </span>
                            )}
                          {stat.label === "Avg. Energy" &&
                            projectStats.averageEnergy > 0 &&
                            !isHalloweenMode && (
                              <div
                                className="w-2 h-2 md:w-3 md:h-3 rounded-full"
                                style={{
                                  backgroundColor: getEnergyColor(
                                    Math.round(projectStats.averageEnergy),
                                  ),
                                }}
                              />
                            )}
                        </div>
                      </div>
                      <div
                        className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ml-2 ${
                          isHalloweenMode
                            ? "bg-[#60c9b6]/20 border border-[#60c9b6]/30"
                            : stat.color
                                .replace("text-", "bg-")
                                .replace("500", "500/20")
                                .replace("600", "600/20") + "/20"
                        }`}
                      >
                        {isHalloweenMode ? (
                          <img
                            src={stat.halloweenIcon}
                            alt=""
                            className="w-4 h-4 md:w-5 md:h-5 object-contain drop-shadow-sm"
                          />
                        ) : (
                          <stat.icon
                            className={`w-4 h-4 md:w-6 md:h-6 ${stat.color}`}
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Entries List */}
              <div>
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3
                    className={`text-base md:text-lg font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Entries ({projectEntries.length})
                  </h3>
                </div>

                {/* Search and Sort Controls */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-3 md:mb-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search
                      className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                        isDark ? "text-[#B4B4B8]" : "text-gray-500"
                      }`}
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search entries..."
                      className={`w-full pl-10 pr-3 py-2 rounded-lg focus:outline-hidden transition-colors ${
                        isDark
                          ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:border-[rgba(255,255,255,0.2)]"
                          : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400"
                      }`}
                    />
                  </div>

                  {/* Sort */}
                  <div className="w-full sm:w-48">
                    <Dropdown
                      value={sortBy}
                      onValueChange={(value) =>
                        setSortBy(
                          value as
                            | "newest"
                            | "oldest"
                            | "title"
                            | "mood"
                            | "energy",
                        )
                      }
                      options={[
                        { value: "newest", label: "Newest First" },
                        { value: "oldest", label: "Oldest First" },
                        { value: "title", label: "Title (A-Z)" },
                        { value: "mood", label: "Highest Mood" },
                        { value: "energy", label: "Highest Energy" },
                      ]}
                    />
                  </div>
                </div>

                {projectEntries.length === 0 && !searchTerm ? (
                  <div className="text-center py-8 md:py-12">
                    <BookOpen
                      className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 ${
                        isDark ? "text-[#4A5568]" : "text-gray-400"
                      }`}
                    />
                    <h4
                      className={`text-base md:text-xl font-semibold mb-1 md:mb-2 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      No Entries Yet
                    </h4>
                    <p
                      className={`text-xs md:text-sm ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                    >
                      Start adding journal entries to this project to see them
                      here.
                    </p>
                  </div>
                ) : projectEntries.length === 0 && searchTerm ? (
                  <div className="text-center py-8 md:py-12">
                    <Search
                      className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 ${
                        isDark ? "text-[#4A5568]" : "text-gray-400"
                      }`}
                    />
                    <h4
                      className={`text-base md:text-xl font-semibold mb-1 md:mb-2 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      No Results Found
                    </h4>
                    <p
                      className={`text-xs md:text-sm ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                    >
                      No entries match your search "{searchTerm}"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto mobile-scrollbar-hide">
                    {projectEntries.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`p-2.5 md:p-4 rounded-lg transition-colors group cursor-pointer ${
                          isDark
                            ? "bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)]"
                            : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                        }`}
                        onClick={() => onEntryClick(entry.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {/* Date and metadata - more compact on mobile */}
                            <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 md:w-4 md:h-4 text-[#10B981]" />
                                <span
                                  className={`text-[10px] md:text-sm ${
                                    isDark ? "text-[#B4B4B8]" : "text-gray-600"
                                  }`}
                                >
                                  {formatDate(entry.entry_date)}
                                </span>
                              </div>
                              {entry.mood && (
                                <span
                                  className="text-sm md:text-lg"
                                  title={`Mood: ${entry.mood}/5`}
                                >
                                  {getMoodEmoji(entry.mood)}
                                </span>
                              )}
                              {entry.energy_level && (
                                <div
                                  className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
                                  style={{
                                    backgroundColor: getEnergyColor(
                                      entry.energy_level,
                                    ),
                                  }}
                                  title={`Energy: ${entry.energy_level}/5`}
                                />
                              )}
                            </div>

                            {/* Title - smaller on mobile */}
                            <h4
                              className="text-sm md:text-lg font-semibold mb-1 md:mb-2 line-clamp-1 transition-colors"
                              style={{ color: project.color }}
                            >
                              {entry.title}
                            </h4>

                            {/* Content preview - smaller on mobile */}
                            <p
                              className={`text-[11px] md:text-sm line-clamp-2 mb-1.5 md:mb-3 ${
                                isDark ? "text-[#B4B4B8]" : "text-gray-600"
                              }`}
                            >
                              {entry.content}
                            </p>

                            {/* Tags - more compact on mobile */}
                            {entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {entry.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center px-1.5 md:px-2 py-0.5 rounded-full text-[9px] md:text-xs font-medium bg-[rgba(139,92,246,0.2)] text-[#8B5CF6]"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {entry.tags.length > 2 && (
                                  <span
                                    className={`text-[9px] md:text-xs self-center ${
                                      isDark
                                        ? "text-[#B4B4B8]"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    +{entry.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Eye icon - hidden on mobile, shown on hover on desktop */}
                          <div className="hidden sm:flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Eye
                              className={`w-4 h-4 ${
                                isDark ? "text-[#B4B4B8]" : "text-gray-500"
                              }`}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
