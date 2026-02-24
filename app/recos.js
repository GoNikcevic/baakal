/* ═══════════════════════════════════════════════════
   BAKAL — Recommendations Page Interactions
   ═══════════════════════════════════════════════════ */

/* ═══ Apply recommendation ═══ */
function applyReco(btn) {
  const card = btn.closest('.reco-card');
  const title = card.querySelector('.reco-card-title').textContent;
  const campaign = card.querySelector('.reco-card-campaign').textContent;
  const step = card.querySelector('.reco-card-step').textContent;
  const impact = card.querySelector('.reco-impact-badge')?.textContent || '';

  // Transition card to applied state
  card.className = 'reco-card priority-applied';
  card.querySelector('.reco-priority-badge').className = 'reco-priority-badge applied';
  card.querySelector('.reco-priority-badge').textContent = 'Appliquée';

  // Replace actions with applied note
  const actions = card.querySelector('.reco-card-actions');
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  actions.outerHTML = `
    <div class="reco-applied-note">
      ✅ Appliquée le ${dateStr} · En attente de données ${impact ? '· Impact attendu : ' + impact : ''}
    </div>`;

  // Hide the diff panel
  const diff = card.querySelector('.reco-diff');
  if (diff) {
    diff.querySelector('.reco-diff-panel:first-child').style.display = 'none';
    const afterPanel = diff.querySelector('.reco-diff-panel:last-child');
    afterPanel.querySelector('.reco-diff-label').textContent = 'Version appliquée';
    afterPanel.querySelector('.reco-diff-label').className = 'reco-diff-label after';
  }

  updateRecoStats();
}

/* ═══ Dismiss recommendation ═══ */
function dismissReco(btn) {
  const card = btn.closest('.reco-card');

  // Collapse the card body with animation
  card.style.transition = 'opacity 0.3s, transform 0.3s';
  card.style.opacity = '0.4';
  card.style.transform = 'scale(0.98)';

  // After animation, collapse the body
  setTimeout(() => {
    const body = card.querySelector('.reco-card-body');
    body.style.transition = 'max-height 0.3s, padding 0.3s';
    body.style.maxHeight = '0';
    body.style.padding = '0 24px';
    body.style.overflow = 'hidden';

    // Update badge
    card.querySelector('.reco-priority-badge').textContent = 'Ignorée';
    card.querySelector('.reco-priority-badge').className = 'reco-priority-badge';
    card.querySelector('.reco-priority-badge').style.cssText = 'background:var(--bg-elevated);color:var(--text-muted);border:1px solid var(--border);';
    card.style.borderLeftColor = 'var(--border)';
    card.style.opacity = '0.5';
    card.style.transform = '';

    updateRecoStats();
  }, 300);
}

/* ═══ Modify before applying ═══ */
function modifyReco(btn) {
  const card = btn.closest('.reco-card');
  const afterText = card.querySelector('.reco-diff-panel:last-child .reco-diff-text');

  if (!afterText) return;

  // Make the "after" text editable
  afterText.contentEditable = 'true';
  afterText.style.cssText = 'border:2px solid var(--accent);border-radius:8px;padding:12px;outline:none;min-height:60px;';
  afterText.focus();

  // Replace buttons with save/cancel
  const actions = card.querySelector('.reco-card-actions');
  actions.innerHTML = `
    <button class="reco-btn accept" onclick="applyReco(this)">✅ Appliquer la version modifiée</button>
    <button class="reco-btn dismiss" onclick="cancelModifyReco(this)">Annuler</button>
  `;

  // Highlight the panel
  const panel = afterText.closest('.reco-diff-panel');
  panel.querySelector('.reco-diff-label').textContent = 'Votre version (modifiable)';
}

