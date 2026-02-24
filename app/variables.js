/* ═══════════════════════════════════════════════════
   BAKAL — Variable Manager
   Rich variable system with custom creation & Lemlist sync
   ═══════════════════════════════════════════════════ */

/* ═══ Variable Registry ═══ */
const variableRegistry = {
  /* — Prospect (core Lemlist fields) — */
  prospect: [
    { key: 'firstName',   label: 'Prénom',          sync: 'synced',  source: 'lemlist' },
    { key: 'lastName',    label: 'Nom de famille',   sync: 'synced',  source: 'lemlist' },
    { key: 'email',       label: 'Email',            sync: 'synced',  source: 'lemlist' },
    { key: 'phone',       label: 'Téléphone',        sync: 'synced',  source: 'lemlist' },
    { key: 'jobTitle',    label: 'Poste / Fonction',  sync: 'synced',  source: 'lemlist' },
    { key: 'linkedinUrl', label: 'Profil LinkedIn',   sync: 'synced',  source: 'lemlist' },
  ],

  /* — Entreprise — */
  company: [
    { key: 'companyName',    label: 'Nom de l\'entreprise', sync: 'synced',  source: 'lemlist' },
    { key: 'companyDomain',  label: 'Domaine / Site web',   sync: 'synced',  source: 'lemlist' },
    { key: 'industry',       label: 'Secteur d\'activité',  sync: 'synced',  source: 'lemlist' },
    { key: 'companySize',    label: 'Taille (employés)',     sync: 'synced',  source: 'lemlist' },
    { key: 'city',           label: 'Ville',                 sync: 'synced',  source: 'lemlist' },
    { key: 'country',        label: 'Pays',                  sync: 'synced',  source: 'lemlist' },
  ],

  /* — Enrichissement (AI/scraping-generated) — */
  enrichment: [
    { key: 'icebreaker',       label: 'Icebreaker personnalisé',   sync: 'custom', source: 'ai' },
    { key: 'painPoint',        label: 'Point de douleur identifié', sync: 'custom', source: 'ai' },
    { key: 'lastPost',         label: 'Dernier post LinkedIn',      sync: 'custom', source: 'scraping' },
    { key: 'mutualConnection', label: 'Connexion en commun',        sync: 'custom', source: 'scraping' },
    { key: 'recentNews',       label: 'Actualité récente',          sync: 'custom', source: 'scraping' },
  ],

  /* — Custom (user-created) — */
  custom: []
};

/* ═══ Category labels & icons ═══ */
const varCategories = {
  prospect:    { label: 'Prospect',       icon: '👤' },
  company:     { label: 'Entreprise',     icon: '🏢' },
  enrichment:  { label: 'Enrichissement', icon: '🧠' },
  custom:      { label: 'Personnalisé',   icon: '⚙️' }
};

const syncLabels = {
  synced: 'Synced Lemlist',
  custom: 'Push vers Lemlist',
  local:  'Local uniquement'
};

/* ═══ State ═══ */
let varPanelOpen = false;

/* ═══ Count all variables ═══ */
function getTotalVarCount() {
  return Object.values(variableRegistry).reduce((sum, arr) => sum + arr.length, 0);
}

/* ═══ Toggle panel ═══ */
function toggleVarPanel() {
  varPanelOpen = !varPanelOpen;
  const toggle = document.getElementById('var-panel-toggle');
  const body = document.getElementById('var-panel-body');
  if (varPanelOpen) {
    toggle.classList.add('open');
    body.classList.add('open');
    renderVarPanel();
  } else {
    toggle.classList.remove('open');
    body.classList.remove('open');
  }
}

