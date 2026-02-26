const Anthropic = require('@anthropic-ai/sdk');
const { config } = require('../config');

let client;
function getClient() {
  if (!client) {
    client = new Anthropic({ apiKey: config.claude.apiKey });
  }
  return client;
}

// =============================================
// Performance Analysis
// =============================================

async function analyzeCampaign(campaignData) {
  const systemPrompt = `Tu es un expert en prospection B2B multicanal (email + LinkedIn).
Tu analyses les performances de campagnes d'outreach et fournis un diagnostic structuré.

Benchmarks de référence :
- Taux d'ouverture email : >50% = bon, 30-50% = moyen, <30% = problème
- Taux de réponse email : >5% = bon, 2-5% = moyen, <2% = problème
- Taux d'acceptation LinkedIn : >30% = bon, 15-30% = moyen, <15% = problème
- Taux de réponse LinkedIn : >10% = bon, 5-10% = moyen, <5% = problème

Format de sortie :
1. Résumé global (2-3 phrases)
2. Analyse par touchpoint (E1, E2, E3, E4, L1, L2)
3. Priorités d'optimisation (classées par impact)
4. Instructions de régénération pour chaque message à optimiser`;

  const response = await getClient().messages.create({
    model: config.claude.model,
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Analyse cette campagne :\n\n${JSON.stringify(campaignData, null, 2)}`,
      },
    ],
  });

  return {
    diagnostic: response.content[0].text,
    usage: response.usage,
  };
}

// =============================================
// Sequence Regeneration
// =============================================

async function regenerateSequence(params) {
  const { diagnostic, originalMessages, memory, clientParams } = params;

  const systemPrompt = `Tu es un copywriter expert en prospection B2B.
Tu régénères des messages d'outreach (email + LinkedIn) en tenant compte du diagnostic de performance et de la mémoire cross-campagne.

Règles impératives :
- Préserve les variables Lemlist : {{firstName}}, {{lastName}}, {{companyName}}, {{jobTitle}}
- Ne mentionne JAMAIS "IA" ou "automatisé" dans le copy
- Notes de connexion LinkedIn : max 300 caractères
- Emails de break-up : 3-4 lignes max, jamais culpabilisant
- Génère toujours une variante A et B pour chaque message modifié
- Chaque variante doit avoir une hypothèse claire

Ton : ${clientParams?.tone || 'Pro décontracté'}
Formalité : ${clientParams?.formality || 'Vous'}
Longueur : ${clientParams?.length || 'Standard'}

Format de sortie JSON :
{
  "messages": [
    {
      "step": "E1",
      "variantA": { "subject": "...", "body": "...", "hypothesis": "..." },
      "variantB": { "subject": "...", "body": "...", "hypothesis": "..." }
    }
  ],
  "summary": "Résumé des changements"
}`;

  const userContent = [
    `Diagnostic :\n${diagnostic}`,
    `\nMessages originaux :\n${JSON.stringify(originalMessages, null, 2)}`,
    memory ? `\nMémoire cross-campagne :\n${JSON.stringify(memory, null, 2)}` : '',
    clientParams ? `\nParamètres client :\n${JSON.stringify(clientParams, null, 2)}` : '',
  ].filter(Boolean).join('\n');

  const response = await getClient().messages.create({
    model: config.claude.model,
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent }],
  });

  const text = response.content[0].text;

  // Try to extract JSON from response
  let parsed;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    parsed = null;
  }

  return {
    raw: text,
    parsed,
    usage: response.usage,
  };
}

// =============================================
// Cross-Campaign Memory Consolidation
// =============================================

async function consolidateMemory(diagnostics, existingMemory) {
  const systemPrompt = `Tu es un analyste de données spécialisé en prospection B2B.
Tu consolides les diagnostics de campagnes pour extraire des patterns récurrents.

Niveaux de confiance :
- Haute : >200 prospects testés
- Moyenne : 50-200 prospects
- Faible : <50 prospects

Catégories de patterns :
- Objets (lignes d'objet email)
- Corps (contenu des messages)
- Timing (meilleurs créneaux)
- LinkedIn (spécificités LinkedIn)
- Secteur (ce qui marche par industrie)
- Cible (ce qui marche par type de décideur)

Format de sortie JSON :
{
  "patterns": [
    {
      "categorie": "Objets",
      "pattern": "Description courte du pattern",
      "donnees": "Explication détaillée avec données",
      "confiance": "Haute|Moyenne|Faible",
      "secteurs": ["Secteur1"],
      "cibles": ["Cible1"]
    }
  ],
  "summary": "Résumé des découvertes"
}`;

  const response = await getClient().messages.create({
    model: config.claude.model,
    max_tokens: 3000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Diagnostics du mois :\n${JSON.stringify(diagnostics, null, 2)}\n\nMémoire existante :\n${JSON.stringify(existingMemory, null, 2)}`,
      },
    ],
  });

  const text = response.content[0].text;

  let parsed;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    parsed = null;
  }

  return {
    raw: text,
    parsed,
    usage: response.usage,
  };
}

// =============================================
// Chat — Conversational Campaign Builder
// =============================================

async function chat(messages, context) {
  const systemPrompt = `Tu es l'assistant IA de Bakal, une plateforme de prospection B2B.
Tu aides les utilisateurs à construire et optimiser leurs campagnes d'outreach (Email + LinkedIn).

Tu es conversationnel, chaleureux et direct. Tu guides l'utilisateur étape par étape.

Tes capacités :
- Aider à définir un ICP (Ideal Customer Profile)
- Construire une campagne de A à Z (cible, canal, angle, ton, séquences)
- Analyser les performances d'une campagne existante
- Suggérer des optimisations basées sur les données
- Rédiger des séquences de prospection personnalisées

Règles :
- Réponds toujours en français
- Sois concis mais utile (pas de pavés inutiles)
- Quand l'utilisateur a défini suffisamment de paramètres pour une campagne, propose un résumé structuré
- Ne mentionne JAMAIS "IA" ou "automatisé" dans les textes de prospection
- Préserve les variables Lemlist : {{firstName}}, {{lastName}}, {{companyName}}, {{jobTitle}}

Quand une campagne est prête à être créée, retourne un bloc JSON dans ta réponse (en plus du texte), délimité par \`\`\`json et \`\`\`, avec ce format :
{
  "action": "create_campaign",
  "campaign": {
    "name": "Nom de la campagne",
    "sector": "Secteur cible",
    "position": "Poste cible",
    "size": "Taille entreprise",
    "channel": "email|linkedin|multi",
    "angle": "Angle d'approche",
    "zone": "Zone géographique",
    "tone": "Ton du message",
    "sequence": [
      { "step": "E1", "type": "email", "label": "Email initial", "timing": "J+0", "subject": "...", "body": "..." },
      { "step": "E2", "type": "email", "label": "Email relance", "timing": "J+3", "subject": "...", "body": "..." }
    ]
  }
}

${context ? `\nContexte actuel de l'utilisateur :\n${context}` : ''}`;

  const response = await getClient().messages.create({
    model: config.claude.model,
    max_tokens: 3000,
    system: systemPrompt,
    messages,
  });

  return {
    content: response.content[0].text,
    usage: response.usage,
  };
}

module.exports = {
  analyzeCampaign,
  regenerateSequence,
  consolidateMemory,
  chat,
};
