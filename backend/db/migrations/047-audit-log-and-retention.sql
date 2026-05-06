-- 047: Audit log table + data retention policy
-- Security audit P2: centralized audit logging + automated retention

-- =============================================
-- Audit Log (immutable, append-only)
-- =============================================
CREATE TABLE IF NOT EXISTS audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  resource_type   TEXT NOT NULL,
  resource_id     TEXT,
  details         JSONB DEFAULT '{}',
  ip_address      TEXT,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access audit logs (not end users)
CREATE POLICY "Service role only" ON audit_log
  FOR ALL USING (
    current_setting('role') = 'service_role'
  )
  WITH CHECK (
    current_setting('role') = 'service_role'
  );

-- =============================================
-- Data retention: auto-cleanup old records
-- =============================================

-- Audit logs: keep 1 year
-- Nurture emails (sent): keep 6 months
-- Notifications (read): keep 3 months
-- Prospect activities: keep 1 year
-- Chat messages in deleted threads: cascade handled by FK

-- Run these periodically (see retention-cleanup.js):
-- DELETE FROM audit_log WHERE created_at < now() - interval '1 year';
-- DELETE FROM nurture_emails WHERE status = 'sent' AND created_at < now() - interval '6 months';
-- DELETE FROM notifications WHERE read = true AND created_at < now() - interval '3 months';
-- DELETE FROM prospect_activities WHERE created_at < now() - interval '1 year';
