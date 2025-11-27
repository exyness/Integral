import { useCallback } from "react";
import { toast } from "sonner";
import { PRIORITY_COLORS } from "@/constants/taskConstants";
import { Task } from "@/types/task";

interface UseTaskOperationsProps {
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  onSelectionClear?: () => void;
}

export const useTaskOperations = ({
  updateTask,
  deleteTask,
  onSelectionClear,
}: UseTaskOperationsProps) => {
  const handleBulkUpdate = useCallback(
    async (taskIds: string[], updates: never) => {
      try {
        await Promise.all(taskIds.map((taskId) => updateTask(taskId, updates)));
        onSelectionClear?.();
        toast.success(`${taskIds.length} tasks updated successfully!`);
      } catch (error) {
        console.error("Failed to bulk update tasks:", error);
        toast.error("Failed to update tasks. Please try again.");
      }
    },
    [updateTask, onSelectionClear],
  );

  const handleBulkDelete = useCallback(
    async (taskIds: string[]) => {
      try {
        await Promise.all(taskIds.map((taskId) => deleteTask(taskId)));
        onSelectionClear?.();
        toast.success(`${taskIds.length} tasks deleted successfully!`);
      } catch (error) {
        console.error("Failed to bulk delete tasks:", error);
        toast.error("Failed to delete tasks. Please try again.");
      }
    },
    [deleteTask, onSelectionClear],
  );

  const handleBulkComplete = useCallback(
    async (taskIds: string[]) => {
      try {
        await Promise.all(
          taskIds.map((taskId) =>
            updateTask(taskId, {
              completed: true,
              completion_date: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }),
          ),
        );
        onSelectionClear?.();
        toast.success(`${taskIds.length} tasks marked as complete!`);
      } catch (error) {
        console.error("Failed to bulk complete tasks:", error);
        toast.error("Failed to complete tasks. Please try again.");
      }
    },
    [updateTask, onSelectionClear],
  );

  const markTasksIncomplete = useCallback(
    async (taskIds: string[]) => {
      try {
        await Promise.all(
          taskIds.map((taskId) =>
            updateTask(taskId, {
              completed: false,
              completion_date: null,
              updated_at: new Date().toISOString(),
            }),
          ),
        );
        onSelectionClear?.();
      } catch (error) {
        console.error("Failed to mark tasks as incomplete:", error);
        throw error;
      }
    },
    [updateTask, onSelectionClear],
  );

  const getPriorityColor = useCallback((priority: string) => {
    return (
      PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || "#71717A"
    );
  }, []);

  return {
    handleBulkUpdate,
    handleBulkDelete,
    handleBulkComplete,
    markTasksIncomplete,
    getPriorityColor,
  };
};
