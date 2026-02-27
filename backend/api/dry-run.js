/**
 * Dry-run responses for AI endpoints.
 * Returns realistic simulated data that exercises the full pipeline
 * (diagnostic save, version creation, memory patterns) without calling Claude.
 *
 * Usage: POST /api/ai/analyze?dry_run=true
 */

const MOCK_USAGE = { input_tokens: 0, output_tokens: 0 };

function analyzeCampaign(campaignData) {
  const steps = (campaignData.sequence || []).map(tp => tp.step);
  const hasEmail = steps.some(s => s.startsWith('E'));
  const hasLinkedin = steps.some(s => s.startsWith('L'));

  const emailDiag = hasEmail ? `
E1 — Performant : Taux d'ouverture de ${campaignData.open_rate || 50}% ${(campaignData.open_rate || 50) >= 50 ? 'au-dessus' : 'en-dessous'} du benchmark (50%). L'objet personnalisé fonctionne bien. Maintenir en l'état.

E2 — Fort potentiel : Le "Re:" dans l'objet booste l'ouverture. Le case study avec chiffres concrets crédibilise. Bon ratio réponse/ouverture.

E3 — À optimiser/améliorer : Baisse significative d'ouverture et de réponse. Priorité : tester un angle plus positif ("gain de temps") et raccourcir à 2 phrases max.

E4 — Normal pour un break-up : Taux d'ouverture correct pour un dernier email. Le ton respectueux évite la pression. Pas de modification nécessaire.` : '';

  const linkedinDiag = hasLinkedin ? `
L1 — Bon taux d'acceptation : ${campaignData.accept_rate_lk || 30}% d'acceptation ${(campaignData.accept_rate_lk || 30) >= 30 ? 'au-dessus' : 'en-dessous'} du benchmark LinkedIn (30%). Le compliment parcours + secteur fonctionne bien.

L2 — Réponse à améliorer/optimiser : Le message post-connexion manque de spécificité. Priorité : remplacer preuve sociale par douleur client.` : '';

  const diagnostic = `## Résumé global
La campagne "${campaignData.name}" montre des résultats ${(campaignData.reply_rate || 0) >= 5 ? 'encourageants' : 'à améliorer'}. Le taux de réponse global est de ${campaignData.reply_rate || 0}% (benchmark : 5%).

## Analyse par touchpoint
${emailDiag}${linkedinDiag}

## Priorités d'optimisation
1. Priorité haute : optimiser E3 — changer l'angle pour un positif
2. ${hasLinkedin ? 'Priorité moyenne : améliorer L2 — passer en angle douleur client' : 'Maintenir E1 et E2 — performance correcte'}

## Instructions de régénération
- E3 : Remplacer l'angle anxiogène par un angle "gain de temps". Raccourcir à 2 phrases. Garder le CTA question ouverte.${hasLinkedin ? '\n- L2 : Remplacer "3 organismes de formation" par une question directe sur le problème du prospect.' : ''}`;

  return {
    diagnostic,
    usage: MOCK_USAGE,
  };
}

function regenerateSequence(params) {
  const { originalMessages, clientParams } = params;
  const tone = clientParams?.tone || 'Pro décontracté';
  const formality = clientParams?.formality || 'Vous';

  const messages = [
    {
      step: 'E3',
      variantA: {
        subject: '{{firstName}}, une idée pour gagner du temps',
        body: `${formality === 'Tu' ? 'Salut' : 'Bonjour'} {{firstName}},\n\nQuestion rapide : combien de temps {{companyName}} passe sur le reporting chaque semaine ?\n\nNos clients en récupèrent 12h en moyenne. Curieux de savoir si c'est un sujet chez vous ?`,
        hypothesis: 'Angle positif "gain de temps" au lieu de "coût de l\'erreur" — moins anxiogène, plus actionnable',
      },
      variantB: {
        subject: '{{firstName}}, 12h/semaine récupérées',
        body: `${formality === 'Tu' ? 'Salut' : 'Bonjour'} {{firstName}},\n\nUne question : si votre équipe récupérait 12h/semaine, qu'est-ce que {{companyName}} en ferait ?\n\nC'est ce que font nos clients dans le secteur ${clientParams?.sector || 'comptabilité'}. Ça vous parle ?`,
        hypothesis: 'Chiffre concret dans l\'objet + question projection — teste si le bénéfice chiffré attire plus',
      },
    },
  ];

  const summary = 'Régénération de E3 : remplacement angle anxiogène par gain de temps. 2 variantes A/B avec hypothèses distinctes.';

  return {
    raw: JSON.stringify({ messages, summary }),
    parsed: { messages, summary },
    usage: MOCK_USAGE,
  };
}

function consolidateMemory(diagnostics, existingMemory) {
  const patterns = [
    {
      categorie: 'Corps',
      pattern: '[DRY-RUN] Angle gain de temps > angle coût erreur (+2pts réponse estimé)',
      donnees: 'Basé sur le diagnostic de la campagne DAF IDF. L\'angle positif "gain de temps" est recommandé sur E3 pour remplacer l\'angle anxiogène "coût de l\'erreur".',
      confiance: 'Faible',
      secteurs: ['Comptabilité & Finance'],
      cibles: ['DAF'],
    },
  ];

  const summary = '[DRY-RUN] 1 nouveau pattern identifié à partir de ' + diagnostics.length + ' diagnostic(s). Confiance faible — nécessite plus de données pour validation.';

  return {
    raw: JSON.stringify({ patterns, summary }),
    parsed: { patterns, summary },
    usage: MOCK_USAGE,
  };
}

module.exports = {
  analyzeCampaign,
  regenerateSequence,
  consolidateMemory,
};
