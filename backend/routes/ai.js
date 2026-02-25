const { Router } = require('express');
const claude = require('../api/claude');
const db = require('../db');
const notionSync = require('../api/notion-sync');

const router = Router();

// POST /api/ai/analyze — Analyze campaign performance
router.post('/analyze', async (req, res, next) => {
  try {
    const { campaignId } = req.body;
    const campaign = db.campaigns.get(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const sequence = db.touchpoints.listByCampaign(campaignId);
    const result = await claude.analyzeCampaign({ ...campaign, sequence });

    // Save diagnostic to local DB
    const priorities = extractPriorities(result.diagnostic);
    const diag = db.diagnostics.create(campaignId, {
      diagnostic: result.diagnostic,
      priorities,
      nbToOptimize: priorities.length,
    });

    // Background sync to Notion
    notionSync.syncDiagnostic(diag.id, campaignId).catch(console.error);

    res.json({
      id: diag.id,
      diagnostic: result.diagnostic,
      priorities,
      usage: result.usage,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/regenerate — Regenerate sequence for a campaign
router.post('/regenerate', async (req, res, next) => {
  try {
    const { campaignId, diagnostic, originalMessages, clientParams } = req.body;

    // Fetch cross-campaign memory from local DB
    const memory = db.memoryPatterns.list({});

    const result = await claude.regenerateSequence({
      diagnostic,
      originalMessages,
      memory,
      clientParams,
    });

    // Record version if we have a campaign
    if (campaignId) {
      const existing = db.versions.listByCampaign(campaignId);
      const nextVersion = (existing[0]?.version || 0) + 1;

      const version = db.versions.create(campaignId, {
        version: nextVersion,
        messagesModified: result.parsed?.messages?.map((m) => m.step) || [],
        hypotheses: result.parsed?.summary || '',
        result: 'testing',
      });

      // Background sync to Notion
      notionSync.syncVersion(version.id, campaignId).catch(console.error);
    }

    res.json({
      messages: result.parsed?.messages || [],
      summary: result.parsed?.summary || result.raw,
      usage: result.usage,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/consolidate-memory — Monthly memory consolidation
router.post('/consolidate-memory', async (req, res, next) => {
  try {
    // Gather all diagnostics across campaigns
    const campaigns = db.campaigns.list({});
    const allDiagnostics = [];
    for (const campaign of campaigns) {
      const diags = db.diagnostics.listByCampaign(campaign.id);
      allDiagnostics.push(
        ...diags.map((d) => ({ ...d, campaign: campaign.name, sector: campaign.sector }))
      );
    }

    const existingMemory = db.memoryPatterns.list({});

    const result = await claude.consolidateMemory(allDiagnostics, existingMemory);

    // Save new patterns
    const saved = [];
    if (result.parsed?.patterns) {
      for (const pattern of result.parsed.patterns) {
        const created = db.memoryPatterns.create({
          pattern: pattern.pattern,
          category: pattern.categorie,
          data: pattern.donnees,
          confidence: pattern.confiance,
          sectors: pattern.secteurs || [],
          targets: pattern.cibles || [],
        });
        saved.push(created.id);

        // Background sync to Notion
        notionSync.syncMemoryPattern(created.id).catch(console.error);
      }
    }

    res.json({
      patternsCreated: saved.length,
      summary: result.parsed?.summary || result.raw,
      usage: result.usage,
    });
  } catch (err) {
    next(err);
  }
});

// --- Helpers ---

function extractPriorities(diagnostic) {
  const priorities = [];
  const lines = diagnostic.split('\n');
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('priorité') || lower.includes('optimiser') || lower.includes('améliorer')) {
      const steps = line.match(/[EL]\d/g);
      if (steps) priorities.push(...steps);
    }
  }
  return [...new Set(priorities)];
}

module.exports = router;
