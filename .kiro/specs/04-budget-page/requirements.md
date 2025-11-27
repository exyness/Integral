# Requirements Document

## Introduction

This document specifies the requirements for implementing a comprehensive budget tracking and expense management system for Integral. The system provides budget creation with periods and categories, transaction tracking, multi-currency support, calendar view, analytics with charts, financial insights, and a unique "financial horror" feature for overspending alerts. The design prioritizes clear financial visualization, instant feedback through optimistic updates, and seamless integration with the existing application architecture.

## Glossary

- **Budget**: A financial plan with allocated amount, category, period (weekly/monthly/quarterly/yearly), and date range
- **Transaction**: An expense or income entry with amount, description, category, and date
- **Budget Period**: Time frame for a budget (weekly, monthly, quarterly, yearly)
- **Budget Category**: Classification of spending (food, transport, entertainment, utilities, healthcare, education, shopping, savings, other)
- **Spent Amount**: Total of all transactions associated with a budget
- **Remaining Amount**: Budget amount minus spent amount
- **Standalone Transaction**: Transaction not associated with any specific budget
- **Quick Expense**: Simplified transaction entry with minimal fields
- **Multi-currency**: Support for multiple currencies with conversion and formatting
- **Financial Horror**: Halloween-themed alert for budgets that are overspent or near limit
- **Financial Insights**: AI-generated spending analysis and recommendations
- **Analytics**: Visual charts and statistics showing spending patterns
- **Optimistic Update**: UI update that occurs immediately before server confirmation
- **Integral**: The productivity suite application

## Requirements

### Requirement 1

**User Story:** As a user, I want to create budgets with specific amounts and time periods, so that I can plan and track my spending across different categories.

#### Acceptance Criteria

1. WHEN a user clicks "New Budget", THE **Integral** application SHALL display a budget creation modal
2. THE budget creation modal SHALL require name, amount, category, period, start date, and end date fields
3. THE budget creation modal SHALL provide a color picker for visual identification
4. THE budget creation modal SHALL validate that end date is after start date
5. THE budget creation modal SHALL support categories: food, transport, entertainment, utilities, healthcare, education, shopping, savings, other
6. THE budget creation modal SHALL support periods: weekly, monthly, quarterly, yearly
7. WHEN a user submits the form, THE **Integral** application SHALL create the **Budget** with spent amount initialized to 0
8. WHEN budget creation succeeds, THE **Integral** application SHALL display a success toast notification

### Requirement 2

**User Story:** As a user, I want to add transactions to track my expenses, so that I can see how much I've spent against my budgets.

#### Acceptance Criteria

1. WHEN a user clicks "Add Transaction", THE **Integral** application SHALL display a transaction creation modal
2. THE transaction modal SHALL require amount, description, category, and transaction date fields
3. THE transaction modal SHALL provide an optional budget selector dropdown
4. WHEN a user submits a transaction with a budget selected, THE **Integral** application SHALL increment the budget's **Spent Amount**
5. WHEN a user submits a transaction without a budget, THE **Integral** application SHALL create a **Standalone Transaction**
6. THE **Integral** application SHALL use **Optimistic Update** to reflect changes immediately
7. WHEN transaction creation succeeds, THE **Integral** application SHALL display a success toast notification
8. WHEN a transaction is deleted, THE **Integral** application SHALL decrement the associated budget's **Spent Amount**

### Requirement 3

**User Story:** As a user, I want to quickly add expenses without filling many fields, so that I can capture spending on-the-go.

#### Acceptance Criteria

1. WHEN a user clicks "Quick Expense", THE **Integral** application SHALL display a simplified modal
2. THE **Quick Expense** modal SHALL require only amount and description fields
3. THE **Quick Expense** modal SHALL default category to "other" and date to today
4. THE **Quick Expense** modal SHALL create a **Standalone Transaction**
5. WHEN quick expense creation succeeds, THE **Integral** application SHALL display a success toast notification

### Requirement 4

**User Story:** As a user, I want to view my budgets in different formats, so that I can understand my financial situation from multiple perspectives.

#### Acceptance Criteria

