# Système de Refinement Bakal — Boucle d'Auto-Optimisation

> **Rôle dans le système :** Ce document décrit la boucle d'optimisation automatique des campagnes de prospection. Il contient les **3 prompts core** (Analyse de performance, Régénération, Consolidation mémoire) et leur intégration avec les workflows N8N.

---

## Vue d'ensemble de la boucle

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   LEMLIST    │────▶│     N8N      │────▶│    CLAUDE    │────▶│   NOTION     │
│  Stats brutes │     │  Workflow 1  │     │   Analyse    │     │  Diagnostic  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
                     ┌────────────────────────────────────────────────┘
                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   LEMLIST    │◀────│     N8N      │◀────│    CLAUDE    │◀────│   NOTION     │
│  Mise à jour │     │  Workflow 2  │     │ Régénération │     │  Diagnostic  │
│  séquences   │     │              │     │              │     │  + Mémoire   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘

                     ┌──────────────────────────────────────────────────────────┐
                     │                  WORKFLOW 3 (mensuel)                     │
                     │  Diagnostics du mois → Claude → Mémoire Cross-Campagne   │
                     └──────────────────────────────────────────────────────────┘
```

### Les 3 temps de la boucle

| Étape | Déclencheur | Fréquence | Input | Output |
|-------|-------------|-----------|-------|--------|
| **1. Analyse** | Campagne >50 prospects ET >7 jours | Quotidien (8h) | Stats Lemlist | Diagnostic structuré |
| **2. Régénération** | Diagnostic signale sous-performance | À la demande | Diagnostic + Messages + Mémoire | Messages A/B optimisés |
| **3. Consolidation** | 1er du mois, 6h | Mensuel | Tous les diagnostics du mois | Pattern library mise à jour |

---

## Benchmarks de référence

Ces seuils déterminent quand un message est "performant" ou "à optimiser".

### Email
| Métrique | Bon | Moyen | Mauvais |
|----------|-----|-------|---------|
| Taux d'ouverture | >50% | 30-50% | <30% |
| Taux de réponse | >5% | 2-5% | <2% |
| Taux de stop | <1% | 1-3% | >3% |

### LinkedIn
| Métrique | Bon | Moyen | Mauvais |
|----------|-----|-------|---------|
| Taux d'acceptation | >30% | 15-30% | <15% |
| Taux de réponse (post-connexion) | >8% | 4-8% | <4% |

### Seuils de déclenchement
- **Analyse automatique :** campagne active + >50 prospects + >7 jours
- **Régénération suggérée :** au moins 1 touchpoint en zone "Mauvais"
- **Régénération critique :** taux de stop >3% (risque de réputation)

---

## Prompt 1 : Analyse de Performance

> **Workflow :** N8N Workflow 1 (Stats Collection) → noeud "Claude — Performance Analysis"
> **Déclenchement :** Quotidien à 8h, si une campagne éligible est détectée

### Prompt complet

```
Tu es un expert en prospection B2B multicanal. Analyse les performances de cette campagne et fournis un diagnostic structuré.

## Campagne: {campaign_name}

## Métriques par étape:
- E1 (Email initial): Open {open_rate_e1}% | Reply {reply_rate_e1}%
- E2 (Email valeur): Open {open_rate_e2}% | Reply {reply_rate_e2}%
- E3 (Email relance): Open {open_rate_e3}% | Reply {reply_rate_e3}%
- E4 (Email break-up): Open {open_rate_e4}% | Reply {reply_rate_e4}%
- LinkedIn connexion: Accept {accept_rate_lk}%
- LinkedIn message: Reply {reply_rate_lk}%

## Volume: {nb_prospects} prospects

## Benchmarks de référence:
- Open rate: >50% = bon, 30-50% = moyen, <30% = mauvais
- Reply rate: >5% = bon, 2-5% = moyen, <2% = mauvais
- LinkedIn accept: >30% = bon, 15-30% = moyen, <15% = mauvais

## Format de réponse attendu:

### 1. Résumé global
(1-2 phrases sur la santé globale de la campagne)

