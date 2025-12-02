# Financial Management System - Implementation Tasks

## Phase 1: Database Schema and Migrations

- [x] 1. Create finance_accounts Table
  - Create table with columns: id, user_id, name, type, icon, color, balance, currency, initial_balance, include_in_total, notes, created_at, updated_at
  - Support account types: cash, bank, credit_card, digital_wallet, investment, savings
  - Add foreign key constraint: user_id → auth.users.id
  - Add indexes on user_id and created_at
  - _Requirements: Req 10 (AC 2)_

- [x] 2. Create liabilities Table
  - Create table with columns: id, user_id, name, type, icon, color, amount, currency, interest_rate, due_date, minimum_payment, notes, is_active, created_at, updated_at
  - Support liability types: loan, credit_card, mortgage, other
  - Add foreign key constraint: user_id → auth.users.id
  - Add indexes on user_id and is_active
  - _Requirements: Req 10 (AC 3)_

- [x] 3. Create finance_categories Table
  - Create table with columns: id, user_id, name, icon, color, type, parent_id, budget_limit, description, is_active, category_type, created_at, updated_at
  - Support category types: expense, income, goal
  - Support category_type enum: system, user
  - Add parent_id for subcategory support
  - Add foreign key constraints and indexes
  - _Requirements: Req 10 (AC 4-6)_

- [x] 4. Create recurring_transactions Table
  - Create table with columns: id, user_id, description, amount, type, category_id, account_id, to_account_id, interval, start_date, next_run_date, last_run_date, active, created_at, updated_at
  - Support intervals: daily, weekly, monthly, yearly
  - Support types: expense, income, transfer
  - Add foreign key constraints and indexes
  - _Requirements: Req 10 (AC 7)_

- [x] 5. Create financial_goals Table
  - Create table with columns: id, user_id, name, description, target_amount, current_amount, target_date, linked_account_id, category_id, icon, color, is_active, created_at, updated_at
  - Add foreign key constraints for linked_account_id and category_id
  - Add indexes on user_id and is_active
  - _Requirements: Req 10 (AC 8)_

- [x] 6. Create goal_contributions Table
  - Create table with columns: id, user_id, goal_id, amount, category_id, source_account_id, notes, contributed_at, created_at, updated_at
  - Add foreign key constraint: goal_id → financial_goals.id with CASCADE delete
  - Add indexes on user_id and goal_id
  - _Requirements: Req 10 (AC 9)_

- [x] 7. Create net_worth_snapshots Table
  - Create table with columns: id, user_id, date, total_assets, total_liabilities, net_worth, currency, created_at
  - Add unique constraint on (user_id, date)
  - Add index on user_id and date
  - _Requirements: Req 10 (AC 10)_

- [x] 8. Enhance budget_transactions Table
  - Add columns: account_id, category_id, type, to_account_id, tags, is_recurring, recurring_id, balance
  - Add foreign key constraints for account_id, category_id, to_account_id, recurring_id
  - Add indexes on new columns
  - _Requirements: Req 10 (AC 11)_

- [x] 9. Create Account Balance Trigger
  - Create trigger function update_account_balance()
  - Automatically adjust account balance on transaction insert/update/delete
  - Handle transfers (decrement from_account, increment to_account)
  - Handle expenses (decrement account)
  - Handle income (increment account)
  - _Requirements: Req 10 (AC 12)_

- [x] 10. Create Goal Contribution Trigger
  - Create trigger function update_goal_amount_on_contribution()
  - Automatically increment goal current_amount on contribution insert
  - Automatically decrement goal current_amount on contribution delete
  - _Requirements: Req 10 (AC 13)_

- [x] 11. Configure Row Level Security
  - Enable RLS on all new tables
  - Create SELECT policy: auth.uid() = user_id
  - Create INSERT policy: auth.uid() = user_id
  - Create UPDATE policy: auth.uid() = user_id
  - Create DELETE policy: auth.uid() = user_id AND category_type != 'system' (for categories)
  - _Requirements: Req 10 (AC 17-19)_

