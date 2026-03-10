/* ═══════════════════════════════════════════════════
   Launch Bar Component
   ═══════════════════════════════════════════════════ */

import { useState, useCallback } from 'react';
import api from '../../services/api-client';

export default function LaunchBar({ campaign, campaignKey, touchpoints, backendAvailable, onLaunchSuccess }) {
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [error, setError] = useState(null);

  const handleLaunch = useCallback(async () => {
    setLaunching(true);
    setError(null);

    const backendId = campaign._backendId || campaignKey;
    if (backendAvailable) {
      try {
        await api.saveSequence(backendId, touchpoints);
        await api.updateCampaign(backendId, { status: 'active' });
      } catch (err) {
        console.warn('Backend launch failed:', err.message);
        setError(err.message);
        setLaunching(false);
        return;
      }
    }

    setLaunched(true);
    setLaunching(false);
    onLaunchSuccess();
  }, [campaign, campaignKey, touchpoints, backendAvailable, onLaunchSuccess]);

  if (launched) {
    return (
      <div className="editor-launch-bar" style={{ borderColor: 'var(--success)' }}>
        <div className="editor-launch-info" style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--success)', letterSpacing: '-0.2px' }}>
            Sequence deployee
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {touchpoints.length} touchpoints actifs -- Les premiers envois demarrent sous 24h
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-launch-bar">
      <div className="editor-launch-info">
        <div style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.2px' }}>Sequence prete</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {touchpoints.length} touchpoints -- Verifiez vos messages puis lancez la campagne
        </div>
      </div>
      <button
        className="btn-launch"
        disabled={launching}
        onClick={handleLaunch}
        style={launching ? { opacity: 0.6 } : undefined}
      >
        {launching ? 'Lancement en cours...' : 'Lancer la sequence'}
      </button>
      {error && (
        <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '8px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
