import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { ghostScare, pumpkinScary } from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  itemTitle?: string;
  itemDescription?: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
  decorationTopLeft?: string;
  decorationBottomRight?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemTitle,
  itemDescription,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
  decorationTopLeft,
  decorationBottomRight,
}) => {
  const { isDark, isHalloweenMode } = useTheme();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          iconColor: "#EF4444",
          confirmBg: "#EF4444",
          confirmHover: "#DC2626",
          iconBg: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.1)",
        };
      case "warning":
        return {
          iconColor: "#F59E0B",
          confirmBg: "#F59E0B",
          confirmHover: "#D97706",
          iconBg: isDark
            ? "rgba(245, 158, 11, 0.1)"
            : "rgba(245, 158, 11, 0.1)",
        };
      case "info":
        return {
          iconColor: "#3B82F6",
          confirmBg: "#3B82F6",
          confirmHover: "#2563EB",
          iconBg: isDark
            ? "rgba(59, 130, 246, 0.1)"
            : "rgba(59, 130, 246, 0.1)",
        };
    }
  };

  const typeStyles = getTypeStyles();

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Modal Container with Backdrop */}
          <div
            key="confirmation-modal-container"
            className="fixed inset-0 flex items-center justify-center z-10000 p-3 md:p-4 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: 10000 }}
            onClick={onClose}
          >
            <motion.div
              key="confirmation-modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                mass: 0.8,
              }}
              className={`relative w-full max-w-md rounded-xl shadow-2xl backdrop-blur-md border overflow-hidden ${
                isHalloweenMode
                  ? "bg-[#1a1a1f]/95 border-[#60c9b6]/30 shadow-[0_0_15px_rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[rgba(26,26,31,0.95)] border-[rgba(255,255,255,0.1)]"
                    : "bg-white border-gray-200"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className={`absolute top-3 right-3 md:top-4 md:right-4 p-1 rounded-lg transition-colors cursor-pointer z-20 ${
                  isHalloweenMode
                    ? "hover:bg-[#60c9b6]/10 text-[#60c9b6] hover:text-[#60c9b6]"
                    : isDark
                      ? "hover:bg-[rgba(255,255,255,0.1)] text-[#B4B4B8] hover:text-white"
                      : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }`}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Halloween Decorations */}
              {isHalloweenMode && (
                <>
                  <div className="absolute -bottom-8 -left-8 pointer-events-none z-0">
                    <img
                      src={decorationTopLeft || ghostScare}
                      alt=""
                      className="w-32 h-32 -rotate-12 opacity-10"
                    />
                  </div>
                  <div className="absolute -top-8 -right-8 pointer-events-none z-0">
                    <img
                      src={decorationBottomRight || pumpkinScary}
                      alt=""
                      className="w-32 h-32 rotate-12 opacity-10"
                    />
                  </div>
                </>
              )}

              {/* Content */}
              <div className="p-4 md:p-6">
                {/* Header with Icon and Title */}
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: typeStyles.iconBg }}
                    >
                      <AlertTriangle
                        className="w-4 h-4 md:w-5 md:h-5"
                        style={{ color: typeStyles.iconColor }}
                      />
                    </div>
                    <h3
                      className={`text-base md:text-lg font-semibold ${
                        isHalloweenMode
                          ? "text-[#60c9b6] font-creepster tracking-wide"
                          : isDark
                            ? "text-white"
                            : "text-gray-900"
                      }`}
                    >
                      {title}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4 md:mb-6">
                  {/* Description */}
                  {description && (
                    <p
                      className={`text-xs md:text-sm mb-2 md:mb-3 ${
                        isHalloweenMode
                          ? "text-[#60c9b6]/80"
                          : isDark
                            ? "text-[#B4B4B8]"
                            : "text-gray-600"
                      }`}
                    >
                      {description}
                    </p>
                  )}

                  {/* Item Details */}
                  {itemTitle && (
                    <div
                      className={`p-2 md:p-3 rounded-lg border mb-2 overflow-hidden relative z-10 ${
                        isHalloweenMode
                          ? "bg-[#60c9b6]/5 border-[#60c9b6]/20"
                          : isDark
                            ? "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.1)]"
                            : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <h4
                        className={`text-sm md:text-base font-medium truncate ${
                          isHalloweenMode
                            ? "text-[#60c9b6]"
                            : isDark
                              ? "text-white"
                              : "text-gray-900"
                        }`}
                      >
                        {itemTitle}
                      </h4>
                      {itemDescription && (
                        <p
                          className={`text-xs md:text-sm mt-1 line-clamp-2 break-all overflow-hidden ${
                            isHalloweenMode
                              ? "text-[#60c9b6]/70"
                              : isDark
                                ? "text-[#B4B4B8]"
                                : "text-gray-600"
                          }`}
                        >
                          {itemDescription}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Warning text */}
                  <p
                    className={`text-[10px] md:text-xs ${
                      isHalloweenMode
                        ? "text-[#60c9b6]/60 italic"
                        : isDark
                          ? "text-[#71717A]"
                          : "text-gray-500"
                    }`}
                  >
                    This action cannot be undone.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 md:space-x-3">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className={`flex-1 px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors disabled:opacity-50 cursor-pointer relative z-10 ${
                      isHalloweenMode
                        ? "bg-[#60c9b6]/10 text-[#60c9b6] hover:bg-[#60c9b6]/20 border border-[#60c9b6]/20"
                        : isDark
                          ? "bg-[rgba(255,255,255,0.1)] text-[#B4B4B8] hover:bg-[rgba(255,255,255,0.15)]"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex-1 px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium text-white cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 relative z-10"
                    style={{
                      backgroundColor: isHalloweenMode
                        ? "#60c9b6"
                        : typeStyles.confirmBg,
                      color: isHalloweenMode ? "#1a1a1f" : "white",
                      boxShadow: isHalloweenMode
                        ? "0 0 10px rgba(96,201,182,0.4)"
                        : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = isHalloweenMode
                          ? "#4db8a5"
                          : typeStyles.confirmHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = isHalloweenMode
                          ? "#60c9b6"
                          : typeStyles.confirmBg;
                      }
                    }}
                  >
                    {isLoading && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    )}
                    <span>{confirmText}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};
