# Bakal — Contexte Projet (pour Claude Chat)

## Ce que fait Bakal

Service B2B de prospection automatisee (done-for-you). On combine outreach multi-canal (Email + LinkedIn) avec de l'IA pour generer du copy personnalise et une boucle d'optimisation automatique.

**Offre :** 350 EUR/mois + 250 EUR setup, engagement 2 mois.
**Cible :** Dirigeants/directeurs de PME qui ont besoin de leads mais pas le temps de prospecter.

## Stack technique

| Outil | Role |
|-------|------|
| **Lemlist** | Execution des campagnes (sequences email + LinkedIn), stats, A/B testing |
| **N8N** | Orchestration entre les outils, workflows automatises |
| **Claude API** | Generation de copy, analyse de performance, optimisation |
| **Notion** | Hub central — bases de donnees clients, campagnes, diagnostics, memoire |
| **Dashboard HTML/JS** | Interface SaaS pour les clients (mockup fonctionnel) |

## Architecture du systeme

```
Lemlist (campagnes) --> N8N (workflows) --> Claude (IA/copy)
        |                    |                    |
        +------------------> Notion (hub) <-------+
```

## Boucle d'optimisation (le coeur du produit)

```
Lemlist stats --> N8N --> Claude analyse --> Claude regenere --> N8N --> Lemlist deploie
```

3 workflows N8N :
1. **Stats Collection** (daily 8h) — Recup stats Lemlist, stocke dans Notion, declenche analyse si campagne >50 prospects et >7 jours
2. **Regeneration + Deploiement** — Claude regenere les messages sous-performants avec variantes A/B, deploie dans Lemlist
3. **Memoire Cross-Campagne** (mensuel) — Consolide les patterns qui marchent par secteur/cible/type de message

## Systeme de prompts

**1 Master Prompt + 7 Sub-Prompts** pour la generation de copy :
- Email Initial (accroche), Email Valeur (preuve/case study), Email Relance (angle different), Email Break-up (soft close)
- LinkedIn Connection Note (max 300 chars, pas de pitch), LinkedIn Message (post-connexion)
- Subject Lines (variantes A/B)

**3 prompts de refinement :**
- Analyse de performance (diagnostic structure avec priorites)
- Regeneration (versions optimisees + variantes A/B avec hypotheses)
- Memoire cross-campagne (pattern library avec niveaux de confiance)

**Systeme de variables chainees :**
- Variable base (donnee brute scrapee) -> Variable enrichie (IA deduit) -> Variable derivee (icebreaker final)
- Exemple brasserie : beerName -> microbioProblem -> brewerIcebreaker

## Benchmarks performance

| Metrique | Bon | A optimiser |
|----------|-----|-------------|
| Taux d'ouverture email | >50% | <50% |
| Taux de reponse email | >5% | <5% |
| Taux acceptation LinkedIn | >30% | <30% |

## Bases Notion

1. **Campagnes — Resultats** : stats par touchpoint (open/reply rates E1-E4, LinkedIn)
2. **Campagnes — Diagnostics** : analyses Claude avec priorites
3. **Campagnes — Historique Versions** : chaque iteration avec hypotheses et resultats
4. **Memoire Cross-Campagne** : patterns par categorie avec niveau de confiance (Haute >200 prospects, Moyenne 50-200, Faible <50)

## Variables Lemlist (a preserver dans le copy)

`{{firstName}}`, `{{lastName}}`, `{{companyName}}`, `{{jobTitle}}`
+ variables custom chainees par campagne

## Contraintes copy prospect-facing

- **Jamais mentionner "IA" ou "automatise"** — le prospect doit sentir un humain
- LinkedIn connection notes : **max 300 caracteres**
- Break-up emails : **3-4 lignes max**, jamais culpabilisant
- Ton par defaut : conversationnel mais pro, vouvoiement
- Eviter : jargon corporate, tactiques de vente agressives, patterns spam

## Dashboard SaaS (etat actuel)

Interface HTML/JS avec :
- Page d'accueil avec KPIs globaux
- Liste des campagnes avec stats en temps reel
- Detail campagne (sequence, diagnostics, historique des versions)
- Editeur de copy avec preview
- Chat IA integre pour interagir avec Claude
- Profil Entreprise (infos societe, proposition de valeur, pain points, personas, preferences copy, upload de documents business)
- Parametres (integrations API, preferences)
- Systeme de recommandations IA
- Gestion des variables personnalisees

## API Lemlist — Endpoints cles

- `POST /api/campaigns` — Creer une campagne
- `PATCH /api/campaigns/{id}/sequences` — Modifier les sequences
- `POST /api/campaigns/{id}/leads` — Ajouter des leads
- `GET /api/campaigns/{id}/stats` — Recuperer les stats
- `GET /api/campaigns` — Lister les campagnes
- Base URL : `https://api.lemlist.com/api`, auth par API key

## Phases d'implementation

| Phase | Statut |
|-------|--------|
| Phase 1 — Manuel (prompts manuels, stats copiees a la main) | En cours |
| Phase 2 — Semi-auto (N8N collecte stats + analyse, humain valide) | Mois 2-3 |
| Phase 3 — Full auto (boucle complete, humain sur edge cases) | Mois 4-5 |

## Equipe

2-3 cofondateurs, pas de structure juridique encore (prevu sous 1 an). Dev principal : Goran.

---

*Derniere mise a jour : Mars 2026*
