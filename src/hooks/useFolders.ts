import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface Folder {
  id: string;
  name: string;
  color: string;
  type: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const fetchFolders = async (
  userId: string,
  type: "note" | "account",
): Promise<Folder[]> => {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .eq("type", type)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching folders:", error);
    throw new Error("Failed to fetch folders");
  }

  return data || [];
};

export const useFolders = (type: "note" | "account") => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: folders = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["folders", user?.id, type],
    queryFn: () => fetchFolders(user!.id, type),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const createFolderMutation = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("folders")
        .insert({
          name,
          color,
          type,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", user?.id, type] });
      toast.success("Folder created successfully");
    },
    onError: (error) => {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    },
  });

  const updateFolderMutation = useMutation({
    mutationFn: async ({
      folderId,
      updates,
    }: {
      folderId: string;
      updates: Partial<Folder>;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("folders")
        .update(updates)
        .eq("id", folderId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onMutate: async ({ folderId, updates }) => {
      await queryClient.cancelQueries({
        queryKey: ["folders", user?.id, type],
      });

      const previousFolders = queryClient.getQueryData<Folder[]>([
        "folders",
        user?.id,
        type,
      ]);

      if (previousFolders) {
        queryClient.setQueryData<Folder[]>(
          ["folders", user?.id, type],
          previousFolders.map((folder) =>
            folder.id === folderId ? { ...folder, ...updates } : folder,
          ),
        );
      }

      return { previousFolders };
    },
    onError: (error, variables, context) => {
      if (context?.previousFolders) {
        queryClient.setQueryData(
          ["folders", user?.id, type],
          context.previousFolders,
        );
      }
      console.error("Error updating folder:", error);
      toast.error("Failed to update folder");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", user?.id, type] });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", folderId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", user?.id, type] });
      toast.success("Folder deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    },
  });

  return {
    folders,
    loading,
    createFolder: (name: string, color: string) =>
      createFolderMutation.mutateAsync({ name, color }),
    updateFolder: (folderId: string, updates: Partial<Folder>) =>
      updateFolderMutation.mutateAsync({ folderId, updates }),
    deleteFolder: deleteFolderMutation.mutateAsync,
    refetch,
  };
};
