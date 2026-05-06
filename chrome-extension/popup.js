const API_BASE = 'https://app.baakal.ai/api';
const STORAGE_KEY = 'baakalai_token';
const REFRESH_KEY = 'baakalai_refresh';

const content = document.getElementById('content');

// ── Init ──

async function init() {
  const token = await getToken();
  if (!token) {
    showLoginForm();
    return;
  }

  // Verify token is still valid
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      // Try refresh
      const refreshed = await tryRefreshToken();
      if (!refreshed) { showLoginForm(); return; }
    }
  } catch {
    showLoginForm();
    return;
  }

  // Check LinkedIn cookie
  const cookie = await getLinkedInCookie();

  try {
    const res = await fetch(`${API_BASE}/signals/linkedin/status`, {
      headers: { Authorization: `Bearer ${await getToken()}` },
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
    if (cookie) showReadyToConnect(cookie);
    else showNoLinkedIn();
  }
}

// ── LinkedIn cookie ──

function getLinkedInCookie() {
  return new Promise((resolve) => {
    chrome.cookies.get({ url: 'https://www.linkedin.com', name: 'li_at' }, (cookie) => {
      resolve(cookie?.value || null);
    });
  });
}

// ── Token storage ──

function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (data) => resolve(data[STORAGE_KEY] || null));
  });
}
function getRefreshToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(REFRESH_KEY, (data) => resolve(data[REFRESH_KEY] || null));
  });
}
function saveTokens(token, refreshToken) {
  return new Promise((resolve) => {
    const data = { [STORAGE_KEY]: token };
    if (refreshToken) data[REFRESH_KEY] = refreshToken;
    chrome.storage.local.set(data, resolve);
  });
}
function clearTokens() {
  return new Promise((resolve) => {
    chrome.storage.local.remove([STORAGE_KEY, REFRESH_KEY], resolve);
  });
}

async function tryRefreshToken() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    await saveTokens(data.token, data.refreshToken);
    return true;
  } catch { return false; }
}

// ── Views ──

function showLoginForm() {
  content.innerHTML = `
    <div class="status disconnected">
      <div class="label">Log in to Baakalai</div>
      <div class="detail">Use your Baakalai account credentials.</div>
    </div>
    <input id="email" type="email" placeholder="Email" autocomplete="email"
      style="width:100%;padding:8px 12px;border:1px solid #E5E5E3;border-radius:8px;font-size:12px;margin-bottom:8px;">
    <input id="password" type="password" placeholder="Password" autocomplete="current-password"
      style="width:100%;padding:8px 12px;border:1px solid #E5E5E3;border-radius:8px;font-size:12px;margin-bottom:8px;">
    <button class="btn btn-primary" id="login-btn">Log in</button>
    <div style="text-align:center;margin:10px 0;">
      <span style="font-size:11px;color:#737373;">or</span>
    </div>
    <button class="btn" id="google-btn" style="width:100%;background:#fff;border:1px solid #E5E5E3;color:#0A0A0A;display:flex;align-items:center;justify-content:center;gap:8px;">
      <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
      Sign in with Google
    </button>
    <div id="msg"></div>
  `;

  document.getElementById('login-btn').onclick = handleLogin;
  document.getElementById('password').onkeydown = (e) => { if (e.key === 'Enter') handleLogin(); };
  document.getElementById('google-btn').onclick = handleGoogleLogin;
}

async function handleLogin() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  if (!email || !password) return;

  const btn = document.getElementById('login-btn');
  btn.disabled = true; btn.textContent = 'Logging in...';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    await saveTokens(data.token, data.refreshToken);
    showMsg('success', 'Logged in!');
    setTimeout(init, 800);
  } catch (err) {
    showMsg('error', err.message);
    btn.disabled = false; btn.textContent = 'Log in';
  }
}

