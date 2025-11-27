# Budget Tracker - Implementation Tasks

## Phase 1: Database and Type Definitions

- [x] 1. Verify Database Schema
  - Review `supabase/migrations/20251119045332_remote_schema.sql` to confirm budgets and budget_transactions table structure
  - Verify budgets table has columns: id (UUID PK), user_id (UUID FK), name (TEXT NOT NULL), description (TEXT), amount (NUMERIC(10,2) NOT NULL), spent (NUMERIC(10,2) DEFAULT 0), category (TEXT NOT NULL), period (TEXT NOT NULL), start_date (DATE NOT NULL), end_date (DATE NOT NULL), color (TEXT DEFAULT '#8B5CF6'), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)
  - Verify budget_transactions table has columns: id (UUID PK), budget_id (UUID FK nullable), user_id (UUID FK), amount (NUMERIC(10,2) NOT NULL), description (TEXT NOT NULL), category (TEXT NOT NULL), transaction_date (DATE NOT NULL), created_at (TIMESTAMPTZ)
  - Confirm RLS policies exist for SELECT, INSERT, UPDATE, DELETE operations (WHERE auth.uid() = user_id)
  - Verify indexes exist: idx_budgets_user_id, idx_budget_transactions_user_id, idx_budget_transactions_budget_id, idx_budget_transactions_date_category, idx_budget_transactions_standalone
  - Verify foreign key constraints: budgets_user_id_fkey, budget_transactions_user_id_fkey, budget_transactions_budget_id_fkey (ON DELETE CASCADE)
  - Verify trigger exists: update_budgets_updated_at trigger calls update_updated_at_column() function
  - Verify RPC function exists: update_budget_spent(p_budget_id UUID, p_amount NUMERIC) updates spent amount
  - TypeScript types are auto-generated in `src/integrations/supabase/types.ts`
  - _Requirements: 14.1, 14.7, 14.8_

- [x] 2. Create Type Definitions
  - Create `src/types/budget.ts` file
  - Define Budget interface with all fields and proper types
  - Define BudgetTransaction interface with budget_id as nullable
  - Define BudgetCategory as union type ("food" | "transport" | "entertainment" | "utilities" | "healthcare" | "education" | "shopping" | "savings" | "other")
  - Define BudgetPeriod as union type ("weekly" | "monthly" | "quarterly" | "yearly")
  - Define BudgetStats interface for statistics calculations
  - Define AnalyticsSummary interface for analytics data
  - Define CategorySpending and DailySpending interfaces
  - Define DateRangeFilter type
  - Export all types for use across the application
  - _Requirements: 1.5, 1.6, 3.2, 8.1, 8.2_

- [x] 3. Create Currency Constants
  - Create `src/constants/currencies.ts` file
  - Define Currency interface with code, symbol, name
  - Define CURRENCIES array with 28 supported currencies (USD, EUR, GBP, JPY, CNY, INR, etc.)
  - Include symbol and full name for each currency
  - Export Currency interface and CURRENCIES array
  - _Requirements: 6.1, 6.2_

## Phase 2: Core Data Management Hooks

- [x] 4. Implement useBudgetsQuery Hook
  - Create `src/hooks/queries/useBudgetsQuery.ts` file
  - Set up useQuery with key ["budgets", userId] to fetch all user budgets
  - Order budgets by created_at descending
  - Configure staleTime: 5 minutes, gcTime: 10 minutes
  - Return data, isLoading, error states
  - _Requirements: 14.1, 14.8, 11.6, 11.7_

- [x] 5. Implement Budget Creation Mutation
  - Create useCreateBudget mutation in useBudgetsQuery.ts
  - Insert budget with user_id, name, amount, category, period, start_date, end_date, color, description
  - Set spent: 0 on creation
  - Implement optimistic update: add new budget to cache immediately
  - Show success toast on completion
  - Show error toast and rollback on failure
  - _Requirements: 1.7, 1.8, 14.2, 14.5, 14.6_

