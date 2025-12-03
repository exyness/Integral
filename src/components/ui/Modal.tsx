import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React from "react";
import { spiderSharpHanging, witchBrew } from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  className?: string;
  hideDecorations?: boolean;
  layoutId?: string;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  className = "",
  hideDecorations = false,
  layoutId,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const mouseDownTargetRef = React.useRef<EventTarget | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownTargetRef.current = e.target;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (
      mouseDownTargetRef.current === e.target &&
      e.target === e.currentTarget
    ) {
      onClose();
    }
    mouseDownTargetRef.current = null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-10000 ${isDark ? "bg-[rgba(10,10,11,0.8)]" : "bg-black/50"}`}
          style={{ margin: 0, padding: "16px", paddingTop: "48px" }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <motion.div
            layoutId={layoutId}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`rounded-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden relative flex flex-col ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border border-[#60c9b6]/30 shadow-[0_0_15px_rgba(96,201,182,0.2)]"
                : isDark
                  ? "bg-[rgba(26,26,31,0.95)] border border-[rgba(255,255,255,0.1)]"
                  : "bg-white border border-gray-200 shadow-2xl"
            } ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {isHalloweenMode && !hideDecorations && (
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
            <div
              className={`flex items-center justify-between p-4 md:p-6 ${isDark ? "border-b border-[rgba(255,255,255,0.1)]" : "border-b border-gray-200"}`}
            >
              <h3
                className={`text-base md:text-lg font-semibold ${
                  isHalloweenMode
                    ? "text-[#60c9b6] font-creepster tracking-wider"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                {title}
              </h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={`p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer ${
                    isHalloweenMode
                      ? "hover:bg-[#60c9b6]/20"
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
              )}
            </div>
            <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-120px)] mobile-scrollbar-hide">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
