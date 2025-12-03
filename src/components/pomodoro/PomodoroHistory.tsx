import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Coffee,
  Edit2,
  Save,
  Search,
  Trash2,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { cardLargeTree, ghostGenie } from "@/assets";
import { GlassCard } from "@/components/GlassCard";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Dropdown } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
import { useTheme } from "@/contexts/ThemeContext";
import { usePomodoro } from "@/hooks/usePomodoro";

export const PomodoroHistory: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();
  const { sessions, loading, updateNotes, deleteSession, loadMore, hasMore } =
    usePomodoro();
  const [activeTab, setActiveTab] = useState<"all" | "work" | "break">("all");
  const [timeFilter, setTimeFilter] = useState<
    "all" | "today" | "week" | "month"
  >("week");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<{
    id: string;
    type: string;
    date: string;
  } | null>(null);

  const getSessionConfig = useCallback((type: string) => {
    switch (type) {
      case "work":
        return {
          icon: Zap,
          color: "text-[#8B5CF6]",
          bg: "bg-[rgba(139,92,246,0.1)]",
          border: "border-[rgba(139,92,246,0.3)]",
          label: "Focus Session",
        };
      case "short_break":
        return {
          icon: Coffee,
          color: "text-[#10B981]",
          bg: "bg-[rgba(16,185,129,0.1)]",
          border: "border-[rgba(16,185,129,0.3)]",
          label: "Short Break",
        };
      case "long_break":
        return {
          icon: Coffee,
          color: "text-[#3B82F6]",
          bg: "bg-[rgba(59,130,246,0.1)]",
          border: "border-[rgba(59,130,246,0.3)]",
          label: "Long Break",
        };
      default:
        return {
          icon: Clock,
          color: "text-slate-400",
          bg: "bg-slate-100",
          border: "border-slate-300",
          label: type,
        };
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return {
        day: "Today",
        time: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } else if (date.toDateString() === yesterday.toDateString()) {
      return {
        day: "Yesterday",
        time: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } else {
      return {
        day: date.toLocaleDateString([], { month: "short", day: "numeric" }),
        time: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    }
  };

  const allSessions = useMemo(() => sessions, [sessions]);
  const workSessions = useMemo(
    () => sessions.filter((s) => s.session_type === "work"),
    [sessions],
  );
  const breakSessions = useMemo(
    () =>
      sessions.filter(
        (s) =>
          s.session_type === "short_break" || s.session_type === "long_break",
      ),
    [sessions],
  );

  const tabSessions =
    activeTab === "work"
      ? workSessions
      : activeTab === "break"
        ? breakSessions
        : allSessions;

  const filteredSessions = useMemo(() => {
    let filtered = tabSessions;

    if (timeFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);

      filtered = filtered.filter((session) => {
        const sessionDate = new Date(session.started_at);
        if (timeFilter === "today") return sessionDate >= today;
        if (timeFilter === "week") return sessionDate >= weekAgo;
        if (timeFilter === "month") return sessionDate >= monthAgo;
        return true;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((session) => {
        const config = getSessionConfig(session.session_type);
        return (
          config.label.toLowerCase().includes(query) ||
          session.notes?.toLowerCase().includes(query) ||
          session.session_type.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [tabSessions, timeFilter, searchQuery, getSessionConfig]);

  const handleEdit = (sessionId: string, currentNotes: string | null) => {
    setEditingId(sessionId);
    setEditNotes(currentNotes || "");
  };

  const handleSave = (sessionId: string) => {
    updateNotes({ sessionId, notes: editNotes || null });
    setEditingId(null);
  };

  const handleDelete = (
    sessionId: string,
    sessionType: string,
    sessionDate: string,
  ) => {
    setSessionToDelete({ id: sessionId, type: sessionType, date: sessionDate });
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete.id);
      setDeleteModalOpen(false);
      setSessionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setSessionToDelete(null);
  };

  const handleTabChange = (tab: "all" | "work" | "break") => {
    setActiveTab(tab);
    setActiveTab(tab);
  };

  const handleTimeFilterChange = (
    filter: "all" | "today" | "week" | "month",
  ) => {
    setTimeFilter(filter);
    setTimeFilter(filter);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSearchQuery(query);
  };

  return (
    <GlassCard
      className={`overflow-hidden relative transition-all duration-500 ${
        isHalloweenMode
          ? "border-[rgba(96,201,182,0.4)]! shadow-[0_0_20px_rgba(96,201,182,0.2)]!"
          : ""
      }`}
    >
      {isHalloweenMode && (
        <div
          className="absolute inset-0 pointer-events-none opacity-10 z-0"
          style={{
            backgroundImage: `url(${cardLargeTree})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(100%)",
          }}
        />
      )}
      <div className="relative z-10">
        <div
          className={`p-4 md:p-6 border-b ${
            isDark ? "border-[rgba(255,255,255,0.06)]" : "border-gray-200"
          }`}
        >
          <div className="mb-4">
            <h3
              className={`text-base md:text-lg font-semibold ${
                isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"
              }`}
            >
              Session History
            </h3>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDark ? "text-[#71717A]" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 md:py-3 rounded-lg border text-sm transition-colors ${
                isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)] text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[rgba(96,201,182,0.5)] focus:ring-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[rgba(40,40,45,0.8)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[rgba(139,92,246,0.5)] focus:bg-[rgba(40,40,45,0.9)]"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[rgba(139,92,246,0.5)] focus:bg-gray-50"
              } focus:outline-none focus:ring-1 focus:ring-[rgba(139,92,246,0.3)]`}
            />
          </div>

          {/* Compact Tab Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
              <div
                className="flex items-center gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <button
                  onClick={() => handleTabChange("all")}
                  className={`px-2.5 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === "all"
                      ? isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6]"
                        : "bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6]"
                      : isHalloweenMode
                        ? "text-gray-500 dark:text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                        : isDark
                          ? "text-[#B4B4B8] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8B5CF6]"
                          : "text-gray-600 hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8B5CF6]"
                  }`}
                >
                  All ({allSessions.length})
                </button>

                <button
                  onClick={() => handleTabChange("work")}
                  className={`px-2.5 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === "work"
                      ? isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6]"
                        : "bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6]"
                      : isHalloweenMode
                        ? "text-gray-500 dark:text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                        : isDark
                          ? "text-[#B4B4B8] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8B5CF6]"
                          : "text-gray-600 hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8B5CF6]"
                  }`}
                >
                  Work ({workSessions.length})
                </button>

                <button
                  onClick={() => handleTabChange("break")}
                  className={`px-2.5 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === "break"
                      ? isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6]"
                        : "bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6]"
                      : isHalloweenMode
                        ? "text-gray-500 dark:text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                        : isDark
                          ? "text-[#B4B4B8] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8B5CF6]"
                          : "text-gray-600 hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8B5CF6]"
                  }`}
                >
                  Breaks ({breakSessions.length})
                </button>
              </div>
            </div>

            {/* Time Filter Dropdown */}
            <div className="min-w-[100px] md:min-w-[120px]">
              <Dropdown
                value={timeFilter}
                onValueChange={(value) =>
                  handleTimeFilterChange(
                    value as "today" | "week" | "month" | "all",
                  )
                }
                options={[
                  { value: "all", label: "All Time" },
                  { value: "today", label: "Today" },
                  { value: "week", label: "This Week" },
                  { value: "month", label: "This Month" },
                ]}
                placeholder="Select period"
              />
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {sessions.length === 0 && !loading ? (
            <div className="text-center py-8 md:py-12">
              {isHalloweenMode ? (
                <motion.img
                  src={ghostGenie}
                  alt=""
                  className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 opacity-80"
                  style={{
                    filter: "drop-shadow(0 0 25px rgba(96, 201, 182, 0.5))",
                  }}
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ) : (
                <div
                  className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full flex items-center justify-center ${
                    isDark ? "bg-[rgba(139,92,246,0.1)]" : "bg-purple-50"
                  }`}
                >
                  <Clock
                    className={`w-6 h-6 md:w-8 md:h-8 ${isDark ? "text-[#8B5CF6]" : "text-purple-400"}`}
                  />
                </div>
              )}
              <h3
                className={`text-base md:text-lg font-semibold mb-1.5 md:mb-2 ${
                  isHalloweenMode
                    ? "text-[#60c9b6] font-creepster tracking-wide"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                {isHalloweenMode
                  ? "No Mystical Sessions Yet"
                  : "No Sessions Yet"}
              </h3>
              <p
                className={`text-xs md:text-sm ${
                  isHalloweenMode
                    ? "text-[#60c9b6]/70"
                    : isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                }`}
              >
                {isHalloweenMode
                  ? "Begin your enchanted focus ritual to summon your first spectral session"
                  : "Start your first Pomodoro session to see your history here"}
              </p>
            </div>
          ) : (
            <>
              <Virtuoso
                useWindowScroll
                data={filteredSessions}
                itemContent={(index, session) => {
                  const config = getSessionConfig(session.session_type);
                  const Icon = config.icon;
                  const dateInfo = formatDate(session.started_at);

                  return (
                    <div key={session.id} className="pb-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`group relative p-3 md:p-4 rounded-lg transition-all border ${
                          isHalloweenMode
                            ? isDark
                              ? "bg-[rgba(40,40,45,0.4)] hover:bg-[rgba(96,201,182,0.08)] hover:shadow-[0_0_15px_rgba(96,201,182,0.2)] border-[rgba(96,201,182,0.1)] hover:border-[rgba(96,201,182,0.3)]"
                              : "bg-gray-50 hover:bg-[rgba(96,201,182,0.1)] hover:shadow-[0_0_15px_rgba(96,201,182,0.15)] border-[rgba(96,201,182,0.2)] hover:border-[rgba(96,201,182,0.4)]"
                            : isDark
                              ? "bg-[rgba(0,0,0,0.2)] hover:bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]"
                              : "bg-white hover:bg-gray-50 border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 md:gap-3">
                          <div className="flex items-start space-x-2 md:space-x-3 flex-1 min-w-0">
                            <div
                              className={`p-2 md:p-2.5 rounded-lg ${
                                isHalloweenMode
                                  ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)]"
                                  : `${config.bg} ${config.border}`
                              } border shrink-0`}
                            >
                              <Icon
                                className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                                  isHalloweenMode
                                    ? "text-[#60c9b6]"
                                    : config.color
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-1">
                                <p
                                  className={`text-xs md:text-sm font-semibold ${
                                    isHalloweenMode
                                      ? "text-[#60c9b6]"
                                      : isDark
                                        ? "text-white"
                                        : "text-gray-900"
                                  }`}
                                >
                                  {config.label}
                                </p>
                                {session.completed ? (
                                  <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]">
                                    <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                                    Completed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.2)]">
                                    <XCircle className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                                    Incomplete
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 md:gap-3 mb-1">
                                <p
                                  className={`text-[10px] md:text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
                                >
                                  <span className="font-medium">
                                    {dateInfo.day}
                                  </span>{" "}
                                  at {dateInfo.time}
                                </p>
                                <span
                                  className={`text-[10px] md:text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
                                >
                                  •
                                </span>
                                <p
                                  className={`text-[10px] md:text-xs font-medium ${config.color}`}
                                >
                                  {session.duration_minutes} min
                                </p>
                              </div>

                              {/* Notes Section */}
                              {session.notes && editingId !== session.id && (
                                <p
                                  className={`text-[10px] md:text-xs mt-1 italic wrap-break-word ${isDark ? "text-slate-500" : "text-slate-600"}`}
                                >
                                  "{session.notes}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons - Always on the right */}
                          <div className="flex items-start space-x-1 md:space-x-1.5 shrink-0">
                            <button
                              onClick={() =>
                                handleEdit(session.id, session.notes)
                              }
                              className={`p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer ${
                                isHalloweenMode
                                  ? "text-[#60c9b6] hover:bg-[rgba(96,201,182,0.2)]"
                                  : isDark
                                    ? "hover:bg-[rgba(139,92,246,0.2)] text-[#8B5CF6]"
                                    : "hover:bg-purple-50 text-purple-600"
                              }`}
                              title="Edit notes"
                            >
                              <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(
                                  session.id,
                                  session.session_type,
                                  session.started_at,
                                )
                              }
                              className={`p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer ${
                                isDark
                                  ? "hover:bg-[rgba(239,68,68,0.2)] text-[#EF4444]"
                                  : "hover:bg-red-50 text-red-600"
                              }`}
                              title="Delete session"
                            >
                              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Edit Notes Section - Full Width Below */}
                        {editingId === session.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-[rgba(139,92,246,0.2)]"
                          >
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="Add notes..."
                                className={`text-xs md:text-sm h-8 md:h-9 flex-1 ${
                                  isHalloweenMode
                                    ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)] text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[rgba(96,201,182,0.5)]! focus:ring-[rgba(96,201,182,0.2)]! focus:ring-1!"
                                    : ""
                                }`}
                                autoFocus
                              />
                              <button
                                onClick={() => handleSave(session.id)}
                                className={`p-2 rounded-lg transition-colors shrink-0 cursor-pointer ${
                                  isHalloweenMode
                                    ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                                    : "bg-[rgba(16,185,129,0.2)] text-[#10B981] hover:bg-[rgba(16,185,129,0.3)]"
                                }`}
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-2 rounded-lg bg-[rgba(239,68,68,0.2)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.3)] transition-colors shrink-0 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                  );
                }}
              />
            </>
          )}
        </div>
        {hasMore && (
          <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-800 flex justify-center">
            <button
              onClick={loadMore}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                  : isDark
                    ? "bg-[rgba(139,92,246,0.2)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)]"
                    : "bg-purple-100 text-purple-600 hover:bg-purple-200"
              }`}
            >
              Load More
            </button>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Delete Session"
          description="Are you sure you want to delete this session?"
          itemTitle={
            sessionToDelete ? getSessionConfig(sessionToDelete.type).label : ""
          }
          itemDescription={
            sessionToDelete
              ? formatDate(sessionToDelete.date).day +
                " at " +
                formatDate(sessionToDelete.date).time
              : ""
          }
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </GlassCard>
  );
};
