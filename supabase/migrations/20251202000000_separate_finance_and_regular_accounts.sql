-- Drop the incorrectly merged accounts table
DROP TABLE IF EXISTS accounts CASCADE;

-- Create the finance_accounts table for budget/finance features
CREATE TABLE finance_accounts (
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

CREATE INDEX idx_finance_accounts_user_id ON finance_accounts(user_id);
CREATE INDEX idx_finance_accounts_type ON finance_accounts(type);

ALTER TABLE finance_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own finance accounts"
  ON finance_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own finance accounts"
  ON finance_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own finance accounts"
  ON finance_accounts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own finance accounts"
  ON finance_accounts
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_finance_accounts_updated_at
  BEFORE UPDATE ON finance_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create the accounts table for Account Manager (credentials manager)
CREATE TABLE accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    folder_id uuid,
    title text NOT NULL,
    platform text NOT NULL,
    email_username text NOT NULL,
    password text NOT NULL,
    usage_type text DEFAULT 'custom'::text NOT NULL,
    usage_limit integer,
    current_usage integer DEFAULT 0,
    reset_period text DEFAULT 'monthly'::text,
    description text,
    tags text[] DEFAULT '{}'::text[],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT accounts_reset_period_check CHECK ((reset_period = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text, 'yearly'::text, 'never'::text])))
);

ALTER TABLE accounts OWNER TO postgres;
ALTER TABLE ONLY accounts ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);

ALTER TABLE ONLY accounts
    ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY accounts
    ADD CONSTRAINT accounts_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES folders(id);

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

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
