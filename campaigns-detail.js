/* ═══════════════════════════════════════════════════
   BAKAL — Campaign Detail Templates & Navigation
   ═══════════════════════════════════════════════════ */

/* ═══ Navigation ═══ */
function showCampaignDetail(id) {
  document.getElementById('campaigns-list-view').style.display = 'none';
  ['daf-idf','dirigeants-formation','drh-lyon'].forEach(c => {
    document.getElementById('detail-' + c).style.display = c === id ? 'block' : 'none';
  });
}

function backToCampaignsList() {
  document.getElementById('campaigns-list-view').style.display = 'block';
  ['daf-idf','dirigeants-formation','drh-lyon'].forEach(c => {
    document.getElementById('detail-' + c).style.display = 'none';
  });
}

/* ═══ Helpers ═══ */
function kpi(value, label, pct, color) {
  return `<div class="campaign-kpi">
    <div class="campaign-kpi-value" style="color:${color}">${value}</div>
    <div class="campaign-kpi-label">${label}</div>
    <div class="campaign-kpi-bar"><div class="campaign-kpi-fill" style="width:${pct}%;background:${color};"></div></div>
  </div>`;
}

function step(dot, cls, day, subject, type, preview, s1, s2, s3, fade) {
  const st = (v, l, c, p, bc) => `<div class="step-stat">
    <div class="step-stat-value" style="color:${c}">${v}</div>
    <div class="step-stat-label">${l}</div>
    ${p !== undefined ? `<div class="step-stat-bar"><div class="step-stat-fill" style="width:${p}%;background:${bc||c};"></div></div>` : ''}
  </div>`;
  return `<div class="sequence-step"${fade ? ' style="opacity:0.5;"' : ''}>
    <div class="step-indicator"><div class="step-dot ${cls}">${dot}</div><div class="step-label">${day}</div></div>
    <div class="step-content">${subject ? `<div class="step-subject">Objet : ${subject}</div>` : ''}<div class="step-type">${type}</div><div class="step-preview">${preview}</div></div>
    ${st(...s1)}${st(...s2)}${st(...s3)}
  </div>`;
}

function modItem(ver, title, desc, resultClass, resultText, date) {
  return `<div class="mod-item">
    <div class="mod-version">${ver}</div>
    <div class="mod-content">
      <div class="mod-title">${title}</div>
      <div class="mod-desc">${desc}</div>
      <div class="mod-result ${resultClass}">${resultText}</div>
    </div>
    <div class="mod-date">${date}</div>
  </div>`;
}

function diagBlock(color, title, text) {
  return `<div style="background:var(--bg-elevated);border-radius:8px;padding:14px;border-left:3px solid var(--${color});">
    <div style="font-size:12px;font-weight:600;color:var(--${color});margin-bottom:4px;">${title}</div>
    <div style="font-size:13px;color:var(--text-secondary);line-height:1.5;">${text}</div>
  </div>`;
}

function infoRow(label, content) {
  return `<div>
    <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">${label}</div>
    <div style="font-size:14px;">${content}</div>
  </div>`;
}

function checkItem(icon, title, desc, status, statusColor, highlight) {
  const bg = highlight ? 'background:var(--warning-bg);border:1px solid rgba(255,170,0,0.2);' : 'background:var(--bg-elevated);';
  return `<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;${bg}border-radius:8px;">
    <span style="color:var(--${statusColor});font-size:18px;">${icon}</span>
    <div style="flex:1;">
      <div style="font-size:14px;font-weight:500;${statusColor === 'text-muted' ? 'color:var(--text-muted);' : ''}">${title}</div>
      <div style="font-size:12px;color:var(--text-muted);">${desc}</div>
    </div>
    <span style="font-size:12px;color:var(--${statusColor});font-weight:600;">${status}</span>
  </div>`;
}

/* ═══════════════════════════════════════════
   CAMPAIGN 1: DAF Île-de-France
   ═══════════════════════════════════════════ */
