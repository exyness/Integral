# Design Document

## Introduction

This document provides the technical design for the Financial RAG Search System. The system extends the existing RAG search infrastructure (Feature #10) to include financial data, enabling semantic search across transactions, budgets, accounts, liabilities, goals, and recurring transactions. The implementation leverages the existing search_index table, pgvector extension, and Gemini embeddings to provide natural language querying of financial records.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SearchModal Component                   │
│  ┌────────────┬────────────┬────────────┬─────────────────┐ │
│  │  Journal   │   Notes    │   Tasks    │    Finance      │ │
│  │  Import    │   Import   │   Import   │    Import       │ │
│  └────────────┴────────────┴────────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  useSpookyAI │   │   Supabase   │   │   Gemini     │
│     Hook     │◄──┤   Client     │◄──┤  Embeddings  │
│              │   │              │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │
        ▼                   ▼
┌──────────────┐   ┌──────────────┐
│ addToGrimoire│   │search_index  │
│askTheGrimoire│   │   (pgvector) │
└──────────────┘   └──────────────┘
```

### Data Flow

```
Financial Data Creation
        │
        ▼
Create/Update Hook (useBudgetsQuery, useGoals, useLiabilities)
        │
        ▼
Call addToGrimoire with content + metadata
        │
        ▼
Generate Embedding (Gemini API)
        │
        ▼
Insert into search_index table
        │
        ▼
Available for Semantic Search
```

## Data Models

### Indexed Financial Data Types

#### Transaction Index Entry

```typescript
{
  content: `Transaction: ${amount} - ${description}
Category: ${category}
Account: ${account}
Date: ${date}
Type: ${type}`,
  metadata: {
    type: "transaction",
    original_id: string,
    amount: number,
    category: string,
    category_id: string,
    account_name: string,
    account_id: string,
    transaction_date: string,
    transaction_type: "expense" | "income" | "transfer",
    created_at: string,
    tags: string[]
  }
}
```

#### Recurring Transaction Index Entry

```typescript
{
  content: `Transaction: ${amount} - ${description} (Recurring)
Category: ${category}
Account: ${account}
Date: ${next_run_date}
Type: ${type}`,
  metadata: {
    type: "recurring_transaction",
    original_id: string,
    amount: number,
    category: string,
    category_id: string,
    account_name: string,
    account_id: string,
    next_run_date: string,
    interval: "daily" | "weekly" | "monthly" | "yearly",
    active: boolean,
    created_at: string
  }
}
```

#### Account Index Entry

```typescript
{
  content: `Account: ${name} (${type})
Current Balance: ${balance} ${currency}
Status: Active`,
  metadata: {
    type: "account",
    original_id: string,
    account_type: "cash" | "bank" | "credit_card" | "digital_wallet" | "investment" | "savings",
    balance: number,
    currency: string,
    include_in_total: boolean,
    created_at: string
  }
}
```

#### Budget Index Entry

```typescript
{
  content: `Budget: ${name}
Category: ${category}
Amount: ${amount}
Spent: ${spent}
Period: ${period}
Status: ${status}`,
  metadata: {
    type: "budget",
    original_id: string,
    amount: number,
    spent: number,
    category: string,
    period: string,
    start_date: string,
    end_date: string,
    created_at: string
  }
}
```

#### Liability Index Entry

```typescript
{
  content: `Liability: ${name} (${type})
Amount Owed: ${amount}
Interest Rate: ${interest_rate}%
Minimum Payment: ${minimum_payment}
Due Date: ${due_date}
Status: ${status}`,
  metadata: {
    type: "liability",
    original_id: string,
    liability_type: "loan" | "credit_card" | "mortgage" | "other",
    amount: number,
    interest_rate: number,
    minimum_payment: number,
    due_date: string,
    is_active: boolean,
    created_at: string
  }
}
```

#### Financial Goal Index Entry

```typescript
{
  content: `Financial Goal: ${name}
Target: ${target_amount}
Current: ${current_amount}
Target Date: ${target_date}
Status: ${status}`,
  metadata: {
    type: "financial_goal",
    original_id: string,
    target_amount: number,
    current_amount: number,
    target_date: string,
    is_active: boolean,
    created_at: string
  }
}
```

## Component Design

### SearchModal Enhancement

**Purpose:** Add financial data import functionality to existing SearchModal

**New State:**

- `isImportingFinance: boolean` - Track financial import status
- `importProgress: { current: number, total: number, item: string }` - Track progress

**New Functions:**

#### handleImportFinance

```typescript
const handleImportFinance = async () => {
  // 1. Set importing state
  setIsImportingFinance(true);
  stopImportRef.current = false;

  // 2. Show themed toast
  toast.info(isHalloweenMode ? "Summoning financial records..." : "Syncing financial data...");

  // 3. Fetch all financial data
  const { data: transactions } = await supabase.from("budget_transactions").select("*");
  const { data: recurring } = await supabase.from("recurring_transactions").select("*");
  const { data: accounts } = await supabase.from("finance_accounts").select("*");
  const { data: liabilities } = await supabase.from("liabilities").select("*");
  const { data: goals } = await supabase.from("financial_goals").select("*");
  const { data: categories } = await supabase.from("finance_categories").select("*");
  const { data: budgets } = await supabase.from("budgets").select("*");

  // 4. Create lookup maps
  const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || []);
  const accountMap = new Map(accounts?.map(a => [a.id, a.name]) || []);

  // 5. Get already indexed items
  const { data: indexed } = await supabase
    .from("search_index")
    .select("metadata")
    .in("metadata->>type", ["transaction", "recurring_transaction", "account", "liability", "financial_goal", "budget"]);

  const indexedIds = new Set(indexed?.map(i => i.metadata.original_id) || []);

  // 6. Calculate total and set progress
  const totalItems = (transactions?.length || 0) + (recurring?.length || 0) + ...;
  setImportProgress({ current: 0, total: totalItems, item: "financial data" });

  // 7. Index each type with progress updates
  // ... (see implementation)

  // 8. Show success toast
  toast.success(themed message with count);
};
```

### Hook Enhancements

#### useBudgetsQuery Enhancement

**New Mutations:**

- `useIndexTransaction` - Index transaction after creation
- `useIndexRecurringTransaction` - Index recurring transaction after creation
- `useIndexBudget` - Index budget after creation

**Pattern:**

```typescript
export const useIndexTransaction = () => {
  const { addToGrimoire } = useSpookyAI();

  return useMutation({
    mutationFn: async (transaction: BudgetTransaction) => {
      const content = formatTransactionContent(transaction);
      const metadata = buildTransactionMetadata(transaction);
      await addToGrimoire(content, metadata);
    },
    onError: (error) => {
      console.error("Failed to index transaction:", error);
      // Silent failure - don't block main operation
    },
  });
};
```

#### useGoals Enhancement

**New Mutation:**

- `useIndexGoal` - Index financial goal after creation

#### useLiabilities Enhancement

**New Mutation:**

- `useIndexLiability` - Index liability after creation

## Database Schema

### Migration: 20251203033000_add_icon_to_budgets.sql

```sql
-- Add icon column to budgets table
ALTER TABLE budgets
ADD COLUMN icon VARCHAR(50) DEFAULT 'DollarSign';
```

### Updated Budget Type

```typescript
interface Budget {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  spent: number;
  category?: string;
  period: string;
  start_date: string;
  end_date: string;
  icon: string; // NEW
  created_at: string;
  updated_at: string;
}
```

## Implementation Strategy

### Phase 1: Database Migration

1. Create migration to add icon column to budgets table
2. Update Budget type definition
3. Update BudgetModal to include icon picker
4. Update BudgetCard to display icon

### Phase 2: SearchModal Enhancement

1. Add financial import button to SearchModal
2. Implement handleImportFinance function
3. Add progress tracking state
4. Implement category and account name resolution
5. Add themed toast messages

### Phase 3: Real-Time Indexing

1. Add indexing calls to transaction creation hooks
2. Add indexing calls to recurring transaction creation hooks
3. Add indexing calls to account creation hooks
4. Add indexing calls to budget creation hooks
5. Add indexing calls to liability creation hooks
6. Add indexing calls to goal creation hooks

### Phase 4: Testing

1. Test bulk import with existing data
2. Test real-time indexing on new records
3. Test search queries for financial data
4. Test progress tracking and cancellation
5. Test themed messages in Halloween mode

## Search Query Examples

Users can query financial data using natural language:

- "Show me all transactions over $100 last month"
- "What are my active liabilities?"
- "How much did I spend on groceries?"
- "What's my current account balance?"
- "Show me my savings goals"
- "List all recurring bills"
- "What budgets am I over on?"
- "Show me my largest expenses"

The system will:

1. Generate embedding for the query
2. Find similar financial records using cosine similarity
3. Pass relevant records to LLM as context
4. Generate natural language response with insights

## Error Handling

- Silent failure for indexing errors (don't block main operations)
- User-friendly error messages for bulk import failures
- Progress tracking allows cancellation mid-import
- Already indexed items are skipped to avoid duplicates
- Network errors show themed toast messages

## Performance Considerations

- Bulk import processes items sequentially to avoid overwhelming the API
- Progress updates after each item for user feedback
- Already indexed items are filtered out before processing
- Category and account maps created once for efficient lookups
- Stop functionality allows user to cancel long imports
