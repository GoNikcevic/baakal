/**
 * Salesforce API Client
 *
 * Handles contacts, opportunities (deals), and notes via Salesforce REST API.
 * All API functions require an explicit accessToken + instanceUrl (per-user isolation).
 */

async function sfFetch(instanceUrl, accessToken, endpoint, options = {}) {
  if (!accessToken || !instanceUrl) {
    throw new Error('Salesforce credentials required (accessToken + instanceUrl)');
  }
  const url = `${instanceUrl}/services/data/v58.0${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(
      new Error(`Salesforce API ${res.status}: ${body}`),
      { status: res.status }
    );
  }

  if (res.status === 204) return null;
  return res.json();
}

// ── Contacts ──

async function createContact(instanceUrl, accessToken, data) {
  return sfFetch(instanceUrl, accessToken, '/sobjects/Contact', {
    method: 'POST',
    body: JSON.stringify({
      FirstName: data.firstName || '',
      LastName: data.lastName || data.name || 'Unknown',
      Email: data.email || '',
      Title: data.title || '',
      Company: data.company || '',
    }),
  });
}

async function searchContacts(instanceUrl, accessToken, email) {
  const query = `SELECT Id, FirstName, LastName, Email, Title FROM Contact WHERE Email = '${email.replace(/'/g, "\\'")}'`;
  const result = await sfFetch(instanceUrl, accessToken, `/query?q=${encodeURIComponent(query)}`);
  return result.records || [];
}

// ── Opportunities (Deals) ──

async function createDeal(instanceUrl, accessToken, data) {
  return sfFetch(instanceUrl, accessToken, '/sobjects/Opportunity', {
    method: 'POST',
    body: JSON.stringify({
      Name: data.name || 'Bakal Opportunity',
      StageName: mapStatusToStage(data.status),
      CloseDate: data.closeDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      Description: data.description || '',
    }),
  });
}

async function updateDeal(instanceUrl, accessToken, dealId, data) {
  return sfFetch(instanceUrl, accessToken, `/sobjects/Opportunity/${dealId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      StageName: mapStatusToStage(data.status),
      Description: data.description || undefined,
    }),
  });
}

async function getDeals(instanceUrl, accessToken, limit = 100) {
  const query = `SELECT Id, Name, StageName, Amount, CloseDate, CreatedDate FROM Opportunity ORDER BY CreatedDate DESC LIMIT ${limit}`;
  const result = await sfFetch(instanceUrl, accessToken, `/query?q=${encodeURIComponent(query)}`);
  return (result.records || []).map(r => ({
    id: r.Id,
    name: r.Name,
    stage: r.StageName,
    amount: r.Amount,
    closeDate: r.CloseDate,
    createdAt: r.CreatedDate,
  }));
}

// ── Notes ──

async function createNote(instanceUrl, accessToken, data) {
  return sfFetch(instanceUrl, accessToken, '/sobjects/Note', {
    method: 'POST',
    body: JSON.stringify({
      Title: data.title || 'Bakal Note',
      Body: data.body || '',
      ParentId: data.parentId,
    }),
  });
}

// ── Helpers ──

function mapStatusToStage(status) {
  const map = {
    new: 'Prospecting',
    interested: 'Qualification',
    meeting: 'Needs Analysis',
    negotiation: 'Negotiation/Review',
    won: 'Closed Won',
    lost: 'Closed Lost',
  };
  return map[status] || 'Prospecting';
}

function mapOpportunityToContact(opp) {
  const parts = (opp.name || '').split(' ');
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || parts[0] || 'Unknown',
    email: opp.email || '',
    title: opp.title || '',
    company: opp.company || '',
  };
}

// ── Update Contact ──

async function updateContact(instanceUrl, accessToken, contactId, data) {
  await sfFetch(instanceUrl, accessToken, `/sobjects/Contact/${contactId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      FirstName: data.firstName,
      LastName: data.lastName,
      Email: data.email,
      Title: data.title,
      ...(data.company ? { Account: { Name: data.company } } : {}),
    }),
  });
  return { id: contactId };
}

