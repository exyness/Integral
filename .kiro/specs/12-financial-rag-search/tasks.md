# Financial RAG Search System - Implementation Tasks

## Phase 1: Database Migration

- [x] 1. Create Icon Column Migration
  - Create migration file `20251203033000_add_icon_to_budgets.sql`
  - Add icon column to budgets table with type VARCHAR(50)
  - Set default value to 'DollarSign'
  - Apply migration to database
  - _Requirements: Req 11 (AC 1-3)_

- [x] 2. Update Budget Type Definition
  - Update Budget interface in `src/types/budget.ts`
  - Add icon field with type string
  - Update Supabase types
  - _Requirements: Req 11 (AC 4)_

- [x] 3. Update BudgetModal Component
  - Add icon picker to BudgetModal form
  - Include icon in form data
  - Set default icon to 'DollarSign'
  - _Requirements: Req 11 (AC 5)_

- [x] 4. Update BudgetCard Component
  - Display budget icon in card
  - Use IconRenderer component
  - Apply theme-aware styling
  - _Requirements: Req 11 (AC 6)_

## Phase 2: SearchModal Enhancement

- [x] 5. Add Financial Import State
  - Add isImportingFinance state to SearchModal
  - Add importProgress state with current, total, item fields
  - Add stopImportRef for cancellation support
  - _Requirements: Req 7 (AC 1), Req 10 (AC 1-3)_

- [x] 6. Create Category and Account Maps
  - Fetch finance_categories from Supabase
  - Create categoryMap: Map<id, name>
  - Fetch finance_accounts from Supabase
  - Create accountMap: Map<id, name>
  - Use maps for name resolution during indexing
  - _Requirements: Req 7 (AC 3), Req 1 (AC 4-5)_

- [x] 7. Implement Transaction Indexing Logic
  - Fetch all budget_transactions from Supabase
  - Resolve category_id to category name using categoryMap
  - Resolve account_id to account name using accountMap
  - Format content: "Transaction: {amount} - {description}\nCategory: {category}\nAccount: {account}\nDate: {date}\nType: {type}"
  - Build metadata with all required fields
  - Call addToGrimoire with content and metadata
  - _Requirements: Req 1 (AC 1-6, 9)_

- [x] 8. Implement Recurring Transaction Indexing Logic
  - Fetch all recurring_transactions from Supabase
  - Resolve category_id to category name (default: "Bills")
  - Resolve account_id to account name
  - Append "(Recurring)" to description
  - Format content with next_run_date
  - Build metadata with interval and active status
  - Call addToGrimoire with content and metadata
  - _Requirements: Req 2 (AC 1-6)_

- [x] 9. Implement Account Indexing Logic
  - Fetch all finance_accounts from Supabase
  - Format content: "Account: {name} ({type})\nCurrent Balance: {balance} {currency}\nStatus: Active"
  - Build metadata with account_type, balance, currency, include_in_total
  - Call addToGrimoire with content and metadata
  - _Requirements: Req 3 (AC 1-4)_

- [x] 10. Implement Budget Indexing Logic
  - Fetch all budgets from Supabase
  - Resolve category to category name (default: "Uncategorized")
  - Calculate status: "Over Budget" if spent > amount, else "On Track"
  - Format content with name, category, amount, spent, period, status
  - Build metadata with all budget fields
  - Call addToGrimoire with content and metadata
  - _Requirements: Req 4 (AC 1-6)_

- [x] 11. Implement Liability Indexing Logic
  - Fetch all liabilities from Supabase
  - Format content: "Liability: {name} ({type})\nAmount Owed: {amount}\nInterest Rate: {rate}%\nMinimum Payment: {payment}\nDue Date: {date}\nStatus: {status}"
  - Calculate status: "Active" if is_active, else "Paid Off"
  - Build metadata with liability_type, amount, interest_rate, minimum_payment, due_date, is_active
  - Call addToGrimoire with content and metadata
  - _Requirements: Req 5 (AC 1-5)_