### 2. Diagnostic par étape
Pour chaque étape, indique:
- Performance: Bonne / Moyenne / Mauvaise
- Cause probable du problème (si applicable)
- Recommandation spécifique

### 3. Priorités d'optimisation
Liste ordonnée des messages à régénérer en premier (impact maximum)

### 4. Instructions de régénération
Pour chaque message à optimiser, donne des instructions précises:
- Ce qui ne fonctionne pas
- Direction à prendre
- Éléments à conserver
```

### Exemple de diagnostic généré

```markdown
### 1. Résumé global
La campagne "DAF Île-de-France" montre une performance globale correcte avec un excellent
taux d'ouverture (68%) mais un taux de réponse inégal entre les étapes. E1 et E2 portent
l'essentiel de l'engagement, tandis que E3 décroche significativement.

### 2. Diagnostic par étape

**E1 — Email initial**
- Performance: ✅ Bonne
- Open: 68% (au-dessus du benchmark 50%)
- Reply: 4.2% (dans la zone moyenne)
- L'objet personnalisé avec {{firstName}} et la question directe fonctionnent bien
- Le CTA question ouverte génère de l'engagement

**E2 — Email valeur**
- Performance: ✅ Bonne
- Open: 72% (le "Re:" booste l'ouverture)
- Reply: 3.1% (zone moyenne)
- Le case study avec chiffres concrets crédibilise le message

**E3 — Email relance**
- Performance: ⚡ À optimiser
- Open: 55% (baisse notable vs E1/E2)
- Reply: 1.4% (zone mauvaise)
- Cause probable: l'angle "coût de l'erreur" est perçu comme anxiogène par les DAF
- Les DAF préfèrent les messages orientés "gain" plutôt que "risque"

**E4 — Email break-up**
- Performance: 📊 Normal
- Open: 48% (correct pour un dernier email)
- Reply: 0.5% (attendu pour un break-up)
- Pas de modification nécessaire

### 3. Priorités d'optimisation
1. **E3** (priorité haute) — le décrochage en réponse impacte la conversion globale
2. **E1** (priorité moyenne) — potentiel d'amélioration du reply rate de 4.2% vers 5%+

### 4. Instructions de régénération

**E3 — Email relance**
- Ce qui ne fonctionne pas: l'angle anxiogène "coût de l'erreur" repousse les DAF
- Direction à prendre: angle positif "gain de temps", question ouverte
- Éléments à conserver: le ton direct, la personnalisation {{companyName}}
- Suggestion: "Si vous pouviez récupérer une journée par semaine, qu'en feriez-vous ?"
```

### Logique de décision post-analyse

Le noeud "Check Eligibility" dans le workflow détermine si la régénération est déclenchée :

```
SI diagnostic contient ≥1 étape en "Mauvaise" performance
   → Déclencher Workflow 2 (régénération)
SINON SI diagnostic contient ≥2 étapes en "Moyenne" performance
   → Déclencher Workflow 2 (régénération)
SINON
   → Stocker le diagnostic dans Notion, pas de régénération
```

---

## Prompt 2 : Régénération de Messages

> **Workflow :** N8N Workflow 2 (Regeneration + Deployment) → noeud "Claude — Regenerate Messages"
> **Déclenchement :** Déclenché par Workflow 1 quand une optimisation est nécessaire

### Contexte assemblé par N8N

Avant d'appeler Claude, le workflow assemble 3 sources de données :
1. **Le diagnostic** (output du Workflow 1) — quels messages optimiser et pourquoi
2. **Les messages originaux** (Lemlist API) — le copy actuel de la campagne
3. **La mémoire cross-campagne** (Notion) — patterns qui fonctionnent/ne fonctionnent pas

### Prompt complet

```
Tu es un expert en copywriting B2B multicanal. Tu dois régénérer les messages sous-performants d'une campagne de prospection.

## Diagnostic de la campagne
{diagnostic}

## Messages originaux
{original_messages}

## Mémoire cross-campagne (patterns qui fonctionnent)
{memory_patterns}

## Règles de régénération
1. Conserve les variables Lemlist telles quelles: {{firstName}}, {{lastName}}, {{companyName}}, {{jobTitle}}
2. Ne mentionne JAMAIS "IA" ou "automatisé" dans les copies
3. Notes de connexion LinkedIn: max 300 caractères
4. Break-up emails: max 3-4 lignes, jamais de culpabilisation
5. Ton conversationnel mais professionnel
6. Vouvoiement par défaut
7. Intègre les patterns de la mémoire cross-campagne quand ils sont pertinents
8. Si un pattern a une confiance "Haute", priorise-le dans tes choix

## Format de réponse attendu
Pour chaque message à optimiser, fournis:

### [Nom de l'étape]
**Hypothèse testée:** (ce que tu changes et pourquoi — formulé en 1 phrase testable)

**Version A (principale):**
Objet: ...
Corps: ...

**Version B (A/B test):**
Objet: ...
Corps: ...

**Ce qui a changé:** (résumé des modifications en 2-3 points)
```

### Règles de régénération détaillées

#### Préservation
- **Toujours garder** : les variables Lemlist, le niveau de formality (tu/vous), la langue
- **Ne jamais changer** : un break-up en email de vente, un message LinkedIn en email
- **Conserver si ça marche** : un objet avec >60% d'ouverture n'est pas modifié

#### Stratégie A/B
- **Version A** = l'optimisation principale, basée sur le diagnostic
- **Version B** = un test alternatif, pour valider l'hypothèse par contraste
- Les deux versions doivent être mesurables : une seule variable change entre A et B
- Hypothèse formulée de manière testable : "L'angle X performe mieux que Y sur cette cible"

#### Utilisation de la mémoire
- Si un pattern "Haute confiance" s'applique → l'appliquer directement
- Si un pattern "Moyenne confiance" s'applique → le proposer en Version B
- Si un pattern "Faible confiance" s'applique → le mentionner en note mais ne pas l'appliquer
- En cas de contradiction entre patterns → signaler et privilégier le plus récent

### Exemple de sortie régénérée

```markdown
### E3 — Email relance
**Hypothèse testée:** L'angle "gain de temps" positif performe mieux que l'angle "coût de l'erreur" anxiogène sur le segment DAF

**Version A (principale):**
Objet: Et si vous gagniez une journée par semaine, {{firstName}} ?
Corps:
{{firstName}}, je change d'approche.

Si vous pouviez récupérer une journée par semaine sur les tâches administratives, qu'en feriez-vous ?

Pour les cabinets de votre taille, nos clients investissent ce temps gagné dans le conseil stratégique — leur activité la plus rentable.

**Version B (A/B test):**
Objet: Autre approche, {{firstName}}
Corps:
{{firstName}}, une question différente.

Les cabinets de 30-50 personnes que j'accompagne récupèrent en moyenne 2 jours par mois sur le reporting. Ils les réinvestissent dans le conseil à haute valeur.

Curieux de savoir à quoi ressemble votre répartition temps admin / temps conseil chez {{companyName}} ?

**Ce qui a changé:**
- Angle: anxiogène (coût erreur) → positif (gain de temps)
- CTA: fermé (proposition) → ouvert (question sur leur quotidien)
- Preuve: chiffre générique → fourchette spécifique au segment
```

---

## Prompt 3 : Consolidation Mémoire Cross-Campagne

> **Workflow :** N8N Workflow 3 (Memory Consolidation) → noeud "Claude — Consolidate Memory"
> **Déclenchement :** Mensuel, le 1er du mois à 6h

### Objectif

Agréger tous les diagnostics du mois précédent pour en extraire des **patterns réutilisables** à travers les campagnes. La mémoire devient progressivement plus fiable avec le volume de données.

### Prompt complet

```
Tu es un analyste spécialisé en prospection B2B. Ta mission est de consolider la mémoire cross-campagne en analysant les diagnostics du mois écoulé.

## Période: {month_label}

## Diagnostics du mois
{all_monthly_diagnostics}

## Mémoire existante
{existing_memory_patterns}

## Instructions

1. Analyse tous les diagnostics et identifie des PATTERNS récurrents
2. Classe chaque pattern dans une catégorie:
   - **Objets**: Ce qui fonctionne/ne fonctionne pas pour les lignes d'objet
   - **Corps**: Patterns dans le corps des messages
   - **Timing**: Insights sur le timing/séquençage
   - **LinkedIn**: Spécificités LinkedIn (connexion, messages)
   - **Secteur**: Ce qui marche par secteur d'activité
   - **Cible**: Ce qui marche par type de décideur

3. Pour chaque pattern, indique un niveau de confiance:
   - **Haute**: Observé sur >200 prospects cumulés
   - **Moyenne**: Observé sur 50-200 prospects
   - **Faible**: Observé sur <50 prospects

4. Si un pattern existant est CONFIRMÉ par les nouvelles données:
   - Augmente sa confiance (Faible → Moyenne → Haute)
   - Mets à jour les données avec les nouvelles observations

5. Si un pattern existant est CONTREDIT:
   - Marque-le comme "invalidate"
   - Explique la contradiction dans le champ data

6. Cherche des patterns CROISÉS:
   - Un angle qui marche pour un secteur mais pas un autre
   - Un type de CTA qui dépend de la taille d'entreprise
   - Des corrélations entre ton/formality et taux de réponse

## Format de réponse (JSON strict)
```json
[
  {
    "category": "Objets|Corps|Timing|LinkedIn|Secteur|Cible",
    "pattern": "Titre court du pattern",
    "data": "Description détaillée avec données chiffrées",
    "confidence": "Haute|Moyenne|Faible",
    "sectors": ["secteur1", "secteur2"],
    "targets": ["cible1", "cible2"],
    "action": "create|update|invalidate"
  }
]
```

Réponds UNIQUEMENT avec le JSON, pas de texte autour.
```

### Niveaux de confiance

La confiance n'est pas juste un label — elle détermine comment la mémoire est utilisée en aval.

| Confiance | Volume requis | Utilisation en régénération |
|-----------|---------------|----------------------------|
| **Haute** | >200 prospects cumulés | Appliqué directement (Version A) |
| **Moyenne** | 50-200 prospects | Proposé en test (Version B) |
| **Faible** | <50 prospects | Mentionné en note, pas appliqué |

### Catégories de patterns

| Catégorie | Ce qu'elle capture | Exemples |
|-----------|-------------------|----------|
| **Objets** | Performance des lignes d'objet | "Les objets avec prénom outperforment de +5pts" |
| **Corps** | Structures et angles dans le message | "L'angle douleur > preuve sociale pour les PME" |
| **Timing** | Moments et espacements | "Mardi 9h-10h = +15% d'ouvertures" |
| **LinkedIn** | Spécificités de la plateforme | "Les notes >250 chars = -5pts d'acceptation" |
| **Secteur** | Insights par industrie | "Comptabilité : angle chiffré performe le mieux" |
| **Cible** | Insights par fonction décisionnaire | "Les DRH préfèrent les questions ouvertes" |

### Exemple de mémoire consolidée

```json
[
  {
    "category": "Objets",
    "pattern": "Prénom dans l'objet booste l'ouverture",
    "data": "Les objets contenant {{firstName}} ont en moyenne 65% d'ouverture vs 52% sans. Observé sur 4 campagnes (DAF IDF, Dirigeants Formation, DRH Lyon, Comptables PACA). Effet plus marqué sur les PME <50 sal. (+8pts) que sur les ETI (+3pts).",
    "confidence": "Haute",
    "sectors": ["Comptabilité", "Formation", "Conseil"],
    "targets": ["DAF", "Dirigeant", "DRH"],
    "action": "update"
  },
  {
    "category": "Corps",
    "pattern": "Angle douleur surperforme preuve sociale sur PME",
    "data": "Taux de réponse moyen avec angle douleur: 5.8% vs preuve sociale: 3.2%. Écart de +2.6pts constant sur 3 campagnes. Hypothèse: les dirigeants PME s'identifient plus à un problème concret qu'à un témoignage abstrait.",
    "confidence": "Moyenne",
    "sectors": ["Comptabilité", "Formation"],
    "targets": ["DAF", "Dirigeant"],
    "action": "create"
  },
  {
    "category": "Timing",
    "pattern": "Envoi mardi matin optimal",
    "data": "Ouverture mardi 9h-10h: 68% en moyenne vs 53% pour les autres créneaux. Basé sur les campagnes email DAF IDF (250 prospects) et DRH Lyon (187 prospects). Les lundis et vendredis sont les pires jours (<45% ouverture).",
    "confidence": "Moyenne",
    "sectors": ["Comptabilité", "Conseil"],
    "targets": ["DAF", "DRH"],
    "action": "create"
  },
  {
    "category": "LinkedIn",
    "pattern": "Note courte + compliment parcours = meilleur accept",
    "data": "Notes de connexion <200 chars avec compliment sur le parcours/expertise: 38% d'acceptation. Notes >250 chars: 28%. Notes sans compliment: 25%. Le compliment doit être spécifique au secteur, pas générique.",
    "confidence": "Moyenne",
    "sectors": ["Formation"],
    "targets": ["Dirigeant"],
    "action": "create"
  },
  {
    "category": "Cible",
    "pattern": "DAF sensibles à l'angle anxiogène — éviter",
    "data": "L'angle 'coût de l'erreur' sur les DAF produit un reply rate de 1.4% vs 4.2% pour l'angle 'gain de temps'. Le segment DAF réagit négativement aux messages qui sous-entendent des erreurs dans leur travail. Préférer les formulations positives.",
    "confidence": "Faible",
    "sectors": ["Comptabilité"],
    "targets": ["DAF"],
    "action": "create"
  }
]
```

---

## Stockage dans Notion

### Base : Campagnes — Diagnostics

Chaque diagnostic est stocké comme une page Notion avec :

| Propriété | Type | Contenu |
|-----------|------|---------|
| Campagne | Relation | Lien vers la campagne analysée |
| Date analyse | Date | Date du diagnostic |
| Diagnostic | Rich text (page body) | Le diagnostic complet en markdown |
| Priorités | Multi-select | Tags des étapes à optimiser (E1, E3, etc.) |
| Nb messages à optimiser | Number | Nombre de messages identifiés |

### Base : Campagnes — Historique Versions

Chaque régénération est stockée avec :

| Propriété | Type | Contenu |
|-----------|------|---------|
| Campagne | Relation | Lien vers la campagne |
| Version | Number | Numéro d'itération (auto-incrémenté) |
| Date | Date | Date de la régénération |
| Messages modifiés | Multi-select | Quels touchpoints ont changé (E1, E3, L2...) |
| Hypothèses testées | Text | Les hypothèses A/B formulées |
| Résultat | Select | En cours / Amélioré / Dégradé / Neutre |

### Base : Mémoire Cross-Campagne

Les patterns consolidés sont stockés avec :

| Propriété | Type | Contenu |
|-----------|------|---------|
| Pattern | Title | Titre court du pattern |
| Catégorie | Select | Objets / Corps / Timing / LinkedIn / Secteur / Cible |
| Données | Text | Description détaillée avec chiffres |
| Confiance | Select | Haute / Moyenne / Faible |
| Date découverte | Date | Quand le pattern a été identifié |
| Secteur | Multi-select | Secteurs concernés |
| Cible | Multi-select | Fonctions concernées |

---

## Flux complet — Exemple de bout en bout

### Jour 1 : Lancement
- La campagne "DAF Île-de-France" est lancée sur Lemlist avec 250 prospects
- Séquence initiale générée par le [Master Prompt](bakal-prompt-system.md)
- Résultat stocké en v1 dans Historique Versions

### Jour 8 : Premier diagnostic (Workflow 1)
1. N8N collecte les stats Lemlist à 8h
2. La campagne a >50 prospects ET >7 jours → éligible
3. Claude analyse les performances :
   - E1 : 68% open, 4.2% reply → Bon
   - E2 : 72% open, 3.1% reply → Bon
   - E3 : 55% open, 1.4% reply → **Mauvais**
   - E4 : 48% open, 0.5% reply → Normal (break-up)
4. Diagnostic stocké dans Notion
5. E3 en zone "Mauvais" → Workflow 2 déclenché

### Jour 8 : Régénération (Workflow 2)
1. N8N récupère en parallèle : diagnostic, messages originaux, mémoire
2. Claude régénère E3 avec :
   - Version A : angle "gain de temps" (remplacement de l'angle anxiogène)
   - Version B : angle "question sur la répartition temps admin/conseil"
   - Hypothèse : "L'angle positif performe mieux que l'anxiogène sur les DAF"
3. Version A déployée sur Lemlist, Version B en A/B test
4. Historique Versions mis à jour (v2)

### Jour 15 : Deuxième diagnostic
1. Nouvelles stats avec la v2 :
   - E3 v2 : 61% open (+6pts), 3.8% reply (+2.4pts)
2. Diagnostic stocké → amélioration confirmée
3. Pas de régénération nécessaire (tous les touchpoints en zone Bon/Moyen)
4. Version A/B comparée → Version A gagnante
5. Historique Versions mis à jour : v2 → "Amélioré"

### Mois suivant : Consolidation (Workflow 3)
1. Le 1er du mois, tous les diagnostics sont agrégés
2. Claude identifie les patterns :
   - "L'angle douleur > preuve sociale sur PME" (Moyenne confiance)
   - "Les DAF n'aiment pas l'angle anxiogène" (Faible confiance → besoin de plus de data)
   - "Le 'Re:' dans l'objet E2 booste l'ouverture" (Haute confiance)
3. Patterns stockés dans Mémoire Cross-Campagne
4. Ces patterns seront injectés dans les futures régénérations

---

## Phases d'implémentation

| Phase | Scope | Intervention humaine |
|-------|-------|---------------------|
| **Phase 1 (actuel)** | Prompts utilisés manuellement dans Claude | 100% — copier stats, lancer prompts, appliquer résultats |
| **Phase 2 (mois 2-3)** | Workflow 1 automatisé, régénération semi-auto | Validation humaine avant déploiement sur Lemlist |
| **Phase 3 (mois 4-5)** | Boucle complète automatisée | Surveillance uniquement, override si nécessaire |

### Phase 1 — Mode manuel

Pour utiliser les prompts manuellement :

1. **Collecter les stats** depuis le dashboard Lemlist
2. **Copier les chiffres** dans le Prompt 1 (Analyse de Performance)
3. **Lire le diagnostic** et identifier les messages à optimiser
4. **Copier le diagnostic + les messages** dans le Prompt 2 (Régénération)
5. **Appliquer les nouvelles versions** manuellement dans Lemlist
6. **Attendre 7+ jours** puis recommencer

### Phase 2 — Mode semi-automatique

- Workflow 1 tourne automatiquement → diagnostic dans Notion
- Notification envoyée à l'opérateur quand une régénération est recommandée
- L'opérateur valide le diagnostic, ajuste si nécessaire, lance Workflow 2
- L'opérateur vérifie les messages régénérés avant déploiement

### Phase 3 — Mode automatique

- Boucle complète sans intervention
- Alertes en cas de :
  - Taux de stop >3% (risque réputation)
  - Dégradation après régénération (rollback possible)
  - Pas de données depuis >48h (problème technique)

---

## Garde-fous et limites

### Ne pas régénérer quand...
- La campagne a <50 prospects (pas assez de données)
- La campagne a <7 jours (pas assez de temps)
- Tous les touchpoints sont en zone "Bon" (ne pas toucher ce qui marche)
- Le taux de stop est >5% (problème plus profond — arrêter la campagne)

### Limiter la fréquence
- Maximum 1 régénération par semaine par campagne
- Minimum 7 jours entre deux itérations (temps de mesure)
- Maximum 8 itérations par campagne (au-delà, revoir la stratégie globale)

### Rollback
Si une régénération dégrade les performances (v(n) < v(n-1)) :
1. Revenir à la version précédente dans Lemlist
2. Stocker le résultat comme "Dégradé" dans Historique Versions
3. L'hypothèse invalidée est enregistrée dans la mémoire (pattern "invalidate")

---

*Ce document fait partie de l'architecture de prompts Bakal. Voir aussi : [bakal-prompt-system.md](bakal-prompt-system.md) (Master + Sub-prompts de génération) et [bakal-variable-generator-prompt.md](bakal-variable-generator-prompt.md) (variables enrichies).*
