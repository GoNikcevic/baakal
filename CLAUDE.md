# CLAUDE.md — Baakalai Project Briefing

> **Purpose:** This document provides full context for any AI assistant (Claude Code, Claude Chat, Cowork, etc.) to work on Baakalai. Read this first before any task.

---

## 1. What is Baakalai

baakalai orchestre votre prospection et votre relation client avec l'IA. Il génère des séquences personnalisées, les déploie sur vos outils existants, et gère vos clients dans votre CRM — détection des deals stagnants, relance des contacts inactifs, upsell au bon moment. Chaque email envoyé, chaque réponse analysée, chaque deal conclu nourrit une mémoire collective qui apprend quel angle fonctionne, quel timing convertit, et quelle approche décroche un rendez-vous.

- **Prospection** : Create campaigns via AI chat, generate sequences (email + LinkedIn), deploy to Lemlist/Apollo, A/B test, refine automatically
- **Activation (CRM)** : Import contacts from Pipedrive/HubSpot/Odoo, detect stagnant deals/churn risk, send personalized follow-up emails via user's own SMTP, analyze responses
- **Intelligence** : 4 autonomous AI agents (Prospection, CRM, Memory, Reporting) + 9 pattern sources that learn from every campaign and every CRM interaction

Pricing: $75/user/month. Team plan: up to 5 members with roles (admin, prospection, activation, viewer).

## 2. Tech Stack

