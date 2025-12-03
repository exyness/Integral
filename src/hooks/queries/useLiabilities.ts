import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSpookyAI } from "@/hooks/useSpookyAI";
import { supabase } from "@/integrations/supabase/client";
import { Liability } from "@/types/budget";

const QUERY_KEYS = {
  LIABILITIES: "liabilities",
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

export const useLiabilitiesQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEYS.LIABILITIES, user?.id],
    queryFn: async (): Promise<Liability[]> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("liabilities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Liability[];
    },
    enabled: !!user?.id,
    staleTime: QUERY_CONFIG.STALE_TIME,
    gcTime: QUERY_CONFIG.GC_TIME,
  });
};

export const useCreateLiability = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToGrimoire } = useSpookyAI();

  return useMutation({
    mutationFn: async (
      liabilityData: Omit<
        Liability,
        "id" | "user_id" | "created_at" | "updated_at"
      >,
    ): Promise<Liability> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("liabilities")
        .insert({
          ...liabilityData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Liability;
    },
    onSuccess: (newLiability) => {
      queryClient.setQueryData(
        [QUERY_KEYS.LIABILITIES, user?.id],
        (oldData: Liability[] = []) => [newLiability, ...oldData],
      );
      toast.success("Liability created successfully!");

      // Auto-index for RAG
      addToGrimoire(
        `Liability: ${newLiability.name} (${newLiability.type})
Amount Owed: ${newLiability.amount}
Interest Rate: ${newLiability.interest_rate}%
Minimum Payment: ${newLiability.minimum_payment}
Due Date: ${newLiability.due_date}
Status: ${newLiability.is_active ? "Active" : "Paid Off"}`,
        {
          type: "liability",
          original_id: newLiability.id,
          liability_type: newLiability.type,
          amount: newLiability.amount,
          interest_rate: newLiability.interest_rate,
          minimum_payment: newLiability.minimum_payment,
          due_date: newLiability.due_date,
          is_active: newLiability.is_active,
          created_at: new Date().toISOString(),
        },
      ).catch(console.error);
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "create liability");
    },
  });
};

export const useUpdateLiability = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToGrimoire } = useSpookyAI();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Liability>;
    }): Promise<Liability> => {
      const { data, error } = await supabase
        .from("liabilities")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Liability;
    },
    onSuccess: (updatedLiability) => {
      queryClient.setQueryData(
        [QUERY_KEYS.LIABILITIES, user?.id],
        (oldData: Liability[] = []) =>
          oldData.map((liability) =>
            liability.id === updatedLiability.id ? updatedLiability : liability,
          ),
      );
      toast.success("Liability updated successfully!");

      // Auto-index for RAG
      addToGrimoire(
        `Liability: ${updatedLiability.name} (${updatedLiability.type})
Amount Owed: ${updatedLiability.amount}
Interest Rate: ${updatedLiability.interest_rate}%
Minimum Payment: ${updatedLiability.minimum_payment}
Due Date: ${updatedLiability.due_date}
Status: ${updatedLiability.is_active ? "Active" : "Paid Off"}`,
        {
          type: "liability",
          original_id: updatedLiability.id,
          liability_type: updatedLiability.type,
          amount: updatedLiability.amount,
          interest_rate: updatedLiability.interest_rate,
          minimum_payment: updatedLiability.minimum_payment,
          due_date: updatedLiability.due_date,
          is_active: updatedLiability.is_active,
          created_at: new Date().toISOString(),
        },
      ).catch(console.error);
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "update liability");
    },
  });
};

export const useDeleteLiability = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from("liabilities")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(
        [QUERY_KEYS.LIABILITIES, user?.id],
        (oldData: Liability[] = []) =>
          oldData.filter((liability) => liability.id !== deletedId),
      );
      toast.success("Liability deleted successfully!");
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "delete liability");
    },
  });
};
