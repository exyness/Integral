import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NetWorthSnapshot } from "@/types/budget";

export const useNetWorthHistory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["netWorthHistory", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("net_worth_snapshots")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (error) throw error;
      return data as NetWorthSnapshot[];
    },
    enabled: !!user?.id,
  });

  const createSnapshot = useMutation({
    mutationFn: async (
      snapshot: Omit<NetWorthSnapshot, "id" | "created_at">,
    ) => {
      const { data, error } = await supabase
        .from("net_worth_snapshots")
        .insert(snapshot)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["netWorthHistory"] });
    },
  });

  return {
    history,
    isLoading,
    createSnapshot,
  };
};
