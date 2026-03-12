// ═══════════════════════════════════════════════════════════════════════════
// BAKAL SaaS - Application JavaScript
// ═══════════════════════════════════════════════════════════════════════════
// Navigation:       inline <script> in bakal-saas-mockup.html
// Campaign details: campaigns-detail.js
// Copy editor:      copy-editor.js
// This file:        init, modal behaviour, keyboard shortcuts, auth gate
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════ MODAL — close on outside click ═══════════
document.getElementById('creatorModal')?.addEventListener('click', (e) => {
  if (e.target.classList.contains('creator-overlay')) {
    toggleCreator();
  }
});

// ═══════════ AUTH GATE + INIT ═══════════
document.addEventListener('DOMContentLoaded', async () => {
  // Offline preview mode: file:// or no backend — skip auth, load demo data
  if (window.location.protocol === 'file:') {
    console.log('Preview mode (file://) — skipping auth, loading demo data');
    bootApp();
    return;
  }

  // Check auth state
  if (typeof BakalAuth !== 'undefined') {
    if (BakalAuth.isLoggedIn()) {
      // Validate token with backend
      const valid = await BakalAuth.validateToken();
      if (valid) {
        bootApp();
        return;
      }
    }
    // Not logged in or token invalid — show login
    BakalAuth.showLoginScreen();
  } else {
    // Auth module not loaded — boot without auth (dev mode)
    bootApp();
  }
});

// ═══════════ BOOT APP (called after successful auth) ═══════════
async function bootApp() {
  // Update user display in sidebar
  if (typeof BakalAuth !== 'undefined') {
    BakalAuth.updateUserDisplay();
    injectUserMenu();
  }

  // Load data
  if (typeof initData === 'function') {
    await initData();
  } else {
    if (typeof loadDemoData === 'function') loadDemoData();
    if (typeof initFromData === 'function') initFromData();
  }

  // Start on the chat page
  showPage('chat');
}

// ═══════════ USER MENU (inject into sidebar bottom) ═══════════
function injectUserMenu() {
  const user = BakalAuth.getUser();
  if (!user) return;

  // Find the sidebar bottom area
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // Check if already injected
  if (document.getElementById('sidebar-user-section')) return;

  const section = document.createElement('div');
  section.id = 'sidebar-user-section';
  section.style.cssText = 'padding:12px 16px;border-top:1px solid var(--border);margin-top:auto;';
  section.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:32px;height:32px;border-radius:50%;background:var(--bg-elevated);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:var(--text-secondary);flex-shrink:0;">
        ${(user.name || 'U').charAt(0).toUpperCase()}
      </div>
      <div style="flex:1;min-width:0;">
        <div id="sidebar-user-name" style="font-size:12px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${user.name}</div>
        <div id="sidebar-user-email" style="font-size:11px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${user.email}</div>
      </div>
      <button onclick="BakalAuth.logout()" title="Se d\u00e9connecter"
        style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:4px;border-radius:4px;font-size:16px;line-height:1;"
        onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--text-muted)'"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
    </div>
  `;

  sidebar.appendChild(section);
}

// ═══════════ KEYBOARD SHORTCUTS ═══════════
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('creatorModal');
    if (modal && modal.classList.contains('show')) {
      toggleCreator();
    }
  }
});
