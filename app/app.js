// ═══════════════════════════════════════════════════════════════════════════
// BAKAL SaaS - Application JavaScript
// ═══════════════════════════════════════════════════════════════════════════
// Navigation:       inline <script> in bakal-saas-mockup.html
// Campaign details: campaigns-detail.js
// Copy editor:      copy-editor.js
// This file:        init, modal behaviour, keyboard shortcuts
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════ MODAL — close on outside click ═══════════
document.getElementById('creatorModal')?.addEventListener('click', (e) => {
  if (e.target.classList.contains('creator-overlay')) {
    toggleCreator();
  }
});

// ═══════════ INIT ═══════════
document.addEventListener('DOMContentLoaded', () => {
  // Try to restore saved state first; fall back to demo data
  const restored = typeof BakalStore !== 'undefined' && BakalStore.restore();

  if (!restored) {
    if (typeof loadDemoData === 'function') loadDemoData();
  }

  // Sync the demo toggle switch to match restored state
  if (restored) {
    const toggle = document.getElementById('demoToggle');
    const label = document.getElementById('demoToggleLabel');
    if (toggle && label) {
      if (_demoMode) {
        toggle.classList.add('active');
        label.textContent = 'Données démo';
      } else {
        toggle.classList.remove('active');
        label.textContent = 'Nouvel utilisateur';
      }
    }
  }

  if (typeof initFromData === 'function') initFromData();
  showSection('overview');
  document.querySelector('.nav-item')?.classList.add('active');
});

// ═══════════ KEYBOARD SHORTCUTS ═══════════
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('creatorModal');
    if (modal.classList.contains('show')) {
      toggleCreator();
    }
  }
});
