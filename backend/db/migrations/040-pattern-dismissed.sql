-- 040: Soft-delete for memory patterns — dismissed patterns won't be recreated for 7 days
ALTER TABLE memory_patterns ADD COLUMN IF NOT EXISTS dismissed_at TIMESTAMPTZ;
