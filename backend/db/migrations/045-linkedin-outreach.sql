-- 045: LinkedIn outreach tracking
CREATE TABLE IF NOT EXISTS linkedin_outreach (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signal_id UUID REFERENCES signals(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- connection, message, profile_view
  linkedin_url TEXT,
  message TEXT,
  status TEXT DEFAULT 'sent', -- sent, accepted, followed_up, replied, ignored
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_linkedin_outreach_user ON linkedin_outreach(user_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_outreach_signal ON linkedin_outreach(signal_id);
