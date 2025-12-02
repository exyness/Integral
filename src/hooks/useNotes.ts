import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";

export interface Note {
  id: string;
  title: string;
  content: string;
  rich_content?: Json | null;
  content_type: "plain" | "rich";
  category?: string | null;
  tags: string[];
  usage_count: number;
  folder_id?: string | null;
  is_pinned: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const fetchNotes = async (userId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching notes:", error);
    throw new Error("Failed to fetch notes");
  }

  return data.map(
    (note: Tables<"notes">): Note => ({
      ...note,
      category: note.category || undefined,
      folder_id: note.folder_id || undefined,
      tags: note.tags || [],
      usage_count: note.usage_count || 0,
      content_type: (note.content_type as "plain" | "rich") || "plain",
      rich_content: note.rich_content || undefined,
      is_pinned: note.is_pinned || false,
      is_favorite: note.is_favorite || false,
    }),
  );
};

export const useNotes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: notes = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["notes", user?.id],
    queryFn: () => fetchNotes(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: {
      title: string;
      content: string;
      rich_content?: string;
      content_type?: "plain" | "rich";
      category?: string;
      tags?: string[];
      folder_id?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("notes")
        .insert({
          ...noteData,
          user_id: user.id,
          tags: noteData.tags || [],
          usage_count: 0,
          content_type: noteData.content_type || "plain",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (noteData) => {
      await queryClient.cancelQueries({ queryKey: ["notes", user?.id] });

      const previousNotes = queryClient.getQueryData<Note[]>([
        "notes",
        user?.id,
      ]);

      const optimisticNote: Note = {
        id: `temp-${Date.now()}`,
        title: noteData.title,
        content: noteData.content,
        rich_content: noteData.rich_content || null,
        content_type: noteData.content_type || "plain",
        category: noteData.category || null,
        tags: noteData.tags || [],
        usage_count: 0,
        folder_id: noteData.folder_id || null,
        is_pinned: false,
        is_favorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user!.id,
      };

      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          ["notes", user?.id],
          [optimisticNote, ...previousNotes],
        );
      }

      return { previousNotes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", user?.id] });
      toast.success("Note created successfully");
    },
    onError: (error, variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes", user?.id], context.previousNotes);
      }
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", user?.id] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({
      noteId,
      updates,
    }: {
      noteId: string;
      updates: Partial<Note>;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("notes")
        .update(updates)
        .eq("id", noteId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onMutate: async ({ noteId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["notes", user?.id] });

      const previousNotes = queryClient.getQueryData<Note[]>([
        "notes",
        user?.id,
      ]);

      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          ["notes", user?.id],
          previousNotes.map((note) =>
            note.id === noteId ? { ...note, ...updates } : note,
          ),
        );
      }

      return { previousNotes };
    },
    onError: (error, variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes", user?.id], context.previousNotes);
      }
      console.error("Error updating note:", error);
      toast.error("Failed to update note");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", user?.id] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", user?.id] });
      toast.success("Note deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    },
  });

  return {
    notes,
    loading,
    createNote: createNoteMutation.mutate,
    createNoteAsync: createNoteMutation.mutateAsync,
    updateNote: (noteId: string, updates: Partial<Note>) =>
      updateNoteMutation.mutate({ noteId, updates }),
    deleteNote: deleteNoteMutation.mutate,
    incrementUsage: (noteId: string) => {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        updateNoteMutation.mutate({
          noteId,
          updates: { usage_count: note.usage_count + 1 },
        });
      }
    },
    refetch,
  };
};
