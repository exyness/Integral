import { motion } from "framer-motion";
import { FolderPlus, PanelRightOpen, SquarePen, Trash } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { webCenter } from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import { GlassCard } from "../GlassCard";
import { ScrollArea } from "../ui/ScrollArea";

interface Folder {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface FolderSidebarProps {
  folders: Folder[];
  selectedFolder: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onCreateFolder: () => void;
  onEditFolder?: () => void;
  onDeleteFolder?: () => void;
  totalCount: number;
  type: "notes" | "scripts" | "accounts";
  onCloseMobile?: () => void;
}

export const FolderSidebar: React.FC<FolderSidebarProps> = ({
  folders,
  selectedFolder,
  onFolderSelect,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  totalCount,
  type,
  onCloseMobile,
}) => {
  const { isDark, isHalloweenMode } = useTheme();

  const foldersContainerRef = useRef<HTMLDivElement>(null);
  const allFolderRef = useRef<HTMLDivElement>(null);
  const folderRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [folderPosition, setFolderPosition] = useState({ top: 0, height: 0 });

  const getActiveFolderColor = () => {
    if (isHalloweenMode) return "#60c9b6";
    if (!selectedFolder) {
      return "#8B5CF6";
    }
    const activeFolder = folders.find((f) => f.id === selectedFolder);
    return activeFolder?.color || "#8B5CF6";
  };

  const activeFolderColor = getActiveFolderColor();

  useEffect(() => {
    const updateFolderPosition = () => {
      let activeElement: HTMLDivElement | null;

      if (!selectedFolder) {
        activeElement = allFolderRef.current;
      } else {
        activeElement = folderRefs.current[selectedFolder];
      }

      if (activeElement && foldersContainerRef.current) {
        const containerRect =
          foldersContainerRef.current.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();
        setFolderPosition({
          top: activeRect.top - containerRect.top,
          height: activeRect.height,
        });
      }
    };

    const timer = setTimeout(updateFolderPosition, 150);

    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateFolderPosition();
      }, 150);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", debouncedResize);
    };
  }, [selectedFolder]);
  return (
    <motion.div
      className="mobile-sidebar lg:w-60 pr-3 my-1 lg:mt-3 lg:mb-0"
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      style={{ height: "calc(100% - 0.5rem)" }}
    >
      <GlassCard
        variant="secondary"
        className="h-full flex flex-col relative overflow-hidden"
      >
        {isHalloweenMode && (
          <div
            className="absolute inset-0 pointer-events-none opacity-10 z-0"
            style={{
              backgroundImage: `url(${webCenter})`,
              backgroundSize: "contain",
              backgroundPosition: "center top",
              backgroundRepeat: "no-repeat",
              filter: "grayscale(100%)",
            }}
          />
        )}
        <div className="p-2 lg:p-3 shrink-0 relative z-10">
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <h2
              className={`text-sm font-semibold ${
                isHalloweenMode
                  ? "text-[#60c9b6] font-creepster tracking-wider"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              Folders
            </h2>
            <div className="flex items-center space-x-1 lg:space-x-1">
              <motion.button
                className="h-8 w-8 lg:h-6 lg:w-6 p-0 rounded-md cursor-pointer transition-all"
                style={{
                  backgroundColor: `${activeFolderColor}`,
                  color: "white",
                }}
                onClick={onCreateFolder}
                whileHover={{
                  scale: 1.1,
                  backgroundColor: `${activeFolderColor}dd`,
                }}
                whileTap={{ scale: 0.9 }}
              >
                <FolderPlus className="w-4 h-4 text-black lg:w-3 lg:h-3 mx-auto" />
              </motion.button>
              {selectedFolder && onEditFolder && (
                <motion.button
                  className="h-8 w-8 lg:h-6 lg:w-6 p-0 rounded-md cursor-pointer transition-all"
                  style={{
                    backgroundColor: `${activeFolderColor}20`,
                    color: activeFolderColor,
                  }}
                  onClick={onEditFolder}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: `${activeFolderColor}30`,
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SquarePen className="w-4 h-4 lg:w-3 lg:h-3 mx-auto" />
                </motion.button>
              )}
              {selectedFolder && onDeleteFolder && (
                <motion.button
                  className="h-8 w-8 lg:h-6 lg:w-6 p-0 rounded-md cursor-pointer transition-all"
                  style={{
                    backgroundColor: "#EF444420",
                    color: "#EF4444",
                  }}
                  onClick={onDeleteFolder}
                  whileHover={{ scale: 1.1, backgroundColor: "#EF444430" }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash className="w-4 h-4 lg:w-3 lg:h-3 mx-auto" />
                </motion.button>
              )}
              {/* Mobile Close Button - Moved to the end */}
              {onCloseMobile && (
                <motion.button
                  className="lg:hidden h-8 w-8 p-0 rounded-md cursor-pointer transition-all"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                    color: isDark ? "white" : "#374151",
                  }}
                  onClick={onCloseMobile}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.1)",
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <PanelRightOpen className="w-4 h-4 mx-auto" />
                </motion.button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 px-2 pb-2 lg:px-3 lg:pb-3 min-h-0">
          <ScrollArea className="h-full" scrollbarColor={activeFolderColor}>
            <div ref={foldersContainerRef} className="relative space-y-1 pr-3">
              {/* Sliding Background */}
              <motion.div
                className="absolute left-0 right-3 rounded-lg shadow-lg"
                style={{
                  backgroundColor: `${activeFolderColor}30`,
                  borderColor: `${activeFolderColor}80`,
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
                animate={{
                  top: folderPosition.top,
                  height: folderPosition.height,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                initial={{ top: 0, height: 0 }}
              />

              <motion.div
                ref={allFolderRef}
                className={`relative z-10 p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                  !selectedFolder
                    ? ""
                    : isDark
                      ? isHalloweenMode
                        ? "hover:bg-[rgba(96,201,182,0.1)]"
                        : "hover:bg-[rgba(255,255,255,0.05)]"
                      : "hover:bg-gray-100"
                }`}
                onClick={() => onFolderSelect(null)}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-[#71717A]" : "bg-gray-400"}`}
                    />
                    <span
                      className="font-medium text-[11px] lg:text-xs transition-colors"
                      style={{
                        color: !selectedFolder
                          ? activeFolderColor
                          : isDark
                            ? "white"
                            : "#374151",
                      }}
                    >
                      All{" "}
                      {type === "notes"
                        ? "Notes"
                        : type === "accounts"
                          ? "Accounts"
                          : "Scripts"}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] lg:text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                  >
                    {totalCount}
                  </span>
                </div>
              </motion.div>

              {folders.map((folder, index) => (
                <motion.div
                  key={folder.id}
                  ref={(el) => {
                    folderRefs.current[folder.id] = el;
                  }}
                  className={`relative z-10 p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                    selectedFolder === folder.id
                      ? ""
                      : isDark
                        ? isHalloweenMode
                          ? "hover:bg-[rgba(96,201,182,0.1)]"
                          : "hover:bg-[rgba(255,255,255,0.05)]"
                        : "hover:bg-gray-100"
                  }`}
                  onClick={() => onFolderSelect(folder.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: folder.color }}
                      />
                      <span
                        className="font-medium text-[11px] lg:text-xs transition-colors"
                        style={{
                          color:
                            selectedFolder === folder.id
                              ? activeFolderColor
                              : isDark
                                ? "#B4B4B8"
                                : "#6B7280",
                        }}
                      >
                        {folder.name}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] lg:text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                    >
                      {folder.count}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </GlassCard>
    </motion.div>
  );
};
