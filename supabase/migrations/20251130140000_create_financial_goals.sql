-- Create financial_goals table
CREATE TABLE IF NOT EXISTS financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC(15, 2) NOT NULL,
  current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  target_date DATE,
  linked_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  icon TEXT NOT NULL DEFAULT 'target',
  color TEXT NOT NULL DEFAULT '#8B5CF6',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying by user
CREATE INDEX IF NOT EXISTS idx_financial_goals_user ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_linked_account ON financial_goals(linked_account_id);

-- RLS Policies
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals"
  ON financial_goals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
  ON financial_goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON financial_goals
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON financial_goals
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_financial_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER financial_goals_updated_at
  BEFORE UPDATE ON financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_goals_updated_at();
