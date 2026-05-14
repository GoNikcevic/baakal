-- P0: Pattern traceability — track which memory patterns influenced each nurture email
-- This enables ROI calculation per pattern and automatic confidence adjustment

ALTER TABLE nurture_emails ADD COLUMN IF NOT EXISTS pattern_ids UUID[] DEFAULT '{}';

-- Index for querying "which emails used pattern X"
CREATE INDEX IF NOT EXISTS idx_nurture_emails_pattern_ids ON nurture_emails USING GIN (pattern_ids);
