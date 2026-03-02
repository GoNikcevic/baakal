/* ═══════════════════════════════════════════════════
   BAKAL — LocalStorage Persistence Layer
   Saves and restores app state across page refreshes.
   Drop-in replacement for future Notion API backend.
   ═══════════════════════════════════════════════════ */

const BakalStore = (() => {
  const STORAGE_KEY = 'bakal_app_state';
  const VERSION = 1;

  /* ─── Save current state to localStorage ─── */
  function save() {
    try {
      const state = {
        _v: VERSION,
        _ts: Date.now(),
        demoMode: typeof _demoMode !== 'undefined' ? _demoMode : true,
        bakal: {
          campaigns: BAKAL.campaigns,
          globalKpis: BAKAL.globalKpis,
          opportunities: BAKAL.opportunities,
          recommendations: BAKAL.recommendations,
          reports: BAKAL.reports,
          chartData: BAKAL.chartData
        },
        editorCampaigns: typeof editorCampaigns !== 'undefined' ? editorCampaigns : null,
        customVariables: typeof variableRegistry !== 'undefined' ? variableRegistry.custom : []
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('[BakalStore] Save failed:', e.message);
    }
  }

  /* ─── Load saved state (returns null if none) ─── */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const state = JSON.parse(raw);
      if (!state || state._v !== VERSION) return null;
      return state;
    } catch (e) {
      console.warn('[BakalStore] Load failed:', e.message);
      return null;
    }
  }

  /* ─── Restore saved state into live objects ─── */
  function restore() {
    const state = load();
    if (!state) return false;

    // Restore demo mode flag
    if (typeof state.demoMode !== 'undefined') {
      _demoMode = state.demoMode;
    }

    // Restore BAKAL data
    if (state.bakal) {
      BAKAL.campaigns = state.bakal.campaigns || {};
      BAKAL.globalKpis = state.bakal.globalKpis || {};
      BAKAL.opportunities = state.bakal.opportunities || [];
      BAKAL.recommendations = state.bakal.recommendations || [];
      BAKAL.reports = state.bakal.reports || [];
      BAKAL.chartData = state.bakal.chartData || [];
    }

    // Restore editor campaigns
    if (state.editorCampaigns && typeof editorCampaigns !== 'undefined') {
      Object.keys(state.editorCampaigns).forEach(key => {
        editorCampaigns[key] = state.editorCampaigns[key];
      });
    }

    // Restore custom variables
    if (state.customVariables && typeof variableRegistry !== 'undefined') {
      variableRegistry.custom = state.customVariables;
    }

    return true;
  }

  /* ─── Clear saved state ─── */
  function clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  /* ─── Check if saved state exists ─── */
  function hasSavedState() {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  return { save, load, restore, clear, hasSavedState };
})();
