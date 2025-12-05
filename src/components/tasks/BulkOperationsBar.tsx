import { motion } from "framer-motion";
import { Check, CheckSquare, Circle, Trash2, X } from "lucide-react";
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface BulkOperationsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkComplete: () => void;
  onBulkIncomplete: () => void;
  onBulkDelete: () => void;
}

export const BulkOperationsBar: React.FC<BulkOperationsBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkComplete,
  onBulkIncomplete,
  onBulkDelete,
}) => {
  const { isHalloweenMode } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-2.5 md:p-3 rounded-lg ${
        isHalloweenMode
          ? "bg-[#1a1a1f] border border-[#60c9b6]/30 shadow-[0_0_15px_rgba(96,201,182,0.2)]"
          : "bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)]"
      }`}
    >
      <div className="flex items-center space-x-2 md:space-x-3">
        <button
          onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
          className={`flex items-center space-x-1.5 md:space-x-2 transition-colors cursor-pointer ${
            isHalloweenMode
              ? "text-[#60c9b6] hover:text-[#60c9b6]/80"
              : "text-[#8B5CF6] hover:text-[#A855F7]"
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="text-xs md:text-sm font-medium">
            Select All ({selectedCount} of {totalCount})
          </span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 md:gap-2 w-full sm:w-auto">
        <button
          onClick={onBulkComplete}
          className="flex items-center justify-center space-x-1 px-2 md:px-3 py-1 bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] rounded-lg text-[#10B981] hover:bg-[rgba(16,185,129,0.3)] transition-colors text-xs md:text-sm cursor-pointer whitespace-nowrap"
        >
          <Check className="w-3 h-3" />
          <span>Complete</span>
        </button>

        <button
          onClick={onBulkIncomplete}
          className="flex items-center justify-center space-x-1 px-2 md:px-3 py-1 bg-[rgba(113,113,122,0.2)] border border-[rgba(113,113,122,0.3)] rounded-lg text-[#71717A] hover:bg-[rgba(113,113,122,0.3)] transition-colors text-xs md:text-sm cursor-pointer whitespace-nowrap"
        >
          <Circle className="w-3 h-3" />
          <span>Incomplete</span>
        </button>

        <button
          onClick={onBulkDelete}
          className="flex items-center justify-center space-x-1 px-2 md:px-3 py-1 bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.3)] rounded-lg text-[#EF4444] hover:bg-[rgba(239,68,68,0.3)] transition-colors text-xs md:text-sm cursor-pointer whitespace-nowrap"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete</span>
        </button>

        <button
          onClick={onDeselectAll}
          className="flex items-center justify-center space-x-1 px-2 md:px-3 py-1 bg-[rgba(113,113,122,0.2)] border border-[rgba(113,113,122,0.3)] rounded-lg text-[#71717A] hover:bg-[rgba(113,113,122,0.3)] transition-colors text-xs md:text-sm cursor-pointer whitespace-nowrap"
        >
          <X className="w-3 h-3" />
          <span>Cancel</span>
        </button>
      </div>
    </motion.div>
  );
};
