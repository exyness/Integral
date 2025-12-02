DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS liabilities CASCADE;

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'credit_card', 'digital_wallet', 'investment', 'savings')),
  icon TEXT NOT NULL DEFAULT 'Wallet',
  color TEXT NOT NULL DEFAULT '#8B5CF6',
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  include_in_total BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);

CREATE INDEX idx_accounts_type ON accounts(type);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts"
  ON accounts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts"
  ON accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON accounts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON accounts
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE liabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('loan', 'credit_card', 'mortgage', 'other')),
  icon TEXT NOT NULL DEFAULT 'CreditCard',
  color TEXT NOT NULL DEFAULT '#EF4444',
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  interest_rate NUMERIC(5, 2),
  due_date DATE,
  minimum_payment NUMERIC(15, 2),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_liabilities_user_id ON liabilities(user_id);

CREATE INDEX idx_liabilities_type ON liabilities(type);

ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own liabilities"
  ON liabilities
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own liabilities"
  ON liabilities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own liabilities"
  ON liabilities
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own liabilities"
  ON liabilities
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_liabilities_updated_at
  BEFORE UPDATE ON liabilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
