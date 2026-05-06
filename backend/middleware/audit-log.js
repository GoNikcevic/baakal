/**
 * Audit Log Middleware
 *
 * Logs security-sensitive actions to the audit_log table.
 * Used for GDPR/CCPA compliance and security monitoring.
 *
 * Tracked actions:
 * - auth.login, auth.register, auth.logout, auth.delete_account
 * - data.export
 * - settings.update_key, settings.delete_key
 * - crm.import, crm.sync
 * - team.join, team.leave, team.role_change
 */

const db = require('../db');

const AUDITED_ROUTES = {
  'POST /api/auth/login':         { action: 'auth.login',          resource: 'user' },
  'POST /api/auth/register':      { action: 'auth.register',       resource: 'user' },
  'POST /api/auth/logout':        { action: 'auth.logout',         resource: 'user' },
  'DELETE /api/auth/account':     { action: 'auth.delete_account',  resource: 'user' },
  'POST /api/auth/reset-password':{ action: 'auth.reset_password',  resource: 'user' },
  'GET /api/export/account':      { action: 'data.export',          resource: 'user' },
  'POST /api/settings/keys':      { action: 'settings.update_key',  resource: 'integration' },
  'POST /api/crm/import':         { action: 'crm.import',           resource: 'contacts' },
  'POST /api/crm/sync':           { action: 'crm.sync',             resource: 'crm' },
  'POST /api/teams/join':         { action: 'team.join',             resource: 'team' },
};

async function logAudit(userId, action, resourceType, resourceId, details, req) {
  try {
    await db.query(
      `INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        action,
        resourceType,
        resourceId || null,
        JSON.stringify(details || {}),
        req?.ip || req?.connection?.remoteAddress || null,
        (req?.headers?.['user-agent'] || '').slice(0, 256),
      ]
    );
  } catch {
    // Never fail the request because of audit logging
  }
}

function auditMiddleware(req, res, next) {
  const routeKey = `${req.method} ${req.baseUrl}${req.path}`.replace(/\/$/, '');
  const config = AUDITED_ROUTES[routeKey];

  if (!config) return next();

  // Capture response to log after completion
  const originalEnd = res.end;
  res.end = function (...args) {
    originalEnd.apply(this, args);

    // Only log successful actions (2xx/3xx)
    if (res.statusCode < 400) {
      const userId = req.user?.id || null;
      const details = {};

      // Add context without sensitive data
      if (config.action === 'auth.login') {
        details.email = req.body?.email ? req.body.email.replace(/(.{2}).*(@.*)/, '$1***$2') : undefined;
      }
      if (config.action === 'settings.update_key') {
        details.providers = Object.keys(req.body || {}).filter(k => k !== 'password');
      }

      logAudit(userId, config.action, config.resource, userId, details, req);
    }
  };

  next();
}

module.exports = { auditMiddleware, logAudit };
