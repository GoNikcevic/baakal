// ═══════════════════════════════════════════════════════════════════════════
// BAKAL SaaS - Application JavaScript
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════ DATA ═══════════
const campaignsData = {
  'daf-idf': {
    name: 'DAF Île-de-France',
    channel: 'Email',
    channelIcon: '✉️',
    channelColor: 'var(--blue)',
    status: 'active',
    sector: 'Comptabilité',
    size: '11-50 sal.',
    angle: 'Douleur client',
    launchDate: '27 jan. 2026',
    stats: {
      sent: 156,
      opened: '68%',
      replied: '9.2%',
      interested: 6,
      meetings: 2,
      stops: '0.8%'
    },
    sequence: [
      { step: 'E1', type: 'Email', channel: 'email', timing: 'J+0', subject: '[Prénom], une question sur votre gestion financière', preview: 'Combien d\'heures par semaine votre équipe passe-t-elle sur des tâches qui pourraient être automatisées ?', sent: 156, opened: '68%', replied: '9.2%' },
      { step: 'E2', type: 'Email relance', channel: 'email', timing: 'J+3', subject: 'Re: [Prénom], une question rapide', preview: 'Je me permets de revenir vers vous suite à mon précédent message...', sent: 142, opened: '54%', replied: '4.2%' },
      { step: 'E3', type: 'Email valeur', channel: 'email', timing: 'J+7', subject: 'Une autre approche', preview: 'Si vous pouviez récupérer une journée complète par semaine...', sent: 128, opened: '42%', replied: '1.4%' },
      { step: 'E4', type: 'Break-up', channel: 'email', timing: 'J+12', subject: 'Dernière tentative', preview: 'Je ne veux pas encombrer votre boîte. Si ce n\'est pas le bon moment...', sent: 115, opened: '38%', replied: '2.1%' }
    ],
    modifications: [
      { version: 4, title: 'Objet E1 personnalisé', desc: 'Ajout du prénom + question sectorielle dans l\'objet', result: 'improved', resultText: '+8pts ouverture', date: '3 fév.' },
      { version: 3, title: 'CTA question ouverte', desc: 'Remplacement du CTA "15 min call" par une question sur les pain points', result: 'improved', resultText: '+2.1pts réponse', date: '30 jan.' },
      { version: 2, title: 'Angle douleur client', desc: 'Changement de preuve sociale vers douleur client', result: 'improved', resultText: '+3.2pts réponse', date: '28 jan.' },
      { version: 1, title: 'Lancement initial', desc: 'Séquence 4 emails, angle preuve sociale, CTA direct', result: 'neutral', resultText: 'Baseline', date: '27 jan.' }
    ]
  },
  'dirigeants-formation': {
    name: 'Dirigeants Formation',
    channel: 'LinkedIn',
    channelIcon: '💼',
    channelColor: 'var(--purple)',
    status: 'active',
    sector: 'Formation',
    size: '1-10 sal.',
    angle: 'Preuve sociale',
    launchDate: '3 fév. 2026',
    stats: {
      sent: 91,
      opened: '—',
      replied: '6.8%',
      interested: 3,
      meetings: 1,
      stops: '1.1%'
    },
    sequence: [
      { step: 'L1', type: 'Demande connexion', channel: 'linkedin', timing: 'J+0', subject: '', preview: 'Bonjour [Prénom], je m\'intéresse aux dirigeants d\'organismes de formation...', sent: 91, opened: '—', replied: '42%' },
      { step: 'L2', type: 'Message post-connexion', channel: 'linkedin', timing: 'J+1', subject: '', preview: 'Merci d\'avoir accepté ! J\'ai accompagné 3 organismes de formation...', sent: 38, opened: '—', replied: '6.8%' },
      { step: 'L3', type: 'Relance valeur', channel: 'linkedin', timing: 'J+5', subject: '', preview: 'Je partage un cas client qui pourrait vous intéresser...', sent: 32, opened: '—', replied: '3.1%' }
    ],
    modifications: [
      { version: 2, title: 'Message post-connexion raccourci', desc: 'Passage de 5 phrases à 3, suppression du pitch', result: 'testing', resultText: 'En test', date: '10 fév.' },
      { version: 1, title: 'Lancement initial', desc: 'Séquence 3 messages LinkedIn, angle preuve sociale', result: 'neutral', resultText: 'Baseline', date: '3 fév.' }
    ]
  },
  'drh-lyon': {
    name: 'DRH PME Lyon',
    channel: 'Multi',
    channelIcon: '📧+💼',
    channelColor: 'var(--orange)',
    status: 'prep',
    sector: 'Conseil',
    size: '51-200 sal.',
    angle: 'Offre directe',
    launchDate: '—',
    stats: {
      sent: 0,
      opened: '—',
      replied: '—',
      interested: 0,
      meetings: 0,
      stops: '—'
    },
    sequence: [
      { step: 'E1', type: 'Email initial', channel: 'email', timing: 'J+0', subject: 'Recrutement PME : une approche différente', preview: 'Nous aidons des DRH de PME comme [Entreprise] à réduire de 40% leur temps de recrutement...', sent: 0, opened: '—', replied: '—' },
      { step: 'L1', type: 'Connexion LinkedIn', channel: 'linkedin', timing: 'J+2', subject: '', preview: 'Bonjour [Prénom], j\'ai vu que vous étiez DRH chez [Entreprise]...', sent: 0, opened: '—', replied: '—' },
      { step: 'E2', type: 'Email relance', channel: 'email', timing: 'J+5', subject: 'Re: Recrutement PME', preview: 'Je me permets de revenir vers vous...', sent: 0, opened: '—', replied: '—' },
      { step: 'L2', type: 'Message LinkedIn', channel: 'linkedin', timing: 'J+7', subject: '', preview: 'Suite à ma demande de connexion...', sent: 0, opened: '—', replied: '—' }
    ],
    modifications: []
  }
};
// ═══════════ NAVIGATION ═══════════
function showPage(pageName) {
  // Hide all pages
  document.getElementById('section-overview').parentElement.style.display = 'block';
  document.getElementById('page-copyeditor').style.display = 'none';
  document.getElementById('page-recos').style.display = 'none';

  // Reset nav items
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

  // Show requested page
  if (pageName === 'dashboard') {
    document.getElementById('section-overview').parentElement.style.display = 'block';
    document.querySelector('.nav-item[onclick*="dashboard"]')?.classList.add('active');
    showSection('overview');
  } else if (pageName === 'copyeditor') {
    hideAllSections();
    document.getElementById('page-copyeditor').style.display = 'block';
    document.querySelector('.nav-item[onclick*="copyeditor"]')?.classList.add('active');
    initCopyEditor();
  } else if (pageName === 'recos') {
    hideAllSections();
    document.getElementById('page-recos').style.display = 'block';
    document.querySelector('.nav-item[onclick*="recos"]')?.classList.add('active');
  }
}
function hideAllSections() {
  document.getElementById('section-overview').style.display = 'none';
  document.getElementById('section-reports').style.display = 'none';
  document.getElementById('section-campaigns').style.display = 'none';
  document.getElementById('section-refinement').style.display = 'none';
  document.querySelector('.tabs').style.display = 'none';
  document.querySelector('.kpi-grid').style.display = 'none';
}
function showSection(sectionName) {
  // Show tabs and KPIs for dashboard sections
  document.querySelector('.tabs').style.display = 'flex';

  // Hide all sections
  document.getElementById('section-overview').style.display = 'none';
  document.getElementById('section-reports').style.display = 'none';
  document.getElementById('section-campaigns').style.display = 'none';
  document.getElementById('section-refinement').style.display = 'none';
  document.getElementById('page-copyeditor').style.display = 'none';
  document.getElementById('page-recos').style.display = 'none';

  // Reset tabs
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));

  // Show requested section
  const section = document.getElementById(`section-${sectionName}`);
  if (section) {
    section.style.display = 'block';
    // Activate corresponding tab
    document.querySelectorAll('.tab').forEach(tab => {
      if (tab.textContent.toLowerCase().includes(sectionName) ||
          (sectionName === 'overview' && tab.textContent.includes('Vue d\'ensemble')) ||
          (sectionName === 'reports' && tab.textContent.includes('Rapports')) ||
          (sectionName === 'campaigns' && tab.textContent.includes('Détail')) ||
          (sectionName === 'refinement' && tab.textContent.includes('Refinement'))) {
        tab.classList.add('active');
      }
    });
  }

  // Show/hide KPIs based on section
  document.querySelector('.kpi-grid').style.display = (sectionName === 'overview') ? 'grid' : 'none';

  // Reset campaign detail view if showing campaigns list
  if (sectionName === 'campaigns') {
    document.getElementById('campaigns-list-view').style.display = 'block';
    document.querySelectorAll('.campaign-detail').forEach(el => el.style.display = 'none');
  }
}
// ═══════════ CAMPAIGN DETAIL ═══════════
function showCampaignDetail(campaignId) {
  const campaign = campaignsData[campaignId];
  if (!campaign) return;

  // Hide list view
  document.getElementById('campaigns-list-view').style.display = 'none';

  // Get or create detail container
  let detailEl = document.getElementById(`detail-${campaignId}`);
  if (!detailEl.innerHTML) {
    detailEl.innerHTML = generateCampaignDetailHTML(campaignId, campaign);
  }
  detailEl.style.display = 'block';
}
function hideCampaignDetail() {
  document.querySelectorAll('.campaign-detail').forEach(el => el.style.display = 'none');
  document.getElementById('campaigns-list-view').style.display = 'block';
}
function generateCampaignDetailHTML(id, campaign) {
  const statusBadge = campaign.status === 'active'
    ? '<span class="status-badge status-active"><span class="pulse-dot" style="width:6px;height:6px;"></span> Active</span>'
    : '<span class="status-badge status-prep">⏳ En préparation</span>';

  return `
    <button class="campaign-detail-back" onclick="hideCampaignDetail()">← Retour aux campagnes</button>

    <div class="campaign-detail-header">
      <div>
        <div class="campaign-detail-title">${campaign.name}</div>
        <div class="campaign-detail-tags">
          <span class="campaign-tag">${campaign.sector}</span>
          <span class="campaign-tag">${campaign.size}</span>
          <span class="campaign-tag">${campaign.angle}</span>
          <span class="campaign-tag">Lancée ${campaign.launchDate}</span>
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:center;">
        ${statusBadge}
        <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;">✏️ Modifier</button>
        <button class="btn btn-primary" style="font-size:12px;padding:8px 14px;">📊 Rapport détaillé</button>
      </div>
    </div>

    <div class="campaign-kpis">
      <div class="campaign-kpi">
        <div class="campaign-kpi-value">${campaign.stats.sent}</div>
        <div class="campaign-kpi-label">Contacts atteints</div>
      </div>
      <div class="campaign-kpi">
        <div class="campaign-kpi-value" style="color:var(--blue)">${campaign.stats.opened}</div>
        <div class="campaign-kpi-label">Taux d'ouverture</div>
        <div class="campaign-kpi-bar"><div class="campaign-kpi-fill" style="width:${parseInt(campaign.stats.opened) || 0}%;background:var(--blue)"></div></div>
      </div>
      <div class="campaign-kpi">
        <div class="campaign-kpi-value" style="color:var(--success)">${campaign.stats.replied}</div>
        <div class="campaign-kpi-label">Taux de réponse</div>
        <div class="campaign-kpi-bar"><div class="campaign-kpi-fill" style="width:${parseFloat(campaign.stats.replied) * 10 || 0}%;background:var(--success)"></div></div>
      </div>
      <div class="campaign-kpi">
        <div class="campaign-kpi-value" style="color:var(--warning)">${campaign.stats.interested}</div>
        <div class="campaign-kpi-label">Intéressés</div>
      </div>
      <div class="campaign-kpi">
        <div class="campaign-kpi-value" style="color:var(--accent-light)">${campaign.stats.meetings}</div>
        <div class="campaign-kpi-label">RDV obtenus</div>
      </div>
    </div>

    <div class="sequence-card">
      <div class="sequence-header">
        <div class="sequence-title">📬 Séquence de ${campaign.sequence.length} touchpoints</div>
        <button class="btn btn-ghost" style="font-size:12px;padding:6px 12px;">✏️ Éditer la séquence</button>
      </div>
      <div class="sequence-steps">
        ${campaign.sequence.map(step => `
          <div class="sequence-step">
            <div class="step-indicator">
              <div class="step-dot ${step.channel}">${step.step}</div>
              <div class="step-label">${step.timing}</div>
            </div>
            <div class="step-content">
              <div class="step-type">${step.type}</div>
              ${step.subject ? `<div class="step-subject">Objet : ${step.subject}</div>` : ''}
              <div class="step-preview">${step.preview}</div>
            </div>
            <div class="step-stat">
              <div class="step-stat-value">${step.sent}</div>
              <div class="step-stat-label">Envoyés</div>
            </div>
            <div class="step-stat">
              <div class="step-stat-value" style="color:var(--blue)">${step.opened}</div>
              <div class="step-stat-label">Ouverture</div>
              <div class="step-stat-bar"><div class="step-stat-fill" style="width:${parseInt(step.opened) || 0}%;background:var(--blue)"></div></div>
            </div>
            <div class="step-stat">
              <div class="step-stat-value" style="color:var(--success)">${step.replied}</div>
              <div class="step-stat-label">Réponse</div>
              <div class="step-stat-bar"><div class="step-stat-fill" style="width:${parseFloat(step.replied) * 10 || 0}%;background:var(--success)"></div></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    ${campaign.modifications.length > 0 ? `
    <div class="card">
      <div class="card-header">
        <div class="card-title">🔄 Historique des modifications</div>
      </div>
      <div class="card-body">
        <div class="mod-history">
          ${campaign.modifications.map(mod => `
            <div class="mod-item">
              <div class="mod-version">v${mod.version}</div>
              <div class="mod-content">
                <div class="mod-title">${mod.title}</div>
                <div class="mod-desc">${mod.desc}</div>
                <span class="mod-result ${mod.result}">${mod.resultText}</span>
              </div>
              <div class="mod-date">${mod.date}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    ` : ''}
  `;
}
// ═══════════ COPY EDITOR ═══════════
function initCopyEditor() {
  const campaignList = document.getElementById('editor-campaign-list');
  const mainContent = document.getElementById('editor-main-content');

  // Populate campaign list
  campaignList.innerHTML = Object.entries(campaignsData).map(([id, camp], index) => `
    <div class="editor-campaign-item ${index === 0 ? 'active' : ''}" onclick="selectEditorCampaign('${id}')">
      <div class="eci-icon" style="background:${camp.channelColor}20;color:${camp.channelColor}">${camp.channelIcon}</div>
      <div>
        <div class="eci-name">${camp.name}</div>
        <div class="eci-meta">${camp.sequence.length} touchpoints · ${camp.channel}</div>
      </div>
    </div>
  `).join('');

  // Load first campaign
  selectEditorCampaign('daf-idf');
}
function selectEditorCampaign(campaignId) {
  const campaign = campaignsData[campaignId];
  if (!campaign) return;

  // Update active state
  document.querySelectorAll('.editor-campaign-item').forEach(el => el.classList.remove('active'));
  event.currentTarget?.classList.add('active');

  // Populate main content
  const mainContent = document.getElementById('editor-main-content');
  mainContent.innerHTML = `
    <div class="editor-header">
      <div>
        <div class="editor-header-title">${campaign.name}</div>
        <div class="editor-header-params">
          <span class="editor-param">${campaign.channel}</span>
          <span class="editor-param">${campaign.sector}</span>
          <span class="editor-param">${campaign.angle}</span>
          <span class="editor-param">${campaign.sequence.length} étapes</span>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;">📋 Dupliquer</button>
        <button class="btn btn-primary" style="font-size:12px;padding:8px 14px;">💾 Sauvegarder</button>
      </div>
    </div>

    <div class="ai-bar">
      <div class="ai-bar-icon">🤖</div>
      <div class="ai-bar-content">
        <div class="ai-bar-title">Assistant IA disponible</div>
        <div class="ai-bar-text">Sélectionnez un touchpoint et cliquez "Améliorer avec Claude" pour des suggestions personnalisées.</div>
      </div>
    </div>

    ${campaign.sequence.map((step, index) => `
      <div class="touchpoint-card" id="tp-${index}">
        <div class="tp-header">
          <div class="tp-header-left">
            <div class="tp-dot ${step.channel}">${step.step}</div>
            <div class="tp-info">
              <div class="tp-name">${step.type}</div>
              <div class="tp-timing">${step.timing} · ${step.channel === 'email' ? 'Email' : 'LinkedIn'}</div>
            </div>
          </div>
          <div class="tp-actions">
            <button class="tp-action" onclick="toggleTouchpointEdit(${index})">✏️ Éditer</button>
            <button class="tp-action ai">🤖 Améliorer</button>
            <button class="tp-action">📊 Stats</button>
          </div>
        </div>
        <div class="tp-body">
          ${step.subject ? `
          <div class="tp-field tp-subject">
            <div class="tp-field-label">
              Objet
              <span class="tp-field-count ${step.subject.length > 50 ? 'warn' : ''}">${step.subject.length}/50</span>
            </div>
            <div class="tp-editable" contenteditable="false" data-field="subject" data-index="${index}">${step.subject.replace(/\[([^\]]+)\]/g, '<span class="var">{{$1}}</span>')}</div>
          </div>
          ` : ''}
          <div class="tp-field">
            <div class="tp-field-label">
              Message
              <span class="tp-field-count">${step.preview.length} caractères</span>
            </div>
            <div class="tp-editable" contenteditable="false" data-field="body" data-index="${index}" style="min-height:80px;">${step.preview.replace(/\[([^\]]+)\]/g, '<span class="var">{{$1}}</span>')}</div>
          </div>
        </div>
      </div>
    `).join('')}

    <div class="editor-bottom-bar">
      <div class="editor-bottom-info">
        Dernière modification : aujourd'hui à 14:32 · Version 4
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;">Annuler les modifications</button>
        <button class="btn btn-success" style="font-size:12px;padding:8px 14px;">✅ Publier les changements</button>
      </div>
    </div>
  `;
}
function toggleTouchpointEdit(index) {
  const card = document.getElementById(`tp-${index}`);
  const editables = card.querySelectorAll('.tp-editable');
  const isEditing = card.classList.contains('editing');

  if (isEditing) {
    card.classList.remove('editing');
    editables.forEach(el => el.contentEditable = 'false');
  } else {
    // Close other editing cards
    document.querySelectorAll('.touchpoint-card.editing').forEach(c => {
      c.classList.remove('editing');
      c.querySelectorAll('.tp-editable').forEach(el => el.contentEditable = 'false');
    });

    card.classList.add('editing');
    editables.forEach(el => el.contentEditable = 'true');
    editables[0]?.focus();
  }
}
// ═══════════ MODAL ═══════════
function toggleCreator() {
  const modal = document.getElementById('creatorModal');
  modal.classList.toggle('show');
}
function toggleInspiration() {
  const toggle = document.querySelector('.toggle-switch');
  const panel = document.querySelector('.inspiration-panel');
  toggle.classList.toggle('on');
  panel.classList.toggle('show');
}
// Close modal on outside click
document.getElementById('creatorModal')?.addEventListener('click', (e) => {
  if (e.target.classList.contains('creator-overlay')) {
    toggleCreator();
  }
});
// ═══════════ RECOMMENDATIONS FILTERS ═══════════
document.querySelectorAll('.reco-filter').forEach(filter => {
  filter.addEventListener('click', () => {
    document.querySelectorAll('.reco-filter').forEach(f => f.classList.remove('active'));
    filter.classList.add('active');
    // TODO: Implement actual filtering
  });
});
// ═══════════ INIT ═══════════
document.addEventListener('DOMContentLoaded', () => {
  // Set initial state
  showSection('overview');

  // Make first nav item active
  document.querySelector('.nav-item')?.classList.add('active');
});
// ═══════════ KEYBOARD SHORTCUTS ═══════════
document.addEventListener('keydown', (e) => {
  // Escape to close modals
  if (e.key === 'Escape') {
    const modal = document.getElementById('creatorModal');
    if (modal.classList.contains('show')) {
      toggleCreator();
    }
  }
});
