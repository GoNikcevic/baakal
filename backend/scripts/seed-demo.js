#!/usr/bin/env node
/**
 * Seed the SQLite database with realistic demo campaigns.
 * Mirrors the BAKAL_DEMO_DATA from app/campaigns-data.js so
 * the frontend can load from the backend instead of hardcoded data.
 *
 * Usage: node scripts/seed-demo.js [--reset]
 *   --reset  Deletes all existing data before seeding
 */

const db = require('../db');

const RESET = process.argv.includes('--reset');

if (RESET) {
  console.log('Resetting database...');
  const database = db.getDb();
  database.exec(`
    DELETE FROM chat_messages;
    DELETE FROM chat_threads;
    DELETE FROM versions;
    DELETE FROM diagnostics;
    DELETE FROM touchpoints;
    DELETE FROM campaigns;
    DELETE FROM memory_patterns;
  `);
  console.log('All tables cleared.\n');
}

// Check if campaigns already exist
const existing = db.campaigns.list();
if (existing.length > 0 && !RESET) {
  console.log(`Database already has ${existing.length} campaign(s). Use --reset to clear and re-seed.`);
  process.exit(0);
}

console.log('Seeding demo data...\n');

// ═══════════════════════════════════════════════════
// Campaign 1: DAF Île-de-France (Email, Active)
// ═══════════════════════════════════════════════════

const camp1 = db.campaigns.create({
  name: 'DAF Île-de-France',
  client: 'FormaPro Consulting',
  status: 'active',
  channel: 'email',
  sector: 'Comptabilité & Finance',
  sectorShort: 'Comptabilité',
  position: 'DAF',
  size: '11-50 sal.',
  angle: 'Douleur client',
  zone: 'Île-de-France',
  tone: 'Pro décontracté',
  formality: 'Vous',
  length: 'Court (3 phrases)',
  cta: 'Question ouverte',
  startDate: '27 jan.',
  lemlistId: null,
  iteration: 4,
  nbProspects: 250,
  sent: 250,
  planned: 300,
});

// Update stats that aren't in the create method
db.campaigns.update(camp1.id, {
  open_rate: 68,
  reply_rate: 9.2,
  interested: 6,
  meetings: 3,
});

console.log(`  Campaign: ${camp1.name} (id=${camp1.id})`);

// Touchpoints
const camp1Touchpoints = [
  {
    step: 'E1', type: 'email', label: 'Email initial', timing: 'J+0',
    subType: 'Angle douleur client',
    subject: '{{firstName}}, une question sur votre gestion financière',
    body: "Bonjour {{firstName}}, combien d'heures par semaine votre équipe passe-t-elle sur des tâches qui pourraient être automatisées ? Chez {{companyName}}, les cabinets comme le vôtre gagnent en moyenne 12h/semaine...",
  },
  {
    step: 'E2', type: 'email', label: 'Email valeur', timing: 'J+3',
    subType: 'Case study',
    subject: 'Re: gestion financière — un cas concret',
    body: "{{firstName}}, je me permets de revenir avec un exemple concret. Le cabinet Nexia Conseil (35 personnes, secteur similaire) a réduit de 40% le temps de reporting...",
  },
  {
    step: 'E3', type: 'email', label: 'Email relance', timing: 'J+7',
    subType: 'Angle différent',
    subject: 'Autre approche, {{firstName}}',
    body: "{{firstName}}, je change d'approche. Plutôt que de parler d'automatisation, une question simple : quel est le coût réel d'une erreur de saisie dans un bilan chez {{companyName}} ?...",
  },
  {
    step: 'E4', type: 'email', label: 'Email break-up', timing: 'J+12',
    subType: 'Soft close',
    subject: 'Dernière tentative, {{firstName}}',
    body: "{{firstName}}, je ne veux pas encombrer votre boîte. Si ce n'est pas le bon moment, pas de souci — je ne reviendrai pas. Juste un dernier mot : si un jour 12h/semaine récupérées...",
  },
];

camp1Touchpoints.forEach((tp, i) => {
  db.touchpoints.create(camp1.id, { ...tp, sortOrder: i });
});