/* ═══ Render panel body ═══ */
function renderVarPanel() {
  const body = document.getElementById('var-panel-body');
  const count = document.getElementById('var-panel-count');
  count.textContent = getTotalVarCount();

  let html = '';

  Object.entries(variableRegistry).forEach(([catKey, vars]) => {
    if (vars.length === 0 && catKey !== 'custom') return;
    const cat = varCategories[catKey];

    html += `<div class="var-group">
      <div class="var-group-label">${cat.icon} ${cat.label}</div>
      <div class="var-list">`;

    vars.forEach((v, idx) => {
      const syncClass = v.sync || 'local';
      const syncIcon = syncClass === 'synced' ? '✓' : syncClass === 'custom' ? '↑' : '—';
      const isCustom = catKey === 'custom';

      html += `
        <div class="var-item" onclick="insertVariable('${v.key}')">
          <span class="var-item-tag">\{\{${v.key}\}\}</span>
          <span class="var-item-label">${v.label}</span>
          <span class="var-item-sync ${syncClass}" title="${syncLabels[syncClass]}">${syncIcon}</span>
          ${isCustom ? `<div class="var-item-actions">
            <button class="var-item-action-btn" onclick="event.stopPropagation();deleteCustomVar(${idx})" title="Supprimer">✕</button>
          </div>` : ''}
          <div class="var-item-tooltip">Cliquez pour insérer · ${syncLabels[syncClass]}</div>
        </div>`;
    });

    html += '</div></div>';

    // Add "create" button at end of custom section
    if (catKey === 'custom') {
      html += `<button class="var-add-btn" onclick="openVarModal()">+ Créer une variable</button>`;
    }
  });

  // If no custom vars yet, still show the create button
  if (variableRegistry.custom.length === 0) {
    html += `<div class="var-group">
      <div class="var-group-label">${varCategories.custom.icon} ${varCategories.custom.label}</div>
      <button class="var-add-btn" onclick="openVarModal()">+ Créer une variable</button>
    </div>`;
  }

  body.innerHTML = html;
}

/* ═══ Insert variable into active editor field ═══ */
function insertVariable(key) {
  const tag = `{{${key}}}`;

  // Find the currently focused editable, or the last focused one
  let target = document.querySelector('.touchpoint-card.editing .tp-editable:focus');
  if (!target) {
    target = document.querySelector('.touchpoint-card.editing .tp-editable[data-field="body"]');
  }
  if (!target) {
    // No field focused — show hint
    showVarInsertHint();
    return;
  }

  // Insert at cursor position
  const sel = window.getSelection();
  if (sel.rangeCount > 0 && target.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const span = document.createElement('span');
    span.className = 'var';
    span.textContent = tag;
    range.insertNode(span);
    // Move cursor after the inserted span
    range.setStartAfter(span);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    // Append at end
    const span = document.createElement('span');
    span.className = 'var';
    span.textContent = tag;
    target.appendChild(span);
  }

  // Flash feedback
  flashInsertFeedback(key);
}

