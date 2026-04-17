-- Add content column to store reply text from Lemlist activities API
ALTER TABLE prospect_activities ADD COLUMN IF NOT EXISTS content TEXT;
