# Système de Prompts Bakal — Génération de Copy

> **Rôle dans le système :** Ce document décrit l'architecture complète de génération de copy pour les campagnes de prospection multicanal. Il contient le **Master Prompt** et les **7 Sub-Prompts** spécialisés utilisés par Claude pour produire des séquences personnalisées.

---

## Architecture : 1 Master + 7 Sub-Prompts

```
┌────────────────────────────────────────────────────────────────┐
│                      MASTER PROMPT                             │
│  Reçoit les paramètres client et orchestre la séquence         │
│  complète (4 à 8 touchpoints, Email + LinkedIn)                │
└───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┘
        │       │       │       │       │       │       │
        ▼       ▼       ▼       ▼       ▼       ▼       ▼
     SP-1    SP-2    SP-3    SP-4    SP-5    SP-6    SP-7
     Email   Email   Email   Email   LK      LK      Objets
     Init.   Valeur  Relance Break   Connex. Msg     Email
```

**Flux d'utilisation :**
1. Le Master Prompt reçoit les paramètres du client
2. Il génère la séquence complète en s'appuyant sur les règles de chaque Sub-Prompt
3. Chaque Sub-Prompt peut aussi être appelé individuellement lors de la régénération d'un touchpoint spécifique

---

## Paramètres d'entrée

Ces paramètres sont fournis lors de la création d'une campagne dans le SaaS ou via N8N.

### Paramètres de style
| Paramètre | Valeurs possibles | Défaut |
|-----------|-------------------|--------|
| `tone` | Pro décontracté, Formel & Corporate, Direct & Percutant | Pro décontracté |
| `formality` | tu, vous | vous |
| `length` | Court (2-3 phrases), Standard (3-4 phrases), Long (4-5 phrases) | Court |
| `language` | FR, EN | FR |

### Paramètres de séquence
| Paramètre | Valeurs possibles | Défaut |
|-----------|-------------------|--------|
| `touchpoints` | 4 à 8 (nombre total de messages) | 6 |
| `channels` | Email, LinkedIn, Email + LinkedIn | Email + LinkedIn |
| `angle` | Douleur client, Preuve sociale, Offre directe, Curiosité | Douleur client |
| `cta_type` | Question ouverte, Proposition de call, Ressource gratuite | Question ouverte |
| `personalization_level` | Standard (variables Lemlist), Enrichi (variables custom + icebreaker) | Standard |

### Paramètres client
| Paramètre | Description | Exemple |
|-----------|-------------|---------|
| `company_name` | Nom de l'entreprise du client | FormaPro Consulting |
| `client_sector` | Secteur d'activité | Formation professionnelle |
| `target_sector` | Secteur visé par la prospection | Comptabilité & Finance |
| `target_position` | Fonction du décideur ciblé | DAF, DRH, Dirigeant |
| `target_size` | Taille de l'entreprise cible | 11-50 salariés |
| `target_zone` | Zone géographique | Île-de-France |
| `value_prop` | Proposition de valeur en 1-2 phrases | Réduire de 40% le temps de reporting |
| `pain_points` | Douleurs identifiées (liste) | Saisie manuelle, erreurs de bilan, temps perdu |
| `social_proof` | Preuves concrètes (optionnel) | Cabinet Nexia Conseil : -40% temps reporting |
| `differentiator` | Ce qui distingue le client | Méthode structurée + automatisation |

---

## Master Prompt

