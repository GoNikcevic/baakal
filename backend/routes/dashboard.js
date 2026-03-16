const { Router } = require('express');
const db = require('../db');

const router = Router();

// GET /api/dashboard — Aggregated KPIs + active campaigns (scoped to user)
router.get('/', async (req, res, next) => {
  try {
    const kpis = await db.dashboardKpis(req.user.id);
    const campaigns = await db.campaigns.list({ status: 'active', userId: req.user.id });

    res.json({ kpis, campaigns });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/memory — Cross-campaign patterns
router.get('/memory', async (req, res, next) => {
  try {
    const { category, confidence } = req.query;
    const patterns = await db.memoryPatterns.list({ category, confidence });

    res.json({ patterns });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/opportunities
router.get('/opportunities', async (req, res, next) => {
  try {
    const opportunities = await db.opportunities.listByUser(req.user.id);
    res.json({ opportunities });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/reports
router.get('/reports', async (req, res, next) => {
  try {
    const reports = await db.reports.listByUser(req.user.id);
    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/chart-data
router.get('/chart-data', async (req, res, next) => {
  try {
    const data = await db.chartData.listByUser(req.user.id);
    res.json({ chartData: data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
