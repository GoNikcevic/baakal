/* ===============================================================================
   BAKAL — Clients Page
   Import contacts from CRM, view pipeline stages, manage client relationships.
   =============================================================================== */

import { useState, useEffect, useCallback } from 'react';
import api, { request } from '../services/api-client';
import { useT } from '../i18n';

const STAGE_COLORS = [
  'var(--text-muted)', 'var(--blue)', 'var(--accent)',
  'var(--warning)', 'var(--purple)', 'var(--success)',
];

export default function ClientsPage() {
  const t = useT();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [pipelines, setPipelines] = useState([]);
  const [stages, setStages] = useState([]);

  // Load clients (opportunities) + pipelines
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [oppsData, pipelinesData] = await Promise.all([
        request('/dashboard/opportunities').catch(() => ({ opportunities: [] })),
        request('/crm/pipedrive/pipelines').catch(() => ({ pipelines: [] })),
      ]);
      setClients(oppsData.opportunities || []);
      setPipelines(pipelinesData.pipelines || []);

      // Load stages for first pipeline
      if (pipelinesData.pipelines?.length > 0) {
        const stagesData = await request(`/crm/pipedrive/stages/${pipelinesData.pipelines[0].id}`).catch(() => ({ stages: [] }));
        setStages(stagesData.stages || []);
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Import from Pipedrive
  const handleImport = useCallback(async () => {
    setImporting(true);
    setImportResult(null);
    try {
      const result = await request('/crm/import/pipedrive', { method: 'POST' });
      setImportResult(result);
      await loadData();
    } catch (err) {
      setImportResult({ error: err.message });
    }
    setImporting(false);
  }, [loadData]);

  // Filter + search
  const filtered = clients.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (c.name || '').toLowerCase().includes(q)
        || (c.company || '').toLowerCase().includes(q)
        || (c.email || '').toLowerCase().includes(q);
    }
    return true;
  });

  // Status groups for filter tabs
  const statusCounts = {};
  for (const c of clients) {
    const s = c.status || 'unknown';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  }

  const statusTabs = [
    { key: 'all', label: 'Tous', count: clients.length },
    { key: 'imported', label: 'Import\u00e9s', count: statusCounts.imported || 0 },
    { key: 'new', label: 'Nouveaux', count: statusCounts.new || 0 },
    { key: 'interested', label: 'Int\u00e9ress\u00e9s', count: statusCounts.interested || 0 },
    { key: 'meeting', label: 'RDV', count: statusCounts.meeting || 0 },
    { key: 'won', label: 'Gagn\u00e9s', count: statusCounts.won || 0 },
  ].filter(t => t.key === 'all' || t.count > 0);

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <div className="page-subtitle">
            {clients.length} contact{clients.length !== 1 ? 's' : ''} dans votre CRM
          </div>
        </div>
        <button
          className="btn btn-primary"
          style={{ fontSize: 12, padding: '8px 16px' }}
          onClick={handleImport}
          disabled={importing}
        >
          {importing ? '\u23F3 Import en cours...' : '\u2B07\uFE0F Importer depuis Pipedrive'}
        </button>
      </div>

      {/* Import result banner */}
      {importResult && (
        <div style={{
          background: importResult.error ? 'var(--danger-bg)' : 'rgba(0, 214, 143, 0.1)',
          border: `1px solid ${importResult.error ? 'rgba(255,107,107,0.3)' : 'rgba(0, 214, 143, 0.3)'}`,
          borderRadius: 10,
          padding: '10px 14px',
          marginBottom: 16,
          fontSize: 12,
          color: importResult.error ? 'var(--danger)' : 'var(--success)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>
            {importResult.error
              ? `Erreur : ${importResult.error}`
              : `${importResult.imported} contact${importResult.imported !== 1 ? 's' : ''} import\u00e9${importResult.imported !== 1 ? 's' : ''}, ${importResult.skipped} d\u00e9j\u00e0 pr\u00e9sent${importResult.skipped !== 1 ? 's' : ''}`}
          </span>
          <button className="btn btn-ghost" style={{ fontSize: 10, padding: '2px 8px' }} onClick={() => setImportResult(null)}>
            {'\u2715'}
          </button>
        </div>
      )}

      {/* Pipeline stages overview */}
      {stages.length > 0 && (
        <div style={{
          display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto',
          padding: '4px 0',
        }}>
          {stages.map((stage, i) => {
            const stageClients = clients.filter(c => c.crm_stage === stage.id || c.status === stage.name?.toLowerCase());
            return (
              <div key={stage.id} style={{
                flex: '1 0 120px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderTop: `3px solid ${STAGE_COLORS[i % STAGE_COLORS.length]}`,
                borderRadius: 10,
                padding: '12px 14px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{stage.name}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: STAGE_COLORS[i % STAGE_COLORS.length] }}>
                  {stageClients.length}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Rechercher un contact..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 14px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: 13,
          }}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '6px 12px',
                border: `1px solid ${filter === tab.key ? 'var(--accent)' : 'var(--border)'}`,
                background: filter === tab.key ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                borderRadius: 8,
                fontSize: 11,
                color: filter === tab.key ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: filter === tab.key ? 600 : 400,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Clients table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 50,
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
        }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>{'\uD83D\uDC65'}</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {clients.length === 0
              ? 'Aucun contact. Importez vos contacts depuis Pipedrive pour commencer.'
              : 'Aucun contact ne correspond à votre recherche.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 80px',
            padding: '8px 16px',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            <span>Contact</span>
            <span>Entreprise</span>
            <span>Statut</span>
            <span>Score</span>
            <span>CRM</span>
          </div>

          {/* Rows */}
          {filtered.map(client => (
            <ClientRow key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClientRow({ client: c }) {
  const statusColors = {
    new: 'var(--text-muted)',
    imported: 'var(--blue)',
    interested: 'var(--accent)',
    meeting: 'var(--warning)',
    negotiation: 'var(--purple)',
    won: 'var(--success)',
    lost: 'var(--danger)',
  };
  const statusLabels = {
    new: 'Nouveau',
    imported: 'Import\u00e9',
    interested: 'Int\u00e9ress\u00e9',
    meeting: 'RDV',
    negotiation: 'N\u00e9go',
    won: 'Gagn\u00e9',
    lost: 'Perdu',
  };
  const color = statusColors[c.status] || 'var(--text-muted)';
  const label = statusLabels[c.status] || c.status || '—';
  const score = c.score;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2fr 1.5fr 1fr 1fr 80px',
      padding: '12px 16px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      alignItems: 'center',
      fontSize: 13,
    }}>
      {/* Contact */}
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name || '—'}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {c.title && <span>{c.title}</span>}
          {c.email && <span style={{ marginLeft: c.title ? 8 : 0 }}>{c.email}</span>}
        </div>
      </div>

      {/* Company */}
      <div style={{ color: 'var(--text-secondary)' }}>{c.company || '—'}</div>

      {/* Status */}
      <span style={{
        fontSize: 11,
        padding: '3px 10px',
        borderRadius: 6,
        background: `${color}15`,
        color,
        fontWeight: 600,
        display: 'inline-block',
        width: 'fit-content',
      }}>
        {label}
      </span>

      {/* Score */}
      <div>
        {score != null ? (
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--text-muted)',
          }}>
            {score}/100
          </span>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
        )}
      </div>

      {/* CRM link */}
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
        {c.crm_provider || '—'}
      </div>
    </div>
  );
}