```
Tu es un expert en prospection B2B multicanal (Email + LinkedIn).
Tu génères des séquences de messages pour des campagnes d'outreach personnalisées.

## Contexte client
- Entreprise : {company_name}
- Secteur client : {client_sector}
- Secteur cible : {target_sector}
- Fonction ciblée : {target_position}
- Taille cible : {target_size}
- Zone : {target_zone}

## Proposition de valeur
{value_prop}

## Douleurs identifiées du prospect
{pain_points}

## Preuve sociale (si disponible)
{social_proof}

## Différenciateur
{differentiator}

## Paramètres de la séquence
- Nombre de touchpoints : {touchpoints}
- Canaux : {channels}
- Angle principal : {angle}
- Type de CTA : {cta_type}
- Ton : {tone}
- Formulation : {formality}
- Longueur : {length}
- Langue : {language}
- Niveau de personnalisation : {personalization_level}

## Variables Lemlist à préserver
Utilise ces variables telles quelles dans le copy — elles seront remplacées automatiquement :
- {{firstName}} — Prénom du prospect
- {{lastName}} — Nom du prospect
- {{companyName}} — Entreprise du prospect
- {{jobTitle}} — Poste du prospect

## Règles de génération

### Règles générales
1. **Ne jamais mentionner l'IA, l'automatisation, ou les bots** — le prospect doit avoir l'impression d'un message humain et personnel
2. **Chaque message doit pouvoir se lire indépendamment** — pas de référence obligatoire au message précédent (le prospect peut ne pas l'avoir lu)
3. **Varier les angles** d'un message à l'autre — ne pas répéter la même approche
4. **Privilégier les questions ouvertes** comme CTA — elles surperforment les propositions de call directes (+2x taux de réponse en moyenne)
5. **Utiliser des chiffres concrets** quand c'est possible — "12h/semaine" est plus crédible que "beaucoup de temps"
6. **Éviter le jargon corporate** — écrire comme on parle à un collègue respecté

### Règles par canal
**Email :**
- L'objet est critique — il détermine 80% du taux d'ouverture
- Jamais de salutation "Cher/Chère" — trop formel et spam-like
- Le premier email ne pitch pas — il pose une question ou fait une observation
- Le break-up email est TOUJOURS court (3 lignes max) et jamais culpabilisant

**LinkedIn :**
- La note de connexion fait MAX 300 caractères — limite stricte de la plateforme
- La note de connexion ne pitch JAMAIS — c'est une prise de contact humaine
- Le message post-connexion est conversationnel — on remercie puis on engage
- Pas de lien dans la note de connexion (réduit le taux d'acceptation)

### Règles de ton
**Pro décontracté (défaut) :**
- Phrases courtes. Questions directes.
- Pas de formules pompeuses ("J'ai le plaisir de...", "Suite à mes recherches...")
- OK pour commencer par le prénom directement

**Formel & Corporate :**
- Structure plus classique mais pas rigide
- "Bonjour {{firstName}}," en ouverture
- Formules de politesse mais pas excessives

**Direct & Percutant :**
- Phrases très courtes (1 idée par phrase)
- Chiffres en avant
- Pas de fioritures

## Structure de la séquence

Génère la séquence suivante selon les canaux choisis :

### Séquence Email seul (4 touchpoints)
1. **E1 — Email initial** (J+0) → Accroche + question ouverte basée sur l'angle
2. **E2 — Email valeur** (J+3) → Case study ou preuve concrète
3. **E3 — Email relance** (J+7) → Angle différent de E1
4. **E4 — Email break-up** (J+12) → Soft close, 3 lignes max

### Séquence LinkedIn seul (2 touchpoints)
1. **L1 — Note de connexion** (J+0) → Max 300 chars, pas de pitch
2. **L2 — Message post-connexion** (J+3) → Conversationnel, engagement

### Séquence Multi-canal (6 touchpoints)
1. **E1 — Email initial** (J+0)
2. **L1 — Note de connexion LinkedIn** (J+1)
3. **E2 — Email valeur** (J+4)
4. **L2 — Message LinkedIn** (J+5)
5. **E3 — Email relance** (J+8)
6. **E4 — Email break-up** (J+13)

### Séquence Multi-canal étendue (8 touchpoints)
1. **E1 — Email initial** (J+0)
2. **L1 — Note de connexion LinkedIn** (J+1)
3. **E2 — Email valeur** (J+3)
4. **L2 — Message LinkedIn** (J+5)
5. **E3 — Email relance** (J+8)
6. **E4 — Email preuve** (J+10) → Second case study ou témoignage
7. **L3 — Message LinkedIn relance** (J+12)
8. **E5 — Email break-up** (J+15)

## Format de réponse

Pour chaque touchpoint, fournis :

```json
{
  "sequence": [
    {
      "id": "E1",
      "type": "email",
      "label": "Email initial",
      "timing": "J+0",
      "subType": "Description courte de l'angle",
      "subject": "Objet de l'email avec {{variables}}",
      "body": "Corps du message avec {{variables}}",
      "rationale": "En 1 phrase, pourquoi cet angle et cette structure"
    },
    {
      "id": "L1",
      "type": "linkedin",
      "label": "Note de connexion",
      "timing": "J+1",
      "subType": "Prise de contact",
      "subject": null,
      "body": "Message de max 300 caractères",
      "charCount": 245,
      "rationale": "Pourquoi cette approche"
    }
  ],
  "strategy_notes": "Résumé en 2-3 phrases de la stratégie globale de la séquence"
}
```
```

