# Requirements Document

## Introduction

This document specifies the requirements for implementing RAG (Retrieval-Augmented Generation) search capabilities for financial data in Integral. This feature extends the existing RAG search system (Feature #10) to include financial records, enabling users to search and query their transactions, budgets, accounts, liabilities, goals, and recurring transactions using natural language. The system leverages the existing search_index table and pgvector extension to provide semantic search across all financial data.

## Glossary

- **RAG**: Retrieval-Augmented Generation - AI technique combining semantic search with LLM generation
- **Financial Data**: Transactions, budgets, accounts, liabilities, financial goals, and recurring transactions
- **Search Index**: Vector database table storing embedded financial records
- **Embedding**: Vector representation of text for semantic similarity search
- **Grimoire**: Halloween-themed name for the search index
- **Bulk Import**: Process of indexing all existing financial records at once
- **Semantic Search**: Search based on meaning rather than exact keyword matching
- **Integral**: The productivity suite application

## Requirements

### Requirement 1: Transaction Indexing

**User Story:** As a user, I want my transactions indexed for search, so that I can find and query past transactions using natural language.

#### Acceptance Criteria

1. WHEN a transaction is created, THE **Integral** application SHALL index it in search_index with type "transaction"
2. THE indexed content SHALL include: amount, description, category name, account name, date, and transaction type
3. THE metadata SHALL include: original_id, amount, category, category_id, account_name, account_id, transaction_date, transaction_type, created_at, tags
4. THE **Integral** application SHALL resolve category_id to category name using categoryMap
5. THE **Integral** application SHALL resolve account_id to account name using accountMap
6. THE **Integral** application SHALL format content as: "Transaction: {amount} - {description}\nCategory: {category}\nAccount: {account}\nDate: {date}\nType: {type}"
7. WHEN bulk importing transactions, THE **Integral** application SHALL skip already indexed transactions
8. THE **Integral** application SHALL show progress during bulk import with current item name
9. THE **Integral** application SHALL use await for indexing (not fire-and-forget)

### Requirement 2: Recurring Transaction Indexing

**User Story:** As a user, I want my recurring transactions indexed for search, so that I can find and query recurring bills and income.

#### Acceptance Criteria

1. WHEN a recurring transaction is created, THE **Integral** application SHALL index it in search_index with type "recurring_transaction"
2. THE indexed content SHALL include: amount, description, category name, account name, next run date, and type
3. THE indexed content SHALL append "(Recurring)" to description
4. THE metadata SHALL include: original_id, amount, category, category_id, account_name, account_id, next_run_date, interval, active, created_at
5. THE **Integral** application SHALL resolve category_id to category name (default: "Bills")
6. THE **Integral** application SHALL resolve account_id to account name
7. WHEN bulk importing recurring transactions, THE **Integral** application SHALL skip already indexed items
8. THE **Integral** application SHALL show progress during bulk import

### Requirement 3: Account Indexing

**User Story:** As a user, I want my financial accounts indexed for search, so that I can find and query account information.

#### Acceptance Criteria

1. WHEN an account is created, THE **Integral** application SHALL index it in search_index with type "account"
2. THE indexed content SHALL include: name, type, current balance, currency, and status
3. THE indexed content SHALL format as: "Account: {name} ({type})\nCurrent Balance: {balance} {currency}\nStatus: Active"
4. THE metadata SHALL include: original_id, account_type, balance, currency, include_in_total, created_at
5. WHEN bulk importing accounts, THE **Integral** application SHALL skip already indexed accounts
6. THE **Integral** application SHALL show progress during bulk import

### Requirement 4: Budget Indexing

**User Story:** As a user, I want my budgets indexed for search, so that I can find and query budget information.

#### Acceptance Criteria

1. WHEN a budget is created, THE **Integral** application SHALL index it in search_index with type "budget"
2. THE indexed content SHALL include: name, category, amount, spent, period, and status
3. THE indexed content SHALL calculate status: "Over Budget" if spent > amount, else "On Track"
4. THE indexed content SHALL format as: "Budget: {name}\nCategory: {category}\nAmount: {amount}\nSpent: {spent}\nPeriod: {period}\nStatus: {status}"
5. THE metadata SHALL include: original_id, amount, spent, category, period, start_date, end_date, created_at
6. THE **Integral** application SHALL resolve category to category name (default: "Uncategorized")
7. WHEN bulk importing budgets, THE **Integral** application SHALL skip already indexed budgets
8. THE **Integral** application SHALL show progress during bulk import

### Requirement 5: Liability Indexing

**User Story:** As a user, I want my liabilities indexed for search, so that I can find and query debt information.

#### Acceptance Criteria

1. WHEN a liability is created, THE **Integral** application SHALL index it in search_index with type "liability"
2. THE indexed content SHALL include: name, type, amount owed, interest rate, minimum payment, due date, and status
3. THE indexed content SHALL format as: "Liability: {name} ({type})\nAmount Owed: {amount}\nInterest Rate: {rate}%\nMinimum Payment: {payment}\nDue Date: {date}\nStatus: {status}"
4. THE metadata SHALL include: original_id, liability_type, amount, interest_rate, minimum_payment, due_date, is_active, created_at
5. THE status SHALL be "Active" if is_active is true, else "Paid Off"
6. WHEN bulk importing liabilities, THE **Integral** application SHALL skip already indexed liabilities
7. THE **Integral** application SHALL show progress during bulk import

### Requirement 6: Financial Goal Indexing

**User Story:** As a user, I want my financial goals indexed for search, so that I can find and query savings goals.

#### Acceptance Criteria

1. WHEN a financial goal is created, THE **Integral** application SHALL index it in search_index with type "financial_goal"
2. THE indexed content SHALL include: name, target amount, current amount, target date, and status
3. THE indexed content SHALL format as: "Financial Goal: {name}\nTarget: {target}\nCurrent: {current}\nTarget Date: {date}\nStatus: {status}"
4. THE metadata SHALL include: original_id, target_amount, current_amount, target_date, is_active, created_at
5. THE status SHALL be "Active" if is_active is true, else "Inactive"
6. WHEN bulk importing goals, THE **Integral** application SHALL skip already indexed goals
7. THE **Integral** application SHALL show progress during bulk import

### Requirement 7: Bulk Import Functionality

**User Story:** As a user, I want to bulk import all my financial data into the search index, so that I can search historical records.

#### Acceptance Criteria

1. THE **Integral** application SHALL provide "Import Financial Data" button in SearchModal
2. WHEN clicked, THE **Integral** application SHALL fetch all financial data: transactions, recurring, accounts, budgets, liabilities, goals, categories
3. THE **Integral** application SHALL create categoryMap and accountMap for name resolution
4. THE **Integral** application SHALL query search_index for already indexed items with types: transaction, recurring_transaction, account, liability, financial_goal, budget
5. THE **Integral** application SHALL skip items already in indexedIds set
6. THE **Integral** application SHALL calculate total items to import
7. THE **Integral** application SHALL show progress bar with current/total and item name
8. THE **Integral** application SHALL process items in order: transactions, recurring, accounts, budgets, liabilities, goals
9. THE **Integral** application SHALL support stop/cancel during import
10. THE **Integral** application SHALL show themed toast messages (Halloween vs normal)
11. WHEN import completes, THE **Integral** application SHALL show success toast with count of added items
12. WHEN import is cancelled, THE **Integral** application SHALL stop processing and show partial results

### Requirement 8: Search Integration

**User Story:** As a user, I want to search my financial data using natural language, so that I can find specific transactions, budgets, or accounts.

#### Acceptance Criteria

1. THE **Integral** application SHALL use existing askTheGrimoire function for financial queries
2. THE search SHALL return relevant financial records based on semantic similarity
3. THE **Integral** application SHALL format financial data in search results
4. THE **Integral** application SHALL support queries like "show me transactions over $100", "what are my active liabilities", "how much did I spend on groceries"
5. THE **Integral** application SHALL use match_threshold: 0.5 and match_count: 5 for financial searches
6. THE **Integral** application SHALL stream responses with financial insights
7. THE **Integral** application SHALL use themed prompts (Grimoire keeper vs AI assistant)

### Requirement 9: Real-Time Indexing

**User Story:** As a developer, I want financial data indexed in real-time, so that new records are immediately searchable.

#### Acceptance Criteria

1. THE **Integral** application SHALL call addToGrimoire after successful transaction creation
2. THE **Integral** application SHALL call addToGrimoire after successful recurring transaction creation
3. THE **Integral** application SHALL call addToGrimoire after successful account creation
4. THE **Integral** application SHALL call addToGrimoire after successful budget creation
5. THE **Integral** application SHALL call addToGrimoire after successful liability creation
6. THE **Integral** application SHALL call addToGrimoire after successful goal creation
7. THE indexing SHALL use await (not fire-and-forget)
8. THE indexing SHALL fail silently without blocking the main operation
9. THE **Integral** application SHALL add addToGrimoire to useCallback dependency arrays

### Requirement 10: Progress Tracking

**User Story:** As a user, I want to see progress when importing financial data, so that I know the system is working.

#### Acceptance Criteria

1. THE **Integral** application SHALL display progress bar during bulk import
2. THE progress bar SHALL show current/total items
3. THE progress bar SHALL show current item name being processed
4. THE **Integral** application SHALL update progress after each item
5. THE **Integral** application SHALL show different messages for different item types
6. THE **Integral** application SHALL reset progress to 0/0 when complete
7. THE **Integral** application SHALL support stop button during import
8. THE stop button SHALL set stopImportRef.current to true
9. THE import loop SHALL check stopImportRef.current and break if true

### Requirement 11: Database Migration

**User Story:** As a developer, I want budgets table to have icon field, so that budgets can be displayed with icons.

#### Acceptance Criteria

1. THE **Integral** application SHALL create migration 20251203033000_add_icon_to_budgets.sql
2. THE migration SHALL add icon column to budgets table with type VARCHAR(50)
3. THE migration SHALL set default value to 'DollarSign'
4. THE **Integral** application SHALL update Budget type definition to include icon field
5. THE **Integral** application SHALL update BudgetModal to include icon picker
6. THE **Integral** application SHALL update BudgetCard to display icon

### Requirement 12: Halloween Theme Integration

**User Story:** As a user, I want Halloween-themed messages for financial data import, so that the experience is consistent.

#### Acceptance Criteria

1. WHEN Halloween mode is enabled, THE **Integral** application SHALL use themed toast messages
2. THE import start message SHALL be "Summoning financial records..." vs "Syncing financial data..."
3. THE success message SHALL be "Resurrected {count} new financial records!" vs "Indexed {count} new records!"
4. THE error message SHALL be "Failed to summon financial data." vs "Failed to sync financial data."
5. THE already indexed message SHALL be "All financial records already in the Grimoire." vs "All records already indexed."
6. THE **Integral** application SHALL use consistent theming with other import functions
