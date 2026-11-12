ALTER TABLE clients ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '';
UPDATE clients SET code = id WHERE code IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS clients_code_idx ON clients(code) WHERE code IS NOT NULL;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS contract_value NUMERIC(18,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget NUMERIC(18,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS financial_currency TEXT NOT NULL DEFAULT 'EGP';

ALTER TABLE finance_transactions ADD COLUMN IF NOT EXISTS transaction_date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE finance_transactions ADD COLUMN IF NOT EXISTS created_by_name TEXT;

CREATE TABLE IF NOT EXISTS user_login_aliases (
  email TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS user_login_aliases_user_idx ON user_login_aliases(user_id);
DELETE FROM user_login_aliases WHERE lower(email)='owner@masonandarc.com';
