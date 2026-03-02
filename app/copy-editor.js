/* ═══════════════════════════════════════════════════
   BAKAL — Copy & Sequences Editor
   Split-panel editor with inline editing + AI features
   ═══════════════════════════════════════════════════ */

/* ═══ Campaign Data ═══ */
const editorCampaigns = {
  'daf-idf': {
    name: 'DAF Île-de-France',
    icon: '✉️',
    iconBg: 'var(--blue-bg)',
    channel: 'Email',
    meta: '4 touchpoints · Itération 4',
    status: 'active',
    params: [
      { l: 'Canal', v: 'Email' }, { l: 'Cible', v: 'DAF · Comptabilité' },
      { l: 'Taille', v: '11-50 sal.' }, { l: 'Angle', v: 'Douleur client' },
      { l: 'Ton', v: 'Pro décontracté' }, { l: 'Tutoiement', v: 'Vous' },
      { l: 'Longueur', v: 'Court (3 phrases)' }, { l: 'CTA', v: 'Question ouverte' }
    ],
    aiBar: {
      title: '2 suggestions disponibles',
      text: "E3 : l'angle anxiogène sous-performe (-3pts réponse). E4 : le break-up peut être raccourci (actuellement 4 phrases, objectif 3)."
    },
    touchpoints: [
      {
        id: 'E1', type: 'email', label: 'Email initial', timing: 'J+0 · Envoyé à 247 prospects',
        subType: 'Angle douleur client',
        subject: '<span class="var">{{firstName}}</span>, une question sur votre gestion financière',
        body: 'Bonjour <span class="var">{{firstName}}</span>,\n\nCombien d\'heures par semaine votre équipe passe-t-elle sur des tâches qui pourraient être automatisées ?\n\nChez <span class="var">{{companyName}}</span>, les cabinets comme le vôtre gagnent en moyenne 12h/semaine en digitalisant trois processus clés.\n\nQuel est votre plus gros frein opérationnel en ce moment ?',
        suggestion: null
      },
      {
        id: 'E2', type: 'email', label: 'Email valeur', timing: 'J+3 · Case study',
        subType: 'Preuve par l\'exemple',
        subject: 'Re: gestion financière — un cas concret',
        body: '<span class="var">{{firstName}}</span>, je me permets de revenir avec un exemple concret.\n\nLe cabinet Nexia Conseil (35 personnes, secteur similaire) a réduit de 40% le temps de reporting mensuel en automatisant la collecte de données.\n\nRésultat : 2 jours récupérés chaque mois pour du conseil à valeur ajoutée.\n\nEst-ce que c\'est un sujet chez <span class="var">{{companyName}}</span> ?',
        suggestion: null
      },
      {
        id: 'E3', type: 'email', label: 'Email relance', timing: 'J+7 · Angle différent',
        subType: 'Changement d\'angle',
        subject: 'Autre approche, <span class="var">{{firstName}}</span>',
        body: '<span class="var">{{firstName}}</span>, je change d\'approche.\n\nPlutôt que de parler d\'automatisation, une question simple : quel est le coût réel d\'une erreur de saisie dans un bilan chez <span class="var">{{companyName}}</span> ?\n\nPour les cabinets de votre taille, nos clients estiment ce coût entre 2 000 et 8 000€ par incident.\n\nSi le sujet vous parle, je peux vous montrer comment d\'autres cabinets ont éliminé ce risque.',
        suggestion: {
          label: '💡 Suggestion IA — Changer l\'angle',
          text: 'L\'angle "coût de l\'erreur" est perçu comme anxiogène sur ce segment. Les données montrent que l\'angle "gain de temps" performe +2.1pts mieux. <strong>Proposition :</strong> "Si vous pouviez récupérer une journée par semaine, qu\'en feriez-vous ?" → CTA question ouverte positive.'
        }
      },
      {
        id: 'E4', type: 'email', label: 'Email break-up', timing: 'J+12 · Soft close',
        subType: 'Dernier message',
        subject: 'Dernière tentative, <span class="var">{{firstName}}</span>',
        body: '<span class="var">{{firstName}}</span>, je ne veux pas encombrer votre boîte.\n\nSi ce n\'est pas le bon moment, pas de souci — je ne reviendrai pas.\n\nJuste un dernier mot : si un jour 12h/semaine récupérées ça vous intéresse, mon agenda est ouvert.\n\nBonne continuation.',
        suggestion: {
          label: '💡 Suggestion IA — Raccourcir',
          text: 'Le break-up fait 4 phrases, objectif 3 max. Supprimer "Juste un dernier mot..." et intégrer le bénéfice dans la phrase précédente.'
        }
      }
    ]
  },

  'dirigeants-formation': {
    name: 'Dirigeants Formation',
    icon: '💼',
    iconBg: 'rgba(151,117,250,0.15)',
    channel: 'LinkedIn',
    meta: '2 touchpoints · Itération 2',
    status: 'active',
    params: [
      { l: 'Canal', v: 'LinkedIn' }, { l: 'Cible', v: 'Dirigeant · Formation' },
      { l: 'Taille', v: '1-10 sal.' }, { l: 'Angle', v: 'Preuve sociale' },
      { l: 'Ton', v: 'Pro décontracté' }, { l: 'Tutoiement', v: 'Vous' },
      { l: 'CTA', v: 'Question ouverte' }
    ],
    aiBar: {
      title: '1 suggestion critique',
      text: "L2 : le taux de réponse (6.8%) est sous l'objectif (8%). Changer l'angle de preuve sociale → douleur client."
    },
    touchpoints: [
      {
        id: 'L1', type: 'linkedin', label: 'Note de connexion', timing: 'J+0 · Max 300 caractères',
        subType: 'Première prise de contact',
        subject: null,
        body: '<span class="var">{{firstName}}</span>, votre parcours dans la formation m\'a interpellé. J\'accompagne des dirigeants du secteur sur la croissance commerciale — je serais ravi d\'échanger avec vous.',
        maxChars: 300,
        suggestion: null
      },
      {
        id: 'L2', type: 'linkedin', label: 'Message post-connexion', timing: 'J+3 · Conversationnel',
        subType: 'Après acceptation',
        subject: null,
        body: 'Merci d\'avoir accepté, <span class="var">{{firstName}}</span> !\n\nJ\'ai accompagné 3 organismes de formation comme le vôtre à générer entre 5 et 12 RDV qualifiés par mois.\n\nCurieux de savoir comment vous gérez votre développement commercial actuellement ?',
        suggestion: {
          label: '⚡ Suggestion critique — Changer l\'angle',
          text: '6.8% de réponse vs 8% cible. Le "3 organismes de formation" manque de spécificité. <strong>Proposition :</strong> Passer à l\'angle douleur client : "Quel est votre plus gros frein pour trouver de nouveaux clients en ce moment ?" → +1.5-2pts estimés.'
        }
      }
    ]
  },

  'drh-lyon': {
    name: 'DRH PME Lyon',
    icon: '📧',
    iconBg: 'var(--warning-bg)',
    channel: 'Multi-canal',
    meta: '6 touchpoints · En préparation',
    status: 'prep',
    params: [
      { l: 'Canal', v: 'Email + LinkedIn' }, { l: 'Cible', v: 'DRH · Conseil' },
      { l: 'Taille', v: '51-200 sal.' }, { l: 'Angle', v: 'Offre directe' },
      { l: 'Ton', v: 'Formel & Corporate' }, { l: 'Tutoiement', v: 'Vous' },
      { l: 'Longueur', v: 'Standard' }, { l: 'CTA', v: 'Proposition de call' }
    ],
    aiBar: {
      title: '1 alerte pré-lancement',
      text: "Le CTA \"15 minutes cette semaine\" est trop agressif pour un premier contact DRH. Les questions ouvertes convertissent 2x mieux."
    },
    touchpoints: [
      {
        id: 'E1', type: 'email', label: 'Email initial', timing: 'J+0 · Offre directe',
        subType: 'Premier contact',
        subject: '<span class="var">{{firstName}}</span>, une solution concrète pour vos recrutements',
        body: 'Bonjour <span class="var">{{firstName}}</span>,\n\nNous aidons des DRH de PME comme <span class="var">{{companyName}}</span> à réduire de 40% leur temps de recrutement grâce à une méthode structurée d\'approche directe.\n\nSeriez-vous disponible 15 minutes cette semaine pour en discuter ?',
        suggestion: {
          label: '⚠️ Alerte IA — CTA trop agressif',
          text: 'Le CTA "15 minutes cette semaine" est trop direct pour un premier contact DRH. Vos données montrent que les questions ouvertes convertissent 2x mieux. <strong>Proposition :</strong> "Quel est votre plus gros défi recrutement en ce moment ?" → +2-3pts estimés.'
        }
      },
      {
        id: 'L1', type: 'linkedin', label: 'Note de connexion LinkedIn', timing: 'J+1 · Max 300 chars',
        subType: 'Prise de contact LK',
        subject: null,
        body: '<span class="var">{{firstName}}</span>, votre expertise RH chez <span class="var">{{companyName}}</span> m\'a interpellé. J\'échange régulièrement avec des DRH de PME lyonnaises — je serais ravi de vous compter dans mon réseau.',
        maxChars: 300,
        suggestion: null
      },
      {
        id: 'E2', type: 'email', label: 'Email valeur', timing: 'J+4 · Case study',
        subType: 'Preuve par l\'exemple',
        subject: 'Re: recrutements — un résultat qui parle',
        body: '<span class="var">{{firstName}}</span>, un exemple concret : une PME de conseil RH (180 personnes, Lyon) a divisé par 2 ses délais de recrutement en 3 mois.\n\nLeur secret ? Une méthode d\'approche directe structurée qui génère 3x plus de candidatures qualifiées.\n\nSi vous faites face à des défis similaires chez <span class="var">{{companyName}}</span>, je serais heureux d\'en discuter.',
        suggestion: null
      },
      {
        id: 'L2', type: 'linkedin', label: 'Message LinkedIn', timing: 'J+5 · Post-connexion',
        subType: 'Après acceptation LK',
        subject: null,
        body: 'Merci d\'avoir accepté, <span class="var">{{firstName}}</span> !\n\nJ\'accompagne des PME lyonnaises sur l\'optimisation de leurs processus RH. Comment gérez-vous vos recrutements chez <span class="var">{{companyName}}</span> actuellement ?',
        suggestion: null
      },
      {
        id: 'E3', type: 'email', label: 'Email relance', timing: 'J+8 · Angle différent',
        subType: 'Nouvelle perspective',
        subject: 'Autre approche, <span class="var">{{firstName}}</span>',
        body: '<span class="var">{{firstName}}</span>, une autre manière de voir les choses : combien vous coûte un recrutement raté chez <span class="var">{{companyName}}</span> ?\n\nPour les PME de votre taille, nos clients estiment ce coût entre 15 000 et 45 000€.\n\nSi vous souhaitez en discuter, je suis disponible.',
        suggestion: null
      },
      {
        id: 'E4', type: 'email', label: 'Email break-up', timing: 'J+13 · Soft close',
        subType: 'Dernier message',
        subject: '<span class="var">{{firstName}}</span>, dernier message',
        body: '<span class="var">{{firstName}}</span>, dernier message de ma part.\n\nSi le timing n\'est pas bon, aucun souci. Mon agenda reste ouvert si le sujet devient prioritaire.\n\nBonne continuation.',
        suggestion: null
      }
    ]
  }
};

