# baakalai — Pitch (Avril 2026)

## En une phrase

baakalai est le moteur de prospection qui s'affine tout seul — et qui gere aussi vos clients existants.

---

## Le probleme

Les equipes commerciales PME utilisent 5 a 8 outils deconnectes : un pour trouver des prospects, un autre pour envoyer des emails, un autre pour le CRM, un autre pour les relances. Aucun outil ne connecte la prospection a la retention client. Quand un deal se conclut, la gestion de la relation repart de zero dans un autre outil.

---

## Ce que fait baakalai

### Prospection (trouver de nouveaux clients)
- Discutez avec l'IA pour creer des campagnes — decrivez votre cible, baakalai genere la sequence complete
- Multi-canal : email + LinkedIn, avec branches conditionnelles (si ouvert → A, si non → B)
- Deploiement direct vers Lemlist ou Apollo
- A/B testing avec affinage automatique — baakalai apprend ce qui marche
- 200 prospects par recherche, memoire cross-campagne

### Activation (developper les clients existants)
- Importez vos contacts depuis Pipedrive, HubSpot, Salesforce ou Odoo
- 8 triggers automatiques : deal gagne, deal stagnant, contact inactif, deal perdu, check onboarding, rappel renouvellement, opportunite upsell, demande de feedback
- L'IA genere des emails personnalises pour chaque contact — pas des templates, de vrais messages 1-to-1
- Les emails partent depuis votre propre boite mail (Gmail/Outlook via SMTP) — le destinataire ne voit aucune difference
- Analyse des reponses : l'IA lit les activites CRM, detecte le sentiment (positif/negatif/demande de RDV), met a jour le statut du contact automatiquement
- Nettoyage de donnees : doublons, champs manquants, emails invalides, contacts inactifs (score /100)

### Intelligence (s'ameliore avec le temps)
- 4 agents autonomes tournent chaque jour : Prospection, CRM, Memoire, Reporting
- Memoire cross-campagne : les patterns des campagnes reussies alimentent les futures
- Scoring d'efficacite des triggers : quels declencheurs produisent le plus de reponses positives
- Les donnees CRM (taux de conversion, cycle de vente, seuil de stagnation) alimentent la memoire et influencent la generation des emails
- Rapports hebdomadaires avec recommandations IA

---

## Comparaison avec les agences

| | Agence (SalesCaptain, GTM Studio) | baakalai |
|---|---|---|
| Cout | 30 000 a 140 000 EUR pour 4-7 mois | 75$/user/mois (~2 700 EUR/an pour 3 users) |
| Apres la fin du contrat | Rien conserve (domaines supprimes, pas de docs) | Tout reste (donnees, patterns, sequences, memoire) |
| Apprentissage | L'agence apprend, pas vous | Votre IA apprend, votre equipe monte en competence |
| Perimetre | Outbound uniquement | Outbound + activation client + gestion CRM |
| Dependance | Totalement dependant de l'agence | Autonome des le jour 1 |

## Comparaison avec les outils (Lemlist, Apollo, HubSpot)

| | Outils individuels | baakalai |
|---|---|---|
| Mise en place | Configurer chaque outil separement | Une conversation chat, l'IA fait le reste |
| Intelligence | A/B testing manuel, pas d'apprentissage cross-campagne | Affinage automatique, memoire entre toutes les campagnes |
| Activation client | Non couverte (le CRM est separe) | Integre : triggers, emails personnalises, analyse des reponses |
| Integration | Vous construisez le workflow | baakalai orchestre Lemlist + Apollo + Pipedrive + Odoo nativement |

---

## Integrations

**Outreach** : Lemlist, Apollo, Instantly, Smartlead, La Growth Machine, Waalaxy
**CRM** : Pipedrive, HubSpot, Salesforce, Odoo, Notion, Airtable
**Enrichissement** : Apollo, Brave Search (agent de recherche web)
**Email** : Gmail, Outlook, OVH (tout SMTP)

---

## Mode equipe

Jusqu'a 5 membres par equipe. Roles :
- **Admin** : acces complet + gestion equipe
- **Prospection** : campagnes, prospects, recherche
- **Activation** : clients, triggers, CRM, emails
- **Viewer** : lecture seule

Cles CRM partagees, chat partage, transfert automatique (deal gagne → passe de l'equipe prospection a l'equipe activation).

---

## Tarification

**75$/user/mois**. Pas de frais de setup, pas de commission, annulation a tout moment. Tout est conserve apres annulation.

---

## ICP (client ideal)

Dirigeants et directeurs commerciaux de PME (1-50 employes) qui :
- Ont besoin de leads mais n'ont pas le temps de gerer l'outbound manuellement
- Utilisent deja un CRM (Pipedrive, HubSpot) mais ne l'exploitent pas pour la retention
- Depensent 500 a 5 000 EUR/mois en outils de vente deconnectes
- Veulent que l'IA gere le travail repetitif pendant qu'ils se concentrent sur le closing

---

## Etat actuel (Avril 2026)

- En production sur baakal.ai (Railway)
- 1 beta testeur actif (campagne BforCure, 83 prospects, stats en temps reel)
- Integration complete Lemlist + Apollo + Pipedrive + Odoo
- Brand v6 deploye (theme clair, Geist font, accents violets)
- 4 agents autonomes operationnels
- Mode equipe, triggers d'activation, nettoyage CRM, analyse des reponses — tout construit
- Boucle memoire fermee : CRM → patterns → emails → analyse → patterns
