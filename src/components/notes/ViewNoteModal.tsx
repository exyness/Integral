import { AnimatePresence, motion } from "framer-motion";
import { Copy, Edit, Trash2, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { churchGothic, witchBrew } from "@/assets";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useTheme } from "@/contexts/ThemeContext";
import { Note } from "@/hooks/useNotes";
import { Button } from "../ui/Button.tsx";
import { RichTextRenderer } from "./lexical";

interface ViewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => Promise<void>;
}

export const ViewNoteModal: React.FC<ViewNoteModalProps> = ({
  isOpen,
  onClose,
  note,
  onEdit,
  onDelete,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDeleteConfirm) return;

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
  }, [isOpen, onClose, showDeleteConfirm]);

  const handleCopy = () => {
    if (note) {
      navigator.clipboard.writeText(note.content);
      toast.success("Note content copied to clipboard");
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!note) return;
    setIsDeleting(true);
    try {
      await onDelete(note.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error("Failed to delete note:", error);
    } finally {
      setIsDeleting(false);
    }
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
            className={`rounded-xl w-full max-w-4xl max-h-[95vh] flex flex-col mx-3 sm:mx-0 relative overflow-hidden ${
              isHalloweenMode
                ? "bg-[rgba(96,201,182,0.15)]! border border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
                : isDark
                  ? "bg-[rgba(26,26,31,0.95)] border border-[rgba(255,255,255,0.1)]"
                  : "bg-white border border-gray-200 shadow-2xl"
            }`}
          >
            {isHalloweenMode && (
              <>
                <div className="absolute -bottom-5 -left-5 pointer-events-none z-0">
                  <img
                    src={churchGothic}
                    alt=""
                    className="w-48 h-48 -rotate-12 opacity-10"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-1 pointer-events-none z-0">
                  <img
                    src={witchBrew}
                    alt=""
                    className="w-48 h-48 opacity-10"
                  />
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
                className={`text-base sm:text-xl font-semibold flex-1 pr-2 line-clamp-2 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                {note.title}
              </h2>
              <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                <Button
                  onClick={handleCopy}
                  variant="ghost"
                  size="sm"
                  className={`cursor-pointer p-1.5 sm:p-2 ${
                    isHalloweenMode
                      ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                      : isDark
                        ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  onClick={() => onEdit(note)}
                  variant="ghost"
                  size="sm"
                  className={`cursor-pointer p-1.5 sm:p-2 ${
                    isHalloweenMode
                      ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                      : isDark
                        ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  onClick={handleDeleteClick}
                  variant="ghost"
                  size="sm"
                  className={`cursor-pointer p-1.5 sm:p-2 text-red-500 hover:text-red-500 ${
                    isHalloweenMode
                      ? "hover:bg-red-500/10"
                      : isDark
                        ? "hover:bg-[rgba(255,255,255,0.05)]"
                        : "hover:bg-red-50"
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
                <div
                  className={`w-px h-4 sm:h-6 mx-1 sm:mx-2 ${
                    isHalloweenMode
                      ? "bg-[#60c9b6]/20"
                      : isDark
                        ? "bg-[rgba(255,255,255,0.1)]"
                        : "bg-gray-200"
                  }`}
                />
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
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-3 sm:p-6 pt-3 sm:pt-4 space-y-3 sm:space-y-4 relative z-10">
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
                  className={`w-full rounded-lg p-3 sm:p-4 min-h-[150px] sm:min-h-[200px] ${
                    isHalloweenMode
                      ? "bg-[#1a1a1f] border border-[#60c9b6]/30"
                      : isDark
                        ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)]"
                        : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <RichTextRenderer
                    content={
                      note.rich_content
                        ? typeof note.rich_content === "string"
                          ? note.rich_content
                          : JSON.stringify(note.rich_content)
                        : note.content
                    }
                    className="min-h-[120px] sm:min-h-[150px] text-xs sm:text-sm"
                  />
                </div>
              </div>

              {note.category && (
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
                  <span
                    className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded ${
                      isHalloweenMode
                        ? "bg-[#60c9b6]/10 text-[#60c9b6] border border-[#60c9b6]/20"
                        : isDark
                          ? "bg-[rgba(139,92,246,0.2)] text-[#8B5CF6]"
                          : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {note.category}
                  </span>
                </div>
              )}

              {note.tags && note.tags.length > 0 && (
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
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded ${
                          isHalloweenMode
                            ? "bg-[#60c9b6]/5 text-[#60c9b6]/80 border border-[#60c9b6]/10"
                            : isDark
                              ? "bg-[rgba(255,255,255,0.1)] text-[#B4B4B8]"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={`text-[10px] sm:text-xs pt-3 sm:pt-4 space-y-0.5 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]/60 border-t border-[#60c9b6]/20"
                    : isDark
                      ? "text-[#71717A] border-t border-[rgba(255,255,255,0.1)]"
                      : "text-gray-500 border-t border-gray-200"
                }`}
              >
                <div>
                  Created: {new Date(note.created_at).toLocaleDateString()}
                </div>
                <div>
                  Updated: {new Date(note.updated_at).toLocaleDateString()}
                </div>
                <div>Usage Count: {note.usage_count}</div>
              </div>
            </div>
          </motion.div>

          <ConfirmationModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDeleteConfirm}
            title="Delete Note"
            description="Are you sure you want to delete this note?"
            itemTitle={note?.title}
            itemDescription={
              note?.content?.substring(0, 100) +
              (note?.content?.length > 100 ? "..." : "")
            }
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
