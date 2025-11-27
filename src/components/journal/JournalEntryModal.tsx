import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Edit, Folder, Tag, Trash2, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { schoolhouseSteeple, treeMonsterscream } from "@/assets";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Dropdown } from "@/components/ui/Dropdown";
import { useTheme } from "@/contexts/ThemeContext";
import { Journal, JournalFormData, Project } from "@/types/journal.ts";

interface JournalModalProps {
  entry: Journal | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<JournalFormData>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  projects: Project[];
}

export const JournalEntryModal: React.FC<JournalModalProps> = ({
  entry,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  projects,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<JournalFormData>({
    title: "",
    content: "",
    entry_date: "",
    project_id: "",
    mood: undefined,
    energy_level: undefined,
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title,
        content: entry.content,
        entry_date: entry.entry_date,
        project_id: entry.project_id || "",
        mood: entry.mood || undefined,
        energy_level: entry.energy_level || undefined,
        tags: entry.tags,
      });
      setIsEditing(false);
      setTagInput("");
    }
  }, [entry]);

  // Removed global mousedown listener in favor of backdrop click

  const handleUpdate = async () => {
    if (!entry || !formData.title.trim() || !formData.content.trim()) return;

    setIsUpdating(true);
    try {
      const updateData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        entry_date: formData.entry_date,
        project_id: formData.project_id || null,
        mood: formData.mood || null,
        energy_level: formData.energy_level || null,
        tags: formData.tags,
      };

      console.log("Original entry:", entry);
      console.log("Form data:", formData);
      console.log("Update data being sent:", updateData);
      console.log("Entry ID:", entry.id);

      await onUpdate(entry.id, updateData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update entry:", error);
      console.error("Error details:", {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!entry) return;

    setIsDeleting(true);
    try {
      await onDelete(entry.id);
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Failed to delete entry:", error);
    } finally {
      setIsDeleting(false);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMoodEmoji = (mood: number) => {
    const moodEmojis = ["😞", "😕", "😐", "😊", "😄"];
    return moodEmojis[mood - 1];
  };

  return (
    <AnimatePresence>
      {isOpen && entry && (
        <motion.div
          key="journal-entry-modal-backdrop"
          className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-9000 ${isDark ? "bg-[rgba(10,10,11,0.8)]" : "bg-black/50"}`}
          style={{ margin: 0, padding: "16px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            key="journal-entry-modal-content"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className={`backdrop-blur-xl rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col relative overflow-hidden ${
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
                <div className="absolute -bottom-5 -right-5 pointer-events-none z-0">
                  <img
                    src={treeMonsterscream}
                    alt=""
                    className="w-48 h-48 rotate-12 opacity-10"
                  />
                </div>
                <div className="absolute -bottom-5 -left-5 pointer-events-none z-0">
                  <img
                    src={schoolhouseSteeple}
                    alt=""
                    className="w-48 h-48 opacity-10 scale-x-[-1]"
                  />
                </div>
              </>
            )}
            {/* Header */}
            <div
              className={`flex items-center justify-between p-6 pb-4 border-b ${isDark ? "border-[rgba(255,255,255,0.1)]" : "border-gray-200"}`}
            >
              <div className="flex items-center space-x-3">
                <div>
                  <h2
                    className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Journal Entry
                  </h2>
                  <p
                    className={`text-sm flex items-center ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(entry.entry_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!isEditing && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`p-2 rounded-lg hover:text-[#10B981] hover:bg-[#10B981]/40 transition-colors cursor-pointer ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                      title="Edit entry"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className={`p-2 rounded-lg hover:text-red-500 hover:bg-red-400/40 transition-colors cursor-pointer ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                      title="Delete entry"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${isDark ? "hover:bg-[rgba(255,255,255,0.05)]" : "hover:bg-gray-100"}`}
                >
                  <X
                    className={`w-5 h-5 ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                  />
                </button>
              </div>
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto mobile-scrollbar-hide p-4 md:p-6 pt-3 md:pt-4">
              {isEditing ? (
                <div className="space-y-6">
                  {/* Edit Form */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-700"}`}
                    >
                      Title
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
                      className={`w-full px-3 py-2 rounded-lg focus:outline-hidden focus:border-[#10B981] ${isDark ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8]" : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"}`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-700"}`}
                    >
                      Content
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      rows={8}
                      className={`w-full px-3 py-2 rounded-lg focus:outline-hidden focus:border-[#10B981] resize-none ${
                        isHalloweenMode
                          ? "bg-[rgba(96,201,182,0.05)] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                          : isDark
                            ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8]"
                            : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>

                  <div>
                    <Dropdown
                      title="Project (Optional)"
                      value={formData.project_id}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          project_id: value,
                        }))
                      }
                      placeholder="Select a project"
                      options={[
                        {
                          value: "",
                          label: "No project",
                          icon: <Folder className="w-4 h-4" />,
                        },
                        ...projects.map((project) => ({
                          value: project.id,
                          label: project.name,
                          icon: (
                            <Folder
                              className="w-4 h-4"
                              style={{ color: project.color }}
                            />
                          ),
                        })),
                      ]}
                    />
                  </div>

                  {/* Mood and Energy */}
                  <div className="grid grid-cols-2 gap-4">
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
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((mood) => (
                          <button
                            key={mood}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, mood }))
                            }
                            className={`p-2 rounded-lg text-2xl transition-colors ${
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
                      <div className="flex space-x-2">
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
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
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

                  {/* Tags */}
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
                </div>
              ) : (
                <div className="space-y-6">
                  {/* View Mode */}
                  <div>
                    <h1
                      className="text-lg md:text-2xl font-bold mb-3 md:mb-4"
                      style={{
                        color:
                          entry.project?.color || (isDark ? "#fff" : "#111827"),
                      }}
                    >
                      {entry.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6">
                      {entry.project && (
                        <span
                          className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium"
                          style={{
                            backgroundColor: `${entry.project.color}20`,
                            color: entry.project.color,
                          }}
                        >
                          <Folder className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                          {entry.project.name}
                        </span>
                      )}

                      {entry.mood && (
                        <div className="flex items-center space-x-1 md:space-x-2">
                          <span className="text-base md:text-xl">
                            {getMoodEmoji(entry.mood)}
                          </span>
                          <span
                            className={`text-xs md:text-sm ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                          >
                            {entry.mood}/5
                          </span>
                        </div>
                      )}

                      {entry.energy_level && (
                        <div className="flex items-center space-x-1 md:space-x-2">
                          <span
                            className={`text-xs md:text-sm ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                          >
                            Energy: {entry.energy_level}/5
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="prose max-w-none">
                    <div
                      className={`text-sm md:text-base whitespace-pre-wrap leading-relaxed ${isDark ? "text-[#E5E5E5]" : "text-gray-700"}`}
                    >
                      {entry.content}
                    </div>
                  </div>

                  {entry.tags.length > 0 && (
                    <div>
                      <h3
                        className={`text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              isHalloweenMode
                                ? "bg-[#60c9b6]/20 text-[#60c9b6] border border-[#60c9b6]/30"
                                : "bg-[rgba(139,92,246,0.2)] text-[#8B5CF6]"
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-xs pt-4 border-t ${isDark ? "text-[#B4B4B8] border-[rgba(255,255,255,0.1)]" : "text-gray-500 border-gray-200"}`}
                  >
                    Created: {new Date(entry.created_at).toLocaleString()}
                    {entry.updated_at !== entry.created_at && (
                      <span className="ml-4">
                        Updated: {new Date(entry.updated_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {isEditing && (
              <div
                className={`p-6 pt-4 border-t ${isDark ? "border-[rgba(255,255,255,0.1)]" : "border-gray-200"}`}
              >
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className={`px-4 py-2 cursor-pointer transition-colors ${isDark ? "text-[#B4B4B8] hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={
                      isUpdating ||
                      !formData.title.trim() ||
                      !formData.content.trim()
                    }
                    className="flex items-center space-x-2 px-6 py-2 cursor-pointer bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] rounded-lg text-[#10B981] hover:bg-[rgba(16,185,129,0.3)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isUpdating ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Confirmation Modal */}
      {deleteConfirmOpen && (
        <ConfirmationModal
          key="delete-confirmation-modal"
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Entry"
          description={
            entry
              ? `Are you sure you want to delete "${entry.title}"? This action cannot be undone.`
              : ""
          }
          confirmText="Delete Entry"
          type="danger"
          isLoading={isDeleting}
        />
      )}
    </AnimatePresence>
  );
};
