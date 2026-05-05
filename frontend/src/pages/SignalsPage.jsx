/* ===============================================================================
   BAKAL — Signals Page
   Signal-based prospecting: configure monitoring + view/action detected signals
   =============================================================================== */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { request } from '../services/api-client';
import { useT, useI18n } from '../i18n';
import { showToast } from '../services/notifications';

const SIGNAL_TYPE_OPTIONS = [
  { value: 'funding', icon: '💰', label: { fr: 'Levées de fonds', en: 'Funding rounds' } },
  { value: 'hiring', icon: '👥', label: { fr: 'Recrutement actif', en: 'Active hiring' } },
  { value: 'news', icon: '📰', label: { fr: 'Actualités entreprise', en: 'Company news' } },
  { value: 'job_change', icon: '🔄', label: { fr: 'Changements de poste', en: 'Job changes' } },
  { value: 'leadership_change', icon: '👔', label: { fr: 'Nouveau leadership', en: 'Leadership changes' } },
  { value: 'competitor', icon: '⚔️', label: { fr: 'Activité concurrents', en: 'Competitor activity' } },
];

const SIGNAL_COLORS = {
  funding: '#16A34A', hiring: '#2563EB', news: '#D97706',
  job_change: '#7C3AED', leadership_change: '#0891B2', competitor: '#DC2626',
};