- [x] 6. Implement Budget Update Mutation
  - Create useUpdateBudget mutation in useBudgetsQuery.ts
  - Update budget with provided fields
  - Implement optimistic update: update budget in cache immediately
  - Rollback cache on error
  - Show success toast on completion
  - Show error toast on failure
  - _Requirements: 14.3, 14.5_

- [x] 7. Implement Budget Delete Mutation
  - Create useDeleteBudget mutation in useBudgetsQuery.ts
  - Delete budget by ID from database
  - Implement optimistic update: remove budget from cache immediately
  - Invalidate budget_transactions query (cascade delete)
  - Rollback cache on error
  - Show success toast on completion
  - Show error toast on failure
  - _Requirements: 14.4, 14.5_

- [x] 8. Implement useBudgetTransactionsQuery Hook
  - Create useBudgetTransactionsQuery in useBudgetsQuery.ts
  - Accept optional budgetId parameter for filtering
  - Set up useQuery with key ["budget_transactions", userId, budgetId]
  - Order transactions by transaction_date descending
  - Configure staleTime: 5 minutes, gcTime: 10 minutes
  - Return data, isLoading, error states
  - _Requirements: 14.1, 14.8_

- [x] 9. Implement Transaction Creation Mutation
  - Create useCreateTransaction mutation in useBudgetsQuery.ts
  - Insert transaction with user_id, amount, description, category, transaction_date, budget_id (nullable)
  - If budget_id is provided, call update_budget_spent RPC with amount
  - Implement optimistic update: add transaction to cache and update budget spent
  - Invalidate budgets query to refresh spent amounts
  - Show success toast ("Transaction added" or "Quick expense recorded")
  - Show error toast and rollback on failure
  - _Requirements: 2.1, 2.4, 2.6, 3.4, 14.3, 14.5, 14.7_

- [x] 10. Implement Transaction Update Mutation
  - Create useUpdateTransaction mutation in useBudgetsQuery.ts
  - Accept id, updates, oldBudgetId, oldAmount parameters
  - Update transaction with provided fields
  - If oldBudgetId exists, call update_budget_spent with -oldAmount
  - If newBudgetId exists, call update_budget_spent with newAmount
  - Implement optimistic update: update transaction in cache
  - Invalidate budgets and transactions queries
  - Show success toast on completion
  - Show error toast and rollback on failure
  - _Requirements: 2.4, 2.8, 14.3, 14.5_

- [x] 11. Implement Transaction Delete Mutation
  - Create useDeleteTransaction mutation in useBudgetsQuery.ts
  - Accept id, budgetId, amount parameters
  - Delete transaction by ID from database
  - If budgetId exists, call update_budget_spent with -amount
  - Implement optimistic update: remove transaction from cache and update budget spent
  - Invalidate budgets query to refresh spent amounts
  - Show success toast on completion
  - Show error toast on failure
  - _Requirements: 2.8, 14.4, 14.5_

- [x] 12. Implement useAnalyticsQuery Hook
  - Create useAnalyticsQuery in useBudgetsQuery.ts
  - Accept startDate and endDate parameters
  - Set up useQuery with key ["analytics", userId, startDate, endDate]
  - Fetch transactions within date range
  - Fetch all budgets for comparison
  - Calculate totalSpent, transactionCount, averageTransaction
  - Calculate categoryBreakdown with amounts, counts, percentages
  - Calculate dailySpending array with date, amount, count
  - Calculate topExpenses (top 10 by amount)
  - Calculate budgetedVsActual with budgeted, actual, standalone amounts
  - Configure staleTime: 5 minutes, gcTime: 10 minutes
  - Use placeholderData to keep previous data while loading
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 13. Implement useBudgetFiltering Hook
  - Create `src/hooks/useBudgetFiltering.ts` file
  - Accept budgets, filter, sortBy, searchTerm, selectedCategory as parameters
  - Use useMemo for filtered budgets: apply status filter, category filter, and search filter
  - Search should check name (case-insensitive, trimmed)
  - Status filter: "all" (no filter), "active" (current date between start/end), "completed" (current date > end_date), "over_budget" (spent > amount)
  - Use useMemo for sorted budgets: sort by newest, oldest, name, amount, spent
  - For newest/oldest: sort by created_at
  - For name: sort alphabetically
  - For amount/spent: sort numerically descending
  - Return sortedBudgets
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.7, 8.8_

