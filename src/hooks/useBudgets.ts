import { error } from "console";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Budget, BudgetTransaction } from "@/types/budget";

export const useBudgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBudgets((data || []) as Budget[]);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      toast.error("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user, fetchBudgets]);

  const createBudget = async (
    budget: Omit<
      Budget,
      "id" | "user_id" | "created_at" | "updated_at" | "spent"
    >,
  ) => {
    try {
      const { data, error } = await supabase
        .from("budgets")
        .insert([{ ...budget, user_id: user?.id, spent: 0 }])
        .select()
        .single();

      if (error) throw error;
      setBudgets([data as Budget, ...budgets]);
      toast.success("Budget created successfully");
      return data as Budget;
    } catch (error) {
      console.error("Error creating budget:", error);
      toast.error("Failed to create budget");
      throw error;
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      const { data, error } = await supabase
        .from("budgets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setBudgets(budgets.map((b) => (b.id === id ? (data as Budget) : b)));
      toast.success("Budget updated successfully");
      return data as Budget;
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error("Failed to update budget");
      throw error;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase.from("budgets").delete().eq("id", id);

      if (error) throw error;
      setBudgets(budgets.filter((b) => b.id !== id));
      toast.success("Budget deleted successfully");
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error("Failed to delete budget");
      throw error;
    }
  };

  return {
    budgets,
    loading,
    createBudget,
    updateBudget,
    deleteBudget,
    refetch: fetchBudgets,
  };
};

export const useBudgetTransactions = (budgetId?: string) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      let query = supabase
        .from("budget_transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("transaction_date", { ascending: false });

      if (budgetId) {
        query = query.eq("budget_id", budgetId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions((data || []) as BudgetTransaction[]);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [user, budgetId]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, fetchTransactions]);

  const addTransaction = async (
    transaction: Omit<BudgetTransaction, "id" | "user_id" | "created_at">,
  ) => {
    try {
      const { data, error } = await supabase
        .from("budget_transactions")
        .insert([{ ...transaction, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;

      const { error: budgetError } = await supabase.rpc("update_budget_spent", {
        p_budget_id: transaction.budget_id,
        p_amount: transaction.amount,
      });

      if (budgetError) throw budgetError;

      setTransactions([data as BudgetTransaction, ...transactions]);
      toast.success("Transaction added successfully");
      return data as BudgetTransaction;
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
      throw error;
    }
  };

  const deleteTransaction = async (
    id: string,
    budgetId: string,
    amount: number,
  ) => {
    try {
      const { error } = await supabase
        .from("budget_transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      const { error: budgetError } = await supabase.rpc("update_budget_spent", {
        p_budget_id: budgetId,
        p_amount: -amount,
      });

      if (budgetError) throw budgetError;

      setTransactions(transactions.filter((t) => t.id !== id));
      toast.success("Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
      throw error;
    }
  };

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
};