// Update touchpoint stats
const camp1TpRows = db.touchpoints.listByCampaign(camp1.id);
const camp1Stats = [
  { open_rate: 68, reply_rate: 4.2, stop_rate: 0.4 },
  { open_rate: 72, reply_rate: 3.1, stop_rate: 0.8 },
  { open_rate: 55, reply_rate: 1.4, stop_rate: 0 },
  { open_rate: 48, reply_rate: 0.5, stop_rate: 0 },
];
camp1TpRows.forEach((row, i) => {
  if (camp1Stats[i]) {
    db.touchpoints.update(row.id, camp1Stats[i]);
  }
});

// Diagnostics
db.diagnostics.create(camp1.id, {
  diagnostic: "E1 — Performant: L'objet personnalisé avec {{firstName}} et la question directe fonctionnent très bien. Taux d'ouverture de 68% au-dessus du benchmark (50%). Le CTA question ouverte génère un bon taux de réponse (4.2%).\n\nE2 — Fort potentiel: Le \"Re:\" dans l'objet booste l'ouverture à 72% (effet thread). Le case study concret avec des chiffres (40% de réduction) crédibilise le message. Bon ratio réponse/ouverture.\n\nE3 — À optimiser: Baisse significative d'ouverture (55%) et de réponse (1.4%). L'angle \"coût de l'erreur\" peut être perçu comme anxiogène. Recommandation : tester un angle \"gain de temps\" plus positif, raccourcir à 2 phrases max.\n\nE4 — Normal pour un break-up: Taux d'ouverture de 48% correct pour un dernier email. Le ton respectueux (\"je ne reviendrai pas\") évite la pression. Aucune modification nécessaire.",
  priorities: ['E3 — Changer angle', 'E1 — Maintenir', 'E2 — Maintenir'],
  nbToOptimize: 1,
});

// Version history
const camp1Versions = [
  { version: 4, hypotheses: 'Test A/B: Douleur vs Douleur+Urgence — Variante B avec angle urgence + objet provocant. Meilleure ouverture mais moins de conversion en RDV.', result: 'testing', date: '2026-02-17', messagesModified: ['E1', 'E3'] },
  { version: 3, hypotheses: 'Passage angle douleur client sur E1 et E3 — Remplacement preuve sociale par douleur client + CTA question ouverte.', result: 'improved', date: '2026-02-10', messagesModified: ['E1', 'E3'] },
  { version: 2, hypotheses: 'Optimisation objets email (A/B) — "Question rapide sur [secteur]" vs ancien objet générique. Personnalisé gagnant.', result: 'improved', date: '2026-02-03', messagesModified: ['E1', 'E2', 'E3', 'E4'] },
  { version: 1, hypotheses: 'Lancement initial — 4 emails, angle preuve sociale, CTA proposition de call, ton formel. 100 prospects.', result: 'neutral', date: '2026-01-27', messagesModified: [] },
];

camp1Versions.forEach(v => db.versions.create(camp1.id, v));

console.log(`    ${camp1Touchpoints.length} touchpoints, 1 diagnostic, ${camp1Versions.length} versions`);


// ═══════════════════════════════════════════════════
// Campaign 2: Dirigeants Formation (LinkedIn, Active)
// ═══════════════════════════════════════════════════

const camp2 = db.campaigns.create({
  name: 'Dirigeants Formation',
  client: 'FormaPro Consulting',
  status: 'active',
  channel: 'linkedin',
  sector: 'Formation & Éducation',
  sectorShort: 'Formation',
  position: 'Dirigeant',
  size: '1-10 sal.',
  angle: 'Preuve sociale',
  zone: 'France entière',
  tone: 'Pro décontracté',
  formality: 'Vous',
  length: 'Court',
  cta: 'Question ouverte',
  startDate: '3 fév.',
  lemlistId: null,
  iteration: 2,
  nbProspects: 152,
  sent: 152,
  planned: 200,
});

db.campaigns.update(camp2.id, {
  accept_rate_lk: 38,
  reply_rate: 6.8,
  interested: 3,
  meetings: 1,
});

console.log(`  Campaign: ${camp2.name} (id=${camp2.id})`);

const camp2Touchpoints = [
  {
    step: 'L1', type: 'linkedin', label: 'Note de connexion', timing: 'J+0',
    subType: 'Max 300 caractères',
    subject: null,
    body: "{{firstName}}, votre parcours dans la formation m'a interpellé. J'accompagne des dirigeants du secteur sur la croissance commerciale — je serais ravi d'échanger avec vous.",
    maxChars: 300,
  },
  {
    step: 'L2', type: 'linkedin', label: 'Message post-connexion', timing: 'J+3',
    subType: 'Conversationnel',
    subject: null,
    body: "Merci d'avoir accepté, {{firstName}} !\n\nJ'ai accompagné 3 organismes de formation comme le vôtre à générer entre 5 et 12 RDV qualifiés par mois.\n\nCurieux de savoir comment vous gérez votre développement commercial actuellement ?",
  },
];