- [x] 14. Implement useTransactionFiltering Hook
  - Create `src/hooks/useTransactionFiltering.ts` file
  - Accept transactions, searchTerm, category, budgetId, dateRange as parameters
  - Use useMemo for filtered transactions: apply all filters with AND logic
  - Search should check description (case-insensitive, trimmed)
  - Category filter: match category field
  - Budget filter: match budget_id field
  - Date range filter: match transaction_date between start and end
  - Add 300ms debounce for search input
  - Return filteredTransactions
  - _Requirements: 8.5, 8.6, 8.7, 8.8_

- [x] 15. Implement Currency Context and Hook
  - Create `src/contexts/CurrencyContext.tsx` file
  - Create CurrencyProvider component
  - Maintain currency state (default: USD)
  - Load currency from localStorage on mount
  - Persist currency to localStorage on change
  - Provide setCurrency method
  - [ ] **FIX NEEDED**: Implement formatAmount using Intl.NumberFormat instead of string concatenation
  - [ ] **FIX NEEDED**: Use proper locale and currency code for formatting
  - [ ] **FIX NEEDED**: Ensure 2 decimal places (minimumFractionDigits: 2, maximumFractionDigits: 2)
  - [ ] **FIX NEEDED**: Let Intl.NumberFormat handle symbol placement based on currency conventions
  - Create `src/hooks/useCurrency.ts` file
  - Export useCurrency hook that returns context
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

## Phase 3: Main Budget Page

- [x] 16. Create Budget Page Structure
  - Create `src/pages/Budget.tsx` file
  - Import all necessary hooks, components, and assets
  - Set up state for activeTab, currentView, selectedBudget
  - Set up state for modals: showBudgetForm, showTransactionForm, showQuickExpense, selectedDate
  - Set up state for editing: editingBudget, editingTransaction
  - Set up state for deletion: budgetToDelete, transactionToDelete
  - Set up state for filters: searchTerm, filter, sortBy, selectedCategory
  - Initialize all hooks: useBudgetsQuery, useBudgetTransactionsQuery, useBudgetFiltering, useCurrency, useTheme
  - _Requirements: 4.1, 15.1_

- [x] 17. Implement URL State Synchronization
  - Use useSearchParams to read tab and budget from URL
  - Initialize activeTab from URL tab parameter (default: "budgets")
  - Implement handleTabChange to update activeTab and URL with replace mode
  - Generate budget slug from name (lowercase, replace spaces with hyphens)
  - On budget click: update URL with budget slug
  - On page load: restore budget from URL slug
  - Implement handleBackToList to clear budget from URL
  - Use useEffect to sync URL parameters with state on mount
  - _Requirements: 4.8, 5.7, 5.8, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [x] 18. Create Tab Navigation with Animated Indicator
  - Create refs for each tab button (budgets, expenses, calendar, analytics, insights) and tabs container
  - Calculate tab position (left, width, top, height) based on active tab
  - Use useEffect to update position when activeTab changes
  - Use useEffect to recalculate position when Halloween mode changes
  - Create motion.div for sliding background indicator
  - Animate indicator position with smooth transitions
  - Apply theme-aware colors to indicator (teal for Halloween, tab-specific otherwise)
  - Add glowing shadow animation for Halloween mode
  - Handle window resize with debounced position recalculation
  - _Requirements: 4.1, 4.7, 13.4_

- [x] 19. Create Header Section with Decorations
  - Display "Budget Tracker" title with theme-aware color
  - Show view-specific description text (changes based on currentView and activeTab)
  - Add "New Budget" button with Plus icon (desktop)
  - Add "Add Transaction" button with Plus icon (desktop)
  - Add "Quick Expense" button with Plus icon (desktop)
  - Show buttons below description on mobile
  - Apply theme-aware styling to buttons
  - Add Halloween decorations: witch background, bat, pumpkin, spider, ghost, web
  - Animate decorations (flying bat, peeking pumpkin, hanging spider, appearing ghost)
  - Position decorations with absolute positioning and z-index layering
  - _Requirements: 4.1, 13.2, 13.5_

