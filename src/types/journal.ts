export interface Project {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  user_id: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Journal {
  id: string;
  title: string;
  content: string;
  entry_date: string;
  project_id?: string | null;
  project?: Project | null;
  user_id: string;
  mood?: number | null;
  energy_level?: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface JournalFormData {
  title: string;
  content: string;
  entry_date: string;
  project_id?: string;
  mood?: number;
  energy_level?: number;
  tags: string[];
}

export interface ProjectFormData {
  name: string;
  description?: string;
  color: string;
}
