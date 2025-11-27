# Requirements Document

## Introduction

This document specifies the requirements for implementing a comprehensive secure credential storage system for Integral. The system provides account creation with encrypted password storage, usage tracking with automatic reset periods, folder organization, activity logging, and calendar visualization. The design prioritizes security, ease of access, and usage monitoring to help users manage multiple accounts and stay within usage limits.

## Glossary

- **Account**: A stored credential with title, platform, email/username, encrypted password, and usage tracking
- **Usage Type**: The frequency of usage tracking (custom, daily, weekly, monthly, yearly)
- **Usage Limit**: The maximum allowed usage amount for a given period
- **Current Usage**: The accumulated usage amount since the last reset
- **Reset Period**: The frequency at which usage resets (daily, weekly, monthly, yearly, never)
- **Usage Log**: A record of account usage with amount, description, and timestamp
- **Folder**: A container for organizing related accounts (shared with notes)
- **Platform**: The service or website the account belongs to (e.g., Netflix, AWS, GitHub)
- **Optimistic Update**: UI update that occurs immediately before server confirmation
- **Integral**: The productivity suite application

## Requirements

### Requirement 1

**User Story:** As a user, I want to create accounts with secure credential storage, so that I can manage multiple accounts without remembering all passwords.

#### Acceptance Criteria

1. WHEN a user clicks "New Account", THE **Integral** application SHALL display an account creation modal
2. THE account creation modal SHALL require title, platform, email/username, and password fields
3. THE account creation modal SHALL provide a usage type selector (custom, daily, weekly, monthly, yearly)
4. THE account creation modal SHALL provide an optional usage limit input field
5. THE account creation modal SHALL provide a reset period selector (daily, weekly, monthly, yearly, never)
6. THE account creation modal SHALL provide an optional description textarea
7. THE account creation modal SHALL provide a tags input field accepting comma-separated values
8. THE account creation modal SHALL provide an optional folder selector dropdown
9. THE **Integral** application SHALL validate that title, platform, email/username, and password are non-empty
10. WHEN a user submits the form, THE **Integral** application SHALL create the **Account** with encrypted password
11. WHEN account creation succeeds, THE **Integral** application SHALL display a success toast notification
12. THE **Integral** application SHALL enforce unique constraint on (user_id, platform, email_username)

### Requirement 2

**User Story:** As a user, I want to view all my accounts in a grid or list format, so that I can browse my stored credentials.

#### Acceptance Criteria

1. THE **Integral** application SHALL display all accounts in grid or list format based on user preference
2. THE account grid SHALL display account title, platform badge, email/username, masked password, usage progress, and tags for each account
3. THE account list SHALL display account title, platform, email/username, usage indicator, and action buttons for each account
4. THE account cards SHALL display maximum 3 tags with "..." indicator if more exist
5. THE account cards SHALL display folder color indicator when associated with a folder
6. THE **Integral** application SHALL provide a view toggle button to switch between grid and list views
7. THE **Integral** application SHALL use virtualized scrolling for performance with 100+ accounts
8. WHEN a user clicks an account card, THE **Integral** application SHALL display the account detail modal
9. THE **Integral** application SHALL display an empty state when no accounts exist
10. THE empty state SHALL include an encouraging message and call-to-action

### Requirement 3

**User Story:** As a user, I want to view and edit account details, so that I can review and update my credentials.

#### Acceptance Criteria

1. WHEN a user clicks an account, THE **Integral** application SHALL display the account detail modal
2. THE account detail modal SHALL display all account fields: title, platform, email/username, password, usage info, description, tags, folder
3. THE account detail modal SHALL mask the password by default with "••••••••"
4. THE account detail modal SHALL provide a show/hide password toggle button
5. THE account detail modal SHALL provide a copy password button
6. THE account detail modal SHALL provide a copy email/username button
7. THE account detail modal SHALL display usage progress bar with current usage and limit
8. THE account detail modal SHALL display recent usage logs
9. THE account detail modal SHALL provide an "Edit" button to open the edit modal
10. THE account detail modal SHALL provide a "Delete" button to open the delete confirmation modal
11. THE account detail modal SHALL provide a "Log Usage" button to open the usage logging modal

### Requirement 4

**User Story:** As a user, I want to edit account information, so that I can update credentials and settings.

#### Acceptance Criteria

1. WHEN a user clicks the edit button, THE **Integral** application SHALL display the account edit modal
2. THE edit modal SHALL allow modifying title, platform, email/username, password, usage type, usage limit, reset period, description, tags, and folder
3. THE edit modal SHALL validate that title, platform, email/username, and password are non-empty
4. WHEN a user saves changes, THE **Integral** application SHALL update the account and display a success toast
5. THE **Integral** application SHALL enforce unique constraint on (user_id, platform, email_username)
6. THE **Integral** application SHALL encrypt the password before storing