- [x] 20. Implement Loading State
  - Check if loading is true and budgets array is empty
  - Display skeleton loaders for header, stats cards, tabs, and content
  - Use tab-specific skeletons: BudgetsTabSkeleton, ExpensesTabSkeleton, CalendarTabSkeleton, AnalyticsTabSkeleton
  - Wrap in motion.div with fade-in animation
  - _Requirements: (loading states)_

- [x] 21. Implement Tab Content Rendering
  - Use conditional rendering based on activeTab
  - For "budgets" view: render BudgetStats, BudgetFilters, budget cards grid or budget detail view
  - For "expenses" view: render TransactionFilters, TransactionList
  - For "calendar" view: render BudgetCalendar
  - For "analytics" view: render BudgetAnalytics
  - For "insights" view: render FinancialInsightsCard and FinancialHorrorCard (if Halloween mode)
  - Pass appropriate props and callbacks to each component
  - Handle currentView state for list vs detail view
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 22. Implement Budget Detail View
  - Check if currentView === "detail" and selectedBudget exists
  - Display budget header with name, description, color indicator
  - Show amount, spent, remaining with formatted currency
  - Display progress bar with percentage
  - Show date range (start_date to end_date)
  - Display category and period badges
  - List all transactions associated with budget (filter by budget_id)
  - Add "Add Transaction" button that pre-selects the budget
  - Add "Edit" button that opens BudgetModal in edit mode
  - Add "Delete" button that shows confirmation modal
  - Add "Back" button that returns to list view
  - Apply status colors: green (< 75%), yellow (75-100%), red (> 100%)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

## Phase 4: Budget Components

- [x] 23. Create BudgetStats Component
  - Create `src/components/budget/BudgetStats.tsx` file
  - Calculate Total Budget: sum of all budget amounts
  - Calculate Total Spent: sum of all transaction amounts
  - Calculate Remaining: Total Budget - Total Spent
  - Calculate Active Budgets: count budgets where current date is between start_date and end_date
  - Display statistics in grid of glass cards (2 columns mobile, 4 columns desktop)
  - Use icons: Wallet (Total Budget), DollarSign (Total Spent), Sparkles (Remaining), FileText (Active Budgets)
  - Apply color coding: green for positive remaining, red for negative remaining
  - Apply theme-aware colors (teal for Halloween mode)
  - Format all amounts with currency using formatAmount
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 13.3_

- [x] 24. Create BudgetFilters Component
  - Create `src/components/budget/BudgetFilters.tsx` file
  - Add search input with Search icon
  - Add status filter dropdown (All, Active, Completed, Over Budget)
  - Add category filter dropdown (All, Food, Transport, Entertainment, etc.)
  - Add sort dropdown (Newest, Oldest, Name, Amount, Spent)
  - Call appropriate onChange handlers when filters change
  - Apply theme-aware styling to all inputs and dropdowns
  - Make responsive for mobile devices
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 25. Create BudgetCard Component
  - Create `src/components/budget/BudgetCard.tsx` file
  - Display budget name and description (truncated)
  - Display amount and spent with formatted currency
  - Calculate and display remaining amount
  - Calculate percentage used: (spent / amount) × 100
  - Add progress bar showing percentage (visual indicator)
  - Display category badge with icon
  - Display period badge (Weekly, Monthly, Quarterly, Yearly)
  - Add color indicator (left border using budget.color)
  - Add click handler to call onClick with budget
  - Add dropdown menu with Edit and Delete options
  - Apply status colors: green (< 75%), yellow (75-100%), red (> 100%)
  - Add Halloween decorations (pumpkin, spider) when isHalloweenMode
  - Apply theme-aware styling with glass card effect
  - _Requirements: 4.2_

