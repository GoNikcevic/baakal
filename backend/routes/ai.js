const { Router } = require('express');
const claude = require('../api/claude');
const notionApi = require('../api/notion');

const router = Router();

// POST /api/ai/analyze — Analyze campaign performance
router.post('/analyze', async (req, res, next) => {
  try {
    const { campaignId } = req.body;

    // Fetch campaign data from Notion
    const page = await notionApi.getClient().pages.retrieve({ page_id: campaignId });
    const campaign = notionApi.parseResultat(page);

    // Call Claude for analysis
    const result = await claude.analyzeCampaign(campaign);

    // Save diagnostic to Notion
    const priorities = extractPriorities(result.diagnostic);
    await notionApi.createDiagnostic({
      campaignName: campaign.name,
      diagnostic: result.diagnostic,
      priorites: priorities,
      nbMessagesOptimiser: priorities.length,
    });

    res.json({
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

    // Fetch cross-campaign memory
    const memoryResult = await notionApi.queryMemory({});
    const memory = memoryResult.results.map(notionApi.parseMemoryPattern);

    // Call Claude for regeneration
    const result = await claude.regenerateSequence({
      diagnostic,
      originalMessages,
      memory,
      clientParams,
    });

    // Record version in Notion if we have a campaign
    if (campaignId) {
      const page = await notionApi.getClient().pages.retrieve({ page_id: campaignId });
      const campaign = notionApi.parseResultat(page);

      // Get current version count
      const versions = await notionApi.queryVersions(campaign.name);
      const nextVersion = (versions.results.length || 0) + 1;

      await notionApi.createVersion({
        campaignName: campaign.name,
        version: nextVersion,
        messagesModifies: result.parsed?.messages?.map((m) => m.step) || [],
        hypotheses: result.parsed?.summary || '',
        resultat: 'En cours',
      });
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
    // Fetch all recent diagnostics
    const allCampaigns = await notionApi.queryResultats({});
    const diagnostics = [];

    for (const page of allCampaigns.results) {
      const campaign = notionApi.parseResultat(page);
      const diags = await notionApi.queryDiagnostics(campaign.name);
      diagnostics.push(
        ...diags.results.map((d) => ({
          ...notionApi.parseDiagnostic(d),
          campaign,
        }))
      );
    }

    // Fetch existing memory
    const existingMemory = await notionApi.queryMemory({});
    const memoryPatterns = existingMemory.results.map(notionApi.parseMemoryPattern);

    // Call Claude for consolidation
    const result = await claude.consolidateMemory(diagnostics, memoryPatterns);

    // Save new patterns to Notion
    const saved = [];
    if (result.parsed?.patterns) {
      for (const pattern of result.parsed.patterns) {
        const page = await notionApi.createMemoryPattern({
          pattern: pattern.pattern,
          categorie: pattern.categorie,
          donnees: pattern.donnees,
          confiance: pattern.confiance,
          secteurs: pattern.secteurs || [],
          cibles: pattern.cibles || [],
        });
        saved.push(page.id);
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
      // Extract step references like E1, E2, L1, L2
      const steps = line.match(/[EL]\d/g);
      if (steps) priorities.push(...steps);
    }
  }
  return [...new Set(priorities)];
}

module.exports = router;
