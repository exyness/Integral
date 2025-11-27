import { useMemo } from "react";
import { FilterType, SortType } from "@/constants/taskConstants";
import { Task } from "@/types/task";

interface UseTaskFilteringProps {
  tasks: Task[];
  filter: FilterType;
  sortBy: SortType;
  searchTerm: string;
  projectFilter?: string;
}

export const useTaskFiltering = ({
  tasks,
  filter,
  sortBy,
  searchTerm,
  projectFilter = "",
}: UseTaskFilteringProps) => {
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "completed" && task.completed) ||
        (filter === "pending" && !task.completed);

      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesProject =
        !projectFilter || (task.project || "Unassigned") === projectFilter;

      return matchesFilter && matchesSearch && matchesProject;
    });
  }, [tasks, filter, searchTerm, projectFilter]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (sortBy === "priority") {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [filteredTasks, sortBy]);

  const taskStats = useMemo(() => {
    return {
      completed: tasks.filter((task) => task.completed).length,
      pending: tasks.filter((task) => !task.completed).length,
      highPriority: tasks.filter((task) => task.priority === "high").length,
    };
  }, [tasks]);

  return {
    filteredTasks,
    sortedTasks,
    taskStats,
  };
};