document.getElementById('detail-daf-idf').innerHTML = `
  <button class="campaign-detail-back" onclick="backToCampaignsList()">← Retour aux campagnes</button>
  <div class="campaign-detail-header">
    <div>
      <div class="campaign-detail-title">DAF Île-de-France</div>
      <div class="campaign-detail-tags">
        <span class="campaign-tag">✉️ Email</span>
        <span class="campaign-tag">Comptabilité & Finance</span>
        <span class="campaign-tag">11-50 sal.</span>
        <span class="campaign-tag">Douleur client</span>
        <span class="campaign-tag">Île-de-France</span>
        <span class="campaign-tag" style="border-color:var(--success);color:var(--success);">Itération 4</span>
      </div>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;">⏸ Pause</button>
      <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;">📥 Exporter</button>
      <button class="btn btn-primary" style="font-size:12px;padding:8px 14px;">🧬 Lancer un test A/B</button>
    </div>
  </div>

  <!-- KPIs -->
  <div class="campaign-kpis">
    ${kpi('250', 'Prospects contactés', 83, 'var(--accent)')}
    ${kpi('68%', "Taux d'ouverture", 68, 'var(--success)')}
    ${kpi('9.2%', 'Taux de réponse', 92, 'var(--blue)')}
    ${kpi('6', 'Intéressés', 60, 'var(--warning)')}
    ${kpi('3', 'RDV obtenus', 50, 'var(--accent-light)')}
  </div>

  <!-- Sequence -->
  <div class="sequence-card">
    <div class="sequence-header">
      <div class="sequence-title">📧 Séquence email — 4 touchpoints</div>
      <div style="font-size:12px;color:var(--text-muted);">Durée : 14 jours · J+0, J+3, J+7, J+12</div>
    </div>
    <div class="sequence-steps">
      ${step('E1','email','J+0',
        '{{firstName}}, une question sur votre gestion financière',
        'Email initial — Angle douleur client',
        "Bonjour {{firstName}}, combien d'heures par semaine votre équipe passe-t-elle sur des tâches qui pourraient être automatisées ? Chez {{companyName}}, les cabinets comme le vôtre gagnent en moyenne 12h/semaine...",
        ['68%','Ouverture','var(--success)',68],
        ['4.2%','Réponse','var(--blue)',42],
        ['0.4%','Stop','var(--text-muted)',4,'var(--danger)']
      )}
      ${step('E2','email','J+3',
        'Re: gestion financière — un cas concret',
        'Email valeur — Case study',
        "{{firstName}}, je me permets de revenir avec un exemple concret. Le cabinet Nexia Conseil (35 personnes, secteur similaire) a réduit de 40% le temps de reporting...",
        ['72%','Ouverture','var(--success)',72],
        ['3.1%','Réponse','var(--blue)',31],
        ['0.8%','Stop','var(--text-muted)',8,'var(--danger)']
      )}
      ${step('E3','email','J+7',
        'Autre approche, {{firstName}}',
        'Email relance — Angle différent',
        "{{firstName}}, je change d'approche. Plutôt que de parler d'automatisation, une question simple : quel est le coût réel d'une erreur de saisie dans un bilan chez {{companyName}} ?...",
        ['55%','Ouverture','var(--warning)',55],
        ['1.4%','Réponse','var(--blue)',14],
        ['0%','Stop','var(--text-muted)',0,'var(--danger)']
      )}
      ${step('E4','email','J+12',
        'Dernière tentative, {{firstName}}',
        'Email break-up — Soft close',
        "{{firstName}}, je ne veux pas encombrer votre boîte. Si ce n'est pas le bon moment, pas de souci — je ne reviendrai pas. Juste un dernier mot : si un jour 12h/semaine récupérées...",
        ['48%','Ouverture','var(--warning)',48],
        ['0.5%','Réponse','var(--blue)',5],
        ['0%','Stop','var(--text-muted)',0,'var(--danger)']
      )}
    </div>
  </div>

  <!-- AI Diagnostic -->
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px;margin-bottom:24px;">
    <div style="font-size:15px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">🤖 Diagnostic par étape — Claude</div>
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${diagBlock('success', '✅ E1 — Performant', "L'objet personnalisé avec {{firstName}} et la question directe fonctionnent très bien. Taux d'ouverture de 68% au-dessus du benchmark (50%). Le CTA question ouverte génère un bon taux de réponse (4.2%).")}
      ${diagBlock('success', '✅ E2 — Fort potentiel', 'Le "Re:" dans l\'objet booste l\'ouverture à 72% (effet thread). Le case study concret avec des chiffres (40% de réduction) crédibilise le message. Bon ratio réponse/ouverture.')}
      ${diagBlock('warning', '⚡ E3 — À optimiser', "Baisse significative d'ouverture (55%) et de réponse (1.4%). L'angle \"coût de l'erreur\" peut être perçu comme anxiogène. <strong>Recommandation :</strong> tester un angle \"gain de temps\" plus positif, raccourcir à 2 phrases max.")}
      ${diagBlock('blue', '📊 E4 — Normal pour un break-up', "Taux d'ouverture de 48% correct pour un dernier email. Le ton respectueux (\"je ne reviendrai pas\") évite la pression. Aucune modification nécessaire.")}
    </div>
  </div>

  <!-- History + Info -->
  <div class="section-grid" style="grid-template-columns:1fr 1fr;">
    <div class="card">
      <div class="card-header"><div class="card-title">📜 Historique des modifications</div></div>
      <div class="card-body"><div class="mod-history">
        ${modItem('v4', 'Test A/B: Douleur vs Douleur+Urgence', 'Variante B avec angle urgence + objet provocant. Meilleure ouverture mais moins de conversion en RDV.', 'testing', '⏳ En cours', '17 fév.')}
        ${modItem('v3', 'Passage angle douleur client sur E1 et E3', 'Remplacement preuve sociale par douleur client + CTA question ouverte.', 'improved', '▲ +3.2pts réponse', '10 fév.')}
        ${modItem('v2', 'Optimisation objets email (A/B)', '"Question rapide sur [secteur]" vs ancien objet générique. Personnalisé gagnant.', 'improved', '▲ +8pts ouverture', '3 fév.')}
        ${modItem('v1', 'Lancement initial', '4 emails, angle preuve sociale, CTA proposition de call, ton formel. 100 prospects.', 'neutral', '— Baseline', '27 jan.')}
      </div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">ℹ️ Informations campagne</div></div>
      <div class="card-body"><div style="display:flex;flex-direction:column;gap:16px;">
        ${infoRow('Client', '<strong>FormaPro Consulting</strong>')}
        ${infoRow('Période', '27 jan. → En cours (28 jours)')}
        <div>
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Volume envoyé</div>
          <div style="font-size:14px;">250 / 300 prospects prévus</div>
          <div style="width:100%;height:6px;background:var(--bg-elevated);border-radius:3px;margin-top:6px;overflow:hidden;">
            <div style="width:83%;height:100%;background:var(--accent);border-radius:3px;"></div>
          </div>
        </div>
        ${infoRow('Copy', '<span style="font-size:13px;color:var(--text-secondary);">Pro décontracté · Vous · Court (3 phrases) · CTA question ouverte · FR</span>')}
        ${infoRow('Source Lemlist', '<span style="font-family:\'JetBrains Mono\',monospace;font-size:12px;background:var(--bg-elevated);padding:2px 8px;border-radius:4px;">campaign_daf_idf_v4</span>')}
        <div>
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Prochaine action</div>
          <div style="background:var(--accent-glow);border:1px solid rgba(108,92,231,0.2);border-radius:8px;padding:10px 14px;font-size:13px;color:var(--accent-light);">🧬 Test A/B v4 en cours — Résultat attendu le 23 fév.</div>
        </div>
      </div></div>
    </div>
  </div>
`;


