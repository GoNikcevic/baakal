/**
 * Strategic Agents Routes
 *
 * POST /api/strategic/run-all    — Run all strategic agents
 * POST /api/strategic/run/:agent — Run a specific agent
 * GET  /api/strategic/agents     — List available agents
 */

const { Router } = require('express');
const { runAll, runOne, listAgents } = require('../lib/agents/strategic-orchestrator');

const router = Router();

// GET /api/strategic/agents — List available agents
router.get('/agents', (_req, res) => {
  res.json({ agents: listAgents() });
});

// POST /api/strategic/run-all — Run all agents
router.post('/run-all', async (req, res, next) => {
  try {
    const results = await runAll(req.user.id);
    res.json(results);
  } catch (err) { next(err); }
});

// POST /api/strategic/run/:agent — Run a specific agent
router.post('/run/:agent', async (req, res, next) => {
  try {
    const result = await runOne(req.user.id, req.params.agent);
    res.json(result);
  } catch (err) { next(err); }
});

module.exports = router;
