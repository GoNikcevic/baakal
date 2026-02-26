/* ═══════════════════════════════════════════════════
   BAKAL — Variable Generator (Refinement page)
   AI-driven variable suggestions: base → derived chains
   ═══════════════════════════════════════════════════ */

/* ═══ Industry-specific suggestion sets ═══
   Each set contains:
   - context: campaign/industry metadata
   - explanation: WHY these variables matter for this industry
   - chain: ordered list of base + derived variables
   - Each variable can be 'base' or 'derived'
   - Derived variables have a formula (input vars + prompt) and AI preview examples
*/

const vargenScenarios = {

  /* ── Scenario 1: Beer / Brewery industry ── */
  'brasserie': {
    context: {
      campaign: 'Brasseries artisanales France',
      industry: 'Brasserie / Microbrasserie',
      target: 'Brasseurs, Directeurs qualité',
      angle: 'Expertise microbiologique'
    },
    explanation: {
      title: 'Pourquoi ces variables pour les brasseries ?',
      text: `Dans l'industrie brassicole, <strong>le produit est le point d'entrée émotionnel</strong> — chaque brasseur est passionné par sa bière phare. En identifiant le nom de leur bière et le type de fermentation, on peut prédire les problèmes microbiologiques probables (contamination Brettanomyces pour les IPA, Lactobacillus pour les sours…). <strong>Cette intelligence crée un icebreaker ultra-ciblé</strong> qui prouve qu'on connaît leur métier, pas juste leur entreprise.`
    },
    chain: [
      {
        key: 'beerName',
        label: 'Nom de la bière phare',
        type: 'base',
        desc: 'Le produit signature ou best-seller de la brasserie. Trouvable sur leur site, Untappd, ou réseaux sociaux.',
        source: { icon: '🔍', label: 'Scraping site web / Untappd' },
        examples: [
          { prospect: 'Brasserie de la Goutte d\'Or', value: 'Château Rouge (Amber Ale)' },
          { prospect: 'Brasserie du Mont Blanc', value: 'La Blanche (Witbier)' },
          { prospect: 'Deck & Donohue', value: 'Saison Station (Saison)' },
        ]
      },
      {
        key: 'microbioProblem',
        label: 'Risque microbiologique probable',
        type: 'enrichment',
        desc: 'Problème microbiologique le plus courant selon le type de bière produite. Généré par IA à partir du style de bière.',
        source: { icon: '🤖', label: 'IA — basé sur le type de fermentation' },
        dependsOn: ['beerName'],
        derivationHint: 'Le type de bière (IPA, Stout, Sour, Lager…) détermine la levure et les risques de contamination.',
        examples: [
          { prospect: 'Château Rouge (Amber)', value: 'Oxydation prématurée — les malts caramélisés sont plus sensibles aux réactions de Maillard post-embouteillage' },
          { prospect: 'La Blanche (Witbier)', value: 'Contamination Lactobacillus — les bières de blé à pH élevé sont un terrain propice' },
          { prospect: 'Saison Station (Saison)', value: 'Refermentation non contrôlée — les levures Saison sont notoirement imprévisibles en bouteille' },
        ]
      },
      {
        key: 'brewerIcebreaker',
        label: 'Icebreaker brasseur',
        type: 'derived',
        desc: 'Accroche personnalisée qui combine la bière phare et le risque microbio pour montrer une expertise crédible du métier.',
        source: { icon: '🧠', label: 'IA — combinaison de beerName + microbioProblem' },
        dependsOn: ['beerName', 'microbioProblem'],
        formula: {
          inputs: ['beerName', 'microbioProblem'],
          prompt: 'Combine le nom de la bière phare et le risque microbiologique en une phrase d\'accroche qui montre une expertise du métier brassicole. Ton conversationnel, pas de jargon excessif. Max 2 phrases.',
        },
        examples: [
          { prospect: 'Brasserie de la Goutte d\'Or', value: '<em>Château Rouge</em> est une de mes ambers préférées — vous avez mis en place un protocole anti-oxydation spécifique pour protéger ces malts caramélisés post-embouteillage ?' },
          { prospect: 'Brasserie du Mont Blanc', value: 'J\'ai goûté <em>La Blanche</em> récemment, très réussie. Cela dit, les witbiers à pH élevé sont un vrai défi côté Lactobacillus — c\'est un sujet que vous maîtrisez déjà ?' },
          { prospect: 'Deck & Donohue', value: 'Les Saisons, c\'est une de mes passions — mais je sais que <em>Saison Station</em> doit vous donner du fil à retordre en refermentation bouteille. Vous avez trouvé une parade ?' },
        ]
      }
    ]
  },

  /* ── Scenario 2: DAF / Finance (matches existing campaign) ── */
  'daf-finance': {
    context: {
      campaign: 'DAF Île-de-France',
      industry: 'Cabinets comptables / Finance',
      target: 'DAF, Directeurs financiers',
      angle: 'Douleur client — automatisation'
    },
    explanation: {
      title: 'Pourquoi ces variables pour les DAF ?',
      text: `Les DAF sont submergés de tâches répétitives mais n'ont pas le temps de quantifier le coût réel. En identifiant <strong>l'outil comptable utilisé</strong> (Sage, Cegid, QuickBooks…) et en calculant le <strong>temps perdu estimé</strong> sur des tâches automatisables, on crée un icebreaker chiffré qui parle leur langage — les chiffres.`
    },
    chain: [
      {
        key: 'accountingSoftware',
        label: 'Logiciel comptable utilisé',
        type: 'base',
        desc: 'L\'outil principal de gestion comptable. Identifiable via les offres d\'emploi, profils LinkedIn de l\'équipe, ou le site web.',
        source: { icon: '🔍', label: 'Scraping offres d\'emploi / LinkedIn' },
        examples: [
          { prospect: 'Cabinet Fidrec', value: 'Sage 100 Comptabilité' },
          { prospect: 'Nexia Conseil', value: 'Cegid Loop' },
          { prospect: 'BDO France', value: 'SAP Business One' },
        ]
      },
      {
        key: 'estimatedTimeLost',
        label: 'Heures perdues estimées / semaine',
        type: 'enrichment',
        desc: 'Estimation du temps consacré aux tâches automatisables, calculé selon l\'outil utilisé et la taille du cabinet.',
        source: { icon: '🤖', label: 'IA — basé sur accountingSoftware + companySize' },
        dependsOn: ['accountingSoftware', 'companySize'],
        derivationHint: 'Chaque logiciel a des fonctionnalités d\'automatisation connues. On estime le gap entre usage courant et potentiel.',
        examples: [
          { prospect: 'Cabinet Fidrec (Sage 100)', value: '~14h/semaine — Sage 100 n\'a pas d\'OCR natif, saisie manuelle des factures' },
          { prospect: 'Nexia Conseil (Cegid Loop)', value: '~8h/semaine — Loop a de l\'automatisation partielle, gap principalement sur le rapprochement bancaire' },
          { prospect: 'BDO France (SAP B1)', value: '~6h/semaine — SAP bien automatisé, mais les PME n\'utilisent que 40% des fonctions' },
        ]
      },
      {
        key: 'dafIcebreaker',
        label: 'Icebreaker DAF chiffré',
        type: 'derived',
        desc: 'Accroche qui combine l\'outil comptable et les heures perdues en une question qui parle le langage du DAF.',
        source: { icon: '🧠', label: 'IA — combinaison accountingSoftware + estimatedTimeLost' },
        dependsOn: ['accountingSoftware', 'estimatedTimeLost'],
        formula: {
          inputs: ['accountingSoftware', 'estimatedTimeLost'],
          prompt: 'Crée une accroche pour un DAF qui mentionne leur outil comptable et le temps perdu estimé. La question doit être chiffrée et provoquer une prise de conscience. Ton professionnel décontracté, 1-2 phrases max.',
        },
        examples: [
          { prospect: 'Cabinet Fidrec', value: '<em>14h par semaine</em> en saisie manuelle sur Sage 100 — c\'est ce qu\'on observe en moyenne chez les cabinets de votre taille. Si vous pouviez récupérer ne serait-ce que la moitié, qu\'est-ce que ça changerait ?' },
          { prospect: 'Nexia Conseil', value: 'Cegid Loop fait bien le job, mais on voit souvent <em>8h/semaine</em> perdues sur le rapprochement bancaire. C\'est un sujet que vous avez déjà creusé chez Nexia ?' },
          { prospect: 'BDO France', value: 'SAP B1 est puissant, mais la plupart des PME n\'utilisent que 40% de ses capacités — ça représente environ <em>6h récupérables par semaine</em>. Ça vous parle ?' },
        ]
      }
    ]
  },

  /* ── Scenario 3: Formation / Training industry ── */
  'formation': {
    context: {
      campaign: 'Dirigeants Formation',
      industry: 'Organismes de formation',
      target: 'Dirigeants, Responsables développement',
      angle: 'Preuve sociale → douleur acquisition'
    },
    explanation: {
      title: 'Pourquoi ces variables pour les organismes de formation ?',
      text: `Les organismes de formation vivent et meurent par leur <strong>taux de remplissage</strong>. En identifiant leur certification Qualiopi et leur catalogue de formations, on peut calculer le coût d'acquisition par stagiaire et créer un icebreaker qui touche directement le nerf de la rentabilité.`
    },
    chain: [
      {
        key: 'qualiopiStatus',
        label: 'Statut Qualiopi',
        type: 'base',
        desc: 'Si l\'organisme est certifié Qualiopi (obligatoire pour fonds publics). Vérifiable sur la base publique DataDock / Qualiopi.',
        source: { icon: '🔍', label: 'Base publique Qualiopi / site web' },
        examples: [
          { prospect: 'FormaPro Consulting', value: 'Certifié Qualiopi — Actions de formation' },
          { prospect: 'CréActifs', value: 'Certifié Qualiopi — Formation + VAE' },
          { prospect: 'OpenClassrooms B2B', value: 'Certifié Qualiopi — Actions de formation à distance' },
        ]
      },
      {
        key: 'catalogSize',
        label: 'Taille du catalogue',
        type: 'base',
        desc: 'Nombre approximatif de formations proposées. Identifiable sur leur site ou les plateformes CPF.',
        source: { icon: '🔍', label: 'Scraping site web / MonCompteFormation' },
        examples: [
          { prospect: 'FormaPro Consulting', value: '12 formations (management, RH)' },
          { prospect: 'CréActifs', value: '8 formations (entrepreneuriat)' },
          { prospect: 'OpenClassrooms B2B', value: '150+ parcours (tech, data, digital)' },
        ]
      },
      {
        key: 'formationIcebreaker',
        label: 'Icebreaker formation',
        type: 'derived',
        desc: 'Accroche qui combine statut Qualiopi et taille catalogue pour parler de la problématique de remplissage.',
        source: { icon: '🧠', label: 'IA — combinaison qualiopiStatus + catalogSize' },
        dependsOn: ['qualiopiStatus', 'catalogSize'],
        formula: {
          inputs: ['qualiopiStatus', 'catalogSize'],
          prompt: 'Crée une accroche pour un dirigeant d\'organisme de formation en utilisant leur statut Qualiopi et la taille de leur catalogue. L\'angle est la difficulté à remplir les sessions. Ton conversationnel, 1-2 phrases.',
        },
        examples: [
          { prospect: 'FormaPro Consulting', value: 'Avec <em>12 formations</em> au catalogue et Qualiopi en poche, le plus dur c\'est pas la qualité — c\'est de remplir les sessions. Comment vous gérez votre acquisition de stagiaires aujourd\'hui ?' },
          { prospect: 'CréActifs', value: '8 formations en entrepreneuriat, c\'est un positionnement pointu. Mais les organismes spécialisés comme le vôtre ont souvent du mal à <em>toucher les bons candidats</em> au bon moment — c\'est votre cas aussi ?' },
          { prospect: 'OpenClassrooms B2B', value: 'Avec <em>150+ parcours</em>, vous avez le catalogue. Mais pour les entreprises B2B, le défi c\'est souvent de convaincre les DRH de passer à la formation en ligne — comment vous approchez ce frein ?' },
        ]
      }
    ]
  }
};