function showVarInsertHint() {
  const existing = document.querySelector('.var-insert-hint-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'var-insert-hint-toast';
  toast.style.cssText = `
    position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
    background:var(--bg-elevated);border:1px solid var(--border);
    color:var(--text-secondary);font-size:13px;padding:10px 20px;
    border-radius:8px;box-shadow:var(--shadow);z-index:500;
  `;
  toast.textContent = 'Cliquez dans un champ de message pour y insérer la variable.';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function flashInsertFeedback(key) {
  const item = document.querySelector(`.var-item-tag`);
  // Find the right tag
  document.querySelectorAll('.var-item-tag').forEach(el => {
    if (el.textContent.includes(key)) {
      el.style.transition = 'background 0.2s';
      el.style.background = 'rgba(0,214,143,0.25)';
      el.style.color = 'var(--success)';
      setTimeout(() => {
        el.style.background = '';
        el.style.color = '';
      }, 600);
    }
  });
}

/* ═══ Variable insert bar (inline, in touchpoint cards) ═══ */
function buildVarInsertBar() {
  const allVars = [];
  Object.values(variableRegistry).forEach(arr => {
    arr.forEach(v => allVars.push(v.key));
  });
  return `<div class="var-insert-bar">${allVars.map(k =>
    `<span class="var-insert-chip" onclick="event.stopPropagation();insertVariableIntoParent(this,'${k}')" title="Insérer {{${k}}}">\{\{${k}\}\}</span>`
  ).join('')}</div>`;
}

function insertVariableIntoParent(chip, key) {
  const card = chip.closest('.touchpoint-card');
  const body = card.querySelector('.tp-editable[data-field="body"]');
  if (!body) return;

  body.focus();

  const tag = `{{${key}}}`;
  const sel = window.getSelection();

  // Insert at end of body
  const span = document.createElement('span');
  span.className = 'var';
  span.textContent = tag;

  if (sel.rangeCount > 0 && body.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(span);
    range.setStartAfter(span);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    body.appendChild(document.createTextNode(' '));
    body.appendChild(span);
  }

  // Flash chip
  chip.style.background = 'rgba(0,214,143,0.25)';
  chip.style.color = 'var(--success)';
  chip.style.borderColor = 'var(--success)';
  setTimeout(() => {
    chip.style.background = '';
    chip.style.color = '';
    chip.style.borderColor = '';
  }, 500);
}

/* ═══ Custom Variable Modal ═══ */
function openVarModal() {
  document.getElementById('var-modal-overlay').classList.add('show');
  document.getElementById('var-modal-name').value = '';
  document.getElementById('var-modal-desc').value = '';
  document.getElementById('var-modal-default').value = '';
  document.getElementById('var-modal-category').value = 'custom';
  document.getElementById('var-modal-sync').value = 'push';
  updateVarPreview();
  setTimeout(() => document.getElementById('var-modal-name').focus(), 100);
}

function closeVarModal() {
  document.getElementById('var-modal-overlay').classList.remove('show');
}

function updateVarPreview() {
  const name = document.getElementById('var-modal-name').value.trim();
  const tag = document.getElementById('var-modal-preview-tag');
  tag.textContent = name ? `{{${name}}}` : '{{maVariable}}';
}

function createCustomVariable() {
  const name = document.getElementById('var-modal-name').value.trim();
  const desc = document.getElementById('var-modal-desc').value.trim();
  const defaultVal = document.getElementById('var-modal-default').value.trim();
  const category = document.getElementById('var-modal-category').value;
  const syncMode = document.getElementById('var-modal-sync').value;

  // Validate
  if (!name) {
    document.getElementById('var-modal-name').style.borderColor = 'var(--danger)';
    setTimeout(() => document.getElementById('var-modal-name').style.borderColor = '', 1500);
    return;
  }

  // Check for duplicates
  const allKeys = Object.values(variableRegistry).flat().map(v => v.key);
  if (allKeys.includes(name)) {
    document.getElementById('var-modal-name').style.borderColor = 'var(--danger)';
    const hint = document.getElementById('var-modal-name').parentElement.querySelector('.field-hint');
    const originalText = hint.textContent;
    hint.textContent = '⚠️ Cette variable existe déjà.';
    hint.style.color = 'var(--danger)';
    setTimeout(() => { hint.textContent = originalText; hint.style.color = ''; }, 2500);
    return;
  }

  // Map sync mode
  const syncMap = {
    push: 'custom',
    pull: 'synced',
    bidirectional: 'synced',
    local: 'local'
  };

  const newVar = {
    key: name,
    label: desc || name,
    sync: syncMap[syncMode] || 'local',
    source: syncMode === 'local' ? 'local' : 'lemlist',
    defaultValue: defaultVal || null,
    syncMode: syncMode,
    isCustom: true
  };

  // Add to the right category
  const targetCat = category === 'custom' ? 'custom' : category;
  variableRegistry[targetCat].push(newVar);

  // Close modal & refresh
  closeVarModal();
  renderVarPanel();
  refreshVarInsertBars();

  // Show success toast
  showVarToast(`Variable {{${name}}} créée` + (syncMode !== 'local' ? ' · Sync Lemlist activée' : ''));
}

function deleteCustomVar(index) {
  const v = variableRegistry.custom[index];
  if (!v) return;
  variableRegistry.custom.splice(index, 1);
  renderVarPanel();
  refreshVarInsertBars();
  showVarToast(`Variable {{${v.key}}} supprimée`);
}

function showVarToast(message) {
  const existing = document.querySelector('.var-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'var-toast';
  toast.style.cssText = `
    position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
    background:var(--success);color:#fff;font-size:13px;font-weight:600;
    padding:10px 24px;border-radius:8px;box-shadow:var(--shadow);z-index:1001;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/* ═══ Refresh insert bars across all touchpoint cards ═══ */
function refreshVarInsertBars() {
  document.querySelectorAll('.var-insert-bar').forEach(bar => {
    const allVars = [];
    Object.values(variableRegistry).forEach(arr => {
      arr.forEach(v => allVars.push(v.key));
    });
    bar.innerHTML = allVars.map(k =>
      `<span class="var-insert-chip" onclick="event.stopPropagation();insertVariableIntoParent(this,'${k}')" title="Insérer {{${k}}}">\{\{${k}\}\}</span>`
    ).join('');
  });
}

/* ═══ Init: patch renderEditorMain to include insert bars ═══ */
function patchEditorWithVarBars() {
  const originalRender = renderEditorMain;
  renderEditorMain = function() {
    originalRender();
    // Inject var insert bars into each touchpoint body field
    document.querySelectorAll('.touchpoint-card .tp-field').forEach(field => {
      const editable = field.querySelector('.tp-editable[data-field="body"]');
      if (editable && !field.querySelector('.var-insert-bar')) {
        editable.insertAdjacentHTML('beforebegin', buildVarInsertBar());
      }
    });
  };
  // Re-render to apply
  renderEditorMain();
}

/* ═══ Auto-init ═══ */
document.addEventListener('DOMContentLoaded', () => {
  // Wait a tick for copy-editor.js to load first
  setTimeout(patchEditorWithVarBars, 50);
});