// ── Upsert Contact (search by email, update or create) ──

async function upsertContact(instanceUrl, accessToken, data) {
  const existing = await searchContacts(instanceUrl, accessToken, data.email);
  if (existing && existing.length > 0) {
    const contactId = existing[0].Id;
    await updateContact(instanceUrl, accessToken, contactId, data);
    return { id: contactId, created: false };
  }
  const created = await createContact(instanceUrl, accessToken, data);
  return { id: created.id, created: true };
}

// ── Get Deal by ID ──

async function getDeal(instanceUrl, accessToken, dealId) {
  return sfFetch(instanceUrl, accessToken, `/sobjects/Opportunity/${dealId}`);
}

// ── Get Deal Stages (dynamic discovery) ──

async function getStages(instanceUrl, accessToken) {
  const result = await sfFetch(instanceUrl, accessToken,
    `/query?q=${encodeURIComponent("SELECT Id, MasterLabel, SortOrder, IsClosed, IsWon FROM OpportunityStage ORDER BY SortOrder")}`
  );
  return (result.records || []).map(s => ({
    id: s.Id,
    name: s.MasterLabel,
    order: s.SortOrder,
    isClosed: s.IsClosed,
    isWon: s.IsWon,
  }));
}

// ── Get Users (for owner mapping) ──

async function getUsers(instanceUrl, accessToken) {
  const result = await sfFetch(instanceUrl, accessToken,
    `/query?q=${encodeURIComponent("SELECT Id, Name, Email, IsActive FROM User WHERE IsActive = true LIMIT 200")}`
  );
  return (result.records || []).map(u => ({
    id: u.Id,
    name: u.Name,
    email: u.Email,
    active: u.IsActive,
  }));
}

// ── Get Activities/Tasks ──

async function getActivities(instanceUrl, accessToken, contactId) {
  const result = await sfFetch(instanceUrl, accessToken,
    `/query?q=${encodeURIComponent(`SELECT Id, Subject, Status, ActivityDate, Description, WhoId FROM Task WHERE WhoId = '${contactId}' ORDER BY ActivityDate DESC LIMIT 50`)}`
  );
  return (result.records || []).map(a => ({
    id: a.Id,
    subject: a.Subject,
    status: a.Status,
    date: a.ActivityDate,
    description: a.Description,
  }));
}

// ── List All Contacts ──

async function listContacts(instanceUrl, accessToken, { limit = 500 } = {}) {
  const result = await sfFetch(instanceUrl, accessToken,
    `/query?q=${encodeURIComponent(`SELECT Id, FirstName, LastName, Email, Title, Account.Name, OwnerId FROM Contact WHERE Email != null ORDER BY CreatedDate DESC LIMIT ${limit}`)}`
  );
  return (result.records || []).map(c => ({
    id: c.Id,
    name: `${c.FirstName || ''} ${c.LastName || ''}`.trim(),
    email: c.Email,
    title: c.Title,
    company: c.Account?.Name || '',
    ownerId: c.OwnerId,
  }));
}

// ── Get Contact Fields (for field mapping) ──

async function getContactFields(instanceUrl, accessToken) {
  const data = await sfFetch(instanceUrl, accessToken, '/sobjects/Contact/describe');
  return (data.fields || []).map(f => ({
    key: f.name,
    name: f.label,
    type: f.type,
    options: (f.picklistValues || []).map(p => ({ id: p.value, label: p.label })),
  }));
}

module.exports = {
  createContact,
  updateContact,
  upsertContact,
  searchContacts,
  listContacts,
  createDeal,
  updateDeal,
  getDeal,
  getDeals,
  getStages,
  getUsers,
  getActivities,
  getContactFields,
  createNote,
  mapStatusToStage,
  mapOpportunityToContact,
};