/* ═══ State ═══ */
let activeVargenScenario = 'brasserie'; // Start with the beer example to showcase

/* ═══ Render context bar ═══ */
function renderVargenContext() {
  const scenario = vargenScenarios[activeVargenScenario];
  const ctx = scenario.context;
  const container = document.getElementById('vargen-context');

  container.innerHTML = `
    <span class="vargen-context-label">Analyse basée sur :</span>
    <span class="vargen-context-tag highlight">${ctx.industry}</span>
    <span class="vargen-context-tag">${ctx.target}</span>
    <span class="vargen-context-tag">${ctx.campaign}</span>
    <span class="vargen-context-tag">${ctx.angle}</span>
    <select id="vargen-scenario-select" style="
      margin-left:auto;padding:6px 12px;border-radius:6px;
      background:var(--bg-elevated);border:1px solid var(--border);
      color:var(--text-secondary);font-size:12px;font-family:var(--font);
      cursor:pointer;
    " onchange="switchVargenScenario(this.value)">
      ${Object.entries(vargenScenarios).map(([key, s]) =>
        `<option value="${key}" ${key === activeVargenScenario ? 'selected' : ''}>${s.context.industry}</option>`
      ).join('')}
    </select>
  `;
}

/* ═══ Render main body ═══ */
function renderVargenBody() {
  const scenario = vargenScenarios[activeVargenScenario];
  const body = document.getElementById('vargen-body');

  // Explanation block
  let html = `
    <div class="vargen-explanation">
      <div class="vargen-explanation-title">💡 ${scenario.explanation.title}</div>
      <div class="vargen-explanation-text">${scenario.explanation.text}</div>
    </div>
  `;

  // Variable chain
  html += `<div class="vargen-chain">
    <div class="vargen-chain-label">Chaîne de variables suggérée</div>`;

  scenario.chain.forEach((v, idx) => {
    const isDerived = v.type === 'derived';
    const isEnrichment = v.type === 'enrichment';

    // Connector arrow between variables
    if (idx > 0) {
      html += `<div class="vargen-connector"><div class="vargen-connector-arrow"></div></div>`;
    }

    html += `
      <div class="vargen-var ${isDerived ? 'derived' : ''}" data-vargen-key="${v.key}">
        <div class="vargen-var-header">
          <div class="vargen-var-name">
            <span class="vargen-var-tag">{{${v.key}}}</span>
            <span class="vargen-var-type ${v.type}">${
              isDerived ? '⚡ Dérivée' : isEnrichment ? '🧠 Enrichie' : '📥 Base'
            }</span>
          </div>
          <div class="vargen-var-actions">
            <button class="btn btn-ghost" style="font-size:11px;padding:5px 10px;" onclick="acceptVarSuggestion('${v.key}')">✅ Accepter</button>
            <button class="btn btn-ghost" style="font-size:11px;padding:5px 10px;" onclick="editVarSuggestion('${v.key}')">✏️ Modifier</button>
            <button class="btn btn-ghost" style="font-size:11px;padding:5px 10px;" onclick="dismissVarSuggestion('${v.key}')">✕</button>
          </div>
        </div>
        <div class="vargen-var-desc"><strong>${v.label}</strong> — ${v.desc}</div>
        <div class="vargen-var-source">
          <span class="vargen-var-source-icon">${v.source.icon}</span>
          <span>Source : ${v.source.label}</span>
          ${v.dependsOn ? `<span style="margin-left:8px;color:var(--accent-light);">← dépend de ${v.dependsOn.map(d => '{{' + d + '}}').join(' + ')}</span>` : ''}
        </div>`;

    // Formula editor for derived / enrichment variables
    if ((isDerived || isEnrichment) && v.formula) {
      html += `
        <div class="vargen-formula">
          <div class="vargen-formula-label">
            ⚙️ Formule de dérivation
          </div>
          <div class="vargen-formula-inputs">
            ${v.formula.inputs.map((inp, i) => `
              <span class="vargen-formula-input-tag">{{${inp}}}</span>
              ${i < v.formula.inputs.length - 1 ? '<span class="vargen-formula-operator">+</span>' : ''}
            `).join('')}
            <span class="vargen-formula-operator">→</span>
            <span class="vargen-var-tag">{{${v.key}}}</span>
          </div>
          <textarea class="vargen-formula-prompt" id="formula-${v.key}">${v.formula.prompt}</textarea>
        </div>`;
    } else if (isEnrichment && v.derivationHint) {
      html += `
        <div class="vargen-formula">
          <div class="vargen-formula-label">⚙️ Logique d'enrichissement</div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.5;">${v.derivationHint}</div>
        </div>`;
    }

    // AI Preview with examples
    if (v.examples && v.examples.length > 0) {
      html += `
        <div class="vargen-preview">
          <div class="vargen-preview-header">
            <span class="vargen-preview-title">
              👁️ Prévisualisation IA — ${v.examples.length} exemples
            </span>
            <button class="btn btn-ghost" style="font-size:10px;padding:4px 8px;" onclick="refreshVarPreview('${v.key}')">🔄 Rafraîchir</button>
          </div>
          <div class="vargen-preview-body">
            ${v.examples.map(ex => `
              <div class="vargen-preview-example">
                <span class="vargen-preview-prospect">${ex.prospect}</span>
                <span class="vargen-preview-value">${ex.value}</span>
              </div>
            `).join('')}
          </div>
        </div>`;
    }

    html += '</div>'; // close .vargen-var
  });

  html += '</div>'; // close .vargen-chain

  // Bottom actions
  html += `
    <div class="vargen-actions">
      <div class="vargen-actions-info">
        💡 Les variables acceptées seront ajoutées à votre bibliothèque et synchronisées avec Lemlist.
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;" onclick="suggestNewChain()">🧠 Suggérer une autre chaîne</button>
        <button class="btn btn-primary" style="font-size:12px;padding:8px 14px;" onclick="acceptAllVarSuggestions()">✅ Accepter ${scenario.chain.length} variables</button>
      </div>
    </div>
  `;

  body.innerHTML = html;
}

