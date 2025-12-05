import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSpookyAI } from "@/hooks/useSpookyAI";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import {
  Account,
  AnalyticsSummary,
  Budget,
  BudgetTransaction,
  Category,
  CategorySpending,
  DailySpending,
  Liability,
  RecurringTransaction,
} from "@/types/budget";

export const QUERY_KEYS = {
  BUDGETS: "budgets",
  BUDGET_TRANSACTIONS: "budget-transactions",
  ANALYTICS: "analytics",
  ACCOUNTS: "finance_accounts",
  RECURRING_TRANSACTIONS: "recurring-transactions",
  CATEGORIES: "categories",
} as const;

const QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000,
  GC_TIME: 10 * 60 * 1000,
} as const;

const handleSupabaseError = (error: PostgrestError, operation: string) => {
  console.error(`Error ${operation}:`, error);
  const errorMessage =
    error.code === "PGRST116"
      ? `No ${operation.split(" ")[1]} found or access denied`
      : `Failed to ${operation}. Please try again.`;
  toast.error(errorMessage);
};

export const useBudgetsQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEYS.BUDGETS, user?.id],
    queryFn: async (): Promise<Budget[]> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!user?.id,
    staleTime: QUERY_CONFIG.STALE_TIME,
    gcTime: QUERY_CONFIG.GC_TIME,
  });
};

export const useCreateBudget = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToGrimoire } = useSpookyAI();

  return useMutation({
    mutationFn: async (
      budgetData: Omit<
        Budget,
        "id" | "user_id" | "created_at" | "updated_at" | "spent"
      >,
    ): Promise<Budget> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("budgets")
        .insert({
          ...budgetData,
          user_id: user.id,
          spent: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Budget;
    },
    onSuccess: async (newBudget) => {
      queryClient.setQueryData(
        [QUERY_KEYS.BUDGETS, user?.id],
        (oldData: Budget[] = []) => [newBudget, ...oldData],
      );
      toast.success("Budget created successfully!");

      // Auto-index for RAG
      try {
        const categories = queryClient.getQueryData<Category[]>([
          QUERY_KEYS.CATEGORIES,
          user?.id,
        ]);
        const categoryName =
          categories?.find((c) => c.id === newBudget.category)?.name ||
          newBudget.category;

        await addToGrimoire(
          `Budget: ${newBudget.name}
Category: ${categoryName}
Amount: ${newBudget.amount}
Spent: ${newBudget.spent}
Period: ${newBudget.period}
Status: On Track`,
          {
            type: "budget",
            original_id: newBudget.id,
            amount: newBudget.amount,
            spent: newBudget.spent,
            category: categoryName,
            period: newBudget.period,
            start_date: newBudget.start_date,
            end_date: newBudget.end_date,
            created_at: newBudget.created_at,
          },
        );
      } catch (error) {
        console.error("Failed to index budget:", error);
      }
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "create budget");
    },
  });
};

export const useUpdateBudget = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToGrimoire } = useSpookyAI();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Budget>;
    }): Promise<Budget> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("budgets")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Budget;
    },
    onSuccess: async (updatedBudget) => {
      queryClient.setQueryData(
        [QUERY_KEYS.BUDGETS, user?.id],
        (oldData: Budget[] = []) =>
          oldData.map((budget) =>
            budget.id === updatedBudget.id ? updatedBudget : budget,
          ),
      );
      toast.success("Budget updated successfully!");

      // Auto-index for RAG
      try {
        const categories = queryClient.getQueryData<Category[]>([
          QUERY_KEYS.CATEGORIES,
          user?.id,
        ]);
        const categoryName =
          categories?.find((c) => c.id === updatedBudget.category)?.name ||
          updatedBudget.category;

        await addToGrimoire(
          `Budget: ${updatedBudget.name}
Category: ${categoryName}
Amount: ${updatedBudget.amount}
Spent: ${updatedBudget.spent}
Period: ${updatedBudget.period}
Status: ${updatedBudget.spent > updatedBudget.amount ? "Over Budget" : "On Track"}`,
          {
            type: "budget",
            original_id: updatedBudget.id,
            amount: updatedBudget.amount,
            spent: updatedBudget.spent,
            category: categoryName,
            period: updatedBudget.period,
            start_date: updatedBudget.start_date,
            end_date: updatedBudget.end_date,
            created_at: updatedBudget.created_at,
          },
        );
      } catch (error) {
        console.error("Failed to index budget:", error);
      }
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "update budget");
    },
  });
};

