const { Router } = require('express');
const db = require('../db');

const router = Router();

// GET /api/dashboard — Aggregated KPIs + active campaigns
router.get('/', (_req, res) => {
  const kpis = db.dashboardKpis();
  const campaigns = db.campaigns.list({ status: 'active' });

  res.json({ kpis, campaigns });
});

// GET /api/dashboard/memory — Cross-campaign patterns
router.get('/memory', (req, res) => {
  const { category, confidence } = req.query;
  const patterns = db.memoryPatterns.list({ category, confidence });

  // Parse JSON fields
  const parsed = patterns.map((p) => ({
    ...p,
    sectors: tryParse(p.sectors),
    targets: tryParse(p.targets),
  }));

  res.json({ patterns: parsed });
});

function tryParse(str) {
  try { return JSON.parse(str); } catch { return []; }
}

module.exports = router;
