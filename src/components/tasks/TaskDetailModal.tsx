import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Calendar as CalendarIcon,
  CheckCircle,
  Circle,
  Clock,
  Edit3,
  Flag,
  Folder,
  Timer,
  Trash2,
  User,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { batSwoop, ghostScare } from "@/assets";
import { Calendar } from "@/components/ui/Calendar.tsx";
import { ComboBox } from "@/components/ui/ComboBox";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Dropdown } from "@/components/ui/Dropdown";
import { useTheme } from "@/contexts/ThemeContext";
import { useTimeCalculations } from "@/hooks/tasks/useTimeCalculations";
import { Task } from "@/types/task";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onToggleComplete: (taskId: string) => Promise<void>;
  existingProjects?: string[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onToggleComplete,
  existingProjects = [],
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    due_date: "",
    assignee: "",
    project: "",
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const { isDark, isHalloweenMode } = useTheme();

  const {
    getTaskTimeStats,
    getProjectTimeStats,
    getTaskTimeEntries,
    formatDuration,
  } = useTimeCalculations(task ? [task] : []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (showDeleteConfirm) return;

      const isDatePickerDropdown = target.closest(
        '[data-datepicker-dropdown="true"]',
      );

      if (
        modalRef.current &&
        !modalRef.current.contains(target) &&
        !isDatePickerDropdown
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
  }, [isOpen, onClose, showDeleteConfirm]);

  const getPriorityColor = useCallback((priority: string) => {
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
  }, []);

  const handleSave = useCallback(async () => {
    if (!task) return;
    try {
      await onUpdate(task.id, editForm);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  }, [task, editForm, onUpdate]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!task) return;
    setIsDeleting(true);
    try {
      await onDelete(task.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [task, onDelete, onClose]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const isOverdue = React.useMemo(() => {
    return (
      task?.due_date && !task?.completed && new Date(task.due_date) < new Date()
    );
  }, [task?.due_date, task?.completed]);

  useEffect(() => {
    if (task) {
      setEditForm({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        due_date: task.due_date || "",
        assignee: task.assignee || "",
        project: task.project || "",
      });

      setIsEditing(false);
    }
  }, [task]);

  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4 ${isDark ? "bg-[rgba(10,10,11,0.8)]" : "bg-black/50"}`}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border border-[#60c9b6]/30 shadow-[0_0_15px_rgba(96,201,182,0.2)]"
                : isDark
                  ? "bg-[rgba(26,26,31,0.95)] border border-[rgba(255,255,255,0.1)]"
                  : "bg-white border border-gray-200 shadow-2xl"
            }`}
          >
            {isHalloweenMode && (
              <>
                <div className="absolute -bottom-5 -right-1 pointer-events-none z-0">
                  <img
                    src={ghostScare}
                    alt=""
                    className="w-32 h-32 md:w-48 md:h-48 opacity-10"
                  />
                </div>
                <div className="absolute -top-10 -left-1 pointer-events-none z-0">
                  <img
                    src={batSwoop}
                    alt=""
                    className="w-32 h-32 md:w-48 md:h-48 opacity-10"
                  />
                </div>
              </>
            )}
            <div
              className={`flex items-center justify-between p-4 md:p-6 shrink-0 relative z-10 ${
                isHalloweenMode
                  ? "border-b border-[#60c9b6]/20"
                  : isDark
                    ? "border-b border-[rgba(255,255,255,0.1)]"
                    : "border-b border-gray-200"
              }`}
            >
              <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                <button
                  onClick={() => onToggleComplete(task.id)}
                  className="shrink-0 cursor-pointer"
                >
                  {task.completed ? (
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-[#10B981]" />
                  ) : (
                    <Circle
                      className={`w-5 h-5 md:w-6 md:h-6 transition-colors ${isDark ? "text-[#71717A] hover:text-[#B4B4B8]" : "text-gray-400 hover:text-gray-600"}`}
                    />
                  )}
                </button>

                <div
                  className="w-1 h-6 md:h-8 rounded-full shrink-0"
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                />

                <div className="min-w-0">
                  <h2
                    className={`text-base md:text-xl font-bold truncate ${
                      task.completed
                        ? `${
                            isHalloweenMode
                              ? "text-[#60c9b6]/50"
                              : isDark
                                ? "text-[#71717A]"
                                : "text-gray-400"
                          } line-through`
                        : `${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : isDark
                                ? "text-white"
                                : "text-gray-900"
                          }`
                    }`}
                  >
                    {task.title}
                  </h2>
                  {task.project && (
                    <span
                      className={`inline-flex items-center gap-x-1.5 md:gap-x-2 px-2 py-0.5 md:py-1 text-[10px] md:text-xs rounded mt-1 ${
                        isHalloweenMode
                          ? "bg-[#60c9b6]/10 text-[#60c9b6]"
                          : isDark
                            ? "bg-[rgba(139,92,246,0.2)] text-[#A855F7]"
                            : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      <Folder className="w-3 h-3 md:w-4 md:h-4" />
                      {task.project}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 md:space-x-2 shrink-0">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer ${
                    isHalloweenMode
                      ? "hover:bg-[#60c9b6]/10 text-[#60c9b6]"
                      : isDark
                        ? "hover:bg-[rgba(255,255,255,0.05)]"
                        : "hover:bg-gray-100"
                  }`}
                >
                  <Edit3
                    className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                      isHalloweenMode
                        ? "text-[#60c9b6]"
                        : isDark
                          ? "text-[#B4B4B8]"
                          : "text-gray-600"
                    }`}
                  />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className={`p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer ${
                    isHalloweenMode
                      ? "hover:bg-[#EF4444]/10"
                      : isDark
                        ? "hover:bg-[rgba(255,255,255,0.05)]"
                        : "hover:bg-gray-100"
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#EF4444]" />
                </button>
                <button
                  onClick={onClose}
                  className={`p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer ${
                    isHalloweenMode
                      ? "hover:bg-[#60c9b6]/10 text-[#60c9b6]"
                      : isDark
                        ? "hover:bg-[rgba(255,255,255,0.05)]"
                        : "hover:bg-gray-100"
                  }`}
                >
                  <X
                    className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                      isHalloweenMode
                        ? "text-[#60c9b6]"
                        : isDark
                          ? "text-[#B4B4B8]"
                          : "text-gray-600"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto grow scrollbar-hide relative z-10">
              {isEditing ? (
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label
                      className={`block text-xs md:text-sm mb-1.5 md:mb-2 ${isDark ? "text-[#B4B4B8]" : "text-gray-700"}`}
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-hidden ${
                        isHalloweenMode
                          ? "bg-[#1a1a1f] border border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                          : isDark
                            ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white focus:border-[#8B5CF6]"
                            : "bg-white border border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs md:text-sm mb-1.5 md:mb-2 ${isDark ? "text-[#B4B4B8]" : "text-gray-700"}`}
                    >
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-hidden scrollbar-hide ${
                        isHalloweenMode
                          ? "bg-[#1a1a1f] border border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                          : isDark
                            ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white focus:border-[#8B5CF6]"
                            : "bg-white border border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>

                  <div>
                    <Calendar
                      label="Due Date"
                      value={editForm.due_date}
                      onChange={(date) =>
                        setEditForm((prev) => ({
                          ...prev,
                          due_date: date,
                        }))
                      }
                      placeholder="Select due date"
                    />
                  </div>

                  <div>
                    <Dropdown
                      title="Priority"
                      value={editForm.priority}
                      onValueChange={(value) =>
                        setEditForm((prev) => ({
                          ...prev,
                          priority: value as "low" | "medium" | "high",
                        }))
                      }
                      placeholder="Select priority"
                      options={[
                        { value: "low", label: "Low" },
                        { value: "medium", label: "Medium" },
                        { value: "high", label: "High" },
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-xs md:text-sm mb-1.5 md:mb-2 ${
                          isHalloweenMode
                            ? "text-[#60c9b6]"
                            : isDark
                              ? "text-[#B4B4B8]"
                              : "text-gray-700"
                        }`}
                      >
                        Assignee
                      </label>
                      <input
                        type="text"
                        value={editForm.assignee}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            assignee: e.target.value,
                          }))
                        }
                        className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-hidden ${
                          isHalloweenMode
                            ? "bg-[#1a1a1f] border border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                            : isDark
                              ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white focus:border-[#8B5CF6]"
                              : "bg-white border border-gray-300 text-gray-900"
                        }`}
                      />
                    </div>

                    <div>
                      <ComboBox
                        title="Project"
                        value={editForm.project}
                        onChange={(value) =>
                          setEditForm((prev) => ({
                            ...prev,
                            project: value,
                          }))
                        }
                        options={existingProjects.map((project) => ({
                          value: project,
                          label: project,
                        }))}
                        placeholder="Type or select project name"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={handleSave}
                      className={`px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm ${
                        isHalloweenMode
                          ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                          : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
                      }`}
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className={`px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm ${
                        isHalloweenMode
                          ? "bg-[#60c9b6]/10 text-[#60c9b6] hover:bg-[#60c9b6]/20"
                          : isDark
                            ? "bg-[rgba(255,255,255,0.1)] text-[#B4B4B8] hover:bg-[rgba(255,255,255,0.15)]"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6">
                  {task.description && (
                    <div>
                      <h3
                        className={`text-sm md:text-base font-medium mb-1.5 md:mb-2 ${
                          isHalloweenMode
                            ? "text-[#60c9b6]"
                            : isDark
                              ? "text-white"
                              : "text-gray-900"
                        }`}
                      >
                        Description
                      </h3>
                      <p
                        className={`text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                          isHalloweenMode
                            ? "text-[#60c9b6]/80"
                            : isDark
                              ? "text-[#B4B4B8]"
                              : "text-gray-600"
                        }`}
                      >
                        {task.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-3 md:space-y-4">
                      {task.due_date && (
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <CalendarIcon
                            className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                              isHalloweenMode
                                ? "text-[#60c9b6]"
                                : isDark
                                  ? "text-[#B4B4B8]"
                                  : "text-gray-500"
                            }`}
                          />
                          <span
                            className={`text-xs md:text-sm ${
                              isDark ? "text-[#B4B4B8]" : "text-gray-600"
                            }`}
                          >
                            Due Date:
                          </span>
                          <span
                            className={`text-xs md:text-sm ${
                              isOverdue
                                ? "text-[#EF4444]"
                                : `${
                                    isHalloweenMode
                                      ? "text-[#60c9b6]"
                                      : isDark
                                        ? "text-white"
                                        : "text-gray-900"
                                  }`
                            }`}
                          >
                            {formatDate(task.due_date)}
                            {isOverdue && " (Overdue)"}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 md:space-x-3">
                        <Flag
                          className="w-3.5 h-3.5 md:w-4 md:h-4"
                          style={{ color: getPriorityColor(task.priority) }}
                        />
                        <span
                          className={`text-xs md:text-sm ${
                            isDark ? "text-[#B4B4B8]" : "text-gray-600"
                          }`}
                        >
                          Priority:
                        </span>
                        <span
                          className={`capitalize text-xs md:text-sm ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : isDark
                                ? "text-white"
                                : "text-gray-900"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {task.assignee && (
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <User
                            className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                              isHalloweenMode
                                ? "text-[#60c9b6]"
                                : isDark
                                  ? "text-[#B4B4B8]"
                                  : "text-gray-500"
                            }`}
                          />
                          <span
                            className={`text-xs md:text-sm ${
                              isDark ? "text-[#B4B4B8]" : "text-gray-600"
                            }`}
                          >
                            Assignee:
                          </span>
                          <span
                            className={`text-xs md:text-sm ${
                              isHalloweenMode
                                ? "text-[#60c9b6]"
                                : isDark
                                  ? "text-white"
                                  : "text-gray-900"
                            }`}
                          >
                            {task.assignee}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 md:space-x-3">
                        <Clock
                          className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : isDark
                                ? "text-[#B4B4B8]"
                                : "text-gray-500"
                          }`}
                        />
                        <span
                          className={`text-xs md:text-sm ${
                            isDark ? "text-[#B4B4B8]" : "text-gray-600"
                          }`}
                        >
                          Created:
                        </span>
                        <span
                          className={`text-xs md:text-sm ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : isDark
                                ? "text-white"
                                : "text-gray-900"
                          }`}
                        >
                          {formatDate(task.created_at)}
                        </span>
                      </div>

                      {task.completed && task.completion_date && (
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#10B981]" />
                          <span className="text-xs md:text-sm text-[#B4B4B8]">
                            Completed:
                          </span>
                          <span className="text-xs md:text-sm text-[#10B981]">
                            {formatDate(task.completion_date)}
                          </span>
                        </div>
                      )}

                      {task.completed && task.total_time_seconds && (
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#8B5CF6]" />
                          <span className="text-xs md:text-sm text-[#B4B4B8]">
                            Time Spent:
                          </span>
                          <span className="text-xs md:text-sm text-[#8B5CF6]">
                            {formatDuration(task.total_time_seconds)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 md:space-y-4">
                      <h4
                        className={`text-sm md:text-base font-medium flex items-center space-x-2 ${
                          isHalloweenMode
                            ? "text-[#60c9b6]"
                            : isDark
                              ? "text-white"
                              : "text-gray-900"
                        }`}
                      >
                        <Timer
                          className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : "text-[#8B5CF6]"
                          }`}
                        />
                        <span>Time Tracking</span>
                      </h4>

                      {(() => {
                        const timeStats = getTaskTimeStats(task.id);
                        const timeEntries = getTaskTimeEntries(task.id);
                        const projectStats = task.project
                          ? getProjectTimeStats(task.project)
                          : null;

                        return (
                          <div className="space-y-2 md:space-y-3">
                            <div className="grid grid-cols-2 gap-2 md:gap-4">
                              <div
                                className={`rounded-lg p-2 md:p-3 border ${
                                  isHalloweenMode
                                    ? "bg-[#60c9b6]/10 border-[#60c9b6]/30"
                                    : "bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.2)]"
                                }`}
                              >
                                <div className="flex items-center space-x-1.5 md:space-x-2 mb-1">
                                  <Clock
                                    className={`w-2.5 h-2.5 md:w-3 md:h-3 ${
                                      isHalloweenMode
                                        ? "text-[#60c9b6]"
                                        : "text-[#8B5CF6]"
                                    }`}
                                  />
                                  <span
                                    className={`text-[10px] md:text-xs ${
                                      isHalloweenMode
                                        ? "text-[#60c9b6]/70"
                                        : "text-[#B4B4B8]"
                                    }`}
                                  >
                                    Total Time
                                  </span>
                                </div>
                                <p
                                  className={`text-sm md:text-lg font-bold ${
                                    isHalloweenMode
                                      ? "text-[#60c9b6] font-creepster tracking-wide"
                                      : "text-[#8B5CF6]"
                                  }`}
                                >
                                  {formatDuration(timeStats.totalTime)}
                                </p>
                              </div>

                              <div
                                className={`rounded-lg p-2 md:p-3 border ${
                                  isHalloweenMode
                                    ? "bg-[#60c9b6]/10 border-[#60c9b6]/30"
                                    : "bg-[rgba(59,130,246,0.1)] border-[rgba(59,130,246,0.2)]"
                                }`}
                              >
                                <div className="flex items-center space-x-1.5 md:space-x-2 mb-1">
                                  <Activity
                                    className={`w-2.5 h-2.5 md:w-3 md:h-3 ${
                                      isHalloweenMode
                                        ? "text-[#60c9b6]"
                                        : "text-[#3B82F6]"
                                    }`}
                                  />
                                  <span
                                    className={`text-[10px] md:text-xs ${
                                      isHalloweenMode
                                        ? "text-[#60c9b6]/70"
                                        : "text-[#B4B4B8]"
                                    }`}
                                  >
                                    Sessions
                                  </span>
                                </div>
                                <p
                                  className={`text-sm md:text-lg font-bold ${
                                    isHalloweenMode
                                      ? "text-[#60c9b6] font-creepster tracking-wide"
                                      : "text-[#3B82F6]"
                                  }`}
                                >
                                  {timeStats.sessionCount}
                                </p>
                              </div>
                            </div>

                            {timeStats.sessionCount > 0 && (
                              <div className="grid grid-cols-2 gap-2 md:gap-4">
                                <div
                                  className={`rounded-lg p-2 md:p-3 border ${
                                    isHalloweenMode
                                      ? "bg-[#60c9b6]/10 border-[#60c9b6]/30"
                                      : "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)]"
                                  }`}
                                >
                                  <div className="flex items-center space-x-1.5 md:space-x-2 mb-1">
                                    <BarChart3
                                      className={`w-2.5 h-2.5 md:w-3 md:h-3 ${
                                        isHalloweenMode
                                          ? "text-[#60c9b6]"
                                          : "text-[#10B981]"
                                      }`}
                                    />
                                    <span
                                      className={`text-[10px] md:text-xs ${
                                        isHalloweenMode
                                          ? "text-[#60c9b6]/70"
                                          : "text-[#B4B4B8]"
                                      }`}
                                    >
                                      Avg Session
                                    </span>
                                  </div>
                                  <p
                                    className={`text-sm md:text-lg font-bold ${
                                      isHalloweenMode
                                        ? "text-[#60c9b6] font-creepster tracking-wide"
                                        : "text-[#10B981]"
                                    }`}
                                  >
                                    {formatDuration(
                                      Math.round(timeStats.averageSession),
                                    )}
                                  </p>
                                </div>

                                <div
                                  className={`rounded-lg p-2 md:p-3 border ${
                                    isHalloweenMode
                                      ? "bg-[#60c9b6]/10 border-[#60c9b6]/30"
                                      : "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)]"
                                  }`}
                                >
                                  <div className="flex items-center space-x-1.5 md:space-x-2 mb-1">
                                    <Timer
                                      className={`w-2.5 h-2.5 md:w-3 md:h-3 ${
                                        isHalloweenMode
                                          ? "text-[#60c9b6]"
                                          : "text-[#F59E0B]"
                                      }`}
                                    />
                                    <span
                                      className={`text-[10px] md:text-xs ${
                                        isHalloweenMode
                                          ? "text-[#60c9b6]/70"
                                          : "text-[#B4B4B8]"
                                      }`}
                                    >
                                      Status
                                    </span>
                                  </div>
                                  <p
                                    className={`text-xs md:text-sm font-medium ${
                                      isHalloweenMode
                                        ? "text-[#60c9b6] font-creepster tracking-wide"
                                        : "text-[#F59E0B]"
                                    }`}
                                  >
                                    {timeStats.isActive
                                      ? "● Active"
                                      : "Inactive"}
                                  </p>
                                </div>
                              </div>
                            )}

                            {timeStats.lastWorked && (
                              <div className="flex items-center space-x-2 md:space-x-3 text-xs md:text-sm">
                                <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#71717A]" />
                                <span className="text-[#B4B4B8]">
                                  Last worked:
                                </span>
                                <span className="text-white">
                                  {new Date(
                                    timeStats.lastWorked,
                                  ).toLocaleDateString()}{" "}
                                  at{" "}
                                  {new Date(
                                    timeStats.lastWorked,
                                  ).toLocaleTimeString()}
                                </span>
                              </div>
                            )}

                            {task.project && projectStats && (
                              <div className="border-t border-[rgba(255,255,255,0.1)] pt-2 md:pt-3 mt-2 md:mt-3">
                                <h5 className="text-xs md:text-sm font-medium text-[#B4B4B8] mb-1.5 md:mb-2">
                                  Project: {task.project}
                                </h5>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs md:text-sm">
                                  <span className="text-[#71717A]">
                                    Total project time:{" "}
                                    <span className="text-[#8B5CF6] font-medium">
                                      {formatDuration(projectStats.totalTime)}
                                    </span>
                                  </span>
                                  <span className="text-[#71717A]">
                                    Sessions:{" "}
                                    <span className="text-[#3B82F6] font-medium">
                                      {projectStats.sessionCount}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            )}

                            {timeEntries.length > 0 && (
                              <div className="border-t border-[rgba(255,255,255,0.1)] pt-2 md:pt-3 mt-2 md:mt-3">
                                <h5 className="text-xs md:text-sm font-medium text-[#B4B4B8] mb-1.5 md:mb-2">
                                  Recent Sessions ({timeEntries.length})
                                </h5>
                                <div className="space-y-1.5 md:space-y-2 max-h-32 overflow-y-auto scrollbar-hide">
                                  {timeEntries.slice(0, 5).map((entry) => (
                                    <div
                                      key={entry.id}
                                      className="flex items-center justify-between text-[10px] md:text-xs bg-[rgba(255,255,255,0.02)] rounded p-1.5 md:p-2"
                                    >
                                      <div className="flex items-center space-x-1.5 md:space-x-2 min-w-0">
                                        {entry.is_running ? (
                                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#10B981] rounded-full animate-pulse shrink-0" />
                                        ) : (
                                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#71717A] rounded-full shrink-0" />
                                        )}
                                        <span className="text-[#B4B4B8] truncate">
                                          {new Date(
                                            entry.start_time,
                                          ).toLocaleDateString()}
                                        </span>
                                        {entry.description && (
                                          <span className="text-[#71717A] truncate">
                                            - {entry.description}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-white font-mono text-[10px] md:text-xs shrink-0 ml-2">
                                        {entry.is_running
                                          ? formatDuration(
                                              Math.floor(
                                                (Date.now() -
                                                  new Date(
                                                    entry.start_time,
                                                  ).getTime()) /
                                                  1000,
                                              ),
                                            )
                                          : formatDuration(
                                              entry.duration_seconds || 0,
                                            )}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {timeStats.totalTime === 0 && (
                              <div className="text-center py-3 md:py-4 text-[#71717A]">
                                <Timer className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1.5 md:mb-2 opacity-50" />
                                <p className="text-xs md:text-sm">
                                  No time tracked for this task yet.
                                </p>
                                <p className="text-[10px] md:text-xs mt-1">
                                  Use the Time Tracker tab to start tracking
                                  time.
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <ConfirmationModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDeleteConfirm}
            title="Delete Task"
            description="Are you sure you want to delete this task?"
            itemTitle={task?.title}
            itemDescription={task?.description}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
            isLoading={isDeleting}
          />
        </div>
      )}
    </AnimatePresence>
  );
};