function cancelModifyReco(btn) {
  const card = btn.closest('.reco-card');
  const afterText = card.querySelector('.reco-diff-panel:last-child .reco-diff-text');

  // Remove editable
  afterText.contentEditable = 'false';
  afterText.style.cssText = '';

  // Restore label
  card.querySelector('.reco-diff-panel:last-child .reco-diff-label').textContent = 'Proposition Claude';

  // Restore original buttons
  const priority = card.classList.contains('priority-critical') ? "avant d'appliquer" : '';
  const actions = card.querySelector('.reco-card-actions');
  actions.innerHTML = `
    <button class="reco-btn accept" onclick="applyReco(this)">✅ Appliquer</button>
    <button class="reco-btn modify" onclick="modifyReco(this)">✏️ Modifier ${priority}</button>
    <button class="reco-btn dismiss" onclick="dismissReco(this)">Ignorer</button>
  `;
}

/* ═══ Update stat counters ═══ */
function updateRecoStats() {
  const cards = document.querySelectorAll('.reco-card');
  let applied = 0, pending = 0, ignored = 0;

  cards.forEach(card => {
    const badge = card.querySelector('.reco-priority-badge');
    if (!badge) return;
    const text = badge.textContent.trim();
    if (text === 'Appliquée') applied++;
    else if (text === 'Ignorée') ignored++;
    else pending++;
  });

  const statValues = document.querySelectorAll('.reco-stat-card .reco-stat-value');
  if (statValues.length >= 4) {
    statValues[0].textContent = applied + pending + ignored; // total
    statValues[1].textContent = applied;
    statValues[2].textContent = pending;
    statValues[3].textContent = ignored;
  }
}

/* ═══ Refinement A/B controls ═══ */
function launchVariantC(btn) {
  const analysisBlock = btn.closest('div[style]');

  // Replace button area with launched state
  const btnRow = btn.parentElement;
  btnRow.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:16px;">🚀</span>
      <div>
        <div style="font-size:13px;font-weight:600;color:var(--success);">Variante C lancée</div>
        <div style="font-size:11px;color:var(--text-muted);">Déploiement en cours sur Lemlist · Résultats estimés dans 5-7 jours</div>
      </div>
    </div>
    <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;" onclick="pauseTest(this)">⏸ Pause le test</button>
  `;
}

function modifyProposition(btn) {
  const analysisBlock = btn.closest('div[style]');
  const textEl = analysisBlock.querySelector('div[style*="font-size:13px"]');

  // Find the "Prochaine itération" part and make it editable
  textEl.contentEditable = 'true';
  textEl.style.border = '2px solid var(--accent)';
  textEl.style.borderRadius = '8px';
  textEl.style.padding = '12px';
  textEl.style.outline = 'none';
  textEl.focus();

  // Replace buttons
  const btnRow = btn.parentElement;
  btnRow.innerHTML = `
    <button class="btn btn-success" style="font-size:12px;padding:8px 14px;" onclick="saveProposition(this)">💾 Sauvegarder</button>
    <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;" onclick="cancelProposition(this)">Annuler</button>
  `;
}

function saveProposition(btn) {
  const analysisBlock = btn.closest('div[style]');
  const textEl = analysisBlock.querySelector('div[style*="font-size:13px"]');
  textEl.contentEditable = 'false';
  textEl.style.border = '';
  textEl.style.padding = '';

  const btnRow = btn.parentElement;
  btnRow.innerHTML = `
    <button class="btn btn-success" style="font-size:12px;padding:8px 14px;" onclick="launchVariantC(this)">✅ Lancer Variante C</button>
    <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;" onclick="modifyProposition(this)">✏️ Modifier la proposition</button>
    <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;" onclick="pauseTest(this)">⏸ Pause le test</button>
  `;
}

function cancelProposition(btn) {
  saveProposition(btn); // Same restore logic
}

function pauseTest(btn) {
  const card = btn.closest('.card');
  const header = card.querySelector('.card-title');
  const originalTitle = header.textContent;

  // Toggle pause
  if (btn.textContent.includes('Pause')) {
    btn.innerHTML = '▶️ Reprendre le test';
    header.innerHTML = '⏸ Test en pause — Campagne "DAF Île-de-France"';
    card.style.opacity = '0.6';
  } else {
    btn.innerHTML = '⏸ Pause le test';
    header.innerHTML = '🧬 Test actif — Campagne "DAF Île-de-France"';
    card.style.opacity = '1';
  }
}