### Requirement 5

**User Story:** As a user, I want to delete accounts, so that I can remove credentials I no longer need.

#### Acceptance Criteria

1. WHEN a user clicks the delete button, THE **Integral** application SHALL display a confirmation modal
2. THE confirmation modal SHALL display the account title and platform
3. THE confirmation modal SHALL require explicit confirmation before deletion
4. WHEN deletion is confirmed, THE **Integral** application SHALL remove the account and all associated usage logs
5. WHEN deletion succeeds, THE **Integral** application SHALL display a success toast notification

### Requirement 6

**User Story:** As a user, I want to track account usage, so that I can stay within usage limits and avoid overages.

#### Acceptance Criteria

1. WHEN a user clicks "Log Usage", THE **Integral** application SHALL display the usage logging modal
2. THE usage logging modal SHALL require an amount input field
3. THE usage logging modal SHALL provide an optional description input field
4. THE usage logging modal SHALL display current usage and usage limit
5. WHEN a user submits the form, THE **Integral** application SHALL create a **Usage Log** and update current usage
6. THE **Integral** application SHALL display usage progress bar with color coding (green < 50%, yellow 50-80%, red > 80%)
7. THE **Integral** application SHALL calculate usage percentage as (current_usage / usage_limit) \* 100
8. WHEN current usage exceeds usage limit, THE **Integral** application SHALL display a warning indicator

### Requirement 7

**User Story:** As a user, I want usage to reset automatically based on the reset period, so that I don't have to manually track limits.

#### Acceptance Criteria

1. WHEN viewing an account, THE **Integral** application SHALL check if usage should reset based on reset period
2. WHEN reset period is "daily", THE **Integral** application SHALL reset usage if the current date differs from the last update date
3. WHEN reset period is "weekly", THE **Integral** application SHALL reset usage if the current week differs from the last update week
4. WHEN reset period is "monthly", THE **Integral** application SHALL reset usage if the current month differs from the last update month
5. WHEN reset period is "yearly", THE **Integral** application SHALL reset usage if the current year differs from the last update year
6. WHEN reset period is "never", THE **Integral** application SHALL not reset usage automatically
7. WHEN usage is reset, THE **Integral** application SHALL set current_usage to 0 and update the updated_at timestamp

### Requirement 8

**User Story:** As a user, I want to view usage activity across all accounts, so that I can see my usage history.

#### Acceptance Criteria

1. THE **Integral** application SHALL provide an Activity tab displaying all usage logs
2. THE activity list SHALL display usage amount, description, timestamp, and account name for each log
3. THE activity list SHALL provide an account filter dropdown
4. THE activity list SHALL provide a date range filter with start and end date pickers
5. THE activity list SHALL provide a search input that filters by description
6. THE activity list SHALL provide sort options (date ascending, date descending, amount)
7. THE **Integral** application SHALL combine filters with AND logic
8. THE **Integral** application SHALL use virtualized scrolling for performance with 100+ logs
9. THE activity list SHALL provide edit and delete buttons for each log
10. THE **Integral** application SHALL display an empty state when no usage logs exist

### Requirement 9

**User Story:** As a user, I want to edit and delete usage logs, so that I can correct mistakes or adjust tracking data.

#### Acceptance Criteria

1. WHEN a user clicks a usage log's edit button, THE **Integral** application SHALL display the usage edit modal
2. THE edit modal SHALL allow modifying amount and description
3. WHEN a user saves changes, THE **Integral** application SHALL update the log and recalculate account current usage
4. WHEN a user clicks a usage log's delete button, THE **Integral** application SHALL display a confirmation modal
5. WHEN deletion is confirmed, THE **Integral** application SHALL remove the log and recalculate account current usage
6. THE **Integral** application SHALL display a success toast notification after edit or delete

### Requirement 10

**User Story:** As a user, I want to view usage logs in a calendar format, so that I can see my usage patterns over time.

#### Acceptance Criteria

1. THE **Integral** application SHALL provide a Calendar tab displaying a monthly calendar view
2. THE calendar SHALL display visual indicators on dates with usage logs
3. THE calendar SHALL color-code usage logs by account
4. THE calendar SHALL display usage amount on dates with logs
5. WHEN a user clicks a date, THE **Integral** application SHALL display all usage logs for that date in a modal
6. THE calendar SHALL provide navigation buttons for previous and next month
7. THE calendar SHALL highlight the current date with distinct styling
8. THE day logs modal SHALL allow viewing, editing, and deleting logs

### Requirement 11

**User Story:** As a user, I want to organize accounts in folders, so that I can group related accounts together.

