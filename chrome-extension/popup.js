const API_BASE = 'https://app.baakal.ai/api';
const STORAGE_KEY = 'baakalai_token';

const content = document.getElementById('content');

// ── Init ──

async function init() {
  const token = await getToken();
  if (!token) {
    showLoginPrompt();
    return;
  }

  // Check if LinkedIn cookie exists
  const cookie = await getLinkedInCookie();

  // Check current connection status
  try {
    const res = await fetch(`${API_BASE}/signals/linkedin/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (data.connected) {
      showConnected(data.name, data.counts, cookie);
    } else if (cookie) {
      showReadyToConnect(cookie);
    } else {
      showNoLinkedIn();
    }
  } catch {
    if (cookie) {
      showReadyToConnect(cookie);
    } else {
      showNoLinkedIn();
    }
  }
}

// ── Get LinkedIn li_at cookie ──

function getLinkedInCookie() {
  return new Promise((resolve) => {
    chrome.cookies.get({ url: 'https://www.linkedin.com', name: 'li_at' }, (cookie) => {
      resolve(cookie?.value || null);
    });
  });
}

// ── Get Baakalai auth token ──

function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      resolve(data[STORAGE_KEY] || null);
    });
  });
}

function saveToken(token) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: token }, resolve);
  });
}

// ── Views ──

function showLoginPrompt() {
  content.innerHTML = `
    <div class="status disconnected">
      <div class="label">Not connected to Baakalai</div>
      <div class="detail">Log in to your Baakalai account first, then paste your token here.</div>
    </div>
    <input id="token-input" type="password" placeholder="Paste your Baakalai JWT token"
      style="width:100%;padding:8px 12px;border:1px solid #E5E5E3;border-radius:8px;font-size:12px;margin-bottom:8px;">
    <button class="btn btn-primary" id="save-token">Connect to Baakalai</button>
    <div class="login-prompt" style="margin-top:10px;">
      <a href="https://app.baakal.ai/settings" target="_blank">Open Baakalai Settings →</a>
    </div>
  `;
  document.getElementById('save-token').onclick = async () => {
    const token = document.getElementById('token-input').value.trim();
    if (!token) return;
    await saveToken(token);
    init();
  };
}

function showNoLinkedIn() {
  content.innerHTML = `
    <div class="status disconnected">
      <div class="label">LinkedIn not detected</div>
      <div class="detail">Please log in to linkedin.com first, then reopen this popup.</div>
    </div>
    <a href="https://www.linkedin.com/login" target="_blank" class="btn btn-primary" style="display:block;text-align:center;text-decoration:none;color:#fff;">
      Open LinkedIn →
    </a>
  `;
}

function showReadyToConnect(cookie) {
  const preview = cookie.slice(0, 12) + '...' + cookie.slice(-6);
  content.innerHTML = `
    <div class="status disconnected">
      <div class="label">LinkedIn session found</div>
      <div class="detail">Cookie: ${preview}</div>
    </div>
    <button class="btn btn-primary" id="connect-btn">🔗 Connect LinkedIn to Baakalai</button>
    <div id="msg"></div>
  `;
  document.getElementById('connect-btn').onclick = () => sendCookie(cookie);
}

function showConnected(name, counts, cookie) {
  content.innerHTML = `
    <div class="status connected">
      <div class="label">✅ LinkedIn connected</div>
      <div class="detail">${name || 'Connected'}</div>
      ${counts ? `<div class="detail" style="margin-top:4px;">
        Today: ${counts.connections || 0}/30 connections · ${counts.views || 0}/50 views · ${counts.messages || 0}/20 messages
      </div>` : ''}
    </div>
    <button class="btn btn-primary" id="refresh-btn">🔄 Refresh cookie</button>
    <button class="btn btn-danger" id="disconnect-btn">Disconnect LinkedIn</button>
    <div id="msg"></div>
  `;
  document.getElementById('refresh-btn').onclick = async () => {
    const newCookie = await getLinkedInCookie();
    if (newCookie) sendCookie(newCookie);
    else showMsg('error', 'No LinkedIn cookie found. Please log in to LinkedIn.');
  };
  document.getElementById('disconnect-btn').onclick = () => disconnectLinkedIn();
}

// ── Actions ──

async function sendCookie(cookie) {
  const btn = document.getElementById('connect-btn') || document.getElementById('refresh-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Connecting...'; }

  try {
    const token = await getToken();
    const res = await fetch(`${API_BASE}/settings/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ linkedinKey: cookie }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    showMsg('success', 'LinkedIn connected! Baakalai can now enrich and outreach on LinkedIn.');
    setTimeout(init, 1500);
  } catch (err) {
    showMsg('error', `Failed: ${err.message}`);
    if (btn) { btn.disabled = false; btn.textContent = '🔗 Try again'; }
  }
}

async function disconnectLinkedIn() {
  try {
    const token = await getToken();
    await fetch(`${API_BASE}/settings/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ linkedinKey: '' }),
    });
    showMsg('success', 'LinkedIn disconnected.');
    setTimeout(init, 1500);
  } catch (err) {
    showMsg('error', `Failed: ${err.message}`);
  }
}

function showMsg(type, text) {
  const el = document.getElementById('msg');
  if (el) el.innerHTML = `<div class="${type}">${text}</div>`;
}

// Start
init();
