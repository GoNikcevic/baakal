import { useMemo } from 'react';
import DiagnosticPanel from '../DiagnosticPanel';
import { useI18n } from '../../../i18n';

export default function PerformanceTab({ campaign: c }) {
  const { lang } = useI18n(); const en = lang === 'en';
  const isLinkedin = c.channel === 'linkedin';

  const kpiItems = useMemo(() => {
    const volumePct =
      c.volume?.planned > 0 ? (c.volume.sent / c.volume.planned) * 100 : 0;

    if (isLinkedin) {
      return [
        { value: c.kpis?.contacts ?? 0, label: en ? 'Prospects contacted' : 'Prospects contactés', pct: volumePct, color: 'var(--accent)' },
        { value: (c.kpis?.acceptRate ?? 0) + '%', label: en ? 'Acceptance rate' : "Taux d'acceptation", pct: c.kpis?.acceptRate ?? 0, color: 'var(--success)' },
        { value: (c.kpis?.replyRate ?? 0) + '%', label: en ? 'Reply rate' : 'Taux de réponse', pct: (c.kpis?.replyRate ?? 0) * 10, color: c.kpis?.replyRate >= 8 ? 'var(--blue)' : 'var(--warning)' },
        { value: c.kpis?.interested ?? 0, label: en ? 'Interested' : 'Intéressés', pct: (c.kpis?.interested ?? 0) * 10, color: 'var(--warning)' },
        { value: c.kpis?.meetings ?? 0, label: en ? 'Meetings booked' : 'RDV obtenus', pct: c.kpis?.meetings > 0 ? (c.kpis.meetings / 6) * 100 : 0, color: 'var(--text-secondary)' },
      ];
    }
    return [
      { value: c.kpis?.contacts ?? 0, label: en ? 'Prospects contacted' : 'Prospects contactés', pct: volumePct, color: 'var(--accent)' },
      { value: (c.kpis?.openRate ?? 0) + '%', label: en ? 'Open rate' : "Taux d'ouverture", pct: c.kpis?.openRate ?? 0, color: 'var(--success)' },
      { value: (c.kpis?.replyRate ?? 0) + '%', label: en ? 'Reply rate' : 'Taux de réponse', pct: (c.kpis?.replyRate ?? 0) * 10, color: 'var(--blue)' },
      { value: c.kpis?.interested ?? 0, label: en ? 'Interested' : 'Intéressés', pct: (c.kpis?.interested ?? 0) * 10, color: 'var(--warning)' },
      { value: c.kpis?.meetings ?? 0, label: en ? 'Meetings booked' : 'RDV obtenus', pct: c.kpis?.meetings > 0 ? (c.kpis.meetings / 6) * 100 : 0, color: 'var(--text-secondary)' },
    ];
  }, [c, isLinkedin]);

  return (
    <div>
      {/* KPIs */}
      <div className="campaign-kpis" style={{ marginBottom: 24 }}>
        {kpiItems.map((k, i) => (
          <div className="campaign-kpi" key={i}>
            <div className="campaign-kpi-value" style={{ color: k.color }}>
              {k.value}
            </div>
            <div className="campaign-kpi-label">{k.label}</div>
            <div className="campaign-kpi-bar">
              <div
                className="campaign-kpi-fill"
                style={{ width: `${k.pct}%`, background: k.color }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Diagnostics */}
      <DiagnosticPanel campaignId={c._backendId || c.id} sequence={c.sequence} />
    </div>
  );
}
