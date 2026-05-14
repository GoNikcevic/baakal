-- P6: Multi-user patterns — scope patterns by team and enable cross-team sharing

-- Team ownership: patterns belong to a team (NULL = global/legacy)
ALTER TABLE memory_patterns ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_memory_patterns_team ON memory_patterns(team_id);

-- Shared flag: opt-in anonymized sharing to the global pool
ALTER TABLE memory_patterns ADD COLUMN IF NOT EXISTS shared BOOLEAN DEFAULT false;
