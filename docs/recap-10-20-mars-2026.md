# Bakal — Résumé du développement (10-20 mars 2026)

**130 commits · 45 PRs mergées · 2 semaines**

---

## 🏗️ Infrastructure & Déploiement

- Migration complète du backend de SQLite vers **PostgreSQL (Supabase)**
- Déploiement sur **Railway** avec Dockerfile custom
- Configuration CORS automatique pour le domaine Railway
- Build frontend optimisé : **vendor chunk splitting** (résolution d'erreurs TDZ en production)
- Socket.io pour les notifications temps réel
- Scaling backend : pool config, pagination, rate limiting, caching, graceful shutdown

---

## 🎨 Frontend — Migration React

- Migration complète de l'app vanilla JS vers **React 19 + Vite 7 + React Router 7**
- Suppression du code legacy `/app/`
- **69 tests unitaires** (editor, campaigns, copy editor)
- Lazy loading de toutes les pages pour optimiser le bundle

---

## 📊 Dashboard & Navigation

- **Simplification navigation** : 9 → 7 items sidebar
- Fusion des pages : Analytics + Rapports → **PerformancePage**
- Intégration VarGenerator dans **Copy & Séquences**
- Suppression des tabs du dashboard — vue d'ensemble uniquement
- **Toggle "Voir la démo"** avec données réalistes (4 campagnes, KPIs, opportunités, recommandations)
- Logo cliquable → retour au dashboard
- Responsive : sidebar collapse à 900px (icônes), hidden à 600px (mobile nav)

---

## 🧠 Intelligence Artificielle

### Lead Scoring (/100)
- **Engagement** (max 50 pts) : ouverture email, clic, réponse, acceptation LinkedIn, RDV
- **ICP Fit** (max 50 pts) : secteur, taille entreprise, poste décisionnaire, zone géo
- Badge couleur sur chaque opportunité (vert >70, orange 40-70, rouge <40)
- Export vers CRM (HubSpot) + export CSV

### Auto-analyse Lemlist
- Pull automatique de l'historique des campagnes Lemlist via API
- Claude analyse les stats et identifie des patterns de performance
- Sauvegarde dans `memory_patterns` pour enrichir les futures campagnes
- Barre de progression temps réel via Socket.io

### Auto-analyse CRM
- Support HubSpot, Salesforce, Pipedrive
- Pull des deals (nom, montant, stage, date)
- Claude identifie les profils qui convertissent → enrichit l'ICP
- Même UX que Lemlist (progression + notification)

### Onboarding → Auto-sync
- Quand le user entre ses clés Lemlist/CRM pendant l'onboarding, le sync se lance automatiquement en arrière-plan
- L'utilisateur arrive sur le dashboard avec la mémoire déjà peuplée

---

## 🎯 Biais cognitifs (Retention UX)

- **Endowed Progress Effect** : barre de progression visible dès l'inscription ("33% — Compte créé + Profil entreprise")
- **Sunk Cost** : bannière "valeur cumulée" (prospects atteints, optimisations, patterns appris)
- **Social Proof** : badge benchmark vs. secteur
- Composants Recharts intégrés (PerformanceChart, EngagementChart, FunnelChart)

---

## ⚙️ Page Paramètres

- **Core** : Lemlist + Claude + CRM (sélecteur HubSpot/Salesforce/Pipedrive)
- Icônes colorées + descriptions pour chaque intégration
- Animation dropdown smooth (ease-out cubic-bezier)
- **20+ intégrations** organisées par catégorie (Enrichissement, Outreach, LinkedIn, Calendrier, Délivrabilité)
- Cartes "Analyse Lemlist" et "Analyse CRM" avec bouton sync + barre de progression

---

## 📝 Page Profil

- Formulaire complet : infos entreprise, proposition de valeur, personas, ciblage, style de communication
- **Drag & drop file upload** pour documents entreprise (briefs, guidelines, personas PDF)
- Structure card-header/card-body avec espacement propre

---

## 💬 Chat Assistant

- Chat conversationnel avec Claude pour créer/optimiser des campagnes
- Drag & drop de fichiers (CSV, PDF, DOCX)
- Threads de conversation persistants
- Actions structurées : création de campagne, analyse, régénération de touchpoints
- Welcome screen contextuel (nouveau user, user avec campagnes, user actif)

---

## 🔧 Corrections & Polish

- Fix TDZ production ("Cannot access 'z' before initialization")
- Fix tous les boutons morts "Créer campagne" (5 boutons)
- Fix hauteur du chat (ne remplissait pas l'écran)
- Fix accents français sur **24 fichiers** (centaines de corrections)
- Fix layout grille dashboard (colonnes équilibrées)
- Fix cards page Profil (card-header/card-body)

---

## 📁 Fichiers créés cette période

| Fichier | Description |
|---------|-------------|
| `backend/lib/lead-scoring.js` | Moteur de scoring engagement + ICP fit |
| `backend/lib/lemlist-sync.js` | Sync + analyse Lemlist en arrière-plan |
| `backend/lib/crm-sync.js` | Sync + analyse CRM en arrière-plan |
| `backend/lib/crm-export.js` | Export scores vers HubSpot + CSV |
| `backend/db/migrations/004-add-lead-scoring.sql` | Migration DB pour les scores |
| `frontend/src/pages/PerformancePage.jsx` | Page fusionnée Analytics + Rapports |
| `frontend/src/components/ScoreBadge.jsx` | Badge score coloré avec tooltip |
| `frontend/src/data/demo-data.js` | Données de démo réalistes |

---

## 📈 Prochaines étapes

- [ ] Fix tests cassés (suite de 69 tests à remettre au vert)
- [ ] Polish UX (light mode, micro-interactions)
- [ ] Logos SVG des intégrations dans Paramètres
- [ ] Tests E2E pour le parcours onboarding → première campagne
