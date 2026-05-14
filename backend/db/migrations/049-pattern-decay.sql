-- P3: Pattern decay — track when a pattern was last confirmed for automatic confidence decay
ALTER TABLE memory_patterns ADD COLUMN IF NOT EXISTS last_confirmed_at TIMESTAMPTZ;

-- Backfill: set last_confirmed_at to date_discovered for existing patterns
UPDATE memory_patterns SET last_confirmed_at = date_discovered WHERE last_confirmed_at IS NULL;