export const useDeleteBudget = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(
        [QUERY_KEYS.BUDGETS, user?.id],
        (oldData: Budget[] = []) =>
          oldData.filter((budget) => budget.id !== deletedId),
      );

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUDGET_TRANSACTIONS, user?.id],
      });

      toast.success("Budget deleted successfully!");
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "delete budget");
    },
  });
};

export const useBudgetTransactionsQuery = (budgetId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEYS.BUDGET_TRANSACTIONS, user?.id, budgetId],
    queryFn: async (): Promise<BudgetTransaction[]> => {
      if (!user) throw new Error("User not authenticated");

      let query = supabase
        .from("budget_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false });

      if (budgetId) {
        query = query.eq("budget_id", budgetId);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (error) throw error;
      return data as BudgetTransaction[];
    },
    enabled: !!user?.id,
    staleTime: QUERY_CONFIG.STALE_TIME,
    gcTime: QUERY_CONFIG.GC_TIME,
  });
};

export const useCreateTransaction = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      transaction: Omit<BudgetTransaction, "id" | "user_id" | "created_at">,
    ): Promise<BudgetTransaction> => {
      if (!user) throw new Error("User not authenticated");

      // Only include valid fields for budget_transactions table
      const transactionData = {
        budget_id: transaction.budget_id,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        transaction_date: transaction.transaction_date,
        account_id: transaction.account_id || null,
        category_id: transaction.category_id || null,
        type: transaction.type || null,
        to_account_id: transaction.to_account_id || null,
        tags: transaction.tags || null,
        is_recurring: transaction.is_recurring || null,
        recurring_id: transaction.recurring_id || null,
        balance: transaction.balance || null,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from("budget_transactions")
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      if (transaction.budget_id) {
        const { error: budgetError } = await supabase.rpc(
          "update_budget_spent",
          {
            p_budget_id: transaction.budget_id,
            p_amount: transaction.amount,
          },
        );

        if (budgetError) throw budgetError;
      }

      return data as BudgetTransaction;
    },
    onSuccess: (newTransaction) => {
      queryClient.setQueryData(
        [QUERY_KEYS.BUDGET_TRANSACTIONS, user?.id],
        (oldData: BudgetTransaction[] = []) => [newTransaction, ...oldData],
      );

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUDGET_TRANSACTIONS, user?.id],
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUDGETS, user?.id],
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ANALYTICS, user?.id],
      });

      // Invalidate accounts if transaction affects account balance
      if (newTransaction.account_id || newTransaction.to_account_id) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.ACCOUNTS, user?.id],
        });
      }

      toast.success(
        newTransaction.budget_id
          ? "Transaction added successfully!"
          : "Quick expense recorded!",
      );
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "add transaction");
    },
  });
};

