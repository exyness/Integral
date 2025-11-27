import { motion } from "framer-motion";
import { DollarSign, PieChart, TrendingDown, TrendingUp } from "lucide-react";
import React from "react";
import {
  batHang,
  batSwoop,
  candleTrio,
  catWitchHat,
  ghostDroopy,
  ghostScare,
  pumpkinScary,
  spiderCuteHanging,
  witchFly,
} from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrency } from "@/hooks/useCurrency";
import { Budget, BudgetTransaction } from "@/types/budget";

interface BudgetStatsProps {
  budgets: Budget[];
  transactions: BudgetTransaction[];
}

export const BudgetStats: React.FC<BudgetStatsProps> = ({
  budgets,
  transactions,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { formatAmount } = useCurrency();

  const stats = React.useMemo(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

    const quickExpenses = transactions
      .filter((t) => !t.budget_id)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpentWithQuickExpenses = totalSpent + quickExpenses;
    const remaining = totalBudget - totalSpentWithQuickExpenses;

    return {
      totalBudget,
      totalSpent: totalSpentWithQuickExpenses,
      remaining,
      activeBudgets: budgets.length,
    };
  }, [budgets, transactions]);

  const statCards = [
    {
      title: "Total Budget",
      value: stats.totalBudget,
      icon: DollarSign,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(139,92,246,0.1)]"
          : "bg-purple-50",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(139,92,246,0.2)]",
    },
    {
      title: "Total Spent",
      value: stats.totalSpent,
      icon: TrendingDown,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#EF4444]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(239,68,68,0.1)]"
          : "bg-red-50",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(239,68,68,0.2)]",
    },
    {
      title: "Remaining",
      value: Math.abs(stats.remaining),
      icon: TrendingUp,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#F59E0B]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(245,158,11,0.1)]"
          : "bg-amber-50",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(245,158,11,0.2)]",
    },
    {
      title: "Active Budgets",
      value: stats.activeBudgets,
      icon: PieChart,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#3B82F6]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(59,130,246,0.1)]"
          : "bg-blue-50",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(59,130,246,0.2)]",
    },
  ];

  const halloweenIcons = [pumpkinScary, ghostScare, catWitchHat, candleTrio];

  const cardDecorations = [spiderCuteHanging, batHang, ghostDroopy, candleTrio];

  const [hoveredCard, setHoveredCard] = React.useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 relative">
      {isHalloweenMode && (
        <>
          <img
            src={batSwoop}
            alt=""
            className="absolute -top-6 -left-4 w-12 md:w-16 opacity-20 pointer-events-none z-0 animate-pulse"
          />
          <img
            src={witchFly}
            alt=""
            className="absolute -top-8 right-10 w-16 md:w-20 opacity-15 pointer-events-none z-0"
          />
        </>
      )}
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          onMouseEnter={() => setHoveredCard(index)}
          onMouseLeave={() => setHoveredCard(null)}
          className={`relative overflow-hidden p-3 md:p-6 rounded-xl ${stat.bgColor} border ${stat.borderColor} ${
            isHalloweenMode ? "shadow-[0_0_10px_rgba(96,201,182,0.2)]" : ""
          }`}
        >
          {isHalloweenMode && (
            <img
              src={cardDecorations[index]}
              alt=""
              className="absolute top-1 right-1 w-4 md:w-5 opacity-12 pointer-events-none"
            />
          )}
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p
                className={`text-[10px] md:text-xs font-medium ${stat.color} mb-0.5 md:mb-1`}
              >
                {stat.title}
              </p>
              <p className={`text-base md:text-2xl font-bold ${stat.color}`}>
                {typeof stat.value === "number" &&
                stat.title !== "Active Budgets"
                  ? formatAmount(stat.value, 0)
                  : stat.value}
              </p>
            </div>
            <div
              className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl ${stat.bgColor} flex items-center justify-center`}
            >
              {isHalloweenMode ? (
                <motion.img
                  src={halloweenIcons[index]}
                  alt=""
                  className="w-5 h-5 md:w-8 md:h-8 object-contain"
                  animate={
                    hoveredCard === index
                      ? {
                          scale: [1, 1.2, 1],
                          rotate:
                            index === 0
                              ? [-10, 10, -10, 0]
                              : index === 2
                                ? [0, 5, -5, 0]
                                : 0,
                          y: index === 1 ? [0, -5, 0] : 0,
                        }
                      : { scale: 1, rotate: 0, y: 0 }
                  }
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut",
                  }}
                />
              ) : (
                <stat.icon className={`w-4 h-4 md:w-6 md:h-6 ${stat.color}`} />
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
