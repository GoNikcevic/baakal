const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bakal-jwt-secret-change-in-production';
const JWT_EXPIRES = '7d';

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES },
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Express middleware: requires a valid JWT in Authorization header.
 * Sets req.user = { id, email, role }.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = header.slice(7);
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional auth: attaches req.user if token present, but doesn't block.
 */
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = verifyToken(header.slice(7));
    } catch { /* ignore invalid token */ }
  }
  next();
}

module.exports = { signToken, verifyToken, requireAuth, optionalAuth, JWT_SECRET };
