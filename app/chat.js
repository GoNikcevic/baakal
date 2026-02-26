/* ═══════════════════════════════════════════════════
   BAKAL — Chat Interface
   Conversational campaign builder powered by Claude
   ═══════════════════════════════════════════════════ */

let _chatThreadId = null;
let _chatThreads = [];
let _chatSending = false;

/* ═══ Thread management ═══ */

async function loadChatThreads() {
  if (typeof BakalAPI === 'undefined' || !_backendAvailable) return;
  try {
    const data = await BakalAPI.request('/chat/threads');
    _chatThreads = data.threads || [];
    renderChatThreadList();
  } catch {
    _chatThreads = [];
    renderChatThreadList();
  }
}

async function newChatThread() {
  if (typeof BakalAPI === 'undefined' || !_backendAvailable) {
    // Offline mode — just reset the UI
    _chatThreadId = null;
    showChatWelcome();
    return;
  }
  try {
    const thread = await BakalAPI.request('/chat/threads', {
      method: 'POST',
      body: JSON.stringify({ title: 'Nouvelle conversation' }),
    });
    _chatThreadId = thread.id;
    await loadChatThreads();
    showChatWelcome();
  } catch (err) {
    console.warn('Failed to create thread:', err.message);
    _chatThreadId = null;
    showChatWelcome();
  }
}

async function selectChatThread(threadId) {
  _chatThreadId = threadId;
  renderChatThreadList();

  if (typeof BakalAPI === 'undefined' || !_backendAvailable) return;
  try {
    const data = await BakalAPI.request('/chat/threads/' + threadId + '/messages');
    const messages = data.messages || [];
    if (messages.length === 0) {
      showChatWelcome();
    } else {
      showChatMessages();
      const inner = document.getElementById('chatMessagesInner');
      inner.innerHTML = '';
      messages.forEach(m => {
        const metadata = m.metadata ? (typeof m.metadata === 'string' ? JSON.parse(m.metadata) : m.metadata) : null;
        appendMessage(m.role, m.content, metadata, false);
      });
      scrollChatToBottom();
    }
  } catch (err) {
    console.warn('Failed to load thread messages:', err.message);
  }
}

async function deleteChatThread(threadId, e) {
  e.stopPropagation();
  if (typeof BakalAPI === 'undefined' || !_backendAvailable) return;
  try {
    await BakalAPI.request('/chat/threads/' + threadId, { method: 'DELETE' });
    if (_chatThreadId === threadId) {
      _chatThreadId = null;
      showChatWelcome();
    }
    await loadChatThreads();
  } catch (err) {
    console.warn('Failed to delete thread:', err.message);
  }
}

function renderChatThreadList() {
  const list = document.getElementById('chatThreadList');
  if (!list) return;

  if (_chatThreads.length === 0) {
    list.innerHTML = '<div style="padding:20px 12px;text-align:center;font-size:12px;color:var(--text-muted);">Aucune conversation</div>';
    return;
  }

  list.innerHTML = _chatThreads.map(t => {
    const active = t.id === _chatThreadId ? ' active' : '';
    const date = new Date(t.updated_at || t.created_at);
    const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    return `<div class="chat-thread-item${active}" onclick="selectChatThread(${t.id})">
      <span class="thread-title">${escapeHtml(t.title)}</span>
      <span class="thread-date">${dateStr}</span>
      <button class="chat-thread-delete" onclick="deleteChatThread(${t.id}, event)" title="Supprimer">×</button>
    </div>`;
  }).join('');
}

/* ═══ Display helpers ═══ */

function showChatWelcome() {
  document.getElementById('chatWelcome').style.display = 'flex';
  document.getElementById('chatMessages').style.display = 'none';
  document.getElementById('chatMessagesInner').innerHTML = '';
  document.getElementById('chatInput').value = '';
  document.getElementById('chatInput').focus();
}

function showChatMessages() {
  document.getElementById('chatWelcome').style.display = 'none';
  document.getElementById('chatMessages').style.display = 'flex';
}

function scrollChatToBottom() {
  const container = document.getElementById('chatMessages');
  setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
}

/* ═══ Message rendering ═══ */

