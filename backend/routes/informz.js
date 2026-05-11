/**
 * Informz Routes — Newsletter integration for associations
 *
 * POST /api/informz/send-newsletter  — Create and send a mailing
 * POST /api/informz/sync-subscribers — Upload CRM contacts to Informz
 * GET  /api/informz/mailings         — List mailings
 * GET  /api/informz/analytics/:id    — Get mailing analytics
 * GET  /api/informz/engagement       — Get engagement scores
 * POST /api/informz/test             — Test connection
 */

const { Router } = require('express');
const db = require('../db');
const informz = require('../api/informz');
const claude = require('../api/claude');
const { decrypt } = require('../config/crypto');
const logger = require('../lib/logger');

const router = Router();

/**
 * Parse stored Informz credentials (format: "username:password:brandId")
 */
async function getInformzCreds(userId) {
  const integration = await db.userIntegrations.get(userId, 'informz');
  if (!integration) return null;

  const raw = decrypt(integration.access_token);
  const parts = raw.split(':');
  if (parts.length < 3) return null;

  return {
    username: parts[0],
    password: parts[1],
    brandId: parts[2],
    region: parts[3] || 'us', // optional 4th part: us, ca, test
  };
}

// POST /api/informz/send-newsletter — Create and schedule a mailing
router.post('/send-newsletter', async (req, res, next) => {
  try {
    const creds = await getInformzCreds(req.user.id);
    if (!creds) return res.status(400).json({ error: 'Informz not connected' });

    const { subject, body, listId, scheduledDate, generateWithAI, prompt } = req.body;

    let finalSubject = subject;
    let finalBody = body;

    // AI-generated newsletter content
    if (generateWithAI && prompt) {
      const profile = await db.profiles.get(req.user.id);
      const aiPrompt = `Generate a professional newsletter email.
Company: ${profile?.company || 'N/A'}
Sector: ${profile?.sector || 'N/A'}
Instructions: ${prompt}
Tone: professional, informative
Format: HTML with paragraphs, headers allowed

Return JSON: { "subject": "...", "body": "<html>...</html>" }`;

      const result = await claude.callClaude('Return only valid JSON.', aiPrompt, 1500, 'newsletter');
      let parsed = result.parsed;
      if (!parsed) {
        const m = (result.content || '').match(/\{[\s\S]*"subject"[\s\S]*"body"[\s\S]*\}/);
        if (m) parsed = JSON.parse(m[0]);
      }
      if (parsed) {
        finalSubject = parsed.subject;
        finalBody = parsed.body;
      }
    }

    if (!finalSubject || !finalBody) {
      return res.status(400).json({ error: 'subject and body are required' });
    }

    const result = await informz.createMailing(creds, {
      subject: finalSubject,
      htmlBody: finalBody,
      listId,
      scheduledDate,
    });

    logger.info('informz', `Newsletter sent: ${finalSubject}`);
    res.json({ ok: true, result });
  } catch (err) { next(err); }
});

// POST /api/informz/sync-subscribers — Upload CRM contacts to Informz
router.post('/sync-subscribers', async (req, res, next) => {
  try {
    const creds = await getInformzCreds(req.user.id);
    if (!creds) return res.status(400).json({ error: 'Informz not connected' });

    // Get contacts from CRM
    const opps = await db.opportunities.listByUser(req.user.id, 5000, 0);
    const subscribers = opps
      .filter(o => o.email && o.status !== 'lost')
      .map(o => ({
        email: o.email,
        firstName: o.name?.split(' ')[0] || '',
        lastName: o.name?.split(' ').slice(1).join(' ') || '',
        company: o.company || '',
      }));

    if (subscribers.length === 0) {
      return res.json({ synced: 0, message: 'No contacts to sync' });
    }

    // Upload in batches of 100
    let synced = 0;
    for (let i = 0; i < subscribers.length; i += 100) {
      const batch = subscribers.slice(i, i + 100);
      await informz.bulkUpload(creds, batch);
      synced += batch.length;
    }

    logger.info('informz', `Synced ${synced} subscribers`);
    res.json({ synced });
  } catch (err) { next(err); }
});

// GET /api/informz/mailings — List mailings
router.get('/mailings', async (req, res, next) => {
  try {
    const creds = await getInformzCreds(req.user.id);
    if (!creds) return res.status(400).json({ error: 'Informz not connected' });

    const result = await informz.getMailings(creds);
    res.json(result);
  } catch (err) { next(err); }
});

// GET /api/informz/analytics/:id — Get mailing analytics
router.get('/analytics/:id', async (req, res, next) => {
  try {
    const creds = await getInformzCreds(req.user.id);
    if (!creds) return res.status(400).json({ error: 'Informz not connected' });

    const [activity, opens, bounces] = await Promise.all([
      informz.getMailingActivity(creds, { mailingId: req.params.id }),
      informz.getMailingOpens(creds, { mailingId: req.params.id }),
      informz.getMailingBounces(creds, { mailingId: req.params.id }),
    ]);

    res.json({ activity, opens, bounces });
  } catch (err) { next(err); }
});

// GET /api/informz/engagement — Get engagement scores
router.get('/engagement', async (req, res, next) => {
  try {
    const creds = await getInformzCreds(req.user.id);
    if (!creds) return res.status(400).json({ error: 'Informz not connected' });

    const result = await informz.getEngagementScores(creds);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/informz/test — Test connection
router.post('/test', async (req, res, next) => {
  try {
    const creds = await getInformzCreds(req.user.id);
    if (!creds) return res.status(400).json({ error: 'Informz not connected' });

    const result = await informz.testConnection(creds);
    res.json(result);
  } catch (err) { next(err); }
});

module.exports = router;
