-- Add parent_id to finance_categories for subcategory support
ALTER TABLE finance_categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES finance_categories(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_finance_categories_parent_id ON finance_categories(parent_id);

-- Update RLS policies if necessary (existing ones should cover this as they are based on user_id)
-- But we might want to ensure that a parent category belongs to the same user (application logic should handle this, but good to be aware)
