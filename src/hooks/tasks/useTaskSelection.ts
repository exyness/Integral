import { useCallback, useMemo, useState } from "react";

interface UseTaskSelectionProps {
  tasks: Array<{ id: string }>;
}

export const useTaskSelection = ({ tasks }: UseTaskSelectionProps) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const selectedCount = useMemo(() => selectedTasks.length, [selectedTasks]);

  const handleSelectTask = useCallback((taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const allTaskIds = tasks.map((task) => task.id);
    setSelectedTasks(allTaskIds);
  }, [tasks]);

  const handleDeselectAll = useCallback(() => {
    setSelectedTasks([]);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTasks([]);
  }, []);

  return {
    selectedTasks,
    selectedCount,
    handleSelectTask,
    handleSelectAll,
    handleDeselectAll,
    clearSelection,
  };
};
