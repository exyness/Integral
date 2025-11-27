import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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
  clWitchSilhouette,
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
import { Task } from "@/types/task";
import { GlassCard } from "../GlassCard";
import { DayTasksModal } from "./DayTasksModal";

interface TasksCalendarProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export const TasksCalendar: React.FC<TasksCalendarProps> = ({
  tasks,
  onTaskClick,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#71717A";
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        new Date(year, month - 1, prevMonthLastDay - startingDayOfWeek + 1 + i),
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    const totalCells = Math.ceil(days.length / 7) * 7;
    const remainingCells = totalCells - days.length;

    for (let i = 1; i <= remainingCells; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    return tasks.filter((task) => {
      if (task.completed && task.completion_date) {
        const completionDateStr = task.completion_date.split("T")[0];
        return completionDateStr === dateStr;
      }

      return task.due_date === dateStr;
    });
  };

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

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isOverdue = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
    const index =
      (day * 7 + currentDate.getMonth() * 3) % backgroundDecorations.length;
    return backgroundDecorations[index];
  };

  return (
    <>
      <GlassCard
        variant="secondary"
        className="p-4 md:p-6 relative overflow-hidden"
      >
        {isHalloweenMode && (
          <>
            <div
              className="absolute inset-0 opacity-5 pointer-events-none z-0"
              style={{
                backgroundImage: `url(${clWitchSilhouette})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
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
        <div className="flex items-center justify-between mb-4 md:mb-6 relative z-10">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h2
              className={`text-base sm:text-2xl font-bold truncate ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {monthYear}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-1.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-sm bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] rounded-md sm:rounded-lg text-[#10B981] hover:bg-[rgba(16,185,129,0.3)] transition-colors shrink-0"
            >
              Today
            </button>
          </div>

          <div className="flex items-center space-x-0.5 sm:space-x-2 shrink-0 ml-2">
            <button
              onClick={() => navigateMonth("prev")}
              className={`p-0.5 sm:p-2 rounded-md sm:rounded-lg transition-colors ${
                isDark
                  ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.1)]"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => navigateMonth("next")}
              className={`p-0.5 sm:p-2 rounded-md sm:rounded-lg transition-colors ${
                isDark
                  ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.1)]"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-4 text-xs sm:text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[rgba(16,185,129,0.3)] rounded-full"></div>
            <span className={isDark ? "text-[#B4B4B8]" : "text-gray-600"}>
              Today
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[rgba(139,92,246,0.3)] rounded-full"></div>
            <span className={isDark ? "text-[#B4B4B8]" : "text-gray-600"}>
              Has Tasks
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[rgba(239,68,68,0.3)] rounded-full"></div>
            <span className={isDark ? "text-[#B4B4B8]" : "text-gray-600"}>
              Overdue
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <Calendar
              className={`w-4 h-4 ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
            />
            <span className={isDark ? "text-[#B4B4B8]" : "text-gray-600"}>
              Click tasks to view details
            </span>
          </div>
        </div>

        {/* Day Names Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className={`p-1 sm:p-2 text-center text-xs sm:text-sm font-medium ${
                isDark ? "text-[#B4B4B8]" : "text-gray-600"
              }`}
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((date, index) => {
            if (!date) return null;
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const dayTasks = getTasksForDate(date);
            const hasOverdueTasks = dayTasks.some(
              (task) => !task.completed && isOverdue(date),
            );
            const completedTasks = dayTasks.filter(
              (task) => task.completed,
            ).length;
            const pendingTasks = dayTasks.filter(
              (task) => !task.completed,
            ).length;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.01 }}
                className={`w-full aspect-square sm:aspect-auto sm:h-28 md:h-36 p-1 sm:p-2 rounded-lg transition-all cursor-pointer relative overflow-hidden group ${
                  !isCurrentMonth
                    ? isDark
                      ? "text-[#6B7280] bg-[rgba(255,255,255,0.02)]"
                      : "text-gray-500 bg-gray-200 border border-gray-300 opacity-60"
                    : isToday(date)
                      ? isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.15)] border-2 border-[#60c9b6] text-[#60c9b6]"
                        : "bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] text-[#10B981]"
                      : hasOverdueTasks
                        ? isHalloweenMode
                          ? "bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                          : "bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.3)] text-[#EF4444]"
                        : dayTasks.length > 0
                          ? isHalloweenMode
                            ? "bg-[#60c9b6]/10 border border-[#60c9b6]/20 text-[#60c9b6] hover:bg-[#60c9b6]/20"
                            : isDark
                              ? "bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] text-white hover:bg-[rgba(139,92,246,0.2)]"
                              : "bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] text-gray-900 hover:bg-[rgba(139,92,246,0.15)]"
                          : isHalloweenMode
                            ? "bg-[#1a1a1f] border border-[#60c9b6]/20 hover:bg-[#60c9b6]/10 hover:border-[#60c9b6]/50 text-[#60c9b6]/60"
                            : isDark
                              ? "bg-[rgba(255,255,255,0.05)] text-white hover:bg-[rgba(255,255,255,0.1)]"
                              : "bg-gray-200 border border-gray-300 text-gray-800 hover:bg-gray-300"
                }`}
                whileHover={{}}
              >
                {isHalloweenMode && (
                  <>
                    {(() => {
                      const decoration = getSpookyDecoration(date.getDate());
                      if (decoration) {
                        return (
                          <>
                            {/* Large background decoration - only appears on hover when day has NO tasks */}
                            {dayTasks.length === 0 && (
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
                    {date.getDate() === 31 && date.getMonth() === 9 && (
                      <img
                        src={pumpkinWitchhat}
                        alt="Halloween"
                        className="absolute bottom-1 right-1 w-6 md:w-9 opacity-80 pointer-events-none animate-bounce"
                      />
                    )}
                  </>
                )}
                <>
                  {/* Mobile: Simple view - just date and count */}
                  <div
                    className="sm:hidden"
                    onClick={() => {
                      if (dayTasks.length > 0) {
                        setSelectedDate(date);
                        setIsModalOpen(true);
                      }
                    }}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-sm font-medium">
                        {date.getDate()}
                      </span>
                      {dayTasks.length > 0 && (
                        <div className="flex items-center gap-0.5 mt-1">
                          {completedTasks > 0 && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
                          )}
                          {pendingTasks > 0 && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Desktop: Full view with tasks */}
                  <div className="hidden sm:block">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {date.getDate()}
                      </span>
                      {dayTasks.length > 0 && (
                        <div className="flex items-center space-x-1">
                          {completedTasks > 0 && (
                            <span className="text-xs text-[#10B981] bg-[rgba(16,185,129,0.2)] px-1 rounded">
                              {completedTasks}
                            </span>
                          )}
                          {pendingTasks > 0 && (
                            <span className="text-xs text-[#F59E0B] bg-[rgba(245,158,11,0.2)] px-1 rounded">
                              {pendingTasks}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map((task) => (
                        <motion.div
                          key={task.id}
                          className={`text-xs p-1 rounded cursor-pointer truncate
                            ${
                              task.completed
                                ? "bg-[rgba(16,185,129,0.2)] text-[#10B981] line-through"
                                : isDark
                                  ? "bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)]"
                                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                            }
                          `}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskClick?.(task);
                          }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          <div className="flex items-center space-x-1">
                            <div
                              className="w-1 h-1 rounded-full shrink-0"
                              style={{
                                backgroundColor: getPriorityColor(
                                  task.priority,
                                ),
                              }}
                            />
                            <span className="truncate">{task.title}</span>
                          </div>
                        </motion.div>
                      ))}
                      {dayTasks.length > 2 && (
                        <button
                          className={`text-xs text-center w-full py-1 rounded transition-colors cursor-pointer ${
                            isHalloweenMode
                              ? "text-[#60c9b6] hover:bg-[#60c9b6]/10 hover:text-[#4db3a2]"
                              : isDark
                                ? "text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#A78BFA]"
                                : "text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#7C3AED]"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(date);
                            setIsModalOpen(true);
                          }}
                        >
                          +{dayTasks.length - 2} more
                        </button>
                      )}
                    </div>
                  </div>
                </>
              </motion.div>
            );
          })}
        </div>

        {/* Calendar Stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <div
            className={`p-3 md:p-4 rounded-xl transition-all relative overflow-hidden group ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border border-[#60c9b6]/30 hover:border-[#60c9b6]/60 shadow-[0_0_10px_rgba(96,201,182,0.1)]"
                : isDark
                  ? "bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.15)]"
                  : "bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.1)]"
            }`}
          >
            {isHalloweenMode && (
              <img
                src={webCornerLeft}
                alt=""
                className="absolute top-0 left-0 w-12 md:w-16 opacity-50 group-hover:opacity-40 transition-opacity"
              />
            )}
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p
                  className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${
                    isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"
                  }`}
                >
                  Total Tasks
                </p>
                <p
                  className={`text-lg md:text-2xl font-bold ${
                    isHalloweenMode
                      ? "text-[#60c9b6] drop-shadow-[0_0_5px_rgba(96,201,182,0.5)]"
                      : "text-[#8B5CF6]"
                  }`}
                >
                  {tasks.length}
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
                  <Calendar className="w-4 h-4 md:w-6 md:h-6 text-[#8B5CF6]" />
                )}
              </div>
            </div>
          </div>

          <div
            className={`p-3 md:p-4 rounded-xl transition-all relative overflow-hidden group ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border border-[#60c9b6]/30 hover:border-[#60c9b6]/60 shadow-[0_0_10px_rgba(96,201,182,0.1)]"
                : isDark
                  ? "bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.15)]"
                  : "bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.1)]"
            }`}
          >
            {isHalloweenMode && (
              <img
                src={spiderCuteHanging}
                alt=""
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 md:w-10 opacity-20 group-hover:opacity-40 transition-opacity"
              />
            )}
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p
                  className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${
                    isHalloweenMode ? "text-[#60c9b6]" : "text-[#10B981]"
                  }`}
                >
                  Completed
                </p>
                <p
                  className={`text-lg md:text-2xl font-bold ${
                    isHalloweenMode
                      ? "text-[#60c9b6] drop-shadow-[0_0_5px_rgba(96,201,182,0.5)]"
                      : "text-[#10B981]"
                  }`}
                >
                  {tasks.filter((task) => task.completed).length}
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
                    src={catWitchHat}
                    alt="Cat"
                    className="w-5 h-5 md:w-7 md:h-7 drop-shadow-lg"
                  />
                ) : (
                  <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-[#10B981]"></div>
                )}
              </div>
            </div>
          </div>

          <div
            className={`p-3 md:p-4 rounded-xl transition-all relative overflow-hidden group ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border border-[#60c9b6]/30 hover:border-[#60c9b6]/60 shadow-[0_0_10px_rgba(96,201,182,0.1)]"
                : isDark
                  ? "bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] hover:bg-[rgba(245,158,11,0.15)]"
                  : "bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.2)] hover:bg-[rgba(245,158,11,0.1)]"
            }`}
          >
            {isHalloweenMode && (
              <img
                src={batSwoop}
                alt=""
                className="absolute top-1 left-1 w-6 md:w-8 opacity-20 group-hover:opacity-50 transition-opacity"
              />
            )}

            <div className="flex items-center justify-between relative z-10">
              <div>
                <p
                  className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${
                    isHalloweenMode ? "text-[#60c9b6]" : "text-[#F59E0B]"
                  }`}
                >
                  Pending
                </p>
                <p
                  className={`text-lg md:text-2xl font-bold ${
                    isHalloweenMode
                      ? "text-[#60c9b6] drop-shadow-[0_0_5px_rgba(96,201,182,0.5)]"
                      : "text-[#F59E0B]"
                  }`}
                >
                  {tasks.filter((task) => !task.completed).length}
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
                    src={ghostScare}
                    alt="Ghost"
                    className="w-5 h-5 md:w-7 md:h-7 drop-shadow-lg"
                  />
                ) : (
                  <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-[#F59E0B]"></div>
                )}
              </div>
            </div>
          </div>

          <div
            className={`p-3 md:p-4 rounded-xl transition-all relative overflow-hidden group ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border border-[#60c9b6]/30 hover:border-[#60c9b6]/60 shadow-[0_0_10px_rgba(96,201,182,0.1)]"
                : isDark
                  ? "bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.15)]"
                  : "bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.1)]"
            }`}
          >
            {isHalloweenMode && (
              <img
                src={ghostJagged}
                alt=""
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  w-10 md:w-14 opacity-20 group-hover:opacity-40 transition-opacity"
              />
            )}
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p
                  className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${
                    isHalloweenMode ? "text-[#60c9b6]" : "text-[#EF4444]"
                  }`}
                >
                  Overdue
                </p>
                <p
                  className={`text-lg md:text-2xl font-bold ${
                    isHalloweenMode
                      ? "text-[#60c9b6] drop-shadow-[0_0_5px_rgba(96,201,182,0.5)]"
                      : "text-[#EF4444]"
                  }`}
                >
                  {
                    tasks.filter((task) => {
                      if (task.completed || !task.due_date) return false;
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const dueDate = new Date(task.due_date);
                      return dueDate < today;
                    }).length
                  }
                </p>
              </div>
              <div
                className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/20 border border-[#60c9b6]/30"
                    : "bg-[rgba(239,68,68,0.2)]"
                }`}
              >
                {isHalloweenMode ? (
                  <img
                    src={pumpkinScary}
                    alt="Scary Pumpkin"
                    className="w-5 h-5 md:w-7 md:h-7 drop-shadow-lg"
                  />
                ) : (
                  <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-[#EF4444]"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Day Tasks Modal - Outside GlassCard */}
      {selectedDate && (
        <DayTasksModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDate(null);
          }}
          date={selectedDate}
          tasks={getTasksForDate(selectedDate)}
          onTaskClick={onTaskClick}
        />
      )}
    </>
  );
};