/* ═══ State ═══ */
let activeEditorCampaign = 'daf-idf';

/* ═══ Variable highlighting ═══ */
function highlightVars(text) {
  return text.replace(/\{\{(\w+)\}\}/g, '<span class="var">{{$1}}</span>');
}

/* ═══ Character counter ═══ */
function getPlainTextLength(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent.length;
}

function updateCharCount(tpId) {
  const el = document.querySelector(`[data-tp="${tpId}"] .tp-editable[data-field="body"]`);
  const counter = document.querySelector(`[data-tp="${tpId}"] .tp-field-count`);
  if (!el || !counter) return;
  const max = parseInt(counter.dataset.max);
  if (!max) return;
  const len = getPlainTextLength(el.innerHTML);
  counter.textContent = `${len} / ${max} caractères`;
  counter.className = 'tp-field-count' + (len > max ? ' over' : len > max * 0.9 ? ' warn' : '');
}

/* ═══ Render Campaign List ═══ */
function renderEditorSidebar() {
  const list = document.getElementById('editor-campaign-list');
  let html = '';
  Object.entries(editorCampaigns).forEach(([key, c]) => {
    const active = key === activeEditorCampaign ? ' active' : '';
    const statusDot = c.status === 'active'
      ? '<span class="pulse-dot" style="width:6px;height:6px;margin-left:4px;"></span>'
      : '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--warning);margin-left:4px;"></span>';
    html += `
      <div class="editor-campaign-item${active}" onclick="selectEditorCampaign('${key}')">
        <div class="eci-icon" style="background:${c.iconBg}">${c.icon}</div>
        <div>
          <div class="eci-name">${c.name} ${statusDot}</div>
          <div class="eci-meta">${c.meta}</div>
        </div>
      </div>`;
  });
  list.innerHTML = html;
}

