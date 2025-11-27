import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Edit, Eye, EyeOff, Trash2, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { batGlide, castleHilltop } from "@/assets";
import { Button } from "@/components/ui/Button.tsx";
import { useTheme } from "@/contexts/ThemeContext";
import { Account } from "@/types/account";

interface ViewAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
}

export const ViewAccountModal: React.FC<ViewAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onEdit,
  onDelete,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailUsername, setShowEmailUsername] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast.success(
        `${field === "email_username" ? "Email/Username" : "Password"} copied to clipboard`,
      );
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const getUsagePercentage = () => {
    if (!account.usage_limit || account.usage_limit <= 0) return 0;
    return (account.current_usage / account.usage_limit) * 100;
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return "text-red-400";
    if (percentage >= 70) return "text-yellow-400";
    return isHalloweenMode ? "text-[#60c9b6]" : "text-green-400";
  };

  const maskEmailUsername = (emailUsername: string) => {
    if (emailUsername.includes("@")) {
      const [username, domain] = emailUsername.split("@");
      if (username && domain) {
        const maskedUsername =
          username.slice(0, 2) +
          "*".repeat(Math.max(0, username.length - 4)) +
          username.slice(-2);
        return `${maskedUsername}@${domain}`;
      }
    }
    if (emailUsername.length > 4) {
      return (
        emailUsername.slice(0, 2) +
        "*".repeat(Math.max(0, emailUsername.length - 4)) +
        emailUsername.slice(-2)
      );
    }
    return "*".repeat(emailUsername.length);
  };

  const maskPassword = (password: string) => {
    return "*".repeat(password.length);
  };

  return (
    <AnimatePresence>
      {isOpen && account && (
        <motion.div
          className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 ${isDark ? "bg-[rgba(10,10,11,0.8)]" : "bg-black/50"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`rounded-xl w-full max-w-4xl max-h-[95vh] flex flex-col mx-4 relative overflow-hidden ${
              isHalloweenMode
                ? isDark
                  ? "bg-[rgba(26,26,31,0.95)] border border-[rgba(96,201,182,0.2)] shadow-[0_0_30px_rgba(96,201,182,0.1)]"
                  : "bg-white border border-[rgba(96,201,182,0.2)] shadow-2xl"
                : isDark
                  ? "bg-[rgba(26,26,31,0.95)] border border-[rgba(255,255,255,0.1)]"
                  : "bg-white border border-gray-200 shadow-2xl"
            }`}
          >
            {isHalloweenMode && (
              <>
                <div className="absolute bottom-1 left-1 pointer-events-none z-0">
                  <img
                    src={batGlide}
                    alt="Cat Witch"
                    className="w-48 h-48 object-contain opacity-10 animate-float-slow"
                  />
                </div>
                <div className="absolute -bottom-1 right-2 pointer-events-none z-0">
                  <img
                    src={castleHilltop}
                    alt="Spider"
                    className="w-48 h-48 object-contain opacity-5 animate-bounce-slow"
                  />
                </div>
              </>
            )}
            {/* Header */}
            <div
              className={`flex items-center justify-between p-4 md:p-6 md:pb-4 border-b relative z-10 ${
                isHalloweenMode
                  ? "border-[rgba(96,201,182,0.1)]"
                  : isDark
                    ? "border-[rgba(255,255,255,0.1)]"
                    : "border-gray-200"
              }`}
            >
              <h2
                className={`text-base md:text-xl font-semibold flex items-center gap-1.5 md:gap-2 flex-1 min-w-0 ${
                  isHalloweenMode
                    ? "text-[#60c9b6] font-creepster tracking-wide"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                <span className="truncate">{account.title}</span>
                {!account.is_active && (
                  <span className="px-1.5 md:px-2 py-0.5 bg-[rgba(239,68,68,0.2)] text-[#EF4444] text-[10px] md:text-xs rounded border border-[rgba(239,68,68,0.3)] shrink-0">
                    Inactive
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-1 md:gap-2 shrink-0">
                <Button
                  onClick={() =>
                    copyToClipboard(account.email_username, "email_username")
                  }
                  variant="ghost"
                  size="sm"
                  className={`cursor-pointer hidden sm:flex ${
                    isHalloweenMode
                      ? "text-[#60c9b6] hover:text-[#60c9b6] hover:bg-[rgba(96,201,182,0.1)]"
                      : isDark
                        ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {copiedField === "email_username" ? (
                    <Check
                      className={`w-4 h-4 ${isHalloweenMode ? "text-[#60c9b6]" : "text-green-400"}`}
                    />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={() => onEdit(account)}
                  variant="ghost"
                  size="sm"
                  className={`cursor-pointer p-1.5 md:p-2 ${
                    isHalloweenMode
                      ? "text-[#60c9b6] hover:text-[#60c9b6] hover:bg-[rgba(96,201,182,0.1)]"
                      : isDark
                        ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </Button>
                <Button
                  onClick={() => onDelete(account.id)}
                  variant="ghost"
                  size="sm"
                  className={`cursor-pointer text-red-500 hover:text-red-500 p-1.5 md:p-2 ${
                    isHalloweenMode
                      ? "hover:bg-[rgba(239,68,68,0.1)]"
                      : isDark
                        ? "hover:bg-[rgba(255,255,255,0.05)]"
                        : "hover:bg-red-50"
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </Button>
                <button
                  onClick={onClose}
                  className={`p-1.5 md:p-2 rounded-lg cursor-pointer transition-colors ${
                    isHalloweenMode
                      ? "hover:bg-[rgba(96,201,182,0.1)]"
                      : isDark
                        ? "hover:bg-[rgba(255,255,255,0.05)]"
                        : "hover:bg-gray-100"
                  }`}
                >
                  <X
                    className={`w-4 h-4 md:w-5 md:h-5 ${
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
            <div className="flex-1 overflow-y-auto p-4 md:p-6 md:pt-4 space-y-3 md:space-y-4 mobile-scrollbar-hide relative z-10">
              {/* Credentials */}
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
                  Email/Username
                </label>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div
                    className={`w-full rounded-lg p-2.5 md:p-4 break-all font-mono text-xs md:text-sm ${
                      isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.05)] border border-[rgba(96,201,182,0.1)] text-[#60c9b6]"
                        : isDark
                          ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-[#B4B4B8]"
                          : "bg-gray-50 border border-gray-200 text-gray-900"
                    }`}
                  >
                    {showEmailUsername
                      ? account.email_username
                      : maskEmailUsername(account.email_username)}
                  </div>
                  <Button
                    onClick={() => setShowEmailUsername(!showEmailUsername)}
                    variant="ghost"
                    size="sm"
                    className={`cursor-pointer p-1.5 md:p-2 shrink-0 ${
                      isHalloweenMode
                        ? "text-[#60c9b6] hover:text-[#60c9b6] hover:bg-[rgba(96,201,182,0.1)]"
                        : isDark
                          ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {showEmailUsername ? (
                      <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() =>
                      copyToClipboard(
                        account.email_username,
                        "email_username_detail",
                      )
                    }
                    variant="ghost"
                    size="sm"
                    className={`cursor-pointer p-1.5 md:p-2 shrink-0 ${
                      isHalloweenMode
                        ? "text-[#60c9b6] hover:text-[#60c9b6] hover:bg-[rgba(96,201,182,0.1)]"
                        : isDark
                          ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {copiedField === "email_username_detail" ? (
                      <Check
                        className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isHalloweenMode ? "text-[#60c9b6]" : "text-green-400"}`}
                      />
                    ) : (
                      <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    )}
                  </Button>
                </div>
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
                  Password
                </label>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div
                    className={`w-full rounded-lg p-2.5 md:p-4 break-all font-mono text-xs md:text-sm ${
                      isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.05)] border border-[rgba(96,201,182,0.1)] text-[#60c9b6]"
                        : isDark
                          ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-[#B4B4B8]"
                          : "bg-gray-50 border border-gray-200 text-gray-900"
                    }`}
                  >
                    {showPassword
                      ? account.password
                      : maskPassword(account.password)}
                  </div>
                  <Button
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    size="sm"
                    className={`cursor-pointer p-1.5 md:p-2 shrink-0 ${
                      isHalloweenMode
                        ? "text-[#60c9b6] hover:text-[#60c9b6] hover:bg-[rgba(96,201,182,0.1)]"
                        : isDark
                          ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() =>
                      copyToClipboard(account.password, "password_detail")
                    }
                    variant="ghost"
                    size="sm"
                    className={`cursor-pointer p-1.5 md:p-2 shrink-0 ${
                      isHalloweenMode
                        ? "text-[#60c9b6] hover:text-[#60c9b6] hover:bg-[rgba(96,201,182,0.1)]"
                        : isDark
                          ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {copiedField === "password_detail" ? (
                      <Check
                        className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isHalloweenMode ? "text-[#60c9b6]" : "text-green-400"}`}
                      />
                    ) : (
                      <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Configuration */}
              <div style={{ marginTop: "2rem" }}>
                <label
                  className={`block text-sm mb-2 ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : isDark
                        ? "text-[#B4B4B8]"
                        : "text-gray-700"
                  }`}
                >
                  Configuration
                </label>
                <div
                  className={`rounded-lg p-4 ${
                    isHalloweenMode
                      ? "bg-[rgba(96,201,182,0.05)] border border-[rgba(96,201,182,0.1)]"
                      : isDark
                        ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)]"
                        : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
                    <div>
                      <span
                        className={`text-xs uppercase tracking-wide block mb-2 ${isHalloweenMode ? "text-[#60c9b6]/60" : "text-[#71717A]"}`}
                      >
                        Usage Type
                      </span>
                      <span
                        className={`text-sm capitalize ${
                          isHalloweenMode
                            ? "text-[#60c9b6]"
                            : isDark
                              ? "text-[#B4B4B8]"
                              : "text-gray-600"
                        }`}
                      >
                        {account.usage_type.replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`text-xs uppercase tracking-wide block mb-2 ${isHalloweenMode ? "text-[#60c9b6]/60" : "text-[#71717A]"}`}
                      >
                        Reset Period
                      </span>
                      <span
                        className={`text-sm capitalize ${
                          isHalloweenMode
                            ? "text-[#60c9b6]"
                            : isDark
                              ? "text-[#B4B4B8]"
                              : "text-gray-600"
                        }`}
                      >
                        {account.reset_period}
                      </span>
                    </div>
                    {account.usage_limit && (
                      <>
                        <div>
                          <span
                            className={`text-xs uppercase tracking-wide block mb-2 ${isHalloweenMode ? "text-[#60c9b6]/60" : "text-[#71717A]"}`}
                          >
                            Usage
                          </span>
                          <span
                            className={`text-sm font-medium ${getUsageColor()}`}
                          >
                            {account.current_usage} / {account.usage_limit}
                          </span>
                        </div>
                        <div>
                          <span
                            className={`text-xs uppercase tracking-wide block mb-2 ${isHalloweenMode ? "text-[#60c9b6]/60" : "text-[#71717A]"}`}
                          >
                            Progress
                          </span>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`flex-1 rounded-full h-1.5 ${isHalloweenMode ? "bg-[rgba(96,201,182,0.1)]" : "bg-[rgba(255,255,255,0.1)]"}`}
                            >
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  getUsagePercentage() >= 90
                                    ? "bg-red-400"
                                    : getUsagePercentage() >= 70
                                      ? "bg-yellow-400"
                                      : isHalloweenMode
                                        ? "bg-[#60c9b6]"
                                        : "bg-[#8B5CF6]"
                                }`}
                                style={{
                                  width: `${Math.min(getUsagePercentage(), 100)}%`,
                                }}
                              />
                            </div>
                            <span
                              className={`text-xs w-10 text-right ${isHalloweenMode ? "text-[#60c9b6]/60" : "text-[#71717A]"}`}
                            >
                              {getUsagePercentage().toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {account.description && (
                <div style={{ marginTop: "2rem" }}>
                  <label
                    className={`block text-sm mb-2 ${
                      isHalloweenMode
                        ? "text-[#60c9b6]"
                        : isDark
                          ? "text-[#B4B4B8]"
                          : "text-gray-700"
                    }`}
                  >
                    Description
                  </label>
                  <div
                    className={`rounded-lg p-4 ${
                      isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.05)] border border-[rgba(96,201,182,0.1)]"
                        : isDark
                          ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)]"
                          : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <p
                      className={`text-sm leading-relaxed whitespace-pre-wrap ${
                        isHalloweenMode
                          ? "text-[#60c9b6]"
                          : isDark
                            ? "text-[#B4B4B8]"
                            : "text-gray-600"
                      }`}
                    >
                      {account.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {account.tags.length > 0 && (
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
                  <div className="flex flex-wrap gap-2">
                    {account.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-block px-2 py-1 text-xs rounded border font-medium ${
                          isHalloweenMode
                            ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6] border-[rgba(96,201,182,0.3)]"
                            : "bg-[rgba(139,92,246,0.2)] text-[#8B5CF6] border-[rgba(139,92,246,0.3)]"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div
                className={`pt-4 border-t ${
                  isHalloweenMode
                    ? "border-[rgba(96,201,182,0.1)]"
                    : isDark
                      ? "border-[rgba(255,255,255,0.1)]"
                      : "border-gray-200"
                }`}
              >
                <div
                  className={`text-xs ${
                    isHalloweenMode
                      ? "text-[#60c9b6]/60"
                      : isDark
                        ? "text-[#71717A]"
                        : "text-gray-500"
                  }`}
                >
                  <div>
                    Created: {new Date(account.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    Updated: {new Date(account.updated_at).toLocaleDateString()}
                  </div>
                  <div>Usage Count: {account.current_usage}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
