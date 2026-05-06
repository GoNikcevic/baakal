-- 046: Enable RLS on settings and refresh_tokens tables
-- Security audit P0: these tables were missing RLS policies

-- =============================================
-- Settings: restrict to service role only (no direct user access)
-- =============================================
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON settings;
CREATE POLICY "Service role only" ON settings
  FOR ALL USING (
    current_setting('role') = 'service_role'
  )
  WITH CHECK (
    current_setting('role') = 'service_role'
  );

-- =============================================
-- Refresh tokens: users can only see/manage their own tokens
-- =============================================
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON refresh_tokens;

-- Service role (backend) gets full access
CREATE POLICY "Service role manages all tokens" ON refresh_tokens
  FOR ALL USING (
    current_setting('role') = 'service_role'
  )
  WITH CHECK (
    current_setting('role') = 'service_role'
  );

-- Users can only see their own tokens (if accessed via Supabase client)
CREATE POLICY "Users manage own tokens" ON refresh_tokens
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