export const useUpdateTransaction = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
      oldBudgetId,
      oldAmount,
    }: {
      id: string;
      updates: Partial<BudgetTransaction>;
      oldBudgetId: string | null;
      oldAmount: number;
    }): Promise<BudgetTransaction> => {
      if (!user) throw new Error("User not authenticated");

      // Only include valid fields for budget_transactions table
      const transactionUpdates: Database["public"]["Tables"]["budget_transactions"]["Update"] =
        {};
      if (updates.budget_id !== undefined)
        transactionUpdates.budget_id = updates.budget_id;
      if (updates.amount !== undefined)
        transactionUpdates.amount = updates.amount;
      if (updates.description !== undefined)
        transactionUpdates.description = updates.description;
      if (updates.category !== undefined)
        transactionUpdates.category = updates.category;
      if (updates.transaction_date !== undefined)
        transactionUpdates.transaction_date = updates.transaction_date;
      if (updates.account_id !== undefined)
        transactionUpdates.account_id = updates.account_id;
      if (updates.category_id !== undefined)
        transactionUpdates.category_id = updates.category_id;
      if (updates.type !== undefined) transactionUpdates.type = updates.type;
      if (updates.to_account_id !== undefined)
        transactionUpdates.to_account_id = updates.to_account_id;
      if (updates.tags !== undefined) transactionUpdates.tags = updates.tags;
      if (updates.is_recurring !== undefined)
        transactionUpdates.is_recurring = updates.is_recurring;
      if (updates.recurring_id !== undefined)
        transactionUpdates.recurring_id = updates.recurring_id;
      if (updates.balance !== undefined)
        transactionUpdates.balance = updates.balance;

      const { data, error } = await supabase
        .from("budget_transactions")
        .update(transactionUpdates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      const newBudgetId =
        updates.budget_id !== undefined ? updates.budget_id : oldBudgetId;
      const newAmount =
        updates.amount !== undefined ? updates.amount : oldAmount;

      if (oldBudgetId) {
        const { error: oldBudgetError } = await supabase.rpc(
          "update_budget_spent",
          {
            p_budget_id: oldBudgetId,
            p_amount: -oldAmount,
          },
        );
        if (oldBudgetError) throw oldBudgetError;
      }

      if (newBudgetId) {
        const { error: newBudgetError } = await supabase.rpc(
          "update_budget_spent",
          {
            p_budget_id: newBudgetId,
            p_amount: newAmount,
          },
        );
        if (newBudgetError) throw newBudgetError;
      }

      return data as BudgetTransaction;
    },
    onSuccess: (updatedTransaction, { updates }) => {
      queryClient.setQueryData(
        [QUERY_KEYS.BUDGET_TRANSACTIONS, user?.id],
        (oldData: BudgetTransaction[] = []) =>
          oldData.map((transaction) =>
            transaction.id === updatedTransaction.id
              ? updatedTransaction
              : transaction,
          ),
      );

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUDGET_TRANSACTIONS, user?.id],
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUDGETS, user?.id],
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ANALYTICS, user?.id],
      });

      // Invalidate accounts if transaction affects account balance
      if (
        updates.account_id !== undefined ||
        updates.to_account_id !== undefined
      ) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.ACCOUNTS, user?.id],
        });
      }

      toast.success("Transaction updated successfully!");
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "update transaction");
    },
  });
};

export const useDeleteTransaction = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      budgetId,
      amount,
    }: {
      id: string;
      budgetId: string | null;
      amount: number;
    }): Promise<void> => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("budget_transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      if (budgetId) {
        const { error: budgetError } = await supabase.rpc(
          "update_budget_spent",
          {
            p_budget_id: budgetId,
            p_amount: -amount,
          },
        );

        if (budgetError) throw budgetError;
      }
    },
    onSuccess: (_, { id, budgetId, amount }) => {
      queryClient.setQueryData(
        [QUERY_KEYS.BUDGET_TRANSACTIONS, user?.id],
        (oldData: BudgetTransaction[] = []) =>
          oldData.filter((transaction) => transaction.id !== id),
      );

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUDGET_TRANSACTIONS, user?.id],
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUDGETS, user?.id],
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ANALYTICS, user?.id],
      });

      // Invalidate accounts if transaction affected account balance
      if (budgetId || amount) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.ACCOUNTS, user?.id],
        });
      }

      toast.success("Transaction deleted successfully!");
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "delete transaction");
    },
  });
};

