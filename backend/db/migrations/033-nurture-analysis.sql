-- Track when nurture email responses were analyzed
ALTER TABLE nurture_emails ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ;