/* ═══════════════════════════════════════════
   CAMPAIGN 2: Dirigeants Formation
   ═══════════════════════════════════════════ */
document.getElementById('detail-dirigeants-formation').innerHTML = `
  <button class="campaign-detail-back" onclick="backToCampaignsList()">← Retour aux campagnes</button>
  <div class="campaign-detail-header">
    <div>
      <div class="campaign-detail-title">Dirigeants Formation</div>
      <div class="campaign-detail-tags">
        <span class="campaign-tag">💼 LinkedIn</span>
        <span class="campaign-tag">Formation & Éducation</span>
        <span class="campaign-tag">1-10 sal.</span>
        <span class="campaign-tag">Preuve sociale</span>
        <span class="campaign-tag">France entière</span>
        <span class="campaign-tag" style="border-color:var(--warning);color:var(--warning);">Itération 2</span>
      </div>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;">⏸ Pause</button>
      <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;">📥 Exporter</button>
      <button class="btn btn-primary" style="font-size:12px;padding:8px 14px;">🧬 Lancer un test A/B</button>
    </div>
  </div>

  <!-- KPIs -->
  <div class="campaign-kpis">
    ${kpi('152', 'Prospects contactés', 76, 'var(--accent)')}
    ${kpi('38%', "Taux d'acceptation", 38, 'var(--success)')}
    ${kpi('6.8%', 'Taux de réponse', 68, 'var(--warning)')}
    ${kpi('3', 'Intéressés', 30, 'var(--warning)')}
    ${kpi('1', 'RDV obtenus', 17, 'var(--accent-light)')}
  </div>

  <!-- LinkedIn Sequence -->
  <div class="sequence-card">
    <div class="sequence-header">
      <div class="sequence-title">💼 Séquence LinkedIn — 2 touchpoints</div>
      <div style="font-size:12px;color:var(--text-muted);">Durée : 5 jours · J+0 (invite), J+3 (message)</div>
    </div>
    <div class="sequence-steps">
      ${step('L1','linkedin','J+0',
        '',
        'Note de connexion — Max 300 caractères',
        "{{firstName}}, votre parcours dans la formation m'a interpellé. J'accompagne des dirigeants du secteur sur la croissance commerciale — je serais ravi d'échanger avec vous.",
        ['38%','Acceptation','var(--success)',38],
        ['—','—','var(--text-muted)'],
        ['0%','Ignore','var(--text-muted)',0]
      )}
      ${step('L2','linkedin','J+3',
        '',
        'Message post-connexion — Conversationnel',
        "Merci d'avoir accepté, {{firstName}} ! J'ai accompagné 3 organismes de formation comme le vôtre à générer entre 5 et 12 RDV qualifiés par mois. Curieux de savoir comment vous gérez votre développement commercial actuellement ?",
        ['6.8%','Réponse','var(--warning)',68],
        ['3','Intéressés','var(--warning)'],
        ['1.2%','Stop','var(--text-muted)',12,'var(--danger)']
      )}
    </div>
  </div>

  <!-- AI Diagnostic -->
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px;margin-bottom:24px;">
    <div style="font-size:15px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">🤖 Diagnostic par étape — Claude</div>
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${diagBlock('success', "✅ L1 — Bon taux d'acceptation", "38% d'acceptation au-dessus du benchmark LinkedIn (30%). Le compliment sur le parcours + positionnement sectoriel fonctionne bien. Pas de pitch dans l'invite = bonne pratique.")}
      ${diagBlock('warning', "⚡ L2 — Réponse sous l'objectif", '6.8% de réponse vs objectif de 8%. Le "3 organismes de formation" manque de spécificité. <strong>Recommandation :</strong> remplacer l\'angle preuve sociale par douleur client. Tester : "Quel est votre plus gros frein à trouver de nouveaux clients en ce moment ?"')}
    </div>
  </div>

  <!-- History + Info -->
  <div class="section-grid" style="grid-template-columns:1fr 1fr;">
    <div class="card">
      <div class="card-header"><div class="card-title">📜 Historique des modifications</div></div>
      <div class="card-body"><div class="mod-history">
        ${modItem('v2', 'Personnalisation note de connexion', 'Ajout compliment parcours + mention secteur formation. Suppression du lien externe.', 'improved', '▲ +8pts acceptation', '10 fév.')}
        ${modItem('v1', 'Lancement initial', 'Note de connexion générique + message preuve sociale. 80 premiers prospects.', 'neutral', '— Baseline', '3 fév.')}
      </div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">ℹ️ Informations campagne</div></div>
      <div class="card-body"><div style="display:flex;flex-direction:column;gap:16px;">
        ${infoRow('Client', '<strong>FormaPro Consulting</strong>')}
        ${infoRow('Période', '3 fév. → En cours (20 jours)')}
        <div>
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Volume</div>
          <div style="font-size:14px;">152 / 200 prospects prévus</div>
          <div style="width:100%;height:6px;background:var(--bg-elevated);border-radius:3px;margin-top:6px;overflow:hidden;">
            <div style="width:76%;height:100%;background:var(--purple);border-radius:3px;"></div>
          </div>
        </div>
        ${infoRow('Copy', '<span style="font-size:13px;color:var(--text-secondary);">Pro décontracté · Vous · Court · CTA question ouverte · FR</span>')}
        <div>
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Prochaine action</div>
          <div style="background:var(--warning-bg);border:1px solid rgba(255,170,0,0.2);border-radius:8px;padding:10px 14px;font-size:13px;color:var(--warning);">⚡ Recommandation IA en attente — Changer l'angle L2</div>
        </div>
      </div></div>
    </div>
  </div>
`;


