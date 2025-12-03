import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useSpookyAI } from "@/hooks/useSpookyAI";
import { supabase } from "@/integrations/supabase/client";
import { FinancialGoal } from "@/types/budget";

export const useGoalsQuery = () => {
  return useQuery({
    queryKey: ["financialGoals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_goals")
        .select("*")
        .eq("is_active", true)
        .order("target_date", { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data as FinancialGoal[];
    },
  });
};

export const useCreateGoal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToGrimoire } = useSpookyAI();

  return useMutation({
    mutationFn: async (
      goal: Omit<FinancialGoal, "id" | "created_at" | "updated_at" | "user_id">,
    ) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("financial_goals")
        .insert({
          ...goal,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["financialGoals"] });

      // Auto-index for RAG
      const newGoal = data as FinancialGoal;
      addToGrimoire(
        `Financial Goal: ${newGoal.name}
Target: ${newGoal.target_amount}
Current: ${newGoal.current_amount}
Target Date: ${newGoal.target_date}
Status: ${newGoal.is_active ? "Active" : "Inactive"}`,
        {
          type: "financial_goal",
          original_id: newGoal.id,
          target_amount: newGoal.target_amount,
          current_amount: newGoal.current_amount,
          target_date: newGoal.target_date,
          is_active: newGoal.is_active,
          created_at: new Date().toISOString(),
        },
      ).catch(console.error);
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  const { addToGrimoire } = useSpookyAI();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<FinancialGoal>;
    }) => {
      const { data, error } = await supabase
        .from("financial_goals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["financialGoals"] });

      // Auto-index for RAG
      const updatedGoal = data as FinancialGoal;
      addToGrimoire(
        `Financial Goal: ${updatedGoal.name}
Target: ${updatedGoal.target_amount}
Current: ${updatedGoal.current_amount}
Target Date: ${updatedGoal.target_date}
Status: ${updatedGoal.is_active ? "Active" : "Inactive"}`,
        {
          type: "financial_goal",
          original_id: updatedGoal.id,
          target_amount: updatedGoal.target_amount,
          current_amount: updatedGoal.current_amount,
          target_date: updatedGoal.target_date,
          is_active: updatedGoal.is_active,
          created_at: new Date().toISOString(),
        },
      ).catch(console.error);
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("financial_goals")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialGoals"] });
    },
  });
};
