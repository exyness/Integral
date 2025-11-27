# Accounts System - Implementation Tasks

## Phase 1: Database and Type Definitions

- [x] 1. Verify Database Schema
  - Review `supabase/migrations/20251119045332_remote_schema.sql` to confirm accounts, account_usage_logs, and folders table structure
  - Verify accounts table has columns: id (UUID PK), user_id (UUID FK), folder_id (UUID FK nullable), title (VARCHAR(255) NOT NULL), platform (VARCHAR(255) NOT NULL), email_username (VARCHAR(255) NOT NULL), password (TEXT NOT NULL), usage_type (VARCHAR(20) DEFAULT 'custom' CHECK IN 'custom'/'daily'/'weekly'/'monthly'/'yearly'), usage_limit (INTEGER), current_usage (INTEGER DEFAULT 0), reset_period (VARCHAR(20) DEFAULT 'monthly' CHECK IN 'daily'/'weekly'/'monthly'/'yearly'/'never'), description (TEXT), tags (TEXT[]), is_active (BOOLEAN DEFAULT true), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ), UNIQUE(user_id, platform, email_username)
  - Verify account_usage_logs table has columns: id (UUID PK), user_id (UUID FK), account_id (UUID FK ON DELETE CASCADE), amount (INTEGER NOT NULL), description (TEXT), timestamp (TIMESTAMPTZ DEFAULT NOW())
  - Verify folders table has columns: id (UUID PK), user_id (UUID FK), name (VARCHAR(255) NOT NULL), type (VARCHAR(20) CHECK IN 'note'/'account'), parent_id (UUID FK nullable), color (VARCHAR(7) DEFAULT '#8B5CF6'), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)
  - Confirm RLS policies exist for SELECT, INSERT, UPDATE, DELETE operations (WHERE auth.uid() = user_id)
  - Verify foreign key constraints: accounts.user_id → auth.users.id, accounts.folder_id → folders.id, account_usage_logs.account_id → accounts.id
  - Verify indexes exist: idx_accounts_user_id, idx_accounts_folder_id, idx_accounts_created_at, idx_account_usage_logs_user_id, idx_account_usage_logs_account_id, idx_account_usage_logs_timestamp
  - Verify trigger exists: update_accounts_updated_at trigger calls update_updated_at_column() function
  - TypeScript types are auto-generated in `src/integrations/supabase/types.ts`
  - _Requirements: AC1, AC8, AC11_

- [x] 2. Create Type Definitions
  - Create `src/types/account.ts` file
  - Define Account interface with all fields and proper types
  - Define UsageLog interface with all fields
  - Define Folder interface (shared with notes)
  - Define AccountFormData interface for form submissions
  - Define UsageLogFormData interface for usage logging
  - Export all types for use across the application
  - _Requirements: AC1, AC6, AC11_

## Phase 2: Core Data Management Hooks

- [x] 3. Implement useAccounts Hook - Accounts Query
  - Create `src/hooks/useAccounts.ts` file
  - Set up useQuery with key ["accounts", userId] to fetch all user accounts
  - Include folder data with select query using join
  - Order accounts by created_at descending
  - Configure staleTime: 5 minutes, gcTime: 10 minutes
  - Return data, isLoading, error states
  - _Requirements: AC2_

- [x] 4. Implement Account Creation Mutation
  - Create useCreateAccount mutation in useAccounts.ts
  - Validate account data: title, platform, email_username, password required
  - Insert account with user_id, title, platform, email_username, password (encrypted by Supabase), usage_type, usage_limit, reset_period, description, tags, folder_id
  - Implement optimistic update: add account to beginning of cache array
  - Show success toast on completion
  - Show error toast and rollback on failure
  - Handle unique constraint violation with specific error message
  - _Requirements: AC1_

- [x] 5. Implement Account Update Mutation
  - Create useUpdateAccount mutation in useAccounts.ts
  - Accept id and updates parameters
  - Validate updates if title, platform, email_username, or password are being changed
  - Update account with provided fields
  - Set updated_at to current timestamp
  - Implement optimistic update: update account in cache immediately
  - Show success toast on completion
  - Show error toast and rollback on failure
  - Handle unique constraint violation with specific error message
  - _Requirements: AC4_

