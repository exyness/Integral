import { differenceInDays, format } from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar,
  Edit2,
  MoreVertical,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { batGlide, pumpkinWitchhat } from "@/assets";
import { IconRenderer } from "@/contexts/IconPickerContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCategoriesQuery } from "@/hooks/queries/useCategories";
import { useCurrency } from "@/hooks/useCurrency";
import { FinancialGoal } from "@/types/budget";
import { CategoryBadge } from "./CategoryBadge";
import { ContributionModal } from "./ContributionModal";

interface GoalCardProps {
  goal: FinancialGoal;
  onEdit: (goal: FinancialGoal) => void;
  onDelete: (id: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { formatAmount } = useCurrency();
  const [showMenu, setShowMenu] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: categories = [] } = useCategoriesQuery();
  const linkedCategory = categories.find((c) => c.id === goal.category_id);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const progress = (goal.current_amount / goal.target_amount) * 100;
  const remaining = goal.target_amount - goal.current_amount;
  const daysRemaining = goal.target_date
    ? differenceInDays(new Date(goal.target_date), new Date())
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-4 md:p-6 rounded-xl border transition-all group ${
        isHalloweenMode
          ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)] hover:border-[rgba(96,201,182,0.4)]"
          : isDark
            ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
            : "bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Halloween Decorations */}
      {isHalloweenMode && (
        <>
          <div className="absolute -bottom-1 -right-1 pointer-events-none z-0">
            <img
              src={pumpkinWitchhat}
              alt=""
              className="w-16 h-16 opacity-30"
            />
          </div>
          <div className="absolute -top-2 -left-2 pointer-events-none z-0">
            <img src={batGlide} alt="" className="w-14 h-14 opacity-20" />
          </div>
        </>
      )}
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: isHalloweenMode
                ? "rgba(96, 201, 182, 0.2)"
                : `${goal.color}20`,
            }}
          >
            <IconRenderer
              icon={goal.icon}
              className={`w-6 h-6 ${isHalloweenMode ? "text-[#60c9b6]" : ""}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={`font-semibold text-lg ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                {goal.name}
              </h3>
              {linkedCategory && (
                <div
                  className="px-2 py-1 rounded-md"
                  style={{
                    backgroundColor: isHalloweenMode
                      ? "rgba(96, 201, 182, 0.15)"
                      : `${linkedCategory.color}15`,
                  }}
                >
                  <CategoryBadge category={linkedCategory} size="sm" />
                </div>
              )}
            </div>
            {goal.description && (
              <p
                className={`text-sm ${
                  isHalloweenMode
                    ? "text-[#60c9b6]/70"
                    : isDark
                      ? "text-gray-400"
                      : "text-gray-600"
                }`}
              >
                {goal.description}
              </p>
            )}
          </div>
        </div>

        {/* Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
              showMenu ? "opacity-100" : ""
            } ${
              isHalloweenMode
                ? "hover:bg-[rgba(96,201,182,0.2)]"
                : isDark
                  ? "hover:bg-white/10"
                  : "hover:bg-gray-100"
            }`}
          >
            <MoreVertical
              className={`w-4 h-4 ${isHalloweenMode ? "text-[#60c9b6]" : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              className={`absolute right-0 mt-2 w-40 rounded-lg shadow-xl border z-50 ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border-[rgba(96,201,182,0.3)]"
                  : isDark
                    ? "bg-[#1a1a1f] border-gray-700"
                    : "bg-white border-gray-200"
              }`}
            >
              <button
                onClick={() => {
                  onEdit(goal);
                  setShowMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  isHalloweenMode
                    ? "text-[#60c9b6] hover:bg-[rgba(96,201,182,0.1)]"
                    : isDark
                      ? "text-white hover:bg-white/10"
                      : "text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(goal.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Progress
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: isHalloweenMode ? "#60c9b6" : goal.color }}
          >
            {progress.toFixed(1)}%
          </span>
        </div>
        <div
          className={`h-3 rounded-full overflow-hidden ${
            isDark ? "bg-white/10" : "bg-gray-200"
          }`}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              backgroundColor: isHalloweenMode ? "#60c9b6" : goal.color,
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p
            className={`text-xs ${isHalloweenMode ? "text-[#60c9b6]/70" : isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            Current
          </p>
          <p
            className={`text-lg font-bold ${isHalloweenMode ? "text-[#60c9b6]" : isDark ? "text-white" : "text-gray-900"}`}
          >
            {formatAmount(goal.current_amount)}
          </p>
        </div>
        <div>
          <p
            className={`text-xs ${isHalloweenMode ? "text-[#60c9b6]/70" : isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            Target
          </p>
          <p
            className={`text-lg font-bold ${isHalloweenMode ? "text-[#60c9b6]" : isDark ? "text-white" : "text-gray-900"}`}
          >
            {formatAmount(goal.target_amount)}
          </p>
        </div>
      </div>

      {/* Remaining */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className={`flex items-center gap-2 p-3 rounded-lg ${
            isDark ? "bg-white/5" : "bg-gray-50"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span
            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {formatAmount(remaining)} remaining
          </span>
        </div>

        {/* Add Contribution Button */}
        <button
          onClick={() => {
            setShowContributionModal(true);
          }}
          className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-colors ${
            isHalloweenMode
              ? "bg-[rgba(96,201,182,0.15)] hover:bg-[rgba(96,201,182,0.25)] text-[#60c9b6]"
              : isDark
                ? "bg-green-500/10 hover:bg-green-500/20 text-green-400"
                : "bg-green-50 hover:bg-green-100 text-green-600"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add Contribution</span>
        </button>
      </div>

      {/* Target Date */}
      {goal.target_date && (
        <div
          className={`flex items-center gap-2 mt-3 p-3 rounded-lg ${
            daysRemaining && daysRemaining < 30
              ? "bg-orange-500/10"
              : isDark
                ? "bg-white/5"
                : "bg-gray-50"
          }`}
        >
          <Calendar
            className={`w-4 h-4 ${
              daysRemaining && daysRemaining < 30
                ? "text-orange-500"
                : "text-gray-500"
            }`}
          />
          <span
            className={`text-sm ${
              daysRemaining && daysRemaining < 30
                ? "text-orange-500 font-medium"
                : isDark
                  ? "text-gray-300"
                  : "text-gray-700"
            }`}
          >
            {daysRemaining !== null && daysRemaining >= 0
              ? `${daysRemaining} days remaining`
              : daysRemaining !== null && daysRemaining < 0
                ? `${Math.abs(daysRemaining)} days overdue`
                : format(new Date(goal.target_date), "MMM d, yyyy")}
          </span>
        </div>
      )}

      {/* Contribution Modal */}
      <ContributionModal
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        goal={goal}
      />
    </motion.div>
  );
};
