export interface Task {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: "low" | "medium" | "high";
  due_date?: string | null;
  assignee?: string | null;
  project?: string | null;
  labels: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  dependencies?: string[];
  blocked_by?: string[];
  status?: "todo" | "in_progress" | "review" | "completed" | "blocked";
  total_time_seconds?: number;
  completion_date?: string | null;
  tags?: string[];
  kanban_position?: number;
  is_on_kanban?: boolean;
}

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time?: string | null;
  duration_seconds?: number | null;
  description?: string | null;
  is_running: boolean;
  is_paused?: boolean;
  paused_at?: string | null;
  total_paused_seconds?: number | null;
  created_at: string;
  updated_at: string;
}

export type PriorityType = "low" | "medium" | "high";

export interface TaskFormData {
  title: string;
  description: string;
  priority: PriorityType;
  due_date: string;
  assignee: string;
  project: string;
  labels: string[];
}
