import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { batHang, pumpkinBlocky } from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import type { Folder } from "@/hooks/useFolders";
import { Button } from "../ui/Button.tsx";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string, color: string) => void;
  type: "notes" | "accounts";
  folderToEdit?: Folder | null;
}

const colorOptions = [
  "#8B5CF6", // Violet
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F43F5E", // Rose
  "#D946EF", // Fuchsia
  "#6366F1", // Indigo
  "#0EA5E9", // Sky
  "#22C55E", // Green
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#64748B", // Slate
  "#A855F7", // Purple
  "#FB7185", // Rose Red
  "#2DD4BF", // Teal Light
];

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder,
  type,
  folderToEdit,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [folderName, setFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const modalRef = useRef<HTMLDivElement>(null);

  const isEditing = !!folderToEdit;

  useEffect(() => {
    if (isOpen) {
      if (isEditing && folderToEdit) {
        setFolderName(folderToEdit.name);
        setSelectedColor(folderToEdit.color || colorOptions[0]);
      } else {
        setFolderName("");
        setSelectedColor(colorOptions[0]);
      }
    }
  }, [isOpen, isEditing, folderToEdit]);

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
    if (folderName.trim()) {
      onCreateFolder(folderName.trim(), selectedColor);
      onClose();
    }
  };

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
            className={`rounded-xl p-4 md:p-6 w-full max-w-md relative overflow-hidden ${
              isHalloweenMode
                ? "bg-[rgba(96,201,182,0.15)]! border border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
                : isDark
                  ? "bg-[rgba(26,26,31,0.95)] border border-[rgba(255,255,255,0.1)]"
                  : "bg-white border border-gray-200 shadow-2xl"
            }`}
          >
            {isHalloweenMode && (
              <>
                <div className="absolute -bottom-3 -left-3 pointer-events-none z-0">
                  <img
                    src={pumpkinBlocky}
                    alt=""
                    className="w-32 h-32 -rotate-12 opacity-10"
                  />
                </div>
                <div className="absolute -top-5 -right-6 pointer-events-none z-0">
                  <img
                    src={batHang}
                    alt=""
                    className="w-32 h-32 rotate-38 opacity-10"
                  />
                </div>
              </>
            )}

            <h3
              className={`text-base md:text-lg font-semibold mb-3 md:mb-4 relative z-10 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              {isEditing ? "Edit Folder" : "Create New Folder"}
            </h3>

            <form
              onSubmit={handleSubmit}
              className="space-y-3 md:space-y-4 relative z-10"
            >
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
                  Folder Name
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-sm md:text-base focus:outline-hidden ${
                    isHalloweenMode
                      ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                      : isDark
                        ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6]"
                        : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6]"
                  }`}
                  placeholder={`Enter folder name for ${type}`}
                  autoFocus
                />
              </div>

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
                  Color
                </label>
                <div className="flex flex-wrap gap-2 md:gap-2.5">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all cursor-pointer ${
                        selectedColor === color
                          ? `${
                              isHalloweenMode
                                ? "border-[#60c9b6] shadow-[0_0_10px_rgba(96,201,182,0.4)]"
                                : isDark
                                  ? "border-white"
                                  : "border-gray-800"
                            } scale-110`
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 md:space-x-3 mt-4 md:mt-6">
                <Button
                  type="submit"
                  className={`flex-1 text-sm md:text-base py-2 cursor-pointer ${
                    isHalloweenMode
                      ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                      : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
                  }`}
                  disabled={!folderName.trim()}
                >
                  {isEditing ? "Save Changes" : "Create Folder"}
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 text-sm md:text-base py-2 cursor-pointer ${
                    isHalloweenMode
                      ? "bg-transparent text-[#60c9b6] hover:bg-[#60c9b6]/10 border border-[#60c9b6]/20"
                      : isDark
                        ? "bg-[rgba(255,255,255,0.1)] text-[#B4B4B8] hover:bg-[rgba(255,255,255,0.15)]"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
