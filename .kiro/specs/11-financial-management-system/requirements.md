# Requirements Document

## Introduction

This document specifies the requirements for implementing a comprehensive Financial Management System for Integral. This is a complete overhaul of the existing budget system (Feature #04), transforming it into a full-featured personal finance platform. The system includes multi-account management, balance sheet tracking with assets and liabilities, enhanced category system with subcategories, recurring transaction automation, financial goals with contribution tracking, net worth history visualization, and advanced analytics. The design prioritizes professional financial management capabilities while maintaining the intuitive user experience and Halloween theme support that users expect from Integral.

## Glossary

- **Finance Account**: A financial account (bank, cash, credit card, digital wallet, investment, savings) with balance tracking
- **Liability**: A debt or financial obligation (loan, credit card, mortgage) with interest rate and payment tracking
- **Balance Sheet**: Financial statement showing total assets, total liabilities, and net worth
- **Net Worth**: Total assets minus total liabilities
- **Net Worth Snapshot**: Historical record of net worth at a specific date for trend analysis
- **Category**: Classification for transactions (expense, income, goal) with icon, color, and optional budget limit
- **Subcategory**: Child category under a parent category for detailed classification
- **System Category**: Pre-defined category that cannot be deleted (can be deactivated)
- **User Category**: Custom category created by the user
- **Recurring Transaction**: Automated transaction that repeats at specified intervals (daily, weekly, monthly, yearly)
- **Financial Goal**: Savings target with target amount, current amount, and optional target date
- **Goal Contribution**: Individual contribution to a financial goal with source tracking
- **Transaction Type**: Classification of transaction flow (expense, income, transfer)
- **Transfer**: Transaction that moves money between two accounts
- **Account Balance**: Current amount in an account, automatically updated by transactions
- **Breakdown Card**: Visual component showing asset or liability composition with charts
- **Category Drill-Down**: Ability to view subcategories when clicking a parent category in analytics
- **Integral**: The productivity suite application

## Requirements

### Requirement 1: Multi-Account Management

**User Story:** As a user, I want to manage multiple financial accounts with different types and currencies, so that I can track all my money in one place.

#### Acceptance Criteria

1. WHEN a user clicks "Add Account", THE **Integral** application SHALL display an account creation modal
2. THE account modal SHALL require name, type, initial balance, icon, and color fields
3. THE account modal SHALL support types: cash, bank, credit_card, digital_wallet, investment, savings
4. THE account modal SHALL provide currency selection from 150+ global currencies
5. THE account modal SHALL provide an "Include in Total" checkbox to exclude accounts from net worth calculation
6. THE account modal SHALL support optional notes field for additional information
7. WHEN a user submits the form, THE **Integral** application SHALL create the **Finance Account** with balance equal to initial_balance
8. THE **Integral** application SHALL display accounts grouped by type in the Accounts tab
9. THE **Integral** application SHALL show account balance, type, and icon on each **Account Card**
10. WHEN a user edits an account, THE **Integral** application SHALL preserve transaction history and update account details
11. WHEN a user deletes an account, THE **Integral** application SHALL show confirmation modal warning about transaction impact
12. THE **Integral** application SHALL use optimistic updates for instant UI feedback

### Requirement 2: Enhanced Transaction System

**User Story:** As a user, I want to create transactions with account tracking and transfer support, so that I can accurately track money flow between accounts.

#### Acceptance Criteria

1. THE transaction modal SHALL provide three type options: Expense, Income, Transfer
2. WHEN type is Expense or Income, THE transaction modal SHALL require account, amount, description, category, and date
3. WHEN type is Transfer, THE transaction modal SHALL require from_account, to_account, amount, description, and date
4. THE transaction modal SHALL hide category field for transfers
5. THE transaction modal SHALL prevent selecting the same account for both from and to in transfers
6. WHEN a user creates an expense, THE **Integral** application SHALL decrement the account balance
7. WHEN a user creates an income, THE **Integral** application SHALL increment the account balance
8. WHEN a user creates a transfer, THE **Integral** application SHALL decrement from_account and increment to_account
9. THE **Integral** application SHALL store account_id, category_id, type, and to_account_id in budget_transactions table
10. THE **Integral** application SHALL display transaction type icon (ArrowUpRight for income, ArrowDownLeft for expense, ArrowRight for transfer)
11. THE **Integral** application SHALL show account names in transaction list with transfer arrow for transfers
12. WHEN a transaction is deleted, THE **Integral** application SHALL reverse the account balance changes
13. WHEN a transaction is edited, THE **Integral** application SHALL revert old balance changes and apply new ones

### Requirement 3: Category Management System

**User Story:** As a user, I want to create and organize categories with subcategories, so that I can classify transactions in detail.

#### Acceptance Criteria

1. WHEN a user navigates to Categories tab, THE **Integral** application SHALL display three sections: Expense, Income, Goal
2. THE **Integral** application SHALL provide "Add Category" button for each section
3. THE category modal SHALL require name, type, icon, and color fields
4. THE category modal SHALL provide optional parent category dropdown for creating subcategories
5. THE category modal SHALL provide optional budget limit field for monthly spending limits
6. THE category modal SHALL support category types: expense, income, goal
7. THE **Integral** application SHALL create default system categories on user registration
8. THE **Integral** application SHALL display system categories with "System" badge
9. THE **Integral** application SHALL prevent deletion of system categories (allow deactivation only)
10. THE **Integral** application SHALL display categories in grid layout with icon, name, and color
11. THE **Integral** application SHALL show subcategories indented under parent categories
12. THE **Integral** application SHALL provide "Manage" toggle button to show edit/delete actions
13. WHEN Manage mode is active, THE **Integral** application SHALL display edit and delete icons on user categories
14. THE **Integral** application SHALL use CategoryPicker component with search and system category toggle
15. THE **Integral** application SHALL support category drill-down in analytics (clicking parent shows subcategories)

### Requirement 4: Recurring Transaction Automation

**User Story:** As a user, I want to set up recurring transactions for bills and income, so that I don't have to manually enter repetitive transactions.

#### Acceptance Criteria

1. WHEN a user navigates to Recurring tab, THE **Integral** application SHALL display all recurring rules
2. THE **Integral** application SHALL provide "Add Rule" button to create recurring transactions
3. THE recurring modal SHALL require description, amount, type, account, interval, and start date
4. THE recurring modal SHALL support intervals: daily, weekly, monthly, yearly
5. THE recurring modal SHALL support types: expense, income, transfer
6. WHEN type is transfer, THE recurring modal SHALL require to_account field
7. THE recurring modal SHALL provide optional category selection for expense/income
8. THE recurring modal SHALL calculate next_run_date based on interval and start_date
9. THE **Integral** application SHALL display recurring rules as cards showing description, amount, interval, and next payment date
10. THE **Integral** application SHALL show active/inactive status with toggle button
11. WHEN a recurring rule is due (next_run_date <= today), THE **Integral** application SHALL automatically create a transaction
12. WHEN a transaction is created from recurring rule, THE **Integral** application SHALL update next_run_date and last_run_date
13. THE **Integral** application SHALL mark created transactions with is_recurring flag and recurring_id reference
14. THE **Integral** application SHALL display "Recurring" badge on transactions created from rules
15. THE **Integral** application SHALL process due recurring transactions on app mount
16. WHEN a user edits a recurring rule, THE **Integral** application SHALL not affect past transactions
17. WHEN a user deletes a recurring rule, THE **Integral** application SHALL show confirmation and preserve past transactions

### Requirement 5: Financial Goals with Contributions

**User Story:** As a user, I want to set savings goals and track contributions, so that I can work towards financial targets.

#### Acceptance Criteria

1. THE **Integral** application SHALL display goals in the Accounts tab below accounts section
2. THE **Integral** application SHALL provide "Add Goal" button to create financial goals
3. THE goal modal SHALL require name, target amount, icon, and color fields
4. THE goal modal SHALL provide optional description, current amount, target date, linked account, and category fields
5. WHEN a user creates a goal, THE **Integral** application SHALL initialize current_amount to 0 or specified value
6. THE **Integral** application SHALL display goals as cards showing name, progress bar, current/target amounts, and target date
7. THE **Integral** application SHALL calculate progress percentage as (current_amount / target_amount) \* 100
8. THE **Integral** application SHALL show days remaining if target_date is set
9. THE **Integral** application SHALL highlight goals with <30 days remaining in orange
10. WHEN a user clicks "Add Contribution" on a goal card, THE **Integral** application SHALL display contribution modal
11. THE contribution modal SHALL require amount and date fields
12. THE contribution modal SHALL provide optional source category and source account fields
13. WHEN a contribution is created, THE **Integral** application SHALL increment goal's current_amount automatically via trigger
14. WHEN a contribution is deleted, THE **Integral** application SHALL decrement goal's current_amount automatically via trigger
15. THE **Integral** application SHALL link goals to categories for better organization
16. THE **Integral** application SHALL display category badge on goal cards if linked
17. WHEN a goal is linked to an account, THE **Integral** application SHALL optionally auto-track account balance changes

### Requirement 6: Balance Sheet and Net Worth Tracking

**User Story:** As a user, I want to see my complete financial picture with assets and liabilities, so that I can understand my net worth.

#### Acceptance Criteria

1. WHEN a user navigates to Balance Sheet tab, THE **Integral** application SHALL display net worth summary card
2. THE net worth card SHALL show: Net Worth = Total Assets - Total Liabilities
3. THE net worth card SHALL display total assets and total liabilities with subtraction visualization
4. THE **Integral** application SHALL calculate total assets by summing all accounts where include_in_total is true
5. THE **Integral** application SHALL calculate total liabilities by summing all active liabilities
6. THE **Integral** application SHALL display net worth in green if positive, red if negative
7. THE **Integral** application SHALL show Net Worth History chart below summary
8. THE net worth chart SHALL display line graph of net worth over time using snapshots
9. THE **Integral** application SHALL provide "Add Liability" button to track debts
10. THE liability modal SHALL require name, type, amount, icon, and color fields
11. THE liability modal SHALL support types: loan, credit_card, mortgage, other (with custom type input)
12. THE liability modal SHALL provide optional interest rate, due date, minimum payment, and notes fields
13. THE **Integral** application SHALL display liabilities as cards showing name, amount, interest rate, and due date
14. THE **Integral** application SHALL show "All Accounts" section with account cards
15. THE **Integral** application SHALL show "All Liabilities" section with liability cards
16. THE **Integral** application SHALL display two **Breakdown Cards**: Assets Breakdown and Liabilities Breakdown
17. EACH breakdown card SHALL show: pie chart, bar chart of history, list of top items with percentages
18. THE **Integral** application SHALL create net worth snapshots automatically (daily/weekly)
19. THE **Integral** application SHALL allow manual snapshot creation for tracking milestones

### Requirement 7: Advanced Analytics with Drill-Down

**User Story:** As a user, I want detailed analytics with the ability to drill into subcategories, so that I can understand spending patterns in depth.

#### Acceptance Criteria

1. THE Analytics tab SHALL display enhanced category breakdown with drill-down support
2. WHEN a user clicks a parent category in the pie chart, THE **Integral** application SHALL filter to show only subcategories
3. THE **Integral** application SHALL display breadcrumb navigation showing "All Categories" or parent category name
4. THE **Integral** application SHALL provide "Back to All Categories" button when drilled down
5. THE Analytics tab SHALL use category colors from finance_categories table
6. THE Analytics tab SHALL display category icons in the breakdown list
7. THE Analytics tab SHALL show spending by account in addition to category breakdown
8. THE Analytics tab SHALL display income vs expense comparison chart
9. THE Analytics tab SHALL show monthly recurring cost summary
10. THE Analytics tab SHALL calculate average transaction amount by type (expense/income)
11. THE Analytics tab SHALL filter analytics by date range (week, month, 30/60/90 days, custom)
12. THE Analytics tab SHALL exclude transfers from expense/income calculations
13. THE Analytics tab SHALL use consistent color scheme: expenses (red), income (green), transfers (blue)

### Requirement 8: Enhanced Budget Stats Dashboard

**User Story:** As a user, I want to see comprehensive financial statistics at a glance, so that I can quickly assess my financial health.

#### Acceptance Criteria

1. THE **Integral** application SHALL display five statistics cards: Net Worth, Monthly Income, Monthly Expenses, Budget Progress, Recurring Rules
2. THE Net Worth card SHALL show current net worth and total assets subtitle
3. THE Monthly Income card SHALL sum all income transactions for current month
4. THE Monthly Expenses card SHALL sum all expense transactions for current month
5. THE Budget Progress card SHALL show total spent of total budgeted with progress visualization
6. THE Recurring Rules card SHALL show count of active rules and estimated monthly cost
7. THE statistics cards SHALL use appropriate icons: Wallet, ArrowUpRight, ArrowDownLeft, PieChart, Repeat
8. THE statistics cards SHALL use theme-aware colors (teal for Halloween mode)
9. THE statistics cards SHALL display subtitles with additional context
10. THE statistics cards SHALL animate on hover with scale effect
11. THE statistics cards SHALL be responsive: 2 columns on mobile, 5 columns on desktop

### Requirement 9: Multi-Currency Support Enhancement

**User Story:** As a user, I want comprehensive currency support with proper formatting, so that I can manage finances in any currency worldwide.

#### Acceptance Criteria

1. THE **Integral** application SHALL support 150+ global currencies with full metadata
2. EACH currency SHALL include: code, symbol, native symbol, name, plural name, decimal digits, rounding, locale
3. THE **Integral** application SHALL format amounts using currency's symbolPosition (before/after) and spaceBetween rules
4. THE **Integral** application SHALL respect currency's decimalDigits (0 for JPY, 2 for USD, 3 for KWD)
5. THE **Integral** application SHALL use SearchableDropdown for currency selection with search functionality
6. THE currency dropdown SHALL display: "Currency Name (Symbol)" format
7. THE **Integral** application SHALL persist selected currency in CurrencyContext
8. THE **Integral** application SHALL allow different currencies per account
9. THE **Integral** application SHALL display currency symbol with all monetary amounts
10. THE **Integral** application SHALL provide formatAmount helper with options for notation (compact, standard)

### Requirement 10: Database Schema and Migrations

**User Story:** As a developer, I want a robust database schema with proper relationships and triggers, so that data integrity is maintained automatically.

#### Acceptance Criteria

1. THE **Integral** application SHALL create finance_accounts table separate from accounts (credential manager)
2. THE finance_accounts table SHALL include: id, user_id, name, type, icon, color, balance, currency, initial_balance, include_in_total, notes
3. THE liabilities table SHALL include: id, user_id, name, type, icon, color, amount, currency, interest_rate, due_date, minimum_payment, notes, is_active
4. THE finance_categories table SHALL include: id, user_id, name, icon, color, type, parent_id, budget_limit, description, is_active, category_type
5. THE category_type field SHALL replace is_system boolean with enum: 'system', 'user'
6. THE finance_categories table SHALL support types: 'expense', 'income', 'goal'
7. THE recurring_transactions table SHALL include: id, user_id, description, amount, type, category_id, account_id, to_account_id, interval, start_date, next_run_date, last_run_date, active
8. THE financial_goals table SHALL include: id, user_id, name, description, target_amount, current_amount, target_date, linked_account_id, category_id, icon, color, is_active
9. THE goal_contributions table SHALL include: id, user_id, goal_id, amount, category_id, source_account_id, notes, contributed_at
10. THE net_worth_snapshots table SHALL include: id, user_id, date, total_assets, total_liabilities, net_worth, currency
11. THE budget_transactions table SHALL add columns: account_id, category_id, type, to_account_id, tags, is_recurring, recurring_id, balance
12. THE **Integral** application SHALL create trigger update_account_balance() to automatically adjust account balances on transaction insert/update/delete
13. THE **Integral** application SHALL create trigger update_goal_amount_on_contribution() to automatically adjust goal current_amount
14. THE **Integral** application SHALL create unique constraint on net_worth_snapshots(user_id, date)
15. THE **Integral** application SHALL create foreign key constraints with CASCADE delete for user_id
16. THE **Integral** application SHALL create indexes on user_id, type, parent_id, category_id, account_id for performance
17. THE **Integral** application SHALL enable Row Level Security (RLS) on all tables
18. THE **Integral** application SHALL create RLS policies for SELECT, INSERT, UPDATE, DELETE based on auth.uid() = user_id
19. THE **Integral** application SHALL prevent deletion of system categories via RLS policy checking category_type
20. THE **Integral** application SHALL seed default system categories for all users on registration

### Requirement 11: Tab Navigation Enhancement

**User Story:** As a user, I want intuitive navigation between all financial features, so that I can access any function quickly.

#### Acceptance Criteria

1. THE **Integral** application SHALL provide nine tabs: Budgets, Recurring, Accounts, Balance Sheet, Categories, Insights, Expenses, Analytics, Calendar
2. THE Budgets tab SHALL display budget cards with transaction management (existing feature)
3. THE Recurring tab SHALL display recurring transaction rules with add/edit/delete actions
4. THE Accounts tab SHALL display accounts grouped by type and financial goals section
5. THE Balance Sheet tab SHALL display net worth summary, charts, breakdown cards, accounts, and liabilities
6. THE Categories tab SHALL display category management with expense/income/goal sections
7. THE Insights tab SHALL display AI-generated financial insights (existing feature)
8. THE Expenses tab SHALL display transaction list with filters (existing feature)
9. THE Analytics tab SHALL display charts and statistics with drill-down (enhanced)
10. THE Calendar tab SHALL display transaction calendar view (existing feature)
11. THE **Integral** application SHALL use animated tab indicator that slides to active tab
12. THE **Integral** application SHALL update URL with tab query parameter
13. THE **Integral** application SHALL show appropriate action buttons per tab (Add Account, Add Rule, Add Category, Add Liability)
14. THE **Integral** application SHALL use tab-specific icons: List, Repeat, Wallet, BarChart, Tag, Sparkles, FileText, BarChart, Calendar
15. THE **Integral** application SHALL use tab-specific colors in Halloween mode
16. THE **Integral** application SHALL display loading skeletons specific to each tab

### Requirement 12: Component Architecture

**User Story:** As a developer, I want modular, reusable components, so that the codebase is maintainable and consistent.

#### Acceptance Criteria

1. THE **Integral** application SHALL create AccountCard component for displaying account information
2. THE **Integral** application SHALL create AccountModal component for account creation/editing
3. THE **Integral** application SHALL create AccountList component for accounts tab content
4. THE **Integral** application SHALL create LiabilityCard component for displaying liability information
5. THE **Integral** application SHALL create LiabilityModal component for liability creation/editing
6. THE **Integral** application SHALL create GoalCard component for displaying goal information with progress
7. THE **Integral** application SHALL create GoalModal component for goal creation/editing
8. THE **Integral** application SHALL create ContributionModal component for adding goal contributions
9. THE **Integral** application SHALL create CategoryManager component for category management
10. THE **Integral** application SHALL create CategoryModal component for category creation/editing
11. THE **Integral** application SHALL create CategoryPicker component for category selection with search
12. THE **Integral** application SHALL create CategoryBadge component for displaying category with icon and color
13. THE **Integral** application SHALL create RecurringManager component for recurring tab content
14. THE **Integral** application SHALL create RecurringCard component for displaying recurring rules
15. THE **Integral** application SHALL create RecurringModal component for recurring rule creation/editing
16. THE **Integral** application SHALL create BalanceSheetTab component for balance sheet tab content
17. THE **Integral** application SHALL create BreakdownCard component for asset/liability breakdown visualization
18. THE **Integral** application SHALL create NetWorthChart component for net worth history visualization
19. THE **Integral** application SHALL create SearchableDropdown component for currency selection
20. THE **Integral** application SHALL update TransactionModal to support account selection and transfer type
21. THE **Integral** application SHALL update TransactionList to display account names and transaction types
22. THE **Integral** application SHALL update BudgetStats to display five enhanced statistics cards
23. THE **Integral** application SHALL create tab-specific skeleton components for loading states

### Requirement 13: State Management with TanStack Query

**User Story:** As a developer, I want efficient state management with caching and optimistic updates, so that the UI is responsive and data is synchronized.

#### Acceptance Criteria

1. THE **Integral** application SHALL create useAccountsQuery hook with query key ["accounts", userId]
2. THE **Integral** application SHALL create useCreateAccount, useUpdateAccount, useDeleteAccount mutation hooks
3. THE **Integral** application SHALL create useLiabilitiesQuery hook with query key ["liabilities", userId]
4. THE **Integral** application SHALL create useCreateLiability, useUpdateLiability, useDeleteLiability mutation hooks
5. THE **Integral** application SHALL create useCategoriesQuery hook with query key ["categories", userId, type]
6. THE **Integral** application SHALL create useCreateCategory, useUpdateCategory, useDeleteCategory mutation hooks
7. THE **Integral** application SHALL create useRecurringTransactionsQuery hook with query key ["recurring-transactions", userId]
8. THE **Integral** application SHALL create useCreateRecurringTransaction, useUpdateRecurringTransaction, useDeleteRecurringTransaction mutation hooks
9. THE **Integral** application SHALL create useGoalsQuery hook with query key ["financialGoals", userId]
10. THE **Integral** application SHALL create useCreateGoal, useUpdateGoal, useDeleteGoal mutation hooks
11. THE **Integral** application SHALL create useContributionsQuery hook with query key ["contributions", goalId, userId]
12. THE **Integral** application SHALL create useCreateContribution, useDeleteContribution mutation hooks
13. THE **Integral** application SHALL create useNetWorthHistory hook with query key ["netWorthHistory", userId]
14. THE **Integral** application SHALL use optimistic updates for all mutations
15. THE **Integral** application SHALL invalidate related queries on mutation success
16. WHEN account is created/updated/deleted, THE **Integral** application SHALL invalidate ["accounts"] and ["netWorthHistory"]
17. WHEN transaction is created/updated/deleted, THE **Integral** application SHALL invalidate ["accounts"], ["budgets"], ["budget-transactions"]
18. WHEN contribution is created/deleted, THE **Integral** application SHALL invalidate ["contributions"] and ["financialGoals"]
19. THE **Integral** application SHALL configure staleTime: 5 minutes, gcTime: 10 minutes
20. THE **Integral** application SHALL display toast notifications on mutation success/error

### Requirement 14: Recurring Transaction Processing

**User Story:** As a user, I want recurring transactions to be processed automatically, so that I don't miss regular bills or income.

#### Acceptance Criteria

1. THE **Integral** application SHALL create useProcessRecurringTransactions hook
2. THE **Integral** application SHALL call processDueTransactions() on app mount
3. THE processDueTransactions function SHALL query recurring_transactions where active=true AND next_run_date <= today
4. FOR EACH due recurring transaction, THE **Integral** application SHALL create a budget_transaction
5. THE created transaction SHALL include: amount, description, category_id, transaction_date=next_run_date, type, account_id, to_account_id, is_recurring=true, recurring_id
6. AFTER creating transaction, THE **Integral** application SHALL calculate new next_run_date based on interval
7. FOR daily interval, THE **Integral** application SHALL add 1 day to next_run_date
8. FOR weekly interval, THE **Integral** application SHALL add 7 days to next_run_date
9. FOR monthly interval, THE **Integral** application SHALL add 1 month to next_run_date
10. FOR yearly interval, THE **Integral** application SHALL add 1 year to next_run_date
11. THE **Integral** application SHALL update recurring_transaction with new next_run_date and last_run_date
12. THE **Integral** application SHALL display success toast showing count of processed transactions
13. THE **Integral** application SHALL handle errors gracefully and continue processing remaining rules
14. THE **Integral** application SHALL log processing errors to console for debugging

### Requirement 15: Halloween Theme Integration

**User Story:** As a user, I want Halloween theme support across all new financial features, so that the seasonal experience is consistent.

#### Acceptance Criteria

1. WHEN Halloween mode is enabled, THE **Integral** application SHALL use teal accent color (#60c9b6) for all financial components
2. THE account cards SHALL display Halloween decorations (tree, ghost) in corners
3. THE liability cards SHALL display Halloween decorations (pumpkin, ghost) in corners
4. THE goal cards SHALL display Halloween decorations (pumpkin, bat) in corners
5. THE recurring cards SHALL display Halloween decorations (web, bat, cat) in corners
6. THE category cards SHALL use teal color scheme and glow effects
7. THE balance sheet SHALL display Halloween background images with low opacity
8. THE breakdown cards SHALL use teal color for charts and highlights
9. THE net worth chart SHALL use teal gradient fill
10. THE modals SHALL display Halloween decorations (bat, spider, tree) in corners
11. THE empty states SHALL use Halloween-themed messages and imagery
12. THE statistics cards SHALL use teal color and Halloween icons
13. THE tab indicator SHALL glow with teal shadow effects
14. THE action buttons SHALL use teal color scheme
15. THE **Integral** application SHALL use Creepster font for Halloween mode titles
16. THE **Integral** application SHALL animate Halloween decorations with floating/rotating effects
17. WHEN Halloween mode is disabled, THE **Integral** application SHALL revert to standard theme colors
