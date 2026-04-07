-- A/B testing infrastructure + anonymized cross-user memory

-- 1. Campaign-level A/B test config (what categories were tested, hypothesis)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS ab_config JSONB DEFAULT NULL;

-- 2. Memory patterns: category typing + traceability + custom extension
ALTER TABLE memory_patterns ADD COLUMN IF NOT EXISTS ab_category TEXT;  -- 'angle' | 'tone' | 'length' | 'hook' | 'specificity' | null
ALTER TABLE memory_patterns ADD COLUMN IF NOT EXISTS custom_category TEXT;  -- future: user-defined dimensions
ALTER TABLE memory_patterns ADD COLUMN IF NOT EXISTS source_test_id UUID REFERENCES versions(id) ON DELETE SET NULL;
ALTER TABLE memory_patterns ADD COLUMN IF NOT EXISTS sample_size INTEGER DEFAULT 0;
ALTER TABLE memory_patterns ADD COLUMN IF NOT EXISTS improvement_pct NUMERIC;
ALTER TABLE memory_patterns ADD COLUMN IF NOT EXISTS confirmations INTEGER DEFAULT 1;  -- increments when another test confirms the same pattern

-- 3. Index for fast lookup by segment + category (core query for recommendation engine)
CREATE INDEX IF NOT EXISTS idx_memory_patterns_category ON memory_patterns(ab_category);
CREATE INDEX IF NOT EXISTS idx_memory_patterns_sectors ON memory_patterns USING GIN (sectors);
CREATE INDEX IF NOT EXISTS idx_memory_patterns_targets ON memory_patterns USING GIN (targets);

-- 4. Versions table: track which touchpoints were tested
ALTER TABLE versions ADD COLUMN IF NOT EXISTS tested_steps TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE versions ADD COLUMN IF NOT EXISTS ab_categories TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Note: memory_patterns entries are ANONYMIZED by convention before insert:
-- - No verbatim message text (only structural descriptions)
-- - No company names, prospect names, emails
-- - Segment is aggregated (sector + size + target role level, no client identifiers)