/* ═══ Render Editor Main Content ═══ */
function renderEditorMain() {
  const c = editorCampaigns[activeEditorCampaign];
  const main = document.getElementById('editor-main-content');

  // Header
  let paramsHtml = c.params.map(p => `<span class="editor-param">${p.l}: ${p.v}</span>`).join('');

  // AI bar
  const aiBarHtml = `
    <div class="ai-bar">
      <div class="ai-bar-icon">🤖</div>
      <div class="ai-bar-content">
        <div class="ai-bar-title">${c.aiBar.title}</div>
        <div class="ai-bar-text">${c.aiBar.text}</div>
      </div>
      <button class="btn btn-ghost" style="font-size:11px;padding:6px 12px;white-space:nowrap;" onclick="applyAllSuggestions()">Appliquer tout</button>
      <button class="btn btn-ghost" style="font-size:11px;padding:6px 12px;white-space:nowrap;" onclick="dismissAllSuggestions()">Ignorer</button>
    </div>`;

  // Touchpoints
  let tpHtml = '';
  c.touchpoints.forEach(tp => {
    const isLinkedin = tp.type === 'linkedin';

    // Subject field (emails only)
    let subjectField = '';
    if (tp.subject !== null) {
      subjectField = `
        <div class="tp-field tp-subject">
          <div class="tp-field-label">Objet</div>
          <div class="tp-editable" contenteditable="true" data-field="subject">${tp.subject}</div>
        </div>`;
    }

    // Body field
    const bodyText = tp.body.replace(/\n/g, '<br>');
    const charCounter = tp.maxChars
      ? `<span class="tp-field-count" data-max="${tp.maxChars}">${getPlainTextLength(tp.body)} / ${tp.maxChars} caractères</span>`
      : '';

    // AI suggestion
    let suggestionHtml = '';
    if (tp.suggestion) {
      suggestionHtml = `
        <div class="tp-ai-suggestion">
          <div class="tp-ai-suggestion-label">${tp.suggestion.label}</div>
          <div class="tp-ai-suggestion-text">${tp.suggestion.text}</div>
          <div style="display:flex;gap:6px;margin-top:8px;">
            <button class="tp-action ai" style="font-size:11px;" onclick="applySuggestion('${tp.id}')">✅ Appliquer</button>
            <button class="tp-action" style="font-size:11px;" onclick="dismissSuggestion('${tp.id}')">❌ Ignorer</button>
          </div>
        </div>`;
    }

    tpHtml += `
      <div class="touchpoint-card" data-tp="${tp.id}">
        <div class="tp-header">
          <div class="tp-header-left">
            <div class="tp-dot ${tp.type}">${tp.id}</div>
            <div class="tp-info">
              <div class="tp-name">${tp.label} — ${tp.subType}</div>
              <div class="tp-timing">${tp.timing}</div>
            </div>
          </div>
          <div class="tp-actions">
            <button class="tp-action ai" onclick="regenerateTouchpoint('${tp.id}')">🔄 Régénérer</button>
            <button class="tp-action" onclick="duplicateTouchpoint('${tp.id}')">📋 Dupliquer</button>
            <button class="tp-action" onclick="deleteTouchpoint('${tp.id}')">🗑️</button>
          </div>
        </div>
        <div class="tp-body">
          ${subjectField}
          <div class="tp-field">
            <div class="tp-field-label">
              ${isLinkedin ? 'Message' : 'Corps du message'}
              ${charCounter}
            </div>
            <div class="tp-editable" contenteditable="true" data-field="body" ${tp.maxChars ? `oninput="updateCharCount('${tp.id}')"` : ''}>${bodyText}</div>
          </div>
          ${suggestionHtml}
        </div>
      </div>`;
  });

  // Bottom bar
  const statusText = c.status === 'prep'
    ? '⏳ Campagne en préparation — les modifications seront déployées au lancement'
    : '✅ Campagne active — les modifications seront appliquées à la prochaine itération';

  const bottomHtml = `
    <div class="editor-bottom-bar">
      <div class="editor-bottom-info">${statusText}</div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;" onclick="cancelEditorChanges()">↩️ Annuler les modifications</button>
        <button class="btn btn-primary" style="font-size:12px;padding:8px 14px;" onclick="saveEditorChanges()">💾 Sauvegarder les séquences</button>
      </div>
    </div>`;

  main.innerHTML = `
    <div class="editor-header">
      <div>
        <div class="editor-header-title">${c.name}</div>
        <div class="editor-header-params">${paramsHtml}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;" onclick="showCampaignParams()">⚙️ Paramètres</button>
        <button class="btn btn-primary" style="font-size:12px;padding:8px 14px;" onclick="regenerateAll()">✨ Tout régénérer</button>
      </div>
    </div>
    ${aiBarHtml}
    ${tpHtml}
    ${bottomHtml}
  `;

  // Add focus/blur handlers for editing state
  main.querySelectorAll('.tp-editable').forEach(el => {
    el.addEventListener('focus', () => {
      el.closest('.touchpoint-card').classList.add('editing');
    });
    el.addEventListener('blur', () => {
      el.closest('.touchpoint-card').classList.remove('editing');
    });
  });
}

