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
