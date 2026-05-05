/**
 * Signal Routes — Signal-based prospecting
 *
 * GET    /api/signals             — List detected signals (with filters)
 * GET    /api/signals/configs     — List signal configs
 * POST   /api/signals/configs     — Create a signal config
 * PATCH  /api/signals/configs/:id — Update config
 * DELETE /api/signals/configs/:id — Delete config
 * POST   /api/signals/:id/action  — Take action on a signal (add to CRM, email, dismiss)
 * POST   /api/signals/scan        — Manually trigger signal scan
 */

const { Router } = require('express');
const db = require('../db');
const logger = require('../lib/logger');

const router = Router();

// GET /api/signals — List signals
router.get('/', async (req, res, next) => {
  try {
    const status = req.query.status || null;
    const signalType = req.query.type || null;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);

    let sql = `SELECT * FROM signals WHERE user_id = $1`;
    const params = [req.user.id];

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    if (signalType) {
      params.push(signalType);
      sql += ` AND signal_type = $${params.length}`;
    }

    sql += ` ORDER BY detected_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(sql, params);

    // Also get counts by status
    const counts = await db.query(
      `SELECT status, COUNT(*) AS count FROM signals WHERE user_id = $1 GROUP BY status`,
      [req.user.id]
    );

    res.json({
      signals: result.rows,
      counts: Object.fromEntries(counts.rows.map(r => [r.status, parseInt(r.count)])),
    });
  } catch (err) { next(err); }
});

// GET /api/signals/configs — List configs
router.get('/configs', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM signal_configs WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ configs: result.rows });
  } catch (err) { next(err); }
});

// POST /api/signals/configs — Create config
router.post('/configs', async (req, res, next) => {
  try {
    const { name, signalTypes, targetSectors, targetTitles, targetCompanySizes, targetKeywords, targetCompetitors, frequency } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const result = await db.query(`
      INSERT INTO signal_configs (user_id, name, signal_types, target_sectors, target_titles, target_company_sizes, target_keywords, target_competitors, frequency)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [
      req.user.id, name,
      signalTypes || ['funding', 'hiring', 'news'],
      targetSectors || [],
      targetTitles || [],
      targetCompanySizes || [],
      targetKeywords || [],
      targetCompetitors || [],
      frequency || 'daily',
    ]);

    res.json({ config: result.rows[0] });
  } catch (err) { next(err); }
});

// PATCH /api/signals/configs/:id
router.patch('/configs/:id', async (req, res, next) => {
  try {
    const { name, signalTypes, targetSectors, targetTitles, targetKeywords, targetCompetitors, enabled, frequency } = req.body;
    const sets = [];
    const values = [];
    let i = 1;

    if (name !== undefined) { sets.push(`name = $${i++}`); values.push(name); }
    if (signalTypes !== undefined) { sets.push(`signal_types = $${i++}`); values.push(signalTypes); }
    if (targetSectors !== undefined) { sets.push(`target_sectors = $${i++}`); values.push(targetSectors); }
    if (targetTitles !== undefined) { sets.push(`target_titles = $${i++}`); values.push(targetTitles); }
    if (targetKeywords !== undefined) { sets.push(`target_keywords = $${i++}`); values.push(targetKeywords); }
    if (targetCompetitors !== undefined) { sets.push(`target_competitors = $${i++}`); values.push(targetCompetitors); }
    if (enabled !== undefined) { sets.push(`enabled = $${i++}`); values.push(enabled); }
    if (frequency !== undefined) { sets.push(`frequency = $${i++}`); values.push(frequency); }
    if (sets.length === 0) return res.status(400).json({ error: 'Nothing to update' });

    values.push(req.params.id, req.user.id);
    const result = await db.query(
      `UPDATE signal_configs SET ${sets.join(', ')} WHERE id = $${i++} AND user_id = $${i} RETURNING *`,
      values
    );

    res.json({ config: result.rows[0] });
  } catch (err) { next(err); }
});

// DELETE /api/signals/configs/:id
router.delete('/configs/:id', async (req, res, next) => {
  try {
    await db.query(`DELETE FROM signal_configs WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// POST /api/signals/:id/action — Take action on a signal
router.post('/:id/action', async (req, res, next) => {
  try {
    const { action } = req.body; // add_to_crm, send_email, add_to_lemlist, dismiss
    const signal = await db.query(`SELECT * FROM signals WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
    if (!signal.rows[0]) return res.status(404).json({ error: 'Signal not found' });
    const s = signal.rows[0];

    let opportunityId = null;

    if (action === 'add_to_crm') {
      // Create opportunity from signal
      const opp = await db.opportunities.create({
        userId: req.user.id,
        name: s.contact_name || s.company_name || 'Unknown',
        email: s.contact_email || null,
        title: s.contact_title || null,
        company: s.company_name || null,
        status: 'new',
        linkedinUrl: s.contact_linkedin || null,
      });
      opportunityId = opp.id;
    } else if (action === 'send_email' && s.contact_email) {
      // Generate and queue a personalized email
      const claude = require('../api/claude');
      const prompt = `Generate a short, personal outreach email based on this signal.

Signal: ${s.title}
Context: ${s.description}
Contact: ${s.contact_name || 'Decision maker'} (${s.contact_title || ''}) at ${s.company_name || ''}
Signal type: ${s.signal_type}

Write a 4-5 line email that references the signal naturally (don't say "I saw a signal").
Be specific and relevant. Return JSON: { "subject": "...", "body": "..." }`;

      const result = await claude.callClaude('Return only valid JSON.', prompt, 500, 'signal_outreach');
      let email = result.parsed;
      if (!email) {
        const m = (result.content || '').match(/\{[\s\S]*"subject"[\s\S]*"body"[\s\S]*\}/);
        if (m) email = JSON.parse(m[0]);
      }

      if (email?.subject && email?.body) {
        const { sendNurtureEmail } = require('../lib/email-outbound');
        await sendNurtureEmail(req.user.id, {
          to: s.contact_email,
          toName: s.contact_name,
          subject: email.subject,
          body: email.body,
        });
      }
    }

    // Update signal status
    await db.query(
      `UPDATE signals SET status = $1, action_taken = $2, opportunity_id = $3, actioned_at = now() WHERE id = $4`,
      [action === 'dismiss' ? 'dismissed' : 'actioned', action, opportunityId, s.id]
    );

    res.json({ ok: true, action, opportunityId });
  } catch (err) { next(err); }
});

// POST /api/signals/scan — Manual signal scan
router.post('/scan', async (req, res, next) => {
  try {
    const { run } = require('../lib/agents/signal-agent');
    const report = await run(req.user.id);
    res.json(report);
  } catch (err) { next(err); }
});

module.exports = router;
