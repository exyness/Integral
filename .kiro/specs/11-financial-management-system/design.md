# Design Document

## Introduction

This document provides the technical design for the Financial Management System overhaul. The system transforms the existing budget tracker into a comprehensive personal finance platform with multi-account management, balance sheet tracking, enhanced categories, recurring transactions, financial goals, and advanced analytics. The architecture leverages React 19, TypeScript, TanStack Query for state management, Supabase for backend, and maintains the existing Halloween theme system.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Finances Page (Main)                     │
│  ┌────────────┬────────────┬────────────┬─────────────────┐ │
│  │  Budgets   │ Recurring  │  Accounts  │  Balance Sheet  │ │
│  ├────────────┼────────────┼────────────┼─────────────────┤ │
│  │ Categories │  Insights  │  Expenses  │    Analytics    │ │
│  └────────────┴────────────┴────────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   TanStack   │   │   Supabase   │   │    Theme     │
│    Query     │◄──┤   Client     │   │   Context    │
│   (State)    │   │  (Backend)   │   │ (Halloween)  │
└──────────────┘   └──────────────┘   └──────────────┘
```

### Component Hierarchy

```
Finances (Main Page)
├── BudgetStats (5 Statistics Cards)
├── Tab Navigation (9 Tabs)
├── Tab Content (Conditional Rendering)
│   ├── Budgets Tab
│   │   ├── BudgetFilters
│   │   ├── BudgetCard[]
│   │   └── BudgetModal
│   ├── Recurring Tab
│   │   ├── RecurringManager
│   │   ├── RecurringCard[]
│   │   └── RecurringModal
│   ├── Accounts Tab
│   │   ├── AccountList
│   │   ├── AccountCard[]
│   │   ├── GoalCard[]
│   │   ├── AccountModal
│   │   └── GoalModal
│   ├── Balance Sheet Tab
│   │   ├── NetWorthSummary
│   │   ├── NetWorthChart
│   │   ├── BreakdownCard (Assets)
│   │   ├── BreakdownCard (Liabilities)
│   │   ├── AccountCard[] (All Accounts)
│   │   ├── LiabilityCard[] (All Liabilities)
│   │   └── LiabilityModal
│   ├── Categories Tab
│   │   ├── CategoryManager
│   │   ├── CategoryCard[] (Expense/Income/Goal)
│   │   └── CategoryModal
│   ├── Expenses Tab
│   │   ├── TransactionFilters
│   │   ├── TransactionList
│   │   └── TransactionModal (Enhanced)
│   ├── Analytics Tab
│   │   ├── BudgetAnalytics (Enhanced)
│   │   └── Category Drill-Down
│   └── Calendar Tab
│       └── BudgetCalendar
└── Modals (Global)
    ├── ContributionModal
    ├── ConfirmationModal
    └── QuickExpenseModal
```

## Data Models

### Database Schema

#### finance_accounts

```typescript
interface Account {
  id: string;
  user_id: string;
  name: string;
  type:
    | "cash"
    | "bank"
    | "credit_card"
    | "digital_wallet"
    | "investment"
    | "savings";
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
```

#### liabilities

```typescript
interface Liability {
  id: string;
  user_id: string;
  name: string;
  type: "loan" | "credit_card" | "mortgage" | "other";
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
```

#### finance_categories

```typescript
interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: "expense" | "income" | "goal";
  parent_id?: string | null;
  subcategories?: Category[];
  budget_limit?: number;
  description?: string;
  is_active: boolean;
  category_type: "system" | "user";
  created_at: string;
  updated_at: string;
}
```

#### recurring_transactions

```typescript
interface RecurringTransaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: "expense" | "income" | "transfer";
  category_id?: string;
  account_id?: string;
  to_account_id?: string;
  interval: "daily" | "weekly" | "monthly" | "yearly";
  start_date: string;
  next_run_date: string;
  last_run_date?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}
```

#### financial_goals

```typescript
interface FinancialGoal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  linked_account_id?: string;
  category_id?: string;
  icon: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

#### goal_contributions

```typescript
interface GoalContribution {
  id: string;
  user_id: string;
  goal_id: string;
  amount: number;
  category_id?: string | null;
  source_account_id?: string | null;
  notes?: string;
  contributed_at: string;
  created_at: string;
  updated_at: string;
}
```

#### net_worth_snapshots

```typescript
interface NetWorthSnapshot {
  id: string;
  user_id: string;
  date: string;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  currency: string;
  created_at: string;
}
```

#### budget_transactions (Enhanced)

```typescript
interface BudgetTransaction {
  id: string;
  user_id: string;
  budget_id?: string | null;
  amount: number;
  description: string;
  category: string; // Legacy field
  category_id?: string | null; // New field
  account_id?: string | null; // New field
  to_account_id?: string | null; // For transfers
  type?: "expense" | "income" | "transfer"; // New field
  tags?: string[];
  is_recurring?: boolean;
  recurring_id?: string | null;
  balance?: number; // Snapshot of account balance
  transaction_date: string;
  created_at: string;
}
```

