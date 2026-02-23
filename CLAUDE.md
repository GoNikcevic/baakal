# CLAUDE.md — Bakal Project Briefing

> **Purpose:** This document provides full context for Claude Code to work on the Bakal project. Read this first before any task.

---

## 🎯 Project Overview

**Bakal** is a B2B prospecting automation service (done-for-you model) that combines:
- Multi-channel outreach (Email + LinkedIn)
- AI-generated personalized copy
- Automated performance optimization through a refinement loop

**Business Model:** Agency-style service at €350/month + €250 setup (pilot offer)

**Target Market:** SMB owners/directors who need leads but lack time/expertise to prospect

---

## 👥 Team Context

- 2-3 co-founders, no formal company structure yet (planned within 1 year)
- Payments via individual billing + retrocession between partners
- Primary developer: Goran

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         BAKAL SYSTEM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   LEMLIST    │───▶│     N8N      │───▶│   CLAUDE     │      │
│  │  (Campaigns) │    │  (Workflows) │    │   (AI/Copy)  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         │                   ▼                   │               │
│         │            ┌──────────────┐           │               │
│         └───────────▶│   NOTION     │◀──────────┘               │
│                      │  (Hub/Data)  │                           │
│                      └──────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Tech Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| Email/LinkedIn Automation | **Lemlist** | Campaign execution, sequence management, stats collection |
| Workflow Automation | **N8N** | Orchestration between tools, scheduled jobs, API calls |
| AI Generation | **Claude API** | Copy generation, performance analysis, optimization |
| Business Hub | **Notion** | Client management, campaign tracking, knowledge base |
| Landing Page | **Static HTML** | Client-facing marketing site |

---

## 📁 Project File Structure

```
/docs/
  bakal-prompt-system.md      # Complete prompt architecture for copy generation
  bakal-refinement-system.md  # Auto-optimization loop (analysis → regeneration)
  
/landing/
  bakal-landing-page.html       # Dark theme (English)
  bakal-landing-page-light.html # Light theme (English + French versions exist)

/CLAUDE.md                    # This file
```

---

## 📝 Prompt System Architecture

The copy generation system uses a **1 Master Prompt + 7 Sub-Prompts** architecture:

### Master Prompt
Generates complete multi-channel sequences based on client parameters:
- Style params: tone, formality (tu/vous), length, language
- Sequence params: touchpoints (4-8), channels, angle, CTA type, personalization level
- Client params: company info, target sector, decision-maker function, value prop, pain points, social proof

### Sub-Prompts (specialized)
1. **Email Initial** — First contact, hook-focused
2. **Email Value** — Follow-up with proof/case study
3. **Email Relance** — Different angle retry
4. **Email Break-up** — Final message, soft close
5. **LinkedIn Connection Note** — Max 300 chars, no pitch
6. **LinkedIn Message** — Post-connection, conversational
7. **Subject Lines** — A/B variants for all emails

### Lemlist Variables
These are preserved as-is in generated copy:
- `{{firstName}}`, `{{lastName}}`, `{{companyName}}`, `{{jobTitle}}`

---

## 🔄 Refinement System (Auto-Optimization Loop)

### The Loop
```
Lemlist (stats) → N8N → Claude (analyze) → Claude (regenerate) → N8N → Lemlist (deploy)
```

### Three Core Prompts

1. **Performance Analysis Prompt**
   - Input: Campaign stats (open rates, reply rates, acceptance rates)
   - Output: Structured diagnostic with priorities and regeneration instructions
   - Benchmarks: Open >50% good, Reply >5% good, LinkedIn accept >30% good

2. **Regeneration Prompt**
   - Input: Diagnostic + original messages + cross-campaign memory
   - Output: Optimized versions + A/B variants with clear hypotheses

3. **Cross-Campaign Memory Prompt**
   - Input: All diagnostics from period + existing memory
   - Output: Pattern library (what works by sector/target/message type)
   - Confidence levels: High (>200 prospects), Medium (50-200), Low (<50)

### N8N Workflows

**Workflow 1: Stats Collection (daily @ 8am)**
- Fetch active campaigns from Lemlist API
- Calculate per-touchpoint metrics
- Store in Notion "Campagnes — Résultats"
- Trigger analysis if campaign >50 prospects AND >7 days old

**Workflow 2: Regeneration + Deployment**
- Triggered by Workflow 1 when optimization needed
- Reads original messages + memory from Notion
- Calls Claude for regeneration
- Updates Lemlist sequences with A/B variants

**Workflow 3: Memory Consolidation (monthly)**
- Aggregates all monthly diagnostics
- Updates "Mémoire Cross-Campagne" in Notion

---

## 📊 Notion Database Structure

### Base 1: Campagnes — Résultats
| Property | Type |
|----------|------|
| Nom campagne | Title |
| Client | Relation |
| Date collecte | Date |
| Statut | Select (Active/Terminée/En optimisation) |
| Nb prospects | Number |
| Open rate E1-E4 | Number |
| Reply rate E1-E4 | Number |
| Accept rate LK | Number |
| Reply rate LK | Number |

