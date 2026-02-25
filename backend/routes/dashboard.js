const { Router } = require('express');
const notionApi = require('../api/notion');

const router = Router();

// GET /api/dashboard — Aggregated dashboard data
router.get('/', async (_req, res, next) => {
  try {
    // Fetch all active campaigns
    const result = await notionApi.queryResultats({ status: 'Active' });
    const campaigns = result.results.map(notionApi.parseResultat);

    // Aggregate KPIs
    const totalContacts = campaigns.reduce((sum, c) => sum + c.nbProspects, 0);
    const withOpenRate = campaigns.filter((c) => c.openRate > 0);
    const withReplyRate = campaigns.filter((c) => c.replyRate > 0);
    const withAcceptRate = campaigns.filter((c) => c.acceptRate > 0);

    const avgOpenRate = withOpenRate.length > 0
      ? Math.round(withOpenRate.reduce((sum, c) => sum + c.openRate, 0) / withOpenRate.length)
      : 0;
    const avgReplyRate = withReplyRate.length > 0
      ? Math.round(withReplyRate.reduce((sum, c) => sum + c.replyRate, 0) / withReplyRate.length * 10) / 10
      : 0;
    const avgAcceptRate = withAcceptRate.length > 0
      ? Math.round(withAcceptRate.reduce((sum, c) => sum + c.acceptRate, 0) / withAcceptRate.length)
      : 0;

    res.json({
      kpis: {
        activeCampaigns: campaigns.length,
        totalContacts,
        avgOpenRate,
        avgReplyRate,
        avgAcceptRate,
      },
      campaigns,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/memory — Cross-campaign patterns summary
router.get('/memory', async (req, res, next) => {
  try {
    const { categorie, confiance, secteur } = req.query;
    const result = await notionApi.queryMemory({ categorie, confiance, secteur });
    const patterns = result.results.map(notionApi.parseMemoryPattern);
    res.json({ patterns });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
