/* ═══════════════════════════════════════════════════
   BAKAL — Navigation, Modals & Creator Form
   ═══════════════════════════════════════════════════ */

/* ═══ Reco filter toggles ═══ */
document.querySelectorAll('.reco-filter').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.reco-filter').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});

/* ═══ Modals ═══ */
function toggleCreator() {
  document.getElementById('creatorModal').classList.toggle('show');
  // Reset footer to default state when opening
  if (document.getElementById('creatorModal').classList.contains('show')) {
    resetCreatorFooter();
  }
}

function toggleInspiration() {
  const toggle = document.getElementById('inspiToggle');
  const panel = document.getElementById('inspiPanel');
  toggle.classList.toggle('on');
  panel.classList.toggle('show');
}

/* ═══ Section navigation (dashboard tabs) ═══ */
function showSection(name) {
  ['overview', 'reports', 'campaigns', 'refinement'].forEach(s => {
    document.getElementById('section-' + s).style.display = s === name ? 'block' : 'none';
  });
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', ['overview', 'reports', 'campaigns', 'refinement'][i] === name);
  });
  if (name === 'campaigns') backToCampaignsList();
}

/* ═══ Page-level navigation ═══ */
function showPage(page) {
  const dashEls = ['section-overview','section-reports','section-campaigns','section-refinement'];
  const dashHeader = document.querySelector('.main > .page-header');
  const dashTabs = document.querySelector('.main > .tabs');
  const copyPage = document.getElementById('page-copyeditor');
  const recosPage = document.getElementById('page-recos');

  copyPage.style.display = 'none';
  recosPage.style.display = 'none';

  if (page === 'copyeditor') {
    dashHeader.style.display = 'none';
    dashTabs.style.display = 'none';
    dashEls.forEach(id => document.getElementById(id).style.display = 'none');
    copyPage.style.display = 'block';
    if (typeof initCopyEditor === 'function') initCopyEditor();
  } else if (page === 'recos') {
    dashHeader.style.display = 'none';
    dashTabs.style.display = 'none';
    dashEls.forEach(id => document.getElementById(id).style.display = 'none');
    recosPage.style.display = 'block';
  } else {
    dashHeader.style.display = 'flex';
    dashTabs.style.display = 'flex';
    showSection('overview');
  }

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (page === 'copyeditor' && item.textContent.includes('Copy')) item.classList.add('active');
    if (page === 'dashboard' && item.textContent.includes('Dashboard')) item.classList.add('active');
    if (page === 'recos' && item.textContent.includes('Recommandations')) item.classList.add('active');
  });
}

/* ═══ Creator form ═══ */
function getCreatorFormValues() {
  return {
    name:     document.getElementById('creator-name').value.trim(),
    sector:   document.getElementById('creator-sector').value,
    position: document.getElementById('creator-position').value,
    size:     document.getElementById('creator-size').value,
    zone:     document.getElementById('creator-zone').value,
    tone:     document.getElementById('creator-tone').value,
    channel:  document.getElementById('creator-channel').value,
    angle:    document.getElementById('creator-angle').value,
    volume:   document.getElementById('creator-volume').value
  };
}

function resetCreatorForm() {
  document.getElementById('creator-name').value = '';
  document.getElementById('creator-sector').selectedIndex = 0;
  document.getElementById('creator-position').selectedIndex = 0;
  document.getElementById('creator-size').selectedIndex = 0;
  document.getElementById('creator-zone').selectedIndex = 0;
  document.getElementById('creator-tone').selectedIndex = 0;
  document.getElementById('creator-channel').selectedIndex = 0;
  document.getElementById('creator-angle').selectedIndex = 0;
  document.getElementById('creator-volume').selectedIndex = 0;
  // Close inspiration if open
  const toggle = document.getElementById('inspiToggle');
  const panel = document.getElementById('inspiPanel');
  if (toggle.classList.contains('on')) {
    toggle.classList.remove('on');
    panel.classList.remove('show');
  }
}

function resetCreatorFooter() {
  const footer = document.getElementById('creatorFooter');
  footer.innerHTML = `
    <button class="btn btn-ghost" onclick="toggleCreator()">Annuler</button>
    <button class="btn btn-primary" onclick="createCampaign()">🚀 Créer la campagne</button>
  `;
}

function setSelectByText(selectEl, text) {
  for (let i = 0; i < selectEl.options.length; i++) {
    if (selectEl.options[i].text.includes(text)) {
      selectEl.selectedIndex = i;
      return;
    }
  }
}

function applyInspirationSuggestion() {
  // Fill form with the AI-suggested values
  document.getElementById('creator-name').value = 'Dirigeants Comptabilité IdF — Douleur';
  setSelectByText(document.getElementById('creator-sector'), 'Comptabilité');
  setSelectByText(document.getElementById('creator-position'), 'Dirigeant');
  setSelectByText(document.getElementById('creator-size'), '11-50');
  setSelectByText(document.getElementById('creator-zone'), 'Île-de-France');
  setSelectByText(document.getElementById('creator-tone'), 'Pro décontracté');
  setSelectByText(document.getElementById('creator-channel'), 'Email + LinkedIn');
  setSelectByText(document.getElementById('creator-angle'), 'Douleur');
  setSelectByText(document.getElementById('creator-volume'), 'Standard');

  // Close inspiration panel and scroll to top
  const toggle = document.getElementById('inspiToggle');
  const panel = document.getElementById('inspiPanel');
  toggle.classList.remove('on');
  panel.classList.remove('show');

  // Flash the form fields briefly
  document.querySelectorAll('.creator-body .form-input, .creator-body .form-select').forEach(el => {
    el.style.transition = 'box-shadow 0.3s';
    el.style.boxShadow = '0 0 0 2px var(--accent)';
    setTimeout(() => { el.style.boxShadow = ''; }, 800);
  });
}

function closeInspirationToEdit() {
  const toggle = document.getElementById('inspiToggle');
  const panel = document.getElementById('inspiPanel');
  toggle.classList.remove('on');
  panel.classList.remove('show');
  document.getElementById('creator-name').focus();
}

function createCampaign() {
  const values = getCreatorFormValues();

  // Validate name
  if (!values.name) {
    const nameInput = document.getElementById('creator-name');
    nameInput.style.boxShadow = '0 0 0 2px var(--danger)';
    nameInput.placeholder = 'Veuillez nommer votre campagne';
    nameInput.focus();
    nameInput.addEventListener('input', function handler() {
      nameInput.style.boxShadow = '';
      nameInput.placeholder = 'Ex: DRH PME Lyon — Mars 2026';
      nameInput.removeEventListener('input', handler);
    });
    return;
  }

  // Show success state in footer
  const footer = document.getElementById('creatorFooter');
  footer.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;flex:1;">
      <span style="font-size:18px;">✅</span>
      <div>
        <div style="font-weight:600;font-size:14px;">Campagne « ${values.name} » créée</div>
        <div style="font-size:12px;color:var(--text-muted);">${values.channel} · ${values.sector} · ${values.angle} · ${values.zone}</div>
      </div>
    </div>
    <button class="btn btn-primary" onclick="toggleCreator(); resetCreatorForm();">Fermer</button>
  `;
}
