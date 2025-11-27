import { AnimatePresence, motion } from "framer-motion";
import { Folder, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { catWitchHat, spiderSharpHanging } from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useCreateProject,
  useUpdateProject,
} from "@/hooks/queries/useProjectsQuery";
import { Project, ProjectFormData } from "@/types/journal.ts";

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

export const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    color: "#8B5CF6",
  });
  const [isMouseDownInside, setIsMouseDownInside] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();

  const predefinedColors = [
    "#10B981",
    "#8B5CF6",
    "#F59E0B",
    "#EF4444",
    "#3B82F6",
    "#EC4899",
    "#F97316",
    "#84CC16",
    "#06B6D4",
    "#8B5A2B",
  ];

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        color: project.color,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        color: "#8B5CF6",
      });
    }
  }, [project]);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (modalRef.current && modalRef.current.contains(event.target as Node)) {
        setIsMouseDownInside(true);
      } else {
        setIsMouseDownInside(false);
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (
        !isMouseDownInside &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
      setIsMouseDownInside(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isOpen, onClose, isMouseDownInside]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (project) {
        await updateProjectMutation.mutateAsync({
          id: project.id,
          updates: formData,
        });
      } else {
        await createProjectMutation.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save project:", error);
    }
  };

  const isLoading =
    createProjectMutation.isPending || updateProjectMutation.isPending;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 ${isDark ? "bg-[rgba(10,10,11,0.8)]" : "bg-black/50"}`}
          style={{ margin: 0, padding: "16px" }}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`rounded-xl px-3 py-3 md:p-6 w-full max-w-md mx-2 md:mx-4 mobile-scrollbar-hide relative overflow-hidden ${
              isHalloweenMode
                ? "border bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
                : isDark
                  ? "bg-[rgba(26,26,31,0.95)] border border-[rgba(255,255,255,0.1)]"
                  : "bg-white border border-gray-200 shadow-2xl"
            }`}
          >
            {isHalloweenMode && (
              <>
                <div className="absolute -bottom-10 -left-10 pointer-events-none z-0">
                  <img
                    src={catWitchHat}
                    alt=""
                    className="w-48 h-48 -rotate-12 opacity-10"
                  />
                </div>
                <div className="absolute -top-10 -right-10 pointer-events-none z-0">
                  <img
                    src={spiderSharpHanging}
                    alt=""
                    className="w-48 h-48 rotate-12 opacity-10"
                  />
                </div>
              </>
            )}
            {/* Header */}
            <div className="flex items-center justify-between mb-3 md:mb-6">
              <h2
                className={`text-lg md:text-xl font-semibold ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                {project ? "Edit Project" : "Create New Project"}
              </h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-[rgba(255,255,255,0.05)]" : "hover:bg-gray-100"}`}
              >
                <X
                  className={`w-5 h-5 ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Project Name */}
              <div>
                <label
                  className={`block text-xs md:text-sm mb-1.5 md:mb-2 ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : isDark
                        ? "text-[#B4B4B8]"
                        : "text-gray-600"
                  }`}
                >
                  Project Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full rounded-lg px-3 py-2 focus:border-[#8B5CF6] focus:outline-hidden transition-colors ${
                    isHalloweenMode
                      ? "bg-[rgba(96,201,182,0.05)] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                      : isDark
                        ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A]"
                        : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Enter project name"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label
                  className={`block text-xs md:text-sm mb-1.5 md:mb-2 ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : isDark
                        ? "text-[#B4B4B8]"
                        : "text-gray-600"
                  }`}
                >
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`w-full rounded-lg px-3 py-2 focus:border-[#8B5CF6] focus:outline-hidden resize-none transition-colors ${
                    isHalloweenMode
                      ? "bg-[rgba(96,201,182,0.05)] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                      : isDark
                        ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A]"
                        : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>

              {/* Color Selection */}
              <div>
                <label
                  className={`block text-xs md:text-sm mb-2 md:mb-3 ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : isDark
                        ? "text-[#B4B4B8]"
                        : "text-gray-600"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>Project Color</span>
                  </div>
                </label>
                <div className="grid grid-cols-5 gap-2 md:gap-3">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        formData.color === color
                          ? `${isDark ? "border-white" : "border-gray-800"} scale-110 shadow-lg`
                          : `border-transparent hover:scale-105 ${isDark ? "hover:border-[rgba(255,255,255,0.3)]" : "hover:border-gray-400"}`
                      }`}
                      style={{
                        backgroundColor: color,
                        boxShadow:
                          formData.color === color
                            ? `0 4px 20px ${color}40`
                            : undefined,
                      }}
                      title={color}
                    />
                  ))}
                </div>
                {/* Preview */}
                <div
                  className="mt-3 md:mt-4 p-2 md:p-3 rounded-lg border"
                  style={{
                    backgroundColor: `${formData.color}15`,
                    borderColor: `${formData.color}30`,
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Folder
                      className="w-3 h-3 md:w-4 md:h-4"
                      style={{ color: formData.color }}
                    />
                    <span
                      className={`text-xs md:text-sm font-medium ${!formData.name && (isDark ? "text-[#71717A]" : "text-gray-500")}`}
                      style={{
                        color: formData.name ? formData.color : undefined,
                      }}
                    >
                      {formData.name || "Project Name Preview"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 md:space-x-3 pt-2 md:pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 px-3 md:px-4 py-2 text-sm md:text-base cursor-pointer rounded-lg transition-colors ${
                    isHalloweenMode
                      ? "bg-[#60c9b6]/10 text-[#60c9b6] hover:bg-[#60c9b6]/20"
                      : isDark
                        ? "bg-[rgba(255,255,255,0.1)] text-[#B4B4B8] hover:bg-[rgba(255,255,255,0.15)]"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.name.trim()}
                  className={`flex-1 cursor-pointer px-3 md:px-4 py-2 text-sm md:text-base rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                    isHalloweenMode
                      ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                      : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
                  }`}
                >
                  <span>
                    {isLoading ? "Saving..." : project ? "Update" : "Create"}
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