---

## Sub-Prompt 1 : Email Initial (E1)

> **Quand l'utiliser :** Génération isolée ou régénération du premier email de la séquence.

```
Tu génères le premier email d'une séquence de prospection B2B.

## Contexte
- Cible : {target_position} dans le secteur {target_sector}
- Taille : {target_size}
- Angle : {angle}
- Ton : {tone} · {formality}
- Longueur : {length}
- CTA : {cta_type}

## Proposition de valeur
{value_prop}

## Douleurs identifiées
{pain_points}

## Variables disponibles
{{firstName}}, {{lastName}}, {{companyName}}, {{jobTitle}}

## Règles spécifiques à E1
1. **L'email initial ne vend pas** — il ouvre une conversation
2. Le hook (première phrase) doit être une question ou une observation frappante
3. Le corps développe UNE seule idée, avec un chiffre concret si possible
4. Le CTA est une question ouverte (sauf instruction contraire)
5. Pas de "Je me permets de vous contacter" ou "Suite à mes recherches"
6. Pas de lien, pas de pièce jointe, pas de signature longue
7. Maximum {length} phrases pour le corps

## Angles possibles

### Douleur client
- Poser une question qui met le doigt sur un problème quotidien
- Exemple : "Combien d'heures par semaine votre équipe passe-t-elle sur [tâche répétitive] ?"

### Preuve sociale
- Mentionner un résultat concret obtenu avec un client similaire
- Exemple : "Le cabinet [nom] a réduit de 40% son temps de [processus]."

### Offre directe
- Aller droit au but avec la proposition de valeur
- Exemple : "Nous aidons des [cible] comme {{companyName}} à [résultat]."

### Curiosité
- Poser une question intrigante liée au secteur
- Exemple : "Savez-vous combien vous coûte réellement un [problème] chez {{companyName}} ?"

## Format de réponse
Fournis :
- **Objet** : l'objet de l'email (avec variables si pertinent)
- **Corps** : le texte complet du message
- **Rationale** : pourquoi cet angle et cette accroche (1 phrase)
```

---

## Sub-Prompt 2 : Email Valeur (E2)

> **Quand l'utiliser :** Génération isolée ou régénération de l'email de suivi avec preuve.

```
Tu génères un email de suivi (E2) pour une séquence de prospection B2B.
Cet email apporte une PREUVE CONCRÈTE pour crédibiliser la proposition de valeur.

## Contexte
- Cible : {target_position} dans le secteur {target_sector}
- Taille : {target_size}
- Ton : {tone} · {formality}
- Longueur : {length}

## Proposition de valeur
{value_prop}

## Preuve sociale disponible
{social_proof}

## Variables disponibles
{{firstName}}, {{lastName}}, {{companyName}}, {{jobTitle}}

## Règles spécifiques à E2
1. **Le "Re:" dans l'objet est un choix stratégique** — il simule un fil de conversation et booste l'ouverture (+10-15pts en moyenne)
2. L'email raconte un MINI CAS CLIENT en 3 temps : Situation → Action → Résultat
3. Les chiffres sont obligatoires — pas de "significativement amélioré" mais "40% de réduction"
4. Si aucun cas client disponible, utiliser une statistique sectorielle crédible
5. Le CTA fait le pont entre le cas et la situation du prospect : "Est-ce un sujet chez {{companyName}} ?"
6. Ne pas donner l'impression de relancer — c'est un NOUVEL apport de valeur
7. Maximum {length} phrases

## Structure type
```
[Transition douce — référence implicite au premier contact]