- [x] 12. Seed System Categories
  - Create default system categories on user registration
  - Include expense categories: Groceries, Transportation, Entertainment, etc.
  - Include income categories: Salary, Freelance, Investment, etc.
  - Mark all as category_type: 'system'
  - _Requirements: Req 10 (AC 20)_

## Phase 2: Account Management Components

- [x] 13. Create AccountCard Component
  - Display account icon, name, type, and balance
  - Show currency-formatted balance
  - Add edit/delete dropdown menu
  - Apply Halloween decorations (tree, ghost) when enabled
  - Use theme-aware colors
  - _Requirements: Req 1 (AC 9), Req 12 (AC 1), Req 15 (AC 2)_

- [x] 14. Create AccountModal Component
  - Form fields: name, type, initial_balance, icon, color, currency, include_in_total, notes
  - Support 6 account types with dropdown
  - Icon picker with 100+ icons
  - Color picker with 8 preset colors
  - Currency selector with 150+ currencies
  - Form validation and error handling
  - _Requirements: Req 1 (AC 1-7), Req 12 (AC 2)_

- [x] 15. Create AccountList Component
  - Display accounts grouped by type
  - Show empty state with Halloween theme support
  - Add account button
  - Confirmation modal for deletion
  - _Requirements: Req 1 (AC 8), Req 12 (AC 3)_

- [x] 16. Implement Account CRUD with TanStack Query
  - Create useAccountsQuery hook with query key ["accounts", userId]
  - Create useCreateAccount, useUpdateAccount, useDeleteAccount mutations
  - Implement optimistic updates for instant UI feedback
  - Invalidate related queries on mutation success
  - _Requirements: Req 1 (AC 10-12), Req 13 (AC 1-2, 16)_

## Phase 3: Transaction System Enhancement

- [x] 17. Update TransactionModal for Accounts
  - Add account dropdown for expense/income
  - Add transfer type with from_account and to_account dropdowns
  - Conditional field display based on transaction type
  - Prevent same account selection for transfers
  - _Requirements: Req 2 (AC 1-5), Req 12 (AC 20)_

- [x] 18. Implement Transaction Balance Updates
  - Expense: decrement account balance via trigger
  - Income: increment account balance via trigger
  - Transfer: decrement from_account, increment to_account via trigger
  - Reverse balance changes on transaction delete
  - Revert and apply on transaction edit
  - _Requirements: Req 2 (AC 6-13)_

- [x] 19. Update TransactionList Display
  - Show account names with transaction type icons
  - Display transfer arrows for transfer transactions
  - Show ArrowUpRight for income, ArrowDownLeft for expense, ArrowRight for transfer
  - _Requirements: Req 2 (AC 10-11), Req 12 (AC 21)_

## Phase 4: Category Management System

- [x] 20. Create CategoryManager Component
  - Three sections: Expense, Income, Goal categories
  - Grid layout with category cards
  - System vs User category badges
  - Manage mode toggle for edit/delete actions
  - Add category button per section
  - _Requirements: Req 3 (AC 1-2, 10-13), Req 12 (AC 9)_

- [x] 21. Create CategoryModal Component
  - Form fields: name, type, icon, color, parent_id, budget_limit
  - Parent category dropdown for subcategories
  - Icon picker and color picker
  - Form validation
  - _Requirements: Req 3 (AC 3-6), Req 12 (AC 10)_

- [x] 22. Create CategoryPicker Component
  - Searchable dropdown with real-time filtering
  - System category toggle
  - Display icon and color for each category
  - Grouped by parent categories
  - _Requirements: Req 3 (AC 14), Req 12 (AC 11)_

- [x] 23. Create CategoryBadge Component
  - Display category with icon and color
  - Reusable across cards and lists
  - Theme-aware styling
  - _Requirements: Req 12 (AC 12)_

- [x] 24. Implement System Categories
  - Prevent deletion of system categories (RLS policy)
  - Allow deactivation only
  - Display "System" badge
  - _Requirements: Req 3 (AC 7-9)_

