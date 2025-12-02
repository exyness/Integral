-- Migration: Add goal category support and migrate is_system to category_type
-- This migration:
-- 1. Adds category_type column to replace is_system boolean
-- 2. Migrates existing data from is_system to category_type
-- 3. Adds 'goal' type support to finance_categories
-- 4. Adds default goal categories
-- 5. Links financial_goals to categories

-- Step 1: Add the new category_type column (initially nullable)
ALTER TABLE finance_categories
  ADD COLUMN IF NOT EXISTS category_type TEXT;

-- Step 2: Migrate existing data from is_system to category_type
UPDATE finance_categories
SET category_type = CASE 
  WHEN is_system = true THEN 'system'
  ELSE 'user'
END
WHERE category_type IS NULL;

-- Step 3: Make category_type NOT NULL with constraint
ALTER TABLE finance_categories
  ALTER COLUMN category_type SET NOT NULL,
  ALTER COLUMN category_type SET DEFAULT 'user';

ALTER TABLE finance_categories
  ADD CONSTRAINT finance_categories_category_type_check 
  CHECK (category_type IN ('system', 'user'));

-- Step 4: Drop the old RLS policy that depends on is_system (MUST BE DONE BEFORE DROPPING COLUMN)
DROP POLICY IF EXISTS "Users can delete their own non-system categories" ON finance_categories;

-- Step 5: Create new RLS policy using category_type
CREATE POLICY "Users can delete their own user categories"
  ON finance_categories
  FOR DELETE
  USING (auth.uid() = user_id AND category_type = 'user');

-- Step 6: Now we can safely drop the is_system column
ALTER TABLE finance_categories
  DROP COLUMN IF EXISTS is_system;

-- Step 7: Add 'goal' type support to finance_categories
-- Drop both old constraint name (from before table rename) and new one
ALTER TABLE finance_categories 
  DROP CONSTRAINT IF EXISTS budget_categories_type_check;

ALTER TABLE finance_categories 
  DROP CONSTRAINT IF EXISTS finance_categories_type_check;

ALTER TABLE finance_categories
  ADD CONSTRAINT finance_categories_type_check 
  CHECK (type IN ('expense', 'income', 'goal'));

-- Step 7: Add default goal categories for all existing users
INSERT INTO finance_categories (user_id, name, icon, color, type, category_type, is_active)
SELECT 
  id,
  category_name,
  icon,
  color,
  'goal'::TEXT,
  'system'::TEXT,
  true
FROM auth.users, (VALUES
  ('Savings Goal', 'PiggyBank', '#F59E0B'),
  ('Emergency Fund', 'Shield', '#EF4444'),
  ('Vacation', 'Plane', '#06B6D4'),
  ('Home Purchase', 'Home', '#10B981'),
  ('Education', 'GraduationCap', '#8B5CF6'),
  ('Retirement', 'TrendingUp', '#14B8A6'),
  ('Investment', 'TrendingUp', '#3B82F6'),
  ('Vehicle', 'Car', '#F97316')
) AS defaults(category_name, icon, color)
ON CONFLICT DO NOTHING;

-- Step 8: Add category_id to financial_goals table
ALTER TABLE financial_goals
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES finance_categories(id) ON DELETE SET NULL;

-- Step 9: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_financial_goals_category ON financial_goals(category_id);
CREATE INDEX IF NOT EXISTS idx_finance_categories_type_category_type ON finance_categories(type, category_type);
