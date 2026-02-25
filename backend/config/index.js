require('dotenv').config();

const config = {
  port: process.env.PORT || 3001,

  lemlist: {
    apiKey: process.env.LEMLIST_API_KEY,
    baseUrl: 'https://api.lemlist.com/api',
  },

  notion: {
    token: process.env.NOTION_TOKEN,
    databases: {
      resultats: process.env.NOTION_DB_RESULTATS,
      diagnostics: process.env.NOTION_DB_DIAGNOSTICS,
      historique: process.env.NOTION_DB_HISTORIQUE,
      memoire: process.env.NOTION_DB_MEMOIRE,
    },
    parentPageId: process.env.NOTION_PARENT_PAGE_ID,
  },

  claude: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
  },
};

function validateConfig(keys) {
  const missing = keys.filter((k) => {
    const value = k.split('.').reduce((obj, part) => obj?.[part], config);
    return !value;
  });
  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing config keys: ${missing.join(', ')}\n` +
      '   Copy .env.example → .env and fill in your values.'
    );
  }
  return missing.length === 0;
}

module.exports = { config, validateConfig };
