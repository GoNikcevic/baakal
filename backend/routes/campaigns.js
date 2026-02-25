const { Router } = require('express');
const db = require('../db');
const lemlist = require('../api/lemlist');
const notionSync = require('../api/notion-sync');

const router = Router();

// GET /api/campaigns — List all campaigns
router.get('/', (req, res) => {
  const { status, channel } = req.query;
  const campaigns = db.campaigns.list({ status, channel });

  // Attach touchpoints to each campaign
  const result = campaigns.map((c) => ({
    ...c,
    sequence: db.touchpoints.listByCampaign(c.id),
  }));

  res.json({ campaigns: result });
});

// GET /api/campaigns/:id — Campaign detail with sequence, diagnostics, history
router.get('/:id', (req, res) => {
  const campaign = db.campaigns.get(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  res.json({
    campaign,
    sequence: db.touchpoints.listByCampaign(campaign.id),
    diagnostics: db.diagnostics.listByCampaign(campaign.id),
    history: db.versions.listByCampaign(campaign.id),
  });
});

// POST /api/campaigns — Create a new campaign
router.post('/', (req, res) => {
  const campaign = db.campaigns.create(req.body);

  // Create touchpoints if provided
  if (Array.isArray(req.body.sequence)) {
    req.body.sequence.forEach((tp, i) => {
      db.touchpoints.create(campaign.id, { ...tp, sortOrder: i });
    });
  }

  // Background sync to Notion
  notionSync.syncCampaign(campaign.id).catch(console.error);

  res.status(201).json(campaign);
});

// PATCH /api/campaigns/:id — Update campaign
router.patch('/:id', (req, res) => {
  const updated = db.campaigns.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Campaign not found or no changes' });

  // Background sync to Notion
  notionSync.syncCampaign(updated.id).catch(console.error);

  res.json(updated);
});

// PUT /api/campaigns/:id/sequence — Replace full sequence
router.put('/:id/sequence', (req, res) => {
  const campaign = db.campaigns.get(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  // Delete existing and insert new
  db.touchpoints.deleteByCampaign(campaign.id);
  const sequence = (req.body.sequence || []).map((tp, i) => {
    const created = db.touchpoints.create(campaign.id, { ...tp, sortOrder: i });
    return { ...tp, id: created.id };
  });

  res.json({ sequence });
});

// POST /api/campaigns/:id/sync-stats — Pull fresh stats from Lemlist
router.post('/:id/sync-stats', async (req, res, next) => {
  try {
    const campaign = db.campaigns.get(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (!campaign.lemlist_id) {
      return res.status(400).json({ error: 'No Lemlist ID linked to this campaign' });
    }

    // Fetch from Lemlist
    const rawStats = await lemlist.getCampaignStats(campaign.lemlist_id);
    const stats = lemlist.transformCampaignStats(rawStats);

    // Update local DB
    db.campaigns.update(campaign.id, {
      nb_prospects: stats.contacts,
      open_rate: stats.openRate,
      reply_rate: stats.replyRate,
      accept_rate_lk: stats.acceptRate,
      interested: stats.interested,
      last_collected: new Date().toISOString().split('T')[0],
    });

    // Background sync to Notion
    notionSync.syncCampaign(campaign.id).catch(console.error);

    res.json({ stats, synced: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/campaigns/:id/versions — Record a new version
router.post('/:id/versions', (req, res) => {
  const campaign = db.campaigns.get(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const existing = db.versions.listByCampaign(campaign.id);
  const nextVersion = (existing[0]?.version || 0) + 1;

  const version = db.versions.create(campaign.id, {
    version: nextVersion,
    ...req.body,
  });

  // Background sync to Notion
  notionSync.syncVersion(version.id, campaign.id).catch(console.error);

  res.status(201).json(version);
});

// GET /api/campaigns/lemlist/list — List campaigns from Lemlist (for linking)
router.get('/lemlist/list', async (_req, res, next) => {
  try {
    const campaigns = await lemlist.listCampaigns();
    res.json({ campaigns });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
