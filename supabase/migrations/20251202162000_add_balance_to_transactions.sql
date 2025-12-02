-- Add balance column to budget_transactions table
ALTER TABLE budget_transactions ADD COLUMN IF NOT EXISTS balance numeric;

-- Comment on column
COMMENT ON COLUMN budget_transactions.balance IS 'Snapshot of account balance after this transaction';