1. THE **Integral** application SHALL provide five tab options: Budgets, Expenses, Calendar, Analytics, Insights
2. THE Budgets tab SHALL display all budgets as cards showing name, amount, spent, remaining, progress bar, and period
3. THE Expenses tab SHALL display all transactions in a list with amount, description, category, date, and associated budget
4. THE Calendar tab SHALL display transactions on a monthly calendar view
5. THE Analytics tab SHALL display charts and statistics for spending patterns
6. THE Insights tab SHALL display AI-generated financial insights and recommendations
7. THE **Integral** application SHALL use animated tab indicator that slides to the active tab
8. THE **Integral** application SHALL update URL with tab query parameter when switching tabs

### Requirement 5

**User Story:** As a user, I want to see detailed information about a specific budget, so that I can track all transactions and progress for that budget.

#### Acceptance Criteria

1. WHEN a user clicks a budget card, THE **Integral** application SHALL display budget detail view
2. THE budget detail view SHALL show budget name, amount, spent, remaining, progress bar, and date range
3. THE budget detail view SHALL display all transactions associated with that budget
4. THE budget detail view SHALL provide "Add Transaction" button that pre-selects the budget
5. THE budget detail view SHALL provide "Edit" and "Delete" buttons for the budget
6. THE budget detail view SHALL provide a back button to return to budget list
7. THE **Integral** application SHALL update URL with budget slug when viewing details
8. WHEN a user loads a URL with budget slug, THE **Integral** application SHALL restore the budget detail view

### Requirement 6

**User Story:** As a user, I want to use my preferred currency, so that I can track expenses in my local currency with proper formatting.

#### Acceptance Criteria

1. THE **Integral** application SHALL provide a currency selector dropdown
2. THE currency selector SHALL support multiple currencies (USD, EUR, GBP, JPY, CNY, INR, etc.)
3. WHEN a user selects a currency, THE **Integral** application SHALL format all amounts with the correct symbol and decimal places
4. THE **Integral** application SHALL persist the selected currency across sessions
5. THE **Integral** application SHALL use the CurrencyContext for global currency state
6. THE **Integral** application SHALL display currency symbol before or after amount based on currency conventions

### Requirement 7

**User Story:** As a user, I want to see statistics about my spending, so that I can understand my financial health at a glance.

#### Acceptance Criteria

1. THE **Integral** application SHALL display four statistics cards: Total Budget, Total Spent, Remaining, and Active Budgets
2. THE Total Budget card SHALL sum all budget amounts
3. THE Total Spent card SHALL sum all transaction amounts
4. THE Remaining card SHALL calculate Total Budget minus Total Spent
5. THE Active Budgets card SHALL count budgets where current date is between start and end dates
6. THE statistics cards SHALL use theme-aware colors (teal for Halloween mode)
7. THE statistics cards SHALL display appropriate icons (Wallet, DollarSign, Sparkles, FileText)

### Requirement 8

**User Story:** As a user, I want to filter and search my budgets and transactions, so that I can find specific items quickly.

#### Acceptance Criteria

1. THE Budgets tab SHALL provide filter options: All, Active, Completed, Over Budget
2. THE Budgets tab SHALL provide sort options: Newest, Oldest, Name, Amount, Spent
3. THE Budgets tab SHALL provide a search input that filters by budget name
4. THE Budgets tab SHALL provide a category filter dropdown
5. THE Expenses tab SHALL provide filter options for date range and category
6. THE Expenses tab SHALL provide a search input that filters by description
7. THE **Integral** application SHALL combine filters with AND logic
8. THE **Integral** application SHALL debounce search input by 300ms

### Requirement 9

**User Story:** As a user, I want to see my transactions on a calendar, so that I can visualize my spending over time.

#### Acceptance Criteria

1. THE **Calendar** tab SHALL display a monthly calendar view
2. THE calendar SHALL show transaction amounts on each date
3. THE calendar SHALL color-code transactions by category
4. WHEN a user clicks a date, THE **Integral** application SHALL display all transactions for that date
5. THE calendar SHALL provide navigation buttons to move between months
6. THE calendar SHALL highlight the current date
7. THE calendar SHALL display total spending for each day

### Requirement 10

**User Story:** As a user, I want to see analytics about my spending patterns, so that I can make informed financial decisions.

#### Acceptance Criteria

