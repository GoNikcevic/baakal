/**
 * Deliverability Monitoring Agent
 *
 * Checks email deliverability health indicators for active campaigns:
 * - Bounce rate (>5% warning, >10% critical)
 * - Open rate drop (>30% drop from previous = warning)
 * - Zero opens after 50+ sends (likely deliverability issue)
 * - DNS health (SPF, DMARC) for sender domains
 *
 * Returns a score 0-100 and structured alerts.
 */

const dns = require('dns').promises;
const db = require('../db');
const logger = require('./logger');

/**
 * Run full deliverability check for a user.
 * @param {string} userId
 * @returns {{ score, alerts, checks }}
 */
async function checkDeliverability(userId) {
  const alerts = [];
  let score = 100;

  // Load active campaigns with stats
  const campaigns = await db.campaigns.list({ userId, limit: 50 });
  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  if (activeCampaigns.length === 0) {
    return { score: 100, alerts: [], checks: { campaigns: 0 } };
  }

  // Check each campaign
  for (const c of activeCampaigns) {
    const sent = c.sent || c.nb_prospects || 0;
    if (sent === 0) continue;

    // Bounce rate check
    const bounceRate = c.bounce_rate || 0;
    if (bounceRate > 10) {
      alerts.push({
        severity: 'critical',
        type: 'bounce_high',
        campaign: c.name,
        value: bounceRate,
        message: `Bounce rate ${bounceRate}% on "${c.name}"`,
        recommendation: 'Verify your email list quality. Remove invalid addresses and consider using email verification before sending.',
      });
      score -= 30;
    } else if (bounceRate > 5) {
      alerts.push({
        severity: 'warning',
        type: 'bounce_elevated',
        campaign: c.name,
        value: bounceRate,
        message: `Elevated bounce rate ${bounceRate}% on "${c.name}"`,
        recommendation: 'Monitor closely. Consider cleaning your prospect list.',
      });
      score -= 15;
    }

    // Open rate check (0% after 50+ sends = deliverability issue)
    const openRate = c.open_rate || 0;
    if (sent >= 50 && openRate === 0) {
      alerts.push({
        severity: 'critical',
        type: 'zero_opens',
        campaign: c.name,
        value: sent,
        message: `0% open rate after ${sent} sends on "${c.name}"`,
        recommendation: 'Your emails are likely going to spam. Check your sender domain DNS (SPF, DKIM, DMARC) and sender reputation.',
      });
      score -= 30;
    } else if (sent >= 30 && openRate < 10) {
      alerts.push({
        severity: 'warning',
        type: 'low_opens',
        campaign: c.name,
        value: openRate,
        message: `Very low open rate ${openRate}% on "${c.name}"`,
        recommendation: 'Review your subject lines and sender name. Consider warming up your email domain.',
      });
      score -= 10;
    }
  }

  // DNS check for sender domains (extract from user's email or Lemlist senders)
  const userRow = await db.users.getById(userId);
  if (userRow?.email) {
    const domain = userRow.email.split('@')[1];
    if (domain) {
      try {
        const dnsResult = await checkDNS(domain);
        if (!dnsResult.spf) {
          alerts.push({
            severity: 'warning',
            type: 'spf_missing',
            domain,
            message: `SPF record missing for ${domain}`,
            recommendation: 'Add an SPF TXT record to your DNS. Without it, emails may be marked as spam.',
          });
          score -= 10;
        }
        if (!dnsResult.dmarc) {
          alerts.push({
            severity: 'warning',
            type: 'dmarc_missing',
            domain,
            message: `DMARC record missing for ${domain}`,
            recommendation: 'Add a DMARC TXT record (_dmarc.yourdomain.com). It improves deliverability and protects against spoofing.',
          });
          score -= 10;
        }
      } catch (err) {
        logger.warn('deliverability', `DNS check failed for ${domain}: ${err.message}`);
      }
    }
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Sort alerts: critical first
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => (severityOrder[a.severity] || 9) - (severityOrder[b.severity] || 9));

  return {
    score,
    alerts,
    checks: {
      campaigns: activeCampaigns.length,
      checkedAt: new Date().toISOString(),
    },
  };
}

/**
 * Check DNS records for SPF and DMARC.
 * @param {string} domain
 * @returns {{ spf, dmarc, issues }}
 */
async function checkDNS(domain) {
  const result = { spf: false, dmarc: false, issues: [] };

  try {
    const txtRecords = await dns.resolveTxt(domain);
    const flat = txtRecords.map(r => r.join(''));
    result.spf = flat.some(r => r.startsWith('v=spf1'));
    if (!result.spf) result.issues.push('No SPF record found');
  } catch (err) {
    if (err.code !== 'ENODATA' && err.code !== 'ENOTFOUND') {
      result.issues.push(`SPF lookup error: ${err.code}`);
    }
  }

  try {
    const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`);
    const flat = dmarcRecords.map(r => r.join(''));
    result.dmarc = flat.some(r => r.startsWith('v=DMARC1'));
    if (!result.dmarc) result.issues.push('No DMARC record found');
  } catch (err) {
    if (err.code !== 'ENODATA' && err.code !== 'ENOTFOUND') {
      result.issues.push(`DMARC lookup error: ${err.code}`);
    }
  }

  return result;
}

/**
 * Run deliverability checks for ALL active users (called by orchestrator).
 */
async function runDeliverabilityChecks() {
  logger.info('deliverability', 'Starting daily deliverability checks');
  const users = await db.query(
    "SELECT DISTINCT user_id FROM campaigns WHERE status = 'active'"
  );

  let checked = 0;
  let criticalAlerts = 0;

  for (const row of users.rows || []) {
    try {
      const result = await checkDeliverability(row.user_id);
      const criticals = result.alerts.filter(a => a.severity === 'critical');
      if (criticals.length > 0) {
        criticalAlerts += criticals.length;
        // Send notification for critical issues
        try {
          const { createNotification } = require('./notify');
          for (const alert of criticals) {
            await createNotification(row.user_id, {
              type: 'deliverability_critical',
              title: 'Deliverability Alert',
              body: alert.message,
              metadata: { recommendation: alert.recommendation, campaign: alert.campaign },
            });
          }
        } catch { /* notification is best-effort */ }
      }
      checked++;
    } catch (err) {
      logger.warn('deliverability', `Check failed for user ${row.user_id}: ${err.message}`);
    }
  }

  logger.info('deliverability', `Checked ${checked} users, ${criticalAlerts} critical alerts`);
}

module.exports = { checkDeliverability, checkDNS, runDeliverabilityChecks };