- [x] 12. Implement Financial Goal Indexing Logic
  - Fetch all financial_goals from Supabase
  - Format content: "Financial Goal: {name}\nTarget: {target}\nCurrent: {current}\nTarget Date: {date}\nStatus: {status}"
  - Calculate status: "Active" if is_active, else "Inactive"
  - Build metadata with target_amount, current_amount, target_date, is_active
  - Call addToGrimoire with content and metadata
  - _Requirements: Req 6 (AC 1-5)_

- [x] 13. Implement Already Indexed Check
  - Query search_index for items with types: transaction, recurring_transaction, account, liability, financial_goal, budget
  - Extract original_id from metadata
  - Create indexedIds Set
  - Skip items where indexedIds.has(item.id)
  - _Requirements: Req 7 (AC 4-5), Req 1 (AC 7), Req 2 (AC 7), Req 3 (AC 5), Req 4 (AC 7), Req 5 (AC 6), Req 6 (AC 6)_

- [x] 14. Implement Progress Tracking
  - Calculate total items: sum of all data arrays
  - Set importProgress with current: 0, total, item: "financial data"
  - Update progress after each item with current item name
  - Show progress bar in UI
  - Reset progress to 0/0 when complete
  - _Requirements: Req 7 (AC 6-7), Req 10 (AC 1-6), Req 1 (AC 8), Req 2 (AC 8), Req 3 (AC 6), Req 4 (AC 8), Req 5 (AC 7), Req 6 (AC 7)_

- [x] 15. Implement Stop/Cancel Functionality
  - Add stop button in UI
  - Set stopImportRef.current = true on click
  - Check stopImportRef.current in each loop
  - Break loop if stopImportRef.current is true
  - Show partial results in toast
  - _Requirements: Req 7 (AC 9, 12), Req 10 (AC 7-9)_

- [x] 16. Add Themed Toast Messages
  - Use isHalloweenMode to determine message style
  - Start: "Summoning financial records..." vs "Syncing financial data..."
  - Success: "Resurrected {count} new financial records!" vs "Indexed {count} new records!"
  - Already indexed: "All financial records already in the Grimoire." vs "All records already indexed."
  - Error: "Failed to summon financial data." vs "Failed to sync financial data."
  - _Requirements: Req 7 (AC 10-11), Req 12 (AC 1-6)_

- [x] 17. Add Import Financial Data Button
  - Add button to SearchModal UI
  - Use Wallet icon
  - Place alongside other import buttons
  - Disable when isImportingFinance is true
  - Show spinner when importing
  - _Requirements: Req 7 (AC 1)_

- [x] 18. Implement handleImportFinance Function
  - Create async function in SearchModal
  - Set isImportingFinance to true
  - Reset stopImportRef.current to false
  - Fetch all financial data types
  - Create category and account maps
  - Query already indexed items
  - Process each data type sequentially
  - Update progress throughout
  - Show success/error toasts
  - Set isImportingFinance to false in finally block
  - _Requirements: Req 7 (AC 2-12)_

## Phase 3: Real-Time Indexing Hooks

- [x] 19. Add Transaction Indexing to useBudgetsQuery
  - Import useSpookyAI hook
  - Get addToGrimoire from useSpookyAI
  - In useCreateTransaction mutation onSuccess
  - Format transaction content
  - Build transaction metadata
  - Call await addToGrimoire(content, metadata)
  - Add addToGrimoire to useCallback dependencies
  - _Requirements: Req 9 (AC 1, 7-9), Req 1 (AC 1-6, 9)_

- [x] 20. Add Recurring Transaction Indexing to useBudgetsQuery
  - In useCreateRecurringTransaction mutation onSuccess
  - Format recurring transaction content with "(Recurring)"
  - Build recurring transaction metadata
  - Call await addToGrimoire(content, metadata)
  - _Requirements: Req 9 (AC 2, 7-9), Req 2 (AC 1-6)_

