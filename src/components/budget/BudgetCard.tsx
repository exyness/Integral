import { motion } from "framer-motion";
import {
  Clock,
  Edit,
  MoreVertical,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React from "react";
import { pumpkinScary, spiderSharpHanging } from "@/assets";
import { IconRenderer } from "@/contexts/IconPickerContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCategoriesQuery } from "@/hooks/queries/useCategories";
import { useCurrency } from "@/hooks/useCurrency";
import { Budget } from "@/types/budget";

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
  onClick: (budget: Budget) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onDelete,
  onClick,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { formatAmount } = useCurrency();
  const [showMenu, setShowMenu] = React.useState(false);
  const { data: categories } = useCategoriesQuery();

  const categoryName =
    categories?.find((c) => c.id === budget.category)?.name || "Uncategorized";

  const percentageUsed = (budget.spent / budget.amount) * 100;
  const remaining = budget.amount - budget.spent;
  const isOverBudget = budget.spent > budget.amount;
  const isNearLimit = percentageUsed > 80 && !isOverBudget;

  const getStatusColor = () => {
    if (isOverBudget) return "#EF4444";
    if (isNearLimit) return "#F59E0B";
    return budget.color;
  };

  const getProgressColor = () => {
    if (isOverBudget) return "#EF4444";
    if (isNearLimit) return "#F59E0B";
    return budget.color;
  };

  const getStatusText = () => {
    if (isOverBudget) return "Over Budget";
    if (isNearLimit) return "Near Limit";
    return "On Track";
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(budget)}
      className={`cursor-pointer h-full rounded-xl overflow-hidden relative border transition-colors ${
        isHalloweenMode
          ? isDark
            ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.3)] hover:bg-[rgba(96,201,182,0.15)] shadow-[0_0_15px_rgba(96,201,182,0.1)]"
            : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.3)] hover:bg-[rgba(96,201,182,0.1)] shadow-[0_0_15px_rgba(96,201,182,0.1)]"
          : isDark
            ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)]"
            : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      {isHalloweenMode && (
        <>
          <img
            src={spiderSharpHanging}
            alt=""
            className="absolute top-0 right-2 w-8 opacity-20 pointer-events-none z-0"
          />
          <img
            src={pumpkinScary}
            alt=""
            className="absolute bottom-1 right-1 w-6 opacity-15 pointer-events-none z-0"
          />
        </>
      )}
      {/* Decorative gradient background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(circle at top right, ${budget.color}, transparent 70%)`,
        }}
      />

      <div className="relative flex flex-col p-3 md:p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-2 md:mb-4">
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-sm md:text-base truncate flex items-center gap-2"
              style={{ color: budget.color }}
            >
              {budget.icon && (
                <div
                  className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg"
                  style={{
                    backgroundColor: `${budget.color}20`,
                  }}
                >
                  <IconRenderer
                    icon={budget.icon}
                    className="w-4 h-4 md:w-5 md:h-5"
                  />
                </div>
              )}
              {budget.name}
            </h3>
            <p
              className={`text-[10px] md:text-xs capitalize ${isDark ? "text-[#B4B4B8]" : "text-gray-500"}`}
            >
              {categoryName} • {budget.period}
            </p>
          </div>

          {/* Menu */}
          <div className="relative ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className={`p-2 rounded-lg transition-all ${
                isDark
                  ? "hover:bg-[rgba(255,255,255,0.1)]"
                  : "hover:bg-gray-100"
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`absolute right-0 mt-2 w-32 md:w-44 rounded-xl shadow-xl z-20 overflow-hidden ${
                    isDark
                      ? "bg-[rgba(25,25,30,0.98)] border border-[rgba(255,255,255,0.1)]"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(budget);
                      setShowMenu(false);
                    }}
                    className={`w-full px-3 py-2 md:px-4 md:py-3 text-left flex items-center space-x-2 md:space-x-3 transition-colors ${
                      isDark
                        ? "hover:bg-[rgba(139,92,246,0.1)]"
                        : "hover:bg-purple-50"
                    }`}
                  >
                    <Edit className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#8B5CF6]" />
                    <span className="text-xs md:text-sm font-medium text-[#8B5CF6]">
                      Edit Budget
                    </span>
                  </button>
                  <div
                    className={`h-px ${isDark ? "bg-[rgba(255,255,255,0.1)]" : "bg-gray-200"}`}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(budget.id);
                      setShowMenu(false);
                    }}
                    className={`w-full px-3 py-2 md:px-4 md:py-3 text-left flex items-center space-x-2 md:space-x-3 transition-colors ${
                      isDark
                        ? "hover:bg-[rgba(239,68,68,0.1)]"
                        : "hover:bg-red-50"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />
                    <span className="text-xs md:text-sm font-medium text-red-500">
                      Delete
                    </span>
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-2 md:mb-3">
          <div
            className="inline-flex items-center space-x-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold"
            style={{
              backgroundColor: `${getStatusColor()}20`,
              color: isHalloweenMode
                ? isOverBudget
                  ? "#EF4444"
                  : "#60c9b6"
                : getStatusColor(),
            }}
          >
            {isOverBudget ? (
              <TrendingDown className="w-2.5 h-2.5 md:w-3 md:h-3" />
            ) : (
              <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3" />
            )}
            <span>{getStatusText()}</span>
          </div>
        </div>

        {/* Amount Section */}
        <div className="flex-1 mb-3 md:mb-4">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p
                className={`text-[10px] md:text-xs font-medium mb-0.5 ${isDark ? "text-[#B4B4B8]" : "text-gray-500"}`}
              >
                Spent
              </p>
              <div className="flex items-baseline space-x-1">
                <span
                  className="text-lg md:text-2xl font-bold tracking-tight"
                  style={{
                    color: getProgressColor(),
                  }}
                >
                  {formatAmount(budget.spent)}
                </span>
                <span
                  className={`text-xs md:text-sm font-medium ${isDark ? "text-[#B4B4B8]" : "text-gray-500"}`}
                >
                  / {formatAmount(budget.amount)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-[10px] md:text-xs font-medium mb-0.5 ${isDark ? "text-[#B4B4B8]" : "text-gray-500"}`}
              >
                {isOverBudget ? "Over" : "Left"}
              </p>
              <p
                className={`text-base md:text-xl font-bold ${
                  isOverBudget
                    ? "text-red-500"
                    : isDark
                      ? "text-[#10B981]"
                      : "text-green-600"
                }`}
              >
                {formatAmount(Math.abs(remaining))}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div
              className={`w-full rounded-full h-1.5 md:h-2 overflow-hidden ${
                isDark ? "bg-[rgba(255,255,255,0.08)]" : "bg-gray-200"
              }`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full relative"
                style={{
                  backgroundColor: getProgressColor(),
                }}
              >
                {/* Shimmer effect */}
                <div
                  className="absolute inset-0 opacity-30 animate-pulse"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  }}
                />
              </motion.div>
            </div>
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] md:text-xs font-semibold"
                style={{
                  color: getProgressColor(),
                }}
              >
                {Math.min(percentageUsed, 100).toFixed(1)}% used
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`pt-2 md:pt-3 border-t flex items-center justify-between ${
            isDark ? "border-[rgba(255,255,255,0.08)]" : "border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-1">
            <Clock
              className={`w-2.5 h-2.5 md:w-3 md:h-3 ${isDark ? "text-[#B4B4B8]" : "text-gray-400"}`}
            />
            <span
              className={`text-[10px] md:text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-500"}`}
            >
              Ends{" "}
              {new Date(budget.end_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <span
            className="text-[10px] md:text-xs font-semibold"
            style={{ color: budget.color }}
          >
            View Details →
          </span>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </motion.div>
  );
};
