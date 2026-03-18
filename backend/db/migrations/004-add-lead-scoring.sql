ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS score INTEGER;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS score_breakdown JSONB;
CREATE INDEX IF NOT EXISTS idx_opportunities_score ON opportunities (score) WHERE score IS NOT NULL;
