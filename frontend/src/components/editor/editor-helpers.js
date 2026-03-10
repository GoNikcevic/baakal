/* ═══════════════════════════════════════════════════
   Editor Helper Functions
   ═══════════════════════════════════════════════════ */

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Highlight {{varName}} in text by wrapping with styled spans */
export function highlightVars(text) {
  if (!text) return '';
  return text.replace(
    /\{\{(\w+)\}\}/g,
    '<span class="var">{{$1}}</span>'
  );
}

/** Strip HTML back to plain text, preserving {{variables}} */
export function stripEditorHtml(html) {
  if (!html) return '';
  // Convert <br> to newlines
  let text = html.replace(/<br\s*\/?>/gi, '\n');
  // Convert <span class="var">{{x}}</span> back to {{x}}
  text = text.replace(/<span[^>]*class="var"[^>]*>(.*?)<\/span>/gi, '$1');
  // Remove any remaining HTML tags
  text = text.replace(/<[^>]*>/g, '');
  // Decode HTML entities
  const tmp = document.createElement('textarea');
  tmp.innerHTML = text;
  return tmp.value;
}

/** Get plain text length from HTML */
export function getPlainTextLength(html) {
  if (!html) return 0;
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent.length;
}

/* ─── Channel metadata ─── */

export const CH_ICONS = { email: '✉️', linkedin: '💼', multi: '📧' };
export const CH_BGS = { email: 'var(--blue-bg)', linkedin: 'rgba(151,117,250,0.15)', multi: 'var(--warning-bg)' };
export const CH_LABELS = { email: 'Email', linkedin: 'LinkedIn', multi: 'Multi-canal' };

/* ─── Sync campaigns from AppContext to editor format ─── */

export function syncCampaignsFromContext(contextCampaigns) {
  const result = {};
  for (const [id, c] of Object.entries(contextCampaigns)) {
    const ch = c.channel || 'email';
    const seq = c.sequence || [];

    result[id] = {
      _backendId: c._backendId || id,
      name: c.name,
      icon: CH_ICONS[ch] || '✉️',
      iconBg: CH_BGS[ch] || 'var(--blue-bg)',
      channel: CH_LABELS[ch] || 'Email',
      meta: `${seq.length} touchpoints · ${c.status === 'prep' ? 'En preparation' : 'Iteration ' + (c.iteration || 1)}`,
      status: c.status || 'prep',
      params: [
        { l: 'Canal', v: CH_LABELS[ch] || 'Email' },
        { l: 'Cible', v: [c.position, c.sectorShort].filter(Boolean).join(' · ') },
        c.size ? { l: 'Taille', v: c.size } : null,
        c.angle ? { l: 'Angle', v: c.angle } : null,
        { l: 'Ton', v: c.tone || 'Pro decontracte' },
        { l: 'Tutoiement', v: c.formality || 'Vous' },
        c.length ? { l: 'Longueur', v: c.length } : null,
        c.cta ? { l: 'CTA', v: c.cta } : null,
      ].filter(Boolean),
      aiBar: null,
      touchpoints: seq.map((s) => ({
        id: s.id,
        _backendId: s._backendId,
        type: s.type,
        label: s.label || '',
        timing: s.timing || '',
        subType: s.subType || '',
        subject: s.subject || null,
        body: s.body || '',
        maxChars: s.maxChars || undefined,
        suggestion: null,
      })),
    };
  }
  return result;
}

/* ─── Fallback data ─── */

