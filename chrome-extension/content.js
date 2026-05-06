/**
 * Baakalai Content Script — Injected on LinkedIn pages
 *
 * Features:
 * 1. "Add to Baakalai" button on profile pages
 * 2. CRM badge on profiles already in Baakalai (green/orange/red)
 * 3. Bulk import from search results
 */

const API_BASE = 'https://app.baakal.ai/api';
let _token = null;
let _crmContacts = null; // Cache of LinkedIn URLs → CRM status

// ── Init ──

async function init() {
  _token = await getToken();
  if (!_token) return; // Not logged into Baakalai

  // Load CRM contacts for badge overlay
  await loadCrmContacts();

  // Watch for page changes (LinkedIn is SPA)
  const observer = new MutationObserver(debounce(onPageChange, 500));
  observer.observe(document.body, { childList: true, subtree: true });

  // Initial injection
  onPageChange();
}

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

// ── Token ──

function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get('baakalai_token', (data) => resolve(data.baakalai_token || null));
  });
}

async function apiFetch(path, opts = {}) {
  if (!_token) return null;
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_token}`, ...opts.headers },
  });
  if (!res.ok) return null;
  return res.json();
}

// ── Load CRM contacts ──

async function loadCrmContacts() {
  try {
    const data = await apiFetch('/dashboard/opportunities?limit=1000');
    if (!data?.opportunities) return;
    _crmContacts = new Map();
    for (const opp of data.opportunities) {
      if (opp.linkedin_url) {
        const key = normalizeLinkedInUrl(opp.linkedin_url);
        _crmContacts.set(key, { status: opp.status, name: opp.name, churnScore: opp.churn_score });
      }
    }
  } catch { _crmContacts = new Map(); }
}

function normalizeLinkedInUrl(url) {
  const match = url?.match(/linkedin\.com\/in\/([^/?]+)/);
  return match ? match[1].toLowerCase() : null;
}

// ── Page Change Handler ──

function onPageChange() {
  const url = window.location.href;

  if (url.includes('/in/')) {
    // Profile page
    injectProfileButton();
    injectProfileBadge();
  }
  if (url.includes('/search/') || url.includes('/sales/')) {
    // Search results
    injectSearchButtons();
  }
}

// ── Profile Page: "Add to Baakalai" button ──

function injectProfileButton() {
  if (document.getElementById('baakalai-add-btn')) return;

  // Find the action buttons area on the profile
  const actionsBar = document.querySelector('.pvs-profile-actions') ||
    document.querySelector('[class*="profile-actions"]') ||
    document.querySelector('.pv-top-card-v2-ctas') ||
    document.querySelector('.pv-top-card__cta-container');

  if (!actionsBar) return;

  const btn = document.createElement('button');
  btn.id = 'baakalai-add-btn';
  btn.innerHTML = `<span style="display:flex;align-items:center;gap:6px;">
    <svg width="14" height="14" viewBox="0 0 100 100"><circle cx="50" cy="50" r="13" fill="#6E57FA"/><line x1="50" y1="50" x2="22" y2="26" stroke="#C4B5FD" stroke-width="5"/><circle cx="22" cy="26" r="7" fill="#C4B5FD"/></svg>
    Add to Baakalai
  </span>`;
  Object.assign(btn.style, {
    padding: '6px 14px', borderRadius: '20px', border: '1px solid #6E57FA',
    background: '#fff', color: '#6E57FA', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    transition: 'all 0.15s', marginLeft: '8px',
  });
  btn.onmouseenter = () => { btn.style.background = '#6E57FA'; btn.style.color = '#fff'; };
  btn.onmouseleave = () => { btn.style.background = '#fff'; btn.style.color = '#6E57FA'; };
  btn.onclick = () => addProfileToBaakalai(btn);

  actionsBar.appendChild(btn);
}

async function addProfileToBaakalai(btn) {
  btn.disabled = true;
  btn.innerHTML = '<span style="color:#6E57FA">Adding...</span>';

  try {
    const profile = extractProfileData();
    if (!profile.name) throw new Error('Could not extract profile');

    const data = await apiFetch('/dashboard/opportunities', {
      method: 'POST',
      body: JSON.stringify({
        name: profile.name,
        title: profile.title,
        company: profile.company,
        linkedinUrl: profile.linkedinUrl,
        status: 'new',
      }),
    });

    if (data) {
      btn.innerHTML = '<span style="color:#16A34A">✅ Added!</span>';
      btn.style.borderColor = '#16A34A';
      // Refresh CRM cache
      if (_crmContacts) {
        const key = normalizeLinkedInUrl(profile.linkedinUrl);
        if (key) _crmContacts.set(key, { status: 'new', name: profile.name });
      }
      injectProfileBadge();
    } else {
      throw new Error('Failed');
    }
  } catch (err) {
    btn.innerHTML = `<span style="color:#DC2626">Failed</span>`;
    setTimeout(() => {
      btn.innerHTML = '<span style="display:flex;align-items:center;gap:6px;">Add to Baakalai</span>';
      btn.disabled = false;
      btn.style.borderColor = '#6E57FA';
    }, 2000);
  }
}

function extractProfileData() {
  const name = document.querySelector('h1')?.textContent?.trim() || '';
  const title = document.querySelector('[data-generated-suggestion-target*="headline"]')?.textContent?.trim() ||
    document.querySelector('.text-body-medium')?.textContent?.trim() || '';
  const company = document.querySelector('[aria-label*="Current company"]')?.textContent?.trim() ||
    document.querySelector('.pv-text-details__right-panel-item-text')?.textContent?.trim() || '';
  const publicId = window.location.pathname.match(/\/in\/([^/?]+)/)?.[1] || '';

  return {
    name,
    title,
    company,
    linkedinUrl: publicId ? `https://www.linkedin.com/in/${publicId}` : window.location.href,
  };
}

