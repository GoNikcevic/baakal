/* ═══════════════════════════════════════════════════
   Editor Sidebar Component
   ═══════════════════════════════════════════════════ */

export default function EditorSidebar({ editorCampaigns, activeCampaign, onSelect }) {
  return (
    <div className="editor-sidebar" id="editor-campaign-list" style={{ width: '280px', borderRight: '1px solid var(--border)', overflow: 'auto', flexShrink: 0 }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '14px' }}>
        Campagnes
      </div>
      {Object.entries(editorCampaigns).map(([key, c]) => {
        const active = key === activeCampaign ? ' active' : '';
        const statusDot = c.status === 'active'
          ? <span className="pulse-dot" style={{ width: '6px', height: '6px', marginLeft: '4px' }}></span>
          : <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--warning)', marginLeft: '4px' }}></span>;
        return (
          <div key={key} className={`editor-campaign-item${active}`} onClick={() => onSelect(key)}>
            <div className="eci-icon" style={{ background: c.iconBg }}>{c.icon}</div>
            <div>
              <div className="eci-name">{c.name} {statusDot}</div>
              <div className="eci-meta">{c.meta}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