- [x] 21. Add Budget Indexing to useBudgetsQuery
  - In useCreateBudget mutation onSuccess
  - Format budget content with status calculation
  - Build budget metadata
  - Call await addToGrimoire(content, metadata)
  - _Requirements: Req 9 (AC 4, 7-9), Req 4 (AC 1-6)_

- [x] 22. Add Account Indexing to useAccountsQuery
  - Import useSpookyAI hook
  - Get addToGrimoire from useSpookyAI
  - In useCreateAccount mutation onSuccess
  - Format account content
  - Build account metadata
  - Call await addToGrimoire(content, metadata)
  - _Requirements: Req 9 (AC 3, 7-9), Req 3 (AC 1-4)_

- [x] 23. Add Liability Indexing to useLiabilities
  - Import useSpookyAI hook
  - Get addToGrimoire from useSpookyAI
  - In useCreateLiability mutation onSuccess
  - Format liability content with status
  - Build liability metadata
  - Call await addToGrimoire(content, metadata)
  - _Requirements: Req 9 (AC 5, 7-9), Req 5 (AC 1-5)_

- [x] 24. Add Goal Indexing to useGoals
  - Import useSpookyAI hook
  - Get addToGrimoire from useSpookyAI
  - In useCreateGoal mutation onSuccess
  - Format goal content with status
  - Build goal metadata
  - Call await addToGrimoire(content, metadata)
  - _Requirements: Req 9 (AC 6, 7-9), Req 6 (AC 1-5)_

## Phase 4: Search Integration

- [x] 25. Test Financial Data Search
  - Use existing askTheGrimoire function
  - Test queries: "show me transactions over $100"
  - Test queries: "what are my active liabilities"
  - Test queries: "how much did I spend on groceries"
  - Verify semantic search returns relevant results
  - Verify match_threshold: 0.5 and match_count: 5
  - _Requirements: Req 8 (AC 1-6)_

- [x] 26. Test Themed Prompts
  - Test search in Halloween mode
  - Verify Grimoire keeper themed responses
  - Test search in normal mode
  - Verify AI assistant themed responses
  - _Requirements: Req 8 (AC 7)_

## Phase 5: Testing and Verification

- [x] 27. Test Bulk Import
  - Create test financial data
  - Click Import Financial Data button
  - Verify progress bar shows correctly
  - Verify all data types are indexed
  - Verify already indexed items are skipped
  - Verify success toast shows correct count
  - _Requirements: Req 7 (All AC)_

- [x] 28. Test Real-Time Indexing
  - Create new transaction
  - Verify it's indexed immediately
  - Create new recurring transaction
  - Verify it's indexed immediately
  - Create new account, budget, liability, goal
  - Verify all are indexed immediately
  - _Requirements: Req 9 (All AC)_

- [x] 29. Test Progress Tracking
  - Start bulk import
  - Verify progress bar updates
  - Verify current item name displays
  - Verify progress resets when complete
  - _Requirements: Req 10 (All AC)_

- [x] 30. Test Stop/Cancel
  - Start bulk import
  - Click stop button mid-import
  - Verify import stops
  - Verify partial results are shown
  - _Requirements: Req 7 (AC 9, 12), Req 10 (AC 7-9)_

- [x] 31. Test Halloween Theme
  - Enable Halloween mode
  - Test all toast messages
  - Verify themed messages display
  - Disable Halloween mode
  - Verify normal messages display
  - _Requirements: Req 12 (All AC)_

- [x] 32. Test Search Queries
  - Index sample financial data
  - Test various natural language queries
  - Verify relevant results returned
  - Verify LLM generates insights
  - Test with different data types
  - _Requirements: Req 8 (All AC)_

- [x] 33. Code Review and Cleanup
  - Remove console.log statements
  - Ensure consistent code formatting with Biome
  - Check for unused imports and variables
  - Verify all error messages are user-friendly
  - Add comments for complex logic
  - Verify all components have proper TypeScript types
  - _Requirements: All_
