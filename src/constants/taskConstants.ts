export type PriorityType = "low" | "medium" | "high";
export type FilterType =
  | "all"
  | "completed"
  | "pending"
  | "today"
  | "tomorrow"
  | "next7days";
export type SortType =
  | "created-desc"
  | "created-asc"
  | "dueDate-asc"
  | "dueDate-desc"
  | "priority-desc"
  | "priority-asc";

export interface TaskFormData {
  title: string;
  description: string;
  priority: PriorityType;
  due_date: string;
  assignee: string;
  project: string;
  labels: string[];
}

export const PRIORITY_COLORS = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#10B981",
} as const;