- [x] 6. Implement Account Delete Mutation
  - Create useDeleteAccount mutation in useAccounts.ts
  - Validate account ID is provided
  - Delete account by ID from database (cascade deletes usage logs)
  - Implement optimistic update: remove account from cache immediately
  - Show success toast on completion
  - Show error toast and rollback on failure
  - _Requirements: AC5_

- [x] 7. Implement Usage Reset Logic
  - Create shouldResetUsage function in useAccounts.ts
  - Accept account parameter
  - Check reset_period and compare with updated_at timestamp
  - For "daily": reset if current date differs from updated_at date
  - For "weekly": reset if current week differs from updated_at week
  - For "monthly": reset if current month differs from updated_at month
  - For "yearly": reset if current year differs from updated_at year
  - For "never": never reset
  - Return boolean indicating if reset is needed
  - _Requirements: AC7_

- [x] 8. Implement Auto-reset on View
  - Create checkAndResetUsage function in useAccounts.ts
  - Call shouldResetUsage to check if reset is needed
  - If reset needed: update account with current_usage: 0, updated_at: now
  - Show optional info toast about reset
  - Call this function when viewing account details
  - _Requirements: AC7_

- [x] 9. Implement useUsageLogs Hook - Usage Logs Query
  - Create `src/hooks/useUsageLogs.ts` file
  - Set up useQuery with key ["account-usage-logs", userId] to fetch all user usage logs
  - Include account data with select query using join
  - Order logs by timestamp descending
  - Configure staleTime: 5 minutes, gcTime: 10 minutes
  - Return data, isLoading, error states
  - _Requirements: AC8_

- [x] 10. Implement Usage Log Creation Mutation
  - Create useCreateUsageLog mutation in useUsageLogs.ts
  - Validate log data: amount required and positive
  - Insert usage log with user_id, account_id, amount, description, timestamp
  - Update account current_usage: add amount to current value
  - Implement optimistic update: add log to beginning of cache array and update account usage
  - Show success toast on completion
  - Show error toast and rollback on failure
  - _Requirements: AC6_

- [x] 11. Implement Usage Log Update Mutation
  - Create useUpdateUsageLog mutation in useUsageLogs.ts
  - Accept id and updates parameters
  - Calculate usage difference: newAmount - oldAmount
  - Update usage log with new amount and description
  - Update account current_usage: adjust by difference
  - Implement optimistic update: update log in cache and adjust account usage
  - Show success toast on completion
  - Show error toast and rollback on failure
  - _Requirements: AC9_

- [x] 12. Implement Usage Log Delete Mutation
  - Create useDeleteUsageLog mutation in useUsageLogs.ts
  - Validate log ID is provided
  - Get log amount before deletion
  - Delete usage log by ID from database
  - Update account current_usage: subtract amount
  - Implement optimistic update: remove log from cache and adjust account usage
  - Show success toast on completion
  - Show error toast and rollback on failure
  - _Requirements: AC9_

- [x] 13. Implement useFolders Hook (Shared)
  - Use existing `src/hooks/useFolders.ts` file
  - Set up useQuery with key ["folders", userId, "account"] to fetch account folders
  - Filter folders by type: "account"
  - Order folders by created_at ascending
  - Configure staleTime: 5 minutes, gcTime: 10 minutes
  - Implement folder CRUD mutations with optimistic updates
  - Return data, isLoading, error states, and mutation methods
  - _Requirements: AC11_

## Phase 3: Main Accounts Page

- [x] 14. Create Accounts Page Structure
  - Create `src/pages/Accounts.tsx` file
  - Import all necessary hooks, components, and assets
  - Set up state for activeTab, selectedFolder, selectedAccount, viewMode
  - Set up state for modals: showAccountForm, showUsageForm, showFolderForm, accountToDelete, usageLogToDelete
  - Set up state for filters: searchTerm, selectedAccountId, dateRange, sortBy
  - Initialize all hooks: useAccounts, useUsageLogs, useFolders
  - _Requirements: AC2, AC8, AC10, AC11_

