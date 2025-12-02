-- Redefine the function to use finance_accounts instead of accounts
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'expense' THEN
      UPDATE finance_accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'income' THEN
      UPDATE finance_accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'transfer' THEN
      UPDATE finance_accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
      UPDATE finance_accounts SET balance = balance + NEW.amount WHERE id = NEW.to_account_id;
    END IF;
    
  -- Handle DELETE
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'expense' THEN
      UPDATE finance_accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'income' THEN
      UPDATE finance_accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'transfer' THEN
      UPDATE finance_accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
      UPDATE finance_accounts SET balance = balance - OLD.amount WHERE id = OLD.to_account_id;
    END IF;

  -- Handle UPDATE
  ELSIF TG_OP = 'UPDATE' THEN
    -- Revert OLD
    IF OLD.type = 'expense' THEN
      UPDATE finance_accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'income' THEN
      UPDATE finance_accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'transfer' THEN
      UPDATE finance_accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
      UPDATE finance_accounts SET balance = balance - OLD.amount WHERE id = OLD.to_account_id;
    END IF;
    
    -- Apply NEW
    IF NEW.type = 'expense' THEN
      UPDATE finance_accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'income' THEN
      UPDATE finance_accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'transfer' THEN
      UPDATE finance_accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
      UPDATE finance_accounts SET balance = balance + NEW.amount WHERE id = NEW.to_account_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