- [x] 25. Implement Category Query Hooks
  - Create useCategoriesQuery with query key ["categories", userId, type]
  - Create useCreateCategory, useUpdateCategory, useDeleteCategory mutations
  - Optimistic updates
  - _Requirements: Req 13 (AC 5-6)_

## Phase 5: Recurring Transaction Automation

- [x] 26. Create RecurringCard Component
  - Display description, amount, interval, next payment date
  - Active/inactive toggle
  - Category and account badges
  - Edit/delete dropdown menu
  - Halloween decorations (web, bat, cat)
  - _Requirements: Req 4 (AC 9-10), Req 12 (AC 14), Req 15 (AC 5)_

- [x] 27. Create RecurringModal Component
  - Form fields: description, amount, type, account, interval, start_date, category
  - Support daily, weekly, monthly, yearly intervals
  - Support expense, income, transfer types
  - Conditional to_account field for transfers
  - Calculate next_run_date based on interval
  - _Requirements: Req 4 (AC 3-8), Req 12 (AC 15)_

- [x] 28. Create RecurringManager Component
  - Display all recurring rules as cards
  - Add rule button
  - Empty states with Halloween theme
  - _Requirements: Req 4 (AC 1-2), Req 12 (AC 13)_

- [x] 29. Implement Recurring Transaction Processing
  - Create useProcessRecurringTransactions hook
  - Query recurring_transactions where active=true AND next_run_date <= today
  - Create budget_transaction for each due rule
  - Calculate new next_run_date based on interval
  - Update recurring_transaction with new next_run_date and last_run_date
  - Mark created transactions with is_recurring flag and recurring_id
  - Process on app mount
  - _Requirements: Req 4 (AC 11-14), Req 14 (AC 1-14)_

- [x] 30. Implement Recurring Query Hooks
  - Create useRecurringTransactionsQuery with query key ["recurring-transactions", userId]
  - Create mutation hooks with optimistic updates
  - _Requirements: Req 13 (AC 7-8)_

## Phase 6: Financial Goals with Contributions

- [x] 31. Create GoalCard Component
  - Display name, icon, color, progress bar
  - Show current/target amounts with currency formatting
  - Calculate progress percentage
  - Show days remaining if target_date set
  - Highlight goals with <30 days remaining
  - Add contribution button
  - Halloween decorations (pumpkin, bat)
  - _Requirements: Req 5 (AC 6-10), Req 12 (AC 6), Req 15 (AC 4)_

- [x] 32. Create GoalModal Component
  - Form fields: name, target_amount, icon, color, description, current_amount, target_date, linked_account, category
  - Form validation
  - _Requirements: Req 5 (AC 3-5), Req 12 (AC 7)_

- [x] 33. Create ContributionModal Component
  - Form fields: amount, date, source_category, source_account
  - Form validation (amount required and positive)
  - _Requirements: Req 5 (AC 10-12), Req 12 (AC 8)_

- [x] 34. Implement Goal Contribution Tracking
  - Automatically update goal current_amount via trigger on contribution create/delete
  - Display category badge on goal cards if linked
  - _Requirements: Req 5 (AC 13-17)_

- [x] 35. Implement Goal Query Hooks
  - Create useGoalsQuery with query key ["financialGoals", userId]
  - Create useContributionsQuery with query key ["contributions", goalId, userId]
  - Create mutation hooks with optimistic updates
  - Invalidate related queries on mutation success
  - _Requirements: Req 13 (AC 9-12, 18)_

## Phase 7: Balance Sheet and Net Worth Tracking

- [x] 36. Create BalanceSheetTab Component
  - Display net worth summary card: Total Assets - Total Liabilities = Net Worth
  - Calculate total assets (accounts with include_in_total=true)
  - Calculate total liabilities (active liabilities)
  - Display in green if positive, red if negative
  - Halloween background images with low opacity
  - _Requirements: Req 6 (AC 1-6), Req 12 (AC 16), Req 15 (AC 7)_

