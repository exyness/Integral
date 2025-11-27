import { useMemo } from "react";
import { Task } from "@/types/task";

export interface Project {
  name: string;
  taskCount: number;
  completedCount: number;
  pendingCount: number;
  completionRate: number;
}

export const useProjects = (tasks: Task[] = []) => {
  const projects = useMemo(() => {
    const projectMap = new Map<string, Project>();

    tasks.forEach((task) => {
      const projectName = task.project || "Unassigned";

      if (!projectMap.has(projectName)) {
        projectMap.set(projectName, {
          name: projectName,
          taskCount: 0,
          completedCount: 0,
          pendingCount: 0,
          completionRate: 0,
        });
      }

      const project = projectMap.get(projectName)!;
      project.taskCount++;

      if (task.completed) {
        project.completedCount++;
      } else {
        project.pendingCount++;
      }

      project.completionRate =
        project.taskCount > 0
          ? Math.round((project.completedCount / project.taskCount) * 100)
          : 0;
    });

    return Array.from(projectMap.values()).sort((a, b) => {
      if (a.taskCount !== b.taskCount) {
        return b.taskCount - a.taskCount;
      }
      return a.name.localeCompare(b.name);
    });
  }, [tasks]);

  const getTasksByProject = (projectName: string) => {
    return tasks.filter(
      (task) => (task.project || "Unassigned") === projectName,
    );
  };

  return {
    projects,
    getTasksByProject,
  };
};
