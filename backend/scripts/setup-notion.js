#!/usr/bin/env node

/**
 * Bakal — Notion Database Setup Script
 *
 * Creates the 4 required databases in your Notion workspace:
 *   1. Campagnes — Résultats
 *   2. Campagnes — Diagnostics
 *   3. Campagnes — Historique Versions
 *   4. Mémoire Cross-Campagne
 *
 * Prerequisites:
 *   1. Create a Notion integration at https://www.notion.so/my-integrations
 *   2. Set NOTION_TOKEN and NOTION_PARENT_PAGE_ID in your .env file
 *   3. Share the parent page with your integration (... → Connections → Add)
 *
 * Usage:
 *   npm run setup-notion
 */

require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const parentPageId = process.env.NOTION_PARENT_PAGE_ID;

async function main() {
  console.log('🔧 Bakal — Notion Database Setup\n');

  if (!process.env.NOTION_TOKEN) {
    console.error('❌ NOTION_TOKEN is not set. Add it to your .env file.');
    process.exit(1);
  }
  if (!parentPageId) {
    console.error('❌ NOTION_PARENT_PAGE_ID is not set. Add it to your .env file.');
    console.error('   This is the page under which the databases will be created.');
    process.exit(1);
  }

  const created = {};

  // ──────────────────────────────────────────
  // 1. Campagnes — Résultats
  // ──────────────────────────────────────────
  console.log('📊 Creating "Campagnes — Résultats"...');
  const resultats = await notion.databases.create({
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Campagnes — Résultats' } }],
    icon: { type: 'emoji', emoji: '📊' },
    properties: {
      'Nom campagne': { title: {} },
      'Client': { rich_text: {} },
      'Date collecte': { date: {} },
      'Statut': {
        select: {
          options: [
            { name: 'Active', color: 'green' },
            { name: 'Terminée', color: 'gray' },
            { name: 'En optimisation', color: 'orange' },
            { name: 'En préparation', color: 'blue' },
          ],
        },
      },
      'Canal': {
        select: {
          options: [
            { name: 'Email', color: 'blue' },
            { name: 'LinkedIn', color: 'purple' },
            { name: 'Multi', color: 'pink' },
          ],
        },
      },
      'Nb prospects': { number: { format: 'number' } },
      'Secteur': { rich_text: {} },
      'Cible': { rich_text: {} },
      'Open rate global': { number: { format: 'percent' } },
      'Reply rate global': { number: { format: 'percent' } },
      'Accept rate LK': { number: { format: 'percent' } },
      'Reply rate LK': { number: { format: 'percent' } },
      'Open rate E1': { number: { format: 'percent' } },
      'Open rate E2': { number: { format: 'percent' } },
      'Open rate E3': { number: { format: 'percent' } },
      'Open rate E4': { number: { format: 'percent' } },
      'Reply rate E1': { number: { format: 'percent' } },
      'Reply rate E2': { number: { format: 'percent' } },
      'Reply rate E3': { number: { format: 'percent' } },
      'Reply rate E4': { number: { format: 'percent' } },
      'Lemlist ID': { rich_text: {} },
    },
  });
  created.resultats = resultats.id;
  console.log(`   ✅ Created (ID: ${resultats.id})`);

  // ──────────────────────────────────────────
  // 2. Campagnes — Diagnostics
  // ──────────────────────────────────────────
  console.log('🩺 Creating "Campagnes — Diagnostics"...');
  const diagnostics = await notion.databases.create({
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Campagnes — Diagnostics' } }],
    icon: { type: 'emoji', emoji: '🩺' },
    properties: {
      'Campagne': { title: {} },
      'Date analyse': { date: {} },
      'Priorités': {
        multi_select: {
          options: [
            { name: 'E1', color: 'blue' },
            { name: 'E2', color: 'green' },
            { name: 'E3', color: 'orange' },
            { name: 'E4', color: 'red' },
            { name: 'L1', color: 'purple' },
            { name: 'L2', color: 'pink' },
            { name: 'Objet', color: 'yellow' },
            { name: 'Timing', color: 'gray' },
          ],
        },
      },
      'Nb messages à optimiser': { number: { format: 'number' } },
    },
  });
  created.diagnostics = diagnostics.id;
  console.log(`   ✅ Created (ID: ${diagnostics.id})`);

  // ──────────────────────────────────────────
  // 3. Campagnes — Historique Versions
  // ──────────────────────────────────────────
  console.log('📝 Creating "Campagnes — Historique Versions"...');
  const historique = await notion.databases.create({
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Campagnes — Historique Versions' } }],
    icon: { type: 'emoji', emoji: '📝' },
    properties: {
      'Campagne': { title: {} },
      'Version': { number: { format: 'number' } },
      'Date': { date: {} },
      'Messages modifiés': {
        multi_select: {
          options: [
            { name: 'E1', color: 'blue' },
            { name: 'E2', color: 'green' },
            { name: 'E3', color: 'orange' },
            { name: 'E4', color: 'red' },
            { name: 'L1', color: 'purple' },
            { name: 'L2', color: 'pink' },
          ],
        },
      },
      'Hypothèses testées': { rich_text: {} },
      'Résultat': {
        select: {
          options: [
            { name: 'En cours', color: 'yellow' },
            { name: 'Amélioré', color: 'green' },
            { name: 'Dégradé', color: 'red' },
            { name: 'Neutre', color: 'gray' },
          ],
        },
      },
    },
  });
  created.historique = historique.id;
  console.log(`   ✅ Created (ID: ${historique.id})`);

  // ──────────────────────────────────────────
  // 4. Mémoire Cross-Campagne
  // ──────────────────────────────────────────
  console.log('🧠 Creating "Mémoire Cross-Campagne"...');
  const memoire = await notion.databases.create({
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Mémoire Cross-Campagne' } }],
    icon: { type: 'emoji', emoji: '🧠' },
    properties: {
      'Pattern': { title: {} },
      'Catégorie': {
        select: {
          options: [
            { name: 'Objets', color: 'blue' },
            { name: 'Corps', color: 'green' },
            { name: 'Timing', color: 'orange' },
            { name: 'LinkedIn', color: 'purple' },
            { name: 'Secteur', color: 'pink' },
            { name: 'Cible', color: 'yellow' },
          ],
        },
      },
      'Confiance': {
        select: {
          options: [
            { name: 'Haute', color: 'green' },
            { name: 'Moyenne', color: 'orange' },
            { name: 'Faible', color: 'red' },
          ],
        },
      },
      'Date découverte': { date: {} },
      'Secteur': {
        multi_select: {
          options: [
            { name: 'Comptabilité & Finance', color: 'blue' },
            { name: 'IT & Services', color: 'green' },
            { name: 'Immobilier', color: 'orange' },
            { name: 'RH & Recrutement', color: 'purple' },
            { name: 'Marketing & Communication', color: 'pink' },
          ],
        },
      },
      'Cible': {
        multi_select: {
          options: [
            { name: 'DAF', color: 'blue' },
            { name: 'DG', color: 'green' },
            { name: 'DRH', color: 'purple' },
            { name: 'DSI', color: 'orange' },
            { name: 'Directeur Commercial', color: 'red' },
          ],
        },
      },
    },
  });
  created.memoire = memoire.id;
  console.log(`   ✅ Created (ID: ${memoire.id})`);

  // ──────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────
  console.log('\n════════════════════════════════════════');
  console.log('✅ All 4 databases created successfully!');
  console.log('════════════════════════════════════════\n');
  console.log('Add these IDs to your .env file:\n');
  console.log(`NOTION_DB_RESULTATS=${created.resultats}`);
  console.log(`NOTION_DB_DIAGNOSTICS=${created.diagnostics}`);
  console.log(`NOTION_DB_HISTORIQUE=${created.historique}`);
  console.log(`NOTION_DB_MEMOIRE=${created.memoire}`);
  console.log('\n💡 Tip: The databases are now visible in your Notion workspace');
  console.log('   under the parent page you specified.\n');
}

main().catch((err) => {
  console.error('\n❌ Setup failed:', err.message);
  if (err.code === 'unauthorized') {
    console.error('   → Check your NOTION_TOKEN in .env');
  } else if (err.code === 'object_not_found') {
    console.error('   → Check NOTION_PARENT_PAGE_ID and share the page with your integration');
  }
  process.exit(1);
});
