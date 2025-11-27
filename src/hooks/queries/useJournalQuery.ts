import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Journal, JournalFormData } from "@/types/journal.ts";

const validateEntryData = (data: JournalFormData): void => {
  if (!data.title?.trim()) {
    throw new Error("Title is required");
  }
  if (!data.entry_date) {
    throw new Error("Entry date is required");
  }
  if (data.mood && (data.mood < 1 || data.mood > 5)) {
    throw new Error("Mood must be between 1 and 5");
  }
  if (data.energy_level && (data.energy_level < 1 || data.energy_level > 5)) {
    throw new Error("Energy level must be between 1 and 5");
  }
};

export const QUERY_KEYS = {
  JOURNAL_ENTRIES: "journal-entries",
  PROJECTS: "projects",
} as const;

const DAILY_ENTRY_SELECT = `
  *,
  project:projects(*)
` as const;

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

export const useJournalQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEYS.JOURNAL_ENTRIES, user?.id],
    queryFn: async (): Promise<Journal[]> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("daily_entries")
        .select(DAILY_ENTRY_SELECT)
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: QUERY_CONFIG.STALE_TIME,
    gcTime: QUERY_CONFIG.GC_TIME,
  });
};

export const useCreateJournal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryData: JournalFormData): Promise<Journal> => {
      if (!user) throw new Error("User not authenticated");

      validateEntryData(entryData);

      const { data, error } = await supabase
        .from("daily_entries")
        .insert({
          ...entryData,
          user_id: user.id,
          project_id: entryData.project_id || null,
        })
        .select(DAILY_ENTRY_SELECT)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newEntry) => {
      queryClient.setQueryData(
        [QUERY_KEYS.JOURNAL_ENTRIES, user?.id],
        (oldData: Journal[] = []) => {
          const newData = [...oldData];
          const insertIndex = newData.findIndex(
            (entry) =>
              entry.entry_date < newEntry.entry_date ||
              (entry.entry_date === newEntry.entry_date &&
                entry.created_at < newEntry.created_at),
          );

          if (insertIndex === -1) {
            newData.push(newEntry);
          } else {
            newData.splice(insertIndex, 0, newEntry);
          }

          return newData;
        },
      );
      toast.success("Daily entry created successfully!");
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "create daily entry");
    },
  });
};

export const useUpdateJournal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<JournalFormData>;
    }): Promise<Journal> => {
      if (!user) throw new Error("User not authenticated");

      if (updates.title !== undefined || updates.entry_date !== undefined) {
        validateEntryData({ ...updates } as JournalFormData);
      }

      const cleanUpdates = {
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.content !== undefined && { content: updates.content }),
        ...(updates.entry_date !== undefined && {
          entry_date: updates.entry_date,
        }),
        ...(updates.project_id !== undefined && {
          project_id: updates.project_id || null,
        }),
        ...(updates.mood !== undefined && { mood: updates.mood }),
        ...(updates.energy_level !== undefined && {
          energy_level: updates.energy_level,
        }),
        ...(updates.tags !== undefined && { tags: updates.tags }),
        updated_at: new Date().toISOString(),
      };

      console.log("Sending update to Supabase:", {
        id,
        updates: cleanUpdates,
        user_id: user.id,
      });

      const { data, error } = await supabase
        .from("daily_entries")
        .update(cleanUpdates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select(DAILY_ENTRY_SELECT);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("No entry found to update or access denied");
      }

      return data[0];
    },
    onSuccess: (updatedEntry) => {
      queryClient.setQueryData(
        [QUERY_KEYS.JOURNAL_ENTRIES, user?.id],
        (oldData: Journal[] = []) =>
          oldData.map((entry) =>
            entry.id === updatedEntry.id ? updatedEntry : entry,
          ),
      );
      toast.success("Daily entry updated successfully!");
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "update daily entry");
    },
  });
};

export const useDeleteJournal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!user) throw new Error("User not authenticated");
      if (!id?.trim()) throw new Error("Entry ID is required");

      const { error } = await supabase
        .from("daily_entries")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(
        [QUERY_KEYS.JOURNAL_ENTRIES, user?.id],
        (oldData: Journal[] = []) =>
          oldData.filter((entry) => entry.id !== deletedId),
      );
      toast.success("Daily entry deleted successfully!");
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "delete daily entry");
    },
  });
};