[Mini cas client : qui + quoi + résultat chiffré]

[Pont vers le prospect : question qui lie le cas à sa situation]
```

## Format de réponse
Fournis :
- **Objet** : avec "Re:" si stratégique
- **Corps** : le texte complet
- **Rationale** : pourquoi ce cas/angle (1 phrase)
```

---

## Sub-Prompt 3 : Email Relance (E3)

> **Quand l'utiliser :** Génération isolée ou régénération de l'email de relance à angle différent.

```
Tu génères un email de relance (E3) pour une séquence de prospection B2B.
Cet email change COMPLÈTEMENT d'angle par rapport aux messages précédents.

## Contexte
- Cible : {target_position} dans le secteur {target_sector}
- Taille : {target_size}
- Ton : {tone} · {formality}
- Longueur : {length}
- Angle utilisé dans E1 : {angle_e1}
- Angle utilisé dans E2 : {angle_e2}

## Proposition de valeur
{value_prop}

## Douleurs identifiées
{pain_points}

## Variables disponibles
{{firstName}}, {{lastName}}, {{companyName}}, {{jobTitle}}

## Règles spécifiques à E3
1. **Changer d'angle est OBLIGATOIRE** — si E1 parlait de douleur, E3 parle de gain (ou inversement)
2. Commencer par reconnaître le changement d'approche ("Je change d'approche" ou similaire)
3. Apporter un NOUVEAU type de valeur : chiffre, question provocante, angle sectoriel
4. Éviter l'angle anxiogène si la cible est sensible (ex: DAF → préférer gain de temps à coût de l'erreur)
5. Le CTA reste une question ou une ouverture douce
6. Maximum {length} phrases

## Changements d'angle possibles
| Si E1 utilisait... | E3 peut utiliser... |
|---------------------|---------------------|
| Douleur client | Gain de temps / ROI positif |
| Preuve sociale | Question provocante |
| Offre directe | Curiosité / chiffre sectoriel |
| Curiosité | Preuve sociale |

## Format de réponse
Fournis :
- **Objet** : différent des précédents
- **Corps** : le texte complet
- **Nouvel angle** : quel angle et pourquoi
- **Rationale** : pourquoi ce pivot (1 phrase)
```

---

## Sub-Prompt 4 : Email Break-up (E4)

> **Quand l'utiliser :** Génération isolée ou régénération du dernier email de la séquence.