// ── Profile Badge (CRM status) ──

function injectProfileBadge() {
  if (!_crmContacts) return;
  if (document.getElementById('baakalai-badge')) return;

  const publicId = window.location.pathname.match(/\/in\/([^/?]+)/)?.[1]?.toLowerCase();
  if (!publicId) return;

  const contact = _crmContacts.get(publicId);
  if (!contact) return;

  const colors = {
    won: { bg: '#DCFCE7', border: '#16A34A', text: '#16A34A', label: 'Client' },
    new: { bg: '#EDE9FE', border: '#6E57FA', text: '#6E57FA', label: 'In CRM' },
    imported: { bg: '#DBEAFE', border: '#2563EB', text: '#2563EB', label: 'Imported' },
    interested: { bg: '#FEF3C7', border: '#D97706', text: '#D97706', label: 'Interested' },
    meeting: { bg: '#FEF3C7', border: '#D97706', text: '#D97706', label: 'Meeting' },
    lost: { bg: '#FEE2E2', border: '#DC2626', text: '#DC2626', label: 'Lost' },
  };
  const c = colors[contact.status] || colors.new;

  const nameEl = document.querySelector('h1');
  if (!nameEl) return;

  const badge = document.createElement('span');
  badge.id = 'baakalai-badge';
  badge.textContent = `baakalai · ${c.label}${contact.churnScore >= 50 ? ` · Churn ${contact.churnScore}%` : ''}`;
  Object.assign(badge.style, {
    display: 'inline-block', marginLeft: '10px', padding: '3px 10px',
    borderRadius: '12px', fontSize: '11px', fontWeight: '600',
    background: c.bg, border: `1px solid ${c.border}`, color: c.text,
    verticalAlign: 'middle', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
  });

  nameEl.parentElement.appendChild(badge);
}

// ── Search Results: Bulk Import ──

function injectSearchButtons() {
  if (document.getElementById('baakalai-bulk-bar')) return;

  const searchContainer = document.querySelector('.search-results-container') ||
    document.querySelector('[class*="search-results"]') ||
    document.querySelector('.reusable-search__entity-result-list');

  if (!searchContainer) return;

  const bar = document.createElement('div');
  bar.id = 'baakalai-bulk-bar';
  Object.assign(bar.style, {
    position: 'sticky', top: '60px', zIndex: '100',
    background: '#fff', borderBottom: '2px solid #6E57FA',
    padding: '8px 16px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  });
  bar.innerHTML = `
    <span style="font-size:13px;font-weight:600;color:#6E57FA;display:flex;align-items:center;gap:6px;">
      <svg width="14" height="14" viewBox="0 0 100 100"><circle cx="50" cy="50" r="13" fill="#6E57FA"/></svg>
      Baakalai
    </span>
    <button id="baakalai-import-btn" style="padding:6px 14px;border-radius:8px;border:1px solid #6E57FA;background:#6E57FA;color:#fff;font-size:12px;font-weight:600;cursor:pointer;">
      Import visible profiles
    </button>
    <span id="baakalai-import-status" style="font-size:11px;color:#737373;"></span>
  `;

  searchContainer.parentElement.insertBefore(bar, searchContainer);

  document.getElementById('baakalai-import-btn').onclick = importSearchResults;
}

async function importSearchResults() {
  const btn = document.getElementById('baakalai-import-btn');
  const status = document.getElementById('baakalai-import-status');
  btn.disabled = true;
  btn.textContent = 'Importing...';

  // Extract profiles from search results
  const cards = document.querySelectorAll('.reusable-search__result-container, [class*="entity-result"]');
  let imported = 0, skipped = 0;

  for (const card of cards) {
    try {
      const linkEl = card.querySelector('a[href*="/in/"]');
      const nameEl = card.querySelector('.entity-result__title-text a span span, [class*="entity-result__title"] span');
      const titleEl = card.querySelector('.entity-result__primary-subtitle, [class*="primary-subtitle"]');
      const companyEl = card.querySelector('.entity-result__secondary-subtitle, [class*="secondary-subtitle"]');

      const publicId = linkEl?.href?.match(/\/in\/([^/?]+)/)?.[1];
      const name = nameEl?.textContent?.trim();
      if (!publicId || !name) { skipped++; continue; }

      // Check if already in CRM
      if (_crmContacts?.has(publicId.toLowerCase())) { skipped++; continue; }

      const data = await apiFetch('/dashboard/opportunities', {
        method: 'POST',
        body: JSON.stringify({
          name,
          title: titleEl?.textContent?.trim() || '',
          company: companyEl?.textContent?.trim() || '',
          linkedinUrl: `https://www.linkedin.com/in/${publicId}`,
          status: 'new',
        }),
      });

      if (data) {
        imported++;
        if (_crmContacts) _crmContacts.set(publicId.toLowerCase(), { status: 'new', name });
      }
    } catch { skipped++; }
  }

  btn.textContent = 'Import visible profiles';
  btn.disabled = false;
  status.textContent = `✅ ${imported} imported, ${skipped} skipped`;
  setTimeout(() => { if (status) status.textContent = ''; }, 5000);
}

// ── Start ──

init();