export const useAnalyticsQuery = (startDate: string, endDate: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEYS.ANALYTICS, user?.id, startDate, endDate],
    queryFn: async (): Promise<AnalyticsSummary> => {
      if (!user) throw new Error("User not authenticated");

      // Fetch transactions
      const { data: transactions, error } = await supabase
        .from("budget_transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("transaction_date", startDate)
        .lte("transaction_date", endDate)
        .order("transaction_date", { ascending: true });

      if (error) throw error;

      const allTransactions = (transactions || []) as BudgetTransaction[];

      // Fetch budgets
      const { data: budgets, error: budgetsError } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id);

      if (budgetsError) throw budgetsError;

      const allBudgets = (budgets || []) as Budget[];

      // Fetch categories for mapping
      const { data: categories, error: categoriesError } = await supabase
        .from("finance_categories")
        .select("*")
        .eq("user_id", user.id);

      if (categoriesError) throw categoriesError;

      const categoriesMap = new Map((categories || []).map((c) => [c.id, c]));

      // Fetch Recurring Transactions
      const { data: recurringData, error: recurringError } = await supabase
        .from("recurring_transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true);

      if (recurringError) throw recurringError;
      const recurringTransactions = (recurringData ||
        []) as unknown as RecurringTransaction[];

      // Fetch Accounts (Assets)
      const { data: accountsData, error: accountsError } = await supabase
        .from("finance_accounts")
        .select("*")
        .eq("user_id", user.id);

      if (accountsError) throw accountsError;
      const accounts = (accountsData || []) as Account[];

      // Fetch Liabilities
      const { data: liabilitiesData, error: liabilitiesError } = await supabase
        .from("liabilities")
        .select("*")
        .eq("user_id", user.id);

      if (liabilitiesError) throw liabilitiesError;
      const liabilities = (liabilitiesData || []) as Liability[];

      // Filter for expenses only for spending analysis
      const expenseTransactions = allTransactions.filter(
        (t) => t.type === "expense",
      );

      const totalSpent = expenseTransactions.reduce(
        (sum, t) => sum + t.amount,
        0,
      );
      const transactionCount = expenseTransactions.length;
      const averageTransaction =
        transactionCount > 0 ? totalSpent / transactionCount : 0;

      // Category Breakdown using category_id
      const categoryStatsMap = new Map<
        string,
        { amount: number; count: number; name: string; color: string }
      >();

      expenseTransactions.forEach((t) => {
        // Use category_id if available, otherwise fallback to category string (legacy)
        const categoryId = t.category_id;
        const categoryData = categoryId ? categoriesMap.get(categoryId) : null;

        // Key for grouping: category ID or name
        const key = categoryId || t.category;
        const name = categoryData?.name || t.category;
        const color = categoryData?.color || "#6B7280"; // Default gray

        const existing = categoryStatsMap.get(key) || {
          amount: 0,
          count: 0,
          name,
          color,
        };
        categoryStatsMap.set(key, {
          amount: existing.amount + t.amount,
          count: existing.count + 1,
          name,
          color,
        });
      });

      const categoryBreakdown: CategorySpending[] = Array.from(
        categoryStatsMap.values(),
      )
        .map((data) => ({
          category: data.name, // Use the resolved name
          amount: data.amount,
          count: data.count,
          percentage: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0,
          color: data.color, // Pass color to frontend
        }))
        .sort((a, b) => b.amount - a.amount);

      // Daily Spending (Expenses only)
      const dailyMap = new Map<string, { amount: number; count: number }>();
      expenseTransactions.forEach((t) => {
        const existing = dailyMap.get(t.transaction_date) || {
          amount: 0,
          count: 0,
        };
        dailyMap.set(t.transaction_date, {
          amount: existing.amount + t.amount,
          count: existing.count + 1,
        });
      });

      const dailySpending: DailySpending[] = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          amount: data.amount,
          count: data.count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const topExpenses = [...expenseTransactions]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

      const totalBudgeted = allBudgets.reduce((sum, b) => sum + b.amount, 0);

      // Budgeted vs Actual (Expenses only)
      const budgetedTransactions = expenseTransactions.filter(
        (t) => t.budget_id !== null,
      );
      const standaloneTransactions = expenseTransactions.filter(
        (t) => t.budget_id === null,
      );

      const budgetedActual = budgetedTransactions.reduce(
        (sum, t) => sum + t.amount,
        0,
      );
      const standaloneActual = standaloneTransactions.reduce(
        (sum, t) => sum + t.amount,
        0,
      );

      // --- New Calculations ---

      // Recurring Expenses
      const recurringExpensesList = recurringTransactions.filter(
        (t) => t.type === "expense",
      );
      const recurringTotal = recurringExpensesList.reduce((sum, t) => {
        // Normalize to monthly amount for consistency
        let monthlyAmount = t.amount;
        if (t.interval === "daily") monthlyAmount = t.amount * 30;
        if (t.interval === "weekly") monthlyAmount = t.amount * 4;
        if (t.interval === "yearly") monthlyAmount = t.amount / 12;
        return sum + monthlyAmount;
      }, 0);

      // Net Worth
      const totalAssets = accounts.reduce((sum, a) => sum + a.balance, 0);
      const totalLiabilities = liabilities.reduce(
        (sum, l) => sum + l.amount,
        0,
      );

      // Spending Distribution (Fixed vs Variable)
      // We consider transactions linked to a recurring rule as "Fixed"
      const fixedSpending = expenseTransactions
        .filter((t) => t.is_recurring || t.recurring_id)
        .reduce((sum, t) => sum + t.amount, 0);
      const variableSpending = totalSpent - fixedSpending;

      // Asset Allocation
      const assetAllocationMap = new Map<string, number>();
      accounts.forEach((account) => {
        const current = assetAllocationMap.get(account.type) || 0;
        assetAllocationMap.set(account.type, current + account.balance);
      });

      const assetAllocation = Array.from(assetAllocationMap.entries())
        .map(([type, amount]) => ({
          type: type.charAt(0).toUpperCase() + type.slice(1).replace("_", " "),
          amount,
          percentage: totalAssets > 0 ? (amount / totalAssets) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      return {
        totalSpent,
        transactionCount,
        averageTransaction,
        categoryBreakdown,
        dailySpending,
        topExpenses,
        budgetedVsActual: {
          budgeted: totalBudgeted,
          actual: budgetedActual,
          standalone: standaloneActual,
        },
        recurringExpenses: {
          total: recurringTotal,
          count: recurringExpensesList.length,
        },
        netWorth: {
          assets: totalAssets,
          liabilities: totalLiabilities,
          total: totalAssets - totalLiabilities,
        },
        spendingDistribution: {
          fixed: fixedSpending,
          variable: variableSpending,
        },
        assetAllocation,
      };
    },
    enabled: !!user?.id && !!startDate && !!endDate,
    staleTime: QUERY_CONFIG.STALE_TIME,
    gcTime: QUERY_CONFIG.GC_TIME,
    placeholderData: (previousData) => previousData,
  });
};

// ============================================
// Account Management Hooks
// ============================================

export const useAccountsQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS, user?.id],
    queryFn: async (): Promise<Account[]> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("finance_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (error) throw error;
      return data as Account[];
    },
    enabled: !!user?.id,
    staleTime: QUERY_CONFIG.STALE_TIME,
    gcTime: QUERY_CONFIG.GC_TIME,
  });
};

