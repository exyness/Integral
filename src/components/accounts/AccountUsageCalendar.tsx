import { motion } from "framer-motion";
import {
  Activity,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import {
  // Bats
  batHang,
  batSwoop,
  castleHilltop,
  // Cats
  catArched,
  catFluffy,
  catWitchHat,
  churchGothic,
  clSpookyHouse,
  fenceLeaning,
  // Fences
  gateArched,
  ghostDroopy,
  ghostGenie,
  // Ghosts
  ghostJagged,
  ghostScare,
  // Houses
  mansionCrooked,
  pumpkinBlocky,
  // Pumpkins
  pumpkinScary,
  pumpkinSneaky,
  pumpkinWitchhat,
  schoolhouseSteeple,
  spiderCuteHanging,
  spiderHairyCrawling,
  // Spiders
  spiderSharpHanging,
  // Trees
  treeMonstergrin,
  treeMonsterscream,
  treeSceneryCurly,
  treeSceneryJagged,
  // Webs
  webCornerLeft,
  webHanging,
  webNormal,
  witchBrew,
  // Witches
  witchFly,
  witchTakeoff,
} from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import { Account, AccountUsageLog } from "@/types/account";

interface AccountUsageCalendarProps {
  accounts: Account[];
  usageLogs: AccountUsageLog[];
  onAccountClick: (account: Account) => void;
  onLogClick: (log: AccountUsageLog) => void;
  onDateClick: (dateKey: string) => void;
}

export const AccountUsageCalendar: React.FC<AccountUsageCalendarProps> = ({
  accounts,
  usageLogs,
  onLogClick,
  onDateClick,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = new Date(currentYear, currentMonth - 1, 0);
  const daysInPrevMonth = prevMonth.getDate();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const isToday = (year: number, month: number, day: number) => {
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  };

  const getLogsForDate = (dateKey: string) => {
    return usageLogs.filter((log) => {
      const logDate = new Date(log.timestamp);
      const logDateKey = formatDateKey(
        logDate.getFullYear(),
        logDate.getMonth(),
        logDate.getDate(),
      );
      return logDateKey === dateKey;
    });
  };

  const getTotalUsageForDate = (dateKey: string) => {
    const dayLogs = getLogsForDate(dateKey);
    return dayLogs.reduce((sum, log) => sum + log.amount, 0);
  };

  const getAccountForLog = (accountId: string) => {
    return accounts.find((a) => a.id === accountId);
  };

  const getSpookyDecoration = (day: number) => {
    // Large background decorations - different for each day
    const backgroundDecorations = [
      // Witches (3)
      { src: witchFly, alt: "Witch Flying" },
      { src: witchTakeoff, alt: "Witch Takeoff" },
      { src: witchBrew, alt: "Witch Brew" },
      // Webs (3)
      { src: webCornerLeft, alt: "Web Corner" },
      { src: webNormal, alt: "Web" },
      { src: webHanging, alt: "Hanging Web" },
      // Trees (3)
      { src: treeMonstergrin, alt: "Monster Tree" },
      { src: treeSceneryCurly, alt: "Curly Tree" },
      { src: treeMonsterscream, alt: "Screaming Tree" },
      // Spiders (3)
      { src: spiderSharpHanging, alt: "Sharp Spider" },
      { src: spiderHairyCrawling, alt: "Hairy Spider" },
      { src: spiderCuteHanging, alt: "Cute Spider" },
      // Pumpkins (4)
      { src: pumpkinScary, alt: "Scary Pumpkin" },
      { src: pumpkinWitchhat, alt: "Witch Hat Pumpkin" },
      { src: pumpkinSneaky, alt: "Sneaky Pumpkin" },
      { src: pumpkinBlocky, alt: "Blocky Pumpkin" },
      // Houses (4)
      { src: mansionCrooked, alt: "Crooked Mansion" },
      { src: castleHilltop, alt: "Hilltop Castle" },
      { src: churchGothic, alt: "Gothic Church" },
      { src: schoolhouseSteeple, alt: "Schoolhouse" },
      // Ghosts (4)
      { src: ghostJagged, alt: "Jagged Ghost" },
      { src: ghostScare, alt: "Scary Ghost" },
      { src: ghostDroopy, alt: "Droopy Ghost" },
      { src: ghostGenie, alt: "Genie Ghost" },
      // Fences (2)
      { src: gateArched, alt: "Arched Gate" },
      { src: fenceLeaning, alt: "Leaning Fence" },
      // Cats (3)
      { src: catArched, alt: "Arched Cat" },
      { src: catFluffy, alt: "Fluffy Cat" },
      { src: catWitchHat, alt: "Witch Hat Cat" },
      // Bats (2)
      { src: batHang, alt: "Hanging Bat" },
      { src: batSwoop, alt: "Swooping Bat" },
    ];

    // Use day number + current month to shuffle decorations per month
    const index = (day * 7 + currentMonth * 3) % backgroundDecorations.length;
    return backgroundDecorations[index];
  };

  const renderCalendarDays = () => {
    const days = [];

    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push(
        <div
          key={`prev-${day}`}
          className={`w-full aspect-square sm:aspect-auto sm:h-28 md:h-36 p-1 sm:p-2 rounded-lg ${
            isDark
              ? "text-[#6B7280] bg-[rgba(255,255,255,0.02)]"
              : "text-gray-500 bg-gray-200 border border-gray-300 opacity-60"
          }`}
        >
          <div className="text-sm">{day}</div>
        </div>,
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(currentYear, currentMonth, day);
      const dayLogs = getLogsForDate(dateKey);
      const totalUsage = getTotalUsageForDate(dateKey);
      const isTodayDate = isToday(currentYear, currentMonth, day);
      const hasLogs = dayLogs.length > 0;
      const remainingCount = dayLogs.length - 2;
      days.push(
        <motion.div
          key={day}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: day * 0.005 }}
          onClick={() => {
            if (dayLogs.length > 0) {
              onDateClick(dateKey);
            }
          }}
          className={`group w-full aspect-square sm:aspect-auto sm:h-28 md:h-36 p-1 sm:p-2 rounded-lg transition-all relative overflow-hidden ${hasLogs ? "cursor-pointer" : ""} ${
            isTodayDate
              ? isHalloweenMode
                ? "bg-[rgba(96,201,182,0.15)] border-2 border-[#60c9b6] text-[#60c9b6]"
                : "bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] text-[#10B981]"
              : isDark
                ? isHalloweenMode
                  ? "bg-[#1a1a1f] border border-[#60c9b6]/20 hover:bg-[#60c9b6]/10 hover:border-[#60c9b6]/50 text-[#60c9b6]/80"
                  : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] text-white"
                : isHalloweenMode
                  ? "bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200 text-[#60c9b6]"
                  : "bg-gray-200 border-gray-300 hover:bg-gray-300 hover:border-gray-400 text-gray-800"
          }`}
          whileHover={{}}
        >
          {isHalloweenMode && (
            <>
              {(() => {
                const decoration = getSpookyDecoration(day);
                if (decoration) {
                  return (
                    <>
                      {/* Large background decoration - only appears on hover when day has NO logs */}
                      {dayLogs.length === 0 && (
                        <img
                          src={decoration.src}
                          alt={decoration.alt}
                          className="absolute inset-0 m-auto w-20 md:w-28 h-20 md:h-28 object-contain opacity-0 group-hover:opacity-5 group-hover:animate-pulse transition-opacity duration-500 pointer-events-none"
                        />
                      )}
                      {/* Small corner decoration - visible by default, hidden on hover */}
                      <img
                        src={decoration.src}
                        alt={decoration.alt}
                        className="absolute bottom-1 right-1 w-4 md:w-6 h-4 md:h-6 object-contain opacity-20 md:opacity-30 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none"
                      />
                    </>
                  );
                }
                return null;
              })()}

              {/* Special dates */}
              {day === 31 && (
                <img
                  src={pumpkinWitchhat}
                  alt="Halloween"
                  className="absolute bottom-1 right-1 w-6 md:w-9 opacity-80 pointer-events-none animate-bounce"
                />
              )}
            </>
          )}
          {/* Mobile: Simple view - just date and dots */}
          <div
            className="sm:hidden"
            onClick={() => {
              if (dayLogs.length > 0) {
                onDateClick(dateKey);
              }
            }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <span className="text-sm font-medium">{day}</span>
              {dayLogs.length > 0 && (
                <div className="flex items-center gap-0.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
                  {dayLogs.length > 1 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop: Full view with usage logs */}
          <div className="hidden sm:block relative z-10">
            <div className="flex items-start justify-between mb-1 sm:mb-2">
              <div className="flex items-center gap-1">
                <span
                  className={`text-xs sm:text-sm font-medium w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${
                    isTodayDate
                      ? isHalloweenMode
                        ? "bg-[#60c9b6] text-black font-bold"
                        : "bg-[#8B5CF6] text-white font-bold"
                      : isHalloweenMode
                        ? "text-[#60c9b6]"
                        : isDark
                          ? "text-white"
                          : "text-gray-900"
                  }`}
                >
                  {day}
                </span>
                {dayLogs.length > 0 && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isHalloweenMode ? "bg-[#60c9b6]" : "bg-[#10B981]"
                    }`}
                  />
                )}
              </div>
              {dayLogs.length > 0 && (
                <span
                  className={`text-[10px] sm:text-xs font-semibold ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : totalUsage > 1000
                        ? "text-[#F59E0B]"
                        : totalUsage > 500
                          ? "text-[#F59E0B]"
                          : "text-[#10B981]"
                  }`}
                >
                  {totalUsage.toLocaleString()}
                </span>
              )}
            </div>

            {dayLogs.length > 0 && (
              <div className="space-y-1">
                {dayLogs.slice(0, 2).map((log) => {
                  const account = getAccountForLog(log.account_id);
                  return (
                    <motion.button
                      key={log.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onLogClick(log);
                      }}
                      className={`w-full text-left text-[10px] sm:text-xs p-1 sm:p-1.5 rounded truncate cursor-pointer ${
                        isHalloweenMode
                          ? "bg-[#60c9b6]/10 hover:bg-[#60c9b6]/20 text-[#60c9b6]"
                          : isDark
                            ? "bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.1 }}
                    >
                      <div className="flex items-center space-x-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: isHalloweenMode
                              ? "#F97316"
                              : "#8B5CF6",
                          }}
                        />
                        <span className="truncate">
                          {log.description ||
                            (account?.title
                              ? `Usage in ${account.title}`
                              : "Usage Log")}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
                {dayLogs.length > 2 && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateClick?.(dateKey);
                    }}
                    className={`w-full text-[10px] sm:text-xs text-center py-0.5 sm:py-1 rounded transition-colors cursor-pointer ${
                      isHalloweenMode
                        ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                        : isDark
                          ? "text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)]"
                          : "text-purple-600 hover:bg-purple-50"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.1 }}
                  >
                    +{remainingCount} more
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </motion.div>,
      );
    }

    const totalCells = Math.ceil((firstDayWeekday + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDayWeekday + daysInMonth);

    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div
          key={`next-${day}`}
          className={`w-full aspect-square sm:aspect-auto sm:h-28 md:h-36 p-1 sm:p-2 rounded-lg ${
            isDark
              ? "text-[#6B7280] bg-[rgba(255,255,255,0.02)]"
              : "text-gray-500 bg-gray-200 border border-gray-300"
          }`}
        >
          <div className="text-sm">{day}</div>
        </div>,
      );
    }

    return days;
  };

  const totalUsage = usageLogs.reduce((sum, log) => sum + log.amount, 0);
  const thisMonthLogs = usageLogs.filter((log) => {
    const logDate = new Date(log.timestamp);
    return (
      logDate.getMonth() === currentMonth &&
      logDate.getFullYear() === currentYear
    );
  });
  const thisMonthUsage = thisMonthLogs.reduce(
    (sum, log) => sum + log.amount,
    0,
  );

  return (
    <div className="p-4 md:p-6 relative">
      {isHalloweenMode && (
        <>
          <div
            className="absolute inset-0 opacity-5 pointer-events-none z-0"
            style={{
              backgroundImage: `url(${clSpookyHouse})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "grayscale(100%)",
            }}
          />
          <img
            src={webCornerLeft}
            alt=""
            className="absolute top-0 left-0 w-20 md:w-28 opacity-15 pointer-events-none"
          />
          <img
            src={webNormal}
            alt=""
            className="absolute top-0 right-0 w-16 md:w-24 opacity-12 pointer-events-none"
          />
          <img
            src={treeMonstergrin}
            alt=""
            className="absolute bottom-20 left-2 w-16 md:w-20 opacity-10 pointer-events-none"
          />
          <img
            src={fenceLeaning}
            alt=""
            className="absolute bottom-0 right-0 w-24 md:w-32 opacity-12 pointer-events-none"
          />
        </>
      )}

      <div className="relative z-10">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h2
              className={`text-base sm:text-2xl font-bold truncate ${
                isHalloweenMode
                  ? "font-creepster tracking-wider text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={goToToday}
              className={`px-1.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-sm rounded-md sm:rounded-lg transition-colors shrink-0 ${
                isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                  : isDark
                    ? "bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)]"
                    : "bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)]"
              }`}
            >
              Today
            </button>
          </div>

          <div className="flex items-center space-x-0.5 sm:space-x-2 shrink-0 ml-2">
            <button
              onClick={() => navigateMonth("prev")}
              className={`p-0.5 sm:p-2 rounded-md sm:rounded-lg transition-colors ${
                isHalloweenMode
                  ? "text-[#60c9b6] hover:text-[#60c9b6] hover:bg-[rgba(96,201,182,0.1)]"
                  : isDark
                    ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.1)]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => navigateMonth("next")}
              className={`p-0.5 sm:p-2 rounded-md sm:rounded-lg transition-colors ${
                isHalloweenMode
                  ? "text-[#60c9b6] hover:text-[#60c9b6] hover:bg-[rgba(96,201,182,0.1)]"
                  : isDark
                    ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.1)]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Day Names Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className={`p-1 sm:p-2 text-center text-xs sm:text-sm font-medium ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-[#B4B4B8]"
                    : "text-gray-600"
              }`}
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {renderCalendarDays()}
        </div>

        {/* Calendar Stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 relative z-10">
          <div
            className={`p-3 md:p-4 rounded-xl transition-all relative overflow-hidden group ${
              isHalloweenMode
                ? isDark
                  ? "bg-[#1a1a1f] border border-[#60c9b6]/30 hover:border-[#60c9b6]/60 shadow-[0_0_10px_rgba(96,201,182,0.1)]"
                  : "bg-white border border-[#60c9b6]/30 hover:border-[#60c9b6]/60 shadow-[0_0_10px_rgba(96,201,182,0.1)]"
                : isDark
                  ? "bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.15)]"
                  : "bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.1)]"
            }`}
          >
            {isHalloweenMode && (
              <img
                src={spiderSharpHanging}
                alt="Spider"
                className="absolute -top-2 left-12 w-12 opacity-20 group-hover:opacity-30 transition-opacity duration-300"
              />
            )}
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p
                  className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${
                    isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"
                  }`}
                >
                  Total Usage
                </p>
                <p
                  className={`text-base md:text-xl font-bold ${
                    isHalloweenMode
                      ? "text-[#60c9b6] drop-shadow-[0_0_5px_rgba(96,201,182,0.5)]"
                      : "text-[#8B5CF6]"
                  }`}
                >
                  {totalUsage.toLocaleString()}
                </p>
              </div>
              <div
                className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/20 border border-[#60c9b6]/30"
                    : "bg-[rgba(139,92,246,0.2)]"
                }`}
              >
                {isHalloweenMode ? (
                  <img
                    src={pumpkinWitchhat}
                    alt="Pumpkin"
                    className="w-5 h-5 md:w-7 md:h-7 drop-shadow-lg"
                  />
                ) : (
                  <TrendingUp
                    className={`w-4 h-4 md:w-6 md:h-6 ${
                      isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"
                    }`}
                  />
                )}
              </div>
            </div>
          </div>

          <div
            className={`p-3 md:p-4 rounded-xl transition-all relative overflow-hidden group ${
              isHalloweenMode
                ? isDark
                  ? "bg-[#1a1a1f] border border-[#60c9b6]/30 hover:border-[#60c9b6]/60 shadow-[0_0_10px_rgba(96,201,182,0.1)]"
                  : "bg-white border border-[#60c9b6]/30 hover:border-[#60c9b6]/60 shadow-[0_0_10px_rgba(96,201,182,0.1)]"
                : isDark
                  ? "bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.15)]"
                  : "bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.1)]"
            }`}
          >
            {isHalloweenMode && (
              <img
                src={treeSceneryJagged}
                alt="Bat"
                className="absolute -bottom-1 left-16 w-12 opacity-30 group-hover:opacity-30 transition-opacity duration-300"
              />
            )}
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p
                  className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${
                    isHalloweenMode ? "text-[#60c9b6]" : "text-[#10B981]"
                  }`}
                >
                  Total Logs
                </p>
                <p
                  className={`text-base md:text-xl font-bold ${
                    isHalloweenMode
                      ? "text-[#60c9b6] drop-shadow-[0_0_5px_rgba(96,201,182,0.5)]"
                      : "text-[#10B981]"
                  }`}
                >
                  {usageLogs.length}
                </p>
              </div>
              <div
                className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/20 border border-[#60c9b6]/30"
                    : "bg-[rgba(16,185,129,0.2)]"
                }`}
              >
                {isHalloweenMode ? (
                  <img
                    src={ghostScare}
                    alt="Ghost"
                    className="w-5 h-5 md:w-7 md:h-7 drop-shadow-lg"
                  />
                ) : (
                  <Activity
                    className={`w-4 h-4 md:w-6 md:h-6 ${
                      isHalloweenMode ? "text-[#60c9b6]" : "text-[#10B981]"
                    }`}
                  />
                )}
              </div>
            </div>
          </div>

          <div
            className={`p-3 md:p-4 rounded-xl transition-all col-span-2 sm:col-span-1 relative overflow-hidden group ${
              isHalloweenMode
                ? isDark
                  ? "bg-[#1a1a1f] border border-[#60c9b6]/30 hover:border-[#60c9b6]/60 shadow-[0_0_10px_rgba(96,201,182,0.1)]"
                  : "bg-white border border-[#60c9b6]/30 hover:border-[#60c9b6]/60 shadow-[0_0_10px_rgba(96,201,182,0.1)]"
                : isDark
                  ? "bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] hover:bg-[rgba(245,158,11,0.15)]"
                  : "bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.2)] hover:bg-[rgba(245,158,11,0.1)]"
            }`}
          >
            {isHalloweenMode && (
              <img
                src={ghostScare}
                alt="Ghost"
                className="absolute top-5 right-24 w-10 opacity-20 group-hover:opacity-30 transition-opacity duration-300"
              />
            )}
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p
                  className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${
                    isHalloweenMode ? "text-[#60c9b6]" : "text-[#F59E0B]"
                  }`}
                >
                  This Month
                </p>
                <p
                  className={`text-lg md:text-2xl font-bold ${
                    isHalloweenMode
                      ? "text-[#60c9b6] drop-shadow-[0_0_5px_rgba(96,201,182,0.5)]"
                      : "text-[#F59E0B]"
                  }`}
                >
                  {thisMonthUsage.toLocaleString()}
                </p>
              </div>
              <div
                className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/20 border border-[#60c9b6]/30"
                    : "bg-[rgba(245,158,11,0.2)]"
                }`}
              >
                {isHalloweenMode ? (
                  <img
                    src={catWitchHat}
                    alt="Cat"
                    className="w-5 h-5 md:w-7 md:h-7 drop-shadow-lg"
                  />
                ) : (
                  <CalendarIcon
                    className={`w-4 h-4 md:w-6 md:h-6 ${
                      isHalloweenMode ? "text-[#60c9b6]" : "text-[#F59E0B]"
                    }`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