- [x] 37. Create NetWorthChart Component
  - Line graph showing net worth history over time
  - Use net_worth_snapshots data
  - Area chart with gradient fill (teal for Halloween)
  - X-axis: dates, Y-axis: amounts
  - Tooltip with formatted values
  - _Requirements: Req 6 (AC 7-8), Req 12 (AC 18), Req 15 (AC 9)_

- [x] 38. Create LiabilityCard Component
  - Display name, amount, interest rate, due date
  - Show icon and color
  - Edit/delete dropdown menu
  - Halloween decorations (pumpkin, ghost)
  - _Requirements: Req 6 (AC 13), Req 12 (AC 4), Req 15 (AC 3)_

- [x] 39. Create LiabilityModal Component
  - Form fields: name, type, amount, icon, color, interest_rate, due_date, minimum_payment, notes
  - Support types: loan, credit_card, mortgage, other
  - Form validation
  - _Requirements: Req 6 (AC 10-12), Req 12 (AC 5)_

- [x] 40. Create BreakdownCard Component
  - Display pie chart showing composition
  - Display bar chart showing history
  - List top 3 items with percentages
  - Show icon and color per item
  - Separate cards for assets and liabilities
  - _Requirements: Req 6 (AC 16-17), Req 12 (AC 17), Req 15 (AC 8)_

- [x] 41. Implement Net Worth Snapshot Creation
  - Automatically create snapshots (daily/weekly)
  - Support manual snapshot creation
  - Store total_assets, total_liabilities, net_worth, currency
  - _Requirements: Req 6 (AC 18-19)_

- [x] 42. Implement Liability Query Hooks
  - Create useLiabilitiesQuery with query key ["liabilities", userId]
  - Create mutation hooks with optimistic updates
  - Create useNetWorthHistory hook with query key ["netWorthHistory", userId]
  - _Requirements: Req 13 (AC 3-4, 13, 16)_

## Phase 8: Advanced Analytics with Drill-Down

- [x] 43. Implement Category Drill-Down
  - Click parent category in pie chart to filter subcategories
  - Display breadcrumb navigation
  - "Back to All Categories" button when drilled down
  - Filter displayedCategoryBreakdown based on selectedParentCategory
  - _Requirements: Req 7 (AC 1-4)_

- [x] 44. Use Category Colors in Analytics
  - Display category colors from finance_categories table
  - Display category icons in breakdown list
  - Use consistent color scheme: expenses (red), income (green), transfers (blue)
  - _Requirements: Req 7 (AC 5-6, 13)_

- [x] 45. Add Enhanced Analytics Charts
  - Spending by account chart
  - Income vs expense comparison chart
  - Monthly recurring cost summary
  - Average transaction amount by type
  - _Requirements: Req 7 (AC 7-10)_

- [x] 46. Implement Date Range Filtering
  - Filter options: week, month, 30/60/90 days, custom range
  - Update analytics based on selected range
  - _Requirements: Req 7 (AC 11)_

- [x] 47. Exclude Transfers from Calculations
  - Don't count transfers as expenses or income in analytics
  - Filter by type !== 'transfer'
  - _Requirements: Req 7 (AC 12)_

## Phase 9: Enhanced Budget Stats Dashboard

- [x] 48. Update BudgetStats Component
  - Display 5 statistics cards: Net Worth, Monthly Income, Monthly Expenses, Budget Progress, Recurring Rules
  - Net Worth card: show current net worth with total assets subtitle
  - Monthly Income card: sum income transactions for current month
  - Monthly Expenses card: sum expense transactions for current month
  - Budget Progress card: show total spent of total budgeted
  - Recurring Rules card: show count of active rules and estimated monthly cost
  - Use appropriate icons: Wallet, ArrowUpRight, ArrowDownLeft, PieChart, Repeat
  - Apply theme-aware colors (teal for Halloween)
  - _Requirements: Req 8 (AC 1-11), Req 12 (AC 22), Req 15 (AC 12)_

## Phase 10: Multi-Currency Support

- [x] 49. Create Currency Data Structure
  - Define 150+ currencies with code, symbol, native symbol, name, plural name, decimal digits, rounding, locale
  - Include symbolPosition (before/after) and spaceBetween rules
  - _Requirements: Req 9 (AC 1-2)_

