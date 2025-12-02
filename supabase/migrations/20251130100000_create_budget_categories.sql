CREATE TABLE IF NOT EXISTS finance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Tag',
  color TEXT NOT NULL DEFAULT '#8B5CF6',
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  parent_id UUID REFERENCES finance_categories(id) ON DELETE SET NULL,  
  budget_limit NUMERIC(15, 2),  
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false,  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_categories_user_id ON finance_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_categories_type ON finance_categories(type);
CREATE INDEX IF NOT EXISTS idx_finance_categories_parent_id ON finance_categories(parent_id);

ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories"
  ON finance_categories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories"
  ON finance_categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON finance_categories
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own non-system categories"
  ON finance_categories
  FOR DELETE
  USING (auth.uid() = user_id AND is_system = false);

CREATE TRIGGER update_finance_categories_updated_at
  BEFORE UPDATE ON finance_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO finance_categories (user_id, name, icon, color, type, is_system, is_active) 
SELECT 
  id,
  category_name,
  icon,
  color,
  'expense'::TEXT,
  true,
  true
FROM auth.users, (VALUES
  ('Food & Dining', 'Utensils', '#F59E0B'),
  ('Transport', 'Car', '#3B82F6'),
  ('Entertainment', 'Film', '#EC4899'),
  ('Utilities', 'Lightbulb', '#10B981'),
  ('Healthcare', 'Heart', '#EF4444'),
  ('Education', 'GraduationCap', '#8B5CF6'),
  ('Shopping', 'ShoppingCart', '#06B6D4'),
  ('Savings', 'PiggyBank', '#14B8A6'),
  ('Other', 'Tag', '#64748B')
) AS defaults(category_name, icon, color)
ON CONFLICT DO NOTHING;

INSERT INTO finance_categories (user_id, name, icon, color, type, is_system, is_active)
SELECT 
  id,
  category_name,
  icon,
  color,
  'income'::TEXT,
  true,
  true
FROM auth.users, (VALUES
  ('Salary', 'Briefcase', '#10B981'),
  ('Freelance', 'Laptop', '#3B82F6'),
  ('Investments', 'TrendingUp', '#F59E0B'),
  ('Gifts', 'Gift', '#EC4899'),
  ('Other Income', 'Plus', '#64748B')
) AS defaults(category_name, icon, color)
ON CONFLICT DO NOTHING;
