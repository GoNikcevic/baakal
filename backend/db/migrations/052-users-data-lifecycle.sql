-- Lifecycle emails: add data JSONB to users for tracking sent onboarding/retention emails
ALTER TABLE users ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';
