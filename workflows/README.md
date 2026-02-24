# Bakal — N8N Workflows

These are importable N8N workflow definitions for the Bakal optimization loop.

## Workflows

| File | Name | Trigger | Purpose |
|------|------|---------|---------|
| `01-stats-collection.json` | Stats Collection | Daily @ 8am | Fetch Lemlist stats, store in Notion, trigger analysis if eligible |
| `02-regeneration-deployment.json` | Regeneration + Deployment | Webhook (from WF1) | Regenerate underperforming messages via Claude, deploy to Lemlist |
| `03-memory-consolidation.json` | Memory Consolidation | Monthly (1st @ 6am) | Aggregate patterns across campaigns into cross-campaign memory |

## How to Import

1. Open your N8N instance
2. Go to **Workflows** > **Import from File**
3. Import in order: `01` → `02` → `03`
4. After importing Workflow 2, copy its webhook URL and paste it into Workflow 1's "Trigger Regeneration Workflow" node

## Setup Checklist

Before activating, you need to configure these placeholders:

### Credentials
- [ ] **Lemlist API Key** — Create an HTTP Query Auth credential with parameter name `api_key`
- [ ] **Notion API Token** — Create an HTTP Header Auth credential with value `Bearer YOUR_NOTION_TOKEN`
- [ ] **Claude API Key** — Replace `CLAUDE_API_KEY` in the header of each Claude node (3 nodes total across WF1 + WF2 + WF3)

### Notion Database IDs
Replace these placeholders in the workflow nodes:

| Placeholder | Notion Database |
|-------------|----------------|
| `NOTION_DB_RESULTATS_ID` | Campagnes — Résultats |
| `NOTION_DB_DIAGNOSTICS_ID` | Campagnes — Diagnostics |
| `NOTION_DB_HISTORIQUE_ID` | Campagnes — Historique Versions |
| `NOTION_DB_MEMOIRE_ID` | Mémoire Cross-Campagne |

To find a database ID: open the database in Notion as a full page, copy the URL. The ID is the 32-character string before the `?v=` parameter.

### Inter-Workflow Links
- [ ] After importing WF2, copy its webhook URL → paste into WF1's "Trigger Regeneration Workflow" node (replace `WORKFLOW_2_WEBHOOK_URL`)

## Workflow Flow

```
WF1: Stats Collection (daily)
  ├── Lemlist API → fetch active campaigns
  ├── Calculate per-touchpoint metrics
  ├── Store in Notion (Résultats)
  ├── IF eligible (>50 prospects, >7 days)
  │   ├── Claude → performance analysis
  │   ├── Store diagnostic in Notion
  │   └── Trigger WF2 via webhook
  └── ELSE → skip

WF2: Regeneration + Deployment (on demand)
  ├── Receive diagnostic from WF1
  ├── Fetch: campaign history + memory + original sequences
  ├── Claude → regenerate with A/B variants
  ├── Store version in Notion (Historique)
  └── Update Lemlist sequences

WF3: Memory Consolidation (monthly)
  ├── Fetch all diagnostics from past month
  ├── Fetch existing memory patterns
  ├── Claude → identify/update patterns
  └── Create or update Notion (Mémoire)
```
