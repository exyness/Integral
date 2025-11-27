export interface Budget {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  amount: number;
  spent: number;
  category: BudgetCategory;
  period: BudgetPeriod;
  start_date: string;
  end_date: string;
  color: string;
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
}

export interface CategorySpending {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  [key: string]: string | number;
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