function appendMessage(role, content, metadata, animate = true) {
  showChatMessages();
  const inner = document.getElementById('chatMessagesInner');

  const avatar = role === 'assistant' ? 'B' : '→';
  const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Format the content
  let formattedContent = content;
  if (role === 'assistant') {
    // Remove JSON code blocks from display (they become action cards)
    formattedContent = formattedContent.replace(/```json\s*[\s\S]*?```/g, '').trim();
    formattedContent = formatMarkdown(formattedContent);
  } else {
    formattedContent = escapeHtml(formattedContent);
  }

  let actionCardHtml = '';
  if (metadata && metadata.action === 'create_campaign' && metadata.campaign) {
    actionCardHtml = renderActionCard(metadata.campaign);
  }

  const msgHtml = `
    <div class="chat-msg ${role}"${animate ? ' style="animation:chatFadeIn 0.25s ease"' : ''}>
      <div class="chat-msg-avatar">${avatar}</div>
      <div class="chat-msg-body">
        <div class="chat-msg-content">${formattedContent}</div>
        ${actionCardHtml}
        <div class="chat-msg-time">${timeStr}</div>
      </div>
    </div>`;

  inner.insertAdjacentHTML('beforeend', msgHtml);
  scrollChatToBottom();
}

function renderActionCard(campaign) {
  const params = [campaign.sector, campaign.position, campaign.size, campaign.channel, campaign.angle, campaign.zone]
    .filter(Boolean)
    .map(p => `<span class="chat-action-param">${escapeHtml(p)}</span>`)
    .join('');

  let stepsHtml = '';
  if (campaign.sequence && campaign.sequence.length > 0) {
    stepsHtml = campaign.sequence.map(s =>
      `<div class="chat-action-step">
        <div class="chat-action-step-dot ${s.type}"></div>
        <span>${escapeHtml(s.step)} — ${escapeHtml(s.label || s.type)}</span>
        <span style="color:var(--text-muted);margin-left:auto;">${escapeHtml(s.timing || '')}</span>
      </div>`
    ).join('');
    stepsHtml = `<div class="chat-action-sequence">${stepsHtml}</div>`;
  }

  // Store campaign data for the button
  const campaignJson = escapeHtml(JSON.stringify(campaign));

  return `
    <div class="chat-action-card">
      <div class="chat-action-title">Campagne prête : ${escapeHtml(campaign.name)}</div>
      <div class="chat-action-params">${params}</div>
      ${stepsHtml}
      <div class="chat-action-buttons">
        <button class="chat-action-btn primary" onclick='createCampaignFromChat(${campaignJson})'>Créer et voir la séquence →</button>
        <button class="chat-action-btn ghost" onclick="sendChatMessage('Peux-tu ajuster cette campagne ?')">Modifier</button>
      </div>
    </div>`;
}

/* ═══ Typing indicator ═══ */

function showTypingIndicator() {
  const inner = document.getElementById('chatMessagesInner');
  inner.insertAdjacentHTML('beforeend', `
    <div class="chat-typing" id="chatTyping">
      <div class="chat-msg-avatar" style="width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;background:var(--accent-glow);color:var(--accent-light);border:1px solid rgba(108,92,231,0.2);">B</div>
      <div class="chat-typing-dots">
        <div class="chat-typing-dot"></div>
        <div class="chat-typing-dot"></div>
        <div class="chat-typing-dot"></div>
      </div>
    </div>`);
  scrollChatToBottom();
}

function hideTypingIndicator() {
  document.getElementById('chatTyping')?.remove();
}

/* ═══ Send messages ═══ */

async function sendChatMessage(overrideText) {
  if (_chatSending) return;

  const input = document.getElementById('chatInput');
  const text = overrideText || input.value.trim();
  if (!text) return;

  // Clear input
  if (!overrideText) {
    input.value = '';
    autoResizeChatInput(input);
  }

  // If no thread, create one first
  if (!_chatThreadId && typeof BakalAPI !== 'undefined' && _backendAvailable) {
    try {
      const thread = await BakalAPI.request('/chat/threads', {
        method: 'POST',
        body: JSON.stringify({ title: text.slice(0, 60) }),
      });
      _chatThreadId = thread.id;
      await loadChatThreads();
    } catch (err) {
      console.warn('Failed to create thread:', err.message);
    }
  }

  // Show user message
  appendMessage('user', text);
  showTypingIndicator();
  _chatSending = true;
  updateSendButton();

  // Try backend
  if (_chatThreadId && typeof BakalAPI !== 'undefined' && _backendAvailable) {
    try {
      const data = await BakalAPI.request('/chat/threads/' + _chatThreadId + '/messages', {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      });
      hideTypingIndicator();
      appendMessage('assistant', data.message.content, data.message.metadata);
      // Refresh thread list (title may have changed)
      loadChatThreads();
    } catch (err) {
      hideTypingIndicator();
      appendMessage('assistant', 'Désolé, je ne peux pas répondre pour le moment. Vérifiez que le backend est démarré et que la clé API Claude est configurée.\n\n`' + err.message + '`');
    }
  } else {
    // Offline fallback — simulate response
    setTimeout(() => {
      hideTypingIndicator();
      appendMessage('assistant', 'Le backend n\'est pas connecté. Démarrez le serveur avec `cd backend && node server.js` pour activer l\'assistant IA.\n\nEn attendant, vous pouvez explorer le dashboard et les autres pages.');
    }, 800);
  }

  _chatSending = false;
  updateSendButton();
  input.focus();
}

