-- Migration: Create goal_contributions table
-- This migration creates a table to track contributions to financial goals
-- with automatic goal amount updates via triggers

-- Create goal_contributions table
CREATE TABLE IF NOT EXISTS goal_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES financial_goals(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  category_id UUID REFERENCES finance_categories(id) ON DELETE SET NULL,
  source_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  notes TEXT,
  contributed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_goal_contributions_user ON goal_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal ON goal_contributions(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_category ON goal_contributions(category_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_account ON goal_contributions(source_account_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_date ON goal_contributions(contributed_at DESC);

-- Enable Row Level Security
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own contributions"
  ON goal_contributions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contributions"
  ON goal_contributions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contributions"
  ON goal_contributions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contributions"
  ON goal_contributions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_goal_contributions_updated_at
  BEFORE UPDATE ON goal_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update goal's current_amount when contribution is added/updated/deleted
CREATE OR REPLACE FUNCTION update_goal_amount_on_contribution()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Add contribution amount to goal
    UPDATE financial_goals
    SET 
      current_amount = current_amount + NEW.amount,
      updated_at = NOW()
    WHERE id = NEW.goal_id;
    RETURN NEW;
    
  ELSIF (TG_OP = 'DELETE') THEN
    -- Subtract contribution amount from goal (ensure it doesn't go below 0)
    UPDATE financial_goals
    SET 
      current_amount = GREATEST(current_amount - OLD.amount, 0),
      updated_at = NOW()
    WHERE id = OLD.goal_id;
    RETURN OLD;
    
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Handle amount changes
    IF (NEW.goal_id = OLD.goal_id) THEN
      -- Same goal, just adjust the difference
      UPDATE financial_goals
      SET 
        current_amount = current_amount - OLD.amount + NEW.amount,
        updated_at = NOW()
      WHERE id = NEW.goal_id;
    ELSE
      -- Different goal, subtract from old and add to new
      UPDATE financial_goals
      SET 
        current_amount = GREATEST(current_amount - OLD.amount, 0),
        updated_at = NOW()
      WHERE id = OLD.goal_id;
      
      UPDATE financial_goals
      SET 
        current_amount = current_amount + NEW.amount,
        updated_at = NOW()
      WHERE id = NEW.goal_id;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic goal amount updates
CREATE TRIGGER goal_contributions_update_goal_amount
  AFTER INSERT OR UPDATE OR DELETE ON goal_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_amount_on_contribution();

-- Add helpful comment
COMMENT ON TABLE goal_contributions IS 'Tracks individual contributions to financial goals with automatic goal amount updates';
COMMENT ON TRIGGER goal_contributions_update_goal_amount ON goal_contributions IS 'Automatically updates the financial_goals.current_amount when contributions are added, updated, or deleted';