export const useCreateAccount = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToGrimoire } = useSpookyAI();

  return useMutation({
    mutationFn: async (
      accountData: Omit<
        Account,
        "id" | "user_id" | "created_at" | "updated_at"
      >,
    ): Promise<Account> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("finance_accounts")
        .insert({
          ...accountData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Account;
    },
    onSuccess: (newAccount) => {
      queryClient.setQueryData(
        [QUERY_KEYS.ACCOUNTS, user?.id],
        (oldData: Account[] = []) => [newAccount, ...oldData],
      );
      toast.success("Account created successfully!");

      // Auto-index for RAG
      addToGrimoire(
        `Account: ${newAccount.name} (${newAccount.type})
Current Balance: ${newAccount.balance} ${newAccount.currency}
Status: Active`,
        {
          type: "account",
          original_id: newAccount.id,
          account_type: newAccount.type,
          balance: newAccount.balance,
          currency: newAccount.currency,
          include_in_total: newAccount.include_in_total,
          created_at: new Date().toISOString(),
        },
      ).catch(console.error);
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "create account");
    },
  });
};

export const useUpdateAccount = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToGrimoire } = useSpookyAI();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Account>;
    }): Promise<Account> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("finance_accounts")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Account;
    },
    onSuccess: (updatedAccount) => {
      queryClient.setQueryData(
        [QUERY_KEYS.ACCOUNTS, user?.id],
        (oldData: Account[] = []) =>
          oldData.map((account) =>
            account.id === updatedAccount.id ? updatedAccount : account,
          ),
      );
      toast.success("Account updated successfully!");

      // Auto-index for RAG
      addToGrimoire(
        `Account: ${updatedAccount.name} (${updatedAccount.type})
Current Balance: ${updatedAccount.balance} ${updatedAccount.currency}
Status: Active`,
        {
          type: "account",
          original_id: updatedAccount.id,
          account_type: updatedAccount.type,
          balance: updatedAccount.balance,
          currency: updatedAccount.currency,
          include_in_total: updatedAccount.include_in_total,
          created_at: new Date().toISOString(),
        },
      ).catch(console.error);
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "update account");
    },
  });
};

