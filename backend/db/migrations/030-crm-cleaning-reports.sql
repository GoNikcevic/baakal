-- CRM Cleaning Reports — stores scan results + applied fixes
CREATE TABLE IF NOT EXISTS crm_cleaning_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_contacts INTEGER DEFAULT 0,
  summary JSONB NOT NULL DEFAULT '{}',
  issues JSONB NOT NULL DEFAULT '[]',
  fixes_applied JSONB DEFAULT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_crm_cleaning_reports_user ON crm_cleaning_reports(user_id);