- [x] 50. Implement Currency Formatting
  - Format amounts using symbolPosition, spaceBetween, and decimalDigits rules
  - Respect currency's decimalDigits (0 for JPY, 2 for USD, 3 for KWD)
  - Create formatAmount helper with options for notation (compact, standard)
  - _Requirements: Req 9 (AC 3-5, 10)_

- [x] 51. Create SearchableDropdown Component
  - Dropdown with search for currency selection
  - Display format: "Currency Name (Symbol)"
  - Real-time filtering
  - _Requirements: Req 9 (AC 5-6), Req 12 (AC 19)_

- [x] 52. Implement CurrencyContext
  - Persist selected currency in context
  - Allow different currencies per account
  - Display currency symbol with all monetary amounts
  - _Requirements: Req 9 (AC 7-9)_

## Phase 11: Tab Navigation Enhancement

- [x] 53. Create Tab Navigation Structure
  - Implement 9 tabs: Budgets, Recurring, Accounts, Balance Sheet, Categories, Insights, Expenses, Analytics, Calendar
  - Assign icons: List, Repeat, Wallet, BarChart, Tag, Sparkles, FileText, BarChart, Calendar
  - Apply theme-aware colors (teal for Halloween)
  - _Requirements: Req 11 (AC 1, 14-15)_

- [x] 54. Implement Animated Tab Indicator
  - Sliding indicator that animates to active tab position
  - Smooth transitions
  - Glow shadow effects in Halloween mode
  - _Requirements: Req 11 (AC 11), Req 15 (AC 13)_

- [x] 55. Implement URL Query Parameter
  - Update URL with tab query parameter
  - Initialize activeTab from URL on mount
  - Support bookmarking specific tabs
  - _Requirements: Req 11 (AC 12)_

- [x] 56. Add Tab-Specific Action Buttons
  - Show appropriate buttons per tab: Add Account, Add Rule, Add Category, Add Liability
  - Apply teal color scheme in Halloween mode
  - _Requirements: Req 11 (AC 13), Req 15 (AC 14)_

- [x] 57. Create Tab-Specific Skeletons
  - Loading skeletons for each tab type
  - Match actual tab layout
  - _Requirements: Req 11 (AC 16), Req 12 (AC 23)_

- [x] 58. Implement Tab Content Rendering
  - Conditionally render appropriate content for each tab
  - Pass appropriate props and callbacks
  - _Requirements: Req 11 (AC 2-10)_

## Phase 12: Halloween Theme Integration

- [x] 59. Apply Teal Color Scheme
  - Use #60c9b6 accent color for all financial components in Halloween mode
  - Apply to cards, buttons, charts, and highlights
  - _Requirements: Req 15 (AC 1)_

- [x] 60. Add Card Decorations
  - Account cards: tree and ghost decorations
  - Liability cards: pumpkin and ghost decorations
  - Goal cards: pumpkin and bat decorations
  - Recurring cards: web, bat, and cat decorations
  - Category cards: teal color scheme and glow effects
  - Position decorations in corners with absolute positioning
  - _Requirements: Req 15 (AC 2-6)_

- [x] 61. Style Charts and Visualizations
  - Breakdown cards: teal color for charts and highlights
  - Net worth chart: teal gradient fill
  - Balance sheet: Halloween background images with low opacity
  - _Requirements: Req 15 (AC 7-9)_

- [x] 62. Add Modal Decorations
  - Display bat, spider, and tree decorations in modal corners
  - Animate decorations with floating/rotating effects
  - _Requirements: Req 15 (AC 10, 16)_

- [x] 63. Create Halloween Empty States
  - Use Halloween-themed messages and imagery
  - "No Haunted Accounts", "No Cursed Goals", etc.
  - Display themed illustrations (pumpkins, ghosts, bats)
  - _Requirements: Req 15 (AC 11)_

- [x] 64. Apply Creepster Font
  - Use Creepster font for titles in Halloween mode
  - Add drop shadow effects to text
  - _Requirements: Req 15 (AC 15)_

