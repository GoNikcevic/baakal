-- Add personalization JSONB column to opportunities
-- Stores: { context, icebreaker, sources, enrichedAt }
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS personalization JSONB;
