/* ═══════════════════════════════════════════════════
   BAKAL — Pages & Global Actions
   Handles Profil, Settings, Exports, and global buttons
   ═══════════════════════════════════════════════════ */

/* ═══ Profile Page — Save ═══ */
function saveProfile() {
  const data = {
    company: document.getElementById('profil-company')?.value,
    sector: document.getElementById('profil-sector')?.value,
    website: document.getElementById('profil-website')?.value,
    teamSize: document.getElementById('profil-team-size')?.value,
    description: document.getElementById('profil-description')?.value,
    valueProp: document.getElementById('profil-value-prop')?.value,
    socialProof: document.getElementById('profil-social-proof')?.value,
    painPoints: document.getElementById('profil-pain-points')?.value,
    objections: document.getElementById('profil-objections')?.value,
    personaPrimary: document.getElementById('profil-persona-primary')?.value,
    personaSecondary: document.getElementById('profil-persona-secondary')?.value,
    targetSectors: document.getElementById('profil-target-sectors')?.value,
    targetSize: document.getElementById('profil-target-size')?.value,
    targetZones: document.getElementById('profil-target-zones')?.value,
    defaultTone: document.getElementById('profil-default-tone')?.value,
    defaultFormality: document.getElementById('profil-default-formality')?.value,
    avoidWords: document.getElementById('profil-avoid-words')?.value,
    signaturePhrases: document.getElementById('profil-signature-phrases')?.value,
  };

  // Store in localStorage for now (backend will handle persistence later)
  localStorage.setItem('bakal_profile', JSON.stringify(data));

  // Flash save confirmation
  const btn = document.querySelector('#page-profil .btn-primary');
  const original = btn.innerHTML;
  btn.innerHTML = '✅ Enregistré';
  btn.style.background = 'var(--success)';
  setTimeout(() => {
    btn.innerHTML = original;
    btn.style.background = '';
  }, 2000);
}

function loadProfile() {
  const saved = localStorage.getItem('bakal_profile');
  if (!saved) return;
  try {
    const data = JSON.parse(saved);
    const fields = {
      'profil-company': data.company,
      'profil-sector': data.sector,
      'profil-website': data.website,
      'profil-description': data.description,
      'profil-value-prop': data.valueProp,
      'profil-social-proof': data.socialProof,
      'profil-pain-points': data.painPoints,
      'profil-objections': data.objections,
      'profil-persona-primary': data.personaPrimary,
      'profil-persona-secondary': data.personaSecondary,
      'profil-target-sectors': data.targetSectors,
      'profil-target-size': data.targetSize,
      'profil-target-zones': data.targetZones,
      'profil-avoid-words': data.avoidWords,
      'profil-signature-phrases': data.signaturePhrases,
    };
    Object.entries(fields).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && val) el.value = val;
    });
    if (data.teamSize) {
      const sel = document.getElementById('profil-team-size');
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].text === data.teamSize) sel.selectedIndex = i;
      }
    }
    if (data.defaultTone) {
      const sel = document.getElementById('profil-default-tone');
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].text === data.defaultTone) sel.selectedIndex = i;
      }
    }
    if (data.defaultFormality) {
      const sel = document.getElementById('profil-default-formality');
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].text === data.defaultFormality) sel.selectedIndex = i;
      }
    }
  } catch (e) { /* ignore parse errors */ }
}

/* ═══ Settings Page — Save ═══ */
function saveSettings() {
  const data = {
    lemlistKey: document.getElementById('settings-lemlist-key')?.value,
    notionToken: document.getElementById('settings-notion-token')?.value,
    claudeKey: document.getElementById('settings-claude-key')?.value,
    lemlistDailyLimit: document.getElementById('settings-lemlist-daily-limit')?.value,
    lemlistSendWindow: document.getElementById('settings-lemlist-send-window')?.value,
    lemlistSendDays: document.getElementById('settings-lemlist-send-days')?.value,
    linkedinDelay: document.getElementById('settings-linkedin-delay')?.value,
    claudeModel: document.getElementById('settings-claude-model')?.value,
    claudeValidation: document.getElementById('settings-claude-validation')?.value,
    notifEmail: document.getElementById('settings-notif-email')?.value,
  };

  // Store in localStorage (sensitive — backend will manage securely later)
  localStorage.setItem('bakal_settings', JSON.stringify(data));

  const btn = document.querySelector('#page-settings .btn-primary');
  const original = btn.innerHTML;
  btn.innerHTML = '✅ Enregistré';
  btn.style.background = 'var(--success)';
  setTimeout(() => {
    btn.innerHTML = original;
    btn.style.background = '';
  }, 2000);
}

