import { motion } from "framer-motion";
import {
  Calendar,
  DollarSign,
  Edit2,
  FileText,
  Trash2,
  Wallet,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import {
  batSwoop,
  candleTrio,
  cardFieryPumpkin,
  catFluffy,
  ghostDroopy,
  pumpkinSneaky,
  spiderHairyCrawling,
  witchFly,
} from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrency } from "@/hooks/useCurrency";
import { useTransactionFiltering } from "@/hooks/useTransactionFiltering";
import { Budget, BudgetTransaction } from "@/types/budget";
import { GlassCard } from "../GlassCard";
import { TransactionFilters } from "./TransactionFilters";

interface TransactionListProps {
  transactions: BudgetTransaction[];
  onDelete: (id: string, budgetId: string, amount: number) => void;
  onEdit?: (transaction: BudgetTransaction) => void;
  onView?: (transaction: BudgetTransaction) => void;
  budgets?: Budget[];
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDelete,
  onEdit,
  onView,
  budgets = [],
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { formatAmount } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionType, setTransactionType] = useState<
    "all" | "budgeted" | "quick"
  >("all");
  const [dateRange, setDateRange] = useState<"all" | "week" | "month" | "year">(
    "all",
  );
  const [selectedBudgets, setSelectedBudgets] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const getBudgetName = (budgetId: string | null) => {
    if (!budgetId) return "Quick Expense";
    const budget = budgets.find((b) => b.id === budgetId);
    return budget?.name || "Unknown Budget";
  };

  const getBudgetColor = (budgetId: string | null) => {
    if (!budgetId) return "#10B981";
    const budget = budgets.find((b) => b.id === budgetId);
    return budget?.color || "#8B5CF6";
  };

  const categories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  const [displayLimit, setDisplayLimit] = useState(50);

  const { sortedTransactions: filteredTransactions } = useTransactionFiltering({
    transactions,
    searchTerm,
    transactionType,
    dateRange,
    selectedBudgets,
    selectedCategories,
  });

  const visibleTransactions = useMemo(
    () => filteredTransactions.slice(0, displayLimit),
    [filteredTransactions, displayLimit],
  );

  const handleLoadMore = () => {
    setDisplayLimit((prev) => prev + 50);
  };

  if (transactions.length === 0) {
    return (
      <GlassCard
        className={`relative overflow-hidden ${
          isHalloweenMode
            ? "border-[rgba(96,201,182,0.2)] shadow-[0_0_15px_rgba(96,201,182,0.1)]"
            : ""
        }`}
      >
        <div className="relative overflow-hidden rounded-xl min-h-[400px] flex items-center justify-center p-8">
          {isHalloweenMode && (
            <>
              <div
                className="absolute inset-0 pointer-events-none opacity-5 z-0"
                style={{
                  backgroundImage: `url(${cardFieryPumpkin})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <motion.img
                src={ghostDroopy}
                alt=""
                className="absolute top-8 left-8 w-16 opacity-12 pointer-events-none z-0"
                style={{
                  filter: "drop-shadow(0 0 20px rgba(96, 201, 182, 0.4))",
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.12, 0.18, 0.12],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.img
                src={pumpkinSneaky}
                alt=""
                className="absolute bottom-8 right-8 w-14 opacity-12 pointer-events-none z-0"
                style={{
                  filter: "drop-shadow(0 0 20px rgba(245, 158, 11, 0.4))",
                }}
                animate={{
                  rotate: [-5, 5, -5],
                }}
                transition={{
                  duration: 3.5,
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
                src={catFluffy}
                alt=""
                className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 opacity-80"
                style={{
                  filter: "drop-shadow(0 0 30px rgba(96, 201, 182, 0.5))",
                }}
                animate={{
                  y: [0, -8, 0],
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
                className={`w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  isDark
                    ? "bg-[rgba(16,185,129,0.1)] border-2 border-[rgba(16,185,129,0.3)]"
                    : "bg-[rgba(16,185,129,0.05)] border-2 border-[rgba(16,185,129,0.2)]"
                }`}
              >
                <DollarSign
                  className={`w-14 h-14 md:w-16 md:h-16 ${isDark ? "text-[#10B981]" : "text-[#059669]"}`}
                />
              </div>
            )}
            <h3
              className={`text-xl md:text-2xl font-bold mb-3 ${
                isHalloweenMode
                  ? "text-[#60c9b6] font-creepster tracking-wide"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              {isHalloweenMode
                ? "No Cursed Transactions"
                : "No Transactions Yet"}
            </h3>
            <p
              className={`text-sm md:text-base ${
                isHalloweenMode
                  ? "text-[#60c9b6]/70"
                  : isDark
                    ? "text-[#B4B4B8]"
                    : "text-gray-600"
              }`}
            >
              {isHalloweenMode
                ? "The ledger of terrors sits empty. Record your first spectral expense to begin tracking the dark finances."
                : "Start tracking your expenses by recording your first transaction."}
            </p>
          </motion.div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      className={`relative overflow-hidden ${
        isHalloweenMode
          ? "border-[rgba(96,201,182,0.4)]! shadow-[0_0_15px_rgba(96,201,182,0.15)]!"
          : ""
      }`}
    >
      {isHalloweenMode && (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-10 z-0"
            style={{
              backgroundImage: `url(${cardFieryPumpkin})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "grayscale(100%)",
            }}
          />
          <motion.img
            src={witchFly}
            alt=""
            className="absolute top-2 right-4 w-16 md:w-20 opacity-15 pointer-events-none"
            animate={{
              y: [0, -10, 0],
              x: [0, -5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.img
            src={candleTrio}
            alt=""
            className="absolute bottom-2 left-4 w-12 md:w-16 opacity-18 pointer-events-none"
            animate={{
              opacity: [0.18, 0.25, 0.18],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Additional floating ghosts */}
          <motion.img
            src={ghostDroopy}
            alt=""
            className="absolute bottom-12 right-12 w-10 md:w-12 opacity-15 pointer-events-none"
            animate={{
              y: [0, -8, 0],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}
      <div className="p-3 md:p-6 relative z-10">
        {/* Filters */}
        <TransactionFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          transactionType={transactionType}
          onTransactionTypeChange={setTransactionType}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedBudgets={selectedBudgets}
          onBudgetsChange={setSelectedBudgets}
          selectedCategories={selectedCategories}
          onCategoriesChange={setSelectedCategories}
          budgets={budgets}
          categories={categories}
        />

        {/* Results Count */}
        <div className="mb-3 md:mb-4 px-2 md:px-4 mt-2">
          <p
            className={`text-xs md:text-sm ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
          >
            Showing {visibleTransactions.length} of{" "}
            {filteredTransactions.length} transactions
          </p>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-6 md:py-8">
            <p
              className={`text-xs md:text-sm ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
            >
              No transactions match your filters
            </p>
          </div>
        ) : (
          <div className="space-y-2 px-2">
            <Virtuoso
              useWindowScroll
              data={visibleTransactions}
              itemContent={(index, transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.05 }}
                  onClick={() => onView?.(transaction)}
                  className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-200 relative mb-2 ${
                    onView ? "cursor-pointer" : ""
                  } ${
                    isHalloweenMode
                      ? isDark
                        ? "bg-[rgba(40,40,45,0.4)] hover:bg-[rgba(96,201,182,0.08)] hover:shadow-[0_0_15px_rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.1)] hover:border-[rgba(96,201,182,0.3)]"
                        : "bg-gray-50 hover:bg-[rgba(96,201,182,0.1)] hover:shadow-[0_0_15px_rgba(96,201,182,0.15)] border border-[rgba(96,201,182,0.2)] hover:border-[rgba(96,201,182,0.4)]"
                      : isDark
                        ? "bg-[rgba(40,40,45,0.4)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.05)]"
                        : "bg-gray-50 hover:bg-gray-100 border border-gray-100"
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
                  {/* Icon */}
                  <div
                    className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${getBudgetColor(transaction.budget_id)}20`,
                    }}
                  >
                    {isHalloweenMode ? (
                      <img
                        src={pumpkinSneaky}
                        alt=""
                        className="w-5 h-5 md:w-6 md:h-6 drop-shadow-lg"
                      />
                    ) : (
                      <FileText
                        className="w-4 h-4 md:w-5 md:h-5"
                        style={{ color: getBudgetColor(transaction.budget_id) }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h4
                      className={`font-medium text-sm md:text-base mb-1 md:mb-1.5 truncate ${
                        isHalloweenMode
                          ? "text-[#60c9b6]"
                          : isDark
                            ? "text-white"
                            : "text-gray-900"
                      }`}
                    >
                      {transaction.description}
                    </h4>

                    {/* Metadata */}
                    <div className="flex items-center flex-wrap gap-1.5 md:gap-2">
                      <div className="flex items-center gap-1">
                        <Calendar
                          className={`w-3 h-3 md:w-3.5 md:h-3.5 ${
                            isHalloweenMode
                              ? "text-[#60c9b6]/70"
                              : isDark
                                ? "text-[#B4B4B8]"
                                : "text-gray-500"
                          }`}
                        />
                        <span
                          className={`text-[10px] md:text-xs ${
                            isHalloweenMode
                              ? "text-[#60c9b6]/70"
                              : isDark
                                ? "text-[#B4B4B8]"
                                : "text-gray-600"
                          }`}
                        >
                          {new Date(
                            transaction.transaction_date,
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-md font-medium capitalize ${
                          isHalloweenMode
                            ? "bg-[#60c9b6]/10 text-[#60c9b6]"
                            : isDark
                              ? "bg-[rgba(139,92,246,0.2)] text-[#A78BFA]"
                              : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {transaction.category}
                      </span>

                      <span
                        className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-md font-medium hidden sm:flex items-center gap-1"
                        style={{
                          backgroundColor: isHalloweenMode
                            ? "#F9731620"
                            : isDark
                              ? `${getBudgetColor(transaction.budget_id)}20`
                              : `${getBudgetColor(transaction.budget_id)}15`,
                          color: isHalloweenMode
                            ? "#F97316"
                            : getBudgetColor(transaction.budget_id),
                        }}
                      >
                        <Wallet className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        <span>{getBudgetName(transaction.budget_id)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Amount and Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className="font-bold text-base md:text-lg whitespace-nowrap"
                      style={{
                        color: isHalloweenMode
                          ? "#60c9b6"
                          : getBudgetColor(transaction.budget_id),
                      }}
                    >
                      {formatAmount(transaction.amount, 2)}
                    </span>
                    <div className="flex items-center gap-0.5 md:gap-1">
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(transaction);
                          }}
                          className={`p-1 md:p-1.5 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100 cursor-pointer ${
                            isHalloweenMode
                              ? "hover:bg-[#60c9b6]/10 text-[#60c9b6] hover:text-[#4db8a5]"
                              : isDark
                                ? "hover:bg-[rgba(139,92,246,0.2)] text-[#8B5CF6] hover:text-[#A78BFA]"
                                : "hover:bg-purple-100 text-purple-600 hover:text-purple-700"
                          }`}
                        >
                          <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(
                            transaction.id,
                            transaction.budget_id,
                            transaction.amount,
                          );
                        }}
                        className={`p-1 md:p-1.5 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100 cursor-pointer ${
                          isDark
                            ? "hover:bg-[rgba(239,68,68,0.2)] text-red-400 hover:text-red-300"
                            : "hover:bg-red-100 text-red-600 hover:text-red-700"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            />
            {filteredTransactions.length > displayLimit && (
              <div className="flex justify-center pt-16 pb-2">
                <button
                  onClick={handleLoadMore}
                  className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer ${
                    isHalloweenMode
                      ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5] shadow-[0_0_15px_rgba(96,201,182,0.2)]"
                      : isDark
                        ? "bg-white text-gray-900 hover:bg-gray-100"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
};
