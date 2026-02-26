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
document.addEventListener('DOMContentLoaded', async () => {
  // Try backend first, fall back to demo data
  if (typeof initData === 'function') {
    await initData();
  } else {
    // Fallback if api-client.js not loaded
    if (typeof loadDemoData === 'function') loadDemoData();
    if (typeof initFromData === 'function') initFromData();
  }
  // Start on the chat page (the main experience)
  showPage('chat');
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
