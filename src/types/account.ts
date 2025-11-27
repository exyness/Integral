export interface Account {
  id: string;
  user_id: string;
  folder_id: string | null;
  title: string;
  platform: string;
  email_username: string;
  password: string;
  usage_type: "custom" | "api_calls" | "tokens" | "storage" | "bandwidth";
  usage_limit?: number;
  current_usage: number;
  reset_period: "daily" | "weekly" | "monthly" | "yearly" | "never";
  description?: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  usage_log?: AccountUsageLog[];
}

export interface AccountUsageLog {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  description?: string;
  timestamp: string;
}

export interface CreateAccountData {
  title: string;
  platform: string;
  email_username: string;
  password: string;
  usage_type: "custom" | "api_calls" | "tokens" | "storage" | "bandwidth";
  usage_limit?: number;
  reset_period: "daily" | "weekly" | "monthly" | "yearly" | "never";
  description?: string;
  tags?: string[];
  folder_id?: string;
}

export interface UpdateAccountData extends Partial<CreateAccountData> {
  is_active?: boolean;
  current_usage?: number;
}

export interface LogUsageData {
  account_id: string;
  amount: number;
  description?: string;
}

export interface FolderWithCount {
  id: string;
  name: string;
  color: string;
  count: number;
}

export const PREDEFINED_PLATFORMS = [
  "Adobe",
  "Amazon",
  "Anthropic",
  "Apple",
  "Asana",
  "Discord",
  "Facebook",
  "Figma",
  "GitHub",
  "Google",
  "Kiro",
  "LinkedIn",
  "Microsoft",
  "Netflix",
  "Notion",
  "OpenAI",
  "Qoder",
  "Slack",
  "Spotify",
  "Trello",
  "Twitter",
  "Zoom",
] as const;

export const USAGE_TYPES = [
  { value: "custom", label: "Custom" },
  { value: "api_calls", label: "API Calls" },
  { value: "tokens", label: "Tokens" },
  { value: "storage", label: "Storage (GB)" },
  { value: "bandwidth", label: "Bandwidth (GB)" },
] as const;

export const RESET_PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "never", label: "Never" },
] as const;