/* ═══ Switch scenario ═══ */
function switchVargenScenario(key) {
  activeVargenScenario = key;
  renderVargenContext();
  renderVargenBody();
}

/* ═══ Actions ═══ */
function acceptVarSuggestion(key) {
  const card = document.querySelector(`[data-vargen-key="${key}"]`);
  if (!card) return;

  // Animate acceptance
  card.style.transition = 'border-color 0.3s, box-shadow 0.3s';
  card.style.borderColor = 'var(--success)';
  card.style.boxShadow = '0 0 20px rgba(0,214,143,0.1)';

  // Add badge
  const header = card.querySelector('.vargen-var-header');
  const actions = card.querySelector('.vargen-var-actions');
  if (actions) {
    actions.innerHTML = `<span style="font-size:11px;font-weight:600;color:var(--success);display:flex;align-items:center;gap:4px;">✅ Ajoutée à la bibliothèque</span>`;
  }

  // Add to variable registry if available
  if (typeof variableRegistry !== 'undefined') {
    const scenario = vargenScenarios[activeVargenScenario];
    const varData = scenario.chain.find(v => v.key === key);
    if (varData) {
      const alreadyExists = Object.values(variableRegistry).flat().some(v => v.key === key);
      if (!alreadyExists) {
        const syncType = varData.type === 'derived' ? 'custom' : varData.type === 'enrichment' ? 'custom' : 'synced';
        variableRegistry.custom.push({
          key: varData.key,
          label: varData.label,
          sync: syncType,
          source: varData.type === 'derived' ? 'ai-derived' : varData.source.label,
          isCustom: true,
          derivedFrom: varData.dependsOn || null
        });
        // Refresh the sidebar panel if open
        if (typeof renderVarPanel === 'function' && varPanelOpen) {
          renderVarPanel();
        }
      }
    }
  }
}

