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
  const card = btn.closest('.card');
  const cardBody = card.querySelector('.card-body');
  const analysisBlock = btn.closest('div[style]');

  // 1. Read proposition text so it drives the new variant's description
  const textEl = analysisBlock.querySelector('div[style*="font-size:13px"]');
  const propositionText = textEl ? textEl.innerText : '';

  // 2. Replace the button row with a deployed confirmation
  const btnRow = btn.parentElement;
  btnRow.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:16px;">🚀</span>
      <div>
        <div style="font-size:13px;font-weight:600;color:var(--success);">Variante C déployée sur Lemlist</div>
        <div style="font-size:11px;color:var(--text-muted);">250 prospects · Résultats estimés dans 5-7 jours</div>
      </div>
    </div>
    <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;" onclick="pauseTest(this)">⏸ Pause le test</button>
  `;

  // 3. Insert a new Variant C card after Variant B
  const variantB = cardBody.querySelectorAll('.variant-card');
  const lastVariant = variantB[variantB.length - 1];

  const variantCHtml = document.createElement('div');
  variantCHtml.className = 'variant-card testing';
  variantCHtml.setAttribute('data-variant', 'C');
  variantCHtml.style.cssText = 'opacity:0;transform:translateY(12px);transition:opacity 0.4s,transform 0.4s;';
  variantCHtml.innerHTML = `
    <div class="variant-header">
      <div class="variant-name">
        <span>Variante C</span>
        <span class="variant-badge testing">🧬 Nouvelle</span>
      </div>
      <span style="font-size:12px;color:var(--text-muted);">250 prospects · 0 jours</span>
    </div>
    <div class="variant-body">
      <div class="variant-message">
        <div class="subject">Objet : [Prénom], une question rapide sur votre quotidien</div>
        Angle : <strong>Douleur client (ultra-court)</strong> — Longueur de B + angle de A + CTA question ouverte. Hypothèse : combiner les forces des deux variantes.<br>
        CTA : Question ouverte · Ton : Conversationnel · Longueur : Ultra-court (2 phrases)
      </div>
      <div class="variant-metrics">
        <div class="variant-metric">
          <div class="variant-metric-value" style="color:var(--text-muted)">—</div>
          <div class="variant-metric-label">Ouverture</div>
        </div>
        <div class="variant-metric">
          <div class="variant-metric-value" style="color:var(--text-muted)">—</div>
          <div class="variant-metric-label">Réponse</div>
        </div>
        <div class="variant-metric">
          <div class="variant-metric-value" style="color:var(--text-muted)">—</div>
          <div class="variant-metric-label">Intéressés</div>
        </div>
        <div class="variant-metric">
          <div class="variant-metric-value" style="color:var(--text-muted)">—</div>
          <div class="variant-metric-label">RDV</div>
        </div>
      </div>
    </div>
  `;

  if (lastVariant && lastVariant.nextSibling) {
    cardBody.insertBefore(variantCHtml, lastVariant.nextSibling);
  } else if (lastVariant) {
    lastVariant.parentElement.insertBefore(variantCHtml, lastVariant.nextSibling);
  } else {
    cardBody.prepend(variantCHtml);
  }

  // Animate in
  requestAnimationFrame(() => {
    variantCHtml.style.opacity = '1';
    variantCHtml.style.transform = 'translateY(0)';
  });

  // 4. Update the card header to reflect new iteration
  const cardTitle = card.querySelector('.card-title');
  if (cardTitle) cardTitle.textContent = '🧬 Test actif — Campagne "DAF Île-de-France"';
  const iterSpan = card.querySelector('.card-header span[style]');
  if (iterSpan) iterSpan.textContent = 'Itération 5 · Lancé à l\'instant';

  // 5. Update the overview stats
  updateRefinementStats(1, 0);

  // 6. Add a timeline entry
  addRefinementTimeline('🚀', `Variante C lancée — Campagne "DAF Île-de-France"`, 'Angle douleur ultra-court + CTA question ouverte · 250 prospects');

  // 7. Add history entry to campaign data if available
  if (typeof BAKAL !== 'undefined' && BAKAL.campaigns && BAKAL.campaigns['daf-idf']) {
    const c = BAKAL.campaigns['daf-idf'];
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    c.history.unshift({
      version: 'v5',
      title: 'Test A/B: Variante C — Douleur ultra-court',
      desc: 'Combinaison longueur ultra-courte de B + angle douleur client de A avec CTA question ouverte.',
      result: 'testing',
      resultText: '⏳ En cours',
      date: dateStr
    });
    if (typeof BakalStore !== 'undefined') BakalStore.save();
  }

  showRefineToast('🚀 Variante C déployée — 250 prospects en cours de contact');
}

function modifyProposition(btn) {
  const analysisBlock = btn.closest('div[style]');
  const textEl = analysisBlock.querySelector('div[style*="font-size:13px"]');

  // Make the proposition editable
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

  showRefineToast('💾 Proposition sauvegardée');
}

function cancelProposition(btn) {
  saveProposition(btn);
}

function pauseTest(btn) {
  const card = btn.closest('.card');
  const cardTitle = card.querySelector('.card-title');
  const variants = card.querySelectorAll('.variant-card');

  if (btn.textContent.includes('Pause')) {
    // Pause: dim variants, update header, disable other buttons
    btn.innerHTML = '▶️ Reprendre le test';
    if (cardTitle) cardTitle.textContent = '⏸ Test en pause — Campagne "DAF Île-de-France"';
    variants.forEach(v => { v.style.transition = 'opacity 0.3s'; v.style.opacity = '0.4'; });
    card.style.borderColor = 'var(--warning)';

    // Disable launch/modify buttons while paused
    card.querySelectorAll('.btn-success, .btn-ghost').forEach(b => {
      if (b !== btn) { b.disabled = true; b.style.opacity = '0.3'; b.style.pointerEvents = 'none'; }
    });

    showRefineToast('⏸ Test mis en pause');
  } else {
    // Resume: restore variants, header, re-enable buttons
    btn.innerHTML = '⏸ Pause le test';
    if (cardTitle) cardTitle.textContent = '🧬 Test actif — Campagne "DAF Île-de-France"';
    variants.forEach(v => { v.style.opacity = '1'; });
    card.style.borderColor = '';

    card.querySelectorAll('.btn-success, .btn-ghost').forEach(b => {
      b.disabled = false; b.style.opacity = ''; b.style.pointerEvents = '';
    });

    showRefineToast('▶️ Test relancé');
  }
}

/* ═══ Refinement helpers ═══ */

function updateRefinementStats(addVariants, addTests) {
  const statValues = document.querySelectorAll('.refine-stat-value');
  if (statValues.length < 3) return;

  // Stat 0: Variantes testées (total)
  const current = parseInt(statValues[0].textContent) || 0;
  statValues[0].textContent = current + addVariants;

  // Stat 2: Tests A/B en cours
  if (addTests !== 0) {
    const currentTests = parseInt(statValues[2].textContent) || 0;
    statValues[2].textContent = Math.max(0, currentTests + addTests);
  }
}

function addRefinementTimeline(icon, action, detail) {
  const timeline = document.querySelector('.refine-timeline');
  if (!timeline) return;

  const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  const entry = document.createElement('div');
  entry.className = 'timeline-item';
  entry.style.cssText = 'opacity:0;transform:translateY(-8px);transition:opacity 0.4s,transform 0.4s;';
  entry.innerHTML = `
    <div class="timeline-dot blue"></div>
    <div class="timeline-content">
      <div class="timeline-action">${icon} ${action}</div>
      <div class="timeline-detail">${detail}</div>
      <div class="timeline-date">${dateStr}</div>
    </div>
  `;

  // Insert after the title
  const title = timeline.querySelector('.refine-timeline-title');
  if (title && title.nextSibling) {
    timeline.insertBefore(entry, title.nextSibling);
  } else {
    timeline.appendChild(entry);
  }

  requestAnimationFrame(() => {
    entry.style.opacity = '1';
    entry.style.transform = 'translateY(0)';
  });
}

function showRefineToast(message) {
  const existing = document.querySelector('.refine-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'refine-toast';
  toast.style.cssText = `
    position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
    background:var(--bg-elevated);border:1px solid var(--border);
    color:var(--text-primary);font-size:13px;font-weight:600;
    padding:10px 24px;border-radius:8px;box-shadow:var(--shadow);z-index:500;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