function sendSuggestion(btn) {
  sendChatMessage(btn.textContent);
}

/* ═══ Campaign creation from chat ═══ */

async function createCampaignFromChat(campaignData) {
  // Create via backend if available
  if (_chatThreadId && typeof BakalAPI !== 'undefined' && _backendAvailable) {
    try {
      const result = await BakalAPI.request('/chat/threads/' + _chatThreadId + '/create-campaign', {
        method: 'POST',
        body: JSON.stringify({ campaign: campaignData }),
      });

      // Add to local BAKAL data
      if (typeof BAKAL !== 'undefined' && result.campaign) {
        const id = String(result.campaign.id);
        BAKAL.campaigns[id] = {
          _backendId: result.campaign.id,
          id: id,
          name: campaignData.name,
          client: campaignData.client || 'Mon entreprise',
          status: 'prep',
          channel: campaignData.channel || 'email',
          channelLabel: campaignData.channel === 'linkedin' ? '💼 LinkedIn' : campaignData.channel === 'multi' ? '📧+💼 Multi' : '✉️ Email',
          channelColor: campaignData.channel === 'linkedin' ? 'var(--purple)' : campaignData.channel === 'multi' ? 'var(--orange)' : 'var(--blue)',
          sector: campaignData.sector || '',
          sectorShort: (campaignData.sector || '').split(' ')[0],
          position: campaignData.position || '',
          size: campaignData.size || '',
          angle: campaignData.angle || '',
          zone: campaignData.zone || '',
          tone: campaignData.tone || 'Pro décontracté',
          formality: 'Vous',
          length: 'Standard',
          cta: '',
          volume: { sent: 0, planned: 100 },
          iteration: 0,
          startDate: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          lemlistRef: null,
          nextAction: null,
          kpis: { contacts: 0, openRate: null, replyRate: null, interested: null, meetings: null },
          sequence: (campaignData.sequence || []).map(s => ({
            id: s.step, type: s.type, label: s.label || '', timing: s.timing || '',
            subType: '', subject: s.subject || null, body: s.body || '', stats: null,
          })),
          diagnostics: [],
          history: [],
          prepChecklist: [],
          info: { period: '', copyDesc: '', channelsDesc: '', launchEstimate: '' },
        };
        if (typeof initFromData === 'function') initFromData();
      }

      // Navigate to copy editor
      appendMessage('assistant', `Campagne **"${campaignData.name}"** créée avec succès ! Vous allez être redirigé vers l'éditeur de séquences.`);
      setTimeout(() => {
        showPage('copyeditor');
      }, 1200);
      return;
    } catch (err) {
      appendMessage('assistant', 'Erreur lors de la création : `' + err.message + '`. Essayez de créer la campagne manuellement.');
      return;
    }
  }

  // Offline fallback
  appendMessage('assistant', 'Le backend n\'est pas connecté. Vous pouvez créer cette campagne manuellement via le bouton **+ Nouvelle campagne** du dashboard.');
}

/* ═══ Input handling ═══ */

function handleChatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}

function autoResizeChatInput(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
}

function updateSendButton() {
  const btn = document.getElementById('chatSendBtn');
  if (btn) btn.disabled = _chatSending;
}

/* ═══ Init ═══ */

function initChat() {
  loadChatThreads();
  // Auto-select latest thread or show welcome
  if (_chatThreads.length > 0 && !_chatThreadId) {
    selectChatThread(_chatThreads[0].id);
  } else {
    showChatWelcome();
  }
  document.getElementById('chatInput')?.focus();
}

/* ═══ Formatting helpers ═══ */

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatMarkdown(text) {
  if (!text) return '';
  let html = escapeHtml(text);

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  // Bullet lists
  html = html.replace(/(?:^|<br>)- (.+?)(?=<br>|<\/p>|$)/g, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  // Numbered lists
  html = html.replace(/(?:^|<br>)\d+\. (.+?)(?=<br>|<\/p>|$)/g, '<li>$1</li>');

  return '<p>' + html + '</p>';
}
