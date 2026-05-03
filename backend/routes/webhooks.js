/**
 * Webhook Routes — Receive real-time events from CRM providers
 *
 * POST /api/webhooks/pipedrive — Pipedrive webhook (person/deal events)
 *
 * These routes are PUBLIC (no JWT auth) but validated via shared secret.
 */

const { Router } = require('express');
const db = require('../db');
const logger = require('../lib/logger');

const router = Router();

const PIPEDRIVE_WEBHOOK_SECRET = process.env.PIPEDRIVE_WEBHOOK_SECRET || null;

/**
 * POST /api/webhooks/pipedrive
 *
 * Pipedrive sends webhooks for:
 * - updated.person, added.person, deleted.person
 * - updated.deal, added.deal, deleted.deal
 * - updated.activity, added.activity
 *
 * Payload: { current: {...}, previous: {...}, event: "updated.person", meta: { action, object, id, company_id, user_id } }
 */
router.post('/pipedrive', async (req, res) => {
  // Validate webhook secret if configured
  if (PIPEDRIVE_WEBHOOK_SECRET) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || authHeader !== `Bearer ${PIPEDRIVE_WEBHOOK_SECRET}`) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }
  }

  const { current, previous, event, meta } = req.body;
  if (!event || !meta) {
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }

  const action = meta.action; // updated, added, deleted
  const object = meta.object; // person, deal, activity

  logger.info('webhook-pipedrive', `${event} — ${object} #${meta.id}`);

  // Always respond quickly to Pipedrive
  res.status(200).json({ ok: true });

  // Process asynchronously
  try {
    // Find which Baakalai user owns this Pipedrive account
    // Match by Pipedrive company_id stored in user_integrations
    const userId = await findUserByPipedriveCompany(meta.company_id);
    if (!userId) {
      logger.warn('webhook-pipedrive', `No user found for Pipedrive company ${meta.company_id}`);
      return;
    }

    if (object === 'person') {
      await handlePersonEvent(userId, action, current, previous);
    } else if (object === 'deal') {
      await handleDealEvent(userId, action, current, previous);
    } else if (object === 'activity') {
      await handleActivityEvent(userId, action, current);
    }
  } catch (err) {
    logger.error('webhook-pipedrive', `Processing failed: ${err.message}`);
  }
});

// ── Event Handlers ──

async function handlePersonEvent(userId, action, current, previous) {
  if (action === 'deleted') return; // Don't delete from Baakalai on CRM delete

  const email = extractEmail(current);
  if (!email) return;

  const existing = await db.opportunities.findByEmail(userId, email);

  if (action === 'added' && !existing) {
    await db.opportunities.create({
      userId,
      name: current.name || 'Unknown',
      email,
      title: current.job_title || null,
      company: current.org_name || current.org_id?.name || null,
      status: 'imported',
      crmProvider: 'pipedrive',
      crmContactId: String(current.id),
      crmOwnerId: current.owner_id?.id ? String(current.owner_id.id) : null,
    });
    logger.info('webhook-pipedrive', `Imported new person: ${email}`);
  } else if (action === 'updated' && existing) {
    const updates = {};
    if (current.name && current.name !== existing.name) updates.name = current.name;
    if (current.job_title && current.job_title !== existing.title) updates.title = current.job_title;
    const company = current.org_name || current.org_id?.name || '';
    if (company && company !== existing.company) updates.company = company;

    const ownerId = current.owner_id?.id ? String(current.owner_id.id) : null;
    if (ownerId && ownerId !== existing.crm_owner_id) updates.crm_owner_id = ownerId;

    if (Object.keys(updates).length > 0) {
      await db.opportunities.update(existing.id, updates);
      logger.info('webhook-pipedrive', `Updated person: ${email} (${Object.keys(updates).join(', ')})`);
    }
  }
}

async function handleDealEvent(userId, action, current, previous) {
  if (!current?.person_id) return;

  const personId = current.person_id?.value || current.person_id;

  // Find the opportunity by CRM contact ID
  const result = await db.query(
    `SELECT id, status FROM opportunities WHERE user_id = $1 AND crm_contact_id = $2 LIMIT 1`,
    [userId, String(personId)]
  );
  const opp = result.rows[0];
  if (!opp) return;

  if (action === 'added' || action === 'updated') {
    const dealStatus = current.status; // open, won, lost
    const newStatus = dealStatus === 'won' ? 'won' : dealStatus === 'lost' ? 'lost' : null;

    if (newStatus && newStatus !== opp.status) {
      await db.opportunities.update(opp.id, { status: newStatus });
      logger.info('webhook-pipedrive', `Deal ${current.id}: ${opp.status} → ${newStatus}`);

      // Trigger nurture if deal won/lost
      if (newStatus === 'won' || newStatus === 'lost') {
        try {
          const { runAgent } = require('../lib/crm-agent');
          // Run agent with event context (lightweight, skips full sync)
          await runAgent(userId, {
            trigger: 'webhook',
            event: { type: `deal_${newStatus}`, dealId: current.id, personId: String(personId) },
          });
        } catch (err) {
          logger.warn('webhook-pipedrive', `Agent trigger failed: ${err.message}`);
        }
      }
    }
  }
}

async function handleActivityEvent(userId, action, current) {
  if (!current?.person_id) return;
  // Update the contact's updated_at to reflect recent activity
  await db.query(
    `UPDATE opportunities SET updated_at = now() WHERE user_id = $1 AND crm_contact_id = $2`,
    [userId, String(current.person_id)]
  );
}

// ── Helpers ──

function extractEmail(person) {
  if (!person) return null;
  if (Array.isArray(person.email)) {
    const primary = person.email.find(e => e.primary);
    return primary?.value || person.email[0]?.value || null;
  }
  return person.email || null;
}

async function findUserByPipedriveCompany(companyId) {
  if (!companyId) return null;

  // Try to find by stored pipedrive_company_id
  const result = await db.query(
    `SELECT user_id FROM user_integrations WHERE provider = 'pipedrive' AND metadata->>'company_id' = $1 LIMIT 1`,
    [String(companyId)]
  );
  if (result.rows[0]) return result.rows[0].user_id;

  // Fallback: find any user with a Pipedrive key (for single-user setups)
  const fallback = await db.query(
    `SELECT user_id FROM user_integrations WHERE provider = 'pipedrive' LIMIT 1`
  );
  return fallback.rows[0]?.user_id || null;
}

module.exports = router;
