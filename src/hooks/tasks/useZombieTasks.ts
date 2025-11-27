import { useMemo } from "react";
import { Task } from "@/types/task";

export const useZombieTasks = (tasks: Task[], daysThreshold = 7) => {
  const deadTasks = useMemo(() => {
    const now = new Date();
    const thresholdDate = new Date(now.setDate(now.getDate() - daysThreshold));

    return tasks.filter((task) => {
      if (task.completed) return false;

      // If it has a due date, check if it's overdue
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        // Set due date to end of day to avoid flagging tasks due today
        dueDate.setHours(23, 59, 59, 999);
        return dueDate < now;
      }

      // If no due date, check if it's old (stagnant)
      const createdDate = new Date(task.created_at);
      return createdDate < thresholdDate;
    });
  }, [tasks, daysThreshold]);

  return {
    deadTasks,
    hasZombies: deadTasks.length > 0,
  };
};