camp2Touchpoints.forEach((tp, i) => {
  db.touchpoints.create(camp2.id, { ...tp, sortOrder: i });
});

// Update touchpoint stats
const camp2TpRows = db.touchpoints.listByCampaign(camp2.id);
const camp2Stats = [
  { accept_rate: 38 },
  { reply_rate: 6.8, interested: 3, stop_rate: 1.2 },
];
camp2TpRows.forEach((row, i) => {
  if (camp2Stats[i]) {
    db.touchpoints.update(row.id, camp2Stats[i]);
  }
});

// Diagnostics
db.diagnostics.create(camp2.id, {
  diagnostic: "L1 — Bon taux d'acceptation: 38% d'acceptation au-dessus du benchmark LinkedIn (30%). Le compliment sur le parcours + positionnement sectoriel fonctionne bien. Pas de pitch dans l'invite = bonne pratique.\n\nL2 — Réponse sous l'objectif: 6.8% de réponse vs objectif de 8%. Le \"3 organismes de formation\" manque de spécificité. Recommandation : remplacer l'angle preuve sociale par douleur client. Tester : \"Quel est votre plus gros frein à trouver de nouveaux clients en ce moment ?\"",
  priorities: ['L2 — Changer angle'],
  nbToOptimize: 1,
});

// Version history
const camp2Versions = [
  { version: 2, hypotheses: 'Personnalisation note de connexion — Ajout compliment parcours + mention secteur formation. Suppression du lien externe.', result: 'improved', date: '2026-02-10', messagesModified: ['L1'] },
  { version: 1, hypotheses: 'Lancement initial — Note de connexion générique + message preuve sociale. 80 premiers prospects.', result: 'neutral', date: '2026-02-03', messagesModified: [] },
];

camp2Versions.forEach(v => db.versions.create(camp2.id, v));

console.log(`    ${camp2Touchpoints.length} touchpoints, 1 diagnostic, ${camp2Versions.length} versions`);


// ═══════════════════════════════════════════════════
// Campaign 3: DRH PME Lyon (Multi, Prep)
// ═══════════════════════════════════════════════════

const camp3 = db.campaigns.create({
  name: 'DRH PME Lyon',
  client: 'FormaPro Consulting',
  status: 'prep',
  channel: 'multi',
  sector: 'Conseil & Consulting',
  sectorShort: 'Conseil',
  position: 'DRH',
  size: '51-200 sal.',
  angle: 'Offre directe',
  zone: 'Lyon & Rhône-Alpes',
  tone: 'Formel & Corporate',
  formality: 'Vous',
  length: 'Standard',
  cta: 'Proposition de call',
  startDate: '18 fév.',
  lemlistId: null,
  iteration: 0,
  nbProspects: 187,
  sent: 0,
  planned: 187,
});

console.log(`  Campaign: ${camp3.name} (id=${camp3.id})`);

const camp3Touchpoints = [
  {
    step: 'E1', type: 'email', label: 'Email initial', timing: 'J+0',
    subType: 'Offre directe',
    subject: '{{firstName}}, une solution concrète pour vos recrutements',
    body: "Bonjour {{firstName}}, nous aidons des DRH de PME comme {{companyName}} à réduire de 40% leur temps de recrutement. Seriez-vous disponible 15 minutes cette semaine ?",
  },
  {
    step: 'L1', type: 'linkedin', label: 'Note de connexion LinkedIn', timing: 'J+1',
    subType: 'Max 300 chars',
    subject: null,
    body: "{{firstName}}, votre expertise RH chez {{companyName}} m'a interpellé. J'échange régulièrement avec des DRH de PME lyonnaises — je serais ravi de vous compter dans mon réseau.",
    maxChars: 300,
  },
  {
    step: 'E2', type: 'email', label: 'Email valeur', timing: 'J+4',
    subType: 'Case study',
    subject: 'Re: recrutements — un résultat qui parle',
    body: "{{firstName}}, un exemple concret : une PME de conseil RH (180 personnes, Lyon) a divisé par 2 ses délais de recrutement en 3 mois...",
  },
  {
    step: 'L2', type: 'linkedin', label: 'Message LinkedIn', timing: 'J+5',
    subType: 'Post-connexion',
    subject: null,
    body: "Merci d'avoir accepté, {{firstName}} ! J'accompagne des PME lyonnaises sur l'optimisation RH...",
  },
  {
    step: 'E3', type: 'email', label: 'Email relance', timing: 'J+8',
    subType: 'Angle différent',
    subject: null,
    body: "{{firstName}}, une autre manière de voir les choses : combien vous coûte un recrutement raté chez {{companyName}} ?...",
  },
  {
    step: 'E4', type: 'email', label: 'Email break-up', timing: 'J+13',
    subType: 'Soft close',
    subject: null,
    body: "{{firstName}}, dernier message de ma part. Si le timing n'est pas bon, aucun souci...",
  },
];