- [x] 26. Create BudgetModal Component
  - Create `src/components/budget/BudgetModal.tsx` file
  - Use Modal component as base
  - Add name input field (required, validated)
  - Add amount input field (required, > 0, number type)
  - Add category select dropdown (9 categories)
  - Add period select dropdown (weekly, monthly, quarterly, yearly)
  - Add start date picker (required, date type)
  - Add end date picker (required, must be after start date)
  - Add color picker for visual identification (default: #8B5CF6)
  - Add description textarea (optional)
  - Use React Hook Form for form management
  - Add validation: name required, amount > 0, end_date > start_date
  - Display inline error messages below fields
  - Handle create mode: call onSubmit with new budget data
  - Handle edit mode: pre-fill fields with budget data, call onSubmit with updates
  - Show success toast on submit
  - Close modal on success
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8_

## Phase 5: Transaction Components

- [x] 27. Create TransactionList Component
  - Create `src/components/budget/TransactionList.tsx` file
  - Use Virtuoso component for virtualized scrolling
  - Pass transactions as data prop
  - Group transactions by date (optional, use date headers)
  - Render transaction items with: amount, description, category badge, date, budget name (if associated)
  - Add edit button (pencil icon) that calls onEdit
  - Add delete button (trash icon) that calls onDelete
  - Format amount with currency using formatAmount
  - Display category icon and color
  - Apply theme-aware styling
  - Show empty state when no transactions
  - _Requirements: 4.3_

- [x] 28. Create TransactionModal Component
  - Create `src/components/budget/TransactionModal.tsx` file
  - Use Modal component as base
  - Add amount input field (required, > 0, number type)
  - Add description input field (required, validated)
  - Add category select dropdown (9 categories, required)
  - Add transaction date picker (required, date type)
  - Add budget selector dropdown (optional, shows all budgets)
  - Use React Hook Form for form management
  - Add validation: amount > 0, description required, category required, date required
  - Display inline error messages below fields
  - Handle create mode: call onSubmit with new transaction data
  - Handle edit mode: pre-fill fields with transaction data, call onSubmit with updates
  - Show success toast on submit
  - Close modal on success
  - _Requirements: 2.1, 2.2, 2.3, 2.7_

- [x] 29. Create QuickExpenseModal Component
  - Create `src/components/budget/QuickExpenseModal.tsx` file
  - Use Modal component as base
  - Add amount input field (required, > 0, number type)
  - Add description input field (required, validated)
  - Default category to "other" (hidden from user)
  - Default date to today (hidden from user)
  - Set budget_id to null (standalone transaction)
  - Use React Hook Form for form management
  - Add validation: amount > 0, description required
  - Display inline error messages below fields
  - On submit: call onSubmit with { amount, description, category: "other", transaction_date: today, budget_id: null }
  - Show success toast: "Quick expense recorded!"
  - Close modal on success
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 30. Create TransactionFilters Component
  - Create `src/components/budget/TransactionFilters.tsx` file
  - Add search input with Search icon (filters by description)
  - Add date range picker (start date and end date inputs)
  - Add category filter dropdown (All, Food, Transport, etc.)
  - Add budget filter dropdown (All, budget names, Standalone)
  - Call appropriate onChange handlers when filters change
  - Apply theme-aware styling to all inputs and dropdowns
  - Make responsive for mobile devices
  - _Requirements: 8.5, 8.6_

## Phase 6: Calendar View

- [x] 31. Create BudgetCalendar Component
  - Create `src/components/budget/BudgetCalendar.tsx` file
  - Use react-day-picker library for monthly calendar view
  - Group transactions by transaction_date
  - Display transaction amounts on each date
  - Calculate total spending for each day
  - Color-code transaction indicators by category
  - Highlight current date with distinct styling
  - Add navigation buttons for previous/next month
  - Add click handler for dates to show day transactions modal
  - Display day modal with: selected date, list of transactions, total spent
  - Allow editing transactions from day modal
  - Allow deleting transactions from day modal
  - Apply theme-aware styling to calendar
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

## Phase 7: Analytics View

- [x] 32. Create BudgetAnalytics Component
  - Create `src/components/budget/BudgetAnalytics.tsx` file
  - Add date range filter dropdown (Last 7 days, Last 30 days, Last 60 days, Last 90 days, This month, Custom)
  - Add custom date range picker (start and end date inputs)
  - Use useAnalyticsQuery hook with selected date range
  - Display summary statistics: Total Spent, Transaction Count, Average Transaction
  - Create pie chart for category breakdown using Recharts
  - Create line chart for daily spending trend using Recharts
  - Create bar chart for budgeted vs actual comparison using Recharts
  - Display top expenses list (top 10 transactions by amount)
  - Add chart legends with category names and colors
  - Use theme-aware colors for charts (teal for Halloween mode)
  - Make responsive for mobile devices (stack charts vertically)
  - Show loading state while fetching analytics data
  - Show empty state when no data available
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

## Phase 8: AI Insights

- [x] 33. Create useFinancialInsights Hook
  - Create `src/hooks/budget/useFinancialInsights.ts` file
  - Install @google/generative-ai package (if not already installed)
  - Create Gemini API client using VITE_GEMINI_API_KEY
  - Build analysis prompt with budgets and transactions data
  - Request spending patterns analysis
  - Request overspending categories identification
  - Request budget adjustment suggestions
  - Request savings tips
  - Parse AI response into structured format
  - Handle errors: return error message
  - Handle loading states: return isLoading boolean
  - Use useMemo to prevent unnecessary API calls
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 34. Create FinancialInsightsCard Component
  - Create `src/components/budget/FinancialInsightsCard.tsx` file
  - Use GlassCard component as base
  - Call useFinancialInsights hook with budgets and transactions
  - Display AI-generated insights in readable format
  - Show spending patterns analysis section
  - Show overspending categories section
  - Show budget recommendations section
  - Show savings tips section
  - Add loading state with skeleton loaders
  - Add error state with retry button
  - Update when spending data changes (use useEffect with dependencies)
  - Apply theme-aware styling
  - _Requirements: 11.1, 11.2, 11.6, 11.7_

- [x] 35. Create FinancialHorrorCard Component (Halloween)
  - Create `src/components/budget/FinancialHorrorCard.tsx` file
  - Use GlassCard component as base
  - Only render when isHalloweenMode is true
  - Identify budgets over 80% spent or exceeding amount
  - Create spooky warnings with Halloween-themed language ("Your budget is haunted!", "Beware of overspending!")
  - Show overspent amount or percentage for each budget
  - Add ghost/pumpkin/skull icons
  - Use teal color scheme (#60c9b6) for accents
  - Add Halloween decorations (spider web, bat)
  - Add animations (pulse, float, glow)
  - Display "No financial horrors!" message when all budgets are healthy
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

## Phase 9: Currency Support

- [x] 36. Add Currency Selector to Budget Page
  - Add currency dropdown to Budget page header (desktop and mobile)
  - Use Dropdown component from UI library
  - List all currencies from CURRENCIES constant
  - Display currency code, symbol, and name for each option
  - Show current currency symbol in dropdown trigger
  - On selection: call setCurrency with selected currency
  - Verify all amounts update immediately after currency change
  - Apply theme-aware styling to dropdown
  - _Requirements: 6.1, 6.2, 6.3, 6.6_

- [x] 37. Currency Formatting Implementation
  - Currency formatting uses simple string concatenation (intentional design choice)
  - formatAmount method in CurrencyContext uses `${currency.symbol}${amount.toFixed(decimals)}`
  - This approach provides consistent, predictable formatting across all currencies
  - Symbol always appears before the amount
  - Decimal places are configurable (default 0, can specify 2 for currency)
  - _Requirements: 6.3, 6.4, 6.6_

## Phase 10: Testing and Polish

- [x] 38. Test Budget CRUD Operations
  - Test creating budget with all fields
  - Test creating budget with only required fields (name, amount, category, period, dates)
  - Test updating budget fields
  - Test deleting budget with confirmation
  - Verify optimistic updates work correctly
  - Verify rollback on error
  - Verify toast notifications appear
  - Verify spent amount initializes to 0
  - _Requirements: 1.1, 1.6, 1.7, 1.8, 14.2, 14.3, 14.4, 14.5_
