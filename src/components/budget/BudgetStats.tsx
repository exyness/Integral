import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  PieChart,
  Repeat,
  Wallet,
} from "lucide-react";
import React from "react";
import {
  batHang,
  batSwoop,
  candleTrio,
  catWitchHat,
  ghostDroopy,
  ghostScare,
  pumpkinScary,
  pumpkinWitchhat,
  spiderCuteHanging,
  witchFly,
} from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useAccountsQuery,
  useRecurringTransactionsQuery,
} from "@/hooks/queries/useBudgetsQuery";
import { useLiabilitiesQuery } from "@/hooks/queries/useLiabilities";
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
  const { data: accounts = [] } = useAccountsQuery();
  const { data: liabilities = [] } = useLiabilitiesQuery();
  const { data: recurringTransactions = [] } = useRecurringTransactionsQuery();

  const stats = React.useMemo(() => {
    // Budget stats
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const quickExpenses = transactions
      .filter((t) => !t.budget_id && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalSpentWithQuickExpenses = totalSpent + quickExpenses;

    // Account stats
    const totalAssets = accounts.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
    const netWorth = totalAssets - totalLiabilities;

    // Transaction stats (current month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyTransactions = transactions.filter((t) => {
      const date = new Date(t.transaction_date);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    });

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Recurring stats
    const activeRecurring = recurringTransactions.filter(
      (r) => r.active,
    ).length;
    const monthlyRecurringCost = recurringTransactions
      .filter((r) => r.active && r.type === "expense")
      .reduce((sum, r) => {
        // Convert to monthly cost
        if (r.interval === "daily") return sum + r.amount * 30;
        if (r.interval === "weekly") return sum + r.amount * 4;
        if (r.interval === "monthly") return sum + r.amount;
        if (r.interval === "yearly") return sum + r.amount / 12;
        return sum;
      }, 0);

    return {
      netWorth,
      totalAssets,
      monthlyIncome,
      monthlyExpenses,
      totalBudget,
      totalSpent: totalSpentWithQuickExpenses,
      activeRecurring,
      monthlyRecurringCost,
    };
  }, [budgets, transactions, accounts, liabilities, recurringTransactions]);

  const statCards = [
    {
      title: "Net Worth",
      value: stats.netWorth,
      icon: Wallet,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#06B6D4]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(6,182,212,0.1)]"
          : "bg-cyan-50",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(6,182,212,0.2)]",
      subtitle: `Assets: ${formatAmount(stats.totalAssets, 0)}`,
    },
    {
      title: "Monthly Income",
      value: stats.monthlyIncome,
      icon: ArrowUpRight,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#10B981]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(16,185,129,0.1)]"
          : "bg-green-50",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(16,185,129,0.2)]",
      subtitle: "This month",
    },
    {
      title: "Monthly Expenses",
      value: stats.monthlyExpenses,
      icon: ArrowDownRight,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#EF4444]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(239,68,68,0.1)]"
          : "bg-red-50",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(239,68,68,0.2)]",
      subtitle: "This month",
    },
    {
      title: "Budget Progress",
      value: stats.totalSpent,
      icon: PieChart,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(139,92,246,0.1)]"
          : "bg-purple-50",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(139,92,246,0.2)]",
      subtitle: `of ${formatAmount(stats.totalBudget, 0)}`,
    },
    {
      title: "Recurring Rules",
      value: stats.activeRecurring,
      icon: Repeat,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#F59E0B]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(245,158,11,0.1)]"
          : "bg-amber-50",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(245,158,11,0.2)]",
      subtitle: `~${formatAmount(stats.monthlyRecurringCost, 0)}/mo`,
    },
  ];

  const halloweenIcons = [
    pumpkinWitchhat,
    ghostScare,
    catWitchHat,
    pumpkinScary,
    candleTrio,
  ];

  const cardDecorations = [
    spiderCuteHanging,
    batHang,
    ghostDroopy,
    candleTrio,
    batSwoop,
  ];

  const [hoveredCard, setHoveredCard] = React.useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6 relative">
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
          <div className="flex items-center justify-between relative z-10 mb-1">
            <div className="flex-1 min-w-0">
              <p
                className={`text-[10px] md:text-xs font-medium ${stat.color} mb-0.5 md:mb-1`}
              >
                {stat.title}
              </p>
              <p
                className={`text-base md:text-2xl font-bold ${stat.color} truncate`}
              >
                {typeof stat.value === "number" &&
                stat.title !== "Recurring Rules"
                  ? formatAmount(stat.value, 0)
                  : stat.value}
              </p>
            </div>
            <div
              className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl ${stat.bgColor} flex items-center justify-center shrink-0 ml-2`}
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
          {stat.subtitle && (
            <p
              className={`text-[9px] md:text-xs relative z-10 truncate ${
                isHalloweenMode
                  ? "text-[#60c9b6]/60"
                  : isDark
                    ? "text-gray-400"
                    : "text-gray-600"
              }`}
            >
              {stat.subtitle}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
};
