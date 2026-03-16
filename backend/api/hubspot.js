/**
 * HubSpot API Client
 *
 * Handles contacts, deals, and activities (notes/tasks) via HubSpot v3 API.
 * Used by CRM sync routes and the refinement loop.
 */

const { config } = require('../config');

const BASE_URL = 'https://api.hubapi.com';

async function hubspotFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.hubspot.accessToken}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(
      new Error(`HubSpot API ${res.status}: ${body}`),
      { status: res.status }
    );
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// =============================================
// Contacts
// =============================================

async function createContact(properties) {
  return hubspotFetch('/crm/v3/objects/contacts', {
    method: 'POST',
    body: JSON.stringify({ properties }),
  });
}

async function updateContact(contactId, properties) {
  return hubspotFetch(`/crm/v3/objects/contacts/${contactId}`, {
    method: 'PATCH',
    body: JSON.stringify({ properties }),
  });
}

async function getContact(contactId) {
  return hubspotFetch(`/crm/v3/objects/contacts/${contactId}`);
}

async function searchContacts(email) {
  return hubspotFetch('/crm/v3/objects/contacts/search', {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: email,
        }],
      }],
    }),
  });
}

// =============================================
// Deals
// =============================================

async function createDeal(properties) {
  return hubspotFetch('/crm/v3/objects/deals', {
    method: 'POST',
    body: JSON.stringify({ properties }),
  });
}

async function updateDeal(dealId, properties) {
  return hubspotFetch(`/crm/v3/objects/deals/${dealId}`, {
    method: 'PATCH',
    body: JSON.stringify({ properties }),
  });
}

async function getDeal(dealId) {
  return hubspotFetch(`/crm/v3/objects/deals/${dealId}`);
}

// =============================================
// Associations (link contact ↔ deal)
// =============================================

async function associateContactToDeal(contactId, dealId) {
  return hubspotFetch(
    `/crm/v3/objects/contacts/${contactId}/associations/deals/${dealId}/contact_to_deal`,
    { method: 'PUT' }
  );
}

// =============================================
// Notes (engagements)
// =============================================

async function createNote(body, associations = {}) {
  const payload = {
    properties: {
      hs_note_body: body,
      hs_timestamp: new Date().toISOString(),
    },
  };

  if (associations.contactId || associations.dealId) {
    payload.associations = [];
    if (associations.contactId) {
      payload.associations.push({
        to: { id: associations.contactId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }],
      });
    }
    if (associations.dealId) {
      payload.associations.push({
        to: { id: associations.dealId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 214 }],
      });
    }
  }

  return hubspotFetch('/crm/v3/objects/notes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// =============================================
// Helpers
// =============================================

/**
 * Map a Bakal opportunity to HubSpot contact properties.
 */
function mapOpportunityToContact(opportunity) {
  const props = {
    firstname: opportunity.name?.split(' ')[0] || '',
    lastname: opportunity.name?.split(' ').slice(1).join(' ') || '',
    jobtitle: opportunity.title || '',
    company: opportunity.company || '',
  };
  if (opportunity.email) props.email = opportunity.email;
  return props;
}

/**
 * Map a Bakal opportunity to HubSpot deal properties.
 */
function mapOpportunityToDeal(opportunity, campaign) {
  return {
    dealname: `${opportunity.company || opportunity.name} — ${campaign?.name || 'Bakal'}`,
    pipeline: 'default',
    dealstage: mapStatusToDealStage(opportunity.status),
    description: [
      campaign?.name ? `Campagne: ${campaign.name}` : '',
      campaign?.sector ? `Secteur: ${campaign.sector}` : '',
      opportunity.title ? `Poste: ${opportunity.title}` : '',
    ].filter(Boolean).join('\n'),
  };
}

/**
 * Map Bakal opportunity status to HubSpot deal stage.
 * Default pipeline stages: appointmentscheduled, qualifiedtobuy,
 * presentationscheduled, decisionmakerboughtin, contractsent, closedwon, closedlost
 */
function mapStatusToDealStage(status) {
  const stageMap = {
    new: 'appointmentscheduled',
    interested: 'qualifiedtobuy',
    meeting: 'presentationscheduled',
    negotiation: 'decisionmakerboughtin',
    won: 'closedwon',
    lost: 'closedlost',
  };
  return stageMap[status] || 'appointmentscheduled';
}

/**
 * Format memory patterns as a HubSpot note body (HTML).
 */
function formatPatternsAsNote(patterns) {
  const lines = patterns.map((p) =>
    `<li><strong>[${p.category}]</strong> ${p.pattern} <em>(${p.confidence})</em></li>`
  );
  return `<h3>Bakal — Patterns haute confiance</h3><ul>${lines.join('')}</ul>`;
}

module.exports = {
  // Contacts
  createContact,
  updateContact,
  getContact,
  searchContacts,
  // Deals
  createDeal,
  updateDeal,
  getDeal,
  // Associations
  associateContactToDeal,
  // Notes
  createNote,
  // Helpers
  mapOpportunityToContact,
  mapOpportunityToDeal,
  mapStatusToDealStage,
  formatPatternsAsNote,
};
