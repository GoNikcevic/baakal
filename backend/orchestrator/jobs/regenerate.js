/**
 * Job: Regenerate & Deploy (Workflow 2 replacement)
 *
 * Flow: SQLite (original messages + memory) → Claude (analysis + regen) → SQLite + Notion sync
 *
 * Triggered by collect-stats when a campaign needs optimization,
 * or manually via the orchestrator queue.
 */

const claude = require('../../api/claude');
const notionSync = require('../../api/notion-sync');
const db = require('../../db');

async function run({ campaignId, metrics, diagnostic } = {}) {
  console.log(`[regenerate] Starting for campaign ${campaignId}...`);

  const campaign = db.campaigns.get(campaignId);
  if (!campaign) {
    console.error(`[regenerate] Campaign ${campaignId} not found.`);
    return { success: false, error: 'Campaign not found' };
  }

  try {
    // Step 1: Read original messages from SQLite
    const sequence = db.touchpoints.listByCampaign(campaignId);
    const originalMessages = sequence.map((tp) => ({
      step: tp.step,
      subject: tp.subject,
      body: tp.body,
    }));

    // Step 2: Read cross-campaign memory
    const memory = db.memoryPatterns.list({});

    // Step 3: Run analysis if not already provided
    let analysisResult = diagnostic;
    if (!analysisResult) {
      analysisResult = await claude.analyzeCampaign({
        campaignName: campaign.name,
        stats: metrics,
        sector: campaign.sector || '',
        position: campaign.position || '',
        sequence,
      });

      // Store diagnostic
      const diag = db.diagnostics.create(campaignId, {
        diagnostic: analysisResult.diagnostic,
        priorities: analysisResult.parsed?.priorities?.map((p) => p.step) || [],
        nbToOptimize: analysisResult.parsed?.priorities?.length || 0,
      });

      notionSync.syncDiagnostic(diag.id, campaignId).catch(console.error);
    }

    // Step 4: Call Claude for regeneration with A/B variants
    const regenerationResult = await claude.regenerateSequence({
      diagnostic: analysisResult.diagnostic,
      originalMessages,
      memory,
      clientParams: {
        tone: campaign.tone,
        formality: campaign.formality,
        sector: campaign.sector,
      },
      regenerationInstructions: analysisResult.parsed?.regenerationInstructions || null,
    });

    // Step 5: Record version in SQLite
    const existingVersions = db.versions.listByCampaign(campaignId);
    const nextVersion = (existingVersions[0]?.version || 0) + 1;

    const version = db.versions.create(campaignId, {
      version: nextVersion,
      messagesModified: regenerationResult.parsed?.messages?.map((m) => m.step) || [],
      hypotheses: regenerationResult.parsed?.summary || regenerationResult.parsed?.hypotheses?.join('; ') || '',
      result: 'testing',
    });

    // Step 6: Sync to Notion
    notionSync.syncVersion(version.id, campaignId).catch(console.error);

    // Step 7: Update campaign status
    db.campaigns.update(campaignId, { status: 'optimizing' });

    console.log(`[regenerate] Done for campaign ${campaignId}. Version ${nextVersion} created.`);
    return {
      success: true,
      versionId: version.id,
      version: nextVersion,
      messagesRegenerated: regenerationResult.parsed?.messages?.length || 0,
    };
  } catch (err) {
    console.error(`[regenerate] Failed for campaign ${campaignId}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { run };
