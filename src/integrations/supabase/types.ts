export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      account_usage_logs: {
        Row: {
          account_id: string;
          amount: number;
          description: string | null;
          id: string;
          timestamp: string | null;
          user_id: string;
        };
        Insert: {
          account_id: string;
          amount: number;
          description?: string | null;
          id?: string;
          timestamp?: string | null;
          user_id: string;
        };
        Update: {
          account_id?: string;
          amount?: number;
          description?: string | null;
          id?: string;
          timestamp?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "account_usage_logs_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      accounts: {
        Row: {
          created_at: string;
          current_usage: number | null;
          description: string | null;
          email_username: string;
          folder_id: string | null;
          id: string;
          is_active: boolean | null;
          password: string;
          platform: string;
          reset_period: string | null;
          tags: string[] | null;
          title: string;
          updated_at: string;
          usage_limit: number | null;
          usage_type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_usage?: number | null;
          description?: string | null;
          email_username: string;
          folder_id?: string | null;
          id?: string;
          is_active?: boolean | null;
          password: string;
          platform: string;
          reset_period?: string | null;
          tags?: string[] | null;
          title: string;
          updated_at?: string;
          usage_limit?: number | null;
          usage_type?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_usage?: number | null;
          description?: string | null;
          email_username?: string;
          folder_id?: string | null;
          id?: string;
          is_active?: boolean | null;
          password?: string;
          platform?: string;
          reset_period?: string | null;
          tags?: string[] | null;
          title?: string;
          updated_at?: string;
          usage_limit?: number | null;
          usage_type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "accounts_folder_id_fkey";
            columns: ["folder_id"];
            isOneToOne: false;
            referencedRelation: "folders";
            referencedColumns: ["id"];
          },
        ];
      };
      achievements: {
        Row: {
          badge_color: string | null;
          badge_icon: string | null;
          created_at: string | null;
          date_achieved: string;
          description: string;
          goal_id: string | null;
          id: string;
          milestone_type: string;
          title: string;
          user_id: string;
          value_achieved: number;
        };
        Insert: {
          badge_color?: string | null;
          badge_icon?: string | null;
          created_at?: string | null;
          date_achieved: string;
          description: string;
          goal_id?: string | null;
          id?: string;
          milestone_type: string;
          title: string;
          user_id: string;
          value_achieved?: number;
        };
        Update: {
          badge_color?: string | null;
          badge_icon?: string | null;
          created_at?: string | null;
          date_achieved?: string;
          description?: string;
          goal_id?: string | null;
          id?: string;
          milestone_type?: string;
          title?: string;
          user_id?: string;
          value_achieved?: number;
        };
        Relationships: [];
      };
      budget_transactions: {
        Row: {
          amount: number;
          budget_id: string | null;
          category: string;
          created_at: string | null;
          description: string;
          id: string;
          transaction_date: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          budget_id?: string | null;
          category: string;
          created_at?: string | null;
          description: string;
          id?: string;
          transaction_date: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          budget_id?: string | null;
          category?: string;
          created_at?: string | null;
          description?: string;
          id?: string;
          transaction_date?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_transactions_budget_id_fkey";
            columns: ["budget_id"];
            isOneToOne: false;
            referencedRelation: "budgets";
            referencedColumns: ["id"];
          },
        ];
      };
      budgets: {
        Row: {
          amount: number;
          category: string;
          color: string;
          created_at: string | null;
          description: string | null;
          end_date: string;
          id: string;
          name: string;
          period: string;
          spent: number;
          start_date: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          amount?: number;
          category: string;
          color?: string;
          created_at?: string | null;
          description?: string | null;
          end_date: string;
          id?: string;
          name: string;
          period: string;
          spent?: number;
          start_date: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          category?: string;
          color?: string;
          created_at?: string | null;
          description?: string | null;
          end_date?: string;
          id?: string;
          name?: string;
          period?: string;
          spent?: number;
          start_date?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      daily_entries: {
        Row: {
          content: string;
          created_at: string | null;
          energy_level: number | null;
          entry_date: string;
          id: string;
          mood: number | null;
          project_id: string | null;
          tags: string[] | null;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          energy_level?: number | null;
          entry_date?: string;
          id?: string;
          mood?: number | null;
          project_id?: string | null;
          tags?: string[] | null;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          energy_level?: number | null;
          entry_date?: string;
          id?: string;
          mood?: number | null;
          project_id?: string | null;
          tags?: string[] | null;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_entries_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      folders: {
        Row: {
          color: string;
          created_at: string;
          id: string;
          name: string;
          parent_id: string | null;
          type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          color?: string;
          created_at?: string;
          id?: string;
          name: string;
          parent_id?: string | null;
          type: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          id?: string;
          name?: string;
          parent_id?: string | null;
          type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "folders";
            referencedColumns: ["id"];
          },
        ];
      };
      lovable_accounts: {
        Row: {
          account_name: string;
          account_type: string;
          card_type: string;
          created_at: string | null;
          current_usage: number | null;
          daily_limit: number;
          daily_usage: number | null;
          email: string;
          id: string;
          is_active: boolean | null;
          monthly_limit: number;
          password: string;
          reset_date: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          account_name: string;
          account_type: string;
          card_type?: string;
          created_at?: string | null;
          current_usage?: number | null;
          daily_limit?: number;
          daily_usage?: number | null;
          email: string;
          id?: string;
          is_active?: boolean | null;
          monthly_limit?: number;
          password: string;
          reset_date?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          account_name?: string;
          account_type?: string;
          card_type?: string;
          created_at?: string | null;
          current_usage?: number | null;
          daily_limit?: number;
          daily_usage?: number | null;
          email?: string;
          id?: string;
          is_active?: boolean | null;
          monthly_limit?: number;
          password?: string;
          reset_date?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      notes: {
        Row: {
          category: string | null;
          content: string;
          content_type: string | null;
          created_at: string;
          folder_id: string | null;
          id: string;
          is_favorite: boolean | null;
          is_pinned: boolean | null;
          rich_content: Json | null;
          tags: string[] | null;
          title: string;
          updated_at: string;
          usage_count: number | null;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          content: string;
          content_type?: string | null;
          created_at?: string;
          folder_id?: string | null;
          id?: string;
          is_favorite?: boolean | null;
          is_pinned?: boolean | null;
          rich_content?: Json | null;
          tags?: string[] | null;
          title: string;
          updated_at?: string;
          usage_count?: number | null;
          user_id: string;
        };
        Update: {
          category?: string | null;
          content?: string;
          content_type?: string | null;
          created_at?: string;
          folder_id?: string | null;
          id?: string;
          is_favorite?: boolean | null;
          is_pinned?: boolean | null;
          rich_content?: Json | null;
          tags?: string[] | null;
          title?: string;
          updated_at?: string;
          usage_count?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notes_folder_id_fkey";
            columns: ["folder_id"];
            isOneToOne: false;
            referencedRelation: "folders";
            referencedColumns: ["id"];
          },
        ];
      };
      pomodoro_sessions: {
        Row: {
          completed: boolean | null;
          completed_at: string | null;
          created_at: string | null;
          duration_minutes: number;
          id: string;
          is_paused: boolean | null;
          notes: string | null;
          paused_at: string | null;
          session_type: string;
          started_at: string | null;
          task_id: string | null;
          total_paused_seconds: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          completed?: boolean | null;
          completed_at?: string | null;
          created_at?: string | null;
          duration_minutes: number;
          id?: string;
          is_paused?: boolean | null;
          notes?: string | null;
          paused_at?: string | null;
          session_type: string;
          started_at?: string | null;
          task_id?: string | null;
          total_paused_seconds?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          completed?: boolean | null;
          completed_at?: string | null;
          created_at?: string | null;
          duration_minutes?: number;
          id?: string;
          is_paused?: boolean | null;
          notes?: string | null;
          paused_at?: string | null;
          session_type?: string;
          started_at?: string | null;
          task_id?: string | null;
          total_paused_seconds?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pomodoro_sessions_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      pomodoro_settings: {
        Row: {
          auto_start_breaks: boolean | null;
          auto_start_work: boolean | null;
          created_at: string | null;
          id: string;
          long_break_duration: number | null;
          sessions_until_long_break: number | null;
          short_break_duration: number | null;
          sound_enabled: boolean | null;
          updated_at: string | null;
          user_id: string;
          work_duration: number | null;
        };
        Insert: {
          auto_start_breaks?: boolean | null;
          auto_start_work?: boolean | null;
          created_at?: string | null;
          id?: string;
          long_break_duration?: number | null;
          sessions_until_long_break?: number | null;
          short_break_duration?: number | null;
          sound_enabled?: boolean | null;
          updated_at?: string | null;
          user_id: string;
          work_duration?: number | null;
        };
        Update: {
          auto_start_breaks?: boolean | null;
          auto_start_work?: boolean | null;
          created_at?: string | null;
          id?: string;
          long_break_duration?: number | null;
          sessions_until_long_break?: number | null;
          short_break_duration?: number | null;
          sound_enabled?: boolean | null;
          updated_at?: string | null;
          user_id?: string;
          work_duration?: number | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          archived: boolean;
          color: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          archived?: boolean;
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          archived?: boolean;
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      task_projects: {
        Row: {
          archived: boolean;
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          archived?: boolean;
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          archived?: boolean;
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          assignee: string | null;
          completed: boolean;
          completion_date: string | null;
          created_at: string;
          description: string | null;
          due_date: string | null;
          id: string;
          is_on_kanban: boolean | null;
          kanban_position: number | null;
          labels: string[] | null;
          priority: string;
          project: string | null;
          status: string | null;
          title: string;
          total_time_seconds: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          assignee?: string | null;
          completed?: boolean;
          completion_date?: string | null;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          is_on_kanban?: boolean | null;
          kanban_position?: number | null;
          labels?: string[] | null;
          priority?: string;
          project?: string | null;
          status?: string | null;
          title: string;
          total_time_seconds?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          assignee?: string | null;
          completed?: boolean;
          completion_date?: string | null;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          is_on_kanban?: boolean | null;
          kanban_position?: number | null;
          labels?: string[] | null;
          priority?: string;
          project?: string | null;
          status?: string | null;
          title?: string;
          total_time_seconds?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      time_entries: {
        Row: {
          created_at: string | null;
          description: string | null;
          duration_seconds: number | null;
          end_time: string | null;
          id: string;
          is_paused: boolean | null;
          is_running: boolean | null;
          paused_at: string | null;
          start_time: string;
          task_id: string;
          total_paused_seconds: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          duration_seconds?: number | null;
          end_time?: string | null;
          id?: string;
          is_paused?: boolean | null;
          is_running?: boolean | null;
          paused_at?: string | null;
          start_time: string;
          task_id: string;
          total_paused_seconds?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          duration_seconds?: number | null;
          end_time?: string | null;
          id?: string;
          is_paused?: boolean | null;
          is_running?: boolean | null;
          paused_at?: string | null;
          start_time?: string;
          task_id?: string;
          total_paused_seconds?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "time_entries_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      usage_logs: {
        Row: {
          account_id: string;
          amount: number;
          description: string | null;
          id: string;
          timestamp: string | null;
          usage_type: string;
          user_id: string;
        };
        Insert: {
          account_id: string;
          amount: number;
          description?: string | null;
          id?: string;
          timestamp?: string | null;
          usage_type: string;
          user_id: string;
        };
        Update: {
          account_id?: string;
          amount?: number;
          description?: string | null;
          id?: string;
          timestamp?: string | null;
          usage_type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "usage_logs_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "lovable_accounts";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_and_create_achievements: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
      create_daily_entry: {
        Args: {
          p_category?: string;
          p_date: string;
          p_description?: string;
          p_goal_id?: string;
          p_mood?: string;
          p_notes?: string;
          p_tags?: string[];
          p_title: string;
          p_unit?: string;
          p_user_id: string;
          p_value?: number;
        };
        Returns: string;
      };
      create_daily_entry_with_project: {
        Args: {
          p_category?: string;
          p_date: string;
          p_description?: string;
          p_goal_id?: string;
          p_mood?: string;
          p_notes?: string;
          p_project_id?: string;
          p_tags?: string[];
          p_title: string;
          p_user_id: string;
        };
        Returns: string;
      };
      create_goal: {
        Args: {
          p_category?: string;
          p_description?: string;
          p_priority?: string;
          p_project_id?: string;
          p_start_date?: string;
          p_tags?: string[];
          p_target_date?: string;
          p_target_value?: number;
          p_task_ids?: string[];
          p_title: string;
          p_type?: string;
          p_unit?: string;
          p_user_id: string;
        };
        Returns: string;
      };
      create_goal_with_project: {
        Args: {
          p_category?: string;
          p_description?: string;
          p_priority?: string;
          p_project_uuid?: string;
          p_start_date?: string;
          p_tags?: string[];
          p_target_date?: string;
          p_task_ids?: string[];
          p_title: string;
          p_type?: string;
          p_user_id: string;
        };
        Returns: string;
      };
      create_project: {
        Args: {
          p_color?: string;
          p_description?: string;
          p_name: string;
          p_priority?: string;
          p_start_date?: string;
          p_tags?: string[];
          p_target_date?: string;
          p_user_id: string;
        };
        Returns: string;
      };
      get_goal_analytics: { Args: { p_user_id: string }; Returns: Json };
      get_project_details: {
        Args: { p_project_id: string; p_user_id: string };
        Returns: Json;
      };
      get_user_achievements: {
        Args: { p_user_id: string };
        Returns: {
          badge_color: string;
          badge_icon: string;
          created_at: string;
          date_achieved: string;
          description: string;
          goal_id: string;
          id: string;
          milestone_type: string;
          title: string;
          user_id: string;
          value_achieved: number;
        }[];
      };
      get_user_daily_entries: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string };
        Returns: {
          category: string;
          created_at: string;
          date: string;
          description: string;
          goal_id: string;
          id: string;
          mood: string;
          notes: string;
          tags: string[];
          title: string;
          unit: string;
          updated_at: string;
          user_id: string;
          value: number;
        }[];
      };
      get_user_goals: {
        Args: { p_status?: string; p_type?: string; p_user_id: string };
        Returns: {
          category: string;
          completion_date: string;
          created_at: string;
          current_value: number;
          description: string;
          id: string;
          priority: string;
          project_id: string;
          start_date: string;
          status: string;
          tags: string[];
          target_date: string;
          target_value: number;
          task_ids: string[];
          title: string;
          type: string;
          unit: string;
          updated_at: string;
          user_id: string;
        }[];
      };
      get_user_goals_with_projects: {
        Args: {
          p_project_id?: string;
          p_status?: string;
          p_type?: string;
          p_user_id: string;
        };
        Returns: {
          category: string;
          completion_date: string;
          created_at: string;
          description: string;
          id: string;
          priority: string;
          project_color: string;
          project_id: string;
          project_name: string;
          project_uuid: string;
          start_date: string;
          status: string;
          tags: string[];
          target_date: string;
          task_ids: string[];
          title: string;
          type: string;
          updated_at: string;
          user_id: string;
        }[];
      };
      get_user_projects: {
        Args: { p_user_id: string };
        Returns: {
          color: string;
          completion_date: string;
          created_at: string;
          description: string;
          entries_count: number;
          goals_count: number;
          id: string;
          name: string;
          priority: string;
          start_date: string;
          status: string;
          tags: string[];
          target_date: string;
          updated_at: string;
          user_id: string;
        }[];
      };
      update_budget_spent: {
        Args: { p_amount: number; p_budget_id: string };
        Returns: undefined;
      };
      update_goal_progress: { Args: { goal_uuid: string }; Returns: undefined };
      update_goal_status: {
        Args: {
          p_completion_date?: string;
          p_goal_id: string;
          p_status: string;
        };
        Returns: boolean;
      };
      update_task_total_time: {
        Args: { task_uuid: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