export const EDITOR_FALLBACK = {
  'daf-idf': {
    name: 'DAF Ile-de-France',
    icon: '✉️',
    iconBg: 'var(--blue-bg)',
    channel: 'Email',
    meta: '4 touchpoints · Iteration 4',
    status: 'active',
    params: [
      { l: 'Canal', v: 'Email' }, { l: 'Cible', v: 'DAF · Comptabilite' },
      { l: 'Taille', v: '11-50 sal.' }, { l: 'Angle', v: 'Douleur client' },
      { l: 'Ton', v: 'Pro decontracte' }, { l: 'Tutoiement', v: 'Vous' },
      { l: 'Longueur', v: 'Court (3 phrases)' }, { l: 'CTA', v: 'Question ouverte' },
    ],
    aiBar: {
      title: '2 suggestions disponibles',
      text: "E3 : l'angle anxiogene sous-performe (-3pts reponse). E4 : le break-up peut etre raccourci (actuellement 4 phrases, objectif 3).",
    },
    touchpoints: [
      {
        id: 'E1', type: 'email', label: 'Email initial', timing: 'J+0 · Envoye a 247 prospects',
        subType: 'Angle douleur client',
        subject: '{{firstName}}, une question sur votre gestion financiere',
        body: 'Bonjour {{firstName}},\n\nCombien d\'heures par semaine votre equipe passe-t-elle sur des taches qui pourraient etre automatisees ?\n\nChez {{companyName}}, les cabinets comme le votre gagnent en moyenne 12h/semaine en digitalisant trois processus cles.\n\nQuel est votre plus gros frein operationnel en ce moment ?',
        suggestion: null,
      },
      {
        id: 'E2', type: 'email', label: 'Email valeur', timing: 'J+3 · Case study',
        subType: 'Preuve par l\'exemple',
        subject: 'Re: gestion financiere — un cas concret',
        body: '{{firstName}}, je me permets de revenir avec un exemple concret.\n\nLe cabinet Nexia Conseil (35 personnes, secteur similaire) a reduit de 40% le temps de reporting mensuel en automatisant la collecte de donnees.\n\nResultat : 2 jours recuperes chaque mois pour du conseil a valeur ajoutee.\n\nEst-ce que c\'est un sujet chez {{companyName}} ?',
        suggestion: null,
      },
      {
        id: 'E3', type: 'email', label: 'Email relance', timing: 'J+7 · Angle different',
        subType: 'Changement d\'angle',
        subject: 'Autre approche, {{firstName}}',
        body: '{{firstName}}, je change d\'approche.\n\nPlutot que de parler d\'automatisation, une question simple : quel est le cout reel d\'une erreur de saisie dans un bilan chez {{companyName}} ?\n\nPour les cabinets de votre taille, nos clients estiment ce cout entre 2 000 et 8 000EUR par incident.\n\nSi le sujet vous parle, je peux vous montrer comment d\'autres cabinets ont elimine ce risque.',
        suggestion: {
          label: 'Suggestion IA — Changer l\'angle',
          text: 'L\'angle "cout de l\'erreur" est percu comme anxiogene sur ce segment. Les donnees montrent que l\'angle "gain de temps" performe +2.1pts mieux. <strong>Proposition :</strong> "Si vous pouviez recuperer une journee par semaine, qu\'en feriez-vous ?" -> CTA question ouverte positive.',
        },
      },
      {
        id: 'E4', type: 'email', label: 'Email break-up', timing: 'J+12 · Soft close',
        subType: 'Dernier message',
        subject: 'Derniere tentative, {{firstName}}',
        body: '{{firstName}}, je ne veux pas encombrer votre boite.\n\nSi ce n\'est pas le bon moment, pas de souci — je ne reviendrai pas.\n\nJuste un dernier mot : si un jour 12h/semaine recuperees ca vous interesse, mon agenda est ouvert.\n\nBonne continuation.',
        suggestion: {
          label: 'Suggestion IA — Raccourcir',
          text: 'Le break-up fait 4 phrases, objectif 3 max. Supprimer "Juste un dernier mot..." et integrer le benefice dans la phrase precedente.',
        },
      },
    ],
  },
  'dirigeants-formation': {
    name: 'Dirigeants Formation',
    icon: '💼',
    iconBg: 'rgba(151,117,250,0.15)',
    channel: 'LinkedIn',
    meta: '2 touchpoints · Iteration 2',
    status: 'active',
    params: [
      { l: 'Canal', v: 'LinkedIn' }, { l: 'Cible', v: 'Dirigeant · Formation' },
      { l: 'Taille', v: '1-10 sal.' }, { l: 'Angle', v: 'Preuve sociale' },
      { l: 'Ton', v: 'Pro decontracte' }, { l: 'Tutoiement', v: 'Vous' },
      { l: 'CTA', v: 'Question ouverte' },
    ],
    aiBar: {
      title: '1 suggestion critique',
      text: "L2 : le taux de reponse (6.8%) est sous l'objectif (8%). Changer l'angle de preuve sociale -> douleur client.",
    },
    touchpoints: [
      {
        id: 'L1', type: 'linkedin', label: 'Note de connexion', timing: 'J+0 · Max 300 caracteres',
        subType: 'Premiere prise de contact',
        subject: null,
        body: '{{firstName}}, votre parcours dans la formation m\'a interpelle. J\'accompagne des dirigeants du secteur sur la croissance commerciale — je serais ravi d\'echanger avec vous.',
        maxChars: 300,
        suggestion: null,
      },
      {
        id: 'L2', type: 'linkedin', label: 'Message post-connexion', timing: 'J+3 · Conversationnel',
        subType: 'Apres acceptation',
        subject: null,
        body: 'Merci d\'avoir accepte, {{firstName}} !\n\nJ\'ai accompagne 3 organismes de formation comme le votre a generer entre 5 et 12 RDV qualifies par mois.\n\nCurieux de savoir comment vous gerez votre developpement commercial actuellement ?',
        suggestion: {
          label: 'Suggestion critique — Changer l\'angle',
          text: '6.8% de reponse vs 8% cible. Le "3 organismes de formation" manque de specificite. <strong>Proposition :</strong> Passer a l\'angle douleur client : "Quel est votre plus gros frein pour trouver de nouveaux clients en ce moment ?" -> +1.5-2pts estimes.',
        },
      },
    ],
  },
  'drh-lyon': {
    name: 'DRH PME Lyon',
    icon: '📧',
    iconBg: 'var(--warning-bg)',
    channel: 'Multi-canal',
    meta: '6 touchpoints · En preparation',
    status: 'prep',
    params: [
      { l: 'Canal', v: 'Email + LinkedIn' }, { l: 'Cible', v: 'DRH · Conseil' },
      { l: 'Taille', v: '51-200 sal.' }, { l: 'Angle', v: 'Offre directe' },
      { l: 'Ton', v: 'Formel & Corporate' }, { l: 'Tutoiement', v: 'Vous' },
      { l: 'Longueur', v: 'Standard' }, { l: 'CTA', v: 'Proposition de call' },
    ],
    aiBar: {
      title: '1 alerte pre-lancement',
      text: 'Le CTA "15 minutes cette semaine" est trop agressif pour un premier contact DRH. Les questions ouvertes convertissent 2x mieux.',
    },
    touchpoints: [
      {
        id: 'E1', type: 'email', label: 'Email initial', timing: 'J+0 · Offre directe',
        subType: 'Premier contact',
        subject: '{{firstName}}, une solution concrete pour vos recrutements',
        body: 'Bonjour {{firstName}},\n\nNous aidons des DRH de PME comme {{companyName}} a reduire de 40% leur temps de recrutement grace a une methode structuree d\'approche directe.\n\nSeriez-vous disponible 15 minutes cette semaine pour en discuter ?',
        suggestion: {
          label: 'Alerte IA — CTA trop agressif',
          text: 'Le CTA "15 minutes cette semaine" est trop direct pour un premier contact DRH. Vos donnees montrent que les questions ouvertes convertissent 2x mieux. <strong>Proposition :</strong> "Quel est votre plus gros defi recrutement en ce moment ?" -> +2-3pts estimes.',
        },
      },
      {
        id: 'L1', type: 'linkedin', label: 'Note de connexion LinkedIn', timing: 'J+1 · Max 300 chars',
        subType: 'Prise de contact LK',
        subject: null,
        body: '{{firstName}}, votre expertise RH chez {{companyName}} m\'a interpelle. J\'echange regulierement avec des DRH de PME lyonnaises — je serais ravi de vous compter dans mon reseau.',
        maxChars: 300,
        suggestion: null,
      },
      {
        id: 'E2', type: 'email', label: 'Email valeur', timing: 'J+4 · Case study',
        subType: 'Preuve par l\'exemple',
        subject: 'Re: recrutements — un resultat qui parle',
        body: '{{firstName}}, un exemple concret : une PME de conseil RH (180 personnes, Lyon) a divise par 2 ses delais de recrutement en 3 mois.\n\nLeur secret ? Une methode d\'approche directe structuree qui genere 3x plus de candidatures qualifiees.\n\nSi vous faites face a des defis similaires chez {{companyName}}, je serais heureux d\'en discuter.',
        suggestion: null,
      },
      {
        id: 'L2', type: 'linkedin', label: 'Message LinkedIn', timing: 'J+5 · Post-connexion',
        subType: 'Apres acceptation LK',
        subject: null,
        body: 'Merci d\'avoir accepte, {{firstName}} !\n\nJ\'accompagne des PME lyonnaises sur l\'optimisation de leurs processus RH. Comment gerez-vous vos recrutements chez {{companyName}} actuellement ?',
        suggestion: null,
      },
      {
        id: 'E3', type: 'email', label: 'Email relance', timing: 'J+8 · Angle different',
        subType: 'Nouvelle perspective',
        subject: 'Autre approche, {{firstName}}',
        body: '{{firstName}}, une autre maniere de voir les choses : combien vous coute un recrutement rate chez {{companyName}} ?\n\nPour les PME de votre taille, nos clients estiment ce cout entre 15 000 et 45 000EUR.\n\nSi vous souhaitez en discuter, je suis disponible.',
        suggestion: null,
      },
      {
        id: 'E4', type: 'email', label: 'Email break-up', timing: 'J+13 · Soft close',
        subType: 'Dernier message',
        subject: '{{firstName}}, dernier message',
        body: '{{firstName}}, dernier message de ma part.\n\nSi le timing n\'est pas bon, aucun souci. Mon agenda reste ouvert si le sujet devient prioritaire.\n\nBonne continuation.',
        suggestion: null,
      },
    ],
  },
};
