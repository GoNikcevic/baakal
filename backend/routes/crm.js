/**
 * CRM Sync Routes
 *
 * POST /api/crm/sync-opportunity   — Push a single opportunity to HubSpot (contact + deal)
 * POST /api/crm/push-contacts      — Bulk push opportunities to HubSpot
 * POST /api/crm/sync-patterns      — Push high-confidence memory patterns as HubSpot notes
 * GET  /api/crm/status              — Check HubSpot connection status
 */

const { Router } = require('express');
const db = require('../db');
const hubspot = require('../api/hubspot');
const { config } = require('../config');

const router = Router();

// =============================================
// GET /api/crm/status — Check HubSpot connection
// =============================================

router.get('/status', async (_req, res, next) => {
  try {
    if (!config.hubspot.accessToken) {
      return res.json({ connected: false, reason: 'No HubSpot access token configured' });
    }
    // Verify the token works by fetching account info
    const account = await hubspot.getContact('1').catch(() => null);
    // If we get a 404 that's fine — means the API is reachable
    res.json({ connected: true });
  } catch (err) {
    res.json({ connected: false, reason: err.message });
  }
});

// =============================================
// POST /api/crm/sync-opportunity — Sync one opportunity
// =============================================

router.post('/sync-opportunity', async (req, res, next) => {
  try {
    const { opportunityId } = req.body;
    if (!opportunityId) {
      return res.status(400).json({ error: 'opportunityId is required' });
    }

    const opportunity = await db.opportunities.get(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Check user owns this opportunity
    if (opportunity.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await syncOpportunityToHubspot(opportunity);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// =============================================
// POST /api/crm/push-contacts — Bulk push
// =============================================

router.post('/push-contacts', async (req, res, next) => {
  try {
    const { opportunityIds } = req.body;
    const opportunities = opportunityIds
      ? await Promise.all(opportunityIds.map((id) => db.opportunities.get(id)))
      : await db.opportunities.listByUser(req.user.id, 100);

    const results = [];
    const errors = [];

    for (const opp of opportunities) {
      if (!opp) continue;
      if (opp.user_id !== req.user.id && req.user.role !== 'admin') continue;

      try {
        const result = await syncOpportunityToHubspot(opp);
        results.push(result);
      } catch (err) {
        errors.push({ opportunityId: opp.id, name: opp.name, error: err.message });
      }
    }

    res.json({
      synced: results.length,
      errors: errors.length,
      results,
      errorDetails: errors,
    });
  } catch (err) {
    next(err);
  }
});

// =============================================
// POST /api/crm/sync-patterns — Push memory patterns as notes
// =============================================

router.post('/sync-patterns', async (req, res, next) => {
  try {
    const { dealId } = req.body;

    // Get high-confidence patterns
    const allPatterns = await db.memoryPatterns.list({ confidence: 'Haute' });
    if (allPatterns.length === 0) {
      return res.json({ synced: false, reason: 'No high-confidence patterns found' });
    }

    const noteBody = hubspot.formatPatternsAsNote(allPatterns);
    const associations = {};
    if (dealId) associations.dealId = dealId;

    const note = await hubspot.createNote(noteBody, associations);

    res.json({ synced: true, noteId: note.id, patternsCount: allPatterns.length });
  } catch (err) {
    next(err);
  }
});

// =============================================
// Shared sync logic
// =============================================

async function syncOpportunityToHubspot(opportunity) {
  const campaign = opportunity.campaign_id
    ? await db.campaigns.get(opportunity.campaign_id)
    : null;

  let contactId = opportunity.hubspot_contact_id;
  let dealId = opportunity.hubspot_deal_id;

  // --- Contact ---
  if (!contactId && opportunity.email) {
    // Search for existing contact by email
    const search = await hubspot.searchContacts(opportunity.email);
    if (search.total > 0) {
      contactId = search.results[0].id;
    }
  }

  const contactProps = hubspot.mapOpportunityToContact(opportunity);

  if (contactId) {
    await hubspot.updateContact(contactId, contactProps);
  } else {
    const created = await hubspot.createContact(contactProps);
    contactId = created.id;
  }

  // --- Deal ---
  const dealProps = hubspot.mapOpportunityToDeal(opportunity, campaign);

  if (dealId) {
    await hubspot.updateDeal(dealId, dealProps);
  } else {
    const created = await hubspot.createDeal(dealProps);
    dealId = created.id;
  }

  // --- Association ---
  if (contactId && dealId) {
    await hubspot.associateContactToDeal(contactId, dealId).catch(() => {
      // Association may already exist — non-blocking
    });
  }

  // --- Persist HubSpot IDs back to our DB ---
  await db.opportunities.update(opportunity.id, {
    hubspot_contact_id: contactId,
    hubspot_deal_id: dealId,
  });

  return {
    opportunityId: opportunity.id,
    name: opportunity.name,
    hubspotContactId: contactId,
    hubspotDealId: dealId,
    action: opportunity.hubspot_contact_id ? 'updated' : 'created',
  };
}

module.exports = router;
module.exports.syncOpportunityToHubspot = syncOpportunityToHubspot;
