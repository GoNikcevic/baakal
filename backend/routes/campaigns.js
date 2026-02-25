const { Router } = require('express');
const lemlist = require('../api/lemlist');
const notionApi = require('../api/notion');

const router = Router();

// GET /api/campaigns — List all campaigns from Notion
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const result = await notionApi.queryResultats(status ? { status } : {});
    const campaigns = result.results.map(notionApi.parseResultat);
    res.json({ campaigns });
  } catch (err) {
    next(err);
  }
});

// GET /api/campaigns/:id — Get single campaign detail from Notion
router.get('/:id', async (req, res, next) => {
  try {
    const page = await notionApi.getClient().pages.retrieve({ page_id: req.params.id });
    const campaign = notionApi.parseResultat(page);

    // Also fetch diagnostics and version history
    const [diagnostics, versions] = await Promise.all([
      notionApi.queryDiagnostics(campaign.name),
      notionApi.queryVersions(campaign.name),
    ]);

    res.json({
      campaign,
      diagnostics: diagnostics.results.map(notionApi.parseDiagnostic),
      history: versions.results.map(notionApi.parseVersion),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/campaigns — Create a new campaign result entry
router.post('/', async (req, res, next) => {
  try {
    const page = await notionApi.createResultat(req.body);
    res.status(201).json({ id: page.id, url: page.url });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/campaigns/:id — Update campaign stats/status
router.patch('/:id', async (req, res, next) => {
  try {
    await notionApi.updateResultat(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/campaigns/:id/sync-stats — Pull fresh stats from Lemlist and save to Notion
router.post('/:id/sync-stats', async (req, res, next) => {
  try {
    // Get campaign from Notion to find lemlistId
    const page = await notionApi.getClient().pages.retrieve({ page_id: req.params.id });
    const campaign = notionApi.parseResultat(page);

    if (!campaign.lemlistId) {
      return res.status(400).json({ error: 'No Lemlist ID linked to this campaign' });
    }

    // Fetch fresh stats from Lemlist
    const rawStats = await lemlist.getCampaignStats(campaign.lemlistId);
    const stats = lemlist.transformCampaignStats(rawStats);

    // Update Notion
    await notionApi.updateResultat(req.params.id, {
      nbProspects: stats.contacts,
      openRate: stats.openRate,
      replyRate: stats.replyRate,
      acceptRate: stats.acceptRate,
      dateCollecte: new Date().toISOString().split('T')[0],
    });

    res.json({ stats, synced: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/campaigns/:id/versions — Record a new version
router.post('/:id/versions', async (req, res, next) => {
  try {
    const page = await notionApi.getClient().pages.retrieve({ page_id: req.params.id });
    const campaign = notionApi.parseResultat(page);

    const versionData = {
      campaignName: campaign.name,
      ...req.body,
    };
    const result = await notionApi.createVersion(versionData);
    res.status(201).json({ id: result.id });
  } catch (err) {
    next(err);
  }
});

// GET /api/campaigns/lemlist/list — List campaigns directly from Lemlist (for linking)
router.get('/lemlist/list', async (_req, res, next) => {
  try {
    const campaigns = await lemlist.listCampaigns();
    res.json({ campaigns });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
