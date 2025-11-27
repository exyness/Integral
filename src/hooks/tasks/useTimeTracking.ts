import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { TimeEntry } from "@/types/task";

const TIME_ENTRIES_QUERY_KEY = "timeEntries";
const INITIAL_LOAD_LIMIT = 50;

export const useTimeTracking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [limit, setLimit] = useState(INITIAL_LOAD_LIMIT);

  const { data: totalCount = 0 } = useQuery({
    queryKey: [TIME_ENTRIES_QUERY_KEY, "count", user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from("time_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching count:", error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const {
    data: timeEntries = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: [TIME_ENTRIES_QUERY_KEY, user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching time entries:", error);
        toast.error("Failed to load time entries");
        throw error;
      }

      return (data || []) as TimeEntry[];
    },
    enabled: !!user,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const loadMore = useCallback(() => {
    setLimit((prev) => prev + 50);
  }, []);

  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }, []);

  const stopTimerMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const endTime = new Date().toISOString();

      const { data: entry, error: fetchError } = await supabase
        .from("time_entries")
        .select("start_time, is_paused, paused_at, total_paused_seconds")
        .eq("id", entryId)
        .single();

      if (fetchError || !entry) {
        console.error("Entry not found:", fetchError);
        throw new Error("Entry not found");
      }

      const totalElapsed = Math.floor(
        (new Date(endTime).getTime() - new Date(entry.start_time).getTime()) /
          1000,
      );

      let totalPausedSeconds = entry.total_paused_seconds || 0;

      if (entry.is_paused && entry.paused_at) {
        const currentPauseDuration = Math.floor(
          (new Date(endTime).getTime() - new Date(entry.paused_at).getTime()) /
            1000,
        );
        totalPausedSeconds += currentPauseDuration;
      }

      const duration = Math.max(0, totalElapsed - totalPausedSeconds);

      const { data, error } = await supabase
        .from("time_entries")
        .update({
          end_time: endTime,
          duration_seconds: duration,
          is_running: false,
          is_paused: false,
          paused_at: null,
          total_paused_seconds: totalPausedSeconds,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entryId)
        .select()
        .single();

      if (error) throw error;
      return { data, duration };
    },
    onSuccess: ({ data, duration }) => {
      queryClient.setQueryData(
        [TIME_ENTRIES_QUERY_KEY, user?.id, limit],
        (oldEntries: TimeEntry[] = []) =>
          oldEntries.map((e) => (e.id === data.id ? data : e)),
      );
      // Real-time subscription will handle syncing
      toast.success(`Timer stopped! Duration: ${formatDuration(duration)}`);
    },
    onError: (error) => {
      console.error("Error stopping timer:", error);
      toast.error("Failed to stop timer");
    },
  });

  const startTimerMutation = useMutation({
    mutationFn: async ({
      taskId,
      description,
    }: {
      taskId: string;
      description?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const newEntry = {
        task_id: taskId,
        user_id: user.id,
        start_time: new Date().toISOString(),
        description: description || null,
        is_running: true,
      };

      const { data, error } = await supabase
        .from("time_entries")
        .insert(newEntry)
        .select()
        .single();

      if (error) throw error;
      return data as TimeEntry;
    },
    onSuccess: (newEntry) => {
      queryClient.setQueryData(
        [TIME_ENTRIES_QUERY_KEY, user?.id, limit],
        (oldEntries: TimeEntry[] = []) => [newEntry, ...oldEntries],
      );
      // Real-time subscription will handle syncing
      toast.success("Timer started!");
    },
    onError: (error) => {
      console.error("Error starting timer:", error);
      toast.error("Failed to start timer");
    },
  });

  const updateTimeEntryMutation = useMutation({
    mutationFn: async ({
      entryId,
      updates,
    }: {
      entryId: string;
      updates: Partial<TimeEntry>;
    }) => {
      const { data, error } = await supabase
        .from("time_entries")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedEntry) => {
      queryClient.setQueryData(
        [TIME_ENTRIES_QUERY_KEY, user?.id, limit],
        (oldEntries: TimeEntry[] = []) =>
          oldEntries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)),
      );
      // Real-time subscription will handle syncing
      toast.success("Time entry updated");
    },
    onError: (error) => {
      console.error("Error updating time entry:", error);
      toast.error("Failed to update time entry");
    },
  });

  const pauseTimerMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const entry = timeEntries.find((e) => e.id === entryId);
      if (!entry || !entry.is_running || entry.is_paused) {
        throw new Error("Timer is not running or already paused");
      }

      const pausedAt = new Date().toISOString();

      const { data, error } = await supabase
        .from("time_entries")
        .update({
          is_paused: true,
          paused_at: pausedAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entryId)
        .eq("is_running", true)
        .eq("is_paused", false)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedEntry) => {
      queryClient.setQueryData(
        [TIME_ENTRIES_QUERY_KEY, user?.id, limit],
        (oldEntries: TimeEntry[] = []) =>
          oldEntries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)),
      );
      // Real-time subscription will handle syncing
      toast.success("Timer paused");
    },
    onError: (error) => {
      console.error("Error pausing timer:", error);
      toast.error("Failed to pause timer");
    },
  });

  const resumeTimerMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const entry = timeEntries.find((e) => e.id === entryId);
      if (!entry || !entry.is_running || !entry.is_paused || !entry.paused_at) {
        throw new Error("Timer is not paused");
      }

      const pausedDuration = Math.floor(
        (new Date().getTime() - new Date(entry.paused_at).getTime()) / 1000,
      );

      const totalPausedSeconds =
        (entry.total_paused_seconds || 0) + pausedDuration;

      const { data, error } = await supabase
        .from("time_entries")
        .update({
          is_paused: false,
          paused_at: null,
          total_paused_seconds: totalPausedSeconds,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entryId)
        .eq("is_running", true)
        .eq("is_paused", true)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedEntry) => {
      queryClient.setQueryData(
        [TIME_ENTRIES_QUERY_KEY, user?.id, limit],
        (oldEntries: TimeEntry[] = []) =>
          oldEntries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)),
      );
      // Real-time subscription will handle syncing
      toast.success("Timer resumed");
    },
    onError: (error) => {
      console.error("Error resuming timer:", error);
      toast.error("Failed to resume timer");
    },
  });

  const deleteTimeEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const entry = timeEntries.find((e) => e.id === entryId);
      if (entry?.is_running) {
        await stopTimerMutation.mutateAsync(entryId);
        return entryId;
      }

      const { error } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", entryId);

      if (error) throw error;
      return entryId;
    },
    onSuccess: (deletedEntryId) => {
      queryClient.setQueryData(
        [TIME_ENTRIES_QUERY_KEY, user?.id, limit],
        (oldEntries: TimeEntry[] = []) =>
          oldEntries.filter((e) => e.id !== deletedEntryId),
      );
      // Real-time subscription will handle syncing
      toast.success("Time entry deleted");
    },
    onError: (error) => {
      console.error("Error deleting time entry:", error);
      toast.error("Failed to delete time entry");
    },
  });

  const startTimer = useCallback(
    async (taskId: string, description?: string) => {
      return startTimerMutation.mutateAsync({ taskId, description });
    },
    [startTimerMutation],
  );

  const stopTimer = useCallback(
    async (entryId: string) => {
      return stopTimerMutation.mutateAsync(entryId);
    },
    [stopTimerMutation],
  );

  const updateTimeEntry = useCallback(
    async (entryId: string, updates: Partial<TimeEntry>) => {
      return updateTimeEntryMutation.mutateAsync({ entryId, updates });
    },
    [updateTimeEntryMutation],
  );

  const deleteTimeEntry = useCallback(
    async (entryId: string) => {
      return deleteTimeEntryMutation.mutateAsync(entryId);
    },
    [deleteTimeEntryMutation],
  );

  const pauseTimer = useCallback(
    async (entryId: string) => {
      return pauseTimerMutation.mutateAsync(entryId);
    },
    [pauseTimerMutation],
  );

  const resumeTimer = useCallback(
    async (entryId: string) => {
      return resumeTimerMutation.mutateAsync(entryId);
    },
    [resumeTimerMutation],
  );

  const runningEntry = useMemo(
    () => timeEntries.find((entry) => entry.is_running),
    [timeEntries],
  );

  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel("time_entries_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "time_entries",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const isSignificantChange =
            payload.eventType === "INSERT" ||
            payload.eventType === "DELETE" ||
            (payload.eventType === "UPDATE" &&
              (payload.new.is_running !== payload.old?.is_running ||
                payload.new.is_paused !== payload.old?.is_paused ||
                payload.new.description !== payload.old?.description ||
                payload.new.end_time !== payload.old?.end_time ||
                payload.new.duration_seconds !==
                  payload.old?.duration_seconds));

          if (isSignificantChange) {
            // Use refetch instead of invalidate to prevent clearing optimistic updates
            refetch();
          }
        },
      )
      .subscribe();

    return () => {
      void subscription.unsubscribe();
    };
  }, [user, refetch]);

  return {
    timeEntries,
    loading,
    runningEntry,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    updateTimeEntry,
    deleteTimeEntry,
    refetch,
    loadMore,
    hasMore: timeEntries.length === limit,
    totalCount,
  };
};
