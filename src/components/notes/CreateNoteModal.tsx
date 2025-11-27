import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { catWitchHat, witchFly } from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "../ui/Button.tsx";
import { LexicalRichTextEditor } from "./lexical";

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNote: (noteData: {
    title: string;
    content: string;
    rich_content?: string;
    content_type?: "plain" | "rich";
    category?: string;
    tags?: string[];
  }) => void;
}

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  isOpen,
  onClose,
  onCreateNote,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    rich_content: "",
    category: "",
    tags: "",
  });
  const [isMouseDownInside, setIsMouseDownInside] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) return;

    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    onCreateNote({
      title: formData.title,
      content: formData.content,
      rich_content: formData.rich_content || undefined,
      content_type: formData.rich_content ? "rich" : "plain",
      category: formData.category || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });

    setFormData({
      title: "",
      content: "",
      rich_content: "",
      category: "",
      tags: "",
    });
    onClose();
  };

  const handleEditorChange = (richContent: string, plainText: string) => {
    setFormData({
      ...formData,
      content: plainText,
      rich_content: richContent,
    });
  };

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 ${isDark ? "bg-[rgba(10,10,11,0.8)]" : "bg-black/50"}`}
          style={{ margin: 0, padding: "12px" }}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.96, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
              className={`flex items-center justify-between p-3 sm:p-6 pb-3 sm:pb-4 border-b relative z-10 ${
                isHalloweenMode
                  ? "border-[#60c9b6]/20"
                  : isDark
                    ? "border-[rgba(255,255,255,0.1)]"
                    : "border-gray-200"
              }`}
            >
              <h2
                className={`text-base sm:text-xl font-semibold ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                Create New Note
              </h2>
              <button
                onClick={onClose}
                className={`p-1.5 sm:p-2 rounded-lg cursor-pointer transition-colors ${
                  isHalloweenMode
                    ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                    : isDark
                      ? "hover:bg-[rgba(255,255,255,0.05)]"
                      : "hover:bg-gray-100"
                }`}
              >
                <X
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
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
              <div className="flex-1 overflow-y-auto scrollbar-hide p-3 sm:p-6 pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                <div>
                  <label
                    className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 ${
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
                    className={`w-full rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 ${
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
                    className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 ${
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
                      onChange={handleEditorChange}
                      placeholder="Enter your note content..."
                      folderColor={isHalloweenMode ? "#60c9b6" : "#8B5CF6"}
                      autoFocus={false}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label
                      className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 ${
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
                      className={`w-full rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 ${
                        isHalloweenMode
                          ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-[#60c9b6]"
                          : isDark
                            ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6]"
                            : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6]"
                      }`}
                      placeholder="e.g., Ideas, Research"
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 ${
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
                      className={`w-full rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 ${
                        isHalloweenMode
                          ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-[#60c9b6]"
                          : isDark
                            ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6]"
                            : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6]"
                      }`}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className={`p-3 sm:p-6 pt-3 sm:pt-4 border-t ${
                  isHalloweenMode
                    ? "border-[#60c9b6]/20"
                    : isDark
                      ? "border-[rgba(255,255,255,0.1)]"
                      : "border-gray-200"
                }`}
              >
                <div className="flex justify-end space-x-2 sm:space-x-3">
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="ghost"
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm cursor-pointer ${
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
                    className={`px-4 sm:px-6 py-1.5 sm:py-2 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isHalloweenMode
                        ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                        : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
                    }`}
                    disabled={
                      !formData.title.trim() || !formData.content.trim()
                    }
                  >
                    Create Note
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
