import { useMemo } from "react";
import { FilterType, SortType } from "@/constants/taskConstants";
import { Task } from "@/types/task";

interface UseTaskFilteringProps {
  tasks: Task[];
  filter: FilterType;
  sortBy: SortType;
  searchTerm: string;
  projectFilter?: string;
  dateRange?: {
    start: string | null;
    end: string | null;
  };
}

export const useTaskFiltering = ({
  tasks,
  filter,
  sortBy,
  searchTerm,
  projectFilter = "",
  dateRange,
}: UseTaskFilteringProps) => {
  const filteredTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const next7Days = new Date(today);
    next7Days.setDate(next7Days.getDate() + 7);

    return tasks.filter((task) => {
      // Date-based filters
      let matchesFilter = true;
      if (filter === "today") {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        taskDate.setHours(0, 0, 0, 0);
        matchesFilter = taskDate.getTime() === today.getTime();
      } else if (filter === "tomorrow") {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        taskDate.setHours(0, 0, 0, 0);
        matchesFilter = taskDate.getTime() === tomorrow.getTime();
      } else if (filter === "next7days") {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        taskDate.setHours(0, 0, 0, 0);
        matchesFilter =
          taskDate.getTime() >= today.getTime() &&
          taskDate.getTime() < next7Days.getTime();
      } else {
        matchesFilter =
          filter === "all" ||
          (filter === "completed" && task.completed) ||
          (filter === "pending" && !task.completed);
      }

      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesProject =
        !projectFilter || (task.project || "Unassigned") === projectFilter;

      let matchesDateRange = true;
      if (dateRange?.start && dateRange?.end && task.due_date) {
        const taskDate = new Date(task.due_date).getTime();
        const startDate = new Date(dateRange.start).getTime();
        const endDate = new Date(dateRange.end).getTime();
        // Add one day to end date to make it inclusive
        const endDateInclusive = endDate + 86400000;
        matchesDateRange = taskDate >= startDate && taskDate < endDateInclusive;
      } else if (dateRange?.start && dateRange?.end && !task.due_date) {
        // If filtering by date range, exclude tasks without due date
        matchesDateRange = false;
      }

      return (
        matchesFilter && matchesSearch && matchesProject && matchesDateRange
      );
    });
  }, [tasks, filter, searchTerm, projectFilter, dateRange]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      switch (sortBy) {
        case "dueDate-asc":
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return (
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          );
        case "dueDate-desc":
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return (
            new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
          );
        case "priority-desc": {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case "priority-asc": {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case "created-asc":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "created-desc":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
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