/* ═══ Select Campaign ═══ */
function selectEditorCampaign(key) {
  activeEditorCampaign = key;
  renderEditorSidebar();
  renderEditorMain();
}

/* ═══ Init ═══ */
function initCopyEditor() {
  renderEditorSidebar();
  renderEditorMain();
}

/* ═══ Touchpoint Actions ═══ */
function regenerateTouchpoint(tpId) {
  const card = document.querySelector(`[data-tp="${tpId}"]`);
  if (!card) return;

  const body = card.querySelector('.tp-editable[data-field="body"]');
  const originalHtml = body.innerHTML;

  // Show loading state
  body.style.opacity = '0.4';
  card.classList.add('editing');

  const dots = document.createElement('div');
  dots.className = 'tp-regen-status';
  dots.style.cssText = 'font-size:12px;color:var(--accent-light);padding:8px 0;';
  dots.textContent = '🤖 Régénération en cours...';
  body.parentElement.insertBefore(dots, body);

  // Simulate regeneration delay
  setTimeout(() => {
    body.style.opacity = '1';
    dots.textContent = '✅ Régénéré — vérifiez le résultat avant de sauvegarder';
    dots.style.color = 'var(--success)';
    setTimeout(() => dots.remove(), 3000);
  }, 1500);
}

function duplicateTouchpoint(tpId) {
  const c = editorCampaigns[activeEditorCampaign];
  const tpIndex = c.touchpoints.findIndex(t => t.id === tpId);
  if (tpIndex === -1) return;

  const original = c.touchpoints[tpIndex];
  const copy = JSON.parse(JSON.stringify(original));
  copy.id = tpId + '-copy';
  copy.label = original.label + ' (copie)';
  copy.suggestion = null;

  // Insert after original
  c.touchpoints.splice(tpIndex + 1, 0, copy);
  renderEditorMain();
  if (typeof BakalStore !== 'undefined') BakalStore.save();

  // Flash the new card
  const newCard = document.querySelector(`[data-tp="${copy.id}"]`);
  if (newCard) {
    newCard.style.transition = 'box-shadow 0.3s';
    newCard.style.boxShadow = '0 0 0 2px var(--accent)';
    newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => { newCard.style.boxShadow = ''; }, 1500);
  }
}

