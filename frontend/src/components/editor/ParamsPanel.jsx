/* ═══════════════════════════════════════════════════
   Params Panel Component
   ═══════════════════════════════════════════════════ */

export default function ParamsPanel({ params, onClose }) {
  return (
    <div id="params-panel" style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600 }}>Parametres de la campagne</div>
        <button className="tp-action" style={{ fontSize: '11px' }} onClick={onClose}>Fermer</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {params.map((p) => (
          <div key={p.l}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{p.l}</div>
            <div style={{ fontSize: '13px', fontWeight: 500 }}>{p.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
