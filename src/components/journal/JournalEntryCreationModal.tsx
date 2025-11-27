import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Folder, Sparkles, Tag, Wand2, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { batSwoop, witchTakeoff } from "@/assets";
import { Calendar } from "@/components/ui/Calendar.tsx";
import { ComboBox } from "@/components/ui/ComboBox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { useTheme } from "@/contexts/ThemeContext";
import { useSpookyAI } from "@/hooks/useSpookyAI";
import { JournalFormData, Project } from "@/types/journal";

interface JournalCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JournalFormData) => Promise<void>;
  projects: Project[];
  isCreating: boolean;
  error: string | null;
}

export const JournalEntryCreationModal: React.FC<JournalCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projects,
  isCreating,
  error,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [formData, setFormData] = useState<JournalFormData>({
    title: "",
    content: "",
    entry_date: new Date().toISOString().split("T")[0],
    project_id: "",
    mood: undefined,
    energy_level: undefined,
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const { consultSpirits, isGhostWriting, completion } = useSpookyAI();

  const handleGhostWrite = async (
    mode: "ghost" | "grammar" | "prophecy" = "ghost",
  ) => {
    if (!formData.content.trim()) return;

    const result = await consultSpirits(formData.content, mode);

    if (result) {
      setFormData((prev) => ({ ...prev, content: result }));
    }
  };

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
    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      await onSubmit(formData);

      setFormData({
        title: "",
        content: "",
        entry_date: new Date().toISOString().split("T")[0],
        project_id: "",
        mood: undefined,
        energy_level: undefined,
        tags: [],
      });
      setTagInput("");

      onClose();
    } catch (error) {
      console.error("Failed to submit daily entry:", error);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const getMoodEmoji = (mood: number) => {
    const moodEmojis = ["😞", "😕", "😐", "😊", "😄"];
    return moodEmojis[mood - 1];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-9000 ${isDark ? "bg-[rgba(10,10,11,0.8)]" : "bg-black/50"}`}
          style={{ margin: 0, padding: "16px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={modalRef}
            className={`backdrop-blur-xl rounded-xl w-full max-w-2xl max-h-[95vh] flex flex-col relative overflow-hidden ${
              isHalloweenMode
                ? "border bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
                : isDark
                  ? "bg-[rgba(30,30,30,0.95)] border border-[rgba(255,255,255,0.1)]"
                  : "bg-white border border-gray-200 shadow-2xl"
            }`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {isHalloweenMode && (
              <>
                <div className="absolute -bottom-10 -left-10 pointer-events-none z-0">
                  <img
                    src={witchTakeoff}
                    alt=""
                    className="w-48 h-48 -rotate-12 opacity-10"
                  />
                </div>
                <div className="absolute -top-10 -right-10 pointer-events-none z-0">
                  <img
                    src={batSwoop}
                    alt=""
                    className="w-48 h-48 rotate-12 opacity-10"
                  />
                </div>
              </>
            )}
            <div
              className={`flex items-center justify-between p-4 md:p-6 pb-3 md:pb-4 border-b ${isDark ? "border-[rgba(255,255,255,0.1)]" : "border-gray-200"}`}
            >
              <div className="flex items-center space-x-3">
                <h2
                  className={`text-lg md:text-xl font-semibold ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : isDark
                        ? "text-white"
                        : "text-gray-900"
                  }`}
                >
                  New Journal
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-[rgba(255,255,255,0.05)]" : "hover:bg-gray-100"}`}
              >
                <X
                  className={`w-5 h-5 ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 overflow-y-auto mobile-scrollbar-hide p-4 md:p-6 pt-3 md:pt-4 space-y-4 md:space-y-6">
                <div>
                  <Calendar
                    label="Date"
                    value={formData.entry_date}
                    onChange={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        entry_date: date,
                      }))
                    }
                    placeholder="Select entry date"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isHalloweenMode
                        ? "text-[#60c9b6]"
                        : isDark
                          ? "text-white"
                          : "text-gray-700"
                    }`}
                  >
                    Title<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="What's the main focus of today?"
                    className={`w-full px-3 py-2 rounded-lg focus:outline-hidden focus:border-[#10B981] ${
                      isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.05)] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                        : isDark
                          ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8]"
                          : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    required
                  />
                </div>

                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                    <label
                      className={`block text-sm font-medium ${
                        isHalloweenMode
                          ? "text-[#60c9b6]"
                          : isDark
                            ? "text-white"
                            : "text-gray-700"
                      }`}
                    >
                      Content<span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto pb-1 sm:pb-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => handleGhostWrite("ghost")}
                              disabled={
                                isCreating ||
                                isGhostWriting ||
                                !formData.content.trim()
                              }
                              className={`p-1 sm:p-1.5 rounded-lg transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                                isHalloweenMode
                                  ? "bg-[#60c9b6]/10 text-[#60c9b6] hover:bg-[#60c9b6]/20"
                                  : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                              } ${isGhostWriting ? "animate-pulse" : ""} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <Sparkles
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${isGhostWriting ? "animate-spin" : ""}`}
                              />
                              {isHalloweenMode ? "Summon Spirit" : "AI Rewrite"}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Rewrite with a spooky Victorian ghost persona</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => handleGhostWrite("grammar")}
                              disabled={
                                isCreating ||
                                isGhostWriting ||
                                !formData.content.trim()
                              }
                              className={`p-1 sm:p-1.5 rounded-lg transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                                isHalloweenMode
                                  ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                              {isHalloweenMode
                                ? "Grammar Ghoul"
                                : "Fix Grammar"}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Correct grammar and spelling without changing the
                              tone
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => handleGhostWrite("prophecy")}
                              disabled={
                                isCreating ||
                                isGhostWriting ||
                                !formData.content.trim()
                              }
                              className={`p-1 sm:p-1.5 rounded-lg transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                                isHalloweenMode
                                  ? "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
                                  : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <Wand2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              {isHalloweenMode ? "Dark Prophecy" : "Continue"}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Generate a cryptic prophecy based on your entry
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={isGhostWriting ? completion : formData.content}
                      onChange={(e) => {
                        if (!isGhostWriting) {
                          setFormData((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }));
                        }
                      }}
                      placeholder="Describe your day, achievements, challenges, and reflections..."
                      rows={12}
                      disabled={isGhostWriting}
                      className={`w-full px-3 py-2 rounded-lg focus:outline-hidden focus:border-[#10B981] resize-y transition-all duration-300 ${
                        isHalloweenMode
                          ? "bg-[rgba(96,201,182,0.05)] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                          : isDark
                            ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8]"
                            : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                      } ${isGhostWriting ? "animate-pulse shadow-[0_0_15px_rgba(96,201,182,0.5)] border-[#60c9b6] cursor-wait" : ""}`}
                      required
                    />
                    {isGhostWriting && (
                      <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-[#60c9b6] animate-pulse">
                        <Sparkles className="w-3 h-3 animate-spin" />
                        <span>Summoning spirits...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <ComboBox
                    title="Project (Optional)"
                    value={formData.project_id}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        project_id: value,
                      }))
                    }
                    options={projects.map((project) => ({
                      value: project.id,
                      label: project.name,
                    }))}
                    placeholder="Select a project"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isHalloweenMode
                          ? "text-[#60c9b6]"
                          : isDark
                            ? "text-white"
                            : "text-gray-700"
                      }`}
                    >
                      Mood (1-5)
                    </label>
                    <div className="flex space-x-1.5 sm:space-x-2">
                      {[1, 2, 3, 4, 5].map((mood) => (
                        <button
                          key={mood}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, mood }))
                          }
                          className={`p-1.5 sm:p-2 rounded-lg text-xl sm:text-2xl transition-colors cursor-pointer ${
                            formData.mood === mood
                              ? "bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)]"
                              : isDark
                                ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)]"
                                : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {getMoodEmoji(mood)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isHalloweenMode
                          ? "text-[#60c9b6]"
                          : isDark
                            ? "text-white"
                            : "text-gray-700"
                      }`}
                    >
                      Energy (1-5)
                    </label>
                    <div className="flex space-x-1.5 sm:space-x-2">
                      {[1, 2, 3, 4, 5].map((energy) => (
                        <button
                          key={energy}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              energy_level: energy,
                            }))
                          }
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                            formData.energy_level === energy
                              ? "bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] text-[#10B981]"
                              : isDark
                                ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.1)]"
                                : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {energy}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isHalloweenMode
                        ? "text-[#60c9b6]"
                        : isDark
                          ? "text-white"
                          : "text-gray-700"
                    }`}
                  >
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isHalloweenMode
                            ? "bg-[#60c9b6]/20 text-[#60c9b6] border border-[#60c9b6]/30"
                            : "bg-[rgba(139,92,246,0.2)] text-[#8B5CF6]"
                        }`}
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className={`ml-1 hover:text-white ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : "text-[#8B5CF6]"
                          }`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Tag
                        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-[#B4B4B8]" : "text-gray-500"}`}
                      />
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyPress}
                        placeholder="Add a tag..."
                        className={`w-full pl-10 pr-3 py-2 rounded-lg focus:outline-hidden focus:border-[#10B981] ${
                          isHalloweenMode
                            ? "bg-[rgba(96,201,182,0.05)] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                            : isDark
                              ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8]"
                              : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className={`px-4 py-2 cursor-pointer rounded-lg transition-colors ${
                        isHalloweenMode
                          ? "bg-[#60c9b6]/20 border border-[#60c9b6]/30 text-[#60c9b6] hover:bg-[#60c9b6]/30"
                          : "bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)]"
                      }`}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
              </div>

              <div
                className={`p-4 md:p-6 pt-3 md:pt-4 border-t ${isDark ? "border-[rgba(255,255,255,0.1)]" : "border-gray-200"}`}
              >
                <div className="flex justify-end space-x-2 sm:space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className={`px-3 sm:px-4 py-2 cursor-pointer transition-colors text-sm ${isDark ? "text-[#B4B4B8] hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isCreating ||
                      !formData.title.trim() ||
                      !formData.content.trim()
                    }
                    className="px-4 sm:px-6 py-2 cursor-pointer bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] rounded-lg text-[#10B981] hover:bg-[rgba(16,185,129,0.3)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isCreating ? "Saving..." : "Create Entry"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
