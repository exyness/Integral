import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialGoals"] });
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialGoals"] });
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
