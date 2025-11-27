import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { spiderSharpHanging, witchBrew } from "@/assets";
import { Calendar } from "@/components/ui/Calendar";
import { ComboBox } from "@/components/ui/ComboBox";
import { Dropdown } from "@/components/ui/Dropdown";
import { PriorityType, TaskFormData } from "@/constants/taskConstants";
import { useTheme } from "@/contexts/ThemeContext";

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskFormData) => Promise<void>;
  isCreating: boolean;
  error?: string | null;
  defaultProject?: string;
  existingProjects?: string[];
}

export const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
  error,
  defaultProject = "",
  existingProjects = [],
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    assignee: "",
    project: defaultProject,
    labels: [],
  });

  useEffect(() => {
    if (defaultProject && isOpen) {
      setFormData((prev) => ({ ...prev, project: defaultProject }));
    }
  }, [defaultProject, isOpen]);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

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
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      await onSubmit(formData);
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        assignee: "",
        project: "",
        labels: [],
      });
      onClose();
    } catch (error) {
      /* empty */
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${
            isDark ? "bg-[rgba(10,10,11,0.8)]" : "bg-[rgba(0,0,0,0.5)]"
          }`}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`rounded-xl p-4 md:p-8 w-full max-w-4xl max-h-[90vh] flex flex-col relative overflow-hidden ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border border-[#60c9b6]/30 shadow-[0_0_15px_rgba(96,201,182,0.2)]"
                : isDark
                  ? "bg-[rgba(26,26,31,0.95)] border border-[rgba(255,255,255,0.1)]"
                  : "bg-white border border-gray-200 shadow-2xl"
            }`}
          >
            {isHalloweenMode && (
              <>
                <div className="absolute -bottom-0.5 -left-3 pointer-events-none z-0">
                  <img
                    src={witchBrew}
                    alt=""
                    className="w-32 h-32 md:w-48 md:h-48 opacity-10"
                  />
                </div>
                <div className="absolute -top-10 -right-10 pointer-events-none z-0">
                  <img
                    src={spiderSharpHanging}
                    alt=""
                    className="w-32 h-32 md:w-48 md:h-48 opacity-10"
                  />
                </div>
              </>
            )}
            <div className="flex items-center justify-between mb-3 md:mb-4 relative z-10">
              <h3
                className={`text-base md:text-lg font-semibold ${
                  isHalloweenMode
                    ? "text-[#60c9b6] font-creepster tracking-wider"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                Create New Task
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isHalloweenMode
                    ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                    : isDark
                      ? "hover:bg-[rgba(255,255,255,0.05)]"
                      : "hover:bg-gray-100"
                }`}
              >
                <X
                  className={`w-4 h-4 ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : isDark
                        ? "text-[#B4B4B8]"
                        : "text-gray-600"
                  }`}
                />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-lg">
                <p className="text-[#EF4444] text-sm">{error}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto mobile-scrollbar-hide relative z-10">
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* Title - Full Width */}
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
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-hidden ${
                      isHalloweenMode
                        ? "bg-[#1a1a1f] border border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                        : isDark
                          ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6]"
                          : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6]"
                    }`}
                    placeholder="Enter task title"
                    autoFocus
                    required
                  />
                </div>

                {/* Description - Full Width */}
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
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-hidden ${
                      isHalloweenMode
                        ? "bg-[#1a1a1f] border border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                        : isDark
                          ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6]"
                          : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6]"
                    }`}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                {/* Priority and Due Date - Top Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Dropdown
                      title="Priority"
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          priority: value as PriorityType,
                        })
                      }
                      options={[
                        { value: "low", label: "Low" },
                        { value: "medium", label: "Medium" },
                        { value: "high", label: "High" },
                      ]}
                      placeholder="Select priority"
                    />
                  </div>

                  <div>
                    <Calendar
                      label="Due Date"
                      value={formData.due_date}
                      onChange={(date) =>
                        setFormData({ ...formData, due_date: date })
                      }
                      placeholder="Select due date"
                    />
                  </div>
                </div>

                {/* Assignee and Project - Bottom Row */}
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
                      value={formData.assignee}
                      onChange={(e) =>
                        setFormData({ ...formData, assignee: e.target.value })
                      }
                      className={`w-full mt-1 rounded-lg px-3 py-2 focus:outline-hidden ${
                        isHalloweenMode
                          ? "bg-[#1a1a1f] border border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                          : isDark
                            ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6]"
                            : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6]"
                      }`}
                      placeholder="Assign to someone"
                    />
                  </div>

                  <div>
                    <ComboBox
                      title="Project"
                      value={formData.project}
                      onChange={(value) =>
                        setFormData({ ...formData, project: value })
                      }
                      options={existingProjects.map((project) => ({
                        value: project,
                        label: project,
                      }))}
                      placeholder="Type or select project name"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 pt-4 md:pt-6 border-t ${
                    isHalloweenMode
                      ? "border-[#60c9b6]/20"
                      : isDark
                        ? "border-[rgba(255,255,255,0.1)]"
                        : "border-gray-200"
                  }`}
                >
                  <div
                    className={`text-xs md:text-sm hidden md:block ${
                      isDark ? "text-[#71717A]" : "text-gray-500"
                    }`}
                  >
                    All fields are optional except title
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg transition-colors cursor-pointer text-sm ${
                        isHalloweenMode
                          ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                          : isDark
                            ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating || !formData.title.trim()}
                      className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer font-medium text-sm ${
                        isHalloweenMode
                          ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                          : "bg-[#3B82F6] text-white hover:bg-[#2563EB]"
                      }`}
                    >
                      {isCreating ? "Creating..." : "Create Task"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
