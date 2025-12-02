import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/budget";

export const CATEGORY_KEYS = {
  ALL: "categories",
} as const;

export const useCategoriesQuery = (type?: Category["type"]) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [CATEGORY_KEYS.ALL, user?.id, type],
    queryFn: async (): Promise<Category[]> => {
      if (!user) throw new Error("User not authenticated");

      let query = supabase
        .from("finance_categories")
        .select("*")
        .eq("user_id", user.id)
        .order("type", { ascending: true })
        .order("name", { ascending: true });

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as Category[];
    },
    enabled: !!user?.id,
  });
};

export const useCreateCategory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      categoryData: Omit<
        Category,
        "id" | "user_id" | "created_at" | "updated_at"
      >,
    ) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("finance_categories")
        .insert({
          ...categoryData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_KEYS.ALL] });
      toast.success("Category created successfully");
    },
    onError: (error) => {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase
        .from("finance_categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_KEYS.ALL] });
      toast.success("Category updated successfully");
    },
    onError: (error) => {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("finance_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_KEYS.ALL] });
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    },
  });
};
