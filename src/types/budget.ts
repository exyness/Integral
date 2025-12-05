export interface Budget {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  amount: number;
  spent: number;
  category: string;
  period: BudgetPeriod;
  start_date: string;
  end_date: string;
  color: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetTransaction {
  id: string;
  budget_id: string | null;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  transaction_date: string;
  created_at: string;
  // Phase 3 Extensions
  account_id?: string | null;
  category_id?: string | null;
  type?: "expense" | "income" | "transfer";
  to_account_id?: string | null;
  tags?: string[];
  is_recurring?: boolean;
  recurring_id?: string | null;
  balance?: number;
}

export type RecurringInterval = "daily" | "weekly" | "monthly" | "yearly";

export interface RecurringTransaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: "expense" | "income" | "transfer";
  category_id?: string;
  account_id?: string;
  to_account_id?: string;
  interval: RecurringInterval;
  start_date: string;
  next_run_date: string;
  last_run_date?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type BudgetCategory =
  | "food"
  | "transport"
  | "entertainment"
  | "utilities"
  | "healthcare"
  | "education"
  | "shopping"
  | "savings"
  | "other";

export type BudgetPeriod = "weekly" | "monthly" | "quarterly" | "yearly";

export interface BudgetStats {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentageUsed: number;
  overBudget: boolean;
}

export interface AnalyticsSummary {
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  categoryBreakdown: CategorySpending[];
  dailySpending: DailySpending[];
  topExpenses: BudgetTransaction[];
  budgetedVsActual: {
    budgeted: number;
    actual: number;
    standalone: number;
  };
  recurringExpenses: {
    total: number;
    count: number;
  };
  netWorth: {
    assets: number;
    liabilities: number;
    total: number;
  };
  spendingDistribution: {
    fixed: number;
    variable: number;
  };
  assetAllocation: {
    type: string;
    amount: number;
    percentage: number;
  }[];
}

export interface CategorySpending {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  color?: string;
  [key: string]: string | number | undefined;
}

export interface DailySpending {
  date: string;
  amount: number;
  count: number;
}

export type DateRangeFilter =
  | "week"
  | "month"
  | "30days"
  | "60days"
  | "90days"
  | "custom";

// Account Management
export type AccountType =
  | "cash"
  | "bank"
  | "credit_card"
  | "digital_wallet"
  | "investment"
  | "savings";

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  icon: string;
  color: string;
  balance: number;
  currency: string;
  initial_balance: number;
  include_in_total: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Balance Sheet - Liabilities
export type LiabilityType = "loan" | "credit_card" | "mortgage" | "other";

export interface Liability {
  id: string;
  user_id: string;
  name: string;
  type: LiabilityType;
  icon: string;
  color: string;
  amount: number;
  currency: string;
  interest_rate?: number;
  due_date?: string;
  minimum_payment?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Enhanced Category System
export type CategoryType = "expense" | "income" | "goal";
export type CategoryOwnership = "system" | "user";

export interface NetWorthSnapshot {
  id: string;
  user_id: string;
  date: string;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  currency: string;
  created_at: string;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  linked_account_id?: string;
  category_id?: string; // NEW: Link to category
  icon: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  parent_id?: string | null; // For subcategories
  subcategories?: Category[];
  budget_limit?: number; // Monthly spending limit
  description?: string;
  is_active: boolean;
  category_type: CategoryOwnership; // 'system' or 'user' - replaces is_system
  created_at: string;
  updated_at: string;
}

// Goal Contributions
export interface GoalContribution {
  id: string;
  user_id: string;
  goal_id: string;
  amount: number;
  category_id?: string | null; // Where the money came from
  source_account_id?: string | null; // Optional: which account
  notes?: string;
  contributed_at: string;
  created_at: string;
  updated_at: string;
}
