/** biome-ignore-all lint/correctness/useExhaustiveDependencies: false positive */
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  List,
  Plus,
  Repeat,
  Sparkles,
  Tag,
  Wallet,
  Wallet as WalletIcon,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  batSwoop,
  bgWitchGraveyard,
  candleFive,
  cardCatFence,
  catWitchHat,
  ghostDroopy,
  ghostScare,
  pumpkinBlocky,
  pumpkinScary,
  pumpkinSneaky,
  pumpkinWitchhat,
  spiderCuteHanging,
  spiderHairyCrawling,
  spiderSharpHanging,
  webCenter,
  witchBrew,
} from "@/assets";
import { AccountList } from "@/components/budget/AccountList";
import { AccountModal } from "@/components/budget/AccountModal";
import { BalanceSheetTab } from "@/components/budget/BalanceSheet";
import { BudgetAnalytics } from "@/components/budget/BudgetAnalytics.tsx";
import { BudgetCalendar } from "@/components/budget/BudgetCalendar";
import { BudgetCard } from "@/components/budget/BudgetCard";
import {
  BudgetFilters,
  BudgetFilterType,
  BudgetSortType,
} from "@/components/budget/BudgetFilters";
import { BudgetModal } from "@/components/budget/BudgetModal";
import { BudgetStats } from "@/components/budget/BudgetStats";
import { CategoryManager } from "@/components/budget/CategoryManager";
import { FinancialInsightsCard } from "@/components/budget/FinancialInsightsCard";
import { GoalModal } from "@/components/budget/GoalModal";
import { LiabilityModal } from "@/components/budget/LiabilityModal";
import { QuickExpenseModal } from "@/components/budget/QuickExpenseModal";
import { RecurringManager } from "@/components/budget/RecurringManager";
import { TransactionList } from "@/components/budget/TransactionList";
import { TransactionModal } from "@/components/budget/TransactionModal";
import { GlassCard } from "@/components/GlassCard";
import { BalanceSheetSkeleton } from "@/components/skeletons/BalanceSheetSkeleton";
import {
  AnalyticsTabSkeleton,
  BudgetsTabSkeleton,
  CalendarTabSkeleton,
  CategoriesTabSkeleton,
  ExpensesTabSkeleton,
} from "@/components/skeletons/BudgetSkeletons";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Modal } from "@/components/ui/Modal";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import { Skeleton } from "@/components/ui/Skeleton";
import { CURRENCIES } from "@/constants/currencies";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useAccountsQuery,
  useBudgetsQuery,
  useBudgetTransactionsQuery,
  useCategoriesQuery,
  useCreateAccount,
  useCreateBudget,
  useCreateTransaction,
  useDeleteAccount,
  useDeleteBudget,
  useDeleteTransaction,
  useProcessRecurringTransactions,
  useUpdateAccount,
  useUpdateBudget,
  useUpdateTransaction,
} from "@/hooks/queries/useBudgetsQuery";
import {
  useCreateGoal,
  useDeleteGoal,
  useGoalsQuery,
  useUpdateGoal,
} from "@/hooks/queries/useGoals";
import {
  useCreateLiability,
  useLiabilitiesQuery,
  useUpdateLiability,
} from "@/hooks/queries/useLiabilities";
import { useBudgetFiltering } from "@/hooks/useBudgetFiltering";
import { useCurrency } from "@/hooks/useCurrency";
import { useSpookyAI } from "@/hooks/useSpookyAI";
import {
  Account,
  BudgetTransaction,
  Budget as BudgetType,
  FinancialGoal,
  Liability,
} from "@/types/budget";

type TabType =
  | "budgets"
  | "accounts"
  | "balance_sheet"
  | "expenses"
  | "calendar"
  | "analytics"
  | "insights"
  | "categories"
  | "recurring";
type ViewType = "list" | "detail";

