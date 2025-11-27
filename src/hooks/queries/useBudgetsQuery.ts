import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  AnalyticsSummary,
  Budget,
  BudgetTransaction,
  CategorySpending,
  DailySpending,
} from "@/types/budget";

export const QUERY_KEYS = {
  BUDGETS: "budgets",
  BUDGET_TRANSACTIONS: "budget-transactions",
  ANALYTICS: "analytics",
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
      return (data || []) as Budget[];
    },
    enabled: !!user?.id,
    staleTime: QUERY_CONFIG.STALE_TIME,
    gcTime: QUERY_CONFIG.GC_TIME,
  });
};

export const useCreateBudget = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
    onSuccess: (newBudget) => {
      queryClient.setQueryData(
        [QUERY_KEYS.BUDGETS, user?.id],
        (oldData: Budget[] = []) => [newBudget, ...oldData],
      );
      toast.success("Budget created successfully!");
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "create budget");
    },
  });
};

export const useUpdateBudget = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
    onSuccess: (updatedBudget) => {
      queryClient.setQueryData(
        [QUERY_KEYS.BUDGETS, user?.id],
        (oldData: Budget[] = []) =>
          oldData.map((budget) =>
            budget.id === updatedBudget.id ? updatedBudget : budget,
          ),
      );
      toast.success("Budget updated successfully!");
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
      return (data || []) as BudgetTransaction[];
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

      const { data, error } = await supabase
        .from("budget_transactions")
        .insert({
          ...transaction,
          user_id: user.id,
        })
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

      const { data, error } = await supabase
        .from("budget_transactions")
        .update(updates)
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
    onSuccess: (updatedTransaction) => {
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
    onSuccess: (_, { id }) => {
      queryClient.setQueryData(
        [QUERY_KEYS.BUDGET_TRANSACTIONS, user?.id],
        (oldData: BudgetTransaction[] = []) =>
          oldData.filter((transaction) => transaction.id !== id),
      );

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUDGETS, user?.id],
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ANALYTICS, user?.id],
      });

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

      const { data: transactions, error } = await supabase
        .from("budget_transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("transaction_date", startDate)
        .lte("transaction_date", endDate)
        .order("transaction_date", { ascending: true });

      if (error) throw error;

      const allTransactions = (transactions || []) as BudgetTransaction[];

      const { data: budgets, error: budgetsError } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id);

      if (budgetsError) throw budgetsError;

      const allBudgets = (budgets || []) as Budget[];

      const totalSpent = allTransactions.reduce((sum, t) => sum + t.amount, 0);
      const transactionCount = allTransactions.length;
      const averageTransaction =
        transactionCount > 0 ? totalSpent / transactionCount : 0;

      const categoryMap = new Map<string, { amount: number; count: number }>();
      allTransactions.forEach((t) => {
        const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
        categoryMap.set(t.category, {
          amount: existing.amount + t.amount,
          count: existing.count + 1,
        });
      });

      const categoryBreakdown: CategorySpending[] = Array.from(
        categoryMap.entries(),
      )
        .map(([category, data]) => ({
          category,
          amount: data.amount,
          count: data.count,
          percentage: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      const dailyMap = new Map<string, { amount: number; count: number }>();
      allTransactions.forEach((t) => {
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

      const topExpenses = [...allTransactions]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

      const totalBudgeted = allBudgets.reduce((sum, b) => sum + b.amount, 0);
      const budgetedTransactions = allTransactions.filter(
        (t) => t.budget_id !== null,
      );
      const standaloneTransactions = allTransactions.filter(
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
      };
    },
    enabled: !!user?.id && !!startDate && !!endDate,
    staleTime: QUERY_CONFIG.STALE_TIME,
    gcTime: QUERY_CONFIG.GC_TIME,
    placeholderData: (previousData) => previousData,
  });
};
