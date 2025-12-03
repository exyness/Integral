-- Add icon column to budgets table
ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS icon TEXT;

-- Add comment to document the column
COMMENT ON COLUMN budgets.icon IS 'Icon name/identifier for the budget (e.g., "Wallet", "ShoppingCart", etc.)';
