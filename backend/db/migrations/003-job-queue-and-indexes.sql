-- Migration 003: Job queue table + performance indexes for 1000+ users
-- Run this in Supabase SQL Editor

-- =============================================
-- Job Queue (replaces in-memory queue)
-- =============================================

CREATE TABLE IF NOT EXISTS job_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, dead
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  run_after TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Index for claiming next job (hot path)
CREATE INDEX IF NOT EXISTS idx_job_queue_pending
  ON job_queue (priority DESC, created_at ASC)
  WHERE status = 'pending';

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_job_queue_completed
  ON job_queue (completed_at)
  WHERE status = 'completed';

-- =============================================
-- Performance indexes for existing tables
-- =============================================

-- Campaigns: user lookup (most common query)
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns (user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_status ON campaigns (user_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_lemlist_id ON campaigns (lemlist_id) WHERE lemlist_id IS NOT NULL;

-- Touchpoints: campaign lookup
CREATE INDEX IF NOT EXISTS idx_touchpoints_campaign_id ON touchpoints (campaign_id);

-- Diagnostics: campaign lookup + date ordering
CREATE INDEX IF NOT EXISTS idx_diagnostics_campaign_id ON diagnostics (campaign_id);
CREATE INDEX IF NOT EXISTS idx_diagnostics_date ON diagnostics (date_analyse DESC);

-- Versions: campaign lookup
CREATE INDEX IF NOT EXISTS idx_versions_campaign_id ON versions (campaign_id);

-- Chat: thread lookup by user
CREATE INDEX IF NOT EXISTS idx_chat_threads_user_id ON chat_threads (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON chat_messages (thread_id);

-- Opportunities: user lookup
CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON opportunities (user_id);

-- Reports: user lookup
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports (user_id);

-- Chart data: user lookup
CREATE INDEX IF NOT EXISTS idx_chart_data_user_id ON chart_data (user_id);

-- Documents: user lookup
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents (user_id);

-- Projects: user lookup
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects (user_id);

-- Project files: project lookup
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files (project_id);

-- Refresh tokens: cleanup by expiry
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens (expires_at);

-- User integrations: user+provider lookup
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_provider ON user_integrations (user_id, provider);

-- Memory patterns: category + confidence filtering
CREATE INDEX IF NOT EXISTS idx_memory_patterns_category ON memory_patterns (category);
