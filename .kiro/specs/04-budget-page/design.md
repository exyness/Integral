# Budget - Design

## Overview

The Budget feature provides comprehensive financial tracking with budget creation, transaction management, multi-currency support, calendar visualization, analytics, and AI-powered insights. The design emphasizes instant feedback through optimistic updates, flexible viewing modes (cards, list, calendar, analytics), and seamless URL-based navigation for bookmarking and sharing.

**Key Design Decisions:**

1. **Optimistic Updates**: All mutations update the UI immediately before server confirmation to provide instant feedback, with automatic rollback on failure
2. **URL State Synchronization**: Tab selection and budget detail views are reflected in the URL, enabling bookmarking, browser navigation, and deep linking
3. **Standalone Transactions**: Transactions can exist without a budget association, providing flexibility for uncategorized expenses
4. **Multi-Currency Support**: Global currency context with localStorage persistence and Intl.NumberFormat for proper formatting
5. **Halloween Theme Integration**: Conditional rendering of themed components and teal color scheme when Halloween mode is active

## Architecture

### Data Flow

```
User Action → Hook → TanStack Query → Supabase → Database
                ↓
         Update Budget Spent
                ↓
         Trigger Function
                ↓
         Optimistic UI Update
```

## Database Schema

### budgets table

```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10,2) NOT NULL,
  spent NUMERIC(10,2) DEFAULT 0,
  category TEXT NOT NULL,
  period TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  color TEXT DEFAULT '#8B5CF6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### budget_transactions table

```sql
CREATE TABLE budget_transactions (
  id UUID PRIMARY KEY,
  budget_id UUID REFERENCES budgets,
  user_id UUID REFERENCES auth.users,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Database Trigger

```sql
CREATE FUNCTION update_budget_spent(p_budget_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE budgets
  SET spent = spent + p_amount,
      updated_at = NOW()
  WHERE id = p_budget_id;
END;
$$ LANGUAGE plpgsql;
```

## Type Definitions

```typescript
interface Budget {
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

interface BudgetTransaction {
  id: string;
  budget_id?: string; // Optional - supports standalone transactions
  user_id: string;
  amount: number;
  description: string;
  category: BudgetCategory;
  transaction_date: string;
  created_at: string;
}

type BudgetPeriod = "weekly" | "monthly" | "quarterly" | "yearly";

type BudgetCategory =
  | "food"
  | "transport"
  | "entertainment"
  | "utilities"
  | "healthcare"
  | "education"
  | "shopping"
  | "savings"
  | "other";

type BudgetStatus = "active" | "completed" | "over_budget";

type BudgetFilterType = "all" | "active" | "completed" | "over_budget";

type BudgetSortOption = "newest" | "oldest" | "name" | "amount" | "spent";

interface BudgetFormData {
  name: string;
  description?: string;
  amount: number;
  category: BudgetCategory;
  period: BudgetPeriod;
  start_date: string;
  end_date: string;
  color: string;
}

interface TransactionFormData {
  amount: number;
  description: string;
  category: BudgetCategory;
  transaction_date: string;
  budget_id?: string;
}

interface QuickExpenseData {
  amount: number;
  description: string;
}
```

**Rationale**: Explicit types for categories, periods, and statuses improve type safety and make valid values clear. Separate form data types distinguish between database entities and form inputs.

## Component Structure

### Pages

- **Budget.tsx**: Main budget page with tab navigation, URL state management, and budget detail view

### Components

#### Budget Components

- **BudgetCard**: Individual budget display with progress bar, status colors, and click handler
- **BudgetModal**: Create/edit budget form with validation
- **BudgetStats**: Four statistics cards (Total Budget, Total Spent, Remaining, Active Budgets)
- **BudgetFilters**: Search, category filter, status filter, and sort dropdown

#### Transaction Components

- **TransactionList**: Virtualized list of transactions with edit/delete actions
- **TransactionModal**: Create/edit transaction form with optional budget selector
- **TransactionFilters**: Date range, category, budget, and search filters
- **QuickExpenseModal**: Simplified two-field expense entry

#### Visualization Components

- **BudgetCalendar**: Monthly calendar with transaction amounts and category colors
- **BudgetAnalytics**: Charts (pie, line, bar) with date range filters

#### AI & Insights

- **FinancialInsightsCard**: AI-generated spending analysis and recommendations
- **FinancialHorrorCard**: Halloween-themed overspending warnings (conditional)

### Hooks

#### Query Hooks

- **useBudgetsQuery**: Budget fetching with TanStack Query
- **useBudgets**: Budget CRUD operations with optimistic updates
- **useTransactions**: Transaction CRUD operations with budget spent updates

#### Filtering Hooks

- **useBudgetFiltering**: Budget search, category, status, and sort logic
- **useTransactionFiltering**: Transaction date range, category, budget, and search filters

#### Utility Hooks

- **useCurrency**: Currency selection, formatting, and persistence
- **useFinancialInsights**: Gemini API integration for AI insights
- **useFinancialHorror**: Overspending detection and warning generation

## State Management

### TanStack Query Configuration

```typescript
// Query Keys
const budgetKeys = {
  all: (userId: string) => ["budgets", userId] as const,
  transactions: (userId: string) => ["budget_transactions", userId] as const,
};

// Query Options
const queryConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
};
```

### Optimistic Update Pattern

```typescript
// Budget Creation
onMutate: async (newBudget) => {
  await queryClient.cancelQueries({ queryKey: budgetKeys.all(userId) });
  const previousBudgets = queryClient.getQueryData(budgetKeys.all(userId));

  queryClient.setQueryData(budgetKeys.all(userId), (old) => [
    { ...newBudget, id: tempId, spent: 0, created_at: new Date().toISOString() },
    ...old,
  ]);

  return { previousBudgets };
},
onError: (err, newBudget, context) => {
  queryClient.setQueryData(budgetKeys.all(userId), context.previousBudgets);
  toast.error("Failed to create budget");
},
```

**Rationale**: Optimistic updates provide instant feedback. Rollback on error maintains data consistency.

### URL State Management

```typescript
// Tab State
const [searchParams, setSearchParams] = useSearchParams();
const activeTab = searchParams.get("tab") || "budgets";

const handleTabChange = (tab: string) => {
  setSearchParams({ tab }, { replace: true });
};

// Budget Detail State
const budgetSlug = searchParams.get("view");
const selectedBudget = budgets?.find(
  (b) => b.name.toLowerCase().replace(/\s+/g, "-") === budgetSlug
);

const handleBudgetClick = (budget: Budget) => {
  const slug = budget.name.toLowerCase().replace(/\s+/g, "-");
  setSearchParams({ view: slug }, { replace: true });
};

const handleBackClick = () => {
  setSearchParams({}, { replace: true });
};
```

**Rationale**: URL state enables bookmarking, sharing, and browser navigation. Replace mode prevents cluttering history.

### Currency Context

```typescript
interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  formatAmount: (amount: number) => string;
}

// Implementation
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Persistence
useEffect(() => {
  localStorage.setItem("integral-currency", currency);
}, [currency]);
```

**Rationale**: Global currency context ensures consistent formatting across all components. localStorage persistence maintains user preference across sessions.

## UI Design

### Tab Navigation

Five tabs with animated indicator and URL synchronization:

1. **Budgets**: Card grid with filters and search
2. **Expenses**: Transaction list with filters
3. **Calendar**: Monthly calendar view
4. **Analytics**: Charts and statistics
5. **Insights**: AI recommendations and Financial Horror

**URL Pattern**: `/budget?tab=expenses` or `/budget?tab=analytics`

**Rationale**: URL state enables bookmarking specific views and browser back/forward navigation.

### Budget Views

#### Budget List View (Default)

- Grid of budget cards (responsive: 1-3 columns)
- Filters: All, Active, Completed, Over Budget
- Sort: Newest, Oldest, Name, Amount, Spent
- Search by name
- Category filter dropdown

#### Budget Detail View

- Accessed by clicking a budget card
- URL pattern: `/budget?view=budget-name-slug`
- Shows: name, description, amount, spent, remaining, progress bar, date range
- Lists all associated transactions
- Actions: Edit, Delete, Add Transaction (pre-selected), Back
- Slug generation: `name.toLowerCase().replace(/\s+/g, '-')`

**Rationale**: Detail view provides focused context for a single budget. URL slug enables sharing and bookmarking specific budgets.

### Budget Card

Display elements:

- Name and description
- Amount and spent (formatted with currency)
- Progress bar (visual percentage)
- Remaining amount
- Category badge
- Color indicator (left border)
- Period badge (weekly/monthly/quarterly/yearly)
- Click handler to open detail view

### Budget Status Colors

Status determined by spent percentage:

- **On Track**: Green (< 75% spent)
- **Warning**: Yellow (75-100% spent)
- **Exceeded**: Red (> 100% spent)

Filter logic:

- **Active**: Current date between start_date and end_date
- **Completed**: Current date > end_date
- **Over Budget**: spent > amount

### Transaction Categories

Nine supported categories:

- Food
- Transport
- Entertainment
- Utilities
- Healthcare
- Education
- Shopping
- Savings
- Other

**Rationale**: Covers common expense types while keeping the list manageable. "Other" provides flexibility for uncategorized expenses.

### Charts (Recharts)

#### Analytics Tab Charts

1. **Category Breakdown**: Pie chart showing spending distribution
2. **Spending Trend**: Line chart showing daily spending over time
3. **Budget vs Actual**: Bar chart comparing budgeted amounts to actual spending
4. **Top Expenses**: List of largest transactions

#### Date Range Filters

- Last 7 days
- Last 30 days
- Last 60 days
- Last 90 days
- This month
- Custom range (date picker)

**Rationale**: Multiple chart types provide different perspectives on spending patterns. Date range filters enable focused analysis.

### Calendar View

- Monthly calendar using react-day-picker
- Transaction amounts displayed on each date
- Color-coded by category
- Total spending per day
- Click date to open day modal with transaction list
- Navigation: Previous/Next month buttons
- Current date highlighted

**Day Modal**: Shows selected date, lists all transactions, displays total, allows edit/delete actions.

### Quick Expense Feature

Simplified transaction entry for rapid expense capture:

- **Fields**: Amount (required), Description (required)
- **Defaults**: Category = "other", Date = today, Budget = none (standalone)
- **Access**: Button in Expenses tab header
- **Behavior**: Creates standalone transaction, displays success toast
- **Use Case**: On-the-go expense tracking without detailed categorization

**Rationale**: Reduces friction for quick expense logging. Users can later edit the transaction to add proper category and budget association if needed.

### Halloween Mode

When `isHalloweenMode` is true:

- Teal accent color (#60c9b6) replaces default theme colors
- Animated decorations in header (bat, pumpkin, spider, web, ghost)
- Statistics cards use teal color scheme
- Tab indicator glows with teal shadow
- Financial Horror card displays (if overspending detected)
- Creepster font for titles
- Spooky empty states

## Statistics Calculations

### Budget Statistics

Four statistics cards displayed at the top of the Budget page:

```typescript
// Total Budget: Sum of all budget amounts
const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);

// Total Spent: Sum of all transaction amounts
const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

// Remaining: Total Budget minus Total Spent
const remaining = totalBudget - totalSpent;

// Active Budgets: Count of budgets where current date is within date range
const activeBudgets = budgets.filter((b) => {
  const now = new Date();
  return new Date(b.start_date) <= now && new Date(b.end_date) >= now;
}).length;
```

**Icons**:

- Total Budget: Wallet
- Total Spent: DollarSign
- Remaining: Sparkles
- Active Budgets: FileText

**Color Coding**:

- Remaining > 0: Green (healthy)
- Remaining < 0: Red (overspent)
- Halloween mode: Teal accent

**Rationale**: High-level statistics provide immediate financial health overview. Color coding draws attention to overspending.

## Currency Support

### Supported Currencies

```typescript
const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  // ... more currencies
];
```

### Formatting

```typescript
formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
```

**Symbol Placement**: Intl.NumberFormat automatically handles currency symbol placement (before or after amount) based on locale conventions.

**Rationale**: Using Intl.NumberFormat ensures proper formatting for all currencies, including symbol placement, decimal separators, and grouping separators.

## AI Insights

### Gemini API Integration

```typescript
const prompt = `
Analyze spending data:
- Total spent: ${totalSpent}
- Budgets: ${JSON.stringify(budgets)}
- Transactions: ${JSON.stringify(transactions)}

Provide:
1. Spending patterns
2. Overspending categories
3. Budget recommendations
4. Savings tips
`;
```

**Rationale**: AI-powered insights provide personalized recommendations based on actual spending patterns, helping users make informed financial decisions.

## Filtering & Sorting Logic

### Budget Filtering

```typescript
const filterBudgets = (
  budgets: Budget[],
  filters: {
    search: string;
    category: string;
    status: BudgetFilterType;
    sort: BudgetSortOption;
  }
) => {
  let filtered = budgets;

  // Search filter
  if (filters.search) {
    filtered = filtered.filter((b) =>
      b.name.toLowerCase().includes(filters.search.toLowerCase())
    );
  }

  // Category filter
  if (filters.category && filters.category !== "all") {
    filtered = filtered.filter((b) => b.category === filters.category);
  }

  // Status filter
  const now = new Date();
  if (filters.status === "active") {
    filtered = filtered.filter(
      (b) => new Date(b.start_date) <= now && new Date(b.end_date) >= now
    );
  } else if (filters.status === "completed") {
    filtered = filtered.filter((b) => new Date(b.end_date) < now);
  } else if (filters.status === "over_budget") {
    filtered = filtered.filter((b) => b.spent > b.amount);
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    switch (filters.sort) {
      case "newest":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "oldest":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "name":
        return a.name.localeCompare(b.name);
      case "amount":
        return b.amount - a.amount;
      case "spent":
        return b.spent - a.spent;
      default:
        return 0;
    }
  });

  return filtered;
};
```

### Transaction Filtering

```typescript
const filterTransactions = (
  transactions: BudgetTransaction[],
  filters: {
    search: string;
    category: string;
    budgetId: string;
    dateRange: { start: Date; end: Date };
  }
) => {
  let filtered = transactions;

  // Search filter (description)
  if (filters.search) {
    filtered = filtered.filter((t) =>
      t.description.toLowerCase().includes(filters.search.toLowerCase())
    );
  }

  // Category filter
  if (filters.category && filters.category !== "all") {
    filtered = filtered.filter((t) => t.category === filters.category);
  }

  // Budget filter
  if (filters.budgetId && filters.budgetId !== "all") {
    filtered = filtered.filter((t) => t.budget_id === filters.budgetId);
  }

  // Date range filter
  if (filters.dateRange) {
    filtered = filtered.filter((t) => {
      const date = new Date(t.transaction_date);
      return date >= filters.dateRange.start && date <= filters.dateRange.end;
    });
  }

  return filtered;
};
```

**Rationale**: Filters use AND logic to progressively narrow results. Debounced search (300ms) prevents excessive re-renders.

## Navigation Flow

```
Budget Page (List View)
  ├─ Tab: Budgets (default)
  │   ├─ Click Budget Card → Budget Detail View
  │   │   ├─ View transactions
  │   │   ├─ Edit budget
  │   │   ├─ Delete budget
  │   │   ├─ Add transaction (pre-selected)
  │   │   └─ Back → Budget List View
  │   ├─ New Budget → Budget Modal
  │   └─ Filters/Search/Sort
  │
  ├─ Tab: Expenses
  │   ├─ Add Transaction → Transaction Modal
  │   ├─ Quick Expense → Quick Expense Modal
  │   ├─ Edit Transaction → Transaction Modal
  │   └─ Filters/Search
  │
  ├─ Tab: Calendar
  │   ├─ Click Date → Day Transactions Modal
  │   └─ Navigate Months
  │
  ├─ Tab: Analytics
  │   ├─ View Charts
  │   └─ Date Range Filters
  │
  └─ Tab: Insights
      ├─ Financial Insights Card
      └─ Financial Horror Card (Halloween mode)
```

## Form Validation

### Budget Form Validation Rules

```typescript
const budgetValidation = {
  name: {
    required: "Budget name is required",
    minLength: { value: 1, message: "Name cannot be empty" },
  },
  amount: {
    required: "Amount is required",
    min: { value: 0.01, message: "Amount must be greater than 0" },
  },
  category: {
    required: "Category is required",
  },
  period: {
    required: "Period is required",
  },
  start_date: {
    required: "Start date is required",
  },
  end_date: {
    required: "End date is required",
    validate: (value, formValues) =>
      new Date(value) > new Date(formValues.start_date) ||
      "End date must be after start date",
  },
};
```

### Transaction Form Validation Rules

```typescript
const transactionValidation = {
  amount: {
    required: "Amount is required",
    min: { value: 0.01, message: "Amount must be greater than 0" },
  },
  description: {
    required: "Description is required",
    minLength: { value: 1, message: "Description cannot be empty" },
  },
  category: {
    required: "Category is required",
  },
  transaction_date: {
    required: "Date is required",
  },
};
```

### Quick Expense Validation Rules

```typescript
const quickExpenseValidation = {
  amount: {
    required: "Amount is required",
    min: { value: 0.01, message: "Amount must be greater than 0" },
  },
  description: {
    required: "Description is required",
    minLength: { value: 1, message: "Description cannot be empty" },
  },
};
```

**Rationale**: React Hook Form with Zod validation provides type-safe validation with clear error messages. Inline errors guide users to fix issues before submission.

## Error Handling

### Validation Errors

- Budget: Name required, amount > 0, end_date > start_date
- Transaction: Amount > 0, description required
- Quick Expense: Amount > 0, description required
- Display inline error messages below fields
- Prevent form submission until valid
- Highlight invalid fields with red border

### Network Errors

- Display toast notification with error message
- Rollback optimistic updates
- Provide retry option for failed operations
- Show offline indicator if network unavailable
- Log errors to console for debugging

### Not Found Errors

- Invalid budget slug → Redirect to list view with toast message
- Missing budget → Show empty state with "Create Budget" CTA
- Failed to load data → Show error state with retry button
- No transactions → Show empty state with "Add Transaction" CTA

## Correctness Properties

### CP1: Budget Calculations

**Property**: For any budget, the spent amount equals the sum of all associated transaction amounts.

```typescript
budget.spent ===
  transactions
    .filter((t) => t.budget_id === budget.id)
    .reduce((sum, t) => sum + t.amount, 0);
```

**Property**: For any budget, remaining amount equals budget amount minus spent amount.

```typescript
remaining === budget.amount - budget.spent;
```

**Property**: For any budget, percentage equals (spent / amount) \* 100, accurate to 2 decimals.

```typescript
percentage === Math.round((budget.spent / budget.amount) * 100 * 100) / 100;
```

**Validates**: Requirements 1.7, 2.4, 2.8, 7.2, 7.3, 7.4

### CP2: Transaction Operations

**Property**: For any transaction with a budget_id, creating the transaction increments the budget's spent amount by the transaction amount.

```typescript
budgetAfter.spent === budgetBefore.spent + transaction.amount;
```

**Property**: For any transaction with a budget_id, deleting the transaction decrements the budget's spent amount by the transaction amount.

```typescript
budgetAfter.spent === budgetBefore.spent - transaction.amount;
```

**Property**: For any standalone transaction (budget_id is null), creating or deleting the transaction does not affect any budget's spent amount.

```typescript
transaction.budget_id === null → budgets.every(b => b.spent === unchanged)
```

**Validates**: Requirements 2.4, 2.5, 2.8, 14.3, 14.4, 14.7

### CP3: Currency Formatting

**Property**: For any amount and currency, formatAmount returns a string with the correct currency symbol and exactly 2 decimal places.

```typescript
formatAmount(amount).match(/[\$€£¥]\s?\d+\.\d{2}/) !== null;
```

**Property**: For any currency selection, the currency persists in localStorage and is restored on page reload.

```typescript
setCurrency(newCurrency) → localStorage.getItem("integral-currency") === newCurrency
```

**Property**: For any currency change, all displayed amounts update to use the new currency format.

```typescript
setCurrency(newCurrency) → allAmounts.every(a => a.includes(getCurrencySymbol(newCurrency)))
```

**Validates**: Requirements 6.3, 6.4, 6.6

### CP4: Date Handling

**Property**: For any budget, the status "active" is true if and only if the current date is between start_date and end_date (inclusive).

```typescript
isActive ===
  (currentDate >= budget.start_date && currentDate <= budget.end_date);
```

**Property**: For any budget, the status "completed" is true if and only if the current date is after end_date.

```typescript
isCompleted === currentDate > budget.end_date;
```

**Property**: For any date range filter, only transactions with transaction_date within the range are displayed.

```typescript
filteredTransactions.every(
  (t) =>
    t.transaction_date >= dateRange.start && t.transaction_date <= dateRange.end
);
```

**Property**: For any calendar date, clicking the date displays all and only transactions with that transaction_date.

```typescript
dayTransactions ===
  transactions.filter((t) => t.transaction_date === selectedDate);
```

**Validates**: Requirements 7.5, 8.5, 9.1, 9.2, 9.4, 10.6

### CP5: Analytics

**Property**: For any category breakdown chart, the sum of all category amounts equals the total spent amount.

```typescript
categoryData.reduce((sum, cat) => sum + cat.amount, 0) === totalSpent;
```

**Property**: For any spending trend chart, each data point represents the sum of transaction amounts for that date.

```typescript
trendData[date] ===
  transactions
    .filter((t) => t.transaction_date === date)
    .reduce((sum, t) => sum + t.amount, 0);
```

**Property**: For any budget vs actual chart, the actual amount equals the budget's spent amount.

```typescript
chartData.every(
  (item) => item.actual === budgets.find((b) => b.id === item.id).spent
);
```

**Validates**: Requirements 10.1, 10.2, 10.3, 10.5

### CP6: URL State Synchronization

**Property**: For any tab selection, the URL contains the tab query parameter with the selected tab name.

```typescript
setActiveTab(tab) → window.location.search.includes(`tab=${tab}`)
```

**Property**: For any budget detail view, the URL contains the view query parameter with the budget slug.

```typescript
viewBudgetDetail(budget) → window.location.search.includes(`view=${budget.slug}`)
```

**Property**: For any URL with tab or view parameters, loading the page restores the corresponding view.

```typescript
window.location.search.includes("tab=expenses") → activeTab === "expenses"
window.location.search.includes("view=groceries-budget") → selectedBudget.name === "Groceries Budget"
```

**Property**: For any browser back/forward navigation, the application state matches the URL parameters.

```typescript
browserBack() → applicationState === stateFromURL(window.location.search)
```

**Validates**: Requirements 4.8, 5.7, 5.8, 15.1, 15.2, 15.3, 15.4, 15.6

### CP7: Optimistic Updates

**Property**: For any mutation, the UI updates immediately before server confirmation.

```typescript
mutate(data) → queryData.includes(data) === true (before server response)
```

**Property**: For any failed mutation, the UI rolls back to the previous state and displays an error toast.

```typescript
mutate(data) fails → queryData === previousData && toastDisplayed === true
```

**Validates**: Requirements 2.6, 14.2, 14.3, 14.4, 14.5

### CP8: Filtering Logic

**Property**: For any combination of filters, the result set satisfies all filter conditions (AND logic).

```typescript
filtered.every(
  (item) =>
    matchesSearch(item) &&
    matchesCategory(item) &&
    matchesStatus(item) &&
    matchesDateRange(item)
);
```

**Property**: For any search input, the filter applies after 300ms debounce delay.

```typescript
typeSearch(query) → filterApplied === false (before 300ms)
wait(300ms) → filterApplied === true
```

**Validates**: Requirements 8.7, 8.8

### CP9: Halloween Mode

**Property**: For any component, when Halloween mode is enabled, teal color (#60c9b6) is used for accents.

```typescript
isHalloweenMode === true → accentColor === "#60c9b6"
```

**Property**: For any budget over 80% spent or exceeding amount, the Financial Horror card displays when Halloween mode is enabled.

```typescript
isHalloweenMode && (budget.spent > budget.amount * 0.8) → financialHorrorCardVisible === true
```

**Property**: For any component, when Halloween mode is disabled, the Financial Horror card does not display.

```typescript
isHalloweenMode === false → financialHorrorCardVisible === false
```

**Validates**: Requirements 12.1, 12.2, 12.6, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6

### CP10: Quick Expense

**Property**: For any quick expense submission, the created transaction has category "other", transaction_date as today, and budget_id as null.

```typescript
createQuickExpense({ amount, description }) →
  transaction.category === "other" &&
  transaction.transaction_date === today &&
  transaction.budget_id === null;
```

**Property**: For any quick expense, only amount and description fields are required.

```typescript
quickExpenseForm.requiredFields === ["amount", "description"];
```

**Validates**: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
