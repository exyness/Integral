import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpDown,
  Award,
  Calendar,
  DollarSign,
  FileText,
  PieChart as PieChartIcon,
  Receipt,
  ShoppingBag,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  batGlide,
  batSwoop,
  candleFive,
  candleTrio,
  cardHauntedHouse,
  catWitchHat,
  ghostDroopy,
  ghostGenie,
  ghostJagged,
  ghostScare,
  pumpkinBlocky,
  pumpkinSneaky,
  pumpkinWitchhat,
  skullStaring,
  spiderCuteHanging,
  spiderHairyCrawling,
  webCenter,
  webCenterHanging,
  webCornerLeft,
  witchBrew,
  witchTakeoff,
} from "@/assets";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/contexts/ThemeContext";
import { useAnalyticsQuery } from "@/hooks/queries/useBudgetsQuery";
import { useCategoriesQuery } from "@/hooks/queries/useCategories";
import { useCurrency } from "@/hooks/useCurrency";
import { Budget, DateRangeFilter } from "@/types/budget";

const CATEGORY_COLORS: Record<string, string> = {
  food: "#F59E0B",
  transport: "#3B82F6",
  entertainment: "#EC4899",
  utilities: "#10B981",
  healthcare: "#EF4444",
  education: "#8B5CF6",
  shopping: "#F97316",
  savings: "#14B8A6",
  other: "#6B7280",

  rent: "#6366F1",
  fees: "#A855F7",
  bills: "#10B981",
  groceries: "#FBBF24",
  insurance: "#DC2626",
  subscriptions: "#8B5CF6",
  travel: "#06B6D4",
  dining: "#F97316",
  gas: "#3B82F6",
  clothing: "#EC4899",
  gifts: "#F472B6",
  personal: "#A78BFA",
  home: "#10B981",
  pets: "#FB923C",
  hobbies: "#EC4899",
  fitness: "#14B8A6",
  charity: "#F59E0B",
};

const HALLOWEEN_CATEGORY_COLORS: Record<string, string> = {
  food: "#F97316",
  transport: "#A855F7",
  entertainment: "#10B981",
  utilities: "#60c9b6",
  healthcare: "#EF4444",
  education: "#F59E0B",
  shopping: "#EC4899",
  savings: "#14B8A6",
  other: "#6B7280",
  rent: "#6366F1",
  fees: "#A855F7",
  bills: "#10B981",
  groceries: "#FBBF24",
  insurance: "#DC2626",
  subscriptions: "#8B5CF6",
  travel: "#06B6D4",
  dining: "#F97316",
  gas: "#3B82F6",
  clothing: "#EC4899",
  gifts: "#F472B6",
  personal: "#A78BFA",
  home: "#10B981",
  pets: "#FB923C",
  hobbies: "#EC4899",
  fitness: "#14B8A6",
  charity: "#F59E0B",
};

interface AnalyticsTabProps {
  budgets: Budget[];
}