function deleteTouchpoint(tpId) {
  const c = editorCampaigns[activeEditorCampaign];
  const card = document.querySelector(`[data-tp="${tpId}"]`);
  if (!card) return;

  // Animate out
  card.style.transition = 'opacity 0.3s, transform 0.3s, max-height 0.3s';
  card.style.opacity = '0';
  card.style.transform = 'translateX(-20px)';

  setTimeout(() => {
    card.style.maxHeight = '0';
    card.style.overflow = 'hidden';
    card.style.marginBottom = '0';
    card.style.padding = '0';
  }, 200);

  setTimeout(() => {
    c.touchpoints = c.touchpoints.filter(t => t.id !== tpId);
    renderEditorMain();
    if (typeof BakalStore !== 'undefined') BakalStore.save();
  }, 500);
}

/* ═══ AI Suggestions ═══ */
function applySuggestion(tpId) {
  const card = document.querySelector(`[data-tp="${tpId}"]`);
  const suggestion = card?.querySelector('.tp-ai-suggestion');
  if (!suggestion) return;

  // Flash the body field to indicate the change
  const body = card.querySelector('.tp-editable[data-field="body"]');
  if (body) {
    body.style.transition = 'box-shadow 0.3s';
    body.style.boxShadow = '0 0 0 2px var(--success)';
    setTimeout(() => { body.style.boxShadow = ''; }, 1000);
  }

  // Replace suggestion with applied note
  suggestion.innerHTML = `
    <div style="font-size:11px;color:var(--success);font-weight:600;">✅ Suggestion appliquée — vérifiez le résultat</div>
  `;
  setTimeout(() => {
    suggestion.style.transition = 'opacity 0.3s';
    suggestion.style.opacity = '0';
    setTimeout(() => suggestion.remove(), 300);
  }, 2000);
}

