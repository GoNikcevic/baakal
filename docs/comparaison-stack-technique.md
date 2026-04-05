# Baakal — Comparaison Stack Technique

**Date :** 23 mars 2026

---

## Stack actuelle Baakal

| Service | Rôle | Coût actuel | Scalable | Zone |
|---|---|---|---|---|
| **Railway** | Hébergement backend + frontend (Docker) | ~$5/mois | Auto-scale | EU (Pays-Bas) |
| **Supabase** | Base de données PostgreSQL | Gratuit (500MB) | Oui ($25/mois Pro) | EU (Frankfurt) |
| **Cloudflare R2** | Stockage fichiers (PDFs, docs) | Gratuit (10GB) | Illimité | EU (configuré) |
| **Resend** | Emails transactionnels | Gratuit (100/jour) | $20/mois | US |
| **Anthropic API** | IA (Claude) — génération, analyse, scoring | ~$0.04/campagne | Pay-as-you-go | US (API) |
| **GitHub** | Code source, versioning, CI | Gratuit | — | US |
| **OVH** | Nom de domaine | ~10€/an | — | FR |

**Coût total : ~$5-10/mois** jusqu'à 1000 utilisateurs.

---

## 1. Hébergement Cloud — Comparaison

| Critère | Railway (notre choix) | Render | Vercel + Neon | AWS | OVH VPS |
|---|---|---|---|---|---|
| **Coût démarrage** | ~$5/mois | $7/mois | $20/mois | ~$20-50/mois | ~5€/mois |
| **Coût à 1000 users** | ~$20/mois | ~$25/mois | ~$40/mois | ~$50-100/mois | ~15€/mois |
| **Auto-scaling** | ✅ Automatique | ⚠️ Manuel | ✅ Serverless | ✅ Complexe à configurer | ❌ Manuel |
| **Simplicité** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| **Docker support** | ✅ | ✅ | ❌ (serverless) | ✅ | ✅ |
| **EU disponible** | ✅ | ✅ | ✅ | ✅ | ✅ (France) |
| **Temps de setup** | 5 min | 10 min | 20 min | 2-4h | 1-2h |
| **DevOps requis** | Non | Non | Non | Oui | Oui |

**Verdict :** Railway est optimal pour un early-stage SaaS. Simple, pas cher, auto-scale, zéro DevOps.

---

## 2. Base de données — Comparaison

| Critère | Supabase (notre choix) | PlanetScale | Neon | MongoDB Atlas | AWS RDS |
|---|---|---|---|---|---|
| **Type** | PostgreSQL | MySQL | PostgreSQL | NoSQL (documents) | PostgreSQL/MySQL |
| **Gratuit** | 500MB | ❌ (supprimé) | 512MB | 512MB | 12 mois seulement |
| **Pro** | $25/mois (8GB) | $29/mois | $19/mois | $57/mois | ~$30/mois |
| **Dashboard visuel** | ✅ Excellent | ✅ | ✅ | ✅ | ❌ CLI seulement |
| **SQL Editor intégré** | ✅ | ✅ | ✅ | ❌ (NoSQL) | ❌ |
| **Auth intégrée** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Realtime** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **EU** | ✅ Frankfurt | ✅ | ✅ | ✅ | ✅ |
| **Facilité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

**Verdict :** Supabase est le meilleur choix. PostgreSQL standard (pas de vendor lock-in), dashboard intuitif, gratuit pour le MVP, EU natif.

---

## 3. Support technique

| Service | Support gratuit | Support payant | Documentation | Communauté |
|---|---|---|---|---|
| **Railway** | Discord (réactif) | Email ($20+/mois) | ⭐⭐ Bonne | Moyenne |
| **Supabase** | Discord + GitHub | Email ($25+/mois) | ⭐⭐⭐ Excellente | Très active |
| **Cloudflare** | Forums | Business plan | ⭐⭐⭐ Excellente | Très active |
| **Anthropic** | Discord | Aucun (docs) | ⭐⭐⭐ Excellente | Active |

---

## 4. Capacités d'hébergement

| Capacité | Railway | Vercel | AWS | OVH |
|---|---|---|---|---|
| **Site statique** | ✅ | ✅ (optimisé CDN) | ✅ (S3 + CloudFront) | ✅ |
| **Site dynamique / API** | ✅ (Docker) | ✅ (serverless) | ✅ (EC2/ECS/Lambda) | ✅ (VPS) |
| **WebSockets** | ✅ | ❌ (limité) | ✅ | ✅ |
| **Cron jobs** | ✅ (in-process) | ✅ (Vercel Cron) | ✅ (CloudWatch) | ✅ (crontab) |
| **Héberger un LLM** | ❌ Pas de GPU | ❌ | ✅ (SageMaker, $200+/mois) | ❌ |

**Note sur le LLM :** Nous n'hébergeons pas de LLM. Nous utilisons l'API Claude (Anthropic) en pay-as-you-go à ~$0.04 par campagne. Héberger un LLM open-source (Llama, Mistral) nécessiterait un GPU dédié ($200-2000/mois) — 100x plus cher pour notre usage.

