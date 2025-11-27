import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Copy,
  Edit,
  Eye,
  Flag,
  Folder,
  Lightbulb,
  MoreVertical,
  Plus,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  cardHauntedHouse,
  ghostDroopy,
  ghostGenie,
  ghostScare,
} from "@/assets";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/contexts/ThemeContext";
import { useTimeCalculations } from "@/hooks/tasks/useTimeCalculations";
import { Task } from "@/types/task";

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onTaskClick: (taskId: string) => void;
  onCreateTask: () => void;
  projectName: string;
  onBack: () => void;
}

type ColumnType = "todo" | "in_progress" | "review" | "completed";

const COLUMN_CONFIG = {
  todo: {
    title: "To Do",
    color: "#F59E0B",
    textColor: "text-[#F59E0B]",
    bgColor: "bg-[rgba(245,158,11,0.1)]",
    borderColor: "border-[rgba(245,158,11,0.3)]",
    Icon: ClipboardList,
  },
  in_progress: {
    title: "In Progress",
    color: "#3B82F6",
    textColor: "text-[#3B82F6]",
    bgColor: "bg-[rgba(59,130,246,0.1)]",
    borderColor: "border-[rgba(59,130,246,0.3)]",
    Icon: Zap,
  },
  review: {
    title: "Review",
    color: "#8B5CF6",
    textColor: "text-[#8B5CF6]",
    bgColor: "bg-[rgba(139,92,246,0.1)]",
    borderColor: "border-[rgba(139,92,246,0.3)]",
    Icon: Eye,
  },
  completed: {
    title: "Completed",
    color: "#10B981",
    textColor: "text-[#10B981]",
    bgColor: "bg-[rgba(16,185,129,0.1)]",
    borderColor: "border-[rgba(16,185,129,0.3)]",
    Icon: CheckCircle2,
  },
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onTaskClick,
  onCreateTask,
  projectName,
  onBack,
}) => {
  const { isDark, isHalloweenMode } = useTheme();

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => task.project === projectName);
  }, [tasks, projectName]);

  const kanbanTasks = useMemo(() => {
    return filteredTasks.map((task) => {
      let column: ColumnType = "todo";
      if (task.completed) {
        column = "completed";
      } else if (task.status === "in_progress") {
        column = "in_progress";
      } else if (task.status === "review") {
        column = "review";
      } else if (task.status === "todo" || !task.status) {
        column = "todo";
      }

      return {
        ...task,
        column,
      };
    });
  }, [filteredTasks]);

  const [cards, setCards] = useState(kanbanTasks);

  React.useEffect(() => {
    setCards(kanbanTasks);
  }, [kanbanTasks]);

  const handleCardMove = async (taskId: string, newColumn: ColumnType) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setCards((prevCards) => {
      return prevCards.map((card) =>
        card.id === taskId ? { ...card, column: newColumn } : card,
      );
    });

    const updates: Partial<Task> = {
      status: newColumn,
      completed: newColumn === "completed",
      updated_at: new Date().toISOString(),
    };

    if (newColumn === "completed" && !task.completion_date) {
      updates.completion_date = new Date().toISOString();
    }

    try {
      await onUpdateTask(taskId, updates);
      toast.success(`Moved to ${COLUMN_CONFIG[newColumn].title}`);
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to move task");

      setCards(kanbanTasks);
    }
  };

  const columnStats = useMemo(() => {
    const stats: Record<ColumnType, number> = {
      todo: 0,
      in_progress: 0,
      review: 0,
      completed: 0,
    };
    cards.forEach((card) => {
      stats[card.column]++;
    });
    return stats;
  }, [cards]);

  return (
    <div className="space-y-4">
      {/* Project Header */}
      <GlassCard
        variant="secondary"
        className={`p-3 md:p-4 ${
          isHalloweenMode
            ? "bg-[#1a1a1f] border border-[#60c9b6]/30 shadow-[0_0_15px_rgba(96,201,182,0.2)]"
            : ""
        }`}
      >
        <div className="space-y-3 md:space-y-0">
          {/* Top row - Back button, icon, project info, stats badges (desktop), and Add button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <button
                onClick={onBack}
                className={`p-1.5 md:p-2 rounded-lg transition-colors shrink-0 cursor-pointer ${
                  isHalloweenMode
                    ? "text-[#60c9b6] hover:bg-[#60c9b6]/20"
                    : isDark
                      ? "hover:bg-[rgba(255,255,255,0.05)]"
                      : "hover:bg-gray-100"
                }`}
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <Folder
                className={`w-4 h-4 md:w-5 md:h-5 shrink-0 ${
                  isHalloweenMode ? "text-[#60c9b6]" : "text-[#EC4899]"
                }`}
              />
              <div className="min-w-0 flex-1">
                <h2
                  className={`text-base md:text-lg font-semibold truncate ${
                    isHalloweenMode
                      ? "text-[#60c9b6] font-creepster tracking-wide"
                      : "text-[#EC4899]"
                  }`}
                >
                  {projectName}
                </h2>
                <p
                  className={`text-[10px] md:text-xs ${
                    isHalloweenMode
                      ? "text-[#60c9b6]/70"
                      : isDark
                        ? "text-[#71717A]"
                        : "text-gray-500"
                  }`}
                >
                  {filteredTasks.length}{" "}
                  {filteredTasks.length === 1 ? "task" : "tasks"}
                </p>
              </div>
            </div>

            {/* Stats badges - Desktop only (on the right) */}
            <div className="hidden md:flex items-center gap-2">
              {Object.entries(columnStats).map(([column, count]) => {
                const config = COLUMN_CONFIG[column as ColumnType];
                return (
                  <div
                    key={column}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${config.bgColor}`}
                  >
                    <config.Icon
                      className={`w-3 h-3 md:w-3.5 md:h-3.5 ${config.textColor}`}
                    />
                    <span className={`text-xs font-medium ${config.textColor}`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            <motion.button
              onClick={onCreateTask}
              className={`flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg transition-colors text-xs font-medium shrink-0 cursor-pointer ${
                isHalloweenMode
                  ? "bg-[#60c9b6]/20 border border-[#60c9b6]/30 text-[#60c9b6] hover:bg-[#60c9b6]/30"
                  : "bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] text-[#10B981] hover:bg-[rgba(16,185,129,0.3)]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </motion.button>
          </div>

          {/* Stats badges - Mobile only (below) */}
          <div className="flex md:hidden items-center gap-2">
            {Object.entries(columnStats).map(([column, count]) => {
              const config = COLUMN_CONFIG[column as ColumnType];
              return (
                <div
                  key={column}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${config.bgColor}`}
                >
                  <config.Icon
                    className={`w-3 h-3 md:w-3.5 md:h-3.5 ${config.textColor}`}
                  />
                  <span className={`text-xs font-medium ${config.textColor}`}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Mobile Tip Banner */}
      <div className="md:hidden">
        <div
          className={`px-3 py-2 rounded-lg border text-xs flex items-center gap-2 ${
            isDark
              ? "bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.3)] text-[#B4B4B8]"
              : "bg-purple-50 border-purple-200 text-gray-700"
          }`}
        >
          <Lightbulb className="w-4 h-4 text-[#8B5CF6] shrink-0" />
          <p>
            <span className="font-medium text-[#8B5CF6]">Tip:</span> Use the
            menu (⋮) on each card to move tasks between columns. For the best
            experience, use a larger screen.
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <GlassCard variant="secondary" className="overflow-hidden relative">
        {isHalloweenMode && (
          <div
            className="absolute inset-0 pointer-events-none opacity-10 z-0"
            style={{
              backgroundImage: `url(${cardHauntedHouse})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "grayscale(100%)",
            }}
          />
        )}
        {isHalloweenMode && (
          <>
            <motion.img
              src={ghostDroopy}
              alt="Ghost"
              className="absolute top-10 left-10 w-16 h-16 opacity-20 pointer-events-none z-0"
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.img
              src={ghostGenie}
              alt="Ghost"
              className="absolute bottom-20 right-20 w-20 h-20 opacity-20 pointer-events-none z-0"
              animate={{
                y: [0, -30, 0],
                x: [0, -15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
            <motion.img
              src={ghostScare}
              alt="Ghost"
              className="absolute top-20 right-1/3 w-16 h-16 opacity-15 pointer-events-none z-0"
              animate={{
                y: [0, 20, 0],
                x: [0, 10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          </>
        )}
        <div className="p-4 md:p-6 relative z-10">
          <Board
            cards={cards}
            onTaskClick={onTaskClick}
            onDeleteTask={onDeleteTask}
            onCardMove={handleCardMove}
            isDark={isDark}
            columnStats={columnStats}
          />
        </div>
      </GlassCard>
    </div>
  );
};

interface BoardProps {
  cards: (Task & { column: ColumnType })[];
  onTaskClick: (taskId: string) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  onCardMove: (taskId: string, newColumn: ColumnType) => Promise<void>;
  isDark: boolean;
  columnStats: Record<ColumnType, number>;
}

const Board: React.FC<BoardProps> = ({
  cards,
  onTaskClick,
  onDeleteTask,
  onCardMove,
  isDark,
  columnStats,
}) => {
  return (
    <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 -mx-4 md:mx-0 px-4 md:px-0 snap-x snap-mandatory md:snap-none scrollbar-hide">
      {(Object.keys(COLUMN_CONFIG) as ColumnType[]).map((columnKey) => (
        <Column
          key={columnKey}
          title={COLUMN_CONFIG[columnKey].title}
          column={columnKey}
          config={COLUMN_CONFIG[columnKey]}
          cards={cards}
          onTaskClick={onTaskClick}
          onDeleteTask={onDeleteTask}
          onCardMove={onCardMove}
          isDark={isDark}
          taskCount={columnStats[columnKey]}
        />
      ))}
    </div>
  );
};

interface ColumnProps {
  title: string;
  config: (typeof COLUMN_CONFIG)[ColumnType];
  cards: (Task & { column: ColumnType })[];
  column: ColumnType;
  onTaskClick: (taskId: string) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  onCardMove: (taskId: string, newColumn: ColumnType) => Promise<void>;
  isDark: boolean;
  taskCount: number;
}

const Column: React.FC<ColumnProps> = ({
  title,
  config,
  cards,
  column,
  onTaskClick,
  onDeleteTask,
  onCardMove,
  isDark,
  taskCount,
}) => {
  const { isHalloweenMode } = useTheme();
  const [isDragOver, setIsDragOver] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);

  const filteredCards = cards.filter((c) => c.column === column);

  return (
    <div className="w-[85vw] sm:w-72 md:w-80 shrink-0 snap-center md:snap-align-none">
      {/* Column Header */}
      <motion.div
        className={`mb-3 md:mb-4 p-2.5 md:p-3 rounded-lg border ${
          isHalloweenMode
            ? "bg-[#1a1a1f] border-[#60c9b6]/30 shadow-[0_0_10px_rgba(96,201,182,0.1)]"
            : `${config.bgColor} ${config.borderColor}`
        }`}
        animate={{
          scale: isDragOver ? 1.02 : 1,
          borderColor: isDragOver ? config.color : undefined,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                rotate: isDragOver ? [0, -10, 10, -10, 0] : 0,
                scale: isDragOver ? 1.1 : 1,
              }}
              transition={{ duration: 0.5 }}
            >
              <config.Icon
                className={`w-4 h-4 ${
                  isHalloweenMode ? "text-[#60c9b6]" : config.textColor
                }`}
              />
            </motion.div>
            <h3
              className={`font-semibold text-sm ${
                isHalloweenMode
                  ? "text-[#60c9b6] font-creepster tracking-wide"
                  : config.textColor
              }`}
            >
              {title}
            </h3>
          </div>
          <motion.span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isHalloweenMode
                ? "bg-[#60c9b6]/10 text-[#60c9b6] border border-[#60c9b6]/30"
                : `${config.bgColor} ${config.textColor}`
            }`}
            key={taskCount}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            {taskCount}
          </motion.span>
        </div>
      </motion.div>

      {/* Column Content */}
      <motion.div
        ref={columnRef}
        data-column={column}
        onDragEnter={() => setIsDragOver(true)}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) {
            setIsDragOver(false);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDrop={() => setIsDragOver(false)}
        className={`min-h-[400px] md:min-h-[500px] rounded-lg p-2 border-2 border-dashed transition-colors ${
          isDragOver
            ? `${config.borderColor} border-opacity-70`
            : `${config.borderColor} border-opacity-20`
        }`}
        animate={{
          backgroundColor: isDragOver
            ? `${config.color}20`
            : `${config.color}05`,
          scale: isDragOver ? 1.01 : 1,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <AnimatePresence mode="popLayout">
          {filteredCards.map((c) => {
            return (
              <Card
                key={c.id}
                task={c}
                onTaskClick={onTaskClick}
                onDeleteTask={onDeleteTask}
                onCardMove={onCardMove}
                isDark={isDark}
              />
            );
          })}
        </AnimatePresence>
        <DropIndicator beforeId={null} column={column} />
      </motion.div>
    </div>
  );
};

interface CardProps {
  task: Task & { column: ColumnType };
  onTaskClick: (taskId: string) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  onCardMove: (taskId: string, newColumn: ColumnType) => Promise<void>;
  isDark: boolean;
}

const Card: React.FC<CardProps> = ({
  task,
  onTaskClick,
  onDeleteTask,
  onCardMove,
  isDark,
}) => {
  const { isHalloweenMode } = useTheme();
  const { getTaskTimeStats, formatDuration } = useTimeCalculations([task]);
  const [showMenu, setShowMenu] = useState(false);
  const [wasDragged, setWasDragged] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const timeStats = useMemo(
    () => getTaskTimeStats(task.id),
    [getTaskTimeStats, task.id],
  );

  const columnConfig = COLUMN_CONFIG[task.column];
  const accentColor = columnConfig.color;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showMenu]);

  const handleCardClick = () => {
    if (!wasDragged) {
      onTaskClick(task.id);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleCopyTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(task.title);
    toast.success("Task title copied to clipboard");
    setShowMenu(false);
  };

  return (
    <>
      <DropIndicator beforeId={task.id} column={task.column} />
      <motion.div
        layout
        layoutId={task.id}
        drag
        dragElastic={0.1}
        dragMomentum={false}
        dragSnapToOrigin
        dragTransition={{
          bounceStiffness: 600,
          bounceDamping: 20,
        }}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.15, ease: "easeOut" },
        }}
        whileDrag={{
          scale: 0.95,
          rotate: 0,
          zIndex: 999,
          boxShadow: isDark
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 12px 20px -8px rgba(0, 0, 0, 0.4)"
            : "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 20px -8px rgba(0, 0, 0, 0.15)",
          cursor: "grabbing",
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
          },
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{
          layout: {
            type: "spring",
            stiffness: 350,
            damping: 30,
          },
          opacity: { duration: 0.2 },
        }}
        onDragStart={() => {
          setWasDragged(true);
        }}
        onDragEnd={async (_event, info) => {
          setTimeout(() => {
            setWasDragged(false);
          }, 200);

          const elements = document.elementsFromPoint(
            info.point.x,
            info.point.y,
          );

          const columnElement = elements.find((el) =>
            el.hasAttribute("data-column"),
          );

          if (columnElement) {
            const newColumn = columnElement.getAttribute(
              "data-column",
            ) as ColumnType;

            if (newColumn && newColumn !== task.column) {
              await onCardMove(task.id, newColumn);
            }
          }
        }}
        onClick={handleCardClick}
        className={`cursor-grab active:cursor-grabbing rounded-lg border p-3 mb-2 group relative ${
          showMenu ? "z-100" : ""
        } ${
          isHalloweenMode
            ? "bg-[#1a1a1f] border-[#60c9b6]/30 hover:bg-[#60c9b6]/10 hover:border-[#60c9b6]/50 shadow-[0_0_10px_rgba(96,201,182,0.1)] hover:shadow-[0_0_15px_rgba(96,201,182,0.2)]"
            : isDark
              ? "border-[rgba(255,255,255,0.1)] bg-[rgba(26,26,31,0.6)] hover:bg-[rgba(40,40,45,0.6)] hover:border-[rgba(255,255,255,0.15)]"
              : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm"
        }`}
      >
        {/* Context Menu Button */}
        <button
          onClick={handleMenuClick}
          className={`absolute top-2 right-2 p-1.5 rounded-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 ${
            isHalloweenMode
              ? "bg-[#1a1a1f] hover:bg-[#60c9b6]/20 border border-[#60c9b6]/30 text-[#60c9b6]"
              : isDark
                ? "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]"
                : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Context Menu Dropdown */}
        {showMenu && (
          <div
            ref={menuRef}
            className={`absolute top-8 right-2 w-40 rounded-lg shadow-lg overflow-hidden z-110 border ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 shadow-[0_0_15px_rgba(96,201,182,0.2)]"
                : isDark
                  ? "bg-[rgba(26,26,31,0.95)] border-[rgba(255,255,255,0.1)]"
                  : "bg-white border-gray-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onTaskClick(task.id);
              }}
              className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors ${
                isDark
                  ? "hover:bg-[rgba(255,255,255,0.05)] text-[#B4B4B8]"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Task</span>
            </button>
            <button
              onClick={handleCopyTask}
              className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors ${
                isDark
                  ? "hover:bg-[rgba(255,255,255,0.05)] text-[#B4B4B8]"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Title</span>
            </button>
            <div
              className={`h-px my-1 ${isDark ? "bg-[rgba(255,255,255,0.1)]" : "bg-gray-200"}`}
            />
            {/* Move To options */}
            {(Object.keys(COLUMN_CONFIG) as ColumnType[])
              .filter((col) => col !== task.column)
              .map((col) => {
                const config = COLUMN_CONFIG[col];
                return (
                  <button
                    key={col}
                    onClick={async (e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      const updates: Partial<Task> = {
                        status: col,
                        completed: col === "completed",
                        updated_at: new Date().toISOString(),
                      };
                      if (col === "completed" && !task.completion_date) {
                        updates.completion_date = new Date().toISOString();
                      }
                      try {
                        await onCardMove(task.id, col);
                      } catch (error) {
                        console.error("Failed to move task:", error);
                      }
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors ${
                      isDark
                        ? "hover:bg-[rgba(255,255,255,0.05)] text-[#B4B4B8]"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <config.Icon className={`w-3 h-3 ${config.textColor}`} />
                    <span>Move to {config.title}</span>
                  </button>
                );
              })}
            <div
              className={`h-px my-1 ${isDark ? "bg-[rgba(255,255,255,0.1)]" : "bg-gray-200"}`}
            />
            <button
              onClick={async (e) => {
                e.stopPropagation();
                setShowMenu(false);
                await onDeleteTask(task.id);
              }}
              className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors ${
                isDark
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-red-600 hover:bg-red-50"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Task</span>
            </button>
          </div>
        )}

        {/* Task Content */}
        <div className="flex items-start gap-2 mb-2 pr-8">
          <div className="flex-1 min-w-0">
            <h4
              className={`font-semibold text-sm mb-1 line-clamp-2 transition-colors`}
              style={{ color: accentColor }}
            >
              {task.title}
            </h4>
            {task.description && (
              <p
                className={`text-xs line-clamp-2 ${
                  isDark ? "text-[#B4B4B8]" : "text-gray-600"
                }`}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Task Metadata - Hidden on mobile */}
        <div className="hidden md:block space-y-2">
          {/* Project Badge */}
          {task.project && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 text-xs rounded w-fit border"
              style={{
                backgroundColor: `${accentColor}15`,
                borderColor: `${accentColor}30`,
                color: accentColor,
              }}
            >
              <Folder className="w-3 h-3" />
              <span className="font-medium">{task.project}</span>
            </div>
          )}

          {/* Info Row */}
          <div
            className={`flex flex-wrap items-center gap-3 text-xs`}
            style={{ color: isDark ? "#71717A" : "#6B7280" }}
          >
            {task.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" style={{ color: accentColor }} />
                <span>{task.due_date}</span>
              </div>
            )}
            {task.assignee && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" style={{ color: accentColor }} />
                <span>{task.assignee}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Flag className="w-3 h-3" style={{ color: accentColor }} />
              <span className="capitalize" style={{ color: accentColor }}>
                {task.priority}
              </span>
            </div>
            {timeStats.totalTime > 0 && (
              <div
                className="flex items-center gap-1"
                style={{ color: accentColor }}
              >
                <Clock className="w-3 h-3" />
                <span>{formatDuration(timeStats.totalTime)}</span>
                {timeStats.isActive && (
                  <motion.span
                    className="text-[#10B981]"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ●
                  </motion.span>
                )}
              </div>
            )}
          </div>

          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.labels.slice(0, 3).map((label, index) => (
                <span
                  key={index}
                  className={`px-2 py-0.5 text-xs rounded ${
                    isDark
                      ? "bg-[rgba(255,255,255,0.05)] text-[#B4B4B8]"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {label}
                </span>
              ))}
              {task.labels.length > 3 && (
                <span
                  className={`px-2 py-0.5 text-xs rounded ${
                    isDark
                      ? "bg-[rgba(255,255,255,0.05)] text-[#B4B4B8]"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  +{task.labels.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

interface DropIndicatorProps {
  beforeId: string | null;
  column: ColumnType;
}

const DropIndicator: React.FC<DropIndicatorProps> = ({ beforeId, column }) => {
  const config = COLUMN_CONFIG[column];

  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-0.5 h-1 w-full opacity-0 rounded-full transition-all duration-200"
      style={{ backgroundColor: config.color }}
    />
  );
};