- [x] 15. Implement URL State Synchronization
  - Use useSearchParams to read tab and folder from URL
  - Initialize activeTab from URL tab parameter (default: "accounts")
  - Initialize selectedFolder from URL folder parameter
  - Implement handleTabChange to update activeTab and URL
  - Implement handleFolderSelect to set folder and update URL
  - Use useEffect to sync URL parameters with state on mount
  - _Requirements: AC16_

- [x] 16. Create Tab Navigation
  - Create tab buttons for: Accounts, Activity, Calendar
  - Apply theme-aware colors to tabs
  - Highlight active tab with background color
  - Add icons for each tab
  - Handle tab change on click
  - Apply Halloween theme colors when enabled (teal)
  - _Requirements: AC2, AC8, AC10_

- [x] 17. Create Header Section with Decorations
  - Display "Accounts" title with theme-aware color
  - Show tab-specific description text
  - Add "New Account" button with Plus icon
  - Apply theme-aware styling to button
  - Add Halloween decorations: witch background, bat, pumpkin, spider, ghost, web
  - Animate decorations (flying bat, peeking pumpkin, hanging spider, appearing ghost)
  - Position decorations with absolute positioning and z-index layering
  - _Requirements: AC1, AC14_

- [x] 18. Implement Loading State
  - Check if loading is true
  - Display skeleton loaders for sidebar, tabs, and content
  - Use tab-specific skeletons: AccountsTabSkeleton, ActivityTabSkeleton, CalendarTabSkeleton
  - Wrap in motion.div with fade-in animation
  - _Requirements: (loading states)_

- [x] 19. Implement Tab Content Rendering
  - Use conditional rendering based on activeTab
  - For "accounts" view: render FolderSidebar, search bar, view toggle, AccountGrid or AccountList
  - For "activity" view: render UsageActivityView with filters
  - For "calendar" view: render AccountUsageCalendar
  - Pass appropriate props and callbacks to each component
  - _Requirements: AC2, AC8, AC10_

## Phase 4: Folder Sidebar

- [x] 20. Create FolderSidebar Component (Shared)
  - Use existing `src/components/folders/FolderSidebar.tsx` component
  - Pass type="account" to filter account folders
  - Display "All Accounts" option at top
  - List all folders with name, color indicator, and account count
  - Add click handler to call onFolderSelect with folder
  - Add "Create Folder" button at bottom
  - Apply theme-aware styling
  - Make collapsible on mobile devices
  - _Requirements: AC11_

- [x] 21. Implement Folder Selection
  - Highlight selected folder with background color
  - Update URL with folder parameter
  - Filter accounts by selected folder_id
  - Show "All Accounts" when no folder selected
  - Add "Clear Filter" button when folder is selected
  - _Requirements: AC11, AC12_

