/**
 * Team Context Middleware
 *
 * Injects req.team and req.teamRole into every authenticated request.
 * Routes can then use team_id for scoping queries.
 *
 * Also enforces role-based permissions:
 * - viewer: read-only (GET only)
 * - prospection: campaigns, prospects, search
 * - activation: clients, triggers, nurture, CRM
 * - admin: everything + team management
 */

const db = require('../db');

// Cache team membership for 60 seconds to avoid DB lookup on every request
const _cache = new Map();
const CACHE_TTL = 60 * 1000;

async function teamContext(req, res, next) {
  if (!req.user?.id) return next();

  const cacheKey = req.user.id;
  const cached = _cache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    req.team = cached.team;
    req.teamRole = cached.role;
    return next();
  }

  try {
    const team = await db.teams.getByUser(req.user.id);
    if (team) {
      req.team = { id: team.id, name: team.name };
      req.teamRole = team.role;
      _cache.set(cacheKey, { team: req.team, role: team.role, expiresAt: Date.now() + CACHE_TTL });
    } else {
      req.team = null;
      req.teamRole = null;
    }
  } catch {
    req.team = null;
    req.teamRole = null;
  }

  next();
}

/**
 * Role guard middleware factory.
 * Usage: router.post('/...', requireRole('admin'), handler)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.teamRole) return next(); // no team = solo user, allow all
    if (roles.includes(req.teamRole)) return next();
    if (req.teamRole === 'admin') return next(); // admin can do everything

    // Viewer can only GET
    if (req.teamRole === 'viewer' && req.method !== 'GET') {
      return res.status(403).json({ error: 'Acc\u00E8s lecture seule pour votre r\u00F4le' });
    }

    return res.status(403).json({ error: `R\u00F4le requis : ${roles.join(' ou ')}` });
  };
}

module.exports = { teamContext, requireRole };
