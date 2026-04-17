-- Prospect activities table — stores individual events from Lemlist
-- (replies, opens, clicks, bounces) instead of just aggregate stats.
-- This enables the "Replies" tab in campaign detail.

CREATE TABLE IF NOT EXISTS prospect_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  lemlist_activity_id TEXT,
  type TEXT NOT NULL, -- emailsReplied, emailsOpened, emailsClicked, emailsBounced, emailsUnsubscribed
  lead_email TEXT,
  lead_first_name TEXT,
  lead_last_name TEXT,
  company_name TEXT,
  sequence_step INTEGER,
  happened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lemlist_activity_id)
);

CREATE INDEX idx_prospect_activities_campaign ON prospect_activities(campaign_id);
CREATE INDEX idx_prospect_activities_user ON prospect_activities(user_id);
CREATE INDEX idx_prospect_activities_type ON prospect_activities(type);
CREATE INDEX idx_prospect_activities_happened ON prospect_activities(happened_at DESC);