1. THE **Analytics** tab SHALL display total spent, transaction count, and average transaction amount
2. THE **Analytics** tab SHALL display a category breakdown chart (pie or bar chart)
3. THE **Analytics** tab SHALL display a daily spending trend chart (line chart)
4. THE **Analytics** tab SHALL display top expenses list
5. THE **Analytics** tab SHALL display budgeted vs actual spending comparison
6. THE **Analytics** tab SHALL provide date range filters (week, month, 30/60/90 days, custom)
7. THE **Analytics** tab SHALL use Recharts library for visualizations
8. THE **Analytics** tab SHALL use theme-aware colors for charts

### Requirement 11

**User Story:** As a user, I want to receive financial insights and recommendations, so that I can improve my spending habits.

#### Acceptance Criteria

1. THE **Insights** tab SHALL display AI-generated financial insights
2. THE insights SHALL analyze spending patterns and provide recommendations
3. THE insights SHALL identify overspending categories
4. THE insights SHALL suggest budget adjustments
5. THE insights SHALL use the Gemini API for AI generation
6. THE insights SHALL display in a readable card format
7. THE insights SHALL update when spending data changes

### Requirement 12

**User Story:** As a user, I want to see Halloween-themed alerts when I overspend, so that I can be warned about budget issues in a fun way.

#### Acceptance Criteria

1. WHEN Halloween mode is enabled, THE **Integral** application SHALL display a "Financial Horror" card
2. THE Financial Horror card SHALL identify budgets that are over budget or near limit (>80%)
3. THE Financial Horror card SHALL display spooky warnings with Halloween-themed language
4. THE Financial Horror card SHALL show the overspent amount or percentage
5. THE Financial Horror card SHALL use teal accent color and Halloween decorations
6. WHEN Halloween mode is disabled, THE Financial Horror card SHALL not display

### Requirement 13

**User Story:** As a user, I want the budget interface to support Halloween theme mode, so that I can enjoy seasonal decorations while managing finances.

#### Acceptance Criteria

1. WHEN Halloween mode is enabled, THE **Integral** application SHALL display teal accent color (#60c9b6) instead of default colors
2. WHEN Halloween mode is enabled, THE budget page header SHALL display animated decorations (bat, pumpkin, spider, web, ghost)
3. WHEN Halloween mode is enabled, THE statistics cards SHALL use teal color scheme
4. WHEN Halloween mode is enabled, THE tab indicator SHALL glow with teal shadow effects
5. THE **Integral** application SHALL apply Halloween styling consistently across all budget views
6. WHEN Halloween mode is disabled, THE **Integral** application SHALL revert to standard theme colors

### Requirement 14

**User Story:** As a developer, I want centralized budget state management with optimistic updates, so that the UI feels instant and data stays synchronized with the database.

#### Acceptance Criteria

1. THE **Integral** application SHALL use TanStack Query with query keys ["budgets", userId] and ["budget_transactions", userId]
2. WHEN a budget is created, THE **Integral** application SHALL add it to the local cache immediately before server confirmation
3. WHEN a transaction is created, THE **Integral** application SHALL update the associated budget's spent amount immediately
4. WHEN a transaction is deleted, THE **Integral** application SHALL decrement the associated budget's spent amount immediately
5. WHEN a server operation fails, THE **Integral** application SHALL rollback the **Optimistic Update** and display an error toast
6. THE **Integral** application SHALL configure query staleTime to 5 minutes and gcTime to 10 minutes
7. THE **Integral** application SHALL use Supabase RPC function "update_budget_spent" to maintain spent amount accuracy
8. THE **Integral** application SHALL fetch budgets ordered by created_at descending

### Requirement 15

**User Story:** As a user, I want smooth navigation with URL state synchronization, so that I can bookmark specific budgets or tabs and use browser navigation.

#### Acceptance Criteria

1. WHEN a user switches tabs, THE **Integral** application SHALL update the URL with a tab query parameter
2. WHEN a user views a budget detail, THE **Integral** application SHALL update the URL with a budget slug (name with hyphens)
3. WHEN a user loads the page with URL parameters, THE **Integral** application SHALL restore the selected tab and budget
4. WHEN a user uses browser back/forward buttons, THE **Integral** application SHALL navigate between tab and budget states
5. THE **Integral** application SHALL use replace mode for URL updates to avoid cluttering browser history
6. WHEN a budget is not found by slug, THE **Integral** application SHALL return to list view
