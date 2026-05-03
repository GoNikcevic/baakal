/**
 * Smartlead API Client
 *
 * Handles campaigns, sequences, leads, and analytics via Smartlead REST API.
 * Auth: query parameter api_key.
 * Base URL: https://server.smartlead.ai/api/v1
 */

const BASE_URL = 'https://server.smartlead.ai/api/v1';

async function slFetch(endpoint, apiKey, options = {}) {
  if (!apiKey) throw new Error('Smartlead API key is required');
  const sep = endpoint.includes('?') ? '&' : '?';
  const url = `${BASE_URL}${endpoint}${sep}api_key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(`Smartlead API ${res.status}: ${body}`), { status: res.status });
  }
  return res.json();
}

// ── Campaigns ──

async function listCampaigns(apiKey) {
  const data = await slFetch('/campaigns', apiKey);
  return (data || []).map(c => ({
    id: c.id,
    name: c.name,
    status: c.status === 'ACTIVE' ? 'active' : c.status === 'PAUSED' ? 'paused' : c.status?.toLowerCase() || 'unknown',
    createdAt: c.created_at,
  }));
}

async function getCampaign(apiKey, campaignId) {
  return slFetch(`/campaigns/${campaignId}`, apiKey);
}

async function getCampaignAnalytics(apiKey, campaignId) {
  const data = await slFetch(`/campaigns/${campaignId}/analytics`, apiKey);
  const total = data.sent_count || 0;
  return {
    sent: total,
    opens: data.open_count || 0,
    replies: data.reply_count || 0,
    bounces: data.bounce_count || 0,
    openRate: total > 0 ? Math.round((data.open_count || 0) / total * 100) : 0,
    replyRate: total > 0 ? Math.round((data.reply_count || 0) / total * 100) : 0,
    bounceRate: total > 0 ? Math.round((data.bounce_count || 0) / total * 100) : 0,
  };
}

async function createCampaign(apiKey, name) {
  return slFetch('/campaigns/create', apiKey, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

// ── Sequences ──

async function getSequences(apiKey, campaignId) {
  return slFetch(`/campaigns/${campaignId}/sequences`, apiKey);
}

async function saveSequences(apiKey, campaignId, sequences) {
  return slFetch(`/campaigns/${campaignId}/sequences`, apiKey, {
    method: 'POST',
    body: JSON.stringify({ sequences }),
  });
}

// ── Leads ──

async function addLeadsToCampaign(apiKey, campaignId, leads) {
  return slFetch(`/campaigns/${campaignId}/leads`, apiKey, {
    method: 'POST',
    body: JSON.stringify({ lead_list: leads }),
  });
}

async function getCampaignLeads(apiKey, campaignId, { offset = 0, limit = 100 } = {}) {
  return slFetch(`/campaigns/${campaignId}/leads?offset=${offset}&limit=${limit}`, apiKey);
}

async function getLeadByEmail(apiKey, campaignId, email) {
  const data = await slFetch(`/campaigns/${campaignId}/leads?email=${encodeURIComponent(email)}`, apiKey);
  return data?.[0] || null;
}

// ── Activities / Message History ──

async function getLeadMessageHistory(apiKey, campaignId, leadId) {
  return slFetch(`/campaigns/${campaignId}/leads/${leadId}/message-history`, apiKey);
}

async function getCampaignReplies(apiKey, campaignId) {
  const leads = await getCampaignLeads(apiKey, campaignId, { limit: 500 });
  const replies = [];
  for (const lead of (leads || [])) {
    if (lead.reply_count > 0 || lead.status === 'REPLIED') {
      replies.push({
        email: lead.email,
        firstName: lead.first_name,
        lastName: lead.last_name,
        company: lead.company_name,
        status: lead.status,
        replyCount: lead.reply_count || 1,
      });
    }
  }
  return replies;
}

// ── Campaign Settings ──

async function updateCampaignSettings(apiKey, campaignId, settings) {
  return slFetch(`/campaigns/${campaignId}/settings`, apiKey, {
    method: 'POST',
    body: JSON.stringify(settings),
  });
}

async function startCampaign(apiKey, campaignId) {
  return updateCampaignSettings(apiKey, campaignId, { status: 'ACTIVE' });
}

async function pauseCampaign(apiKey, campaignId) {
  return updateCampaignSettings(apiKey, campaignId, { status: 'PAUSED' });
}

// ── Email Accounts ──

async function listEmailAccounts(apiKey) {
  return slFetch('/email-accounts', apiKey);
}

module.exports = {
  listCampaigns,
  getCampaign,
  getCampaignAnalytics,
  createCampaign,
  getSequences,
  saveSequences,
  addLeadsToCampaign,
  getCampaignLeads,
  getLeadByEmail,
  getLeadMessageHistory,
  getCampaignReplies,
  updateCampaignSettings,
  startCampaign,
  pauseCampaign,
  listEmailAccounts,
};
