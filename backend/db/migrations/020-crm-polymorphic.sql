-- Migration 020: Add generic polymorphic CRM columns to opportunities
-- Supports HubSpot, Salesforce, Pipedrive, Notion, Airtable, etc.
-- Old hubspot_* columns kept for backward compatibility during transition.

ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS crm_provider TEXT,
  ADD COLUMN IF NOT EXISTS crm_contact_id TEXT,
  ADD COLUMN IF NOT EXISTS crm_deal_id TEXT;

-- Backfill existing HubSpot data
UPDATE opportunities
SET crm_provider = 'hubspot',
    crm_contact_id = hubspot_contact_id,
    crm_deal_id = hubspot_deal_id
WHERE hubspot_contact_id IS NOT NULL OR hubspot_deal_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_opportunities_crm_provider
  ON opportunities(crm_provider) WHERE crm_provider IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_opportunities_crm_deal
  ON opportunities(crm_provider, crm_deal_id) WHERE crm_deal_id IS NOT NULL;
