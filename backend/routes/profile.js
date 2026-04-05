const { Router } = require('express');
const db = require('../db');
const { callClaude } = require('../api/claude');

const router = Router();

// GET /api/profile — Return current user's profile
router.get('/', async (req, res, next) => {
  try {
    const profile = await db.profiles.get(req.user.id);
    res.json({ profile: profile || null });
  } catch (err) {
    next(err);
  }
});

// POST /api/profile — Create or update profile
router.post('/', async (req, res, next) => {
  try {
    const data = {};
    const allowed = [
      'company', 'sector', 'website', 'team_size', 'description',
      'value_prop', 'social_proof', 'pain_points', 'objections',
      'persona_primary', 'persona_secondary', 'target_sectors',
      'target_size', 'target_zones', 'default_tone', 'default_formality',
      'avoid_words', 'signature_phrases',
    ];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        data[key] = req.body[key];
      }
    }

    const profile = await db.profiles.upsert(req.user.id, data);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

// POST /api/profile/auto-fill — Extract profile fields from uploaded documents via Claude
router.post('/auto-fill', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get parsed text from uploaded documents
    const docs = await db.documents.getParsedTextByUser(userId, 10);
    if (!docs || docs.length === 0) {
      return res.status(400).json({ error: 'Aucun document uploadé' });
    }

    const docText = docs
      .map(d => `--- ${d.original_name} ---\n${(d.parsed_text || '').slice(0, 3000)}`)
      .join('\n\n')
      .slice(0, 10000);

    const result = await callClaude(
      `Tu es un expert en analyse d'entreprise B2B. À partir des documents fournis, extrais les informations suivantes pour remplir un profil de prospection.

Retourne un JSON avec UNIQUEMENT les champs que tu peux identifier avec confiance. Ne fabrique rien — si une info n'est pas dans les documents, ne l'inclus pas.

{
  "company": "Nom de l'entreprise",
  "sector": "Secteur d'activité",
  "description": "Description courte de l'activité (2-3 phrases)",
  "value_prop": "Proposition de valeur principale",
  "social_proof": "Clients notables, références, certifications",
  "pain_points": "Problèmes que résolvent leurs clients",
  "objections": "Objections potentielles des prospects",
  "persona_primary": "Persona principal (poste, responsabilités, défis)",
  "persona_secondary": "Persona secondaire",
  "target_sectors": "Secteurs cibles (séparés par des virgules)",
  "target_size": "Taille d'entreprise cible",
  "target_zones": "Zones géographiques cibles"
}`,
      docText,
      3000
    );

    if (result.parsed) {
      res.json({ profile: result.parsed, source: docs.map(d => d.original_name) });
    } else {
      res.status(500).json({ error: 'Impossible d\'extraire les informations' });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
