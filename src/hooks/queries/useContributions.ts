import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { GoalContribution } from "@/types/budget";

export const CONTRIBUTION_KEYS = {
  ALL: "contributions",
  GOAL: (goalId: string) => ["contributions", goalId] as const,
} as const;

export const useContributionsQuery = (goalId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [CONTRIBUTION_KEYS.ALL, goalId, user?.id],
    queryFn: async (): Promise<GoalContribution[]> => {
      if (!user) throw new Error("User not authenticated");

      let query = supabase
        .from("goal_contributions")
        .select("*")
        .eq("user_id", user.id)
        .order("contributed_at", { ascending: false });

      if (goalId) {
        query = query.eq("goal_id", goalId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as GoalContribution[];
    },
    enabled: !!user?.id,
  });
};

export const useCreateContribution = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      contribution: Omit<
        GoalContribution,
        "id" | "user_id" | "created_at" | "updated_at"
      >,
    ) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("goal_contributions")
        .insert({
          ...contribution,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as GoalContribution;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CONTRIBUTION_KEYS.ALL] });
      // Invalidate specific goal contributions
      queryClient.invalidateQueries({
        queryKey: CONTRIBUTION_KEYS.GOAL(variables.goal_id),
      });
      // Also invalidate goals because the amount changed
      queryClient.invalidateQueries({ queryKey: ["financialGoals"] });

      toast.success("Contribution added successfully");
    },
    onError: (error) => {
      console.error("Error adding contribution:", error);
      toast.error("Failed to add contribution");
    },
  });
};

export const useDeleteContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("goal_contributions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRIBUTION_KEYS.ALL] });
      queryClient.invalidateQueries({ queryKey: ["financialGoals"] });
      toast.success("Contribution deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting contribution:", error);
      toast.error("Failed to delete contribution");
    },
  });
};