export const useDeleteAccount = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("finance_accounts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(
        [QUERY_KEYS.ACCOUNTS, user?.id],
        (oldData: Account[] = []) =>
          oldData.filter((account) => account.id !== deletedId),
      );
      toast.success("Account deleted successfully!");
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "delete account");
    },
  });
};

export const useRecurringTransactionsQuery = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.RECURRING_TRANSACTIONS, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("recurring_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("next_run_date", { ascending: true });

      if (error) throw error;
      if (error) throw error;
      return data as unknown as RecurringTransaction[];
    },
    enabled: !!user,
  });
};

export const useCreateRecurringTransaction = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToGrimoire } = useSpookyAI();

  return useMutation({
    mutationFn: async (
      newTransaction: Omit<
        RecurringTransaction,
        "id" | "user_id" | "created_at" | "updated_at" | "last_run_date"
      >,
    ): Promise<RecurringTransaction> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("recurring_transactions")
        .insert({
          ...newTransaction,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      if (error) throw error;
      return data as unknown as RecurringTransaction;
    },
    onSuccess: async (newTransaction) => {
      queryClient.setQueryData(
        [QUERY_KEYS.RECURRING_TRANSACTIONS, user?.id],
        (oldData: RecurringTransaction[] = []) => [newTransaction, ...oldData],
      );
      toast.success("Recurring transaction created successfully!");

      // Auto-index for RAG
      try {
        const categories = queryClient.getQueryData<Category[]>([
          QUERY_KEYS.CATEGORIES,
          user?.id,
        ]);
        const accounts = queryClient.getQueryData<Account[]>([
          QUERY_KEYS.ACCOUNTS,
          user?.id,
        ]);

        const categoryName =
          categories?.find((c) => c.id === newTransaction.category_id)?.name ||
          "Bills";
        const accountName =
          accounts?.find((a) => a.id === newTransaction.account_id)?.name ||
          "Unknown";

        await addToGrimoire(
          `Recurring Transaction: ${newTransaction.amount} - ${newTransaction.description}
Category: ${categoryName}
Account: ${accountName}
Interval: ${newTransaction.interval}
Next Run: ${newTransaction.next_run_date}
Type: ${newTransaction.type}`,
          {
            type: "recurring_transaction",
            original_id: newTransaction.id,
            amount: newTransaction.amount,
            category: categoryName,
            category_id: newTransaction.category_id,
            account_name: accountName,
            account_id: newTransaction.account_id,
            next_run_date: newTransaction.next_run_date,
            interval: newTransaction.interval,
            active: newTransaction.active,
            created_at: newTransaction.created_at,
          },
        );
      } catch (error) {
        console.error("Failed to index recurring transaction:", error);
      }
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "create recurring transaction");
    },
  });
};

export const useUpdateRecurringTransaction = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToGrimoire } = useSpookyAI();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<RecurringTransaction>;
    }): Promise<RecurringTransaction> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("recurring_transactions")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      if (error) throw error;
      return data as unknown as RecurringTransaction;
    },
    onSuccess: async (updatedTransaction) => {
      queryClient.setQueryData(
        [QUERY_KEYS.RECURRING_TRANSACTIONS, user?.id],
        (oldData: RecurringTransaction[] = []) =>
          oldData.map((t) =>
            t.id === updatedTransaction.id ? updatedTransaction : t,
          ),
      );
      toast.success("Recurring transaction updated successfully!");

      // Auto-index for RAG
      try {
        const categories = queryClient.getQueryData<Category[]>([
          QUERY_KEYS.CATEGORIES,
          user?.id,
        ]);
        const accounts = queryClient.getQueryData<Account[]>([
          QUERY_KEYS.ACCOUNTS,
          user?.id,
        ]);

        const categoryName =
          categories?.find((c) => c.id === updatedTransaction.category_id)
            ?.name || "Bills";
        const accountName =
          accounts?.find((a) => a.id === updatedTransaction.account_id)?.name ||
          "Unknown";

        await addToGrimoire(
          `Recurring Transaction: ${updatedTransaction.amount} - ${updatedTransaction.description}
Category: ${categoryName}
Account: ${accountName}
Interval: ${updatedTransaction.interval}
Next Run: ${updatedTransaction.next_run_date}
Type: ${updatedTransaction.type}
Status: ${updatedTransaction.active ? "Active" : "Inactive"}`,
          {
            type: "recurring_transaction",
            original_id: updatedTransaction.id,
            amount: updatedTransaction.amount,
            category: categoryName,
            category_id: updatedTransaction.category_id,
            account_name: accountName,
            account_id: updatedTransaction.account_id,
            next_run_date: updatedTransaction.next_run_date,
            interval: updatedTransaction.interval,
            active: updatedTransaction.active,
            created_at: updatedTransaction.created_at,
          },
        );
      } catch (error) {
        console.error("Failed to index recurring transaction:", error);
      }
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "update recurring transaction");
    },
  });
};