export default function SignalsPage() {
  const t = useT();
  const { lang } = useI18n();
  const en = lang === 'en';

  const [activeTab, setActiveTab] = useState('feed');
  const [signals, setSignals] = useState([]);
  const [counts, setCounts] = useState({});
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState('new');
  const [showCreate, setShowCreate] = useState(false);
  const [actioningId, setActioningId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    signalTypes: ['funding', 'hiring', 'news'],
    targetSectors: '',
    targetTitles: '',
    targetKeywords: '',
    targetCompetitors: '',
  });

  const loadData = useCallback(async () => {
    try {
      const [sigData, cfgData] = await Promise.all([
        request(`/signals?status=${filter}`).catch(() => ({ signals: [], counts: {} })),
        request('/signals/configs').catch(() => ({ configs: [] })),
      ]);
      setSignals(sigData.signals || []);
      setCounts(sigData.counts || {});
      setConfigs(cfgData.configs || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [filter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleScan = async () => {
    setScanning(true);
    try {
      const result = await request('/signals/scan', { method: 'POST' });
      showToast({ type: 'success', title: en ? 'Scan complete' : 'Scan terminé', message: `${result.detected || 0} ${en ? 'signals detected' : 'signaux détectés'}` });
      await loadData();
    } catch { showToast({ type: 'error', title: 'Erreur', message: en ? 'Scan failed' : 'Échec du scan' }); }
    setScanning(false);
  };

  const handleAction = async (signalId, action) => {
    setActioningId(signalId);
    try {
      await request(`/signals/${signalId}/action`, { method: 'POST', body: JSON.stringify({ action }) });
      setSignals(prev => prev.map(s => s.id === signalId ? { ...s, status: action === 'dismiss' ? 'dismissed' : 'actioned', action_taken: action } : s));
      const label = action === 'add_to_crm' ? (en ? 'Added to CRM' : 'Ajouté au CRM') :
        action === 'send_email' ? (en ? 'Email sent' : 'Email envoyé') : (en ? 'Dismissed' : 'Ignoré');
      showToast({ type: 'success', title: label });
    } catch { showToast({ type: 'error', title: 'Erreur', message: en ? 'Action failed' : 'Action échouée' }); }
    setActioningId(null);
  };

  const handleCreateConfig = async () => {
    if (!form.name.trim()) return;
    try {
      await request('/signals/configs', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          signalTypes: form.signalTypes,
          targetSectors: form.targetSectors.split(',').map(s => s.trim()).filter(Boolean),
          targetTitles: form.targetTitles.split(',').map(s => s.trim()).filter(Boolean),
          targetKeywords: form.targetKeywords.split(',').map(s => s.trim()).filter(Boolean),
          targetCompetitors: form.targetCompetitors.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });
      setShowCreate(false);
      setForm({ name: '', signalTypes: ['funding', 'hiring', 'news'], targetSectors: '', targetTitles: '', targetKeywords: '', targetCompetitors: '' });
      await loadData();
    } catch { showToast({ type: 'error', title: 'Erreur', message: en ? 'Failed to create config' : 'Échec de création' }); }
  };

  const handleDeleteConfig = async (id) => {
    if (!window.confirm(en ? 'Delete this signal config?' : 'Supprimer cette configuration ?')) return;
    try {
      await request(`/signals/configs/${id}`, { method: 'DELETE' });
      await loadData();
    } catch { showToast({ type: 'error', title: 'Erreur' }); }
  };

  const handleToggleConfig = async (id, enabled) => {
    try {
      await request(`/signals/configs/${id}`, { method: 'PATCH', body: JSON.stringify({ enabled: !enabled }) });
      await loadData();
    } catch { showToast({ type: 'error', title: 'Erreur' }); }
  };

  const tabs = [
    { key: 'feed', label: en ? 'Signal Feed' : 'Flux de signaux', count: (counts.new || 0) + (counts.reviewed || 0) },
    { key: 'config', label: en ? 'Monitoring' : 'Surveillance', count: configs.length },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{en ? 'Signals' : 'Signaux'}</h1>
          <div className="page-subtitle">
            {en ? 'Detect buying signals and find the right prospects at the right time' : 'Détectez les signaux d\'achat et trouvez les bons prospects au bon moment'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 14px' }}
            onClick={handleScan} disabled={scanning}>
            {scanning ? '...' : (en ? '🔍 Scan now' : '🔍 Scanner')}
          </button>
          {activeTab === 'config' && (
            <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}
              onClick={() => setShowCreate(true)}>
              {en ? '+ New config' : '+ Nouvelle config'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 18px', border: 'none', background: 'transparent',
            borderBottom: `2px solid ${activeTab === tab.key ? 'var(--accent)' : 'transparent'}`,
            color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === tab.key ? 600 : 400, fontSize: 13, cursor: 'pointer',
          }}>
            {tab.label} {tab.count > 0 && <span style={{ fontSize: 11, opacity: 0.7 }}>({tab.count})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>{t('common.loading')}</div>
      ) : activeTab === 'feed' ? (
        <SignalFeed signals={signals} counts={counts} filter={filter} setFilter={setFilter}
          onAction={handleAction} actioningId={actioningId} en={en} />
      ) : (
        <ConfigSection configs={configs} showCreate={showCreate} form={form} setForm={setForm}
          onCreateConfig={handleCreateConfig} onDeleteConfig={handleDeleteConfig}
          onToggleConfig={handleToggleConfig} setShowCreate={setShowCreate} en={en} />
      )}
    </div>
  );
}

/* ═══ Signal Feed ═══ */

function SignalFeed({ signals, counts, filter, setFilter, onAction, actioningId, en }) {
  const filters = [
    { key: 'new', label: en ? 'New' : 'Nouveaux', count: counts.new || 0 },
    { key: 'actioned', label: en ? 'Actioned' : 'Traités', count: counts.actioned || 0 },
    { key: 'dismissed', label: en ? 'Dismissed' : 'Ignorés', count: counts.dismissed || 0 },
  ];

  return (
    <div>
      {/* Status filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '5px 12px', fontSize: 11, borderRadius: 8,
            border: `1px solid ${filter === f.key ? 'var(--accent)' : 'var(--border)'}`,
            background: filter === f.key ? 'rgba(110,87,250,0.08)' : 'transparent',
            color: filter === f.key ? 'var(--accent)' : 'var(--text-muted)',
            cursor: 'pointer', fontWeight: filter === f.key ? 600 : 400,
          }}>
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Signal cards */}
      {signals.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 50, background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: 12,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📡</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {en ? 'No signals yet. Configure monitoring and run a scan.' : 'Aucun signal. Configurez la surveillance et lancez un scan.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {signals.map(s => {
            const typeOpt = SIGNAL_TYPE_OPTIONS.find(o => o.value === s.signal_type);
            const color = SIGNAL_COLORS[s.signal_type] || 'var(--text-muted)';
            return (
              <div key={s.id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
                borderLeft: `3px solid ${color}`, padding: '14px 18px',
                opacity: s.status === 'dismissed' ? 0.5 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 4,
                        background: `${color}15`, color, fontWeight: 600, textTransform: 'uppercase',
                      }}>
                        {typeOpt?.icon} {s.signal_type.replace('_', ' ')}
                      </span>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 4,
                        background: s.relevance_score >= 70 ? 'rgba(22,163,74,0.1)' : 'var(--bg-elevated)',
                        color: s.relevance_score >= 70 ? 'var(--success)' : 'var(--text-muted)',
                        fontWeight: 600,
                      }}>
                        {s.relevance_score}/100
                      </span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                    {s.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{s.description}</div>}
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                      {s.company_name && <span>🏢 {s.company_name}</span>}
                      {s.contact_name && <span>👤 {s.contact_name}{s.contact_title ? ` · ${s.contact_title}` : ''}</span>}
                      {s.contact_email && <span>✉️ {s.contact_email}</span>}
                      <span>{new Date(s.detected_at).toLocaleDateString(en ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {s.status === 'new' && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <button className="btn btn-primary" style={{ fontSize: 11, padding: '5px 12px' }}
                      onClick={() => onAction(s.id, 'add_to_crm')} disabled={actioningId === s.id}>
                      {en ? 'Add to CRM' : 'Ajouter au CRM'}
                    </button>
                    {s.contact_email && (
                      <button className="btn btn-ghost" style={{ fontSize: 11, padding: '5px 12px', border: '1px solid var(--border)' }}
                        onClick={() => onAction(s.id, 'send_email')} disabled={actioningId === s.id}>
                        {en ? 'Send email' : 'Envoyer un email'}
                      </button>
                    )}
                    {s.source_url && (
                      <a href={s.source_url} target="_blank" rel="noopener noreferrer"
                        className="btn btn-ghost" style={{ fontSize: 11, padding: '5px 12px', textDecoration: 'none', border: '1px solid var(--border)' }}>
                        {en ? 'Source' : 'Source'} ↗
                      </a>
                    )}
                    <button className="btn btn-ghost" style={{ fontSize: 11, padding: '5px 12px', color: 'var(--text-muted)' }}
                      onClick={() => onAction(s.id, 'dismiss')} disabled={actioningId === s.id}>
                      {en ? 'Dismiss' : 'Ignorer'}
                    </button>
                  </div>
                )}
                {s.status === 'actioned' && (
                  <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 8 }}>
                    ✅ {s.action_taken === 'add_to_crm' ? (en ? 'Added to CRM' : 'Ajouté au CRM') :
                        s.action_taken === 'send_email' ? (en ? 'Email sent' : 'Email envoyé') : s.action_taken}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══ Config Section ═══ */

function ConfigSection({ configs, showCreate, form, setForm, onCreateConfig, onDeleteConfig, onToggleConfig, setShowCreate, en }) {
  return (
    <div>
      {/* Create form */}
      {showCreate && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--accent)' }}>
          <div className="card-body" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
              {en ? 'New signal monitoring config' : 'Nouvelle configuration de surveillance'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="text" placeholder={en ? 'Config name (e.g., Crypto funding watch)' : 'Nom (ex: Veille funding crypto)'}
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="form-input" style={{ fontSize: 13, padding: '8px 12px' }} />

              {/* Signal types */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  {en ? 'Signal types to monitor' : 'Types de signaux à surveiller'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SIGNAL_TYPE_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => {
                      setForm(p => ({
                        ...p,
                        signalTypes: p.signalTypes.includes(opt.value)
                          ? p.signalTypes.filter(v => v !== opt.value)
                          : [...p.signalTypes, opt.value],
                      }));
                    }} style={{
                      padding: '5px 12px', fontSize: 11, borderRadius: 8,
                      border: `1px solid ${form.signalTypes.includes(opt.value) ? 'var(--accent)' : 'var(--border)'}`,
                      background: form.signalTypes.includes(opt.value) ? 'rgba(110,87,250,0.08)' : 'transparent',
                      color: form.signalTypes.includes(opt.value) ? 'var(--accent)' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}>
                      {opt.icon} {opt.label[en ? 'en' : 'fr']}
                    </button>
                  ))}
                </div>
              </div>

              {/* Targeting */}
              <input type="text" placeholder={en ? 'Target sectors (comma-separated: crypto, DeFi, fintech)' : 'Secteurs cibles (séparés par virgule : crypto, DeFi, fintech)'}
                value={form.targetSectors} onChange={e => setForm(p => ({ ...p, targetSectors: e.target.value }))}
                className="form-input" style={{ fontSize: 13, padding: '8px 12px' }} />

              <input type="text" placeholder={en ? 'Target titles (CEO, CMO, VP Sales)' : 'Titres cibles (CEO, CMO, VP Sales)'}
                value={form.targetTitles} onChange={e => setForm(p => ({ ...p, targetTitles: e.target.value }))}
                className="form-input" style={{ fontSize: 13, padding: '8px 12px' }} />

              <input type="text" placeholder={en ? 'Keywords to monitor (DeFi, exchange, wallet, NFT)' : 'Mots-clés à surveiller (DeFi, exchange, wallet, NFT)'}
                value={form.targetKeywords} onChange={e => setForm(p => ({ ...p, targetKeywords: e.target.value }))}
                className="form-input" style={{ fontSize: 13, padding: '8px 12px' }} />

              <input type="text" placeholder={en ? 'Competitors to track (Gojiberry, SalesCaptain)' : 'Concurrents à suivre (Gojiberry, SalesCaptain)'}
                value={form.targetCompetitors} onChange={e => setForm(p => ({ ...p, targetCompetitors: e.target.value }))}
                className="form-input" style={{ fontSize: 13, padding: '8px 12px' }} />

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setShowCreate(false)}>
                  {en ? 'Cancel' : 'Annuler'}
                </button>
                <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={onCreateConfig} disabled={!form.name.trim()}>
                  {en ? 'Create' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing configs */}
      {configs.length === 0 && !showCreate ? (
        <div style={{
          textAlign: 'center', padding: 50, background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: 12,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
            {en ? 'No signal configs yet. Create one to start monitoring buying signals.' : 'Aucune configuration. Créez-en une pour commencer à surveiller les signaux d\'achat.'}
          </div>
          <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => setShowCreate(true)}>
            {en ? '+ Create config' : '+ Créer une configuration'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {configs.map(c => (
            <div key={c.id} className="card" style={{
              borderLeft: `3px solid ${c.enabled ? 'var(--success)' : 'var(--text-muted)'}`,
              opacity: c.enabled ? 1 : 0.6,
            }}>
              <div className="card-body" style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                      {(c.signal_types || []).map(st => {
                        const opt = SIGNAL_TYPE_OPTIONS.find(o => o.value === st);
                        return (
                          <span key={st} style={{
                            fontSize: 10, padding: '2px 8px', borderRadius: 4,
                            background: `${SIGNAL_COLORS[st] || '#666'}15`,
                            color: SIGNAL_COLORS[st] || 'var(--text-muted)',
                          }}>
                            {opt?.icon} {st.replace('_', ' ')}
                          </span>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                      {(c.target_sectors || []).length > 0 && <span>{en ? 'Sectors' : 'Secteurs'}: {c.target_sectors.join(', ')} · </span>}
                      {(c.target_keywords || []).length > 0 && <span>{en ? 'Keywords' : 'Mots-clés'}: {c.target_keywords.join(', ')} · </span>}
                      {c.last_run && <span>{en ? 'Last scan' : 'Dernier scan'}: {new Date(c.last_run).toLocaleDateString(en ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost" style={{
                      fontSize: 10, padding: '4px 10px',
                      color: c.enabled ? 'var(--warning)' : 'var(--success)',
                    }} onClick={() => onToggleConfig(c.id, c.enabled)}>
                      {c.enabled ? (en ? 'Pause' : 'Pause') : (en ? 'Enable' : 'Activer')}
                    </button>
                    <button className="btn btn-ghost" style={{ fontSize: 10, padding: '4px 10px', color: 'var(--danger)' }}
                      onClick={() => onDeleteConfig(c.id)}>
                      {en ? 'Delete' : 'Supprimer'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
