/* ═══════════════════════════════════════════════════
   AI Bar Component
   ═══════════════════════════════════════════════════ */

import { useState } from 'react';

export default function AiBar({ aiBar, onApplyAll, onDismissAll }) {
  const [dismissed, setDismissed] = useState(false);
  const [applied, setApplied] = useState(false);

  if (!aiBar || dismissed) return null;

  return (
    <div className="ai-bar" style={applied ? { borderColor: 'var(--success)' } : undefined}>
      <div className="ai-bar-icon">~</div>
      <div className="ai-bar-content">
        <div className="ai-bar-title">
          {applied ? 'Toutes les suggestions appliquees' : aiBar.title}
        </div>
        <div className="ai-bar-text">
          {applied
            ? 'Verifiez les modifications et sauvegardez quand vous etes satisfait.'
            : aiBar.text}
        </div>
      </div>
      {!applied && (
        <>
          <button
            className="btn btn-ghost"
            style={{ fontSize: '11px', padding: '6px 12px', whiteSpace: 'nowrap' }}
            onClick={() => { setApplied(true); onApplyAll(); }}
          >
            Appliquer tout
          </button>
          <button
            className="btn btn-ghost"
            style={{ fontSize: '11px', padding: '6px 12px', whiteSpace: 'nowrap' }}
            onClick={() => { setDismissed(true); onDismissAll(); }}
          >
            Ignorer
          </button>
        </>
      )}
    </div>
  );
}