### Base 2: Campagnes — Diagnostics
| Property | Type |
|----------|------|
| Campagne | Relation |
| Date analyse | Date |
| Diagnostic | Rich text |
| Priorités | Multi-select |
| Nb messages à optimiser | Number |

### Base 3: Campagnes — Historique Versions
| Property | Type |
|----------|------|
| Campagne | Relation |
| Version | Number |
| Date | Date |
| Messages modifiés | Multi-select |
| Hypothèses testées | Text |
| Résultat | Select (En cours/Amélioré/Dégradé/Neutre) |

### Base 4: Mémoire Cross-Campagne
| Property | Type |
|----------|------|
| Catégorie | Select (Objets/Corps/Timing/LinkedIn/Secteur/Cible) |
| Pattern | Title |
| Données | Text |
| Confiance | Select (Haute/Moyenne/Faible) |
| Date découverte | Date |
| Secteur | Multi-select |
| Cible | Multi-select |

---

## 🚀 Implementation Phases

| Phase | Timeline | Scope |
|-------|----------|-------|
| **Phase 1 — Manual** | Now | Use prompts manually, copy stats from Lemlist, apply recommendations by hand |
| **Phase 2 — Semi-auto** | Months 2-3 | N8N automates stats collection + analysis, human validates before deployment |
| **Phase 3 — Full auto** | Months 4-5 | Complete loop automated, human oversight for edge cases only |

**Current Status:** Phase 1 (documentation complete, ready for implementation)

---

## 🔑 Key Design Decisions

1. **Why Lemlist?** — Best-in-class for multi-channel sequences, good API, handles deliverability
2. **Why N8N over Zapier?** — Self-hostable, more complex logic support, better for AI integrations
3. **Why Notion as hub?** — Client already uses it, good API, flexible schema, serves as visible "control center"
4. **Why not pay-per-lead?** — Lead value varies wildly by sector; flat fee simpler and more predictable
5. **Why 60-day pilot?** — Enough time to run optimization cycles, not so long that bad fit clients are stuck

---

## 🛠️ Development Priorities

When building the platform:

1. **Start with Workflow 1** — Stats collection is foundation for everything
2. **Notion structure first** — Databases need to exist before workflows can write to them
3. **Test analysis prompt manually** — Validate diagnostic quality before automating
4. **A/B testing infrastructure** — Ensure Lemlist setup supports variant deployment
5. **Monitoring/alerts** — Know when campaigns need attention before clients notice

---

## 📐 Landing Page Notes

- Two themes exist: dark (Outfit font, gradient accents) and light (DM Sans, cleaner)
- Both available in French and English
- Key sections: Hero → Pain points → How it works → What's included → Pricing → Testimonials → FAQ → CTA
- Pricing displayed: €350/month + €250 setup, 2-month commitment
- CTA links to Calendly (placeholder URL needs replacement)

---

## ⚠️ Important Constraints

- **Never mention "AI" or "automated"** in prospect-facing copy — maintain human feel
- **Respect Lemlist rate limits** when building N8N workflows
- **LinkedIn connection notes max 300 chars** — hard platform limit
- **Cross-campaign memory requires volume** — patterns only reliable with >50 prospects per test
- **Break-up emails always short** — 3-4 lines max, never guilt-trip

---

## 🔗 API Endpoints Reference

### Lemlist API
- Base: `https://api.lemlist.com/api`
- Auth: API key in header
- Key endpoints:
  - `GET /campaigns` — List campaigns
  - `GET /campaigns/{id}/export` — Stats export
  - `PATCH /campaigns/{id}/sequences` — Update sequences

### Claude API
- Base: `https://api.anthropic.com/v1`
- Endpoint: `POST /messages`
- Model: Use latest available (claude-3-opus or claude-3-sonnet)

### Notion API
- Base: `https://api.notion.com/v1`
- Auth: Bearer token
- Key endpoints:
  - `POST /databases/{id}/query` — Read database
  - `POST /pages` — Create entry
  - `PATCH /pages/{id}` — Update entry

---

## 💬 Communication Style

When generating copy for Bakal clients:
- **Default tone:** Conversational but professional
- **Default formality:** "vous" (French) / formal "you" (English)
- **Avoid:** Corporate jargon, aggressive sales tactics, spam patterns
- **Embrace:** Direct value statements, specific numbers, conversational questions

---

## 📎 Quick Reference Commands

```bash
# Common tasks you might be asked to do:

# 1. Generate a new campaign sequence
→ Use Master Prompt from bakal-prompt-system.md with client params

# 2. Analyze campaign performance
→ Use Analysis Prompt from bakal-refinement-system.md with stats

# 3. Regenerate underperforming messages
→ Use Regeneration Prompt with diagnostic + originals

# 4. Update landing page
→ Edit bakal-landing-page.html (dark) or bakal-landing-page-light.html

# 5. Extend Notion structure
→ Follow schema patterns from refinement-system.md
```

---

*Last updated: February 2026*
*For questions about project history, check conversation context or ask Goran.*
