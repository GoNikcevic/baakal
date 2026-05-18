/* ===============================================================================
   BAKAL — Recommendations Page (React)
   Ported from app/recos.js + HTML mockup.
   Shows AI recommendations with filter, apply/modify/dismiss actions, diff panels.
   =============================================================================== */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../context/useApp';
import api, { sendRecoFeedback } from '../services/api-client';
import { sanitizeHtml } from '../services/sanitize';

/* ─── Filter definitions ─── */

const PRIORITY_FILTERS = ['Toutes', 'Critiques', 'Importantes', 'Suggestions', 'Appliquées'];

const PRIORITY_MAP = {
  'Critiques': 'critical',
  'Importantes': 'important',
  'Suggestions': 'suggestion',
  'Appliquées': 'applied',
};

/* ─── Component ─── */

export default function RecosPage() {
  const { campaigns, backendAvailable } = useApp();

  const [recos, setRecos] = useState([]);
  const [insights, setInsights] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Toutes');
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [ratedInsights, setRatedInsights] = useState({});

  /* ─── Fetch real diagnostics & memory from backend ─── */

  const fetchRecos = useCallback(async () => {
    if (!backendAvailable) return;
    try {
      const campaignEntries = Object.values(campaigns);
      if (campaignEntries.length === 0) return;

      // Fetch diagnostics for all campaigns + memory patterns in parallel
      const [memoryRes, ...diagResults] = await Promise.all([
        api.getMemory().catch(() => ({ patterns: [] })),
        ...campaignEntries.map(c =>
          api.getDiagnostics(c._backendId || c.id).catch(() => ({ diagnostics: [] }))
        ),
      ]);

      // Build recommendations from diagnostics
      const realRecos = [];
      campaignEntries.forEach((c, i) => {
        const diags = diagResults[i]?.diagnostics || [];
        diags.forEach((d, j) => {
          realRecos.push({
            id: `diag-${c.id}-${j}`,
            priority: d.priority === 'high' ? 'critical' : d.priority === 'medium' ? 'important' : 'suggestion',
            campaign: c.name,
            step: d.step || `Touchpoint ${j + 1}`,
            title: d.title || d.summary || 'Recommandation',
            desc: d.text || d.description || '',
            impact: d.impact || '',
            date: d.created_at ? new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '',
            before: d.before || '',
            after: d.after || '',
          });
        });
      });

      // Always sync — even if empty (user should see empty state, not stale demo)
      setRecos(realRecos);

      // Build insights from memory patterns
      const patterns = memoryRes.patterns || [];
      setInsights(
        patterns.map(p => ({
          title: p.pattern || p.title || '',
          text: p.data || p.description || '',
          confidence: (p.confidence || '').toLowerCase() === 'haute' ? 'high'
            : (p.confidence || '').toLowerCase() === 'moyenne' ? 'medium' : 'low',
          confidenceLabel: `Confiance ${p.confidence || 'inconnue'}`,
        }))
      );

      setDataLoaded(true);
    } catch (err) {
      console.warn('Failed to load recommendations:', err.message);
    }
  }, [backendAvailable, campaigns]);

  useEffect(() => {
    if (!dataLoaded) fetchRecos();
  }, [fetchRecos, dataLoaded]);

  // Derive campaign names for filter buttons
  const campaignNames = useMemo(() => {
    const names = new Set(recos.map(r => r.campaign));
    return [...names];
  }, [recos]);

  // Compute stats
  const stats = useMemo(() => {
    let applied = 0, pending = 0, ignored = 0;
    recos.forEach(r => {
      if (r.status === 'applied') applied++;
      else if (r.status === 'dismissed') ignored++;
      else if (r.priority === 'applied' && r.status !== 'dismissed') applied++;
      else pending++;
    });
    return {
      total: recos.length,
      applied,
      pending,
      ignored,
    };
  }, [recos]);

  // Filter recos
  const filteredRecos = useMemo(() => {
    return recos.filter(r => {
      // Priority filter
      if (activeFilter !== 'Toutes') {
        const targetPriority = PRIORITY_MAP[activeFilter];
        if (targetPriority === 'applied') {
          if (r.status !== 'applied' && r.priority !== 'applied') return false;
        } else {
          if (r.status === 'applied' || r.status === 'dismissed') return false;
          if (r.priority !== targetPriority) return false;
        }
      }
      // Campaign filter
      if (activeCampaign && r.campaign !== activeCampaign) return false;
      return true;
    });
  }, [recos, activeFilter, activeCampaign]);

  // Count per priority filter
  const filterCounts = useMemo(() => {
    const counts = {};
    PRIORITY_FILTERS.forEach(f => {
      if (f === 'Toutes') {
        counts[f] = recos.length;
      } else {
        const targetPriority = PRIORITY_MAP[f];
        if (targetPriority === 'applied') {
          counts[f] = recos.filter(r => r.status === 'applied' || r.priority === 'applied').length;
        } else {
          counts[f] = recos.filter(r => r.priority === targetPriority && r.status !== 'applied' && r.status !== 'dismissed').length;
        }
      }
    });
    return counts;
  }, [recos]);

  /* ─── Actions ─── */

  const applyReco = useCallback((id) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    setRecos(prev => prev.map(r => {
      if (r.id !== id) return r;
      return {
        ...r,
        status: 'applied',
        priority: 'applied',
        appliedNote: `Appliquée le ${dateStr} · En attente de données${r.impact ? ' · Impact attendu : ' + r.impact : ''}`,
      };
    }));
    setEditingId(null);
  }, []);

  const dismissReco = useCallback((id) => {
    setRecos(prev => prev.map(r => {
      if (r.id !== id) return r;
      return { ...r, status: 'dismissed' };
    }));
  }, []);

  const startModify = useCallback((id) => {
    const reco = recos.find(r => r.id === id);
    if (!reco) return;
    setEditingId(id);
    // Strip HTML to get plain text for editing
    const plain = reco.after.replace(/<[^>]*>/g, '');
    setEditText(plain);
  }, [recos]);

  const cancelModify = useCallback(() => {
    setEditingId(null);
    setEditText('');
  }, []);

  const applyModified = useCallback((id) => {
    setRecos(prev => prev.map(r => {
      if (r.id !== id) return r;
      return { ...r, after: editText };
    }));
    applyReco(id);
  }, [editText, applyReco]);

  const rerunAnalysis = useCallback(async () => {
    setAnalysisRunning(true);
    // Yield to allow React to render the loading state before continuing
    await new Promise(r => setTimeout(r, 0));
    if (backendAvailable) {
      try {
        // Run analysis on all active campaigns
        const campaignEntries = Object.values(campaigns).filter(c => c.status === 'active');
        for (const c of campaignEntries) {
          await api.analyzeCampaign(c._backendId || c.id).catch(() => {});
        }
        // Re-fetch updated diagnostics
        setDataLoaded(false);
      } catch {
        /* ignore */
      }
    }
    setAnalysisRunning(false);
  }, [backendAvailable, campaigns]);

  const handleInsightFeedback = useCallback(async (idx, insight, feedback) => {
    setRatedInsights(prev => ({ ...prev, [idx]: feedback }));
    try {
      await sendRecoFeedback(null, insight.title + ': ' + insight.text, feedback);
    } catch {
      /* ignore */
    }
  }, []);

  /* ─── Render helpers ─── */

  function renderBadge(reco) {
    if (reco.status === 'applied' || reco.priority === 'applied') {
      return <span className="reco-priority-badge applied">Appliquée</span>;
    }
    if (reco.status === 'dismissed') {
      return (
        <span
          className="reco-priority-badge"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          Ignorée
        </span>
      );
    }
    return <span className={`reco-priority-badge ${reco.priority}`}>{
      reco.priority === 'critical' ? 'Critique' :
      reco.priority === 'important' ? 'Important' :
      'Suggestion'
    }</span>;
  }

  function renderCard(reco) {
    const isApplied = reco.status === 'applied' || reco.priority === 'applied';
    const isDismissed = reco.status === 'dismissed';
    const isEditing = editingId === reco.id;
    const cardClass = isDismissed
      ? 'reco-card'
      : `reco-card priority-${isApplied ? 'applied' : reco.priority}`;

    return (
      <div
        key={reco.id}
        className={cardClass}
        style={isDismissed ? { opacity: 0.5, borderLeftColor: 'var(--border)' } : undefined}
      >
        {/* Header */}
        <div className="reco-card-header">
          <div className="reco-card-left">
            {renderBadge(reco)}
            <div>
              <div className="reco-card-campaign">{reco.campaign}</div>
              <div className="reco-card-step">{reco.step}</div>
            </div>
          </div>
          <div className="reco-card-meta">
            {reco.impact && <span className="reco-impact-badge">{reco.impact}</span>}
            <span className="reco-card-date">{reco.date}</span>
          </div>
        </div>

        {/* Body */}
        {!isDismissed && (
          <div className="reco-card-body">
            <div className="reco-card-title">{reco.title}</div>
            <div className="reco-card-desc" dangerouslySetInnerHTML={{ __html: sanitizeHtml(reco.desc) }} />

            {/* Diff panels */}
            {(reco.before || reco.after) && !isApplied && (
              <div className="reco-diff">
                <div className="reco-diff-panel">
                  <div className="reco-diff-label before">Actuel</div>
                  <div className="reco-diff-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(reco.before) }} />
                </div>
                <div className="reco-diff-panel">
                  <div className={`reco-diff-label ${isEditing ? 'after' : 'after'}`}>
                    {isEditing ? 'Votre version (modifiable)' : 'Proposition Baakalai'}
                  </div>
                  {isEditing ? (
                    <textarea
                      className="reco-diff-text"
                      style={{
                        border: '2px solid var(--accent)',
                        borderRadius: '8px',
                        padding: '12px',
                        outline: 'none',
                        minHeight: '60px',
                        width: '100%',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                        resize: 'vertical',
                      }}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <div className="reco-diff-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(reco.after) }} />
                  )}
                </div>
              </div>
            )}

            {/* Applied diff — show only the applied version */}
            {isApplied && reco.after && (
              <div className="reco-diff">
                <div className="reco-diff-panel">
                  <div className="reco-diff-label after">Version appliquée</div>
                  <div className="reco-diff-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(reco.after) }} />
                </div>
              </div>
            )}

            {/* Applied note */}
            {isApplied && reco.appliedNote && (
              <div className="reco-applied-note">
                {reco.appliedNote}
              </div>
            )}

            {/* Actions */}
            {!isApplied && !isDismissed && (
              <div className="reco-card-actions">
                {isEditing ? (
                  <>
                    <button className="reco-btn accept" onClick={() => applyModified(reco.id)}>
                      Appliquer la version modifiée
                    </button>
                    <button className="reco-btn dismiss" onClick={cancelModify}>Annuler</button>
                  </>
                ) : (
                  <>
                    <button className="reco-btn accept" onClick={() => applyReco(reco.id)}>Appliquer</button>
                    <button className="reco-btn modify" onClick={() => startModify(reco.id)}>
                      Modifier{reco.priority === 'critical' ? " avant d'appliquer" : ''}
                    </button>
                    <button className="reco-btn dismiss" onClick={() => dismissReco(reco.id)}>Ignorer</button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ─── Main render ─── */

  return (
    <div id="page-recos">
      {/* Header */}
      <div className="reco-page-header">
        <div>
          <div className="reco-page-title">Recommandations IA</div>
          <div className="reco-page-subtitle" style={analysisRunning ? { color: 'var(--text-secondary)' } : undefined}>
            {analysisRunning
              ? 'Baakalai analyse vos campagnes... Veuillez patienter.'
              : "Baakalai analyse vos campagnes et propose des affinages \u00B7 Mis \u00E0 jour il y a 2h"
            }
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost">Historique</button>
          <button className="btn btn-primary" onClick={rerunAnalysis} disabled={analysisRunning}>
            Relancer l'analyse
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="reco-stats">
        <div className="reco-stat-card">
          <div className="reco-stat-value" style={{ color: 'var(--text-primary)' }}>{stats.total}</div>
          <div className="reco-stat-label">Recommandations totales</div>
          <div className="reco-stat-trend up">4 nouvelles cette semaine</div>
        </div>
        <div className="reco-stat-card">
          <div className="reco-stat-value" style={{ color: 'var(--success)' }}>{stats.applied}</div>
          <div className="reco-stat-label">Appliquées</div>
          <div className="reco-stat-trend up">{'▲'} +4.2pts réponse en moyenne</div>
        </div>
        <div className="reco-stat-card">
          <div className="reco-stat-value" style={{ color: 'var(--warning)' }}>{stats.pending}</div>
          <div className="reco-stat-label">En attente</div>
          <div className="reco-stat-trend" style={{ color: 'var(--warning)' }}>
            {stats.pending > 0 ? '1 critique' : '—'}
          </div>
        </div>
        <div className="reco-stat-card">
          <div className="reco-stat-value" style={{ color: 'var(--text-muted)' }}>{stats.ignored}</div>
          <div className="reco-stat-label">Ignorées</div>
          <div className="reco-stat-trend" style={{ color: 'var(--text-muted)' }}>{'—'}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="reco-filters">
        {PRIORITY_FILTERS.map(f => (
          <button
            key={f}
            className={`reco-filter${activeFilter === f ? ' active' : ''}`}
            onClick={() => { setActiveFilter(f); setActiveCampaign(null); }}
          >
            {f} <span className="count">{filterCounts[f]}</span>
          </button>
        ))}
        <span style={{ borderLeft: '1px solid var(--border)', margin: '0 4px' }} />
        {campaignNames.map(name => (
          <button
            key={name}
            className={`reco-filter${activeCampaign === name ? ' active' : ''}`}
            onClick={() => {
              setActiveCampaign(activeCampaign === name ? null : name);
              setActiveFilter('Toutes');
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Recommendation cards */}
      <div className="reco-list">
        {filteredRecos.map(renderCard)}
      </div>

      {/* Cross-campaign insights */}
      <div className="reco-insight-card">
        <div className="reco-insight-title">Patterns cross-campagne détectés</div>
        <div className="reco-insight-grid">
          {insights.map((ins, i) => (
            <div key={i} className="reco-insight-item">
              <div className="reco-insight-item-title">{ins.title}</div>
              <div className="reco-insight-item-text">{ins.text}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <div className={`reco-insight-item-confidence ${ins.confidence}`}>{ins.confidenceLabel}</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {ratedInsights[i] ? (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Merci</span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleInsightFeedback(i, ins, 'useful')}
                        style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', fontSize: '14px', lineHeight: 1 }}
                        title="Utile"
                      >{'\uD83D\uDC4D'}</button>
                      <button
                        onClick={() => handleInsightFeedback(i, ins, 'not_useful')}
                        style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', fontSize: '14px', lineHeight: 1 }}
                        title="Pas utile"
                      >{'\uD83D\uDC4E'}</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