#### Acceptance Criteria

1. THE **Integral** application SHALL provide a folder sidebar displaying all account folders
2. THE folder sidebar SHALL display folder name, color, and account count for each folder
3. WHEN a user clicks a folder, THE **Integral** application SHALL filter accounts to show only those in the selected folder
4. THE **Integral** application SHALL provide a "Create Folder" button to open the folder creation modal
5. THE folder creation modal SHALL require a name input field
6. THE folder creation modal SHALL provide a color picker with default value
7. WHEN a user creates a folder, THE **Integral** application SHALL add it to the sidebar
8. THE **Integral** application SHALL allow editing folder name and color
9. WHEN a folder is deleted, THE **Integral** application SHALL move associated accounts to root (no folder)
10. THE folder sidebar SHALL be collapsible on mobile devices

### Requirement 12

**User Story:** As a user, I want to search and filter accounts, so that I can find credentials quickly.

#### Acceptance Criteria

1. THE Accounts tab SHALL provide a search input that filters by title, platform, email/username, and tags
2. THE **Integral** application SHALL debounce search input by 300ms
3. THE search SHALL be case-insensitive
4. THE **Integral** application SHALL provide a keyboard shortcut (Ctrl+K or Cmd+K) to focus the search input
5. THE **Integral** application SHALL display "No accounts found" message when no accounts match the search
6. WHEN search is cleared, THE **Integral** application SHALL display all accounts
7. THE **Integral** application SHALL combine folder filter and search with AND logic

### Requirement 13

**User Story:** As a user, I want secure password handling, so that my credentials are protected.

#### Acceptance Criteria

1. THE **Integral** application SHALL encrypt passwords before storing in the database
2. THE **Integral** application SHALL never log passwords in console or error messages
3. THE **Integral** application SHALL mask passwords by default with "••••••••"
4. THE show/hide password toggle SHALL reveal the actual password when enabled
5. THE copy to clipboard function SHALL use the secure navigator.clipboard API
6. WHEN copy succeeds, THE **Integral** application SHALL display a success toast notification
7. WHEN copy fails, THE **Integral** application SHALL display an error toast notification
8. THE **Integral** application SHALL enforce HTTPS for all password operations

### Requirement 14

**User Story:** As a user, I want the accounts interface to support Halloween theme mode, so that I can enjoy seasonal decorations while managing credentials.

#### Acceptance Criteria

1. WHEN Halloween mode is enabled, THE **Integral** application SHALL display teal accent color (#60c9b6) instead of default purple
2. WHEN Halloween mode is enabled, THE accounts page header SHALL display animated decorations (bat, pumpkin, spider, web, ghost, witch)
3. WHEN Halloween mode is enabled, THE tab indicator and buttons SHALL use teal color
4. WHEN Halloween mode is enabled, THE empty states SHALL display Halloween-themed illustrations
5. THE **Integral** application SHALL apply Halloween styling consistently across all accounts views
6. WHEN Halloween mode is disabled, THE **Integral** application SHALL revert to standard theme colors

### Requirement 15

**User Story:** As a developer, I want centralized accounts state management with optimistic updates, so that the UI feels instant and data stays synchronized with the database.

#### Acceptance Criteria

1. THE **Integral** application SHALL use TanStack Query with query keys ["accounts", userId], ["account-usage-logs", userId], and ["folders", userId, "account"]
2. WHEN an account is created, THE **Integral** application SHALL add it to the local cache immediately before server confirmation
3. WHEN an account is updated, THE **Integral** application SHALL update it in the local cache immediately before server confirmation
4. WHEN an account is deleted, THE **Integral** application SHALL remove it from the local cache immediately before server confirmation
5. WHEN a server operation fails, THE **Integral** application SHALL rollback the **Optimistic Update** and display an error toast
6. THE **Integral** application SHALL configure query staleTime to 5 minutes and gcTime to 10 minutes
7. THE **Integral** application SHALL fetch accounts ordered by created_at descending
8. THE **Integral** application SHALL include folder data in account queries using join

### Requirement 16

**User Story:** As a user, I want smooth navigation with URL state synchronization, so that I can bookmark specific views and use browser navigation.

#### Acceptance Criteria

1. WHEN a user switches tabs, THE **Integral** application SHALL update the URL with a tab query parameter
2. WHEN a user selects a folder, THE **Integral** application SHALL update the URL with a folder parameter
3. WHEN a user loads the page with URL parameters, THE **Integral** application SHALL restore the selected tab and folder
4. WHEN a user uses browser back/forward buttons, THE **Integral** application SHALL navigate between tab and folder states
5. THE **Integral** application SHALL use replace mode for URL updates to avoid cluttering browser history
