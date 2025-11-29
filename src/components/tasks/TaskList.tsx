import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Virtuoso } from "react-virtuoso";
import {
  batGlide,
  cardRedmoonBackyard,
  ghostGenie,
  ghostScare,
  spiderHairyCrawling,
} from "@/assets";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useTheme } from "@/contexts/ThemeContext";
import { Task } from "@/types/task";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  selectedTasks: string[];
  onSelectTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  onTaskClick: (taskId: string) => void;
  isCompact?: boolean;
  isManageMode?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedTasks,
  onSelectTask,
  onToggleTask,
  onDeleteTask,
  onTaskClick,
  isCompact = false,
  isManageMode = false,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteTask(taskToDelete.id);
      setTaskToDelete(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setTaskToDelete(null);
  };

  if (tasks.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl min-h-[400px] flex items-center justify-center p-8">
        {isHalloweenMode && (
          <>
            <div
              className="absolute inset-0 pointer-events-none opacity-5 z-0"
              style={{
                backgroundImage: `url(${cardRedmoonBackyard})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <motion.img
              src={ghostScare}
              alt=""
              className="absolute top-10 right-10 w-16 md:w-20 opacity-10 pointer-events-none z-0"
              style={{
                filter: "drop-shadow(0 0 20px rgba(96, 201, 182, 0.4))",
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.img
              src={batGlide}
              alt=""
              className="absolute bottom-10 left-10 w-16 opacity-8 pointer-events-none z-0"
              style={{
                filter: "drop-shadow(0 0 15px rgba(96, 201, 182, 0.3))",
              }}
              animate={{
                x: [0, 20, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </>
        )}
        <motion.div
          className="relative z-10 text-center max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isHalloweenMode ? (
            <motion.img
              src={ghostGenie}
              alt=""
              className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 opacity-80"
              style={{
                filter: "drop-shadow(0 0 30px rgba(96, 201, 182, 0.5))",
              }}
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ) : (
            <CheckCircle2
              className={`w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 ${
                isDark ? "text-[#71717A]" : "text-gray-300"
              }`}
            />
          )}
          <h3
            className={`text-xl md:text-2xl font-bold mb-3 ${
              isHalloweenMode
                ? "text-[#60c9b6] font-creeps ter tracking-wide"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            {isHalloweenMode ? "No Spirits Summoned Yet" : "No Tasks Found"}
          </h3>
          <p
            className={`text-sm md:text-base ${
              isHalloweenMode
                ? "text-[#60c9b6]/70"
                : isDark
                  ? "text-[#B4B4B8]"
                  : "text-gray-600"
            }`}
          >
            {isHalloweenMode
              ? "Your task realm is eerily quiet. Summon your first spirit to begin your mystical journey."
              : "No tasks match your current filters. Try adjusting your search or create a new task to get started."}
          </p>
        </motion.div>
      </div>
    );
  }

  const modalContent = (
    <ConfirmationModal
      isOpen={!!taskToDelete}
      onClose={handleDeleteCancel}
      onConfirm={handleDeleteConfirm}
      title="Delete Task"
      description="Are you sure you want to delete this task?"
      itemTitle={taskToDelete?.title}
      itemDescription={taskToDelete?.description}
      confirmText="Delete"
      type="danger"
      isLoading={isDeleting}
    />
  );

  return (
    <div className="relative overflow-hidden rounded-xl min-h-[200px]">
      {isHalloweenMode && (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-10 z-0"
            style={{
              backgroundImage: `url(${cardRedmoonBackyard})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "grayscale(100%)",
            }}
          />
          <motion.img
            src={spiderHairyCrawling}
            alt=""
            className="absolute top-4 right-4 w-12 md:w-16 opacity-20 pointer-events-none z-0"
            animate={{
              y: [0, 10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.img
            src={batGlide}
            alt=""
            className="absolute bottom-10 left-4 w-16 md:w-20 opacity-15 pointer-events-none z-0"
            animate={{
              x: [0, 20, 0],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}
      <div className="relative z-10">
        <Virtuoso
          useWindowScroll
          data={tasks}
          computeItemKey={(_, task) => task.id}
          itemContent={(index, task) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`px-4 ${
                index !== tasks.length - 1
                  ? isDark
                    ? "border-b border-[rgba(255,255,255,0.06)]"
                    : "border-b border-gray-200"
                  : ""
              }`}
            >
              <TaskItem
                task={task}
                isSelected={selectedTasks.includes(task.id)}
                onSelect={() => onSelectTask(task.id)}
                onToggle={() => onToggleTask(task.id)}
                onDelete={() => handleDeleteClick(task)}
                onClick={() => onTaskClick(task.id)}
                isCompact={isCompact}
                isManageMode={isManageMode}
              />
            </motion.div>
          )}
        />
      </div>

      {/* Render modal in portal to document.body */}
      {typeof document !== "undefined" &&
        createPortal(modalContent, document.body)}
    </div>
  );
};