```
Tu génères un email de break-up (E4) — le DERNIER message d'une séquence de prospection B2B.

## Contexte
- Cible : {target_position} dans le secteur {target_sector}
- Ton : {tone} · {formality}
- Proposition de valeur (résumé) : {value_prop_short}

## Variables disponibles
{{firstName}}, {{lastName}}, {{companyName}}

## Règles spécifiques à E4 — STRICTES
1. **MAXIMUM 3 lignes de texte** — c'est la règle la plus importante
2. **Jamais culpabilisant** — pas de "Dommage que...", "Je regrette que..."
3. **Ton respectueux et léger** — "Si ce n'est pas le bon moment, pas de souci"
4. **Laisser la porte ouverte** — mentionner une disponibilité future sans pression
5. **Pas de récapitulatif** — ne pas résumer les messages précédents
6. **Pas de dernière tentative de vente** — ce n'est pas un pitch final
7. Le bénéfice clé peut être mentionné en passant (1/2 phrase max)

## Structure type (3 lignes)
```
[Annonce que c'est le dernier message — ton léger]
[Porte ouverte — si un jour le sujet revient, je suis là]
[Souhait positif — "Bonne continuation"]
```

## Exemples de bons break-ups
✅ "{{firstName}}, dernier message de ma part. Si le timing n'est pas bon, aucun souci — mon agenda reste ouvert. Bonne continuation."

✅ "{{firstName}}, je ne veux pas encombrer votre boîte. Si un jour [bénéfice] vous intéresse, je suis là. Belle suite à vous."

## Exemples de mauvais break-ups
❌ "C'est dommage de ne pas avoir pu échanger..." (culpabilisant)
❌ "Dernière chance de profiter de..." (pression)
❌ [4+ phrases] (trop long)

## Format de réponse
Fournis :
- **Objet** : court et final
- **Corps** : 3 lignes maximum
- **Rationale** : 1 phrase
```

---

## Sub-Prompt 5 : LinkedIn — Note de Connexion (L1)

> **Quand l'utiliser :** Génération isolée ou régénération de la note accompagnant la demande de connexion LinkedIn.

```
Tu génères une note de connexion LinkedIn (L1) pour une campagne de prospection B2B.

## Contexte
- Cible : {target_position} dans le secteur {target_sector}
- Taille : {target_size}
- Zone : {target_zone}
- Ton : {tone} · {formality}

## Variables disponibles
{{firstName}}, {{lastName}}, {{companyName}}, {{jobTitle}}

## Règles spécifiques à L1 — CRITIQUES

### Limite de caractères
⚠️ **MAXIMUM 300 CARACTÈRES** — limite technique LinkedIn.
Compter les caractères APRÈS remplacement estimé des variables :
- {{firstName}} ≈ 8 chars
- {{companyName}} ≈ 15 chars
- {{jobTitle}} ≈ 20 chars

### Contenu
1. **JAMAIS de pitch** — la note de connexion n'est PAS un message commercial
2. **JAMAIS de lien** — les liens dans les notes de connexion réduisent le taux d'acceptation de ~15%
3. La note explique POURQUOI on veut se connecter, pas ce qu'on vend
4. Mentionner un point commun : secteur, zone géo, parcours, sujet d'intérêt
5. Finir par une note positive : "ravi d'échanger", "votre profil m'a interpellé"

### Ce qui fonctionne (data Bakal)
- Compliment sur le parcours/expertise + positionnement sectoriel → ~38% acceptation
- Mention de la zone géographique commune → +5pts acceptation
- Note vide (pas de message) → ~22% acceptation (à éviter)

## Structure type
```
{{firstName}}, [observation/compliment sur le parcours ou le secteur]. [Positionnement : ce que je fais dans ce secteur]. [Envie d'échanger].
```

## Format de réponse
Fournis :
- **Message** : texte complet
- **Nombre de caractères** : comptage précis
- **Rationale** : pourquoi cette approche (1 phrase)
```

---

## Sub-Prompt 6 : LinkedIn — Message Post-Connexion (L2)

> **Quand l'utiliser :** Génération isolée ou régénération du message envoyé après que le prospect a accepté la connexion.

```
Tu génères un message LinkedIn post-connexion (L2) pour une campagne de prospection B2B.
Ce message est envoyé APRÈS que le prospect a accepté la demande de connexion.

## Contexte
- Cible : {target_position} dans le secteur {target_sector}
- Taille : {target_size}
- Angle : {angle}
- Ton : {tone} · {formality}
- CTA : {cta_type}

## Proposition de valeur
{value_prop}

## Preuve sociale
{social_proof}

## Variables disponibles
{{firstName}}, {{lastName}}, {{companyName}}, {{jobTitle}}

## Règles spécifiques à L2
1. **Commencer par remercier** — "Merci d'avoir accepté, {{firstName}} !"
2. **Ton conversationnel** — on est sur LinkedIn, pas dans un email formel
3. **UNE seule idée** — pas de pavé avec 3 arguments
4. **Le CTA est une question ouverte** — jamais "Avez-vous 15 min ?" en premier message
5. Le message fait 3-4 phrases max
6. Pas de lien, pas de PDF, pas d'invitation directe à un call
7. La preuve sociale doit être SPÉCIFIQUE — "3 organismes de formation" est mieux que "plusieurs entreprises"

### Ce qui fonctionne (data Bakal)
- Angle douleur client → meilleur taux de réponse (+1.5-2pts vs preuve sociale)
- Question spécifique au secteur > question générique
- Mention de résultats chiffrés avec des fourchettes → crédibilité

### Ce qui ne fonctionne PAS
- "J'ai vu que vous étiez..." (trop stalker)
- Pitcher directement un produit/service
- Envoyer un lien vers un calendrier

## Structure type
```
Merci d'avoir accepté, {{firstName}} !

[1-2 phrases : contexte / preuve / observation]

[Question ouverte liée à leur quotidien]
```

## Format de réponse
Fournis :
- **Message** : texte complet
- **Rationale** : pourquoi cet angle (1 phrase)
```

---

## Sub-Prompt 7 : Objets d'Email (Subject Lines)

> **Quand l'utiliser :** Génération d'objets d'email optimisés, y compris des variantes A/B pour le refinement.

```
Tu génères des objets d'email optimisés pour une campagne de prospection B2B.

## Contexte
- Cible : {target_position} dans le secteur {target_sector}
- Ton : {tone} · {formality}
- Langue : {language}

## Emails de la séquence
{liste des emails avec leur id, label et corps}

## Variables disponibles
{{firstName}}, {{lastName}}, {{companyName}}, {{jobTitle}}

## Règles spécifiques aux objets d'email

### Longueur
- **Idéal : 4-7 mots** — les objets courts surperforment
- Maximum 50 caractères (affichage mobile)
- Jamais de phrase complète — c'est un teaser, pas un résumé

### Contenu
1. **{{firstName}} dans l'objet** — booste l'ouverture de 5-10pts (mais pas systématiquement sur chaque email, max 2 sur 4)
2. **Pas de majuscules agressives** — "URGENT" ou "OFFRE" = spam
3. **Pas de ponctuation excessive** — 1 point d'interrogation max, jamais de "!!!"
4. **Pas de mots spam** — gratuit, offre, promo, urgent, dernière chance, exceptionnel
5. **Le "Re:" est un choix délibéré** — utilisé UNIQUEMENT sur E2 pour simuler un fil (booste l'ouverture de +10-15pts)

### Patterns qui fonctionnent (data Bakal)
| Pattern | Ouverture moyenne | Exemple |
|---------|-------------------|---------|
| Prénom + question | 65% | "{{firstName}}, une question sur [sujet]" |
| Sujet spécifique | 60% | "Gestion financière chez {{companyName}}" |
| "Re:" + contexte | 72% | "Re: gestion financière — un cas concret" |
| Relance sobre | 55% | "Autre approche, {{firstName}}" |
| Break-up direct | 48% | "Dernière tentative, {{firstName}}" |

### Variantes A/B
Quand demandé, générer 2 variantes par email avec des hypothèses claires :
- **Variante A** : approche par défaut
- **Variante B** : test d'un angle différent (question vs affirmation, avec/sans prénom, court vs descriptif)
- **Hypothèse** : en 1 phrase, ce que le test va valider

## Format de réponse

```json
{
  "subjects": [
    {
      "emailId": "E1",
      "variantA": "{{firstName}}, une question sur votre [sujet]",
      "variantB": "Question rapide sur [sujet]",
      "hypothesis": "Test: personnalisation (prénom) vs curiosité (pas de prénom)"
    }
  ]
}
```
```

---

## Exemples de séquences générées

### Exemple 1 : DAF Île-de-France (Email, Douleur client, Pro décontracté)

**E1 — Email initial (J+0)**
- Objet : `{{firstName}}, une question sur votre gestion financière`
- Corps :
  ```
  Bonjour {{firstName}},

  Combien d'heures par semaine votre équipe passe-t-elle sur des tâches qui pourraient être automatisées ?

  Chez {{companyName}}, les cabinets comme le vôtre gagnent en moyenne 12h/semaine en digitalisant trois processus clés.

  Quel est votre plus gros frein opérationnel en ce moment ?
  ```

**E2 — Email valeur (J+3)**
- Objet : `Re: gestion financière — un cas concret`
- Corps :
  ```
  {{firstName}}, je me permets de revenir avec un exemple concret.

  Le cabinet Nexia Conseil (35 personnes, secteur similaire) a réduit de 40% le temps de reporting mensuel en automatisant la collecte de données.

  Résultat : 2 jours récupérés chaque mois pour du conseil à valeur ajoutée.

  Est-ce que c'est un sujet chez {{companyName}} ?
  ```

**E3 — Email relance (J+7)**
- Objet : `Autre approche, {{firstName}}`
- Corps :
  ```
  {{firstName}}, je change d'approche.

  Si vous pouviez récupérer une journée par semaine sur les tâches administratives, qu'en feriez-vous ?

  Pour les cabinets de votre taille, nos clients investissent ce temps gagné dans le conseil stratégique — leur activité la plus rentable.
  ```

**E4 — Email break-up (J+12)**
- Objet : `Dernière tentative, {{firstName}}`
- Corps :
  ```
  {{firstName}}, dernier message de ma part.

  Si le timing n'est pas bon, aucun souci — mon agenda reste ouvert si le sujet devient prioritaire.

  Bonne continuation.
  ```

---

### Exemple 2 : Dirigeants Formation (LinkedIn, Preuve sociale, Pro décontracté)

**L1 — Note de connexion (J+0)**
- Message : `{{firstName}}, votre parcours dans la formation m'a interpellé. J'accompagne des dirigeants du secteur sur la croissance commerciale — je serais ravi d'échanger avec vous.`
- Caractères : ~185 (OK)

**L2 — Message post-connexion (J+3)**
- Message :
  ```
  Merci d'avoir accepté, {{firstName}} !

  J'ai accompagné 3 organismes de formation comme le vôtre à générer entre 5 et 12 RDV qualifiés par mois.

  Curieux de savoir comment vous gérez votre développement commercial actuellement ?
  ```

---

### Exemple 3 : DRH PME Lyon (Multi-canal, Offre directe, Formel)

**E1 — Email initial (J+0)**
- Objet : `{{firstName}}, une solution concrète pour vos recrutements`
- Corps :
  ```
  Bonjour {{firstName}},

  Nous aidons des DRH de PME comme {{companyName}} à réduire de 40% leur temps de recrutement grâce à une méthode structurée d'approche directe.

  Quel est votre plus gros défi recrutement en ce moment ?
  ```

**L1 — Note de connexion (J+1)**
- Message : `{{firstName}}, votre expertise RH chez {{companyName}} m'a interpellé. J'échange régulièrement avec des DRH de PME lyonnaises — je serais ravi de vous compter dans mon réseau.`
- Caractères : ~195 (OK)

---

## Intégration dans le flux technique

### Appel via N8N (Workflow 2 — Régénération)

```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 4096,
  "messages": [
    {
      "role": "user",
      "content": "[Master Prompt ou Sub-Prompt injecté ici avec les paramètres remplis]"
    }
  ]
}
```

### Appel direct via Claude API

```python
import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,
    messages=[
        {
            "role": "user",
            "content": master_prompt.format(
                company_name="FormaPro Consulting",
                target_sector="Comptabilité & Finance",
                target_position="DAF",
                # ... autres paramètres
            )
        }
    ]
)

sequence = message.content[0].text
```

### Stockage dans Notion

Les séquences générées sont stockées dans la base **Campagnes — Historique Versions** avec :
- Le numéro de version
- Les messages modifiés
- Les hypothèses testées
- Le résultat après mesure (En cours / Amélioré / Dégradé / Neutre)

---

## Compatibilité avec le Générateur de Variables

Quand `personalization_level` = "Enrichi", les variables custom du [Générateur de Variables](bakal-variable-generator-prompt.md) sont ajoutées aux variables disponibles dans chaque prompt.

Exemple avec variables enrichies :
```
## Variables disponibles
- {{firstName}}, {{lastName}}, {{companyName}}, {{jobTitle}} (Lemlist standard)
- {{beerName}} (base — scrapée du site web)
- {{microbioProblem}} (enrichie — déduite par IA)
- {{brewerIcebreaker}} (dérivée — icebreaker combiné)
```

Le Master Prompt intègre alors automatiquement les icebreakers dans les hooks de E1 et L2.

---

*Ce document fait partie de l'architecture de prompts Bakal. Voir aussi : [bakal-refinement-system.md](bakal-refinement-system.md) (boucle d'optimisation) et [bakal-variable-generator-prompt.md](bakal-variable-generator-prompt.md) (variables enrichies).*
