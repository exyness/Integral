-- Create net_worth_snapshots table
CREATE TABLE IF NOT EXISTS net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_assets NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total_liabilities NUMERIC(15, 2) NOT NULL DEFAULT 0,
  net_worth NUMERIC(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one snapshot per day per user
  UNIQUE(user_id, date)
);

-- Index for querying by date range
CREATE INDEX IF NOT EXISTS idx_net_worth_snapshots_user_date ON net_worth_snapshots(user_id, date);

-- RLS Policies
ALTER TABLE net_worth_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own snapshots"
  ON net_worth_snapshots
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own snapshots"
  ON net_worth_snapshots
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own snapshots"
  ON net_worth_snapshots
  FOR DELETE
  USING (auth.uid() = user_id);