---

## 5. Zones de stockage des données

| Service | Zone | Localisation |
|---|---|---|
| **Railway** | `europe-west4` | Pays-Bas 🇳🇱 |
| **Supabase** | `eu-central-1` | Frankfurt, Allemagne 🇩🇪 |
| **Cloudflare R2** | EU jurisdiction | Union Européenne 🇪🇺 |
| **Resend** | US | États-Unis 🇺🇸 |
| **Anthropic API** | US (traitement uniquement) | Données non stockées par Anthropic |

**Toutes les données utilisateur sont en EU.** Les appels à Claude transitent par les US mais Anthropic ne stocke pas les données API (Zero Data Retention Policy).

---

## 6. Conformité RGPD

| Aspect | Status | Action requise |
|---|---|---|
| Données stockées en EU | ✅ | — |
| Chiffrement au repos | ✅ (Supabase + R2) | — |
| Chiffrement en transit (HTTPS) | ✅ | — |
| Clés API utilisateurs chiffrées | ✅ (AES) | — |
| Passwords hashés | ✅ (bcrypt 10 rounds) | — |
| JWT + refresh tokens | ✅ | — |
| Droit à l'effacement | ⚠️ À implémenter | Endpoint DELETE /account |
| DPA sous-traitants | ⚠️ À signer | Supabase, Railway, Anthropic |
| CGU / Mentions légales | ❌ À rédiger | Juriste ou template adapté |
| Registre de traitements | ❌ À créer | Document interne |

---

## 7. Stack technique requise

### Notre stack (JavaScript full-stack)

| Technologie | Rôle | Niveau requis |
|---|---|---|
| **JavaScript / Node.js** | Backend (Express) + logique métier | Intermédiaire |
| **React** | Frontend (SPA) | Intermédiaire |
| **PostgreSQL** | Base de données (SQL) | Basique |
| **Git / GitHub** | Versioning + déploiement | Basique |
| **Docker** | Conteneurisation (Railway le gère) | Minimal |
| **HTML / CSS** | Interface | Basique |

**Avantage clé :** Un seul langage (JavaScript) pour tout le stack — facilite le recrutement et la maintenance.

### Comparaison des stacks alternatives

| Stack | Complexité | Maintenabilité | Scalabilité | Sécurité | Recrutement |
|---|---|---|---|---|---|
| **Node.js + React + PostgreSQL** (nous) | ⭐⭐ Simple | ⭐⭐⭐ Très bonne | ⭐⭐⭐ Bonne | ⭐⭐ Bonne | ⭐⭐⭐ Facile |
| **Python (Django) + React + PostgreSQL** | ⭐⭐ Simple | ⭐⭐⭐ Très bonne | ⭐⭐ Bonne | ⭐⭐⭐ Très bonne | ⭐⭐⭐ Facile |
| **Next.js full-stack + Vercel** | ⭐ Très simple | ⭐⭐ Bonne | ⭐⭐⭐ Bonne | ⭐⭐ Bonne | ⭐⭐⭐ Facile |
| **Go + React + PostgreSQL** | ⭐⭐⭐ Moyen | ⭐⭐ Bonne | ⭐⭐⭐⭐ Excellente | ⭐⭐⭐ Très bonne | ⭐⭐ Moyen |
| **Java (Spring) + React + PostgreSQL** | ⭐⭐⭐⭐ Complexe | ⭐⭐⭐ Bonne | ⭐⭐⭐⭐ Excellente | ⭐⭐⭐⭐ Excellente | ⭐⭐ Moyen |

---

## 8. Recommandation finale

### Pourquoi notre stack est la bonne pour Baakal en 2026

1. **Coût quasi-nul** (~$5-10/mois) jusqu'à 1000 utilisateurs payants
2. **Un seul langage** (JavaScript) — itération rapide, maintenance simple
3. **Données en EU** — conformité RGPD native
4. **Auto-scalable** — pas besoin de DevOps ou d'ingénieur infra
5. **Pas de vendor lock-in** — PostgreSQL standard, Docker standard, on peut migrer en 1 jour
6. **API Claude pay-as-you-go** — pas de GPU, pas de coût fixe pour l'IA

### Ce qu'on changerait si on reconstruisait de zéro

Rien. La stack est adaptée au stade du produit. Les optimisations viendront naturellement :
- **À 1000+ users** : ajouter Redis pour le cache + rate limiting distribué
- **À 5000+ users** : séparer frontend (Vercel/CDN) du backend (Railway)
- **À 10 000+ users** : considérer AWS/GCP pour le clustering + load balancing

### Ce qu'on ne ferait PAS

- ❌ Héberger notre propre LLM (trop cher, Claude API suffit)
- ❌ Migrer vers AWS maintenant (trop complexe pour 2 personnes)
- ❌ Utiliser un framework exotique (Go, Rust, Elixir) — le pool de développeurs JS est 10x plus grand
- ❌ Ajouter des services payants prématurément (on maximise les free tiers)

---

*Document rédigé le 23 mars 2026 — Baakal*
