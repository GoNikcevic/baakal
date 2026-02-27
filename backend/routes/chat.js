const { Router } = require('express');
const db = require('../db');
const claude = require('../api/claude');

const router = Router();

// GET /api/chat/threads — List all conversations
router.get('/threads', (_req, res) => {
  const threads = db.chatThreads.list();
  res.json({ threads });
});

// POST /api/chat/threads — Create a new conversation
router.post('/threads', (req, res) => {
  const thread = db.chatThreads.create(req.body.title);
  res.status(201).json(thread);
});

// DELETE /api/chat/threads/:id — Delete a conversation
router.delete('/threads/:id', (req, res) => {
  db.chatMessages.deleteByThread(req.params.id);
  db.chatThreads.delete(req.params.id);
  res.json({ ok: true });
});

// GET /api/chat/threads/:id/messages — Get conversation history
router.get('/threads/:id/messages', (req, res) => {
  const thread = db.chatThreads.get(req.params.id);
  if (!thread) return res.status(404).json({ error: 'Thread not found' });

  const messages = db.chatMessages.listByThread(thread.id);
  res.json({ thread, messages });
});

// POST /api/chat/threads/:id/messages — Send a message and get AI response
router.post('/threads/:id/messages', async (req, res, next) => {
  try {
    const thread = db.chatThreads.get(req.params.id);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Save user message
    db.chatMessages.create(thread.id, 'user', message.trim());

    // Build conversation history for Claude
    const history = db.chatMessages.listByThread(thread.id);
    const claudeMessages = history.map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Build context from existing campaigns and profile
    const campaigns = db.campaigns.list();
    const context = campaigns.length > 0
      ? `Campagnes existantes: ${campaigns.map(c => `"${c.name}" (${c.status}, ${c.channel})`).join(', ')}`
      : 'Aucune campagne créée pour le moment.';

    // Call Claude
    const aiResponse = await claude.chat(claudeMessages, context);

    // Extract action from response if present
    let metadata = null;
    const jsonMatch = aiResponse.content.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        metadata = JSON.parse(jsonMatch[1]);
      } catch { /* invalid JSON, ignore */ }
    }

    // Save assistant message
    const saved = db.chatMessages.create(thread.id, 'assistant', aiResponse.content, metadata);

    // Auto-title thread from first exchange
    if (history.length <= 1) {
      const title = message.trim().slice(0, 60) + (message.length > 60 ? '...' : '');
      db.chatThreads.updateTitle(thread.id, title);
    }

    res.json({
      message: {
        id: saved.id,
        role: 'assistant',
        content: aiResponse.content,
        metadata,
        created_at: new Date().toISOString(),
      },
      usage: aiResponse.usage,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/chat/threads/:id/create-campaign — Create campaign from chat action
router.post('/threads/:id/create-campaign', (req, res) => {
  const thread = db.chatThreads.get(req.params.id);
  if (!thread) return res.status(404).json({ error: 'Thread not found' });

  const { campaign: data } = req.body;
  if (!data || !data.name) {
    return res.status(400).json({ error: 'Campaign data required' });
  }

  // Create campaign
  const campaign = db.campaigns.create({
    name: data.name,
    client: data.client || 'Mon entreprise',
    status: 'prep',
    channel: data.channel || 'email',
    sector: data.sector || null,
    position: data.position || null,
    size: data.size || null,
    angle: data.angle || null,
    zone: data.zone || null,
    tone: data.tone || 'Pro décontracté',
    formality: 'Vous',
    length: 'Standard',
    cta: data.cta || null,
    startDate: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    planned: data.planned || 100,
  });

  // Create touchpoints if sequence provided
  if (Array.isArray(data.sequence)) {
    data.sequence.forEach((tp, i) => {
      db.touchpoints.create(campaign.id, {
        step: tp.step,
        type: tp.type,
        label: tp.label || '',
        subType: tp.subType || '',
        timing: tp.timing || '',
        subject: tp.subject || null,
        body: tp.body || '',
        maxChars: tp.type === 'linkedin' && tp.step?.startsWith('L') ? 300 : null,
        sortOrder: i,
      });
    });
  }

  res.status(201).json({ campaign });
});

module.exports = router;
