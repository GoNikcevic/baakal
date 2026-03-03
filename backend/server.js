const path = require('path');
const express = require('express');
const cors = require('cors');
const { config, validateConfig } = require('./config');
const errorHandler = require('./middleware/error-handler');
const { requireAuth } = require('./middleware/auth');

const authRouter = require('./routes/auth');
const campaignsRouter = require('./routes/campaigns');
const dashboardRouter = require('./routes/dashboard');
const aiRouter = require('./routes/ai');
const chatRouter = require('./routes/chat');
const settingsRouter = require('./routes/settings');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'app')));
app.use('/landing', express.static(path.join(__dirname, '..', 'landing')));

// Health check (public)
app.get('/api/health', (_req, res) => {
  const configOk = validateConfig([
    'lemlist.apiKey',
    'notion.token',
    'claude.apiKey',
  ]);
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      lemlist: !!config.lemlist.apiKey,
      notion: !!config.notion.token,
      claude: !!config.claude.apiKey,
    },
    configComplete: configOk,
  });
});

// Auth routes (public)
app.use('/api/auth', authRouter);

// Protected routes (require JWT)
app.use('/api/campaigns', requireAuth, campaignsRouter);
app.use('/api/dashboard', requireAuth, dashboardRouter);
app.use('/api/ai', requireAuth, aiRouter);
app.use('/api/chat', requireAuth, chatRouter);
app.use('/api/settings', requireAuth, settingsRouter);

// Error handling
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`\n🚀 Bakal backend running on http://localhost:${config.port}`);
  console.log(`   Health check: http://localhost:${config.port}/api/health\n`);
  validateConfig([
    'lemlist.apiKey',
    'notion.token',
    'claude.apiKey',
  ]);
});