async function testApiConnections() {
  const keys = [
    { id: 'settings-lemlist-key', statusId: 'status-lemlist', name: 'Lemlist', backendKey: 'lemlist' },
    { id: 'settings-notion-token', statusId: 'status-notion', name: 'Notion', backendKey: 'notion' },
    { id: 'settings-claude-key', statusId: 'status-claude', name: 'Claude', backendKey: 'claude' },
  ];

  // Try to get backend health status first
  let backendServices = null;
  if (typeof BakalAPI !== 'undefined') {
    try {
      const health = await BakalAPI.testConnections();
      if (health) backendServices = health.services;
    } catch { /* backend not available */ }
  }

  keys.forEach(k => {
    const input = document.getElementById(k.id);
    const status = document.getElementById(k.statusId);
    const value = input?.value?.trim();

    // Show testing state
    status.textContent = 'Test...';
    status.className = 'input-status';
    status.style.color = 'var(--accent-light)';

    setTimeout(() => {
      // If backend reported service status, use it
      if (backendServices && backendServices[k.backendKey]) {
        status.textContent = 'Connecté (backend)';
        status.className = 'input-status connected';
        status.style.color = '';
        return;
      }

      if (!value) {
        status.textContent = backendServices ? 'Non configuré sur le serveur' : 'Non connecté';
        status.className = 'input-status';
        status.style.color = '';
        return;
      }

      // Fallback: local format validation
      let valid = false;
      if (k.name === 'Lemlist') valid = value.length > 10;
      if (k.name === 'Notion') valid = value.startsWith('ntn_') || value.startsWith('secret_');
      if (k.name === 'Claude') valid = value.startsWith('sk-ant-');

      if (valid) {
        status.textContent = 'Format OK';
        status.className = 'input-status connected';
        status.style.color = '';
      } else {
        status.textContent = 'Format invalide';
        status.className = 'input-status error';
        status.style.color = '';
      }
    }, 600);
  });
}

/* ═══ Dashboard Export ═══ */
function exportDashboardReport() {
  if (typeof BAKAL === 'undefined') return;

  const rows = [['Campagne', 'Canal', 'Statut', 'Prospects', 'Open%', 'Reply%', 'Intéressés', 'RDV']];
  Object.values(BAKAL.campaigns).forEach(c => {
    rows.push([
      c.name, c.channel, c.status, c.kpis?.contacts ?? 0,
      c.kpis?.openRate ?? '', c.kpis?.replyRate ?? '',
      c.kpis?.interested ?? '', c.kpis?.meetings ?? ''
    ]);
  });

  downloadCSV(rows, 'bakal_rapport_dashboard.csv');
}

/* ═══ Copy Editor — Export all sequences ═══ */
function exportAllSequences() {
  const rows = [['Campagne', 'Step', 'Type', 'Timing', 'Objet', 'Corps']];
  Object.entries(editorCampaigns).forEach(([key, c]) => {
    c.touchpoints.forEach(tp => {
      const body = tp.body.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
      const subject = tp.subject ? tp.subject.replace(/<[^>]*>/g, '') : '';
      rows.push([c.name, tp.id, tp.type, tp.timing, subject, body]);
    });
  });

  downloadCSV(rows, 'bakal_sequences_export.csv');
}

/* ═══ Copy Editor — Generate new sequence (simulated) ═══ */
function generateNewSequence() {
  const main = document.getElementById('editor-main-content');
  if (!main) return;

  // Show generation overlay on the editor
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:absolute;inset:0;background:rgba(10,11,15,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10;border-radius:12px;';
  overlay.innerHTML = `
    <div style="font-size:32px;margin-bottom:16px;">🤖</div>
    <div style="font-size:16px;font-weight:600;margin-bottom:8px;">Claude génère votre séquence...</div>
    <div style="font-size:13px;color:var(--text-muted);">Analyse du profil entreprise et des données cross-campagne</div>
    <div style="margin-top:24px;width:200px;height:4px;background:var(--bg-elevated);border-radius:2px;overflow:hidden;">
      <div style="width:0%;height:100%;background:var(--accent);border-radius:2px;transition:width 2s linear;" id="gen-progress"></div>
    </div>
  `;
  main.style.position = 'relative';
  main.appendChild(overlay);

  // Animate progress
  requestAnimationFrame(() => {
    const bar = document.getElementById('gen-progress');
    if (bar) bar.style.width = '100%';
  });

  // Remove after simulation
  setTimeout(() => {
    overlay.innerHTML = `
      <div style="font-size:32px;margin-bottom:16px;">✅</div>
      <div style="font-size:16px;font-weight:600;margin-bottom:8px;color:var(--success);">Séquence générée</div>
      <div style="font-size:13px;color:var(--text-muted);">Vérifiez le résultat et sauvegardez quand vous êtes satisfait</div>
    `;
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.3s';
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 300);
    }, 1500);
  }, 2500);
}

/* ═══ Recommendations — Re-run analysis (simulated) ═══ */
function rerunAnalysis() {
  const subtitle = document.querySelector('.reco-page-subtitle');
  if (subtitle) {
    subtitle.textContent = 'Claude analyse vos campagnes... Veuillez patienter.';
    subtitle.style.color = 'var(--accent-light)';

    setTimeout(() => {
      subtitle.textContent = 'Claude analyse vos campagnes et propose des optimisations · Mis à jour à l\'instant';
      subtitle.style.color = '';
    }, 3000);
  }
}

