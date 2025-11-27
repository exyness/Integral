import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type PomodoroMode = "work" | "short_break" | "long_break";

export interface PomodoroSettings {
  work_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  sessions_until_long_break: number;
  auto_start_breaks: boolean;
  auto_start_work: boolean;
  sound_enabled: boolean;
}

export interface PomodoroSession {
  id: string;
  user_id: string;
  session_type: PomodoroMode;
  duration_minutes: number;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
  task_id: string | null;
  notes: string | null;
  is_paused?: boolean;
  paused_at?: string | null;
  total_paused_seconds?: number;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  work_duration: 25,
  short_break_duration: 5,
  long_break_duration: 15,
  sessions_until_long_break: 4,
  auto_start_breaks: false,
  auto_start_work: false,
  sound_enabled: true,
};

export const usePomodoro = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings = DEFAULT_SETTINGS, isLoading: settingsLoading } =
    useQuery({
      queryKey: ["pomodoro-settings", user?.id],
      queryFn: async () => {
        if (!user) return DEFAULT_SETTINGS;

        const { data, error } = await supabase
          .from("pomodoro_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data) {
          return {
            work_duration: data.work_duration,
            short_break_duration: data.short_break_duration,
            long_break_duration: data.long_break_duration,
            sessions_until_long_break: data.sessions_until_long_break,
            auto_start_breaks: data.auto_start_breaks,
            auto_start_work: data.auto_start_work,
            sound_enabled: data.sound_enabled,
          };
        }

        return DEFAULT_SETTINGS;
      },
      enabled: !!user,
      staleTime: 1000 * 60 * 10,
      gcTime: 1000 * 60 * 30,
    });

  const [limit, setLimit] = useState(50);

  const {
    data: statsData = {
      total: 0,
      completed: 0,
      workSessions: 0,
      totalMinutes: 0,
    },
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ["pomodoro-stats", user?.id],
    queryFn: async () => {
      if (!user)
        return { total: 0, completed: 0, workSessions: 0, totalMinutes: 0 };

      const { data, error } = await supabase
        .from("pomodoro_sessions")
        .select("duration_minutes, completed, session_type")
        .eq("user_id", user.id);

      if (error) throw error;

      const sessions = data || [];
      return {
        total: sessions.length,
        completed: sessions.filter((s) => s.completed).length,
        workSessions: sessions.filter((s) => s.session_type === "work").length,
        totalMinutes: sessions
          .filter((s) => s.completed)
          .reduce((sum, s) => sum + s.duration_minutes, 0),
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["pomodoro-sessions", user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("pomodoro_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []) as PomodoroSession[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const loadMore = useCallback(() => {
    setLimit((prev) => prev + 50);
  }, []);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<PomodoroSettings>) => {
      if (!user) throw new Error("User not authenticated");

      const { data: existing } = await supabase
        .from("pomodoro_settings")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("pomodoro_settings")
          .update(newSettings)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("pomodoro_settings").insert({
          user_id: user.id,
          ...newSettings,
        });

        if (error) throw error;
      }

      return newSettings;
    },
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({
        queryKey: ["pomodoro-settings", user?.id],
      });

      const previousSettings = queryClient.getQueryData<PomodoroSettings>([
        "pomodoro-settings",
        user?.id,
      ]);

      queryClient.setQueryData<PomodoroSettings>(
        ["pomodoro-settings", user?.id],
        (old) => ({ ...DEFAULT_SETTINGS, ...old, ...newSettings }),
      );

      return { previousSettings };
    },
    onError: (err, variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(
          ["pomodoro-settings", user?.id],
          context.previousSettings,
        );
      }
      console.error("Error updating pomodoro settings:", err);
      toast.error("Failed to update settings");
    },
    onSuccess: () => {
      toast.success("Settings updated successfully");
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async ({
      sessionType,
      durationMinutes,
      taskId,
      notes,
    }: {
      sessionType: PomodoroMode;
      durationMinutes: number;
      taskId?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("pomodoro_sessions")
        .insert({
          user_id: user.id,
          session_type: sessionType,
          duration_minutes: durationMinutes,
          task_id: taskId || null,
          notes: notes || null,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return data as PomodoroSession;
    },
    onMutate: async (newSession) => {
      await queryClient.cancelQueries({
        queryKey: ["pomodoro-sessions", user?.id],
      });

      const previousSessions = queryClient.getQueryData<PomodoroSession[]>([
        "pomodoro-sessions",
        user?.id,
      ]);

      return { previousSessions };
    },
    onSuccess: (data) => {
      queryClient.setQueryData<PomodoroSession[]>(
        ["pomodoro-sessions", user?.id],
        (old) => [data, ...(old || [])],
      );
    },
    onError: (err, variables, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(
          ["pomodoro-sessions", user?.id],
          context.previousSessions,
        );
      }
      console.error("Error creating pomodoro session:", err);
      toast.error("Failed to create session");
    },
  });

  const pauseSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const pausedAt = new Date().toISOString();
      const { error } = await supabase
        .from("pomodoro_sessions")
        .update({
          is_paused: true,
          paused_at: pausedAt,
        })
        .eq("id", sessionId);

      if (error) throw error;

      return { sessionId, pausedAt };
    },
    onMutate: async (sessionId) => {
      const pausedAt = new Date().toISOString();
      await queryClient.cancelQueries({
        queryKey: ["pomodoro-sessions", user?.id],
      });

      const previousSessions = queryClient.getQueryData<PomodoroSession[]>([
        "pomodoro-sessions",
        user?.id,
      ]);

      queryClient.setQueryData<PomodoroSession[]>(
        ["pomodoro-sessions", user?.id],
        (old) =>
          old?.map((session) =>
            session.id === sessionId
              ? { ...session, is_paused: true, paused_at: pausedAt }
              : session,
          ) || [],
      );

      return { previousSessions };
    },
    onError: (err, variables, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(
          ["pomodoro-sessions", user?.id],
          context.previousSessions,
        );
      }
      console.error("Error pausing pomodoro session:", err);
      toast.error("Failed to pause session");
    },
  });

  const resumeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session || !session.is_paused || !session.paused_at) {
        throw new Error("Session is not paused");
      }

      const pausedDuration = Math.floor(
        (new Date().getTime() - new Date(session.paused_at).getTime()) / 1000,
      );

      const totalPausedSeconds =
        (session.total_paused_seconds || 0) + pausedDuration;

      const { error } = await supabase
        .from("pomodoro_sessions")
        .update({
          is_paused: false,
          paused_at: null,
          total_paused_seconds: totalPausedSeconds,
        })
        .eq("id", sessionId);

      if (error) throw error;

      return { sessionId, totalPausedSeconds };
    },
    onMutate: async (sessionId) => {
      const session = sessions.find((s) => s.id === sessionId);
      const totalPausedSeconds = session?.total_paused_seconds || 0;
      await queryClient.cancelQueries({
        queryKey: ["pomodoro-sessions", user?.id],
      });

      const previousSessions = queryClient.getQueryData<PomodoroSession[]>([
        "pomodoro-sessions",
        user?.id,
      ]);

      queryClient.setQueryData<PomodoroSession[]>(
        ["pomodoro-sessions", user?.id],
        (old) =>
          old?.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  is_paused: false,
                  paused_at: null,
                  total_paused_seconds: totalPausedSeconds,
                }
              : s,
          ) || [],
      );

      return { previousSessions };
    },
    onError: (err, variables, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(
          ["pomodoro-sessions", user?.id],
          context.previousSessions,
        );
      }
      console.error("Error resuming pomodoro session:", err);
      toast.error("Failed to resume session");
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("pomodoro_sessions")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) throw error;

      return sessionId;
    },
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({
        queryKey: ["pomodoro-sessions", user?.id],
      });

      const previousSessions = queryClient.getQueryData<PomodoroSession[]>([
        "pomodoro-sessions",
        user?.id,
      ]);

      queryClient.setQueryData<PomodoroSession[]>(
        ["pomodoro-sessions", user?.id],
        (old) =>
          old?.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  completed: true,
                  completed_at: new Date().toISOString(),
                }
              : session,
          ) || [],
      );

      return { previousSessions };
    },
    onError: (err, variables, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(
          ["pomodoro-sessions", user?.id],
          context.previousSessions,
        );
      }
      console.error("Error completing pomodoro session:", err);
      toast.error("Failed to complete session");
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({
      sessionId,
      notes,
    }: {
      sessionId: string;
      notes: string | null;
    }) => {
      const { error } = await supabase
        .from("pomodoro_sessions")
        .update({ notes: notes || null })
        .eq("id", sessionId);

      if (error) throw error;
    },
    onMutate: async ({ sessionId, notes }) => {
      await queryClient.cancelQueries({
        queryKey: ["pomodoro-sessions", user?.id],
      });

      const previousSessions = queryClient.getQueryData<PomodoroSession[]>([
        "pomodoro-sessions",
        user?.id,
      ]);

      queryClient.setQueryData<PomodoroSession[]>(
        ["pomodoro-sessions", user?.id],
        (old) =>
          old?.map((session) =>
            session.id === sessionId ? { ...session, notes } : session,
          ) || [],
      );

      return { previousSessions };
    },
    onError: (err, variables, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(
          ["pomodoro-sessions", user?.id],
          context.previousSessions,
        );
      }
      console.error("Error updating notes:", err);
      toast.error("Failed to update notes");
    },
    onSuccess: () => {
      toast.success("Notes updated");
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("pomodoro_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;
    },
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({
        queryKey: ["pomodoro-sessions", user?.id],
      });

      const previousSessions = queryClient.getQueryData<PomodoroSession[]>([
        "pomodoro-sessions",
        user?.id,
      ]);

      queryClient.setQueryData<PomodoroSession[]>(
        ["pomodoro-sessions", user?.id, limit],
        (old) => old?.filter((session) => session.id !== sessionId) || [],
      );

      return { previousSessions };
    },
    onError: (err, variables, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(
          ["pomodoro-sessions", user?.id, limit],
          context.previousSessions,
        );
      }
      console.error("Error deleting session:", err);
      toast.error("Failed to delete session");
    },
    onSuccess: () => {
      // Invalidate both sessions and stats queries to refresh all data
      queryClient.invalidateQueries({
        queryKey: ["pomodoro-sessions", user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["pomodoro-stats", user?.id],
      });
      toast.success("Session deleted");
    },
  });

  const getTodayStats = useCallback(() => {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(
      (session) => new Date(session.started_at).toDateString() === today,
    );

    return {
      total: todaySessions.length,
      completed: todaySessions.filter((s) => s.completed).length,
      workSessions: todaySessions.filter((s) => s.session_type === "work")
        .length,
      totalMinutes: todaySessions
        .filter((s) => s.completed)
        .reduce((sum, s) => sum + s.duration_minutes, 0),
    };
  }, [sessions]);

  const getAllTimeStats = useCallback(() => {
    return statsData;
  }, [statsData]);

  const refreshSessions = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["pomodoro-sessions", user?.id],
    });
  }, [queryClient, user?.id]);

  return {
    settings,
    sessions,
    loading: settingsLoading || sessionsLoading,
    updateSettings: updateSettingsMutation.mutate,
    createSession: async (
      sessionType: PomodoroMode,
      durationMinutes: number,
      taskId?: string,
      notes?: string,
    ) => {
      return new Promise<PomodoroSession | null>((resolve) => {
        createSessionMutation.mutate(
          { sessionType, durationMinutes, taskId, notes },
          {
            onSuccess: (data) => resolve(data),
            onError: () => resolve(null),
          },
        );
      });
    },
    pauseSession: pauseSessionMutation.mutate,
    resumeSession: resumeSessionMutation.mutate,
    completeSession: completeSessionMutation.mutate,
    updateNotes: updateNotesMutation.mutate,
    deleteSession: deleteSessionMutation.mutate,
    getTodayStats,
    getAllTimeStats,
    refreshSessions,
    loadMore,
    hasMore: sessions.length === limit,
    totalCount: statsData.total,
  };
};
