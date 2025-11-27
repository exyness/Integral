import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const TASK_PROJECTS_QUERY_KEY = "task_projects";

interface TaskProject {
  id: string;
  user_id: string;
  name: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export const useArchivedProjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: taskProjects = [] } = useQuery({
    queryKey: [TASK_PROJECTS_QUERY_KEY, user?.id],
    queryFn: async (): Promise<TaskProject[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("task_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) {
        console.error("Error fetching task projects:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const archivedProjects = taskProjects
    .filter((p) => p.archived)
    .map((p) => p.name);

  const archiveProjectMutation = useMutation({
    mutationFn: async (projectName: string) => {
      if (!user) throw new Error("User not authenticated");

      const existingProject = taskProjects.find((p) => p.name === projectName);

      if (existingProject) {
        const { error } = await supabase
          .from("task_projects")
          .update({ archived: true })
          .eq("id", existingProject.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("task_projects").insert({
          user_id: user.id,
          name: projectName,
          archived: true,
        });

        if (error) throw error;
      }

      return projectName;
    },
    onSuccess: (projectName) => {
      queryClient.invalidateQueries({
        queryKey: [TASK_PROJECTS_QUERY_KEY, user?.id],
      });
      toast.success(`Project "${projectName}" archived successfully!`);
    },
    onError: (error) => {
      console.error("Error archiving project:", error);
      toast.error("Failed to archive project. Please try again.");
    },
  });

  const unarchiveProjectMutation = useMutation({
    mutationFn: async (projectName: string) => {
      if (!user) throw new Error("User not authenticated");

      const existingProject = taskProjects.find((p) => p.name === projectName);

      if (existingProject) {
        const { error } = await supabase
          .from("task_projects")
          .update({ archived: false })
          .eq("id", existingProject.id);

        if (error) throw error;
      }

      return projectName;
    },
    onSuccess: (projectName) => {
      queryClient.invalidateQueries({
        queryKey: [TASK_PROJECTS_QUERY_KEY, user?.id],
      });
      toast.success(`Project "${projectName}" unarchived successfully!`);
    },
    onError: (error) => {
      console.error("Error unarchiving project:", error);
      toast.error("Failed to unarchive project. Please try again.");
    },
  });

  const archiveProject = (projectName: string) => {
    archiveProjectMutation.mutate(projectName);
  };

  const unarchiveProject = (projectName: string) => {
    unarchiveProjectMutation.mutate(projectName);
  };

  const isArchived = (projectName: string) => {
    return archivedProjects.includes(projectName);
  };

  return {
    archivedProjects,
    taskProjects,
    archiveProject,
    unarchiveProject,
    isArchived,
    isArchiving: archiveProjectMutation.isPending,
    isUnarchiving: unarchiveProjectMutation.isPending,
  };
};