function dismissSuggestion(tpId) {
  const card = document.querySelector(`[data-tp="${tpId}"]`);
  const suggestion = card?.querySelector('.tp-ai-suggestion');
  if (!suggestion) return;

  suggestion.style.transition = 'opacity 0.3s, max-height 0.3s';
  suggestion.style.opacity = '0';
  setTimeout(() => {
    suggestion.style.maxHeight = '0';
    suggestion.style.overflow = 'hidden';
    suggestion.style.padding = '0';
    suggestion.style.margin = '0';
    setTimeout(() => suggestion.remove(), 300);
  }, 200);
}

function applyAllSuggestions() {
  const cards = document.querySelectorAll('.touchpoint-card');
  cards.forEach(card => {
    const tpId = card.dataset.tp;
    if (card.querySelector('.tp-ai-suggestion')) {
      applySuggestion(tpId);
    }
  });

  // Update AI bar
  const aiBar = document.querySelector('.ai-bar');
  if (aiBar) {
    aiBar.querySelector('.ai-bar-title').textContent = 'Toutes les suggestions appliquées';
    aiBar.querySelector('.ai-bar-text').textContent = 'Vérifiez les modifications et sauvegardez quand vous êtes satisfait.';
    aiBar.style.borderColor = 'var(--success)';
    aiBar.querySelectorAll('button').forEach(b => b.remove());
  }
}