- [x] 65. Implement Theme Toggle
  - Revert to standard theme colors when Halloween mode disabled
  - Smooth transitions between themes
  - _Requirements: Req 15 (AC 17)_

## Phase 13: Route Configuration

- [x] 66. Update App.tsx Route
  - Change route from /budget to /finances
  - Update import from Budget to Finances
  - Remove unused path import
  - _Requirements: Implementation Detail_

## Phase 14: Final Testing and Polish

- [x] 67. Test Account Management
  - Test account creation with all types
  - Test account editing and deletion
  - Test include_in_total checkbox
  - Test currency selection and formatting
  - Verify optimistic updates work correctly
  - _Requirements: Req 1 (All AC)_

- [x] 68. Test Transaction System
  - Test expense transactions (account balance decrements)
  - Test income transactions (account balance increments)
  - Test transfer transactions (from_account decrements, to_account increments)
  - Test transaction editing and deletion
  - Verify balance updates via trigger
  - _Requirements: Req 2 (All AC)_

- [x] 69. Test Category Management
  - Test category creation with subcategories
  - Test system category protection
  - Test category editing and deletion
  - Test category picker search
  - Test drill-down in analytics
  - _Requirements: Req 3 (All AC), Req 7 (AC 1-4)_

- [x] 70. Test Recurring Transactions
  - Test recurring rule creation with all intervals
  - Test automatic transaction processing
  - Test next_run_date calculation
  - Test recurring badge on transactions
  - Test rule editing and deletion
  - _Requirements: Req 4 (All AC), Req 14 (All AC)_

- [x] 71. Test Financial Goals
  - Test goal creation and editing
  - Test contribution tracking
  - Test progress calculation
  - Test days remaining warning
  - Test goal deletion
  - _Requirements: Req 5 (All AC)_

- [x] 72. Test Balance Sheet
  - Test net worth calculation
  - Test net worth history chart
  - Test liability management
  - Test breakdown cards
  - Test snapshot creation
  - _Requirements: Req 6 (All AC)_

- [x] 73. Test Analytics
  - Test category drill-down
  - Test date range filtering
  - Test spending by account
  - Test income vs expense comparison
  - Test transfer exclusion
  - _Requirements: Req 7 (All AC)_

- [x] 74. Test Budget Stats
  - Verify all 5 statistics display correctly
  - Test calculations with various data scenarios
  - Test responsive layout
  - _Requirements: Req 8 (All AC)_

- [x] 75. Test Multi-Currency
  - Test currency selection
  - Test amount formatting with different currencies
  - Test different decimal digits (JPY, USD, KWD)
  - Test symbol positioning
  - _Requirements: Req 9 (All AC)_

- [x] 76. Test Tab Navigation
  - Test all 9 tabs render correctly
  - Test URL synchronization
  - Test animated tab indicator
  - Test tab-specific action buttons
  - _Requirements: Req 11 (All AC)_

- [x] 77. Test Halloween Theme
  - Toggle Halloween mode on/off
  - Verify teal colors applied to all components
  - Verify decorations appear and animate
  - Verify Creepster font on titles
  - Verify empty states use Halloween messages
  - Test theme persistence
  - _Requirements: Req 15 (All AC)_

- [x] 78. Test Responsive Design
  - Test on mobile (320px - 767px)
  - Test on tablet (768px - 1023px)
  - Test on desktop (1024px+)
  - Verify all grids adjust properly
  - Verify modals are scrollable on mobile
  - _Requirements: (responsive)_

- [x] 79. Test Performance
  - Verify parallel query execution
  - Check for unnecessary re-renders
  - Test with large datasets
  - Verify optimistic updates are instant
  - _Requirements: Req 13 (AC 14-20)_

- [x] 80. Code Review and Cleanup
  - Remove console.log statements
  - Ensure consistent code formatting with Biome
  - Check for unused imports and variables
  - Verify all error messages are user-friendly
  - Add comments for complex logic
  - Verify all components have proper TypeScript types
  - _Requirements: All_
