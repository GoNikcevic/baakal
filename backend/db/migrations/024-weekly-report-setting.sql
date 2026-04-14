ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS weekly_report BOOLEAN DEFAULT true;
COMMENT ON COLUMN user_profiles.weekly_report IS 'Opt-out for weekly email reports (default true = receive reports)';