function handleGoogleLogin() {
  // Open Google OAuth in a new tab — user logs in, gets redirected to app.baakal.ai
  // They copy the token from there (or we detect it via the extension)
  chrome.tabs.create({ url: 'https://app.baakal.ai/api/auth/google' });

  // Poll for token after Google redirect
  showMsg('success', 'Complete Google sign-in in the new tab...');
  let attempts = 0;
  const poll = setInterval(async () => {
    attempts++;
    if (attempts > 30) { clearInterval(poll); return; }

    // Try to get token from app.baakal.ai localStorage via content script
    try {
      const tabs = await chrome.tabs.query({ url: 'https://app.baakal.ai/*' });
      for (const tab of tabs) {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => ({
            token: localStorage.getItem('bakal_token'),
            refresh: localStorage.getItem('bakal_refresh_token'),
          }),
        });
        const data = results?.[0]?.result;
        if (data?.token) {
          clearInterval(poll);
          await saveTokens(data.token, data.refresh);
          showMsg('success', 'Connected via Google!');
          setTimeout(init, 800);
          return;
        }
      }
    } catch { /* tab not ready yet */ }
  }, 2000);
}

function showNoLinkedIn() {
  content.innerHTML = `
    <div class="status disconnected">
      <div class="label">LinkedIn not detected</div>
      <div class="detail">Log in to linkedin.com first, then reopen this popup.</div>
    </div>
    <a href="https://www.linkedin.com/login" target="_blank" class="btn btn-primary" style="display:block;text-align:center;text-decoration:none;color:#fff;">
      Open LinkedIn
    </a>
    <button class="btn btn-danger" id="logout-ext" style="margin-top:8px;">Log out of Baakalai</button>
  `;
  document.getElementById('logout-ext').onclick = async () => { await clearTokens(); init(); };
}

function showReadyToConnect(cookie) {
  const preview = cookie.slice(0, 12) + '...' + cookie.slice(-6);
  content.innerHTML = `
    <div class="status disconnected">
      <div class="label">LinkedIn session found</div>
      <div class="detail">Cookie: ${preview}</div>
    </div>
    <button class="btn btn-primary" id="connect-btn">Connect LinkedIn to Baakalai</button>
    <div id="msg"></div>
  `;
  document.getElementById('connect-btn').onclick = () => sendCookie(cookie);
}

function showConnected(name, counts, cookie) {
  content.innerHTML = `
    <div class="status connected">
      <div class="label">LinkedIn connected</div>
      <div class="detail">${name || 'Connected'}</div>
      ${counts ? `<div class="detail" style="margin-top:4px;">
        Today: ${counts.connections || 0}/30 connections · ${counts.views || 0}/50 views · ${counts.messages || 0}/20 messages
      </div>` : ''}
    </div>
    <button class="btn btn-primary" id="refresh-btn">Refresh cookie</button>
    <button class="btn btn-danger" id="disconnect-btn">Disconnect LinkedIn</button>
    <button class="btn" id="logout-ext" style="width:100%;margin-top:4px;background:transparent;color:#737373;border:1px solid #E5E5E3;font-size:11px;">
      Log out of Baakalai
    </button>
    <div id="msg"></div>
  `;
  document.getElementById('refresh-btn').onclick = async () => {
    const newCookie = await getLinkedInCookie();
    if (newCookie) sendCookie(newCookie);
    else showMsg('error', 'No LinkedIn cookie found.');
  };
  document.getElementById('disconnect-btn').onclick = () => disconnectLinkedIn();
  document.getElementById('logout-ext').onclick = async () => { await clearTokens(); init(); };
}

// ── Actions ──

async function sendCookie(cookie) {
  const btn = document.getElementById('connect-btn') || document.getElementById('refresh-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Connecting...'; }

  try {
    const token = await getToken();
    const res = await fetch(`${API_BASE}/settings/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ linkedinKey: cookie }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    showMsg('success', 'LinkedIn connected!');
    setTimeout(init, 1500);
  } catch (err) {
    showMsg('error', `Failed: ${err.message}`);
    if (btn) { btn.disabled = false; btn.textContent = 'Try again'; }
  }
}

async function disconnectLinkedIn() {
  try {
    const token = await getToken();
    await fetch(`${API_BASE}/settings/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ linkedinKey: '' }),
    });
    showMsg('success', 'Disconnected.');
    setTimeout(init, 1500);
  } catch (err) { showMsg('error', err.message); }
}

function showMsg(type, text) {
  const el = document.getElementById('msg');
  if (el) el.innerHTML = `<div class="${type}">${text}</div>`;
}

init();
