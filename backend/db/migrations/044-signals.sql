-- 044: Signal-based prospecting — detect buying signals and suggest prospects
CREATE TABLE IF NOT EXISTS signal_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  signal_types TEXT[] DEFAULT '{}',
  target_sectors TEXT[] DEFAULT '{}',
  target_titles TEXT[] DEFAULT '{}',
  target_company_sizes TEXT[] DEFAULT '{}',
  target_keywords TEXT[] DEFAULT '{}',
  target_competitors TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  frequency TEXT DEFAULT 'daily',
  last_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  config_id UUID REFERENCES signal_configs(id) ON DELETE SET NULL,
  signal_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  source TEXT,
  company_name TEXT,
  company_domain TEXT,
  contact_name TEXT,
  contact_title TEXT,
  contact_email TEXT,
  contact_linkedin TEXT,
  relevance_score INTEGER DEFAULT 50,
  status TEXT DEFAULT 'new',
  action_taken TEXT,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  detected_at TIMESTAMPTZ DEFAULT now(),
  actioned_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_signals_user_status ON signals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_signals_detected ON signals(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_signal_configs_user ON signal_configs(user_id);