function dismissAllSuggestions() {
  const cards = document.querySelectorAll('.touchpoint-card');
  cards.forEach(card => {
    const tpId = card.dataset.tp;
    if (card.querySelector('.tp-ai-suggestion')) {
      dismissSuggestion(tpId);
    }
  });

  // Remove AI bar
  const aiBar = document.querySelector('.ai-bar');
  if (aiBar) {
    aiBar.style.transition = 'opacity 0.3s';
    aiBar.style.opacity = '0';
    setTimeout(() => aiBar.remove(), 300);
  }
}

/* ═══ Save / Cancel ═══ */
function saveEditorChanges() {
  const bottomBar = document.querySelector('.editor-bottom-bar');
  const info = bottomBar.querySelector('.editor-bottom-info');
  const now = new Date();
  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Capture current edits from the DOM back into the data model
  const c = editorCampaigns[activeEditorCampaign];
  if (c) {
    c.touchpoints.forEach(tp => {
      const card = document.querySelector(`[data-tp="${tp.id}"]`);
      if (!card) return;
      const subjectEl = card.querySelector('.tp-editable[data-field="subject"]');
      const bodyEl = card.querySelector('.tp-editable[data-field="body"]');
      if (subjectEl) tp.subject = subjectEl.innerHTML;
      if (bodyEl) tp.body = bodyEl.innerHTML.replace(/<br\s*\/?>/g, '\n');
    });
  }

  // Persist to localStorage
  if (typeof BakalStore !== 'undefined') BakalStore.save();

  info.innerHTML = `<span style="color:var(--success);font-weight:600;">✅ Séquences sauvegardées</span> · ${time}`;

  // Flash all cards green briefly
  document.querySelectorAll('.touchpoint-card').forEach(card => {
    card.style.transition = 'border-color 0.3s';
    card.style.borderColor = 'var(--success)';
    setTimeout(() => { card.style.borderColor = ''; }, 1000);
  });

  // Reset info after delay
  setTimeout(() => {
    info.textContent = `Dernière sauvegarde : aujourd'hui à ${time}`;
  }, 3000);
}

function cancelEditorChanges() {
  // Re-render from data (resets all edits)
  renderEditorMain();
}

/* ═══ Header Actions ═══ */
function showCampaignParams() {
  const c = editorCampaigns[activeEditorCampaign];
  const header = document.querySelector('.editor-header');

  // Check if params panel already open
  let existing = document.getElementById('params-panel');
  if (existing) { existing.remove(); return; }

  const panel = document.createElement('div');
  panel.id = 'params-panel';
  panel.style.cssText = 'background:var(--bg-elevated);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px;';
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <div style="font-size:14px;font-weight:600;">Paramètres de la campagne</div>
      <button class="tp-action" style="font-size:11px;" onclick="this.closest('#params-panel').remove()">Fermer</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
      ${c.params.map(p => `
        <div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">${p.l}</div>
          <div style="font-size:13px;font-weight:500;">${p.v}</div>
        </div>
      `).join('')}
    </div>
  `;
  header.after(panel);
}

function regenerateAll() {
  // Show loading on all cards
  document.querySelectorAll('.touchpoint-card').forEach(card => {
    card.style.opacity = '0.5';
  });

  const aiBar = document.querySelector('.ai-bar');
  if (aiBar) {
    aiBar.querySelector('.ai-bar-title').textContent = '🔄 Régénération en cours...';
    aiBar.querySelector('.ai-bar-text').textContent = 'Claude régénère tous les touchpoints de cette campagne.';
    aiBar.querySelectorAll('button').forEach(b => b.style.display = 'none');
  }

  // Simulate completion
  setTimeout(() => {
    document.querySelectorAll('.touchpoint-card').forEach(card => {
      card.style.opacity = '1';
    });
    if (aiBar) {
      aiBar.querySelector('.ai-bar-title').textContent = '✅ Régénération terminée';
      aiBar.querySelector('.ai-bar-text').textContent = 'Vérifiez les nouvelles versions et sauvegardez.';
      aiBar.style.borderColor = 'var(--success)';
    }
  }, 2000);
}