/* ═══ Campaign List — Filter toggle ═══ */
function filterCampaignsList() {
  const listView = document.getElementById('campaigns-list-view');
  if (!listView) return;

  let panel = listView.querySelector('.filter-panel');
  if (panel) { panel.remove(); return; }

  panel = document.createElement('div');
  panel.className = 'filter-panel';
  panel.style.cssText = 'background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:16px;margin:16px 0;display:flex;gap:12px;align-items:center;flex-wrap:wrap;';
  panel.innerHTML = `
    <span style="font-size:12px;color:var(--text-muted);font-weight:600;">Filtrer :</span>
    <button class="btn btn-ghost" style="font-size:11px;padding:6px 12px;" onclick="filterByStatus('active')">Actives</button>
    <button class="btn btn-ghost" style="font-size:11px;padding:6px 12px;" onclick="filterByStatus('prep')">En préparation</button>
    <button class="btn btn-ghost" style="font-size:11px;padding:6px 12px;" onclick="filterByStatus('')">Toutes</button>
    <button class="btn btn-ghost" style="font-size:11px;padding:6px 12px;margin-left:auto;" onclick="this.closest('.filter-panel').remove()">✕</button>
  `;

  const list = listView.querySelector('.campaigns-list');
  if (list) list.before(panel);
}

function filterByStatus(status) {
  const rows = document.querySelectorAll('.campaigns-list .campaign-row, .campaigns-list [onclick*="showCampaignDetail"]');
  rows.forEach(row => {
    if (!status) {
      row.style.display = '';
      return;
    }
    // Check if the row contains the matching status badge
    const badge = row.querySelector('.status-badge');
    if (!badge) { row.style.display = ''; return; }
    const isActive = badge.classList.contains('status-active');
    const isPrep = badge.classList.contains('status-prep');

    if (status === 'active') row.style.display = isActive ? '' : 'none';
    else if (status === 'prep') row.style.display = isPrep ? '' : 'none';
    else row.style.display = '';
  });
}

/* ═══ Campaign List — Sort toggle ═══ */
let sortAscending = false;
function sortCampaignsList() {
  const list = document.querySelector('.campaigns-list');
  if (!list) return;

  const rows = Array.from(list.children);
  rows.sort((a, b) => {
    // Extract reply rate from the row text
    const getReply = (el) => {
      const text = el.textContent;
      const match = text.match(/(\d+\.?\d*)%/g);
      return match && match.length >= 2 ? parseFloat(match[1]) : 0;
    };
    const diff = getReply(b) - getReply(a);
    return sortAscending ? -diff : diff;
  });

  sortAscending = !sortAscending;
  rows.forEach(r => list.appendChild(r));
}

/* ═══ Creator — Rotate inspiration ═══ */
const inspirationSuggestions = [
  { name: 'Dirigeants Comptabilité IdF — Douleur', sector: 'Comptabilité', position: 'Dirigeant', size: '11-50', zone: 'Île-de-France', tone: 'Pro décontracté', channel: 'Email + LinkedIn', angle: 'Douleur', volume: 'Standard' },
  { name: 'DRH PME Lyon — Preuve sociale', sector: 'Conseil', position: 'DRH', size: '51-200', zone: 'Lyon', tone: 'Formel & Corporate', channel: 'Email + LinkedIn', angle: 'Preuve sociale', volume: 'Modéré' },
  { name: 'DSI IT Paris — Contenu', sector: 'IT', position: 'DSI', size: '11-50', zone: 'Île-de-France', tone: 'Direct & punchy', channel: 'Email uniquement', angle: 'Contenu éducatif', volume: 'Standard' },
];
let inspiIndex = 0;

function rotateInspiration() {
  inspiIndex = (inspiIndex + 1) % inspirationSuggestions.length;
  const s = inspirationSuggestions[inspiIndex];

  const title = document.querySelector('.inspi-suggestion h5');
  if (title) title.textContent = '🎯 Campagne recommandée : "' + s.name + '"';

  const params = document.querySelectorAll('.inspi-param-value');
  if (params.length >= 6) {
    params[0].textContent = s.sector;
    params[1].textContent = s.position;
    params[2].textContent = s.size + ' salariés';
    params[3].textContent = s.zone;
    params[4].textContent = s.channel;
    params[5].textContent = s.volume;
  }

  // Flash the suggestion
  const suggestion = document.querySelector('.inspi-suggestion');
  if (suggestion) {
    suggestion.style.transition = 'box-shadow 0.3s';
    suggestion.style.boxShadow = '0 0 0 2px var(--accent)';
    setTimeout(() => { suggestion.style.boxShadow = ''; }, 800);
  }
}

/* ═══ CSV download helper ═══ */
function downloadCSV(rows, filename) {
  const csv = rows.map(r => r.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ═══ Init — Load saved data on page load ═══ */
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
});