function editVarSuggestion(key) {
  const card = document.querySelector(`[data-vargen-key="${key}"]`);
  if (!card) return;

  // Highlight the formula editor for editing
  const formula = card.querySelector('.vargen-formula-prompt');
  if (formula) {
    formula.focus();
    formula.style.borderColor = 'var(--text-muted)';
    formula.style.boxShadow = '0 0 0 2px var(--accent-glow)';
    formula.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // If no formula (base var), open edit for description
  const desc = card.querySelector('.vargen-var-desc');
  if (desc && !formula) {
    desc.contentEditable = true;
    desc.focus();
    desc.style.background = 'var(--bg-card)';
    desc.style.padding = '8px';
    desc.style.borderRadius = '6px';
    desc.style.border = '1px solid var(--accent)';
    desc.style.outline = 'none';
  }
}

function dismissVarSuggestion(key) {
  const card = document.querySelector(`[data-vargen-key="${key}"]`);
  if (!card) return;

  card.style.transition = 'opacity 0.3s, transform 0.3s, max-height 0.4s, margin 0.4s, padding 0.4s';
  card.style.opacity = '0';
  card.style.transform = 'translateX(-20px)';

  // Also remove the connector before it
  const prev = card.previousElementSibling;
  if (prev && prev.classList.contains('vargen-connector')) {
    prev.style.transition = 'opacity 0.3s, max-height 0.3s';
    prev.style.opacity = '0';
    setTimeout(() => prev.remove(), 300);
  }

  setTimeout(() => {
    card.style.maxHeight = '0';
    card.style.overflow = 'hidden';
    card.style.margin = '0';
    card.style.padding = '0';
    card.style.border = 'none';
    setTimeout(() => card.remove(), 400);
  }, 250);
}

function acceptAllVarSuggestions() {
  const scenario = vargenScenarios[activeVargenScenario];
  scenario.chain.forEach(v => acceptVarSuggestion(v.key));

  // Update header
  const header = document.querySelector('.vargen-header');
  if (header) {
    const btns = header.querySelectorAll('button');
    btns.forEach(b => b.style.display = 'none');
    const successMsg = document.createElement('div');
    successMsg.style.cssText = 'font-size:13px;font-weight:600;color:var(--success);display:flex;align-items:center;gap:6px;';
    successMsg.innerHTML = `✅ ${scenario.chain.length} variables ajoutées à votre bibliothèque`;
    header.querySelector('.vargen-header-left').parentElement.appendChild(successMsg);
  }
}

function regenerateVarSuggestions() {
  const body = document.getElementById('vargen-body');

  // Show loading state
  body.innerHTML = `
    <div style="text-align:center;padding:60px 20px;">
      <div style="font-size:36px;margin-bottom:16px;animation:pulse 1.5s infinite;">🧠</div>
      <div style="font-size:15px;font-weight:600;margin-bottom:8px;">Analyse en cours...</div>
      <div style="font-size:13px;color:var(--text-muted);max-width:400px;margin:0 auto;">
        Claude analyse l'industrie, les données de campagne et la mémoire cross-campagne pour suggérer les meilleures variables.
      </div>
    </div>
  `;

  // Simulate regeneration
  setTimeout(() => {
    renderVargenBody();
    // Flash the card
    const card = document.getElementById('vargen-card');
    if (card) {
      card.style.transition = 'box-shadow 0.3s';
      card.style.boxShadow = '0 0 20px var(--accent-glow)';
      setTimeout(() => { card.style.boxShadow = ''; }, 1500);
    }
  }, 2000);
}

function suggestNewChain() {
  // Cycle to next scenario
  const keys = Object.keys(vargenScenarios);
  const currentIdx = keys.indexOf(activeVargenScenario);
  const nextIdx = (currentIdx + 1) % keys.length;
  activeVargenScenario = keys[nextIdx];

  // Animate transition
  const body = document.getElementById('vargen-body');
  body.style.transition = 'opacity 0.3s';
  body.style.opacity = '0';

  setTimeout(() => {
    renderVargenContext();
    renderVargenBody();
    body.style.opacity = '1';
  }, 300);
}

function refreshVarPreview(key) {
  const card = document.querySelector(`[data-vargen-key="${key}"]`);
  if (!card) return;

  const previewBody = card.querySelector('.vargen-preview-body');
  if (!previewBody) return;

  // Show loading
  previewBody.innerHTML = `
    <div style="text-align:center;padding:20px;font-size:12px;color:var(--text-muted);">
      🔄 Régénération des exemples...
    </div>
  `;

  // Simulate and restore
  setTimeout(() => {
    const scenario = vargenScenarios[activeVargenScenario];
    const v = scenario.chain.find(vr => vr.key === key);
    if (v && v.examples) {
      previewBody.innerHTML = v.examples.map(ex => `
        <div class="vargen-preview-example">
          <span class="vargen-preview-prospect">${ex.prospect}</span>
          <span class="vargen-preview-value">${ex.value}</span>
        </div>
      `).join('');
    }
  }, 1200);
}

/* ═══ Init ═══ */
function initVarGenerator() {
  const card = document.getElementById('vargen-card');
  if (!card) return;
  renderVargenContext();
  renderVargenBody();
}

// Auto-init when page loads or becomes visible
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initVarGenerator, 100);
});
