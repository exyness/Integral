import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";

const TASKS_QUERY_KEY = "tasks";

export const useTasks = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: [TASKS_QUERY_KEY, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load tasks");
        throw error;
      }

      return (data || []).map((task) => ({
        ...task,
        priority: ["low", "medium", "high"].includes(task.priority)
          ? (task.priority as "low" | "medium" | "high")
          : ("medium" as const),
        status:
          task.status &&
          ["todo", "in_progress", "review", "completed", "blocked"].includes(
            task.status,
          )
            ? (task.status as
                | "todo"
                | "in_progress"
                | "review"
                | "completed"
                | "blocked")
            : ("todo" as const),
      }));
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<Task> & { title: string }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...taskData,
          user_id: user.id,
          completed: false,
          labels: taskData.labels || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: () => {
      setIsCreating(true);
    },
    onSuccess: (newTask) => {
      queryClient.setQueryData(
        [TASKS_QUERY_KEY, user?.id],
        (oldTasks: Task[] = []) => [newTask, ...oldTasks],
      );
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    },
    onSettled: () => {
      setIsCreating(false);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: Partial<Task>;
    }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(
        [TASKS_QUERY_KEY, user?.id],
        (oldTasks: Task[] = []) =>
          oldTasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task,
          ),
      );
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
      return taskId;
    },
    onSuccess: (deletedTaskId) => {
      queryClient.setQueryData(
        [TASKS_QUERY_KEY, user?.id],
        (oldTasks: Task[] = []) =>
          oldTasks.filter((task) => task.id !== deletedTaskId),
      );
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    },
  });

  const createTask = useCallback(
    async (taskData: Partial<Task> & { title: string }) => {
      return createTaskMutation.mutateAsync(taskData);
    },
    [createTaskMutation],
  );

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      return updateTaskMutation.mutateAsync({ taskId, updates });
    },
    [updateTaskMutation],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      return deleteTaskMutation.mutateAsync(taskId);
    },
    [deleteTaskMutation],
  );

  const toggleTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updates: Partial<Task> = {
        completed: !task.completed,
        completion_date: !task.completed ? new Date().toISOString() : null,
      };

      try {
        await updateTask(taskId, updates);

        if (!task.completed) {
          toast.success(`Task "${task.title}" marked as completed! 🎉`);
        } else {
          toast.success(`Task "${task.title}" marked as incomplete`);
        }
      } catch (error) {
        toast.error("Failed to update task");
        throw error;
      }
    },
    [tasks, updateTask],
  );

  const resurrectTask = useCallback(
    async (taskId: string, subtasks: string[]) => {
      try {
        const parentTask = tasks.find((t) => t.id === taskId);
        for (const subtaskTitle of subtasks) {
          await createTask({
            title: subtaskTitle,
            description: `Resurrected subtask from: ${parentTask?.title || "Unknown Task"}`,
            priority: parentTask?.priority || "medium",
            due_date: new Date().toISOString().split("T")[0],
            assignee: parentTask?.assignee || "",
            project: parentTask?.project || "",
            labels: [...(parentTask?.labels || []), "resurrected"],
          });
        }
      } catch (error) {
        console.error("Failed to resurrect task:", error);
        throw error;
      }
    },
    [tasks, createTask],
  );

  return {
    tasks,
    loading,
    isCreating,
    isDeleting: deleteTaskMutation.isPending,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    resurrectTask,
    refetch,
  };
};