## Component Design

### Core Components

#### AccountCard

**Purpose:** Display account information with balance and actions
**Props:**

- account: Account
- onEdit: (account: Account) => void
- onDelete: (id: string) => void

**Features:**

- Icon and color display
- Balance with currency formatting
- Account type badge
- Edit/Delete dropdown menu
- Halloween decorations in theme mode

#### AccountModal

**Purpose:** Create or edit financial accounts
**Props:**

- isOpen: boolean
- onClose: () => void
- account?: Account
- onSubmit: (data) => Promise<void>
- isLoading?: boolean

**Features:**

- Account type selection (6 types)
- Icon picker with 100+ icons
- Color picker with 8 preset colors
- Currency selector (150+ currencies)
- Include in total checkbox
- Form validation
- Optimistic updates

#### CategoryManager

**Purpose:** Manage expense, income, and goal categories
**Props:**

- triggerAdd?: number (external trigger for adding category)

**Features:**

- Three sections: Expense, Income, Goal
- Grid layout with category cards
- System vs User category badges
- Manage mode toggle for edit/delete
- Subcategory indentation
- Add category button per section
- Search and filter capabilities

#### CategoryPicker

**Purpose:** Searchable category selector for transactions
**Props:**

- value?: string
- onChange: (categoryId: string) => void
- type?: CategoryType
- label?: string
- placeholder?: string

**Features:**

- Search input with real-time filtering
- System category toggle
- Icon and color display
- Grouped by parent categories
- Keyboard navigation support

#### RecurringCard

**Purpose:** Display recurring transaction rule
**Props:**

- transaction: RecurringTransaction
- onEdit: (transaction) => void
- onDelete: (id: string) => void
- onToggleActive: (transaction) => void
- getAccountName: (id) => string
- getCategoryName: (id) => string

**Features:**

- Transaction type icon and color
- Amount and interval display
- Next payment date with countdown
- Active/Inactive toggle
- Category and account badges
- Edit/Delete dropdown menu
- Overdue highlighting

#### GoalCard

**Purpose:** Display financial goal with progress
**Props:**

- goal: FinancialGoal
- onEdit: (goal) => void
- onDelete: (id: string) => void

**Features:**

- Progress bar with percentage
- Current/Target amount display
- Days remaining calculation
- Add Contribution button
- Category badge if linked
- Icon and color customization
- Target date warning (<30 days)

#### BreakdownCard

**Purpose:** Visualize asset or liability composition
**Props:**

- title: string
- items: BreakdownItem[]
- history: HistoryPoint[]
- totalAmount: number
- type: 'assets' | 'liabilities'

**Features:**

- Mini pie chart (top right)
- Bar chart showing history
- Top 3 items list with percentages
- Icon and color per item
- Responsive design

#### NetWorthChart

**Purpose:** Display net worth history over time
**Props:** None (uses useNetWorthHistory hook)

**Features:**

- Area chart with gradient fill
- X-axis: dates (formatted as "MMM d")
- Y-axis: amounts (compact notation)
- Tooltip with formatted values
- Theme-aware colors
- Responsive container

## State Management

### TanStack Query Architecture

#### Query Keys Structure

```typescript
const QUERY_KEYS = {
  BUDGETS: "budgets",
  BUDGET_TRANSACTIONS: "budget-transactions",
  ANALYTICS: "analytics",
  ACCOUNTS: "accounts",
  LIABILITIES: "liabilities",
  CATEGORIES: "categories",
  RECURRING_TRANSACTIONS: "recurring-transactions",
  FINANCIAL_GOALS: "financialGoals",
  CONTRIBUTIONS: "contributions",
  NET_WORTH_HISTORY: "netWorthHistory",
} as const;
```

#### Query Configuration

```typescript
const QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  GC_TIME: 10 * 60 * 1000, // 10 minutes
} as const;
```

### Custom Hooks

#### useAccountsQuery

```typescript
export const useAccountsQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS, user?.id],
    queryFn: async (): Promise<Account[]> => {
      const { data, error } = await supabase
        .from("finance_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: QUERY_CONFIG.STALE_TIME,
    gcTime: QUERY_CONFIG.GC_TIME,
  });
};
```

#### useCreateAccount

```typescript
export const useCreateAccount = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      accountData: Omit<Account, "id" | "user_id" | "created_at" | "updated_at">
    ) => {
      const { data, error } = await supabase
        .from("finance_accounts")
        .insert({ ...accountData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newAccount) => {
      // Optimistic update
      queryClient.setQueryData(
        [QUERY_KEYS.ACCOUNTS, user?.id],
        (oldData: Account[] = []) => [newAccount, ...oldData]
      );
      toast.success("Account created successfully!");
    },
  });
};
```