- **Frontend** : React 19 + Vite 7 + React Router 7
- **Backend** : Node.js + Express + PostgreSQL (Supabase)
- **AI** : Claude API (Anthropic) with hybrid Sonnet/Opus routing + prompt caching
- **Deployment** : Railway (auto-deploy from GitHub main branch)
- **Email** : Resend (system emails), nodemailer/SMTP (user emails for activation)
- **Fonts** : Geist + Geist Mono (brand v6)
- **Theme** : Light-first, purple/lavender accents (#6E57FA primary)

## 3. Integrations

| Tool | Type | Status | What it does |
|------|------|--------|-------------|
| Lemlist | Outreach | Production | Campaign deployment, stats sync (v2 API), activities, conditional sequences |
| Apollo | Outreach + Enrichment | Production | Prospect search (200/request), contact enrichment, campaign stats |
| Pipedrive | CRM | Production | Full bidirectional sync, upsert contacts, deals, pipelines, stages, activities, notes. Data cleaning agent. |
| HubSpot | CRM | Production | Contact/deal sync, push scores |
| Salesforce | CRM | Partial | Contact/deal sync via REST |
| Odoo | CRM + ERP | Production | JSON-RPC client. Contacts, deals, stages, invoices, activities, notes |
| Notion | CRM + Docs | Production | Contact sync, database discovery |
| Airtable | CRM | Production | Contact sync with batch of 10 |
| Brave Search | Web search | Production | Web prospect agent (5 queries/company) |
| Resend | Email (system) | Production | Verification, password reset, weekly reports |
| SMTP (user) | Email (activation) | Production | Personal emails via Gmail/Outlook/OVH for nurture campaigns |

## 4. Key Features

### Prospection
- Chat-driven campaign creation with Claude AI
- 5 pre-built campaign templates (SaaS B2B, Prise de RDV, Relance clients, Recrutement, Partenariat)
- Multi-channel sequences (email + LinkedIn) with conditional branching
- Lemlist deployment with A/B testing and batch mode
- Prospect search via Lemlist database (200/request) or Apollo
- Web search agent for deep company research
- Replies tab with auto-sync from Lemlist + Apollo

### Activation (CRM)
- Import contacts from any connected CRM (Pipedrive, Odoo, HubSpot)
- Client detail panel with timeline (emails + CRM activities + invoices for Odoo)
- 8 pre-built trigger types: deal_won, deal_stagnant, inactive_contact, deal_lost, onboarding_check, renewal_reminder, upsell_opportunity, feedback_request
- Preview mode before sending (see who gets emailed + sample email)
- Response analysis agent (sentiment + intent detection via Claude)
- Trigger effectiveness scoring over time
- Data cleaning agent: duplicates, missing fields, invalid emails, inactive contacts, format issues (score /100)

### Intelligence (4 Agents)
1. **Prospection Agent** (daily 8AM): stats collection + batch A/B + deliverability checks
2. **CRM Agent** (daily 9AM): delta sync + data quality + nurture evaluation + response analysis
3. **Memory Agent** (Sunday 10AM): pattern consolidation + pruning + template generation (only when needed)
4. **Reporting Agent** (Monday 9AM): anomaly detection + weekly report (only to active users)

### Team Mode
- Teams table with invite codes (max 5 members)
- Roles: admin (full access), prospection, activation, viewer (read-only)
- Shared CRM keys at team level
- Data migration on team create/join
- Join page: /join/:code

## 5. Database Schema (key tables)

```
users, teams, team_members
campaigns, touchpoints, diagnostics, versions
opportunities (contacts/clients with CRM link)
prospect_activities (Lemlist/Apollo reply/open/click data)
memory_patterns (cross-campaign learnings)
nurture_triggers (activation rules)
nurture_emails (sent/pending/cancelled activation emails)
email_accounts (SMTP credentials per team)
crm_cleaning_reports (data quality scan results)
user_integrations (encrypted API keys per user/team)
chat_threads, chat_messages
notifications, templates, reports
```

## 6. Key Backend Files

```
backend/
  api/
    lemlist.js      — Lemlist API (v2 stats, activities, conditional sequences, search)
    apollo.js       — Apollo API (campaigns, contacts, activities, enrichment)
    pipedrive.js    — Pipedrive API (persons, deals, pipelines, stages, activities, notes, upsert)
    odoo.js         — Odoo JSON-RPC (contacts, deals, invoices, stages, activities)
    claude.js       — Claude API with CHAT_SYSTEM_RULES (all chat actions defined here)
    hubspot.js      — HubSpot API
    salesforce.js   — Salesforce API
  lib/
    crm-agent.js           — Unified CRM agent (sync + quality + nurture + response analysis)
    prospection-agent.js   — Wraps collect-stats + batch-orchestrator + deliverability
    memory-agent.js        — Wraps consolidate + pruning + template generation
    reporting-agent.js     — Wraps weekly-report + anomaly detection
    response-analysis-agent.js — Analyzes CRM replies, scores triggers, creates memory patterns
    email-outbound.js      — SMTP/OAuth email sending + Pipedrive note logging
    nurture-engine.js      — Trigger evaluation + Claude email generation
    crm-cleaning-agent.js  — Data quality scan with provider adapters
    crm-bidirectional-sync.js — Pipedrive <> Baakalai sync
  routes/
    chat.js       — Chat with Claude + CRM actions from chat
    campaigns.js  — Campaign CRUD + launch to Lemlist
    crm.js        — CRM sync, import, clean, client detail, pipelines
    nurture.js    — Triggers CRUD, email accounts, preview, send
    stats.js      — Lemlist/Apollo stats sync, activities
    teams.js      — Team create, join, members, roles
    dashboard.js  — KPIs, activation metrics, refresh stats
  orchestrator/
    index.js      — 4-agent scheduler (Prospection 8AM, CRM 9AM, Memory Sun, Reporting Mon)
```

## 7. Key Frontend Files

```
frontend/src/
  pages/
    ChatPage.jsx            — Chat with Claude, campaign templates, CRM action cards
    DashboardPage.jsx       — KPIs, deliverability, ICP insights, weekly report link
    CampaignsList.jsx       — Campaign list with filters, archive, delete
    ClientsPage.jsx         — Client import, pipeline stages, detail panel with timeline
    NurturePage.jsx         — Activation: dashboard, campaigns, triggers, pending/sent, preview
    CRMAnalyticsPage.jsx    — Pipeline, attribution, scoring, health (live data cleaning)
    SettingsPage.jsx        — API keys with guides, email accounts, team management, Odoo form
    MemoryExplorerPage.jsx  — AI memory patterns with apply/delete/export
  components/
    Layout.jsx              — Sidebar nav with mark logo
    OnboardingWizard.jsx    — 3-step wizard (company+target, API keys with guides, confirmation)
    EmailAccountSettings.jsx — SMTP config with Gmail/Outlook/OVH guides
    TeamSettings.jsx        — Team creation, invite link, member roles
    DeliverabilityCard.jsx  — Health score + refresh stats
    ICPInsightsCard.jsx     — ICP analysis card
```

## 8. Chat Actions (claude.js CHAT_SYSTEM_RULES)

Claude can propose these structured actions in the chat (JSON blocks):

| Action | What it does |
|--------|-------------|
| create_campaign | Create campaign with full sequence |
| search_prospects | Search via Lemlist/Apollo (limit 200) |
| web_search_prospects | Deep web search for specific companies |
| add_prospects_manual | Parse pasted contact list |
| send_email | Send personal email to a contact |
| scan_crm | Trigger CRM health scan |
| run_nurture | Execute activation triggers |
| import_crm | Import contacts from CRM |
| list_clients | Show filtered client list |

## 9. Brand Identity (v6)

- Name: **baakalai** (lowercase, no dot, no ".ai")
- Domain: baakal.ai (dot only in URLs)
- Font: Geist (sans) + Geist Mono
- Colors: paper #FAFAF9, ink #0A0A0A, primary #6E57FA, lavender #C4B5FD
- Mark: rounded square with purple + lavender bars
- Verb: "refine" (not "optimize")
- Tone: direct, product-first, specific over vague

## 10. Current State & Known Gaps

### Working in production
- Full prospection flow (chat > campaign > sequences > Lemlist deploy > stats > A/B)
- CRM Pipedrive full integration (import, sync, cleaning, activation, response analysis)
- Odoo integration (contacts, deals, invoices, stages)
- Team mode (create, invite, roles)
- Activation page with triggers, preview, campaigns view
- Brand v6 (light theme, Geist font, purple accents)
- 4 autonomous agents replacing 7 crons
- Chat actions for CRM operations

### Known gaps
- [x] Memory patterns injected into nurture email generation (done April 2026)
- [x] i18n FR/EN on all main pages (done April 2026)
- [x] 9 pattern sources (was 4)
- [ ] Pipedrive webhooks (real-time sync instead of daily cron)
- [ ] OAuth Gmail/Microsoft (replace SMTP password with 1-click connect)
- [ ] Renewal trigger needs custom field mapping for renewal dates
- [ ] A/B testing only on prospection (Lemlist), not on activation emails
- [ ] Stripe payment integration
- [ ] Landing page Lightfield-style redesign
- [ ] Analytics integration: Amplitude, Google Analytics, Mixpanel (behavioral data)
- [ ] Membership analytics: tenure, LTV by segment, renewal rates, loyalty scoring
- [ ] Salesforce full integration (currently partial)

## 11. Business Context

- **Vision**: Full customer lifecycle hub — outreach + CRM + analytics (Amplitude/GA) + billing (Stripe/Odoo) all connected, AI analyzes everything and triggers the right action
- **ICP**: SMB services B2B (10-400 employees) + membership organizations. Sectors: crypto, telecom, cybersecurity, agencies, biotech, health, freelance
- **Pricing**: $75/user/month (team plan up to 5 members)
- **Competitors**: SalesCaptain (~EUR30k/4 months agency), GTM Studio (~EUR140k/7 months agency), Lemlist/Apollo (tools only, no AI orchestration)
- **Key differentiator**: AI that learns from every campaign + prospection AND activation in one tool
- **Target onboarding time**: <30 minutes to first campaign (currently ~25-35 min)
- **Owner**: Goran Nikcevic (goran@oenobiote.com)

## 12. Code Conventions

- Backend: CommonJS (require/module.exports), Express routes, PostgreSQL via raw queries
- Frontend: ES Modules (import/export), React functional components, inline styles (no CSS-in-JS lib)
- i18n: fr.json + en.json with useT() hook
- **RULE: NEVER hardcode French text in JSX.** Always use t('key') from useT(). When adding ANY user-facing string, add the key to BOTH fr.json AND en.json in the same commit. No exceptions.
- DB migrations: numbered SQL files in backend/db/migrations/
- Env vars: ORCHESTRATOR_ENABLED, PGVECTOR_ENABLED for feature flags
- API keys: encrypted in user_integrations table via config/crypto.js
- Git: main branch, Railway auto-deploys on push
