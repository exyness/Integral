import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  TrendingUp,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useFolders } from "@/hooks/useFolders";
import { Account, AccountUsageLog } from "@/types/account";
import {
  batGlide,
  candleFive,
  candleTrio,
  cardPumpkinsMany,
  catFluffy,
  ghostDroopy,
  ghostGenie,
  ghostJagged,
  pumpkinBlocky,
  spiderSharpHanging,
  treeSceneryCurly,
  webCornerLeft,
  witchFly,
  witchTakeoff,
} from "../../assets";
import { GlassCard } from "../GlassCard";
import { Dropdown } from "../ui/Dropdown";
import { ScrollArea } from "../ui/ScrollArea";
import { EditUsageModal } from "./EditUsageModal";
import { UsageActivityCard } from "./UsageActivityCard";

interface UsageActivityViewProps {
  usageLogs: AccountUsageLog[];
  accounts: Account[];
  onDeleteLog: (logId: string) => void;
  onUpdateLog: (
    logId: string,
    amount: number,
    description?: string,
  ) => Promise<void>;
}

type DateFilter = "all" | "today" | "week" | "month" | "year";
type SortBy = "newest" | "oldest" | "amount-high" | "amount-low";

const ITEMS_PER_PAGE = 10;

export const UsageActivityView: React.FC<UsageActivityViewProps> = ({
  usageLogs,
  accounts,
  onDeleteLog,
  onUpdateLog,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { folders } = useFolders("account");
  const [searchQuery, setSearchQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingLog, setEditingLog] = useState<AccountUsageLog | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const filteredLogs = useMemo(() => {
    let filtered = [...usageLogs];

    if (searchQuery) {
      filtered = filtered.filter((log) => {
        const account = accounts.find((a) => a.id === log.account_id);
        return (
          account?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          account?.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    if (accountFilter !== "all") {
      filtered = filtered.filter((log) => log.account_id === accountFilter);
    }

    const now = new Date();
    if (dateFilter !== "all") {
      filtered = filtered.filter((log) => {
        const logDate = new Date(log.timestamp);
        switch (dateFilter) {
          case "today":
            return logDate.toDateString() === now.toDateString();
          case "week": {
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            return logDate >= weekAgo;
          }
          case "month": {
            const monthAgo = new Date(now);
            monthAgo.setMonth(now.getMonth() - 1);
            return logDate >= monthAgo;
          }
          case "year": {
            const yearAgo = new Date(now);
            yearAgo.setFullYear(now.getFullYear() - 1);
            return logDate >= yearAgo;
          }
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        case "oldest":
          return (
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        case "amount-high":
          return b.amount - a.amount;
        case "amount-low":
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [usageLogs, accounts, searchQuery, accountFilter, dateFilter, sortBy]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, []);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  const stats = useMemo(() => {
    const totalUsage = filteredLogs.reduce((sum, log) => sum + log.amount, 0);
    const uniqueAccounts = new Set(filteredLogs.map((log) => log.account_id))
      .size;

    const oldestLog =
      filteredLogs.length > 0
        ? new Date(filteredLogs[filteredLogs.length - 1].timestamp)
        : new Date();
    const daysDiff = Math.max(
      1,
      Math.ceil(
        (new Date().getTime() - oldestLog.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    const avgPerDay = filteredLogs.length > 0 ? totalUsage / daysDiff : 0;

    return {
      totalUsage,
      totalLogs: filteredLogs.length,
      uniqueAccounts,
      avgPerDay,
    };
  }, [filteredLogs]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 relative">
        {isHalloweenMode && (
          <>
            <img
              src={treeSceneryCurly}
              alt=""
              className="absolute -top-6 -left-4 w-16 md:w-24 opacity-20 pointer-events-none z-0"
            />
            <img
              src={witchTakeoff}
              alt=""
              className="absolute -top-8 right-10 w-16 md:w-20 opacity-15 pointer-events-none z-0"
            />
          </>
        )}
        {[
          {
            title: "Total Usage",
            value: stats.totalUsage.toLocaleString(),
            icon: TrendingUp,
            color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]",
            bgColor: isHalloweenMode
              ? "bg-[rgba(96,201,182,0.15)]"
              : isDark
                ? "bg-[rgba(139,92,246,0.1)]"
                : "bg-purple-50",
            borderColor: isHalloweenMode
              ? "border-[rgba(96,201,182,0.3)]"
              : isDark
                ? "border-[rgba(139,92,246,0.2)]"
                : "border-purple-200",
            iconBg: isHalloweenMode
              ? "bg-[rgba(96,201,182,0.15)]"
              : isDark
                ? "bg-[rgba(139,92,246,0.2)]"
                : "bg-purple-100",
          },
          {
            title: "Total Logs",
            value: stats.totalLogs,
            icon: Activity,
            color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#10B981]",
            bgColor: isHalloweenMode
              ? "bg-[rgba(96,201,182,0.15)]"
              : isDark
                ? "bg-[rgba(16,185,129,0.1)]"
                : "bg-green-50",
            borderColor: isHalloweenMode
              ? "border-[rgba(96,201,182,0.3)]"
              : isDark
                ? "border-[rgba(16,185,129,0.2)]"
                : "border-green-200",
            iconBg: isHalloweenMode
              ? "bg-[rgba(96,201,182,0.15)]"
              : isDark
                ? "bg-[rgba(16,185,129,0.2)]"
                : "bg-green-100",
          },
          {
            title: "Active Accounts",
            value: stats.uniqueAccounts,
            icon: Activity,
            color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#F59E0B]",
            bgColor: isHalloweenMode
              ? "bg-[rgba(96,201,182,0.15)]"
              : isDark
                ? "bg-[rgba(245,158,11,0.1)]"
                : "bg-amber-50",
            borderColor: isHalloweenMode
              ? "border-[rgba(96,201,182,0.3)]"
              : isDark
                ? "border-[rgba(245,158,11,0.2)]"
                : "border-amber-200",
            iconBg: isHalloweenMode
              ? "bg-[rgba(96,201,182,0.15)]"
              : isDark
                ? "bg-[rgba(245,158,11,0.2)]"
                : "bg-amber-100",
          },
          {
            title: "Avg/Day",
            value: stats.avgPerDay.toFixed(1),
            icon: Calendar,
            color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#3B82F6]",
            bgColor: isHalloweenMode
              ? "bg-[rgba(96,201,182,0.15)]"
              : isDark
                ? "bg-[rgba(59,130,246,0.1)]"
                : "bg-blue-50",
            borderColor: isHalloweenMode
              ? "border-[rgba(96,201,182,0.3)]"
              : isDark
                ? "border-[rgba(59,130,246,0.2)]"
                : "border-blue-200",
            iconBg: isHalloweenMode
              ? "bg-[rgba(96,201,182,0.15)]"
              : isDark
                ? "bg-[rgba(59,130,246,0.2)]"
                : "bg-blue-100",
          },
        ].map((stat, index) => {
          const halloweenIcons = [
            pumpkinBlocky,
            ghostGenie,
            catFluffy,
            candleFive,
          ];
          const cardDecorations = [
            spiderSharpHanging,
            batGlide,
            ghostJagged,
            webCornerLeft,
          ];

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`relative overflow-hidden p-3 md:p-4 rounded-xl border ${
                stat.bgColor
              } ${stat.borderColor} ${
                isHalloweenMode ? "shadow-[0_0_10px_rgba(96,201,182,0.2)]" : ""
              }`}
            >
              {isHalloweenMode && (
                <img
                  src={cardDecorations[index]}
                  alt=""
                  className="absolute top-1 right-1 w-4 md:w-5 opacity-12 pointer-events-none"
                />
              )}
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p
                    className={`text-xs font-medium ${stat.color} mb-0.5 md:mb-1`}
                  >
                    {stat.title}
                  </p>
                  <p className={`text-xl md:text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.iconBg}`}
                >
                  {isHalloweenMode ? (
                    <motion.img
                      src={halloweenIcons[index]}
                      alt=""
                      className="w-6 h-6 object-contain"
                      animate={
                        hoveredCard === index
                          ? {
                              scale: [1, 1.2, 1],
                              rotate:
                                index === 0
                                  ? [-10, 10, -10, 0]
                                  : index === 2
                                    ? [0, 5, -5, 0]
                                    : 0,
                              y: index === 1 ? [0, -5, 0] : 0,
                            }
                          : { scale: 1, rotate: 0, y: 0 }
                      }
                      transition={{
                        duration: 0.6,
                        ease: "easeInOut",
                      }}
                    />
                  ) : (
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Activity List with Filters */}
      <GlassCard
        variant="secondary"
        className={`overflow-hidden relative ${
          isHalloweenMode
            ? "border-[rgba(96,201,182,0.4)]! shadow-[0_0_15px_rgba(96,201,182,0.15)]!"
            : ""
        }`}
      >
        {isHalloweenMode && (
          <>
            <div
              className="absolute inset-0 pointer-events-none opacity-5 z-0"
              style={{
                backgroundImage: `url(${cardPumpkinsMany})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "grayscale(100%)",
              }}
            />
            <motion.img
              src={witchFly}
              alt=""
              className="absolute top-2 right-4 w-16 md:w-20 opacity-15 pointer-events-none z-10"
              animate={{
                y: [0, -10, 0],
                x: [0, -5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.img
              src={candleTrio}
              alt=""
              className="absolute bottom-2 left-4 w-12 md:w-16 opacity-18 pointer-events-none z-10"
              animate={{
                opacity: [0.18, 0.25, 0.18],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.img
              src={ghostDroopy}
              alt=""
              className="absolute bottom-12 right-12 w-10 md:w-12 opacity-15 pointer-events-none z-10"
              animate={{
                y: [0, -8, 0],
                opacity: [0.15, 0.25, 0.15],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </>
        )}
        <div className="p-3 sm:p-4 md:p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-sm font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Activity Timeline
            </h3>
            <span
              className={`text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
            >
              {filteredLogs.length} {filteredLogs.length === 1 ? "log" : "logs"}
            </span>
          </div>

          {/* Filters */}
          <div className="mb-4 space-y-3">
            {/* Desktop: Search + Dropdowns in one row */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : "text-gray-400 dark:text-[#B4B4B8]"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search budgets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition-colors text-xs md:text-sm ${
                    isHalloweenMode
                      ? "bg-[#1a1a1f] border-[#60c9b6]/50 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                      : "bg-white dark:bg-[rgba(255,255,255,0.05)] border-gray-300 dark:border-[rgba(255,255,255,0.1)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#B4B4B8] focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]"
                  }`}
                />
              </div>

              <div className="w-48">
                <Dropdown
                  placeholder="All Accounts"
                  value={accountFilter}
                  onValueChange={setAccountFilter}
                  options={[
                    { value: "all", label: "All Accounts" },
                    ...accounts.map((account) => ({
                      value: account.id,
                      label: account.title,
                    })),
                  ]}
                />
              </div>

              <div className="w-40">
                <Dropdown
                  placeholder="All Time"
                  value={dateFilter}
                  onValueChange={(value) => setDateFilter(value as DateFilter)}
                  options={[
                    { value: "all", label: "All Time" },
                    { value: "today", label: "Today" },
                    { value: "week", label: "Last 7 Days" },
                    { value: "month", label: "Last 30 Days" },
                    { value: "year", label: "Last Year" },
                  ]}
                />
              </div>

              <div className="w-40">
                <Dropdown
                  placeholder="Sort by"
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortBy)}
                  options={[
                    { value: "newest", label: "Newest First" },
                    { value: "oldest", label: "Oldest First" },
                    { value: "amount-high", label: "Highest Amount" },
                    { value: "amount-low", label: "Lowest Amount" },
                  ]}
                />
              </div>
            </div>

            {/* Mobile: Stacked layout */}
            <div className="lg:hidden space-y-3">
              {/* Row 1: Search */}
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDark ? "text-[#71717A]" : "text-gray-500"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-1.5 rounded-lg w-full text-sm focus:outline-hidden focus:border-[#8B5CF6] transition-colors ${
                    isDark
                      ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A]"
                      : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>

              {/* Row 2: Account Filter (Full width on mobile) */}
              <div>
                <Dropdown
                  placeholder="All Accounts"
                  value={accountFilter}
                  onValueChange={setAccountFilter}
                  options={[
                    { value: "all", label: "All Accounts" },
                    ...accounts.map((account) => ({
                      value: account.id,
                      label: account.title,
                    })),
                  ]}
                />
              </div>

              {/* Row 3: Date Filter and Sort side by side */}
              <div className="grid grid-cols-2 gap-3">
                <Dropdown
                  placeholder="All Time"
                  value={dateFilter}
                  onValueChange={(value) => setDateFilter(value as DateFilter)}
                  options={[
                    { value: "all", label: "All Time" },
                    { value: "today", label: "Today" },
                    { value: "week", label: "Last 7 Days" },
                    { value: "month", label: "Last 30 Days" },
                    { value: "year", label: "Last Year" },
                  ]}
                />

                <Dropdown
                  placeholder="Sort by"
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortBy)}
                  options={[
                    { value: "newest", label: "Newest First" },
                    { value: "oldest", label: "Oldest First" },
                    { value: "amount-high", label: "Highest Amount" },
                    { value: "amount-low", label: "Lowest Amount" },
                  ]}
                />
              </div>
            </div>
          </div>

          <ScrollArea className="hidden lg:block h-[600px] scrollbar-hide pr-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                {isHalloweenMode ? (
                  <motion.img
                    src={ghostGenie}
                    alt=""
                    className="w-20 h-20 mx-auto mb-4 opacity-80"
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
                  <Activity
                    className={`w-12 h-12 mx-auto mb-3 ${
                      isDark ? "text-[#71717A]" : "text-gray-400"
                    }`}
                  />
                )}
                <h3
                  className={`text-base font-medium mb-2 ${
                    isHalloweenMode
                      ? "text-[#60c9b6] font-creepster tracking-wide"
                      : isDark
                        ? "text-white"
                        : "text-gray-900"
                  }`}
                >
                  {isHalloweenMode
                    ? "No Spectral Activity"
                    : "No activity logs found"}
                </h3>
                <p
                  className={`text-sm ${
                    isHalloweenMode
                      ? "text-[#60c9b6]/70"
                      : isDark
                        ? "text-[#B4B4B8]"
                        : "text-gray-600"
                  }`}
                >
                  {searchQuery ||
                  accountFilter !== "all" ||
                  dateFilter !== "all"
                    ? isHalloweenMode
                      ? "The spirits find no matching rituals"
                      : "Try adjusting your filters"
                    : isHalloweenMode
                      ? "Begin your mystical journey by logging your first enchanted activity"
                      : "Start logging usage to see activity here"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedLogs.map((log, index) => {
                  const account = accounts.find((a) => a.id === log.account_id);
                  const folder = account?.folder_id
                    ? folders.find((f) => f.id === account.folder_id)
                    : null;
                  const accountColor = folder?.color || "#3B82F6";

                  return (
                    <UsageActivityCard
                      key={log.id}
                      log={log}
                      index={index}
                      accountTitle={account?.title}
                      accountColor={accountColor}
                      onDelete={onDeleteLog}
                      onEdit={(logId) => {
                        const logToEdit = usageLogs.find((l) => l.id === logId);
                        if (logToEdit) {
                          setEditingLog(logToEdit);
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Mobile: Direct scrollable content without ScrollArea */}
          <div className="lg:hidden max-h-[600px] overflow-y-auto scrollbar-hide pr-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                {isHalloweenMode ? (
                  <motion.img
                    src={ghostGenie}
                    alt=""
                    className="w-20 h-20 mx-auto mb-4 opacity-80"
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
                  <Activity
                    className={`w-12 h-12 mx-auto mb-3 ${
                      isDark ? "text-[#71717A]" : "text-gray-400"
                    }`}
                  />
                )}
                <h3
                  className={`text-base font-medium mb-2 ${
                    isHalloweenMode
                      ? "text-[#60c9b6] font-creepster tracking-wide"
                      : isDark
                        ? "text-white"
                        : "text-gray-900"
                  }`}
                >
                  {isHalloweenMode
                    ? "No Spectral Activity"
                    : "No activity logs found"}
                </h3>
                <p
                  className={`text-sm ${
                    isHalloweenMode
                      ? "text-[#60c9b6]/70"
                      : isDark
                        ? "text-[#B4B4B8]"
                        : "text-gray-600"
                  }`}
                >
                  {searchQuery ||
                  accountFilter !== "all" ||
                  dateFilter !== "all"
                    ? isHalloweenMode
                      ? "The spirits find no matching rituals"
                      : "Try adjusting your filters"
                    : isHalloweenMode
                      ? "Begin your mystical journey by logging your first enchanted activity"
                      : "Start logging usage to see activity here"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedLogs.map((log) => {
                  const account = accounts.find((a) => a.id === log.account_id);
                  const folder = account?.folder_id
                    ? folders.find((f) => f.id === account.folder_id)
                    : null;
                  const accountColor = folder?.color || "#3B82F6";

                  return (
                    <UsageActivityCard
                      key={log.id}
                      log={log}
                      accountTitle={account?.title}
                      accountColor={accountColor}
                      onDelete={onDeleteLog}
                      onEdit={(logId) => {
                        const logToEdit = usageLogs.find((l) => l.id === logId);
                        if (logToEdit) {
                          setEditingLog(logToEdit);
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredLogs.length > ITEMS_PER_PAGE && (
            <div
              className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 border-t pt-4"
              style={{
                borderColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              }}
            >
              <div
                className={`text-xs sm:text-sm ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
              >
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredLogs.length)} of{" "}
                {filteredLogs.length} logs
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? "hover:bg-[rgba(255,255,255,0.1)] text-[#B4B4B8] hover:text-white"
                      : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <div className="flex items-center gap-0.5 sm:gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (window.innerWidth < 640) {
                        return (
                          page === 1 ||
                          page === totalPages ||
                          page === currentPage
                        );
                      }
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, index, array) => {
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span
                              className={`px-1 sm:px-2 text-xs sm:text-sm ${isDark ? "text-[#71717A]" : "text-gray-400"}`}
                            >
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 px-1.5 sm:px-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                              currentPage === page
                                ? "bg-[#10B981] text-white"
                                : isDark
                                  ? "hover:bg-[rgba(255,255,255,0.1)] text-[#B4B4B8] hover:text-white"
                                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? "hover:bg-[rgba(255,255,255,0.1)] text-[#B4B4B8] hover:text-white"
                      : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Edit Usage Modal */}
      <EditUsageModal
        isOpen={!!editingLog}
        onClose={() => setEditingLog(null)}
        log={editingLog}
        account={accounts.find((a) => a.id === editingLog?.account_id)}
        onUpdateLog={onUpdateLog}
      />
    </div>
  );
};
