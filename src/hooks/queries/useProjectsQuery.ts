import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Project, ProjectFormData } from "@/types/journal.ts";
import { QUERY_KEYS } from "./useJournalQuery";

const handleSupabaseError = (error: PostgrestError, operation: string) => {
  console.error(`Error ${operation}:`, error);
  toast.error(`Failed to ${operation}. Please try again.`);
};

export const useProjectsQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEYS.PROJECTS, user?.id],
    queryFn: async (): Promise<Project[]> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useCreateProject = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectData: ProjectFormData): Promise<Project> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("projects")
        .insert({
          ...projectData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newProject) => {
      queryClient.setQueryData(
        [QUERY_KEYS.PROJECTS, user?.id],
        (oldData: Project[] = []) =>
          [...oldData, newProject].sort((a, b) => a.name.localeCompare(b.name)),
      );
      toast.success("Project created successfully!");
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "create project");
    },
  });
};

export const useUpdateProject = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ProjectFormData>;
    }): Promise<Project> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(
        [QUERY_KEYS.PROJECTS, user?.id],
        (oldData: Project[] = []) =>
          oldData
            .map((project) =>
              project.id === updatedProject.id ? updatedProject : project,
            )
            .sort((a, b) => a.name.localeCompare(b.name)),
      );
      toast.success("Project updated successfully!");
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "update project");
    },
  });
};

export const useDeleteProject = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(
        [QUERY_KEYS.PROJECTS, user?.id],
        (oldData: Project[] = []) =>
          oldData.filter((project) => project.id !== deletedId),
      );
      toast.success("Project deleted successfully!");
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "delete project");
    },
  });
};

export const useArchiveProject = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Project> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("projects")
        .update({ archived: true })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (archivedProject) => {
      queryClient.setQueryData(
        [QUERY_KEYS.PROJECTS, user?.id],
        (oldData: Project[] = []) =>
          oldData.map((project) =>
            project.id === archivedProject.id ? archivedProject : project,
          ),
      );

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNAL_ENTRIES] });
      toast.success("Project archived successfully!");
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "archive project");
    },
  });
};

export const useUnarchiveProject = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Project> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("projects")
        .update({ archived: false })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (unarchivedProject) => {
      queryClient.setQueryData(
        [QUERY_KEYS.PROJECTS, user?.id],
        (oldData: Project[] = []) =>
          oldData.map((project) =>
            project.id === unarchivedProject.id ? unarchivedProject : project,
          ),
      );

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNAL_ENTRIES] });
      toast.success("Project unarchived successfully!");
    },
    onError: (error: PostgrestError) => {
      handleSupabaseError(error, "unarchive project");
    },
  });
};
