ALTER TABLE IF EXISTS budget_categories RENAME TO finance_categories;

ALTER INDEX IF EXISTS idx_budget_categories_user_id RENAME TO idx_finance_categories_user_id;
ALTER INDEX IF EXISTS idx_budget_categories_type RENAME TO idx_finance_categories_type;
ALTER INDEX IF EXISTS idx_budget_categories_parent_id RENAME TO idx_finance_categories_parent_id;

DROP TRIGGER IF EXISTS update_budget_categories_updated_at ON finance_categories;

CREATE TRIGGER update_finance_categories_updated_at
  BEFORE UPDATE ON finance_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Note: Policies are strings attached to the table. They will persist but might have confusing names if they referenced "budget_categories" in the name string.
-- The previous policies were named generically ("Users can view their own categories"), so they are fine.
