import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { catWitchHat, witchFly } from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import { Note } from "@/hooks/useNotes";
import { Button } from "../ui/Button.tsx";
import { LexicalRichTextEditor } from "./lexical";

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void;
}

export const EditNoteModal: React.FC<EditNoteModalProps> = ({
  isOpen,
  onClose,
  note,
  onUpdateNote,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    rich_content: "",
    category: "",
    tags: "",
  });

  const modalRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional to avoid resetting form data on every render
  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        rich_content: note.rich_content
          ? typeof note.rich_content === "string"
            ? note.rich_content
            : JSON.stringify(note.rich_content)
          : "",
        category: note.category || "",
        tags: note.tags.join(", "),
      });
    }
  }, [note?.id, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim() || !note) return;

    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    onUpdateNote(note.id, {
      title: formData.title,
      content: formData.content,
      rich_content: formData.rich_content || undefined,
      content_type: formData.rich_content ? "rich" : "plain",
      category: formData.category || undefined,
      tags: tags,
    });
  };

  const handleEditorChange = (richContent: string, plainText: string) => {
    setFormData({
      ...formData,
      content: plainText,
      rich_content: richContent,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && note && (
        <div
          className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 ${isDark ? "bg-[rgba(10,10,11,0.8)]" : "bg-black/50"}`}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`rounded-xl w-full max-w-4xl max-h-[95vh] flex flex-col relative overflow-hidden ${
              isHalloweenMode
                ? "bg-[rgba(96,201,182,0.15)]! border border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
                : isDark
                  ? "bg-[rgba(26,26,31,0.95)] border border-[rgba(255,255,255,0.1)]"
                  : "bg-white border border-gray-200 shadow-2xl"
            }`}
          >
            {isHalloweenMode && (
              <>
                <div className="absolute -bottom-1 -left-1 pointer-events-none z-0">
                  <img
                    src={catWitchHat}
                    alt=""
                    className="w-48 h-48 opacity-10"
                  />
                </div>
                <div className="absolute -top-2 -right-1 pointer-events-none z-0">
                  <img src={witchFly} alt="" className="w-48 h-48 opacity-10" />
                </div>
              </>
            )}

            {/* Header */}
            <div
              className={`flex items-center justify-between p-6 pb-4 border-b relative z-10 ${
                isHalloweenMode
                  ? "border-[#60c9b6]/20"
                  : isDark
                    ? "border-[rgba(255,255,255,0.1)]"
                    : "border-gray-200"
              }`}
            >
              <h2
                className={`text-xl font-semibold ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                Edit Note
              </h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg cursor-pointer transition-colors ${
                  isHalloweenMode
                    ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                    : isDark
                      ? "hover:bg-[rgba(255,255,255,0.05)]"
                      : "hover:bg-gray-100"
                }`}
              >
                <X
                  className={`w-5 h-5 ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : isDark
                        ? "text-[#B4B4B8]"
                        : "text-gray-600"
                  }`}
                />
              </button>
            </div>

            {/* Body - Scrollable */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 min-h-0 relative z-10"
            >
              <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-4">
                <div>
                  <label
                    className={`block text-sm mb-2 ${
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
                    className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      isHalloweenMode
                        ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-[#60c9b6]"
                        : isDark
                          ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6]"
                          : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6]"
                    }`}
                    placeholder="Enter note title"
                    required
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm mb-2 ${
                      isHalloweenMode
                        ? "text-[#60c9b6]"
                        : isDark
                          ? "text-[#B4B4B8]"
                          : "text-gray-700"
                    }`}
                  >
                    Content
                  </label>
                  <div
                    className={`min-h-[200px] rounded-lg border ${
                      isHalloweenMode
                        ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6]"
                        : isDark
                          ? "bg-[rgba(40,40,45,0.6)] border-[rgba(255,255,255,0.1)]"
                          : "bg-white border-gray-300"
                    }`}
                  >
                    <LexicalRichTextEditor
                      initialContent={
                        note?.rich_content
                          ? typeof note.rich_content === "string"
                            ? note.rich_content
                            : JSON.stringify(note.rich_content)
                          : note?.content
                      }
                      onChange={handleEditorChange}
                      placeholder="Enter your note content..."
                      folderColor={isHalloweenMode ? "#60c9b6" : "#8B5CF6"}
                      autoFocus={false}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm mb-2 ${
                        isHalloweenMode
                          ? "text-[#60c9b6]"
                          : isDark
                            ? "text-[#B4B4B8]"
                            : "text-gray-700"
                      }`}
                    >
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                        isHalloweenMode
                          ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-[#60c9b6]"
                          : isDark
                            ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6]"
                            : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6]"
                      }`}
                      placeholder="e.g., Ideas, Research, Personal"
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm mb-2 ${
                        isHalloweenMode
                          ? "text-[#60c9b6]"
                          : isDark
                            ? "text-[#B4B4B8]"
                            : "text-gray-700"
                      }`}
                    >
                      Tags
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                        isHalloweenMode
                          ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-[#60c9b6]"
                          : isDark
                            ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6]"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6]"
                      }`}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className={`p-6 pt-4 border-t ${
                  isHalloweenMode
                    ? "border-[#60c9b6]/20"
                    : isDark
                      ? "border-[rgba(255,255,255,0.1)]"
                      : "border-gray-200"
                }`}
              >
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="ghost"
                    className={`px-4 py-2 cursor-pointer ${
                      isHalloweenMode
                        ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                        : isDark
                          ? "text-[#B4B4B8] hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className={`px-6 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isHalloweenMode
                        ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                        : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
                    }`}
                    disabled={
                      !formData.title.trim() || !formData.content.trim()
                    }
                  >
                    Update Note
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
