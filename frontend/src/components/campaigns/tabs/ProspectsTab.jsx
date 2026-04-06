import { useEffect, useState } from 'react';
import api from '../../../services/api-client';
import ProspectGenerator from '../ProspectGenerator';

export default function ProspectsTab({ campaign: c }) {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const backendId = c._backendId || c.id;
      const data = await api.listCampaignProspects(backendId);
      setProspects(data.prospects || []);
    } catch (err) {
      console.warn('Failed to load prospects:', err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, [c._backendId, c.id]);

  return (
    <div>
      <ProspectGenerator campaign={c} onProspectsAdded={reload} />

      {/* Listed prospects */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
          📋 Prospects liés à la campagne ({prospects.length})
        </div>

        {loading ? (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chargement...</div>
        ) : prospects.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '12px 0' }}>
            Aucun prospect pour le moment. Génère-en avec le panel ci-dessus ou ajoute-en depuis le chat.
          </div>
        ) : (
          <div style={{ maxHeight: 400, overflow: 'auto' }}>
            {prospects.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {p.name} {!p.email && <span style={{ color: 'var(--warning)', fontSize: 10 }}>(sans email)</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {p.title} · {p.company} {p.company_size && `· ${p.company_size}`}
                  </div>
                </div>
                {p.status && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 10,
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {p.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