export const useDeleteRecurringTransaction = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("recurring_transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(
        [QUERY_KEYS.RECURRING_TRANSACTIONS, user?.id],
        (oldData: RecurringTransaction[] = []) =>
          oldData.filter((t) => t.id !== deletedId),
      );
      toast.success("Recurring transaction deleted successfully!");
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "delete recurring transaction");
    },
  });
};

export const useProcessRecurringTransactions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const createTransactionMutation = useCreateTransaction();
  const updateRecurringMutation = useUpdateRecurringTransaction();
  const { addToGrimoire } = useSpookyAI();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: accounts = [] } = useAccountsQuery();

  const processDueTransactions = async () => {
    if (!user) return;

    const { data: dueTransactions, error } = await supabase
      .from("recurring_transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .lte("next_run_date", new Date().toISOString().split("T")[0]);

    if (error) {
      console.error("Error fetching due recurring transactions:", error);
      return;
    }

    if (!dueTransactions || dueTransactions.length === 0) return;

    let processedCount = 0;

    for (const recurring of dueTransactions) {
      try {
        // Create the actual transaction
        const newTransaction = await createTransactionMutation.mutateAsync({
          amount: recurring.amount,
          description: recurring.description,
          category: "bills", // Default or fetch category name if needed
          category_id: recurring.category_id,
          transaction_date: recurring.next_run_date,
          type: recurring.type as "expense" | "income" | "transfer",
          account_id: recurring.account_id,
          to_account_id: recurring.to_account_id,
          is_recurring: true,
          recurring_id: recurring.id,
          budget_id: null, // Optional: could link to a budget if we had that info
        });

        // Auto-index for RAG
        try {
          const categoryName =
            categories.find((c) => c.id === recurring.category_id)?.name ||
            "Bills";
          const accountName =
            accounts.find((a) => a.id === recurring.account_id)?.name ||
            "Unknown Account";

          const content = `Transaction: $${recurring.amount} - ${recurring.description} (Recurring)
Category: ${categoryName}
Account: ${accountName}
Date: ${recurring.next_run_date}
Type: ${recurring.type || "expense"}`;

          await addToGrimoire(content, {
            type: "transaction",
            original_id: newTransaction.id,
            amount: recurring.amount,
            category: categoryName,
            category_id: recurring.category_id,
            account_name: accountName,
            account_id: recurring.account_id,
            transaction_date: recurring.next_run_date,
            transaction_type: recurring.type || "expense",
            is_recurring: true,
            recurring_id: recurring.id,
            created_at: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Failed to index recurring transaction:", error);
        }

        // Calculate next run date
        const nextDate = new Date(recurring.next_run_date);
        switch (recurring.interval) {
          case "daily":
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case "weekly":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case "monthly":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case "yearly":
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        }

        // Update the recurring rule
        await updateRecurringMutation.mutateAsync({
          id: recurring.id,
          updates: {
            last_run_date: recurring.next_run_date,
            next_run_date: nextDate.toISOString().split("T")[0],
          },
        });

        processedCount++;
      } catch (err) {
        console.error(
          `Failed to process recurring transaction ${recurring.id}:`,
          err,
        );
      }
    }

    if (processedCount > 0) {
      toast.success(`Processed ${processedCount} recurring transactions.`);
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.RECURRING_TRANSACTIONS, user.id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUDGET_TRANSACTIONS, user.id],
      });
    }
  };

  return { processDueTransactions };
};

export const useCategoriesQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, user?.id],
    queryFn: async (): Promise<Category[]> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("finance_categories")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      if (error) throw error;
      return data as unknown as Category[];
    },
    enabled: !!user?.id,
    staleTime: QUERY_CONFIG.STALE_TIME,
    gcTime: QUERY_CONFIG.GC_TIME,
  });
};
