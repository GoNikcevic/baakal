-- 042: A/B testing on nurture/activation emails
ALTER TABLE nurture_emails ADD COLUMN IF NOT EXISTS variant TEXT; -- 'A' or 'B'
ALTER TABLE nurture_emails ADD COLUMN IF NOT EXISTS ab_group_id TEXT; -- groups A/B pairs
ALTER TABLE nurture_emails ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;
ALTER TABLE nurture_emails ADD COLUMN IF NOT EXISTS sentiment TEXT; -- positive/negative/neutral

-- Add ab_enabled flag to triggers
ALTER TABLE nurture_triggers ADD COLUMN IF NOT EXISTS ab_enabled BOOLEAN DEFAULT false;
