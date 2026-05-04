-- 043: Deal value + lifecycle dates for analytics + renewal trigger
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS deal_value DECIMAL;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS won_date TIMESTAMPTZ;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS lost_date TIMESTAMPTZ;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS renewal_date TIMESTAMPTZ;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;
