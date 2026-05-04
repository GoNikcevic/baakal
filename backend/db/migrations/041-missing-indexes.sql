-- 041: Missing indexes found during performance audit
CREATE INDEX IF NOT EXISTS idx_nurture_emails_to_email ON nurture_emails(to_email);
CREATE INDEX IF NOT EXISTS idx_nurture_emails_opportunity ON nurture_emails(opportunity_id) WHERE opportunity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_nurture_emails_team_campaign ON nurture_emails(team_campaign_id) WHERE team_campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_nurture_emails_user_created ON nurture_emails(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opl_product_line ON opportunity_product_lines(product_line_id);