export const BudgetAnalytics: React.FC<AnalyticsTabProps> = ({ budgets }) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { formatAmount, currency } = useCurrency();
  const [dateRange, setDateRange] = useState<DateRangeFilter>("month");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedParentCategory, setSelectedParentCategory] = useState<
    string | null
  >(null);
  const [sortBy, setSortBy] = useState<"amount" | "date">("amount");

  // Fetch categories for subcategory drill-down
  const { data: categories = [] } = useCategoriesQuery();

  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();

    switch (dateRange) {
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "30days":
        start.setDate(end.getDate() - 30);
        break;
      case "60days":
        start.setDate(end.getDate() - 60);
        break;
      case "90days":
        start.setDate(end.getDate() - 90);
        break;
      default:
        start.setMonth(end.getMonth() - 1);
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [dateRange]);

  const {
    data: analytics,
    isLoading,
    isFetching,
  } = useAnalyticsQuery(startDate, endDate);

  // Helper to check if a category has subcategories
  const hasSubcategories = (categoryName: string) => {
    const category = categories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
    );
    return category && categories.some((c) => c.parent_id === category.id);
  };

  // Handle category click for drill-down
  const handleCategoryClick = (categoryName: string) => {
    if (hasSubcategories(categoryName)) {
      setSelectedParentCategory(categoryName);
    }
  };

  // Handle back to overview
  const handleBackToOverview = () => {
    setSelectedParentCategory(null);
  };

  // Filter category breakdown based on drill-down
  const displayedCategoryBreakdown = useMemo(() => {
    if (!analytics) return [];
    if (!selectedParentCategory) return analytics.categoryBreakdown;

    // Find the parent category
    const parentCategory = categories.find(
      (c) => c.name.toLowerCase() === selectedParentCategory.toLowerCase(),
    );
    if (!parentCategory) return analytics.categoryBreakdown;

    // Get subcategory IDs
    const subcategoryIds = categories
      .filter((c) => c.parent_id === parentCategory.id)
      .map((c) => c.id);

    // Filter breakdown to only show subcategories
    // Note: This assumes analytics.categoryBreakdown has category IDs or names
    // You may need to adjust this based on your actual data structure
    return analytics.categoryBreakdown.filter((item) => {
      const itemCategory = categories.find(
        (c) => c.name.toLowerCase() === item.category.toLowerCase(),
      );
      return itemCategory && subcategoryIds.includes(itemCategory.id);
    });
  }, [analytics, selectedParentCategory, categories]);

  const budgetUtilization = useMemo(() => {
    if (!analytics) return 0;
    return analytics.budgetedVsActual.budgeted > 0
      ? (analytics.budgetedVsActual.actual /
          analytics.budgetedVsActual.budgeted) *
          100
      : 0;
  }, [analytics]);

  const isOverBudget = budgetUtilization > 100;
  const topCategory = analytics?.categoryBreakdown[0];

  const budgetHealthScore = useMemo(() => {
    if (!analytics || analytics.budgetedVsActual.budgeted === 0) return 100;
    const utilizationScore = Math.max(0, 100 - budgetUtilization);
    const diversityScore =
      analytics.categoryBreakdown.length > 0
        ? Math.min(100, analytics.categoryBreakdown.length * 10)
        : 0;
    const consistencyScore =
      analytics.transactionCount > 0
        ? Math.min(
            100,
            (analytics.averageTransaction / analytics.totalSpent) * 100 * 10,
          )
        : 0;
    return Math.round(
      (utilizationScore + diversityScore + consistencyScore) / 3,
    );
  }, [analytics, budgetUtilization]);

  const topInsights = useMemo(() => {
    if (!analytics)
      return {
        biggestExpense: null,
        mostFrequentCategory: null,
        savingsOpportunity: null,
      };
    const biggestExpense = analytics.topExpenses[0];
    const mostFrequentCategory = analytics.categoryBreakdown.reduce(
      (max, cat) => (cat.count > max.count ? cat : max),
      analytics.categoryBreakdown[0] || {
        category: "none",
        count: 0,
        amount: 0,
      },
    );

    const savingsOpportunity = budgets
      .map((b) => ({
        category: b.category,
        remaining: b.amount - b.spent,
        percentage: ((b.amount - b.spent) / b.amount) * 100,
      }))
      .filter((b) => b.remaining > 0)
      .sort((a, b) => b.remaining - a.remaining)[0];

    return {
      biggestExpense,
      mostFrequentCategory,
      savingsOpportunity,
    };
  }, [analytics, budgets]);

  const spendingVelocity = useMemo(() => {
    if (!analytics)
      return {
        dailyAverage: 0,
        projectedTotal: 0,
        daysRemaining: 0,
        isOnTrack: true,
      };
    const daysPassed = Math.max(
      1,
      Math.ceil(
        (new Date().getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );
    const totalDays = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const dailyAverage = analytics.totalSpent / daysPassed;
    const projectedTotal = dailyAverage * totalDays;
    const daysRemaining = totalDays - daysPassed;

    return {
      dailyAverage,
      projectedTotal,
      daysRemaining,
      isOnTrack:
        analytics.budgetedVsActual.budgeted > 0
          ? projectedTotal <= analytics.budgetedVsActual.budgeted
          : true,
    };
  }, [analytics, startDate, endDate]);

  const categoryBudgetData = useMemo(() => {
    if (!budgets) return [];
    return budgets.map((budget) => ({
      category: budget.category,
      budgeted: budget.amount,
      spent: budget.spent,
      remaining: Math.max(0, budget.amount - budget.spent),
    }));
  }, [budgets]);

  const weeklyComparisonData = useMemo(() => {
    if (!analytics || !analytics.dailySpending.length) return [];

    const weeks: {
      [key: string]: {
        week: string;
        amount: number;
        count: number;
        weekStart: Date;
      };
    } = {};

    analytics.dailySpending.forEach((day) => {
      const date = new Date(day.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeks[weekKey]) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        weeks[weekKey] = {
          week: `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
          amount: 0,
          count: 0,
          weekStart: weekStart,
        };
      }

      weeks[weekKey].amount += day.amount;
      weeks[weekKey].count += day.count;
    });

    return Object.values(weeks).slice(-4);
  }, [analytics]);

  const filteredTopExpenses = useMemo(() => {
    if (!analytics) return [];

    let filtered = analytics.topExpenses;

    if (selectedCategory) {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "amount") {
        return b.amount - a.amount;
      } else {
        return (
          new Date(b.transaction_date).getTime() -
          new Date(a.transaction_date).getTime()
        );
      }
    });

    return sorted.slice(0, 10);
  }, [analytics, selectedCategory, sortBy]);

  const chartTextColor = isDark ? "#B4B4B8" : "#6B7280";
  const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  if (isLoading || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative w-16 h-16">
          <div
            className={`absolute inset-0 rounded-full border-4 ${
              isDark
                ? "border-[rgba(139,92,246,0.2)]"
                : "border-[rgba(139,92,246,0.1)]"
            }`}
          />
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#8B5CF6] animate-spin"
            style={{ animationDuration: "0.8s" }}
          />
        </div>
        <p className={`text-sm ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}>
          Loading analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {isHalloweenMode && (
        <>
          <img
            src={webCenterHanging}
            alt=""
            className="absolute top-0 right-10 w-16 md:w-24 opacity-10 pointer-events-none"
          />
          <img
            src={batGlide}
            alt=""
            className="absolute top-20 left-4 w-12 md:w-16 opacity-12 pointer-events-none animate-pulse"
          />
          <img
            src={pumpkinWitchhat}
            alt=""
            className="absolute bottom-40 right-2 w-14 md:w-18 opacity-8 pointer-events-none"
          />
        </>
      )}
      {/* Header with Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 relative z-10">
        <div>
          <h2
            className={`text-xl sm:text-2xl font-bold ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            Spending Analytics
          </h2>
          <p
            className={`text-xs sm:text-sm mt-1 ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
          >
            {new Date(startDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(endDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Loading Indicator - centered between title and filters */}
        {isFetching && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center"
          >
            <div
              className={`px-3 py-1.5 rounded-lg backdrop-blur-md border shadow-lg flex items-center space-x-2 ${
                isDark
                  ? "bg-[rgba(139,92,246,0.2)] border-[rgba(139,92,246,0.3)]"
                  : "bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.2)]"
              }`}
            >
              <div
                className="w-3.5 h-3.5 rounded-full border-2 border-transparent border-t-[#8B5CF6] animate-spin"
                style={{ animationDuration: "0.6s" }}
              />
              <span className="text-xs font-medium text-[#8B5CF6]">
                Updating...
              </span>
            </div>
          </motion.div>
        )}

        <div className="flex space-x-1.5 sm:space-x-2 overflow-x-auto pb-1 -mx-1 px-1">
          {(
            ["week", "month", "30days", "60days", "90days"] as DateRangeFilter[]
          ).map((range) => (
            <motion.button
              key={range}
              onClick={() => setDateRange(range)}
              whileTap={{ scale: 0.95 }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap border ${
                dateRange === range
                  ? isHalloweenMode
                    ? "bg-[#60c9b6] text-black border-[#60c9b6] shadow-lg shadow-teal-500/30"
                    : "bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-lg shadow-purple-500/30"
                  : isHalloweenMode
                    ? isDark
                      ? "bg-transparent text-[#60c9b6] border-[#60c9b6]/50 hover:bg-[rgba(96,201,182,0.1)] hover:border-[#60c9b6]"
                      : "bg-transparent text-[#60c9b6] border-[#60c9b6]/50 hover:bg-[rgba(96,201,182,0.05)] hover:border-[#60c9b6]"
                    : isDark
                      ? "bg-transparent text-[#B4B4B8] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)]"
                      : "bg-transparent text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              {range === "week"
                ? "7D"
                : range === "month"
                  ? "1M"
                  : range === "30days"
                    ? "30D"
                    : range === "60days"
                      ? "60D"
                      : "90D"}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-3 md:p-6 rounded-xl border transition-all relative overflow-hidden ${
            isHalloweenMode
              ? isDark
                ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)] hover:bg-[rgba(96,201,182,0.15)]"
                : "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)] hover:bg-[rgba(96,201,182,0.1)]"
              : isDark
                ? "bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.15)]"
                : "bg-[rgba(139,92,246,0.05)] border-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.1)]"
          }`}
        >
          {isHalloweenMode && (
            <img
              src={ghostScare}
              alt=""
              className="absolute top-0 right-0 w-8 md:w-10 opacity-12 pointer-events-none"
            />
          )}
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p
                className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${
                  isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"
                }`}
              >
                Total Spent
              </p>
              <p
                className={`text-base md:text-2xl font-bold ${
                  isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"
                }`}
              >
                {formatAmount(analytics.totalSpent, 0)}
              </p>
            </div>
            <div
              className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${
                isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.2)] border border-[#60c9b6]/30"
                  : "bg-[rgba(139,92,246,0.2)]"
              }`}
            >
              {isHalloweenMode ? (
                <img
                  src={pumpkinWitchhat}
                  alt=""
                  className="w-5 h-5 md:w-7 md:h-7 drop-shadow-lg"
                />
              ) : (
                <DollarSign
                  className={`w-4 h-4 md:w-6 md:h-6 text-[#8B5CF6]"`}
                />
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-3 md:p-6 rounded-xl border transition-all ${
            isDark
              ? "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.15)]"
              : "bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.1)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-medium text-[#10B981] mb-0.5 md:mb-1">
                Transactions
              </p>
              <p className="text-base md:text-2xl font-bold text-[#10B981]">
                {analytics.transactionCount}
              </p>
            </div>
            <div
              className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${
                isHalloweenMode
                  ? "bg-[rgba(16,185,129,0.2)] border border-[#10B981]/30"
                  : "bg-[rgba(16,185,129,0.2)]"
              }`}
            >
              {isHalloweenMode ? (
                <img
                  src={ghostScare}
                  alt=""
                  className="w-5 h-5 md:w-7 md:h-7 drop-shadow-lg"
                />
              ) : (
                <Receipt className="w-4 h-4 md:w-6 md:h-6 text-[#10B981]" />
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-3 md:p-6 rounded-xl border transition-all relative overflow-hidden ${
            isHalloweenMode
              ? isDark
                ? "bg-[rgba(255,107,0,0.1)] border-[rgba(255,107,0,0.2)] hover:bg-[rgba(255,107,0,0.15)]"
                : "bg-[rgba(255,107,0,0.05)] border-[rgba(255,107,0,0.2)] hover:bg-[rgba(255,107,0,0.1)]"
              : isDark
                ? "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)] hover:bg-[rgba(245,158,11,0.15)]"
                : "bg-[rgba(245,158,11,0.05)] border-[rgba(245,158,11,0.2)] hover:bg-[rgba(245,158,11,0.1)]"
          }`}
        >
          {isHalloweenMode && (
            <img
              src={catWitchHat}
              alt=""
              className="absolute bottom-0 right-0 w-8 md:w-10 opacity-15 pointer-events-none"
            />
          )}
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p
                className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${
                  isHalloweenMode ? "text-[#FF6B00]" : "text-[#F59E0B]"
                }`}
              >
                Average
              </p>
              <p
                className={`text-base md:text-2xl font-bold ${
                  isHalloweenMode ? "text-[#FF6B00]" : "text-[#F59E0B]"
                }`}
              >
                {formatAmount(analytics.averageTransaction, 0)}
              </p>
            </div>
            <div
              className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${
                isHalloweenMode
                  ? "bg-[rgba(255,107,0,0.2)] border border-[#FF6B00]/30"
                  : "bg-[rgba(245,158,11,0.2)]"
              }`}
            >
              {isHalloweenMode ? (
                <img
                  src={candleFive}
                  alt=""
                  className="w-5 h-5 md:w-7 md:h-7 drop-shadow-lg"
                />
              ) : (
                <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-[#F59E0B]" />
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-3 md:p-6 rounded-xl border transition-all relative overflow-hidden ${
            isHalloweenMode
              ? isDark
                ? "bg-[rgba(138,43,226,0.1)] border-[rgba(138,43,226,0.2)] hover:bg-[rgba(138,43,226,0.15)]"
                : "bg-[rgba(138,43,226,0.05)] border-[rgba(138,43,226,0.2)] hover:bg-[rgba(138,43,226,0.1)]"
              : isDark
                ? "bg-[rgba(59,130,246,0.1)] border-[rgba(59,130,246,0.2)] hover:bg-[rgba(59,130,246,0.15)]"
                : "bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.2)] hover:bg-[rgba(59,130,246,0.1)]"
          }`}
        >
          {isHalloweenMode && (
            <img
              src={spiderCuteHanging}
              alt=""
              className="absolute top-0 right-0 w-6 md:w-8 opacity-18 pointer-events-none"
            />
          )}
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p
                className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${
                  isHalloweenMode ? "text-[#8A2BE2]" : "text-[#3B82F6]"
                }`}
              >
                Categories
              </p>
              <p
                className={`text-base md:text-2xl font-bold ${
                  isHalloweenMode ? "text-[#8A2BE2]" : "text-[#3B82F6]"
                }`}
              >
                {analytics.categoryBreakdown.length}
              </p>
            </div>
            <div
              className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${
                isHalloweenMode
                  ? "bg-[rgba(138,43,226,0.2)] border border-[#8A2BE2]/30"
                  : "bg-[rgba(59,130,246,0.2)]"
              }`}
            >
              {isHalloweenMode ? (
                <img
                  src={catWitchHat}
                  alt=""
                  className="w-5 h-5 md:w-7 md:h-7 drop-shadow-lg"
                />
              ) : (
                <PieChartIcon className="w-4 h-4 md:w-6 md:h-6 text-[#3B82F6]" />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Spending Insights Card */}
      {topCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard variant="primary" className="p-6 relative overflow-hidden">
            {isHalloweenMode && (
              <motion.img
                src={ghostDroopy}
                alt=""
                className="absolute top-0 right-0 w-24 opacity-10 pointer-events-none z-10"
                animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
            <div className="flex items-start justify-between mb-3 sm:mb-4 relative z-20">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div
                  className={`p-2 sm:p-2.5 rounded-lg ${
                    isOverBudget
                      ? "bg-[rgba(239,68,68,0.15)]"
                      : budgetUtilization > 80
                        ? "bg-[rgba(245,158,11,0.15)]"
                        : "bg-[rgba(16,185,129,0.15)]"
                  }`}
                >
                  {isOverBudget ? (
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#EF4444]" />
                  ) : budgetUtilization > 80 ? (
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#F59E0B]" />
                  ) : (
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#10B981]" />
                  )}
                </div>
                <div>
                  <h3
                    className={`text-base sm:text-lg font-bold mb-0.5 sm:mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Spending Insights
                  </h3>
                  <p
                    className={`text-xs sm:text-sm ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                  >
                    {new Date(startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {/* Budget Health Score */}
              <div
                className={`p-3 sm:p-4 rounded-lg border relative overflow-hidden ${
                  isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.15)] border-[rgba(96,201,182,0.3)] shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                    : budgetHealthScore >= 70
                      ? isDark
                        ? "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)]"
                        : "bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)]"
                      : budgetHealthScore >= 40
                        ? isDark
                          ? "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)]"
                          : "bg-[rgba(245,158,11,0.05)] border-[rgba(245,158,11,0.2)]"
                        : isDark
                          ? "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)]"
                          : "bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.2)]"
                }`}
              >
                {isHalloweenMode && (
                  <>
                    <div className="absolute -top-6 -left-6 opacity-10 pointer-events-none">
                      <img
                        src={webCornerLeft}
                        alt=""
                        className="w-32 h-32 rotate-12"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 opacity-20 pointer-events-none">
                      <img
                        src={spiderHairyCrawling}
                        alt=""
                        className="w-16 h-16"
                      />
                    </div>
                  </>
                )}
                <div className="flex flex-col items-center justify-center h-full relative z-10">
                  <div className="relative w-16 h-16 mb-2">
                    <svg className="transform -rotate-90 w-16 h-16">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke={
                          isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                        }
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke={
                          isHalloweenMode
                            ? "#60c9b6"
                            : budgetHealthScore >= 70
                              ? "#10B981"
                              : budgetHealthScore >= 40
                                ? "#F59E0B"
                                : "#EF4444"
                        }
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${(budgetHealthScore / 100) * 175.93} 175.93`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className={`text-lg font-bold ${
                          isHalloweenMode
                            ? "text-[#60c9b6]"
                            : budgetHealthScore >= 70
                              ? "text-[#10B981]"
                              : budgetHealthScore >= 40
                                ? "text-[#F59E0B]"
                                : "text-[#EF4444]"
                        }`}
                      >
                        {budgetHealthScore}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-center">
                    <span
                      className={
                        budgetHealthScore >= 70
                          ? "text-[#10B981]"
                          : budgetHealthScore >= 40
                            ? "text-[#F59E0B]"
                            : "text-[#EF4444]"
                      }
                    >
                      Budget Health
                    </span>
                  </p>
                  <p
                    className={`text-xs text-center ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                  >
                    {budgetHealthScore >= 70
                      ? "Excellent"
                      : budgetHealthScore >= 40
                        ? "Good"
                        : "Needs Attention"}
                  </p>
                </div>
              </div>

              {/* Budget Status */}
              <div
                className={`p-3 sm:p-4 rounded-lg border relative overflow-hidden ${
                  isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.15)] border-[rgba(96,201,182,0.3)] shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                    : isOverBudget
                      ? isDark
                        ? "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)]"
                        : "bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.2)]"
                      : budgetUtilization > 80
                        ? isDark
                          ? "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)]"
                          : "bg-[rgba(245,158,11,0.05)] border-[rgba(245,158,11,0.2)]"
                        : isDark
                          ? "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)]"
                          : "bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)]"
                }`}
              >
                {isHalloweenMode && (
                  <div className="absolute -top-4 -right-4 opacity-10 pointer-events-none">
                    <img
                      src={batSwoop}
                      alt=""
                      className="w-24 h-24 -rotate-12"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <span
                    className={`text-xs font-medium ${
                      isOverBudget
                        ? "text-[#EF4444]"
                        : budgetUtilization > 80
                          ? "text-[#F59E0B]"
                          : "text-[#10B981]"
                    }`}
                  >
                    Budget Status
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      isOverBudget
                        ? "text-[#EF4444]"
                        : budgetUtilization > 80
                          ? "text-[#F59E0B]"
                          : "text-[#10B981]"
                    }`}
                  >
                    {budgetUtilization.toFixed(0)}%
                  </span>
                </div>
                <p
                  className={`text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                >
                  {isOverBudget
                    ? `${(budgetUtilization - 100).toFixed(0)}% over budget limit`
                    : budgetUtilization > 80
                      ? `${(100 - budgetUtilization).toFixed(0)}% remaining`
                      : "On track with budget"}
                </p>
              </div>

              {/* Top Category */}
              <div
                className={`p-3 sm:p-4 rounded-lg border relative overflow-hidden ${
                  isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.15)] border-[rgba(96,201,182,0.3)] shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                    : isDark
                      ? "bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.2)]"
                      : "bg-[rgba(139,92,246,0.05)] border-[rgba(139,92,246,0.2)]"
                }`}
              >
                {isHalloweenMode && (
                  <div className="absolute -bottom-6 -right-6 opacity-10 pointer-events-none">
                    <img
                      src={pumpkinBlocky}
                      alt=""
                      className="w-24 h-24 rotate-12"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <span
                    className={`text-xs font-medium ${isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"}`}
                  >
                    Top Category
                  </span>
                  <span className="text-lg font-bold text-[#8B5CF6]">
                    {topCategory.percentage.toFixed(0)}%
                  </span>
                </div>
                <p
                  className={`text-xs capitalize ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                >
                  {topCategory.category} • {formatAmount(topCategory.amount, 0)}
                </p>
              </div>

              {/* Quick Expenses */}
              <div
                className={`p-3 sm:p-4 rounded-lg border relative overflow-hidden ${
                  isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.15)] border-[rgba(96,201,182,0.3)] shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                    : isDark
                      ? "bg-[rgba(59,130,246,0.1)] border-[rgba(59,130,246,0.2)]"
                      : "bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.2)]"
                }`}
              >
                {isHalloweenMode && (
                  <div className="absolute -bottom-4 -left-4 opacity-10 pointer-events-none">
                    <img
                      src={candleFive}
                      alt=""
                      className="w-20 h-20 -rotate-6"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <span
                    className={`text-xs font-medium ${isHalloweenMode ? "text-[#60c9b6]" : "text-[#3B82F6]"}`}
                  >
                    Quick Expenses
                  </span>
                  <span className="text-lg font-bold text-[#3B82F6]">
                    {analytics.totalSpent > 0
                      ? (
                          (analytics.budgetedVsActual.standalone /
                            analytics.totalSpent) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </span>
                </div>
                <p
                  className={`text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                >
                  {formatAmount(analytics.budgetedVsActual.standalone, 0)} of
                  total
                </p>
              </div>
            </div>

            {/* Suggestion Text */}
            <div
              className={`mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg ${
                isDark ? "bg-[rgba(255,255,255,0.03)]" : "bg-gray-50"
              }`}
            >
              <p
                className={`text-sm ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
              >
                {isOverBudget
                  ? `You're over budget. Consider reviewing your ${topCategory.category} expenses or adjusting your budget limits.`
                  : budgetUtilization > 80
                    ? `You're approaching your budget limit. ${topCategory.category} is your top spending category at ${topCategory.percentage.toFixed(0)}%.`
                    : `You're on track! ${topCategory.category} is your top spending category (${topCategory.percentage.toFixed(0)}% of total).`}
              </p>
            </div>

            {/* Key Insights */}
            <div className="mt-4 sm:mt-6">
              <h4
                className={`text-sm sm:text-base font-bold mb-2 sm:mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Key Insights
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {/* Biggest Expense */}
                {topInsights.biggestExpense && (
                  <div
                    className={`p-2.5 sm:p-3 rounded-lg border relative overflow-hidden ${
                      isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.15)] border-[rgba(96,201,182,0.3)] shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                        : isDark
                          ? "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)]"
                          : "bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.2)]"
                    }`}
                  >
                    {isHalloweenMode && (
                      <div className="absolute -top-4 -right-4 opacity-10 pointer-events-none">
                        <img
                          src={ghostJagged}
                          alt=""
                          className="w-24 h-24 rotate-12"
                        />
                      </div>
                    )}
                    <div className="flex items-start space-x-1.5 sm:space-x-2 relative z-10">
                      <div
                        className={`p-1 sm:p-1.5 rounded-lg ${
                          isHalloweenMode
                            ? "bg-[rgba(96,201,182,0.2)]"
                            : "bg-[rgba(239,68,68,0.2)]"
                        }`}
                      >
                        {isHalloweenMode ? (
                          <img
                            src={ghostScare}
                            alt=""
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm"
                          />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EF4444]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-medium mb-0.5 ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : "text-[#EF4444]"
                          }`}
                        >
                          Biggest Expense
                        </p>
                        <p
                          className={`text-xs sm:text-sm font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          {topInsights.biggestExpense.description}
                        </p>
                        <p
                          className={`text-sm sm:text-base font-bold ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : "text-[#EF4444]"
                          }`}
                        >
                          {formatAmount(topInsights.biggestExpense.amount, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Most Frequent Category */}
                {topInsights.mostFrequentCategory && (
                  <div
                    className={`p-2.5 sm:p-3 rounded-lg border relative overflow-hidden ${
                      isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.15)] border-[rgba(96,201,182,0.3)] shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                        : isDark
                          ? "bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.2)]"
                          : "bg-[rgba(139,92,246,0.05)] border-[rgba(139,92,246,0.2)]"
                    }`}
                  >
                    {isHalloweenMode && (
                      <div className="absolute -bottom-4 -right-4 opacity-10 pointer-events-none">
                        <img
                          src={spiderHairyCrawling}
                          alt=""
                          className="w-24 h-24 -rotate-12"
                        />
                      </div>
                    )}
                    <div className="flex items-start space-x-1.5 sm:space-x-2 relative z-10">
                      <div
                        className={`p-1 sm:p-1.5 rounded-lg ${
                          isHalloweenMode
                            ? "bg-[rgba(96,201,182,0.2)]"
                            : "bg-[rgba(139,92,246,0.2)]"
                        }`}
                      >
                        {isHalloweenMode ? (
                          <img
                            src={pumpkinSneaky}
                            alt=""
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm"
                          />
                        ) : (
                          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8B5CF6]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-xs font-medium mb-0.5 ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : "text-[#8B5CF6]"
                          }`}
                        >
                          Most Frequent
                        </p>
                        <p
                          className={`text-xs sm:text-sm font-bold capitalize ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          {topInsights.mostFrequentCategory.category}
                        </p>
                        <p
                          className={`text-sm sm:text-base font-bold ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : "text-[#8B5CF6]"
                          }`}
                        >
                          {topInsights.mostFrequentCategory.count} transactions
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Savings Opportunity or Spending Velocity */}
                {topInsights.savingsOpportunity ? (
                  <div
                    className={`p-2.5 sm:p-3 rounded-lg border relative overflow-hidden ${
                      isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.15)] border-[rgba(96,201,182,0.3)] shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                        : isDark
                          ? "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)]"
                          : "bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)]"
                    }`}
                  >
                    {isHalloweenMode && (
                      <div className="absolute -top-2 -right-2 opacity-10 pointer-events-none">
                        <img
                          src={spiderCuteHanging}
                          alt=""
                          className="w-20 h-20 rotate-6"
                        />
                      </div>
                    )}
                    <div className="flex items-start space-x-1.5 sm:space-x-2 relative z-10">
                      <div
                        className={`p-1 sm:p-1.5 rounded-lg ${
                          isHalloweenMode
                            ? "bg-[rgba(96,201,182,0.2)]"
                            : "bg-[rgba(16,185,129,0.2)]"
                        }`}
                      >
                        {isHalloweenMode ? (
                          <img
                            src={spiderCuteHanging}
                            alt=""
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm"
                          />
                        ) : (
                          <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#10B981]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-xs font-medium mb-0.5 ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : "text-[#10B981]"
                          }`}
                        >
                          Savings Opportunity
                        </p>
                        <p
                          className={`text-xs sm:text-sm font-bold capitalize ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          {topInsights.savingsOpportunity.category}
                        </p>
                        <p
                          className={`text-sm sm:text-base font-bold ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : "text-[#10B981]"
                          }`}
                        >
                          {formatAmount(
                            topInsights.savingsOpportunity.remaining,
                            0,
                          )}{" "}
                          left
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-2.5 sm:p-3 rounded-lg border relative overflow-hidden ${
                      isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.15)] border-[rgba(96,201,182,0.3)] shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                        : isDark
                          ? "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)]"
                          : "bg-[rgba(245,158,11,0.05)] border-[rgba(245,158,11,0.2)]"
                    }`}
                  >
                    {isHalloweenMode && (
                      <div className="absolute -bottom-4 -right-4 opacity-10 pointer-events-none">
                        <img
                          src={batGlide}
                          alt=""
                          className="w-24 h-24 -rotate-12"
                        />
                      </div>
                    )}
                    <div className="flex items-start space-x-1.5 sm:space-x-2 relative z-10">
                      <div
                        className={`p-1 sm:p-1.5 rounded-lg ${
                          isHalloweenMode
                            ? "bg-[rgba(96,201,182,0.2)]"
                            : "bg-[rgba(245,158,11,0.2)]"
                        }`}
                      >
                        {isHalloweenMode ? (
                          <img
                            src={batGlide}
                            alt=""
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm"
                          />
                        ) : (
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F59E0B]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-xs font-medium mb-0.5 ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : "text-[#F59E0B]"
                          }`}
                        >
                          Spending Velocity
                        </p>
                        <p
                          className={`text-xs sm:text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          {formatAmount(spendingVelocity.dailyAverage, 0)}/day
                        </p>
                        <p
                          className={`text-sm sm:text-base font-bold ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : "text-[#F59E0B]"
                          }`}
                        >
                          {spendingVelocity.daysRemaining} days left
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Category Pie Chart */}
        <GlassCard
          variant="secondary"
          className={`relative overflow-hidden h-full ${
            isHalloweenMode
              ? "bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
              : ""
          }`}
        >
          {isHalloweenMode && (
            <div className="absolute -top-10 -right-10 pointer-events-none z-0">
              <img
                src={webCenterHanging}
                alt=""
                className="w-48 h-48 rotate-12 opacity-80"
              />
            </div>
          )}
          <div className="p-3 sm:p-6">
            {/* Breadcrumb and Back Button */}
            {selectedParentCategory && (
              <div className="mb-4">
                <button
                  onClick={handleBackToOverview}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isHalloweenMode
                      ? "bg-[#60c9b6]/20 text-[#60c9b6] hover:bg-[#60c9b6]/30"
                      : isDark
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to All Categories
                </button>
              </div>
            )}
            <h3
              className={`text-sm sm:text-lg font-bold mb-2 sm:mb-4 relative z-10 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              {selectedParentCategory
                ? `${selectedParentCategory.charAt(0).toUpperCase() + selectedParentCategory.slice(1)} Breakdown`
                : "Spending by Category"}
            </h3>
            {displayedCategoryBreakdown.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height={240}
                className="sm:h-[280px]!"
              >
                <PieChart>
                  <Pie
                    data={displayedCategoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    className="sm:!innerRadius-[50] sm:!outerRadius-[85]"
                    onClick={(data) => {
                      if (!selectedParentCategory && data && data.category) {
                        handleCategoryClick(data.category);
                      }
                    }}
                  >
                    {displayedCategoryBreakdown.map((entry, index) => {
                      const isClickable =
                        !selectedParentCategory &&
                        hasSubcategories(entry.category);
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            isHalloweenMode
                              ? HALLOWEEN_CATEGORY_COLORS[
                                  entry.category.toLowerCase()
                                ] ||
                                entry.color ||
                                "#60c9b6"
                              : entry.color ||
                                CATEGORY_COLORS[entry.category.toLowerCase()] ||
                                "#6B7280"
                          }
                          style={{
                            cursor: isClickable ? "pointer" : "default",
                            opacity: isClickable ? 1 : 0.95,
                          }}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#2D2D32" : "#FFFFFF",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}`,
                      borderRadius: "8px",
                      padding: "8px 12px",
                      boxShadow: isDark
                        ? "0 8px 32px rgba(0,0,0,0.6)"
                        : "0 4px 16px rgba(0,0,0,0.1)",
                      color: isDark ? "#FFFFFF" : "#1F1F1F",
                      fontSize: "12px",
                    }}
                    labelStyle={{
                      color: isDark ? "#FFFFFF" : "#1F1F1F",
                      fontWeight: "600",
                      marginBottom: "2px",
                      fontSize: "11px",
                    }}
                    itemStyle={{
                      color: isDark ? "#E5E5E7" : "#4B5563",
                      fontSize: "11px",
                    }}
                    formatter={(
                      value: number,
                      name: string,
                      props: { payload: { percentage: number } },
                    ) => {
                      const percentage = props.payload.percentage;
                      return [
                        `${currency.symbol}${value.toFixed(2)} (${percentage.toFixed(1)}%)`,
                        name.charAt(0).toUpperCase() + name.slice(1),
                      ];
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{
                      fontSize: "11px",
                      paddingTop: "8px",
                    }}
                    iconSize={10}
                    formatter={(value) => {
                      const categoryData = displayedCategoryBreakdown.find(
                        (cat) => cat.category === value,
                      );
                      const percentage = categoryData?.percentage || 0;
                      const categoryName =
                        value.charAt(0).toUpperCase() + value.slice(1);
                      return `${categoryName} (${percentage.toFixed(1)}%)`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="relative overflow-hidden rounded-xl h-[240px] sm:h-[300px] flex items-center justify-center p-6">
                {isHalloweenMode && (
                  <motion.img
                    src={pumpkinBlocky}
                    alt=""
                    className="absolute bottom-4 right-4 w-20 opacity-10 pointer-events-none z-0"
                    style={{
                      filter: "drop-shadow(0 0 20px rgba(245, 158, 11, 0.4))",
                    }}
                    animate={{
                      rotate: [-5, 5, -5],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
                <motion.div
                  className="relative z-10 text-center max-w-xs mx-auto"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {isHalloweenMode ? (
                    <motion.img
                      src={skullStaring}
                      alt=""
                      className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 opacity-80"
                      style={{
                        filter: "drop-shadow(0 0 25px rgba(96, 201, 182, 0.5))",
                      }}
                      animate={{
                        rotate: [-3, 3, -3],
                      }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ) : (
                    <div
                      className={`w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        isDark
                          ? "bg-[rgba(139,92,246,0.1)] border-2 border-[rgba(139,92,246,0.3)]"
                          : "bg-[rgba(139,92,246,0.05)] border-2 border-[rgba(139,92,246,0.2)]"
                      }`}
                    >
                      <PieChartIcon
                        className={`w-10 h-10 md:w-12 md:h-12 ${isDark ? "text-[#8B5CF6]" : "text-[#7C3AED]"}`}
                      />
                    </div>
                  )}
                  <h4
                    className={`text-base md:text-lg font-bold mb-2 ${
                      isHalloweenMode
                        ? "text-[#60c9b6] font-creepster tracking-wide"
                        : isDark
                          ? "text-white"
                          : "text-gray-900"
                    }`}
                  >
                    {isHalloweenMode
                      ? "No Category Spirits"
                      : "No Data Available"}
                  </h4>
                  <p
                    className={`text-xs sm:text-sm ${
                      isHalloweenMode
                        ? "text-[#60c9b6]/70"
                        : isDark
                          ? "text-[#B4B4B8]"
                          : "text-gray-600"
                    }`}
                  >
                    {isHalloweenMode
                      ? "The mystical categories await your summons. Add expenses to see the spectral breakdown."
                      : "Add transactions to different categories to see the spending distribution."}
                  </p>
                </motion.div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Spending Comparison */}
        <GlassCard
          variant="secondary"
          className={`relative overflow-hidden h-full ${
            isHalloweenMode
              ? "bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
              : ""
          }`}
        >
          {isHalloweenMode && (
            <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none z-0">
              <img src={ghostScare} alt="" className="w-48 h-48 -rotate-12" />
            </div>
          )}
          <div className="p-4 sm:p-6">
            <h3
              className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Spending Comparison
            </h3>
            <div className="space-y-3 sm:space-y-5">
              {/* Total Budgeted vs Spent */}
              <div>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span
                    className={`text-xs sm:text-sm font-medium ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                  >
                    Total Budget
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      isHalloweenMode
                        ? "text-[#60c9b6]"
                        : isDark
                          ? "text-white"
                          : "text-gray-900"
                    }`}
                  >
                    {formatAmount(analytics.budgetedVsActual.budgeted, 0)}
                  </span>
                </div>
                <div className="relative h-2 sm:h-2.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`absolute h-full rounded-full ${
                      isHalloweenMode
                        ? "bg-linear-to-r from-[#60c9b6] to-[#34d399]"
                        : "bg-linear-to-r from-purple-500 to-purple-600"
                    }`}
                  />
                </div>
              </div>

              {/* Budgeted Spending */}
              <div>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span
                    className={`text-xs sm:text-sm font-medium ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                  >
                    Budgeted Spending
                  </span>
                  <div className="text-right">
                    <span
                      className={`text-xs sm:text-sm font-bold block ${
                        isHalloweenMode ? "text-[#60c9b6]" : "text-[#F59E0B]"
                      }`}
                    >
                      {formatAmount(analytics.budgetedVsActual.actual, 0)}
                    </span>
                    <span
                      className={`text-[10px] sm:text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                    >
                      {budgetUtilization.toFixed(1)}% of budget
                    </span>
                  </div>
                </div>
                <div className="relative h-2 sm:h-2.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className={`absolute h-full rounded-full ${
                      isHalloweenMode
                        ? isOverBudget
                          ? "bg-linear-to-r from-red-500 to-orange-600"
                          : "bg-linear-to-r from-orange-400 to-orange-600"
                        : isOverBudget
                          ? "bg-linear-to-r from-red-500 to-orange-500"
                          : "bg-linear-to-r from-orange-500 to-amber-500"
                    }`}
                  />
                </div>
              </div>

              {/* Quick Expenses */}
              <div>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span
                    className={`text-xs sm:text-sm font-medium ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                  >
                    Quick Expenses
                  </span>
                  <div className="text-right">
                    <span
                      className={`text-xs sm:text-sm font-bold block ${
                        isHalloweenMode ? "text-[#60c9b6]" : "text-[#10B981]"
                      }`}
                    >
                      {formatAmount(analytics.budgetedVsActual.standalone, 0)}
                    </span>
                    <span
                      className={`text-[10px] sm:text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                    >
                      {analytics.totalSpent > 0
                        ? `${((analytics.budgetedVsActual.standalone / analytics.totalSpent) * 100).toFixed(1)}% of total`
                        : "0% of total"}
                    </span>
                  </div>
                </div>
                <div className="relative h-2 sm:h-2.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        analytics.totalSpent > 0
                          ? `${(analytics.budgetedVsActual.standalone / analytics.totalSpent) * 100}%`
                          : "0%",
                    }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                    className={`absolute h-full rounded-full ${
                      isHalloweenMode
                        ? "bg-linear-to-r from-[#60c9b6] to-[#34d399]"
                        : "bg-linear-to-r from-green-500 to-emerald-500"
                    }`}
                  />
                </div>
              </div>

              {/* Summary Stats */}
              <div
                className={`mt-2 sm:mt-4 p-2.5 sm:p-4 rounded-lg border ${
                  isDark
                    ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]"
                    : "bg-gray-50 border-gray-100"
                }`}
              >
                <div className="flex items-center justify-around sm:grid sm:grid-cols-2 sm:gap-4">
                  <div className="text-center sm:text-left">
                    <p
                      className={`text-[10px] sm:text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"} mb-0.5 sm:mb-1`}
                    >
                      Remaining
                    </p>
                    <p
                      className={`text-sm sm:text-base font-bold ${
                        analytics.budgetedVsActual.budgeted -
                          analytics.totalSpent >=
                        0
                          ? "text-[#10B981]"
                          : "text-[#EF4444]"
                      }`}
                    >
                      {formatAmount(
                        Math.abs(
                          analytics.budgetedVsActual.budgeted -
                            analytics.totalSpent,
                        ),
                        0,
                      )}
                    </p>
                  </div>
                  <div
                    className={`w-px h-8 sm:hidden ${isDark ? "bg-[rgba(255,255,255,0.1)]" : "bg-gray-300"}`}
                  />
                  <div className="text-center sm:text-left">
                    <p
                      className={`text-[10px] sm:text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"} mb-0.5 sm:mb-1`}
                    >
                      Daily Avg
                    </p>
                    <p
                      className={`text-sm sm:text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {formatAmount(
                        analytics.totalSpent /
                          Math.max(
                            1,
                            Math.ceil(
                              (new Date(endDate).getTime() -
                                new Date(startDate).getTime()) /
                                (1000 * 60 * 60 * 24),
                            ),
                          ),
                        0,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Category Budget vs Actual Bar Chart */}
      {categoryBudgetData.length > 0 && (
        <GlassCard
          variant="secondary"
          className={`relative overflow-hidden ${
            isHalloweenMode
              ? "bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
              : ""
          }`}
        >
          {isHalloweenMode && (
            <div className="absolute -bottom-6 -left-6 opacity-10 pointer-events-none z-0">
              <img src={witchTakeoff} alt="" className="w-32 h-32 rotate-12" />
            </div>
          )}
          <div className="p-4 sm:p-6">
            <h3
              className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              Budget vs Actual by Category
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={categoryBudgetData}
                layout="vertical"
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridColor}
                  strokeOpacity={0.3}
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  type="number"
                  stroke={chartTextColor}
                  tick={{ fill: chartTextColor, fontSize: 9 }}
                  tickFormatter={(value) =>
                    `${currency.symbol}${value > 999 ? `${(value / 1000).toFixed(1)}k` : value}`
                  }
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  stroke={chartTextColor}
                  tick={{ fill: chartTextColor, fontSize: 9 }}
                  width={65}
                  tickFormatter={(value) =>
                    value.length > 8
                      ? value.slice(0, 7) + ".."
                      : value.charAt(0).toUpperCase() + value.slice(1)
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#2D2D32" : "#FFFFFF",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}`,
                    borderRadius: "12px",
                    padding: "12px 16px",
                    boxShadow: isDark
                      ? "0 8px 32px rgba(0,0,0,0.6)"
                      : "0 4px 16px rgba(0,0,0,0.1)",
                    color: isDark ? "#FFFFFF" : "#1F1F1F",
                  }}
                  labelStyle={{
                    color: isDark ? "#FFFFFF" : "#1F1F1F",
                    fontWeight: "600",
                    marginBottom: "4px",
                    textTransform: "capitalize",
                  }}
                  itemStyle={{
                    color: isDark ? "#E5E5E7" : "#4B5563",
                  }}
                  formatter={(value: number) => [
                    `${currency.symbol}${value.toFixed(2)}`,
                  ]}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: "12px",
                    fontSize: "12px",
                  }}
                  iconSize={10}
                />
                <Bar
                  dataKey="budgeted"
                  fill={isHalloweenMode ? "#60c9b6" : "#8B5CF6"}
                  radius={[0, 4, 4, 0]}
                  name="Budgeted"
                />
                <Bar
                  dataKey="spent"
                  fill={isHalloweenMode ? "#F97316" : "#F59E0B"}
                  radius={[0, 4, 4, 0]}
                  name="Spent"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* Daily Spending Chart with Projection */}
      <GlassCard
        variant="secondary"
        className={`relative overflow-hidden ${
          isHalloweenMode
            ? "bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
            : ""
        }`}
      >
        {isHalloweenMode && (
          <div className="absolute -bottom-10 -left-10 pointer-events-none z-0">
            <img
              src={batSwoop}
              alt=""
              className="w-48 h-48 -rotate-12 opacity-10"
            />
          </div>
        )}
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3
              className={`text-base sm:text-lg font-bold relative z-10 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              Daily Spending Trend
            </h3>
            {spendingVelocity.projectedTotal > 0 && (
              <div
                className={`px-3 py-1.5 rounded-lg ${
                  spendingVelocity.isOnTrack
                    ? isDark
                      ? "bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)]"
                      : "bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)]"
                    : isDark
                      ? "bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)]"
                      : "bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]"
                }`}
              >
                <p
                  className={`text-xs font-medium ${
                    spendingVelocity.isOnTrack
                      ? "text-[#10B981]"
                      : "text-[#EF4444]"
                  }`}
                >
                  Projected: {formatAmount(spendingVelocity.projectedTotal, 0)}
                </p>
              </div>
            )}
          </div>
          {analytics.dailySpending.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={analytics.dailySpending}
                margin={{ top: 10, right: 10, left: 5, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#7C3AED" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6D28D9" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridColor}
                  strokeOpacity={0.3}
                />
                <XAxis
                  dataKey="date"
                  stroke={chartTextColor}
                  tick={{ fill: chartTextColor, fontSize: 10 }}
                  tickLine={{ stroke: chartTextColor }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis
                  stroke={chartTextColor}
                  tick={{ fill: chartTextColor, fontSize: 10 }}
                  tickLine={{ stroke: chartTextColor }}
                  width={50}
                  tickFormatter={(value) =>
                    `${currency.symbol}${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#2D2D32" : "#FFFFFF",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}`,
                    borderRadius: "12px",
                    padding: "12px 16px",
                    boxShadow: isDark
                      ? "0 8px 32px rgba(0,0,0,0.6)"
                      : "0 4px 16px rgba(0,0,0,0.1)",
                    color: isDark ? "#FFFFFF" : "#1F1F1F",
                  }}
                  labelStyle={{
                    color: isDark ? "#FFFFFF" : "#1F1F1F",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                  itemStyle={{
                    color: isDark ? "#E5E5E7" : "#4B5563",
                  }}
                  formatter={(value: number) => [
                    `${currency.symbol}${value.toFixed(2)}`,
                    "Amount",
                  ]}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                  animationDuration={1000}
                  dot={{
                    fill: "#8B5CF6",
                    strokeWidth: 2,
                    r: 4,
                    stroke: isDark ? "#1F1F1F" : "#FFFFFF",
                  }}
                  activeDot={{
                    r: 6,
                    fill: "#8B5CF6",
                    stroke: isDark ? "#1F1F1F" : "#FFFFFF",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="relative overflow-hidden rounded-xl min-h-[300px] flex items-center justify-center p-8">
              {isHalloweenMode && (
                <>
                  <div
                    className="absolute inset-0 pointer-events-none opacity-5 z-0"
                    style={{
                      backgroundImage: `url(${cardHauntedHouse})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <motion.img
                    src={candleTrio}
                    alt=""
                    className="absolute top-8 right-8 w-16 opacity-12 pointer-events-none z-0"
                    style={{
                      filter: "drop-shadow(0 0 20px rgba(245, 158, 11, 0.4))",
                    }}
                    animate={{
                      opacity: [0.12, 0.18, 0.12],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </>
              )}
              <motion.div
                className="relative z-10 text-center max-w-md mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {isHalloweenMode ? (
                  <motion.img
                    src={ghostGenie}
                    alt=""
                    className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-5 opacity-80"
                    style={{
                      filter: "drop-shadow(0 0 30px rgba(96, 201, 182, 0.5))",
                    }}
                    animate={{
                      y: [0, -10, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ) : (
                  <div
                    className={`w-24 h-24 md:w-28 md:h-28 mx-auto mb-5 rounded-full flex items-center justify-center ${
                      isDark
                        ? "bg-[rgba(139,92,246,0.1)] border-2 border-[rgba(139,92,246,0.3)]"
                        : "bg-[rgba(139,92,246,0.05)] border-2 border-[rgba(139,92,246,0.2)]"
                    }`}
                  >
                    <TrendingUp
                      className={`w-12 h-12 md:w-14 md:h-14 ${isDark ? "text-[#8B5CF6]" : "text-[#7C3AED]"}`}
                    />
                  </div>
                )}
                <h4
                  className={`text-lg md:text-xl font-bold mb-2 ${
                    isHalloweenMode
                      ? "text-[#60c9b6] font-creepster tracking-wide"
                      : isDark
                        ? "text-white"
                        : "text-gray-900"
                  }`}
                >
                  {isHalloweenMode
                    ? "No Mystical Transactions"
                    : "No Data Available"}
                </h4>
                <p
                  className={`text-sm ${isHalloweenMode ? "text-[#60c9b6]/70" : isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                >
                  {isHalloweenMode
                    ? "The spirits have yet to manifest in this timeline. Record expenses to reveal the spending patterns."
                    : "Record some expenses to see your daily spending trends."}
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Weekly Comparison Chart */}
      {weeklyComparisonData.length > 0 && (
        <GlassCard
          variant="secondary"
          className={`relative overflow-hidden ${
            isHalloweenMode
              ? "bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
              : ""
          }`}
        >
          {isHalloweenMode && (
            <div className="absolute -top-10 -right-10 pointer-events-none z-0">
              <img
                src={spiderHairyCrawling}
                alt=""
                className="w-48 h-48 rotate-12 opacity-10"
              />
            </div>
          )}
          <div className="p-4 sm:p-6">
            <h3
              className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 relative z-10 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              Weekly Spending Comparison
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={weeklyComparisonData}
                margin={{ top: 10, right: 10, left: 5, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridColor}
                  strokeOpacity={0.3}
                />
                <XAxis
                  dataKey="week"
                  stroke={chartTextColor}
                  tick={{ fill: chartTextColor, fontSize: 10 }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke={chartTextColor}
                  tick={{ fill: chartTextColor, fontSize: 10 }}
                  width={50}
                  tickFormatter={(value) =>
                    `${currency.symbol}${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#2D2D32" : "#FFFFFF",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}`,
                    borderRadius: "12px",
                    padding: "12px 16px",
                    boxShadow: isDark
                      ? "0 8px 32px rgba(0,0,0,0.6)"
                      : "0 4px 16px rgba(0,0,0,0.1)",
                    color: isDark ? "#FFFFFF" : "#1F1F1F",
                  }}
                  labelStyle={{
                    color: isDark ? "#FFFFFF" : "#1F1F1F",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                  itemStyle={{
                    color: isDark ? "#E5E5E7" : "#4B5563",
                  }}
                  formatter={(value: number, name: string) => [
                    `${currency.symbol}${value.toFixed(2)}`,
                    name === "amount" ? "Total Spent" : name,
                  ]}
                />
                <Bar
                  dataKey="amount"
                  fill="#3B82F6"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                >
                  {weeklyComparisonData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === weeklyComparisonData.length - 1
                          ? "#8B5CF6"
                          : "#3B82F6"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-[#3B82F6]" />
                <span
                  className={`text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                >
                  Previous Weeks
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-[#8B5CF6]" />
                <span
                  className={`text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                >
                  Current Week
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Top Expenses */}
      <GlassCard
        variant="secondary"
        className={`relative overflow-hidden ${
          isHalloweenMode
            ? "bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
            : ""
        }`}
      >
        {isHalloweenMode && (
          <>
            <div
              className="absolute inset-0 pointer-events-none opacity-5 z-0"
              style={{
                backgroundImage: `url(${cardHauntedHouse})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "grayscale(100%)",
              }}
            />
            <div className="absolute -bottom-10 -right-10 pointer-events-none z-0">
              <img
                src={pumpkinBlocky}
                alt=""
                className="w-48 h-48 rotate-12 opacity-10"
              />
            </div>
          </>
        )}
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3
              className={`text-base sm:text-lg font-bold relative z-10 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              Top Expenses
            </h3>
            <button
              onClick={() => setSortBy(sortBy === "amount" ? "date" : "amount")}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isDark
                  ? "bg-[rgba(255,255,255,0.05)] text-[#B4B4B8] active:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)]"
                  : "bg-gray-100 text-gray-600 active:bg-gray-200 border border-gray-200"
              }`}
            >
              <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">
                {sortBy === "amount" ? "Highest First" : "Recent First"}
              </span>
              <span className="sm:hidden">
                {sortBy === "amount" ? "Amount" : "Date"}
              </span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {analytics.categoryBreakdown.map((cat) => (
              <button
                key={cat.category}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.category ? null : cat.category,
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize cursor-pointer ${
                  selectedCategory === cat.category
                    ? "text-white"
                    : isDark
                      ? "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#B4B4B8]"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
                style={{
                  backgroundColor:
                    selectedCategory === cat.category
                      ? isHalloweenMode
                        ? HALLOWEEN_CATEGORY_COLORS[cat.category]
                        : CATEGORY_COLORS[cat.category]
                      : undefined,
                }}
              >
                {cat.category}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredTopExpenses.length > 0 ? (
              filteredTopExpenses.map((transaction, index) => {
                const percentage =
                  analytics.totalSpent > 0
                    ? (transaction.amount / analytics.totalSpent) * 100
                    : 0;

                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`p-3 sm:p-4 rounded-xl border transition-all ${
                      isDark
                        ? "bg-[rgba(40,40,45,0.4)] border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.1)]"
                        : "bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div
                          className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${
                              isHalloweenMode
                                ? HALLOWEEN_CATEGORY_COLORS[
                                    transaction.category
                                  ]
                                : CATEGORY_COLORS[transaction.category] ||
                                  "#6B7280"
                            }20`,
                            border: `1px solid ${
                              isHalloweenMode
                                ? HALLOWEEN_CATEGORY_COLORS[
                                    transaction.category
                                  ]
                                : CATEGORY_COLORS[transaction.category] ||
                                  "#6B7280"
                            }30`,
                          }}
                        >
                          {isHalloweenMode ? (
                            <img
                              src={pumpkinSneaky}
                              alt=""
                              className="w-5 h-5 sm:w-7 sm:h-7 drop-shadow-md"
                            />
                          ) : (
                            <FileText
                              className="w-4 h-4 sm:w-6 sm:h-6"
                              style={{
                                color:
                                  CATEGORY_COLORS[transaction.category] ||
                                  "#6B7280",
                              }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-semibold text-xs sm:text-base truncate mb-0.5 sm:mb-1.5 ${isDark ? "text-white" : "text-gray-900"}`}
                          >
                            {transaction.description}
                          </p>
                          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap gap-1">
                            <span
                              className="text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg capitalize font-medium"
                              style={{
                                backgroundColor: isDark
                                  ? `${CATEGORY_COLORS[transaction.category] || "#6B7280"}20`
                                  : `${CATEGORY_COLORS[transaction.category] || "#6B7280"}15`,
                                color:
                                  CATEGORY_COLORS[transaction.category] ||
                                  "#6B7280",
                              }}
                            >
                              {transaction.category}
                            </span>
                            <span
                              className={`text-[10px] sm:text-xs font-medium ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                            >
                              {new Date(
                                transaction.transaction_date,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            {!transaction.budget_id && (
                              <span className="text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)] text-[#10B981] font-semibold">
                                Quick Expense
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`text-sm sm:text-xl font-bold whitespace-nowrap block ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          {formatAmount(transaction.amount, 0)}
                        </span>
                        <span
                          className={`text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
                            isDark ? "text-[#8B5CF6]" : "text-[#7C3AED]"
                          }`}
                        >
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="relative overflow-hidden rounded-xl min-h-[250px] flex items-center justify-center p-8">
                {isHalloweenMode && (
                  <>
                    <div
                      className="absolute inset-0 pointer-events-none opacity-5 z-0"
                      style={{
                        backgroundImage: `url(${cardHauntedHouse})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <motion.img
                      src={witchBrew}
                      alt=""
                      className="absolute bottom-6 left-6 w-16 opacity-10 pointer-events-none z-0"
                      style={{
                        filter: "drop-shadow(0 0 15px rgba(96, 201, 182, 0.3))",
                      }}
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </>
                )}
                <motion.div
                  className="relative z-10 text-center max-w-md mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {isHalloweenMode ? (
                    <motion.img
                      src={pumpkinSneaky}
                      alt=""
                      className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-5 opacity-80"
                      style={{
                        filter: "drop-shadow(0 0 30px rgba(245, 158, 11, 0.5))",
                      }}
                      animate={{
                        y: [0, -8, 0],
                        rotate: [-3, 3, -3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ) : (
                    <div
                      className={`w-24 h-24 md:w-28 md:h-28 mx-auto mb-5 rounded-full flex items-center justify-center ${
                        isDark
                          ? "bg-[rgba(245,158,11,0.1)] border-2 border-[rgba(245,158,11,0.3)]"
                          : "bg-[rgba(245,158,11,0.05)] border-2 border-[rgba(245,158,11,0.2)]"
                      }`}
                    >
                      <Receipt
                        className={`w-12 h-12 md:w-14 md:h-14 ${isDark ? "text-[#F59E0B]" : "text-[#D97706]"}`}
                      />
                    </div>
                  )}
                  <h4
                    className={`text-lg md:text-xl font-bold mb-2 ${
                      isHalloweenMode
                        ? "text-[#60c9b6] font-creepster tracking-wide"
                        : isDark
                          ? "text-white"
                          : "text-gray-900"
                    }`}
                  >
                    {isHalloweenMode
                      ? selectedCategory
                        ? "No Cursed Coins Found"
                        : "No Spectral Expenses"
                      : selectedCategory
                        ? "No Expenses Found"
                        : "No Expenses Yet"}
                  </h4>
                  <p
                    className={`text-xs sm:text-sm ${
                      isHalloweenMode
                        ? "text-[#60c9b6]/70"
                        : isDark
                          ? "text-[#B4B4B8]"
                          : "text-gray-600"
                    }`}
                  >
                    {selectedCategory
                      ? isHalloweenMode
                        ? `No spectral expenses haunt the "${selectedCategory}" realm. Try another category or clear the filter.`
                        : `No expenses found for the selected category "${selectedCategory}". Try selecting a different category.`
                      : isHalloweenMode
                        ? "Your treasury of terrors is empty. Record expenses to summon your top spectral spenders."
                        : "Record some expenses to see your top spending transactions here."}
                  </p>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
