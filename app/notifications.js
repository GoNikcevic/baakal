/* ═══════════════════════════════════════════════════════════════════════════
   BAKAL — Toast Notifications & Notification Panel
   Global notification system for campaign alerts and user feedback
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══ Toast System ═══ */

let _toastCounter = 0;

/**
 * Show a toast notification
 * @param {Object} opts
 * @param {string} opts.type - 'success' | 'warning' | 'danger' | 'info'
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {number} [opts.duration=5000] - Auto-dismiss in ms (0 = manual close)
 */
function showToast({ type = 'info', title, message, duration = 5000 }) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const id = 'toast-' + (++_toastCounter);
  const iconMap = {
    success: '✅', warning: '⚠️', danger: '❌', info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.id = id;
  toast.style.position = 'relative';
  toast.innerHTML = `
    <div class="toast-icon ${type}">${iconMap[type]}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="dismissToast('${id}')">&times;</button>
    ${duration > 0 ? `<div class="toast-progress" style="width:100%;"></div>` : ''}
  `;

  container.appendChild(toast);

  // Auto-dismiss with progress bar
  if (duration > 0) {
    const bar = toast.querySelector('.toast-progress');
    if (bar) {
      bar.style.transitionDuration = duration + 'ms';
      requestAnimationFrame(() => { bar.style.width = '0%'; });
    }
    setTimeout(() => dismissToast(id), duration);
  }
}

function dismissToast(id) {
  const toast = document.getElementById(id);
  if (!toast) return;
  toast.classList.add('removing');
  setTimeout(() => toast.remove(), 300);
}


/* ═══ Notification Panel ═══ */

function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (panel) panel.classList.toggle('open');
}

function clearNotifications(e) {
  if (e) e.stopPropagation();
  const items = document.querySelectorAll('#notifList .notif-item');
  items.forEach(item => item.classList.remove('unread'));
  const badge = document.getElementById('notifBadge');
  if (badge) badge.textContent = '';
}

// Close notif panel when clicking outside
document.addEventListener('click', (e) => {
  const panel = document.getElementById('notifPanel');
  const bell = e.target.closest('.notif-bell');
  if (panel && panel.classList.contains('open') && !bell) {
    panel.classList.remove('open');
  }
});

/**
 * Add a notification to the panel
 */
function addNotification({ icon = '📢', iconBg = 'var(--blue-bg)', iconColor = 'var(--blue)', title, desc, time = 'À l\'instant' }) {
  const list = document.getElementById('notifList');
  const badge = document.getElementById('notifBadge');
  if (!list) return;

  const item = document.createElement('div');
  item.className = 'notif-item unread';
  item.innerHTML = `
    <div class="notif-item-icon" style="background:${iconBg};color:${iconColor};">${icon}</div>
    <div class="notif-item-content">
      <div class="notif-item-title">${title}</div>
      <div class="notif-item-desc">${desc}</div>
      <div class="notif-item-time">${time}</div>
    </div>
  `;

  list.insertBefore(item, list.firstChild);

  // Update badge count
  const unreadCount = list.querySelectorAll('.notif-item.unread').length;
  if (badge) badge.textContent = unreadCount > 0 ? unreadCount : '';
}


/* ═══ Campaign Alert Triggers ═══ */

/**
 * Check campaigns and trigger notifications for attention-worthy events
 * Called after data load or refresh
 */
function checkCampaignAlerts() {
  if (typeof BAKAL === 'undefined' || !BAKAL.campaigns) return;

  Object.values(BAKAL.campaigns).forEach(c => {
    if (c.status !== 'active') return;

    // Low reply rate alert
    if (c.kpis.replyRate !== null && c.kpis.replyRate < 5) {
      showToast({
        type: 'warning',
        title: `Taux de réponse faible — ${c.name}`,
        message: `${c.kpis.replyRate}% de réponse. Vérifiez les recommandations.`,
        duration: 8000
      });
    }

    // Good open rate celebration
    if (c.kpis.openRate !== null && c.kpis.openRate > 65) {
      showToast({
        type: 'success',
        title: `Excellentes ouvertures — ${c.name}`,
        message: `${c.kpis.openRate}% d'ouverture, au-dessus du benchmark.`,
        duration: 6000
      });
    }
  });
}


/* ═══ Settings — Connection Status Sync ═══ */

function updateSettingsConnectionStatus() {
  const statusMap = {
    'status-lemlist': 'settings-conn-lemlist',
    'status-notion': 'settings-conn-notion',
    'status-claude': 'settings-conn-claude'
  };

  for (const [sourceId, targetId] of Object.entries(statusMap)) {
    const source = document.getElementById(sourceId);
    const target = document.getElementById(targetId);
    if (!source || !target) continue;

    if (source.classList.contains('connected')) {
      target.textContent = 'Connecté';
      target.className = 'settings-status-state online';
    } else if (source.classList.contains('error')) {
      target.textContent = 'Erreur';
      target.className = 'settings-status-state error';
    } else {
      target.textContent = 'Non connecté';
      target.className = 'settings-status-state offline';
    }
  }
}

/* ═══ Settings — Reset preferences ═══ */
function resetAllPreferences() {
  if (!confirm('Réinitialiser tous les paramètres ? Cette action est irréversible.')) return;

  localStorage.removeItem('bakal_settings_prefs');
  localStorage.removeItem('bakal_profile');
  localStorage.removeItem('bakal-theme');

  showToast({
    type: 'info',
    title: 'Préférences réinitialisées',
    message: 'Tous les paramètres ont été remis à zéro.',
    duration: 4000
  });

  // Reload settings UI
  if (typeof loadSettingsPrefs === 'function') loadSettingsPrefs();
  if (typeof initTheme === 'function') initTheme();

  setTimeout(() => location.reload(), 1500);
}


/* ═══ Patch testApiConnections to update status cards ═══ */

const _originalTestApi = typeof testApiConnections === 'function' ? testApiConnections : null;

// Override will be set after DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Sync status cards on load
  setTimeout(updateSettingsConnectionStatus, 1000);
});