camp3Touchpoints.forEach((tp, i) => {
  db.touchpoints.create(camp3.id, { ...tp, sortOrder: i });
});

console.log(`    ${camp3Touchpoints.length} touchpoints, 0 diagnostics, 0 versions`);


// ═══════════════════════════════════════════════════
// Memory Patterns (cross-campaign learnings)
// ═══════════════════════════════════════════════════

const patterns = [
  {
    pattern: 'Questions ouvertes > propositions de call (+2-3pts réponse)',
    category: 'Corps',
    data: 'CTA type "question ouverte" surperforme systématiquement les "proposition de call" sur les premiers emails. Testé sur DAF IDF (v2→v3) et confirmé sur LinkedIn Dirigeants.',
    confidence: 'Haute',
    sectors: ['Comptabilité & Finance', 'Formation & Éducation'],
    targets: ['DAF', 'Dirigeant'],
  },
  {
    pattern: 'Angle douleur client > preuve sociale (+3.2pts réponse email)',
    category: 'Corps',
    data: 'L\'angle "douleur client" (questions sur les problèmes du prospect) convertit mieux que la preuve sociale (mention de clients existants). Effet particulièrement fort sur E1 et E3.',
    confidence: 'Moyenne',
    sectors: ['Comptabilité & Finance'],
    targets: ['DAF'],
  },
  {
    pattern: 'Objets personnalisés avec {{firstName}} +8pts ouverture',
    category: 'Objets',
    data: 'Les objets contenant {{firstName}} et une référence au secteur ("une question sur votre gestion financière") surperforment les objets génériques.',
    confidence: 'Haute',
    sectors: ['Comptabilité & Finance'],
    targets: ['DAF'],
  },
  {
    pattern: 'Envoi mardi matin (9h-10h) +15% ouvertures',
    category: 'Timing',
    data: 'Les emails envoyés le mardi entre 9h et 10h montrent un taux d\'ouverture supérieur de 15% par rapport aux autres créneaux. Données sur 4 semaines, 250 prospects.',
    confidence: 'Moyenne',
    sectors: ['Comptabilité & Finance'],
    targets: ['DAF'],
  },
  {
    pattern: 'Compliment parcours + secteur booste acceptation LinkedIn (+8pts)',
    category: 'LinkedIn',
    data: 'Les notes de connexion qui complimentent le parcours du prospect et mentionnent leur secteur spécifique obtiennent un taux d\'acceptation 8 points supérieur aux notes génériques.',
    confidence: 'Moyenne',
    sectors: ['Formation & Éducation'],
    targets: ['Dirigeant'],
  },
];

patterns.forEach(p => db.memoryPatterns.create(p));

console.log(`\n  ${patterns.length} memory patterns`);


// ═══════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════

const finalCampaigns = db.campaigns.list();
const finalTp = db.getDb().prepare('SELECT COUNT(*) as count FROM touchpoints').get();
const finalDiag = db.getDb().prepare('SELECT COUNT(*) as count FROM diagnostics').get();
const finalVer = db.getDb().prepare('SELECT COUNT(*) as count FROM versions').get();
const finalMem = db.getDb().prepare('SELECT COUNT(*) as count FROM memory_patterns').get();

console.log('\n════════════════════════════════════════');
console.log('  Seed complete!');
console.log(`  ${finalCampaigns.length} campaigns`);
console.log(`  ${finalTp.count} touchpoints`);
console.log(`  ${finalDiag.count} diagnostics`);
console.log(`  ${finalVer.count} versions`);
console.log(`  ${finalMem.count} memory patterns`);
console.log('════════════════════════════════════════\n');