- [x] 22. Create CreateFolderModal Component (Shared)
  - Use existing `src/components/folders/CreateFolderModal.tsx` component
  - Add name input field (required, validated)
  - Add color picker (default: #8B5CF6)
  - Set type to "account" automatically
  - Use React Hook Form for form management
  - Add validation: name required
  - Display inline error messages below fields
  - Handle create mode: call onSubmit with new folder data
  - Handle edit mode: pre-fill fields with folder data, call onSubmit with updates
  - Show success toast on submit
  - Close modal on success
  - _Requirements: AC11_

## Phase 5: Accounts View Components

- [x] 23. Create Search and View Toggle Bar
  - Add search input with Search icon
  - Add placeholder: "Search accounts..."
  - Add keyboard shortcut indicator (Ctrl+K)
  - Add clear button when text present
  - Debounce search input by 300ms
  - Add view toggle buttons: Grid icon and List icon
  - Highlight active view
  - Persist view preference in localStorage
  - Apply theme-aware styling
  - _Requirements: AC2, AC12_

- [x] 24. Implement Account Filtering Logic
  - Create filterAccounts function
  - Filter by folder_id if folder selected
  - Filter by searchTerm: check title, platform, email_username, tags, description (case-insensitive)
  - Combine filters with AND logic
  - Use useMemo for performance
  - Return filtered accounts array
  - _Requirements: AC12_

- [x] 25. Create AccountGrid Component
  - Create `src/components/accounts/AccountGrid.tsx` file
  - Use VirtuosoGrid component for virtualized scrolling
  - Display accounts in responsive grid (1-3 columns based on screen size)
  - Render AccountCard for each account
  - Pass onAccountClick callback
  - Display empty state when no accounts match filters
  - Show appropriate empty state message and illustration
  - _Requirements: AC2_

- [x] 26. Create AccountCard Component
  - Create `src/components/accounts/AccountCard.tsx` file
  - Display account title (bold, truncated)
  - Display platform badge with icon
  - Display email/username (truncated)
  - Display password (masked: ••••••••)
  - Add show/hide password toggle button
  - Add copy password button
  - Add copy email button
  - Display usage progress bar if usage_limit set
  - Display tags as small badges (max 3 visible)
  - Display folder color indicator (left border)
  - Add click handler to open account detail modal
  - Apply theme-aware styling with glass card effect
  - Add hover effects
  - _Requirements: AC2, AC3_

- [x] 27. Create AccountList Component
  - Create `src/components/accounts/AccountList.tsx` file
  - Use Virtuoso component for virtualized scrolling
  - Display accounts in list format
  - Render AccountRow for each account
  - Pass onAccountClick callback
  - Display empty state when no accounts match filters
  - _Requirements: AC2_

- [x] 28. Create AccountRow Component
  - Create `src/components/accounts/AccountRow.tsx` file
  - Display account title (bold)
  - Display platform badge
  - Display email/username
  - Display usage indicator (percentage or "No limit")
  - Display folder color indicator (left border)
  - Add action buttons: View, Edit, Delete
  - Apply theme-aware styling
  - Add hover effects
  - _Requirements: AC2_

## Phase 6: Account Modals

- [x] 29. Create CreateAccountModal Component
  - Create `src/components/accounts/CreateAccountModal.tsx` file
  - Use Modal component as base
  - Add title input field (required, validated)
  - Add platform input field (required, validated)
  - Add email/username input field (required, validated)
  - Add password input field (required, validated, type="password")
  - Add usage type selector (custom, daily, weekly, monthly, yearly)
  - Add usage limit input field (number, optional)
  - Add reset period selector (daily, weekly, monthly, yearly, never)
  - Add description textarea (optional)
  - Add tags input with comma-separated values
  - Add folder selector dropdown (optional)
  - Use React Hook Form for form management
  - Add validation: title, platform, email_username, password required; usage_limit positive if provided
  - Display inline error messages below fields
  - On submit: call onSubmit with AccountFormData
  - Show success toast on submit
  - Close modal on success
  - Handle unique constraint error with specific message
  - _Requirements: AC1_

- [x] 30. Create ViewAccountModal Component
  - Create `src/components/accounts/ViewAccountModal.tsx` file
  - Use Modal component as base
  - Display account title in header
  - Display platform badge
  - Display email/username with copy button
  - Display password (masked by default) with show/hide toggle and copy button
  - Display usage progress bar with current usage and limit
  - Display usage type and reset period
  - Display description if present
  - Display tags as badges
  - Display folder badge if associated
  - Display recent usage logs (last 5)
  - Add "Edit" button that opens EditAccountModal
  - Add "Delete" button with confirmation
  - Add "Log Usage" button that opens LogUsageModal
  - Add "Close" button
  - Apply theme-aware styling
  - Call checkAndResetUsage when modal opens
  - _Requirements: AC3, AC7_

- [x] 31. Create EditAccountModal Component
  - Create `src/components/accounts/EditAccountModal.tsx` file
  - Use Modal component as base
  - Load account data into form fields
  - Enable editing all fields (same as CreateAccountModal)
  - Use React Hook Form for form management
  - Add validation (same as CreateAccountModal)
  - Display inline error messages below fields
  - On submit: call onSubmit with updates
  - Show success toast on submit
  - Close modal on success
  - Handle unique constraint error with specific message
  - _Requirements: AC4_

- [x] 32. Create DeleteAccountModal Component
  - Create `src/components/accounts/DeleteAccountModal.tsx` file
  - Use ConfirmationModal component
  - Display account title and platform
  - Show warning about deleting all associated usage logs
  - Require explicit confirmation
  - Set type to "danger" for red styling
  - On confirm: call onDelete with account ID
  - Show success toast on deletion
  - _Requirements: AC5_

## Phase 7: Usage Tracking Components

- [x] 33. Create LogUsageModal Component
  - Create `src/components/accounts/LogUsageModal.tsx` file
  - Use Modal component as base
  - Display account title and current usage
  - Add amount input field (required, positive integer)
  - Add description input field (optional)
  - Display usage limit and progress bar preview
  - Use React Hook Form for form management
  - Add validation: amount required and positive
  - Display inline error messages below fields
  - On submit: call onSubmit with UsageLogFormData
  - Show success toast on submit
  - Close modal on success
  - _Requirements: AC6_

- [x] 34. Create EditUsageModal Component
  - Create `src/components/accounts/EditUsageModal.tsx` file
  - Use Modal component as base
  - Load usage log data into form fields
  - Enable editing amount and description
  - Use React Hook Form for form management
  - Add validation: amount required and positive
  - Display inline error messages below fields
  - On submit: call onSubmit with updates
  - Show success toast on submit
  - Close modal on success
  - _Requirements: AC9_

- [x] 35. Create UsageProgressBar Component
  - Create `src/components/accounts/UsageProgressBar.tsx` file
  - Accept account prop
  - Calculate usage percentage: (current_usage / usage_limit) × 100
  - Determine color based on percentage: green < 50%, yellow 50-80%, orange 80-100%, red > 100%
  - Display current usage / limit text
  - Display status label (Good, Warning, High, Exceeded)
  - Render progress bar with calculated width and color
  - Handle no limit case (show "No limit")
  - Apply theme-aware styling
  - _Requirements: AC6_

## Phase 8: Activity View Components

- [x] 36. Create UsageActivityView Component
  - Create `src/components/accounts/UsageActivityView.tsx` file
  - Get usage logs from useUsageLogs hook
  - Set up state for filters: searchTerm, selectedAccountId, dateRange, sortBy
  - Implement filtering logic: account filter, date range filter, search filter
  - Implement sorting logic: date ascending, date descending, amount
  - Use Virtuoso component for virtualized scrolling
  - Render UsageActivityCard for each log
  - Pass onEdit and onDelete callbacks
  - Display empty state when no logs exist
  - _Requirements: AC8_

- [x] 37. Create UsageActivityFilters Component
  - Create `src/components/accounts/UsageActivityFilters.tsx` file
  - Add search input that filters by description
  - Add account filter dropdown (shows all accounts)
  - Add date range filter with start and end date pickers
  - Add sort dropdown (Date ↓, Date ↑, Amount)
  - Add clear filters button
  - Call appropriate onChange handlers when filters change
  - Apply theme-aware styling to all inputs and dropdowns
  - Make responsive for mobile devices
  - _Requirements: AC8_

- [x] 38. Create UsageActivityCard Component
  - Create `src/components/accounts/UsageActivityCard.tsx` file
  - Display usage amount (bold, large)
  - Display description if present
  - Display timestamp with date and time formatting
  - Display account name and platform badge
  - Add edit button that opens EditUsageModal
  - Add delete button with confirmation
  - Apply theme-aware styling with glass card effect
  - Add hover effects
  - _Requirements: AC8, AC9_

## Phase 9: Calendar View Components

- [x] 39. Create AccountUsageCalendar Component
  - Create `src/components/accounts/AccountUsageCalendar.tsx` file
  - Use react-day-picker library for monthly calendar view
  - Get usage logs from useUsageLogs hook
  - Group logs by date (timestamp)
  - Display usage indicators on each date
  - Color-code logs by account (use account folder color or default)
  - Display total usage amount on dates with logs
  - Highlight current date with distinct styling
  - Add navigation buttons for previous/next month
  - Add click handler for dates to show DayLogsModal
  - Apply theme-aware styling to calendar
  - _Requirements: AC10_

- [x] 40. Create DayLogsModal Component
  - Create `src/components/accounts/DayLogsModal.tsx` file
  - Use Modal component as base
  - Display selected date in header
  - List all usage logs for that date
  - Show log amount, description, account name, timestamp
  - Calculate and display total usage for the day
  - Add edit button for each log
  - Add delete button for each log
  - Show "No logs" message if date has no logs
  - Apply theme-aware styling
  - _Requirements: AC10_

## Phase 10: Security Features

- [x] 41. Implement Password Show/Hide Toggle
  - Create state for showPassword (default: false)
  - Render input with type="password" when showPassword is false
  - Render input with type="text" when showPassword is true
  - Add toggle button with Eye icon (show) or EyeOff icon (hide)
  - Apply to all password displays (card, modal)
  - Ensure password is masked by default (••••••••)
  - _Requirements: AC3, AC13_

- [x] 42. Implement Copy to Clipboard
  - Create copyToClipboard function
  - Use navigator.clipboard.writeText API
  - Accept text and label parameters
  - Show success toast: "{label} copied to clipboard"
  - Show error toast on failure: "Failed to copy {label}"
  - Handle clipboard API not available error
  - Apply to password and email/username copy buttons
  - _Requirements: AC3, AC13_

- [x] 43. Implement Password Validation
  - Add minimum length requirement (1 character minimum)
  - Add optional strength indicator (weak, medium, strong)
  - Validate on input change
  - Display validation errors inline
  - Prevent form submission until valid
  - _Requirements: AC13_

- [x] 44. Ensure Password Security
  - Verify passwords are encrypted by Supabase at rest
  - Never log passwords in console or error messages
  - Use type="password" for password inputs
  - Mask passwords by default in UI
  - Use secure clipboard API for copying
  - Enforce HTTPS for all operations
  - _Requirements: AC13_

## Phase 11: Final Polish

- [x] 45. Implement Empty States
  - Add empty state for no accounts (encouraging message, illustration)
  - Add empty state for no usage logs (call-to-action to log first usage)
  - Add empty state for no logs on selected date
  - Add empty state for no search results
  - Add Halloween-themed empty states when isHalloweenMode is true
  - Use appropriate icons and messages for each state
  - _Requirements: (UX)_

- [x] 46. Implement Confirmation Modals
  - Use existing ConfirmationModal component from `src/components/ui/ConfirmationModal.tsx`
  - Configure for account deletion with account title and warning
  - Configure for usage log deletion with log details
  - Set type to "danger" for red styling
  - Show appropriate confirmation message
  - Call delete handler on confirm
  - _Requirements: AC5, AC9_

- [x] 47. Add Loading Skeletons
  - Create `src/components/skeletons/AccountsSkeletons.tsx` file
  - Create AccountsTabSkeleton with account card skeletons
  - Create ActivityTabSkeleton with usage log card skeletons
  - Create CalendarTabSkeleton with calendar skeleton
  - Use Skeleton component from UI library
  - Apply theme-aware styling
  - _Requirements: (UX)_

- [x] 48. Implement Responsive Design
  - Test folder sidebar on mobile (collapsible)
  - Test account grid on mobile (1 column)
  - Test account list on mobile (full width)
  - Test modals on mobile (scrollable, full height)
  - Test calendar on mobile (adjust size)
  - Verify all buttons are touch-friendly (44x44px minimum)
  - _Requirements: (responsive)_

- [x] 49. Implement Keyboard Shortcuts
  - Add Ctrl+K (Cmd+K on Mac) to focus search input
  - Add Escape to close modals
  - Add Enter to submit forms
  - Add Tab navigation for form fields
  - Ensure all interactive elements are keyboard accessible
  - _Requirements: AC12_

- [x] 50. Final Code Review and Cleanup
  - Remove console.log statements
  - Ensure consistent code formatting with Biome
  - Check for unused imports and variables
  - Verify all error messages are user-friendly
  - Add comments for complex logic (usage reset, progress calculation)
  - Verify all components have proper TypeScript types
  - Check for any hardcoded values that should be constants
  - Verify all requirements are met
  - Test unique constraint error handling
  - Test usage reset logic with different periods
  - Test copy to clipboard functionality
  - Test password show/hide toggle
  - _Requirements: All_