/* ═══════════════════════════════════════════
   CAMPAIGN 3: DRH PME Lyon (Prep Checklist)
   ═══════════════════════════════════════════ */
document.getElementById('detail-drh-lyon').innerHTML = `
  <button class="campaign-detail-back" onclick="backToCampaignsList()">← Retour aux campagnes</button>
  <div class="campaign-detail-header">
    <div>
      <div class="campaign-detail-title">DRH PME Lyon</div>
      <div class="campaign-detail-tags">
        <span class="campaign-tag">📧+💼 Multi-canal</span>
        <span class="campaign-tag">Conseil & Consulting</span>
        <span class="campaign-tag">51-200 sal.</span>
        <span class="campaign-tag">Offre directe</span>
        <span class="campaign-tag">Lyon & Rhône-Alpes</span>
        <span class="campaign-tag" style="border-color:var(--warning);color:var(--warning);">En préparation</span>
      </div>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;">✏️ Modifier</button>
      <button class="btn btn-success" style="font-size:12px;padding:8px 14px;">🚀 Lancer la campagne</button>
    </div>
  </div>

  <!-- Prep Checklist -->
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px;margin-bottom:24px;">
    <div style="font-size:15px;font-weight:600;margin-bottom:20px;display:flex;align-items:center;gap:8px;">📋 Checklist de préparation</div>
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${checkItem('✅', 'Paramètres de campagne configurés', 'Cible, canal, angle, ton — tout est défini', 'Fait', 'success', false)}
      ${checkItem('✅', 'Séquences générées par Claude', '4 emails + 2 LinkedIn · Angle offre directe · Ton formel', 'Fait', 'success', false)}
      ${checkItem('✅', 'Liste de prospects importée', '187 contacts DRH · PME 51-200 sal. · Lyon & Rhône-Alpes', 'Fait', 'success', false)}
      ${checkItem('⏳', 'Validation des séquences par le client', 'En attente de relecture — envoyé le 20 fév.', 'En attente', 'warning', true)}
      ${checkItem('⬜', 'Déploiement sur Lemlist', 'Automatique après validation client', 'À faire', 'text-muted', false)}
    </div>
  </div>

  <!-- Sequence Preview -->
  <div class="sequence-card">
    <div class="sequence-header">
      <div class="sequence-title">👁️ Aperçu des séquences — En attente de validation</div>
      <div style="font-size:12px;color:var(--text-muted);">6 touchpoints · Email (4) + LinkedIn (2)</div>
    </div>
    <div class="sequence-steps">
      ${step('E1','email','J+0',
        '{{firstName}}, une solution concrète pour vos recrutements',
        'Email initial — Offre directe',
        "Bonjour {{firstName}}, nous aidons des DRH de PME comme {{companyName}} à réduire de 40% leur temps de recrutement. Seriez-vous disponible 15 minutes cette semaine ?",
        ['—','Pas encore lancé','var(--text-muted)'],
        ['—','','var(--text-muted)'],
        ['—','','var(--text-muted)']
      )}
      ${step('L1','linkedin','J+1',
        '',
        'Note de connexion LinkedIn — Max 300 chars',
        "{{firstName}}, votre expertise RH chez {{companyName}} m'a interpellé. J'échange régulièrement avec des DRH de PME lyonnaises — je serais ravi de vous compter dans mon réseau.",
        ['—','Pas encore lancé','var(--text-muted)'],
        ['—','','var(--text-muted)'],
        ['—','','var(--text-muted)']
      )}
      ${step('E2','email','J+4',
        'Re: recrutements — un résultat qui parle',
        'Email valeur — Case study',
        "{{firstName}}, un exemple concret : une PME de conseil RH (180 personnes, Lyon) a divisé par 2 ses délais de recrutement en 3 mois...",
        ['—','Pas encore lancé','var(--text-muted)'],
        ['—','','var(--text-muted)'],
        ['—','','var(--text-muted)']
      )}
      ${step('L2','linkedin','J+5',
        '',
        'Message LinkedIn post-connexion',
        "Merci d'avoir accepté, {{firstName}} ! J'accompagne des PME lyonnaises sur l'optimisation RH...",
        ['—','','var(--text-muted)'],
        ['—','','var(--text-muted)'],
        ['—','','var(--text-muted)'],
        true
      )}
      ${step('E3','email','J+8',
        '',
        'Email relance — Angle différent',
        "{{firstName}}, une autre manière de voir les choses : combien vous coûte un recrutement raté chez {{companyName}} ?...",
        ['—','','var(--text-muted)'],
        ['—','','var(--text-muted)'],
        ['—','','var(--text-muted)'],
        true
      )}
      ${step('E4','email','J+13',
        '',
        'Email break-up — Soft close',
        "{{firstName}}, dernier message de ma part. Si le timing n'est pas bon, aucun souci...",
        ['—','','var(--text-muted)'],
        ['—','','var(--text-muted)'],
        ['—','','var(--text-muted)'],
        true
      )}
    </div>
  </div>

  <!-- AI Pre-launch Recommendation -->
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px;margin-bottom:24px;">
    <div style="font-size:15px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">🤖 Recommandation pré-lancement — Claude</div>
    <div style="background:var(--bg-elevated);border-radius:8px;padding:16px;border-left:3px solid var(--accent);line-height:1.65;">
      <div style="font-size:13px;color:var(--text-secondary);">
        <strong>Alerte :</strong> L'angle "offre directe" avec CTA "15 minutes cette semaine" est agressif pour un premier contact DRH. Vos données montrent que les <strong>questions ouvertes</strong> convertissent 2x mieux que les propositions de call directes.<br><br>
        <strong>Suggestion :</strong> Modifier E1 pour utiliser un CTA question ("Quel est votre plus gros défi recrutement en ce moment ?") et réserver la proposition de call pour E2. Gain estimé : +2-3pts de taux de réponse.
      </div>
      <div style="display:flex;gap:8px;margin-top:14px;">
        <button class="btn btn-success" style="font-size:12px;padding:8px 14px;">✅ Appliquer la suggestion</button>
        <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;">❌ Garder tel quel</button>
      </div>
    </div>
  </div>

  <!-- Campaign Info -->
  <div class="card">
    <div class="card-header"><div class="card-title">ℹ️ Informations campagne</div></div>
    <div class="card-body">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;">
        ${infoRow('Client', '<strong>FormaPro Consulting</strong>')}
        ${infoRow('Créée le', '18 février 2026')}
        ${infoRow('Volume prévu', '187 prospects · ~100/semaine')}
        ${infoRow('Copy', '<span style="font-size:13px;color:var(--text-secondary);">Formel & Corporate · Vous · CTA offre directe · FR</span>')}
        ${infoRow('Canaux', '<span style="font-size:13px;color:var(--text-secondary);">Email (4) + LinkedIn (2) · 13 jours</span>')}
        ${infoRow('Lancement estimé', '<span style="font-weight:600;color:var(--warning);">~25 février (après validation)</span>')}
      </div>
    </div>
  </div>
`;
