import { motion } from "framer-motion";
import { Activity, Calendar, Edit, FileText, Trash2 } from "lucide-react";
import React from "react";
import {
  batSwoop,
  catFluffy,
  pumpkinSneaky,
  spiderHairyCrawling,
} from "@/assets";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeContext";
import { AccountUsageLog } from "@/types/account";

interface UsageActivityCardProps {
  log: AccountUsageLog;
  accountTitle?: string;
  accountColor?: string;
  onDelete: (logId: string) => void;
  onEdit: (logId: string) => void;
  index?: number;
}

export const UsageActivityCard: React.FC<UsageActivityCardProps> = ({
  log,
  accountTitle,
  accountColor = "#3B82F6",
  onDelete,
  onEdit,
  index = 0,
}) => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group p-2.5 sm:p-4 rounded-lg border transition-all duration-200 hover:shadow-lg cursor-pointer relative overflow-hidden ${
        isHalloweenMode
          ? isDark
            ? "bg-[rgba(40,40,45,0.4)] hover:bg-[rgba(96,201,182,0.08)] hover:shadow-[0_0_15px_rgba(96,201,182,0.2)] border-[rgba(96,201,182,0.1)] hover:border-[rgba(96,201,182,0.3)]"
            : "bg-gray-50 hover:bg-[rgba(96,201,182,0.1)] hover:shadow-[0_0_15px_rgba(96,201,182,0.15)] border border-[rgba(96,201,182,0.2)] hover:border-[rgba(96,201,182,0.4)]"
          : isDark
            ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)]"
            : "bg-white border-gray-200 hover:shadow-md"
      }`}
    >
      {isHalloweenMode && index % 3 === 0 && (
        <motion.img
          src={
            index % 6 === 0
              ? batSwoop
              : index % 9 === 0
                ? spiderHairyCrawling
                : catFluffy
          }
          alt=""
          className="absolute -top-1 -right-1 w-5 md:w-6 opacity-30 pointer-events-none z-10"
          animate={{
            rotate: [0, 5, -5, 0],
            y: [0, -2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      <div className="flex items-start justify-between gap-2 sm:gap-3 relative z-10">
        <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={{ backgroundColor: `${accountColor}20` }}
          >
            {isHalloweenMode ? (
              <img
                src={pumpkinSneaky}
                alt=""
                className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-lg"
              />
            ) : (
              <Activity
                className="w-3.5 h-3.5 sm:w-5 sm:h-5"
                style={{ color: accountColor }}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2 mb-0.5 sm:mb-1">
              <h4
                className={`font-semibold text-[11px] sm:text-sm truncate ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                {accountTitle || "Unknown Account"}
              </h4>
              <span
                className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-xs rounded font-semibold shrink-0"
                style={{
                  backgroundColor: isHalloweenMode
                    ? "#60c9b620"
                    : `${accountColor}30`,
                  color: isHalloweenMode ? "#60c9b6" : accountColor,
                  border: isHalloweenMode
                    ? "1px solid #60c9b650"
                    : `1px solid ${accountColor}50`,
                }}
              >
                +{log.amount}
              </span>
            </div>

            {log.description && (
              <div className="flex items-start space-x-1 sm:space-x-1.5 mb-1 sm:mb-2">
                <FileText
                  className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mt-0.5 shrink-0 ${
                    isHalloweenMode
                      ? "text-[#60c9b6]/70"
                      : isDark
                        ? "text-[#B4B4B8]"
                        : "text-gray-500"
                  }`}
                />
                <p
                  className={`text-[10px] sm:text-xs leading-relaxed ${
                    isHalloweenMode
                      ? "text-[#60c9b6]/80"
                      : isDark
                        ? "text-[#B4B4B8]"
                        : "text-gray-600"
                  }`}
                >
                  {log.description}
                </p>
              </div>
            )}

            <div className="flex items-center space-x-1 sm:space-x-1.5">
              <Calendar
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]/60"
                    : isDark
                      ? "text-[#71717A]"
                      : "text-gray-400"
                }`}
              />
              <span
                className={`text-[9px] sm:text-xs ${
                  isHalloweenMode
                    ? "text-[#60c9b6]/60"
                    : isDark
                      ? "text-[#71717A]"
                      : "text-gray-500"
                }`}
              >
                {new Date(log.timestamp).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(log.id);
            }}
            className={`h-7 w-7 sm:h-8 sm:w-8 p-0 cursor-pointer ${
              isHalloweenMode
                ? "hover:bg-[#60c9b6]/10 text-[#60c9b6] hover:text-[#4db8a5] sm:bg-transparent sm:text-[#60c9b6]/70 sm:hover:bg-[#60c9b6]/10 sm:hover:text-[#60c9b6]"
                : isDark
                  ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 sm:bg-transparent sm:text-[#B4B4B8] sm:hover:bg-blue-500/20 sm:hover:text-blue-400"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100 sm:bg-transparent sm:text-gray-500 sm:hover:bg-blue-50 sm:hover:text-blue-600"
            }`}
            title="Edit usage log"
          >
            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(log.id);
            }}
            className={`h-7 w-7 sm:h-8 sm:w-8 p-0 cursor-pointer ${
              isDark
                ? "bg-[rgba(239,68,68,0.1)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)] sm:bg-transparent sm:text-[#B4B4B8] sm:hover:bg-[rgba(239,68,68,0.2)] sm:hover:text-[#EF4444]"
                : "bg-red-50 text-red-600 hover:bg-red-100 sm:bg-transparent sm:text-gray-500 sm:hover:bg-red-50 sm:hover:text-red-600"
            }`}
            title="Delete usage log"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
