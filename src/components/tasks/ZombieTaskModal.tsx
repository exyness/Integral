import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Loader2,
  Skull,
  Sparkles,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  skullPointyEyes,
  skullRightView,
  skullStaring,
  skullTiltedLeftView,
} from "@/assets";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/contexts/ThemeContext";
import { useSpookyAI } from "@/hooks/useSpookyAI";
import { Task } from "@/types/task";

interface ZombieTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  deadTasks: Task[];
  onResurrect: (taskId: string, subtasks: string[]) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export const ZombieTaskModal: React.FC<ZombieTaskModalProps> = ({
  isOpen,
  onClose,
  deadTasks,
  onResurrect,
  onDelete,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { consultSpirits, isGhostWriting } = useSpookyAI();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setSuggestions([]);
  };

  const handleGetSuggestions = async () => {
    if (!selectedTask) return;

    const result = await consultSpirits(selectedTask.title, "resurrect");
    if (result) {
      // Parse bullet points
      const lines = result
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("-") || line.startsWith("•"))
        .map((line) => line.substring(1).trim());

      setSuggestions(lines);
    }
  };

  const handleApplyResurrection = async () => {
    if (!selectedTask || suggestions.length === 0) return;

    setIsProcessing(true);
    try {
      await onResurrect(selectedTask.id, suggestions);
      toast.success("Task resurrected successfully!");
      setSuggestions([]);
      setSelectedTask(null);
      setSelectedTask(null);
      onClose();
    } catch (error) {
      toast.error("Failed to resurrect task");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await onDelete(taskToDelete);
      toast.success("Task laid to rest.");
      if (selectedTask?.id === taskToDelete) {
        setSelectedTask(null);
        setSuggestions([]);
      }
      if (deadTasks.length === 1) {
        onClose();
      }
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
    }
  };

  const modalContent = (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Zombie Tasks Detected"
        size="lg"
        className="overflow-hidden flex flex-col relative"
        hideDecorations
      >
        {isHalloweenMode && (
          <>
            <div className="absolute -bottom-10 -left-10 pointer-events-none z-0 opacity-10">
              <img
                src={skullRightView}
                alt=""
                className="w-48 h-48 rotate-12"
              />
            </div>
            <div className="absolute -top-10 -right-10 pointer-events-none z-0 opacity-10">
              <img src={skullTiltedLeftView} alt="" className="w-48 h-48" />
            </div>
          </>
        )}

        {/* Content */}
        {deadTasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative z-10">
            <div className="mb-6 relative">
              <motion.img
                src={skullStaring}
                alt="No Zombies"
                className="w-32 h-32 opacity-50"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {isHalloweenMode && (
                <motion.div
                  className="absolute inset-0 bg-[#60c9b6] blur-3xl opacity-20 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              )}
            </div>
            <h3
              className={`text-xl font-bold mb-2 ${isHalloweenMode ? "text-[#60c9b6]" : isDark ? "text-white" : "text-gray-900"}`}
            >
              The Graveyard is Quiet...
            </h3>
            <p
              className={`max-w-md ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              No zombie tasks detected! Your productivity is alive and well.
              Come back when you have tasks older than 7 days.
            </p>
            <button
              onClick={onClose}
              className={`mt-6 px-6 py-2 rounded-lg font-medium transition-colors ${
                isHalloweenMode
                  ? "bg-[#60c9b6]/20 text-[#60c9b6] hover:bg-[#60c9b6]/30"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white"
              }`}
            >
              Rest in Peace
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative z-10">
            {/* Task List */}
            <div
              className={`w-full md:w-1/3 overflow-y-auto border-b md:border-b-0 md:border-r ${isHalloweenMode ? "border-[#60c9b6]/10" : isDark ? "border-gray-800" : "border-gray-100"}`}
            >
              <div className="p-2 space-y-1">
                {deadTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleTaskSelect(task)}
                    className={`w-full text-left py-2 px-2 rounded-lg text-sm transition-colors flex items-center justify-between group cursor-pointer ${
                      selectedTask?.id === task.id
                        ? isHalloweenMode
                          ? "bg-[#60c9b6]/10 text-[#60c9b6]"
                          : "bg-gray-100 dark:bg-gray-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-[#60c9b6]"
                    }`}
                  >
                    <span className="truncate font-medium">{task.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(task.id);
                      }}
                      className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all cursor-pointer ${
                        isHalloweenMode
                          ? "hover:bg-red-500/20 hover:text-red-400 text-red-400/70"
                          : "hover:bg-red-100 hover:text-red-600 text-red-500/70"
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedTask ? (
                <div className="space-y-6">
                  <div>
                    <h3
                      className={`text-lg font-medium mb-2 ${
                        isHalloweenMode
                          ? "text-[#60c9b6]"
                          : isDark
                            ? "text-white"
                            : "text-gray-900"
                      }`}
                    >
                      {selectedTask.title}
                    </h3>
                    <p
                      className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Created on{" "}
                      {new Date(selectedTask.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {suggestions.length > 0 ? (
                    <div className="space-y-4">
                      <div
                        className={`p-4 rounded-lg border ${
                          isHalloweenMode
                            ? "bg-[#60c9b6]/5 border-[#60c9b6]/20"
                            : "bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800"
                        }`}
                      >
                        <h4
                          className={`text-sm font-medium mb-3 flex items-center gap-2 ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : "text-blue-700 dark:text-blue-400"
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                          Resurrection Plan
                        </h4>
                        <ul className="space-y-2">
                          {suggestions.map((suggestion, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm opacity-90"
                            >
                              <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={handleApplyResurrection}
                        disabled={isProcessing}
                        className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                          isHalloweenMode
                            ? "bg-[#60c9b6] text-[#1a1a1f] hover:bg-[#4db8a5]"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Apply Resurrection Plan
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500 mb-4">
                        This task has been stagnant. Shall we ask the spirits
                        how to break it down?
                      </p>
                      <button
                        onClick={handleGetSuggestions}
                        disabled={isGhostWriting}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                          isHalloweenMode
                            ? "bg-[#60c9b6]/10 text-[#60c9b6] border border-[#60c9b6]/20 hover:bg-[#60c9b6]/20"
                            : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white"
                        }`}
                      >
                        {isGhostWriting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Consulting Spirits...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Consult Necromancer
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-6">
                  <div className="max-w-xs">
                    {isHalloweenMode ? (
                      <img
                        src={skullPointyEyes}
                        alt=""
                        className="w-24 h-24 mx-auto mb-4 opacity-30"
                      />
                    ) : (
                      <Skull
                        className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-gray-700" : "text-gray-300"}`}
                      />
                    )}
                    <p className="text-gray-500">
                      Select a dead task from the list to attempt resurrection.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {deleteConfirmOpen && (
        <ConfirmationModal
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Lay to Rest?"
          description="Are you sure you want to permanently delete this task? It cannot be resurrected once it's gone."
          confirmText="Lay to Rest"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};
