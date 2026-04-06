-- Allow new LinkedIn touchpoint subtypes (visit, invite, message)
-- Replaces the legacy CHECK that only accepted 'email' and 'linkedin'

ALTER TABLE touchpoints DROP CONSTRAINT IF EXISTS touchpoints_type_check;
ALTER TABLE touchpoints ADD CONSTRAINT touchpoints_type_check
  CHECK (type IN ('email', 'linkedin', 'linkedin_visit', 'linkedin_invite', 'linkedin_message'));

-- Optional: re-classify existing legacy 'linkedin' rows by step prefix
-- 'L1' or steps starting with 'LI' → linkedin_invite
-- steps starting with 'LV' → linkedin_visit
-- everything else linkedin → linkedin_message
UPDATE touchpoints
SET type = CASE
  WHEN UPPER(step) LIKE 'LV%' THEN 'linkedin_visit'
  WHEN UPPER(step) = 'L1' OR UPPER(step) LIKE 'LI%' THEN 'linkedin_invite'
  ELSE 'linkedin_message'
END
WHERE type = 'linkedin';