export const Finances: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();
  const { currency, setCurrency, formatAmount } = useCurrency();
  const { data: budgets = [], isLoading: loading } = useBudgetsQuery();
  const { data: transactions = [] } = useBudgetTransactionsQuery();
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();
  const { processDueTransactions } = useProcessRecurringTransactions();

  // Process recurring transactions on mount
  useEffect(() => {
    processDueTransactions();
  }, []);

  // Account hooks
  const {
    data: accounts = [],
    isLoading: accountsLoading,
    isFetching: accountsFetching,
  } = useAccountsQuery();
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();

  // Goal hooks
  const { data: goals = [] } = useGoalsQuery();
  const createGoalMutation = useCreateGoal();
  const updateGoalMutation = useUpdateGoal();
  const deleteGoalMutation = useDeleteGoal();

  // Liability hooks
  const { isLoading: liabilitiesLoading } = useLiabilitiesQuery();
  const createLiabilityMutation = useCreateLiability();
  const updateLiabilityMutation = useUpdateLiability();

  // Categories for RAG context
  const { data: categories = [] } = useCategoriesQuery();
  const { addToGrimoire } = useSpookyAI();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = (searchParams.get("tab") as TabType) || "budgets";
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    // Reset category trigger when switching tabs to prevent modal from reopening
    setTriggerAddCategory(0);
  };
  const [currentView, setCurrentView] = useState<ViewType>("list");
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showQuickExpense, setShowQuickExpense] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<BudgetTransaction | null>(null);
  const [editingTransaction, setEditingTransaction] =
    useState<BudgetTransaction | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | undefined>();
  const [editingBudget, setEditingBudget] = useState<BudgetType | undefined>();
  const [selectedBudget, setSelectedBudget] = useState<
    BudgetType | undefined
  >();
  const [showLiabilityModal, setShowLiabilityModal] = useState(false);
  const [editingLiability, setEditingLiability] = useState<
    Liability | undefined
  >();

  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<{
    id: string;
    budgetId: string | null;
    amount: number;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<BudgetFilterType>("all");
  const [sortBy, setSortBy] = useState<BudgetSortType>("newest");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [triggerAddCategory, setTriggerAddCategory] = useState(0);

  const { sortedBudgets } = useBudgetFiltering({
    budgets,
    filter,
    sortBy,
    searchTerm,
    selectedCategory,
  });

  useEffect(() => {
    const budgetSlug = searchParams.get("budget");
    if (budgetSlug && budgets.length > 0) {
      const budget = budgets.find(
        (b) => b.name.toLowerCase().replace(/\s+/g, "-") === budgetSlug,
      );
      if (budget) {
        setSelectedBudget(budget);
        setCurrentView("detail");
      }
    }
  }, [budgets, searchParams]);

  const tabsRef = useRef<HTMLDivElement>(null);
  const budgetsTabRef = useRef<HTMLButtonElement>(null);
  const accountsTabRef = useRef<HTMLButtonElement>(null);
  const balanceSheetTabRef = useRef<HTMLButtonElement>(null);
  const calendarTabRef = useRef<HTMLButtonElement>(null);
  const expensesTabRef = useRef<HTMLButtonElement>(null);
  const analyticsTabRef = useRef<HTMLButtonElement>(null);
  const insightsTabRef = useRef<HTMLButtonElement>(null);
  const categoriesTabRef = useRef<HTMLButtonElement>(null);
  const recurringTabRef = useRef<HTMLButtonElement>(null);
  const [tabPosition, setTabPosition] = useState({
    left: 0,
    width: 0,
    top: 0,
    height: 0,
  });

  useEffect(() => {
    const initializeTabPosition = () => {
      const currentTab = budgetsTabRef.current;
      if (currentTab && tabsRef.current) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const activeRect = currentTab.getBoundingClientRect();
        setTabPosition({
          left: activeRect.left - tabsRect.left,
          width: activeRect.width,
          top: activeRect.top - tabsRect.top,
          height: activeRect.height,
        });
      }
    };

    const timer = setTimeout(initializeTabPosition, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateTabPosition = () => {
      let currentTab: HTMLButtonElement | null;
      switch (activeTab) {
        case "budgets":
          currentTab = budgetsTabRef.current;
          break;
        case "accounts":
          currentTab = accountsTabRef.current;
          break;
        case "balance_sheet":
          currentTab = balanceSheetTabRef.current;
          break;
        case "calendar":
          currentTab = calendarTabRef.current;
          break;
        case "expenses":
          currentTab = expensesTabRef.current;
          break;
        case "analytics":
          currentTab = analyticsTabRef.current;
          break;
        case "insights":
          currentTab = insightsTabRef.current;
          break;
        case "categories":
          currentTab = categoriesTabRef.current;
          break;
        case "recurring":
          currentTab = recurringTabRef.current;
          break;
        default:
          currentTab = null;
      }

      if (currentTab && tabsRef.current) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const activeRect = currentTab.getBoundingClientRect();
        setTabPosition({
          left: activeRect.left - tabsRect.left,
          width: activeRect.width,
          top: activeRect.top - tabsRect.top,
          height: activeRect.height,
        });
      }
    };

    const timer1 = setTimeout(updateTabPosition, 50);
    const timer2 = setTimeout(updateTabPosition, 100);
    const timer3 = setTimeout(updateTabPosition, 200);

    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateTabPosition();
      }, 150);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", debouncedResize);
    };
  }, [activeTab]);

  // Recalculate tab position when Halloween mode changes
  useEffect(() => {
    const updateTabPosition = () => {
      let currentTab: HTMLButtonElement | null;
      switch (activeTab) {
        case "budgets":
          currentTab = budgetsTabRef.current;
          break;
        case "recurring":
          currentTab = recurringTabRef.current;
          break;
        case "accounts":
          currentTab = accountsTabRef.current;
          break;
        case "balance_sheet":
          currentTab = balanceSheetTabRef.current;
          break;
        case "calendar":
          currentTab = calendarTabRef.current;
          break;
        case "expenses":
          currentTab = expensesTabRef.current;
          break;
        case "analytics":
          currentTab = analyticsTabRef.current;
          break;
        case "insights":
          currentTab = insightsTabRef.current;
          break;
        case "categories":
          currentTab = categoriesTabRef.current;
          break;
        default:
          currentTab = null;
      }

      if (currentTab && tabsRef.current) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const activeRect = currentTab.getBoundingClientRect();
        setTabPosition({
          left: activeRect.left - tabsRect.left,
          width: activeRect.width,
          top: activeRect.top - tabsRect.top,
          height: activeRect.height,
        });
      }
    };

    const timer = setTimeout(() => {
      updateTabPosition();
    }, 100);
    return () => clearTimeout(timer);
  }, [isHalloweenMode, activeTab]);

  const handleCreateBudget = useCallback(
    async (
      data: Omit<
        BudgetType,
        "id" | "user_id" | "created_at" | "updated_at" | "spent"
      >,
    ) => {
      await createBudgetMutation.mutateAsync(data);
      setShowBudgetForm(false);
    },
    [createBudgetMutation],
  );

  const handleUpdateBudget = useCallback(
    async (data: Partial<BudgetType>) => {
      if (editingBudget) {
        await updateBudgetMutation.mutateAsync({
          id: editingBudget.id,
          updates: data,
        });
        setEditingBudget(undefined);
        setShowBudgetForm(false);
      }
    },
    [editingBudget, updateBudgetMutation],
  );

  const handleDeleteBudget = useCallback(async () => {
    if (budgetToDelete) {
      await deleteBudgetMutation.mutateAsync(budgetToDelete);
      if (selectedBudget?.id === budgetToDelete) {
        setSelectedBudget(undefined);
        setCurrentView("list");
      }
      setBudgetToDelete(null);
    }
  }, [deleteBudgetMutation, budgetToDelete, selectedBudget]);

  const handleAccountSubmit = useCallback(
    async (
      data: Omit<Account, "id" | "user_id" | "created_at" | "updated_at">,
    ) => {
      if (editingAccount) {
        await updateAccountMutation.mutateAsync({
          id: editingAccount.id,
          updates: data,
        });
        setEditingAccount(undefined);
      } else {
        await createAccountMutation.mutateAsync(data);
      }
      setShowAccountModal(false);
    },
    [createAccountMutation, updateAccountMutation, editingAccount],
  );

  const handleGoalSubmit = async (data: Partial<FinancialGoal>) => {
    try {
      if (editingGoal) {
        await updateGoalMutation.mutateAsync({
          id: editingGoal.id,
          updates: data,
        });
      } else {
        // Convert optional fields to null for Supabase
        const goalData = {
          name: data.name!,
          description: data.description || null,
          target_amount: data.target_amount!,
          current_amount: data.current_amount ?? 0,
          target_date: data.target_date || null,
          linked_account_id: data.linked_account_id || null,
          icon: data.icon!,
          color: data.color!,
          is_active: true,
        };

        await createGoalMutation.mutateAsync(goalData);
      }
      setShowGoalModal(false);
      setEditingGoal(undefined);
    } catch (error) {
      toast.error("Failed to save goal. Please try again.");
    }
  };

  const handleEditGoal = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoalMutation.mutateAsync(id);
  };

  const handleLiabilitySubmit = async (data: Partial<Liability>) => {
    if (editingLiability) {
      await updateLiabilityMutation.mutateAsync({
        id: editingLiability.id,
        updates: data,
      });
    } else {
      await createLiabilityMutation.mutateAsync(data as Liability);
    }
    setShowLiabilityModal(false);
    setEditingLiability(undefined);
  };

  const handleAddTransaction = useCallback(
    async (data: Omit<BudgetTransaction, "id" | "user_id" | "created_at">) => {
      if (editingTransaction) {
        await updateTransactionMutation.mutateAsync({
          id: editingTransaction.id,
          updates: data,
          oldBudgetId: editingTransaction.budget_id,
          oldAmount: editingTransaction.amount,
        });
      } else {
        const newTransaction =
          await createTransactionMutation.mutateAsync(data);

        // Auto-index for RAG
        try {
          const categoryName =
            categories.find((c) => c.id === data.category_id)?.name ||
            data.category ||
            "Uncategorized";
          const accountName =
            accounts.find((a) => a.id === data.account_id)?.name ||
            "Unknown Account";

          const content = `Transaction: ${formatAmount(data.amount)} - ${data.description}
Category: ${categoryName}
Account: ${accountName}
Date: ${data.transaction_date}
Type: ${data.type || "expense"}`;

          await addToGrimoire(content, {
            type: "transaction",
            original_id: newTransaction.id,
            amount: data.amount,
            category: categoryName,
            category_id: data.category_id,
            account_name: accountName,
            account_id: data.account_id,
            transaction_date: data.transaction_date,
            transaction_type: data.type || "expense",
            created_at: new Date().toISOString(),
            tags: data.tags || [],
          });
        } catch (error) {
          console.error("Failed to index transaction:", error);
          // Don't block UI for indexing failure
        }
      }
      setShowTransactionForm(false);
      setEditingTransaction(null);
    },
    [
      createTransactionMutation,
      updateTransactionMutation,
      editingTransaction,
      categories,
      accounts,
      addToGrimoire,
      formatAmount,
    ],
  );

  const handleDeleteTransaction = useCallback(async () => {
    if (transactionToDelete) {
      await deleteTransactionMutation.mutateAsync(transactionToDelete);
      setTransactionToDelete(null);
    }
  }, [deleteTransactionMutation, transactionToDelete]);

  const handleBudgetClick = useCallback(
    (budget: BudgetType) => {
      setSelectedBudget(budget);
      setCurrentView("detail");

      const budgetSlug = budget.name.toLowerCase().replace(/\s+/g, "-");
      setSearchParams({ tab: activeTab, budget: budgetSlug });
    },
    [activeTab, setSearchParams],
  );

  const handleBackToList = useCallback(() => {
    setCurrentView("list");
    setSelectedBudget(undefined);

    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  const getTabDescription = () => {
    if (currentView === "detail" && selectedBudget) {
      return `Managing ${selectedBudget.name}`;
    }
    switch (activeTab) {
      case "budgets":
        return "Track and manage your budgets";
      case "calendar":
        return "View your budget transactions in calendar format";
      case "expenses":
        return "View and manage all your expenses";
      case "analytics":
        return "Analyze your spending patterns and trends";
      case "categories":
        return "Manage your income and expense categories";
      case "recurring":
        return "Manage recurring transactions and subscriptions";
      case "balance_sheet":
        return "Track your net worth with a complete balance sheet of assets and liabilities";
      default:
        return "Track and manage your budgets and expenses";
    }
  };

  const currencyOptions = CURRENCIES.map((curr) => ({
    value: curr.code,
    label: `${curr.name} (${curr.symbol})`,
  }));

  if (loading && budgets.length === 0) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section Skeleton */}
        <div className="mb-6 pt-4 md:pt-0">
          <div
            className={`md:p-6 md:rounded-xl md:backdrop-blur-xl md:border ${
              isDark
                ? "md:bg-[rgba(26,26,31,0.6)] md:border-[rgba(255,255,255,0.1)]"
                : "md:bg-white/90 md:border-gray-200/60 md:shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <Skeleton className="h-6 md:h-7 w-32 md:w-40" />
              <Skeleton className="h-6 md:h-7 w-20 md:w-24 rounded-lg" />
            </div>
            <Skeleton className="h-3 md:h-4 w-48 md:w-64" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`p-3 md:p-6 rounded-xl border ${
                isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.15)] border-[#60c9b6]/30"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]"
                    : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton
                    className={`h-2.5 md:h-3 w-16 md:w-20 mb-0.5 md:mb-1 ${
                      isHalloweenMode ? "bg-[rgba(96,201,182,0.2)]" : ""
                    }`}
                  />
                  <Skeleton
                    className={`h-5 md:h-8 w-12 md:w-16 ${
                      isHalloweenMode ? "bg-[rgba(96,201,182,0.25)]" : ""
                    }`}
                  />
                </div>
                <Skeleton
                  className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl ${
                    isHalloweenMode ? "bg-[rgba(96,201,182,0.2)]" : ""
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation Skeleton - Responsive */}
        <div className="mb-6 md:mb-8">
          {/* Desktop: Show all 9 tabs */}
          <div className="hidden lg:flex relative flex-wrap gap-1 sm:gap-2 mb-4">
            <Skeleton className="h-10 w-20 sm:w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 sm:w-28 rounded-lg" />
            <Skeleton className="h-10 w-28 sm:w-32 rounded-lg" />
            <Skeleton className="h-10 w-24 sm:w-28 rounded-lg" />
            <Skeleton className="h-10 w-28 sm:w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 sm:w-36 rounded-lg" />
            <Skeleton className="h-10 w-24 sm:w-28 rounded-lg" />
            <Skeleton className="h-10 w-24 sm:w-28 rounded-lg" />
            <Skeleton className="h-10 w-20 sm:w-24 rounded-lg" />
          </div>
          {/* Mobile/Tablet: Show 4 visible tabs */}
          <div className="lg:hidden relative flex gap-1 sm:gap-2 mb-4">
            <Skeleton className="h-10 w-20 sm:w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 sm:w-28 rounded-lg" />
            <Skeleton className="h-10 w-28 sm:w-32 rounded-lg" />
            <Skeleton className="h-10 w-24 sm:w-28 rounded-lg" />
          </div>
          {/* Mobile: Currency dropdown */}
          <div className="lg:hidden">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>

        {/* Content Skeleton - Tab-specific */}
        {activeTab === "categories" ? (
          <CategoriesTabSkeleton />
        ) : (
          <GlassCard variant="secondary" className="overflow-hidden">
            {activeTab === "budgets" && <BudgetsTabSkeleton />}
            {activeTab === "expenses" && <ExpensesTabSkeleton />}
            {activeTab === "calendar" && <CalendarTabSkeleton />}
            {activeTab === "analytics" && <AnalyticsTabSkeleton />}
          </GlassCard>
        )}
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <div className="mb-6 pt-4 md:pt-0">
          <div
            className={`relative overflow-hidden md:p-6 md:rounded-xl md:backdrop-blur-xl md:border ${
              isDark
                ? "md:bg-[rgba(26,26,31,0.6)] md:border-[rgba(255,255,255,0.1)]"
                : "md:bg-white/90 md:border-gray-200/60 md:shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
            } ${
              isHalloweenMode
                ? "md:border-[rgba(96,201,182,0.2)] md:shadow-[0_0_20px_rgba(96,201,182,0.15)]"
                : ""
            } group`}
          >
            {isHalloweenMode && (
              <>
                {/* Background Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-5 z-0"
                  style={{
                    backgroundImage: `url(${bgWitchGraveyard})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "grayscale(100%)",
                  }}
                />

                {/* Flying Bat Animation */}
                <motion.img
                  src={batSwoop}
                  alt=""
                  className="absolute w-12 h-12 md:w-16 md:h-16 opacity-60 pointer-events-none z-0"
                  initial={{ x: "-10%", y: "20%", rotate: -10 }}
                  animate={{
                    x: ["-10%", "110%"],
                    y: ["20%", "40%", "10%"],
                    rotate: [-10, 10, -5],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 2,
                  }}
                />

                {/* Peeking Pumpkin */}
                <motion.img
                  src={pumpkinSneaky}
                  alt=""
                  className="absolute -bottom-4 -right-2 w-16 h-16 md:w-20 md:h-20 opacity-80 pointer-events-none z-10"
                  initial={{ y: 20, rotate: 10 }}
                  animate={{
                    y: [20, 0, 20],
                    rotate: [10, 0, 10],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Spider web thread */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 w-px bg-[#60c9b6] opacity-30 pointer-events-none"
                  initial={{ top: "0%", height: "0%" }}
                  animate={{ top: "0%", height: "55%" }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
                <img
                  src={webCenter}
                  alt=""
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 md:w-24 opacity-30 pointer-events-none"
                />
                <motion.img
                  src={spiderSharpHanging}
                  alt=""
                  className="absolute left-1/2 -translate-x-1/2 w-5 md:w-6 opacity-50 pointer-events-none"
                  initial={{ top: "0%", opacity: 0 }}
                  animate={{
                    top: "50%",
                    opacity: 0.5,
                    y: [0, 5, 0],
                  }}
                  transition={{
                    top: { duration: 2, ease: "easeOut" },
                    opacity: { duration: 1, delay: 0.5 },
                    y: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 2,
                    },
                  }}
                />

                {/* Cute Spider Hanging */}
                <motion.img
                  src={spiderCuteHanging}
                  alt=""
                  className="absolute top-0 right-10 w-8 md:w-10 opacity-60 pointer-events-none"
                  initial={{ y: -50 }}
                  animate={{ y: -10 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                    delay: 1,
                  }}
                />
              </>
            )}
            <div className="relative z-10 flex items-start justify-between gap-3 mb-1.5">
              {/* Ghost appearing on hover */}
              {isHalloweenMode && (
                <motion.img
                  src={ghostScare}
                  alt=""
                  className="absolute -top-6 -left-6 w-10 h-10 opacity-0 transition-opacity duration-300 group-hover:opacity-60 pointer-events-none rotate-12"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <h1
                className={`text-xl md:text-2xl font-bold ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : currentView === "detail"
                      ? "text-[#8B5CF6]"
                      : activeTab === "budgets"
                        ? "text-[#8B5CF6]"
                        : activeTab === "recurring"
                          ? "text-[#8B5CF6]"
                          : activeTab === "accounts"
                            ? "text-[#F97316]"
                            : activeTab === "balance_sheet"
                              ? "text-[#06B6D4]"
                              : activeTab === "categories"
                                ? "text-[#EC4899]"
                                : activeTab === "calendar"
                                  ? "text-[#F59E0B]"
                                  : activeTab === "expenses"
                                    ? "text-[#10B981]"
                                    : "text-[#3B82F6]"
                } ${isHalloweenMode ? "drop-shadow-[0_0_8px_rgba(96,201,182,0.5)]" : ""}`}
              >
                {currentView === "detail" && selectedBudget ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleBackToList}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark
                          ? "hover:bg-[rgba(255,255,255,0.1)]"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: selectedBudget.color }}
                    />
                    <span>{selectedBudget.name}</span>
                  </div>
                ) : (
                  "Financial Management"
                )}
              </h1>

              {/* Action Buttons - Desktop (top right) */}
              {currentView === "detail" && selectedBudget && (
                <motion.button
                  onClick={() => setShowTransactionForm(true)}
                  className="hidden md:flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] rounded-lg text-[#10B981] hover:bg-[rgba(16,185,129,0.3)] transition-colors text-xs font-medium shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Transaction</span>
                </motion.button>
              )}
              {currentView === "list" &&
                (activeTab === "budgets" || activeTab === "expenses") && (
                  <div className="hidden md:flex items-center gap-2 flex-wrap justify-end">
                    <motion.button
                      onClick={() => setShowQuickExpense(true)}
                      className="flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] rounded-lg text-[#10B981] hover:bg-[rgba(16,185,129,0.3)] transition-colors text-xs font-medium shrink-0"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Quick Expense</span>
                    </motion.button>

                    <motion.button
                      onClick={() => setShowTransactionForm(true)}
                      className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                        isHalloweenMode
                          ? "bg-[rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                          : "bg-[rgba(245,158,11,0.2)] border border-[rgba(245,158,11,0.3)] text-[#F59E0B] hover:bg-[rgba(245,158,11,0.3)]"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Transaction</span>
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        setEditingBudget(undefined);
                        setShowBudgetForm(true);
                      }}
                      className="flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] rounded-lg text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)] transition-colors text-xs font-medium shrink-0"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Budget</span>
                    </motion.button>
                  </div>
                )}

              {currentView === "list" && activeTab === "accounts" && (
                <div className="hidden md:flex items-center gap-2 flex-wrap justify-end">
                  <motion.button
                    onClick={() => setShowTransactionForm(true)}
                    className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                      isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                        : "bg-[rgba(245,158,11,0.2)] border border-[rgba(245,158,11,0.3)] text-[#F59E0B] hover:bg-[rgba(245,158,11,0.3)]"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Transaction</span>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setEditingAccount(undefined);
                      setShowAccountModal(true);
                    }}
                    className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                      isHalloweenMode
                        ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                        : "bg-[rgba(249,115,22,0.2)] border border-[rgba(249,115,22,0.3)] text-[#F97316] hover:bg-[rgba(249,115,22,0.3)]"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Account</span>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setEditingGoal(undefined);
                      setShowGoalModal(true);
                    }}
                    className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                      isHalloweenMode
                        ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                        : "bg-[rgba(249,115,22,0.2)] border border-[rgba(249,115,22,0.3)] text-[#F97316] hover:bg-[rgba(249,115,22,0.3)]"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Goal</span>
                  </motion.button>
                </div>
              )}

              {currentView === "list" && activeTab === "recurring" && (
                <div className="hidden md:flex items-center gap-2 flex-wrap justify-end">
                  <motion.button
                    onClick={() => {
                      const event = new CustomEvent("openRecurringModal");
                      window.dispatchEvent(event);
                    }}
                    className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                      isHalloweenMode
                        ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                        : "bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)]"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Rule</span>
                  </motion.button>
                </div>
              )}

              {currentView === "list" && activeTab === "categories" && (
                <div className="hidden md:flex items-center gap-2 flex-wrap justify-end">
                  <motion.button
                    onClick={() => setTriggerAddCategory((prev) => prev + 1)}
                    className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                      isHalloweenMode
                        ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                        : "bg-[rgba(236,72,153,0.2)] border border-[rgba(236,72,153,0.3)] text-[#EC4899] hover:bg-[rgba(236,72,153,0.3)]"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Category</span>
                  </motion.button>
                </div>
              )}

              {currentView === "list" && activeTab === "balance_sheet" && (
                <div className="hidden md:flex items-center gap-2 flex-wrap justify-end">
                  <motion.button
                    onClick={() => {
                      setEditingLiability(undefined);
                      setShowLiabilityModal(true);
                    }}
                    className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                      isHalloweenMode
                        ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                        : "bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.3)]"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Liability</span>
                  </motion.button>
                </div>
              )}
            </div>
            <p
              className={`relative z-10 text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
            >
              {getTabDescription()}
            </p>

            {/* Action Buttons - Mobile (below description) */}
            {currentView === "list" &&
              (activeTab === "budgets" ||
                activeTab === "expenses" ||
                activeTab === "accounts" ||
                activeTab === "balance_sheet" ||
                activeTab === "categories" ||
                activeTab === "recurring") && (
                <div className="flex flex-wrap md:hidden items-center gap-2 mt-3">
                  {(activeTab === "budgets" || activeTab === "expenses") && (
                    <>
                      <motion.button
                        onClick={() => setShowTransactionForm(true)}
                        className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                          isHalloweenMode
                            ? "bg-[rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                            : "bg-[rgba(245,158,11,0.2)] border border-[rgba(245,158,11,0.3)] text-[#F59E0B] hover:bg-[rgba(245,158,11,0.3)]"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Transaction</span>
                      </motion.button>

                      <motion.button
                        onClick={() => setShowQuickExpense(true)}
                        className="flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] rounded-lg text-[#10B981] hover:bg-[rgba(16,185,129,0.3)] transition-colors text-xs font-medium shrink-0"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Quick Expense</span>
                      </motion.button>

                      <motion.button
                        onClick={() => {
                          setEditingBudget(undefined);
                          setShowBudgetForm(true);
                        }}
                        className="flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] rounded-lg text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)] transition-colors text-xs font-medium shrink-0"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>New Budget</span>
                      </motion.button>
                    </>
                  )}

                  {activeTab === "accounts" && (
                    <>
                      <motion.button
                        onClick={() => {
                          setEditingAccount(undefined);
                          setShowAccountModal(true);
                        }}
                        className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                          isHalloweenMode
                            ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                            : "bg-[rgba(249,115,22,0.2)] border border-[rgba(249,115,22,0.3)] text-[#F97316] hover:bg-[rgba(249,115,22,0.3)]"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Account</span>
                      </motion.button>

                      <motion.button
                        onClick={() => {
                          setEditingGoal(undefined);
                          setShowGoalModal(true);
                        }}
                        className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                          isHalloweenMode
                            ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                            : "bg-[rgba(249,115,22,0.2)] border border-[rgba(249,115,22,0.3)] text-[#F97316] hover:bg-[rgba(249,115,22,0.3)]"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Goal</span>
                      </motion.button>
                    </>
                  )}

                  {activeTab === "categories" && (
                    <motion.button
                      onClick={() => setTriggerAddCategory((prev) => prev + 1)}
                      className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                        isHalloweenMode
                          ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                          : "bg-[rgba(236,72,153,0.2)] border border-[rgba(236,72,153,0.3)] text-[#EC4899] hover:bg-[rgba(236,72,153,0.3)]"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Category</span>
                    </motion.button>
                  )}

                  {activeTab === "balance_sheet" && (
                    <motion.button
                      onClick={() => {
                        setEditingLiability(undefined);
                        setShowLiabilityModal(true);
                      }}
                      className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                        isHalloweenMode
                          ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                          : "bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.3)]"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Liability</span>
                    </motion.button>
                  )}

                  {activeTab === "recurring" && (
                    <motion.button
                      onClick={() => {
                        const event = new CustomEvent("openRecurringModal");
                        window.dispatchEvent(event);
                      }}
                      className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
                        isHalloweenMode
                          ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                          : "bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)]"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Rule</span>
                    </motion.button>
                  )}
                </div>
              )}
            {currentView === "detail" && selectedBudget && (
              <motion.button
                onClick={() => setShowTransactionForm(true)}
                className="flex md:hidden items-center justify-center space-x-1 px-3 py-1.5 mt-3 cursor-pointer bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] rounded-lg text-[#10B981] hover:bg-[rgba(16,185,129,0.3)] transition-colors text-xs font-medium shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Transaction</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Stats Cards - Above Tabs */}
        {currentView === "list" && (
          <BudgetStats budgets={budgets} transactions={transactions} />
        )}

        {/* Tab Navigation with Currency Selector - Only show when in list view */}
        {currentView === "list" && (
          <div className="mb-6 md:mb-8 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div
                ref={tabsRef}
                className="relative flex flex-wrap gap-1 sm:gap-2 flex-1"
              >
                {/* Sliding Background */}
                <motion.div
                  className="absolute rounded-lg border z-0"
                  animate={{
                    left: tabPosition.left,
                    width: tabPosition.width,
                    top: tabPosition.top,
                    height: tabPosition.height,
                    backgroundColor: isHalloweenMode
                      ? "rgba(96,201,182,0.2)"
                      : activeTab === "budgets"
                        ? "rgba(139,92,246,0.2)"
                        : activeTab === "accounts"
                          ? "rgba(249,115,22,0.2)"
                          : activeTab === "balance_sheet"
                            ? "rgba(6,182,212,0.2)"
                            : activeTab === "categories"
                              ? "rgba(236,72,153,0.2)"
                              : activeTab === "calendar"
                                ? "rgba(245,158,11,0.2)"
                                : activeTab === "expenses"
                                  ? "rgba(16,185,129,0.2)"
                                  : activeTab === "recurring"
                                    ? "rgba(139,92,246,0.2)"
                                    : "rgba(59,130,246,0.2)",
                    borderColor: isHalloweenMode
                      ? "rgba(96,201,182,0.3)"
                      : activeTab === "budgets"
                        ? "rgba(139,92,246,0.3)"
                        : activeTab === "accounts"
                          ? "rgba(249,115,22,0.3)"
                          : activeTab === "balance_sheet"
                            ? "rgba(6,182,212,0.3)"
                            : activeTab === "categories"
                              ? "rgba(236,72,153,0.3)"
                              : activeTab === "calendar"
                                ? "rgba(245,158,11,0.3)"
                                : activeTab === "expenses"
                                  ? "rgba(16,185,129,0.3)"
                                  : activeTab === "recurring"
                                    ? "rgba(139,92,246,0.3)"
                                    : "rgba(59,130,246,0.3)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
                {isHalloweenMode && (
                  <motion.div
                    className="absolute rounded-lg z-0"
                    animate={{
                      left: tabPosition.left,
                      width: tabPosition.width,
                      top: tabPosition.top,
                      height: tabPosition.height,
                      boxShadow: [
                        "0 0 8px rgba(96,201,182,0.25), inset 0 0 6px rgba(96,201,182,0.15)",
                        "0 0 12px rgba(96,201,182,0.35), inset 0 0 8px rgba(96,201,182,0.2)",
                        "0 0 8px rgba(96,201,182,0.25), inset 0 0 6px rgba(96,201,182,0.15)",
                      ],
                    }}
                    transition={{
                      left: { type: "spring", stiffness: 400, damping: 30 },
                      width: { type: "spring", stiffness: 400, damping: 30 },
                      top: { type: "spring", stiffness: 400, damping: 30 },
                      height: { type: "spring", stiffness: 400, damping: 30 },
                      boxShadow: {
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                  />
                )}

                <button
                  ref={budgetsTabRef}
                  onClick={() => handleTabChange("budgets")}
                  className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
                    activeTab === "budgets"
                      ? isHalloweenMode
                        ? "text-[#60c9b6]"
                        : "text-[#8B5CF6]"
                      : isDark
                        ? isHalloweenMode
                          ? "text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-[#B4B4B8] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8B5CF6]"
                        : isHalloweenMode
                          ? "text-gray-600 hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-gray-600 hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8B5CF6]"
                  }`}
                >
                  <List className="w-4 h-4 inline mr-1 sm:mr-2" />
                  Budgets
                </button>
                <button
                  ref={recurringTabRef}
                  onClick={() => handleTabChange("recurring")}
                  className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
                    activeTab === "recurring"
                      ? isHalloweenMode
                        ? "text-[#60c9b6]"
                        : "text-[#8B5CF6]"
                      : isDark
                        ? isHalloweenMode
                          ? "text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-[#B4B4B8] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8B5CF6]"
                        : isHalloweenMode
                          ? "text-gray-600 hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-gray-600 hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8B5CF6]"
                  }`}
                >
                  <Repeat className="w-4 h-4 inline mr-1 sm:mr-2" />
                  Recurring
                </button>
                <button
                  ref={accountsTabRef}
                  onClick={() => handleTabChange("accounts")}
                  className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
                    activeTab === "accounts"
                      ? isHalloweenMode
                        ? "text-[#60c9b6]"
                        : "text-[#F97316]"
                      : isDark
                        ? isHalloweenMode
                          ? "text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-[#B4B4B8] hover:bg-[rgba(249,115,22,0.1)] hover:text-[#F97316]"
                        : isHalloweenMode
                          ? "text-gray-600 hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-gray-600 hover:bg-[rgba(249,115,22,0.1)] hover:text-[#F97316]"
                  }`}
                >
                  <Wallet className="w-4 h-4 inline mr-1 sm:mr-2" />
                  Accounts
                </button>
                <button
                  ref={balanceSheetTabRef}
                  onClick={() => handleTabChange("balance_sheet")}
                  className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
                    activeTab === "balance_sheet"
                      ? isHalloweenMode
                        ? "text-[#60c9b6]"
                        : "text-[#06B6D4]"
                      : isDark
                        ? isHalloweenMode
                          ? "text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-[#B4B4B8] hover:bg-[rgba(6,182,212,0.1)] hover:text-[#06B6D4]"
                        : isHalloweenMode
                          ? "text-gray-600 hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-gray-600 hover:bg-[rgba(6,182,212,0.1)] hover:text-[#06B6D4]"
                  }`}
                >
                  <BarChart className="w-4 h-4 inline mr-1 sm:mr-2" />
                  Balance Sheet
                </button>
                <button
                  ref={categoriesTabRef}
                  onClick={() => handleTabChange("categories")}
                  className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
                    activeTab === "categories"
                      ? isHalloweenMode
                        ? "text-[#60c9b6]"
                        : "text-[#EC4899]"
                      : isDark
                        ? isHalloweenMode
                          ? "text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-[#B4B4B8] hover:bg-[rgba(236,72,153,0.1)] hover:text-[#EC4899]"
                        : isHalloweenMode
                          ? "text-gray-600 hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-gray-600 hover:bg-[rgba(236,72,153,0.1)] hover:text-[#EC4899]"
                  }`}
                >
                  <Tag className="w-4 h-4 inline mr-1 sm:mr-2" />
                  Categories
                </button>
                <button
                  ref={insightsTabRef}
                  onClick={() => handleTabChange("insights")}
                  className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
                    activeTab === "insights"
                      ? isHalloweenMode
                        ? "text-[#60c9b6]"
                        : "text-[#3B82F6]"
                      : isDark
                        ? isHalloweenMode
                          ? "text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-[#B4B4B8] hover:bg-[rgba(59,130,246,0.1)] hover:text-[#3B82F6]"
                        : isHalloweenMode
                          ? "text-gray-600 hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-gray-600 hover:bg-[rgba(59,130,246,0.1)] hover:text-[#3B82F6]"
                  }`}
                >
                  <Sparkles className="w-4 h-4 inline mr-1 sm:mr-2" />
                  {isHalloweenMode ? "Financial Crypt" : "AI Insights"}
                </button>
                <button
                  ref={expensesTabRef}
                  onClick={() => handleTabChange("expenses")}
                  className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
                    activeTab === "expenses"
                      ? isHalloweenMode
                        ? "text-[#60c9b6]"
                        : "text-[#10B981]"
                      : isDark
                        ? isHalloweenMode
                          ? "text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-[#B4B4B8] hover:bg-[rgba(16,185,129,0.1)] hover:text-[#10B981]"
                        : isHalloweenMode
                          ? "text-gray-600 hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-gray-600 hover:bg-[rgba(16,185,129,0.1)] hover:text-[#10B981]"
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-1 sm:mr-2" />
                  Expense Records
                </button>
                <button
                  ref={analyticsTabRef}
                  onClick={() => handleTabChange("analytics")}
                  className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
                    activeTab === "analytics"
                      ? isHalloweenMode
                        ? "text-[#60c9b6]"
                        : "text-[#3B82F6]"
                      : isDark
                        ? isHalloweenMode
                          ? "text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-[#B4B4B8] hover:bg-[rgba(59,130,246,0.1)] hover:text-[#3B82F6]"
                        : isHalloweenMode
                          ? "text-gray-600 hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-gray-600 hover:bg-[rgba(59,130,246,0.1)] hover:text-[#3B82F6]"
                  }`}
                >
                  <BarChart className="w-4 h-4 inline mr-1 sm:mr-2" />
                  Analytics
                </button>
                <button
                  ref={calendarTabRef}
                  onClick={() => handleTabChange("calendar")}
                  className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
                    activeTab === "calendar"
                      ? isHalloweenMode
                        ? "text-[#60c9b6]"
                        : "text-[#F59E0B]"
                      : isDark
                        ? isHalloweenMode
                          ? "text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-[#B4B4B8] hover:bg-[rgba(245,158,11,0.1)] hover:text-[#F59E0B]"
                        : isHalloweenMode
                          ? "text-gray-600 hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                          : "text-gray-600 hover:bg-[rgba(245,158,11,0.1)] hover:text-[#F59E0B]"
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-1 sm:mr-2" />
                  Calendar
                </button>
              </div>

              {/* Currency Selector - Desktop only */}
              <div className="hidden md:block w-48">
                <SearchableDropdown
                  value={currency.code}
                  onValueChange={(code) => {
                    const selectedCurrency = CURRENCIES.find(
                      (c) => c.code === code,
                    );
                    if (selectedCurrency) {
                      setCurrency(selectedCurrency);
                    }
                  }}
                  options={currencyOptions}
                  placeholder="Select Currency"
                />
              </div>
            </div>

            {/* Currency Selector - Mobile only (below tabs) */}
            <div className="md:hidden w-full mb-4">
              <SearchableDropdown
                value={currency.code}
                onValueChange={(code) => {
                  const selectedCurrency = CURRENCIES.find(
                    (c) => c.code === code,
                  );
                  if (selectedCurrency) {
                    setCurrency(selectedCurrency);
                  }
                }}
                options={currencyOptions}
                placeholder="Select Currency"
              />
            </div>
          </div>
        )}

        <motion.div
          key={`${activeTab}-${currentView}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentView === "detail" && selectedBudget ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Budget Overview Card */}
              <GlassCard
                variant="secondary"
                className="relative overflow-hidden"
              >
                {/* Decorative gradient background */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    background: `radial-gradient(circle at top right, ${selectedBudget.color}, transparent 70%)`,
                  }}
                />

                <div className="relative p-4 sm:p-6 md:p-8">
                  {/* Header with description */}
                  {selectedBudget.description && (
                    <div className="mb-6 sm:mb-8">
                      <p
                        className={`text-sm sm:text-base leading-relaxed ${
                          isDark ? "text-[#B4B4B8]" : "text-gray-600"
                        }`}
                      >
                        {selectedBudget.description}
                      </p>
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 sm:mb-8">
                    {/* Budget Amount Card */}
                    <div
                      className={`group relative overflow-hidden p-3 md:p-4 rounded-xl border transition-all ${
                        isHalloweenMode
                          ? isDark
                            ? "bg-[#1a1a1f] border-[#60c9b6]/30 hover:border-[#60c9b6]/60 shadow-[0_0_10px_rgba(96,201,182,0.1)]"
                            : "bg-white border-[#60c9b6]/30 hover:border-[#60c9b6]/60 shadow-[0_0_10px_rgba(96,201,182,0.1)]"
                          : isDark
                            ? "bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.15)]"
                            : "bg-[rgba(139,92,246,0.05)] border-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.1)]"
                      }`}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div>
                          <p
                            className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${
                              isHalloweenMode
                                ? "text-[#60c9b6]"
                                : "text-[#8B5CF6]"
                            }`}
                          >
                            Budget Amount
                          </p>
                          <p
                            className={`text-base md:text-2xl font-bold ${
                              isHalloweenMode
                                ? "text-[#60c9b6] drop-shadow-[0_0_5px_rgba(96,201,182,0.5)]"
                                : "text-[#8B5CF6]"
                            }`}
                          >
                            {formatAmount(selectedBudget.amount, 0)}
                          </p>
                        </div>
                        <div
                          className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${
                            isHalloweenMode
                              ? "bg-[#60c9b6]/20 border border-[#60c9b6]/30"
                              : "bg-[rgba(139,92,246,0.2)]"
                          }`}
                        >
                          {isHalloweenMode ? (
                            <img
                              src={pumpkinWitchhat}
                              alt="Pumpkin"
                              className="w-5 h-5 md:w-7 md:h-7 drop-shadow-lg"
                            />
                          ) : (
                            <DollarSign
                              className={`w-4 h-4 md:w-6 md:h-6 ${
                                isHalloweenMode
                                  ? "text-[#60c9b6]"
                                  : "text-[#8B5CF6]"
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Spent Card */}
                    <div
                      className={`group relative overflow-hidden p-3 md:p-4 rounded-xl border transition-all ${
                        isHalloweenMode
                          ? isDark
                            ? "bg-[#1a1a1f] border-[#60c9b6]/30 hover:border-[#60c9b6]/60 shadow-[0_0_10px_rgba(96,201,182,0.1)]"
                            : "bg-white border-[#60c9b6]/30 hover:border-[#60c9b6]/60 shadow-[0_0_10px_rgba(96,201,182,0.1)]"
                          : isDark
                            ? "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)] hover:bg-[rgba(245,158,11,0.15)]"
                            : "bg-[rgba(245,158,11,0.05)] border-[rgba(245,158,11,0.2)] hover:bg-[rgba(245,158,11,0.1)]"
                      }`}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div>
                          <p
                            className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${
                              selectedBudget.spent > selectedBudget.amount
                                ? "text-[#EF4444]"
                                : isHalloweenMode
                                  ? "text-[#60c9b6]"
                                  : "text-[#F59E0B]"
                            }`}
                          >
                            Spent
                          </p>
                          <p
                            className={`text-base md:text-2xl font-bold ${
                              selectedBudget.spent > selectedBudget.amount
                                ? "text-[#EF4444]"
                                : isHalloweenMode
                                  ? "text-[#60c9b6] drop-shadow-[0_0_5px_rgba(96,201,182,0.5)]"
                                  : "text-[#F59E0B]"
                            }`}
                          >
                            {formatAmount(selectedBudget.spent, 0)}
                          </p>
                        </div>
                        <div
                          className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${
                            selectedBudget.spent > selectedBudget.amount
                              ? isHalloweenMode
                                ? "bg-[#60c9b6]/20 border border-[#60c9b6]/30"
                                : isDark
                                  ? "bg-[rgba(239,68,68,0.2)]"
                                  : "bg-[rgba(239,68,68,0.2)]"
                              : isHalloweenMode
                                ? "bg-[#60c9b6]/20 border border-[#60c9b6]/30"
                                : "bg-[rgba(245,158,11,0.2)]"
                          }`}
                        >
                          {isHalloweenMode ? (
                            <img
                              src={ghostScare}
                              alt="Ghost"
                              className="w-5 h-5 md:w-7 md:h-7 drop-shadow-lg"
                            />
                          ) : (
                            <DollarSign
                              className={`w-4 h-4 md:w-6 md:h-6 ${
                                selectedBudget.spent > selectedBudget.amount
                                  ? "text-[#EF4444]"
                                  : "text-[#F59E0B]"
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remaining Card */}
                    <div
                      className={`group relative overflow-hidden col-span-2 md:col-span-1 p-3 md:p-4 rounded-xl border transition-all ${
                        isHalloweenMode
                          ? isDark
                            ? "bg-[#1a1a1f] border-[#60c9b6]/30 hover:border-[#60c9b6]/60 shadow-[0_0_10px_rgba(96,201,182,0.1)]"
                            : "bg-white border-[#60c9b6]/30 hover:border-[#60c9b6]/60 shadow-[0_0_10px_rgba(96,201,182,0.1)]"
                          : isDark
                            ? "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.15)]"
                            : "bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.1)]"
                      }`}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div>
                          <p
                            className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${
                              selectedBudget.amount - selectedBudget.spent < 0
                                ? "text-[#EF4444]"
                                : isHalloweenMode
                                  ? "text-[#60c9b6]"
                                  : "text-[#10B981]"
                            }`}
                          >
                            {selectedBudget.amount - selectedBudget.spent < 0
                              ? "Over Budget"
                              : "Remaining"}
                          </p>
                          <p
                            className={`text-base md:text-2xl font-bold ${
                              selectedBudget.amount - selectedBudget.spent < 0
                                ? "text-[#EF4444]"
                                : isHalloweenMode
                                  ? "text-[#60c9b6] drop-shadow-[0_0_5px_rgba(96,201,182,0.5)]"
                                  : "text-[#10B981]"
                            }`}
                          >
                            {formatAmount(
                              Math.abs(
                                selectedBudget.amount - selectedBudget.spent,
                              ),
                              0,
                            )}
                          </p>
                        </div>
                        <div
                          className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${
                            selectedBudget.amount - selectedBudget.spent < 0
                              ? isHalloweenMode
                                ? "bg-[#60c9b6]/20 border border-[#60c9b6]/30"
                                : isDark
                                  ? "bg-[rgba(239,68,68,0.2)]"
                                  : "bg-[rgba(239,68,68,0.2)]"
                              : isHalloweenMode
                                ? "bg-[#60c9b6]/20 border border-[#60c9b6]/30"
                                : "bg-[rgba(16,185,129,0.2)]"
                          }`}
                        >
                          {isHalloweenMode ? (
                            <img
                              src={catWitchHat}
                              alt="Cat"
                              className="w-5 h-5 md:w-7 md:h-7 drop-shadow-lg"
                            />
                          ) : (
                            <DollarSign
                              className={`w-4 h-4 md:w-6 md:h-6 ${
                                selectedBudget.amount - selectedBudget.spent < 0
                                  ? "text-[#EF4444]"
                                  : "text-[#10B981]"
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="relative mb-6 sm:mb-8">
                    {isHalloweenMode && (
                      <>
                        {/* Floating spider hanging above progress bar */}
                        <motion.div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20">
                          <motion.div
                            className="w-px bg-[#60c9b6] opacity-30"
                            animate={{ height: ["0px", "20px"] }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                          <motion.img
                            src={spiderSharpHanging}
                            alt=""
                            className="w-6 h-6 -mt-1"
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: 0.6,
                              y: [0, 3, 0],
                            }}
                            transition={{
                              opacity: { duration: 1, delay: 0.5 },
                              y: {
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1.5,
                              },
                            }}
                          />
                        </motion.div>

                        {/* Web decorations at corners */}
                        <img
                          src={webCenter}
                          alt=""
                          className="absolute -top-3 -left-3 w-12 opacity-15 pointer-events-none"
                        />
                        <img
                          src={webCenter}
                          alt=""
                          className="absolute -top-3 -right-3 w-12 opacity-15 pointer-events-none transform scale-x-[-1]"
                        />
                      </>
                    )}

                    {/* Container with glow effect */}
                    <motion.div
                      className={`relative rounded-xl p-4 ${
                        isHalloweenMode
                          ? "bg-[rgba(96,201,182,0.05)] border border-[#60c9b6]/20"
                          : ""
                      }`}
                      animate={
                        isHalloweenMode
                          ? {
                              boxShadow: [
                                "0 0 10px rgba(96,201,182,0.1)",
                                "0 0 20px rgba(96,201,182,0.15)",
                                "0 0 10px rgba(96,201,182,0.1)",
                              ],
                            }
                          : {}
                      }
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <BarChart
                            className={`w-4 h-4 ${
                              isHalloweenMode
                                ? "text-[#60c9b6]"
                                : isDark
                                  ? "text-[#B4B4B8]"
                                  : "text-gray-600"
                            }`}
                          />
                          <span
                            className={`text-sm font-semibold ${
                              isHalloweenMode
                                ? "text-[#60c9b6]"
                                : isDark
                                  ? "text-white"
                                  : "text-gray-900"
                            }`}
                          >
                            Budget Progress
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Progress percentage badge */}
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              selectedBudget.spent > selectedBudget.amount
                                ? "bg-red-500/20 text-red-500"
                                : (selectedBudget.spent /
                                      selectedBudget.amount) *
                                      100 >
                                    80
                                  ? "bg-amber-500/20 text-amber-500"
                                  : isHalloweenMode
                                    ? "bg-[#60c9b6]/20 text-[#60c9b6]"
                                    : "bg-green-500/20 text-green-500"
                            }`}
                          >
                            {Math.min(
                              (selectedBudget.spent / selectedBudget.amount) *
                                100,
                              100,
                            ).toFixed(1)}
                            %
                          </span>
                          {/* Spooky icons based on progress */}
                          {isHalloweenMode && (
                            <motion.img
                              src={
                                selectedBudget.spent > selectedBudget.amount
                                  ? batSwoop
                                  : (selectedBudget.spent /
                                        selectedBudget.amount) *
                                        100 >
                                      80
                                    ? pumpkinScary
                                    : ghostScare
                              }
                              alt=""
                              className="w-5 h-5 opacity-60"
                              animate={{
                                y: [0, -3, 0],
                                rotate:
                                  selectedBudget.spent > selectedBudget.amount
                                    ? [0, -5, 5, 0]
                                    : 0,
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            />
                          )}
                        </div>
                      </div>
                      <div
                        className={`relative w-full rounded-full h-3 overflow-hidden ${
                          isDark ? "bg-[rgba(255,255,255,0.08)]" : "bg-gray-200"
                        }`}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(
                              (selectedBudget.spent / selectedBudget.amount) *
                                100,
                              100,
                            )}%`,
                          }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-3 rounded-full relative"
                          style={
                            {
                              backgroundColor:
                                selectedBudget.spent > selectedBudget.amount
                                  ? "#EF4444"
                                  : (selectedBudget.spent /
                                        selectedBudget.amount) *
                                        100 >
                                      80
                                    ? "#F59E0B"
                                    : isHalloweenMode
                                      ? "#60c9b6"
                                      : "#10B981",
                            } as React.CSSProperties
                          }
                        >
                          {/* Enhanced shimmer effect */}
                          <motion.div
                            className="absolute inset-0 opacity-40"
                            style={{
                              background:
                                "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                            }}
                            animate={{
                              x: ["-100%", "200%"],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          {/* Glowing edge effect for Halloween mode */}
                          {isHalloweenMode && (
                            <motion.div
                              className="absolute right-0 top-0 bottom-0 w-2"
                              animate={{
                                boxShadow: [
                                  "0 0 5px rgba(96,201,182,0.8)",
                                  "0 0 10px rgba(96,201,182,1)",
                                  "0 0 5px rgba(96,201,182,0.8)",
                                ],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            />
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Details Grid */}
                  <motion.div
                    className={`relative grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t ${
                      isDark
                        ? "border-[rgba(255,255,255,0.08)]"
                        : "border-gray-200"
                    }`}
                  >
                    {/* Background decorations for Halloween mode */}
                    {isHalloweenMode && (
                      <>
                        <motion.img
                          src={candleFive}
                          alt=""
                          className="absolute -top-2 left-4 w-8 h-8 opacity-12 pointer-events-none"
                          animate={{ opacity: [0.12, 0.18, 0.12] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        <motion.img
                          src={batSwoop}
                          alt=""
                          className="absolute top-2 right-8 w-8 h-8 opacity-10 pointer-events-none"
                          animate={{ x: [0, -5, 5, 0], y: [0, -2, 0] }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      </>
                    )}

                    {/* Category */}
                    <motion.div
                      className={`space-y-1 relative z-10 p-2 rounded-lg transition-all ${
                        isHalloweenMode
                          ? "hover:bg-[rgba(96,201,182,0.05)]"
                          : isDark
                            ? "hover:bg-[rgba(255,255,255,0.03)]"
                            : "hover:bg-gray-50"
                      }`}
                      whileHover={
                        isHalloweenMode
                          ? {
                              boxShadow: "0 0 12px rgba(96,201,182,0.15)",
                              scale: 1.02,
                            }
                          : {}
                      }
                    >
                      <p
                        className={`text-xs font-medium ${
                          isHalloweenMode
                            ? "text-[#60c9b6]/70"
                            : isDark
                              ? "text-[#B4B4B8]"
                              : "text-gray-500"
                        }`}
                      >
                        Category
                      </p>
                      <div className="flex items-center space-x-1.5">
                        <motion.div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: selectedBudget.color }}
                          whileHover={{ scale: 1.2 }}
                        />
                        <p
                          className={`text-sm font-semibold ${
                            isHalloweenMode
                              ? "text-[#60c9b6]"
                              : isDark
                                ? "text-white"
                                : "text-gray-900"
                          }`}
                        >
                          {selectedBudget.category.charAt(0).toUpperCase() +
                            selectedBudget.category.slice(1)}
                        </p>
                      </div>
                    </motion.div>

                    {/* Period */}
                    <motion.div
                      className={`space-y-1 relative z-10 p-2 rounded-lg transition-all ${
                        isHalloweenMode
                          ? "hover:bg-[rgba(96,201,182,0.05)]"
                          : isDark
                            ? "hover:bg-[rgba(255,255,255,0.03)]"
                            : "hover:bg-gray-50"
                      }`}
                      whileHover={
                        isHalloweenMode
                          ? {
                              boxShadow: "0 0 12px rgba(96,201,182,0.15)",
                              scale: 1.02,
                            }
                          : {}
                      }
                    >
                      <p
                        className={`text-xs font-medium ${
                          isHalloweenMode
                            ? "text-[#60c9b6]/70"
                            : isDark
                              ? "text-[#B4B4B8]"
                              : "text-gray-500"
                        }`}
                      >
                        Period
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          isHalloweenMode
                            ? "text-[#60c9b6]"
                            : isDark
                              ? "text-white"
                              : "text-gray-900"
                        }`}
                      >
                        {selectedBudget.period.charAt(0).toUpperCase() +
                          selectedBudget.period.slice(1)}
                      </p>
                    </motion.div>

                    {/* Start Date */}
                    <motion.div
                      className={`space-y-1 relative z-10 p-2 rounded-lg transition-all ${
                        isHalloweenMode
                          ? "hover:bg-[rgba(96,201,182,0.05)]"
                          : isDark
                            ? "hover:bg-[rgba(255,255,255,0.03)]"
                            : "hover:bg-gray-50"
                      }`}
                      whileHover={
                        isHalloweenMode
                          ? {
                              boxShadow: "0 0 12px rgba(96,201,182,0.15)",
                              scale: 1.02,
                            }
                          : {}
                      }
                    >
                      <p
                        className={`text-xs font-medium flex items-center gap-1 ${
                          isHalloweenMode
                            ? "text-[#60c9b6]/70"
                            : isDark
                              ? "text-[#B4B4B8]"
                              : "text-gray-500"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        Start Date
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          isHalloweenMode
                            ? "text-[#60c9b6]"
                            : isDark
                              ? "text-white"
                              : "text-gray-900"
                        }`}
                      >
                        {new Date(selectedBudget.start_date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </p>
                    </motion.div>

                    {/* End Date */}
                    <motion.div
                      className={`space-y-1 relative z-10 p-2 rounded-lg transition-all ${
                        isHalloweenMode
                          ? "hover:bg-[rgba(96,201,182,0.05)]"
                          : isDark
                            ? "hover:bg-[rgba(255,255,255,0.03)]"
                            : "hover:bg-gray-50"
                      }`}
                      whileHover={
                        isHalloweenMode
                          ? {
                              boxShadow: "0 0 12px rgba(96,201,182,0.15)",
                              scale: 1.02,
                            }
                          : {}
                      }
                    >
                      <p
                        className={`text-xs font-medium flex items-center gap-1 ${
                          isHalloweenMode
                            ? "text-[#60c9b6]/70"
                            : isDark
                              ? "text-[#B4B4B8]"
                              : "text-gray-500"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        End Date
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          isHalloweenMode
                            ? "text-[#60c9b6]"
                            : isDark
                              ? "text-white"
                              : "text-gray-900"
                        }`}
                      >
                        {new Date(selectedBudget.end_date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </p>
                    </motion.div>
                  </motion.div>
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
              </GlassCard>

              {/* Transactions List */}
              <TransactionList
                transactions={transactions.filter(
                  (t) => t.budget_id === selectedBudget.id,
                )}
                onDelete={(id, budgetId, amount) =>
                  setTransactionToDelete({ id, budgetId, amount })
                }
                onEdit={(transaction) => {
                  setEditingTransaction(transaction);
                  setShowTransactionForm(true);
                }}
                onView={(transaction) => setSelectedTransaction(transaction)}
              />
            </div>
          ) : activeTab === "budgets" ? (
            <div className="space-y-6">
              {budgets.length === 0 ? (
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
                            backgroundImage: `url(${cardCatFence})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                        <motion.img
                          src={ghostDroopy}
                          alt=""
                          className="absolute top-8 left-8 w-16 md:w-20 opacity-12 pointer-events-none z-0"
                          style={{
                            filter:
                              "drop-shadow(0 0 20px rgba(96, 201, 182, 0.4))",
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
                          src={candleFive}
                          alt=""
                          className="absolute bottom-8 right-8 w-14 md:w-16 opacity-16 pointer-events-none z-0"
                          style={{
                            filter:
                              "drop-shadow(0 0 18px rgba(245, 158, 11, 0.5))",
                          }}
                          animate={{
                            opacity: [0.16, 0.22, 0.16],
                          }}
                          transition={{
                            duration: 2.5,
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
                          src={pumpkinWitchhat}
                          alt=""
                          className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 opacity-80"
                          style={{
                            filter:
                              "drop-shadow(0 0 30px rgba(245, 158, 11, 0.5))",
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
                          className={`w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${
                            isDark
                              ? "bg-[rgba(139,92,246,0.1)] border-2 border-[rgba(139,92,246,0.3)]"
                              : "bg-[rgba(139,92,246,0.05)] border-2 border-[rgba(139,92,246,0.2)]"
                          }`}
                        >
                          <Wallet
                            className={`w-14 h-14 md:w-16 md:h-16 ${isDark ? "text-[#8B5CF6]" : "text-[#7C3AED]"}`}
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
                          ? "No Cursed Coffers Yet"
                          : "No Budgets Yet"}
                      </h3>
                      <p
                        className={`mb-6 text-sm md:text-base ${
                          isHalloweenMode
                            ? "text-[#60c9b6]/70"
                            : isDark
                              ? "text-[#B4B4B8]"
                              : "text-gray-600"
                        }`}
                      >
                        {isHalloweenMode
                          ? "Summon your first mystical budget to begin tracking the dark expenses of the realm."
                          : "Create your first budget to start tracking your expenses"}
                      </p>
                      <motion.button
                        onClick={() => setShowBudgetForm(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors shadow-lg ${
                          isHalloweenMode
                            ? "bg-[#60c9b6] hover:bg-[#48b39e] text-black shadow-[0_0_15px_rgba(96,201,182,0.3)]"
                            : "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-purple-500/30"
                        }`}
                      >
                        {isHalloweenMode
                          ? "Conjure First Budget"
                          : "Create Your First Budget"}
                      </motion.button>
                    </motion.div>
                  </div>
                </GlassCard>
              ) : (
                <GlassCard
                  variant="secondary"
                  className={`relative overflow-hidden ${
                    isHalloweenMode
                      ? "border-[rgba(96,201,182,0.4)]! shadow-[0_0_15px_rgba(96,201,182,0.15)]!"
                      : ""
                  }`}
                >
                  {isHalloweenMode && (
                    <>
                      <div
                        className="absolute inset-0 pointer-events-none opacity-5 z-0"
                        style={{
                          backgroundImage: `url(${cardCatFence})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          filter: "grayscale(100%)",
                        }}
                      />
                      <motion.img
                        src={batSwoop}
                        alt=""
                        className="absolute w-24 h-24 opacity-10 pointer-events-none z-0"
                        initial={{ top: "10%", right: "-10%", rotate: 15 }}
                        animate={{
                          right: ["-10%", "110%"],
                          y: [0, 20, -20, 0],
                          rotate: [15, -15, 15],
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </>
                  )}
                  <BudgetFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filter={filter}
                    onFilterChange={setFilter}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    budgets={budgets}
                  />
                  <div className="p-4 md:p-6 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sortedBudgets.map((budget) => (
                        <BudgetCard
                          key={budget.id}
                          budget={budget}
                          onEdit={(b) => {
                            setEditingBudget(b);
                            setShowBudgetForm(true);
                          }}
                          onDelete={(id) => setBudgetToDelete(id)}
                          onClick={handleBudgetClick}
                        />
                      ))}
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>
          ) : activeTab === "accounts" ? (
            <AccountList
              accounts={accounts}
              onDeleteAccount={async (id: string) => {
                await deleteAccountMutation.mutateAsync(id);
              }}
              onEditAccount={(account) => {
                setEditingAccount(account);
                setShowAccountModal(true);
              }}
              onEditGoal={handleEditGoal}
              onDeleteGoal={handleDeleteGoal}
              isLoading={
                (accountsLoading && accounts.length === 0) ||
                createAccountMutation.isPending ||
                updateAccountMutation.isPending ||
                deleteAccountMutation.isPending
              }
            />
          ) : activeTab === "balance_sheet" ? (
            accountsLoading || liabilitiesLoading ? (
              <BalanceSheetSkeleton />
            ) : (
              <BalanceSheetTab
                onAddAccount={() => {
                  setEditingAccount(undefined);
                  setShowAccountModal(true);
                }}
                onEditAccount={(account) => {
                  setEditingAccount(account);
                  setShowAccountModal(true);
                }}
                onDeleteAccount={(id) => {
                  deleteAccountMutation.mutateAsync(id);
                }}
                onAddLiability={() => {
                  setEditingLiability(undefined);
                  setShowLiabilityModal(true);
                }}
                onEditLiability={(liability) => {
                  setEditingLiability(liability);
                  setShowLiabilityModal(true);
                }}
              />
            )
          ) : activeTab === "insights" ? (
            <FinancialInsightsCard
              transactions={transactions}
              budgets={budgets}
            />
          ) : activeTab === "calendar" ? (
            <GlassCard variant="secondary">
              <BudgetCalendar
                budgets={budgets}
                transactions={transactions}
                onBudgetClick={handleBudgetClick}
                onTransactionClick={(transaction) =>
                  setSelectedTransaction(transaction)
                }
                onDateClick={(dateKey) => setSelectedDate(dateKey)}
              />
            </GlassCard>
          ) : activeTab === "analytics" ? (
            <BudgetAnalytics budgets={budgets} />
          ) : activeTab === "categories" ? (
            <CategoryManager triggerAdd={triggerAddCategory} />
          ) : activeTab === "recurring" ? (
            <RecurringManager />
          ) : (
            <TransactionList
              transactions={transactions}
              onDelete={(id, budgetId, amount) =>
                setTransactionToDelete({ id, budgetId, amount })
              }
              onEdit={(transaction) => {
                setEditingTransaction(transaction);
                setShowTransactionForm(true);
              }}
              onView={(transaction) => setSelectedTransaction(transaction)}
              budgets={budgets}
            />
          )}
        </motion.div>

        <BudgetModal
          isOpen={showBudgetForm}
          onClose={() => {
            setShowBudgetForm(false);
            setEditingBudget(undefined);
          }}
          budget={editingBudget}
          onSubmit={editingBudget ? handleUpdateBudget : handleCreateBudget}
          isLoading={
            editingBudget
              ? updateBudgetMutation.isPending
              : createBudgetMutation.isPending
          }
        />

        <TransactionModal
          isOpen={showTransactionForm}
          onClose={() => {
            setShowTransactionForm(false);
            setEditingTransaction(null);
          }}
          budgetId={selectedBudget?.id}
          budgets={budgets}
          onSubmit={handleAddTransaction}
          isLoading={createTransactionMutation.isPending}
          transaction={editingTransaction}
        />

        <GoalModal
          isOpen={showGoalModal}
          onClose={() => {
            setShowGoalModal(false);
            setEditingGoal(undefined);
          }}
          onSave={handleGoalSubmit}
          initialData={editingGoal}
        />

        <AccountModal
          isOpen={showAccountModal}
          onClose={() => {
            setShowAccountModal(false);
            setEditingAccount(undefined);
          }}
          account={editingAccount}
          onSubmit={handleAccountSubmit}
          isLoading={
            editingAccount
              ? updateAccountMutation.isPending
              : createAccountMutation.isPending
          }
        />

        <QuickExpenseModal
          isOpen={showQuickExpense}
          onClose={() => setShowQuickExpense(false)}
          onSubmit={handleAddTransaction}
          isLoading={createTransactionMutation.isPending}
        />

        <LiabilityModal
          isOpen={showLiabilityModal}
          onClose={() => {
            setShowLiabilityModal(false);
            setEditingLiability(undefined);
          }}
          onSave={handleLiabilitySubmit}
          initialData={editingLiability}
        />

        <ConfirmationModal
          isOpen={!!budgetToDelete}
          onClose={() => setBudgetToDelete(null)}
          onConfirm={handleDeleteBudget}
          title="Delete Budget"
          description="Are you sure you want to delete this budget? All associated transactions will also be deleted."
          confirmText="Delete Budget"
          type="danger"
          isLoading={deleteBudgetMutation.isPending}
        />

        <ConfirmationModal
          isOpen={!!transactionToDelete}
          onClose={() => setTransactionToDelete(null)}
          onConfirm={handleDeleteTransaction}
          title="Delete Transaction"
          description="Are you sure you want to delete this transaction?"
          itemTitle={
            transactionToDelete
              ? transactions.find((t) => t.id === transactionToDelete.id)
                  ?.description
              : undefined
          }
          itemDescription={
            transactionToDelete
              ? `${formatAmount(transactionToDelete.amount, 2)} • ${
                  transactions.find((t) => t.id === transactionToDelete.id)
                    ?.category
                }`
              : undefined
          }
          confirmText="Delete"
          type="danger"
          isLoading={deleteTransactionMutation.isPending}
        />

        {/* Calendar Day Transactions Modal */}
        <AnimatePresence>
          {selectedDate && (
            <Modal
              isOpen={true}
              onClose={() => setSelectedDate(null)}
              title={`Transactions on ${new Date(selectedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
              size="md"
              className={
                isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]! relative overflow-hidden"
                  : ""
              }
            >
              {isHalloweenMode && (
                <>
                  <div className="absolute -bottom-10 -left-10 pointer-events-none z-0">
                    <img
                      src={witchBrew}
                      alt=""
                      className="w-48 h-48 -rotate-12 opacity-10"
                    />
                  </div>
                  <div className="absolute -top-10 -right-10 pointer-events-none z-0">
                    <img
                      src={spiderHairyCrawling}
                      alt=""
                      className="w-48 h-48 rotate-12 opacity-10"
                    />
                  </div>
                </>
              )}
              <div className="space-y-2 relative z-10">
                {transactions
                  .filter((t) => t.transaction_date === selectedDate)
                  .map((transaction) => {
                    const budget = budgets.find(
                      (b) => b.id === transaction.budget_id,
                    );
                    return (
                      <button
                        key={transaction.id}
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setSelectedDate(null);
                        }}
                        className={`w-full text-left p-2 rounded-lg transition-all ${
                          isHalloweenMode
                            ? isDark
                              ? "bg-[rgba(96,201,182,0.05)] hover:bg-[rgba(96,201,182,0.1)] hover:shadow-[0_0_15px_rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.1)] hover:border-[rgba(96,201,182,0.3)]"
                              : "bg-white hover:bg-[rgba(96,201,182,0.1)] hover:shadow-[0_0_15px_rgba(96,201,182,0.15)] border border-[rgba(96,201,182,0.2)] hover:border-[rgba(96,201,182,0.4)]"
                            : isDark
                              ? "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]"
                              : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                            <div
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: isHalloweenMode
                                  ? "rgba(96,201,182,0.2)"
                                  : `${budget?.color || "#8B5CF6"}20`,
                              }}
                            >
                              {isHalloweenMode ? (
                                <img
                                  src={pumpkinSneaky}
                                  alt=""
                                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                />
                              ) : (
                                <FileText
                                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                  style={{ color: budget?.color || "#8B5CF6" }}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm sm:text-base font-medium truncate ${
                                  isHalloweenMode
                                    ? "text-[#60c9b6]"
                                    : isDark
                                      ? "text-white"
                                      : "text-gray-900"
                                }`}
                              >
                                {transaction.description}
                              </p>
                              <p
                                className={`text-xs ${
                                  isHalloweenMode
                                    ? "text-[#60c9b6]/70"
                                    : isDark
                                      ? "text-[#B4B4B8]"
                                      : "text-gray-600"
                                }`}
                              >
                                {transaction.category}
                              </p>
                            </div>
                          </div>
                          <span
                            className="text-base sm:text-lg font-bold shrink-0"
                            style={{
                              color: isHalloweenMode
                                ? "#60c9b6"
                                : budget?.color || "#8B5CF6",
                            }}
                          >
                            {formatAmount(transaction.amount, 0)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </Modal>
          )}
        </AnimatePresence>

        {/* Transaction Detail Modal */}
        <AnimatePresence>
          {selectedTransaction && (
            <Modal
              isOpen={true}
              onClose={() => setSelectedTransaction(null)}
              title="Transaction Details"
              size="md"
              className={`relative overflow-hidden ${
                isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
                  : ""
              }`}
            >
              {isHalloweenMode && (
                <>
                  <div className="absolute -bottom-10 -right-10 pointer-events-none z-0">
                    <img
                      src={pumpkinBlocky}
                      alt=""
                      className="w-48 h-48 rotate-12 opacity-10"
                    />
                  </div>
                  <div className="absolute -top-10 -left-10 pointer-events-none z-0">
                    <img
                      src={batSwoop}
                      alt=""
                      className="w-40 h-40 -rotate-12 opacity-10"
                    />
                  </div>
                </>
              )}
              <div className="relative z-10">
                {(() => {
                  const budget = budgets.find(
                    (b) => b.id === selectedTransaction.budget_id,
                  );
                  return (
                    <div className="space-y-4 md:space-y-6">
                      <div className="flex items-start space-x-3 md:space-x-4">
                        <div
                          className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${budget?.color || "#8B5CF6"}20`,
                          }}
                        >
                          {isHalloweenMode ? (
                            <img
                              src={pumpkinWitchhat}
                              alt=""
                              className="w-5 h-5 md:w-6 md:h-6 "
                            />
                          ) : (
                            <FileText
                              className="w-5 h-5 md:w-6 md:h-6"
                              style={{ color: budget?.color || "#8B5CF6" }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`text-lg md:text-xl font-medium mb-1 wrap-break-word ${
                              isHalloweenMode
                                ? "text-[#60c9b6]"
                                : isDark
                                  ? "text-white"
                                  : "text-gray-900"
                            }`}
                          >
                            {selectedTransaction.description}
                          </h3>
                          <p
                            className={`text-xs md:text-sm ${
                              isHalloweenMode
                                ? "text-[#60c9b6]/70"
                                : isDark
                                  ? "text-[#B4B4B8]"
                                  : "text-gray-600"
                            }`}
                          >
                            {selectedTransaction.category}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`p-3 md:p-4 rounded-lg ${
                          isDark ? "bg-[rgba(255,255,255,0.05)]" : "bg-gray-50"
                        }`}
                      >
                        <p
                          className={`text-xs md:text-sm mb-1 ${
                            isHalloweenMode
                              ? "text-[#60c9b6]/70"
                              : isDark
                                ? "text-[#B4B4B8]"
                                : "text-gray-600"
                          }`}
                        >
                          Amount
                        </p>
                        <p
                          className="text-2xl md:text-3xl font-bold"
                          style={{
                            color: isHalloweenMode
                              ? "#60c9b6"
                              : budget?.color || "#8B5CF6",
                          }}
                        >
                          {formatAmount(selectedTransaction.amount, 0)}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <div>
                          <p
                            className={`text-[10px] md:text-xs mb-1 ${
                              isHalloweenMode
                                ? "text-[#60c9b6]/70"
                                : isDark
                                  ? "text-[#B4B4B8]"
                                  : "text-gray-600"
                            }`}
                          >
                            Date
                          </p>
                          <p
                            className={`text-xs md:text-sm font-medium ${
                              isHalloweenMode
                                ? "text-[#60c9b6]"
                                : isDark
                                  ? "text-white"
                                  : "text-gray-900"
                            }`}
                          >
                            {new Date(
                              selectedTransaction.transaction_date,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p
                            className={`text-[10px] md:text-xs mb-1 ${
                              isHalloweenMode
                                ? "text-[#60c9b6]/70"
                                : isDark
                                  ? "text-[#B4B4B8]"
                                  : "text-gray-600"
                            }`}
                          >
                            Category
                          </p>
                          <p
                            className={`text-xs md:text-sm font-medium capitalize ${
                              isHalloweenMode
                                ? "text-[#60c9b6]"
                                : isDark
                                  ? "text-white"
                                  : "text-gray-900"
                            }`}
                          >
                            {selectedTransaction.category}
                          </p>
                        </div>
                      </div>

                      {budget && (
                        <div
                          className={`p-3 md:p-4 rounded-lg border ${
                            isDark
                              ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div className="flex items-center space-x-2">
                              <WalletIcon
                                className="w-3.5 h-3.5 md:w-4 md:h-4"
                                style={{
                                  color: isHalloweenMode
                                    ? "#60c9b6"
                                    : budget.color,
                                }}
                              />
                              <p
                                className={`text-xs md:text-sm font-medium ${
                                  isHalloweenMode
                                    ? "text-[#60c9b6]"
                                    : isDark
                                      ? "text-white"
                                      : "text-gray-900"
                                }`}
                              >
                                {budget.name}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                handleBudgetClick(budget);
                                setSelectedTransaction(null);
                              }}
                              className={`text-[10px] md:text-xs font-medium whitespace-nowrap ${
                                isHalloweenMode
                                  ? "text-[#60c9b6] hover:text-[#4db8a5]"
                                  : "text-[#8B5CF6] hover:text-[#7C3AED]"
                              }`}
                            >
                              View Budget →
                            </button>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-[10px] md:text-xs">
                            <span
                              className={
                                isHalloweenMode
                                  ? "text-[#60c9b6]/70"
                                  : isDark
                                    ? "text-[#B4B4B8]"
                                    : "text-gray-600"
                              }
                            >
                              Budget: {budget.amount.toFixed(0)} • Spent:{" "}
                              {budget.spent.toFixed(0)}
                            </span>
                            <span
                              className={`font-semibold ${
                                budget.spent > budget.amount
                                  ? "text-red-500"
                                  : "text-[#10B981]"
                              }`}
                            >
                              {((budget.spent / budget.amount) * 100).toFixed(
                                0,
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
