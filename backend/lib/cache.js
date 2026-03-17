/**
 * Simple in-memory LRU cache with TTL.
 * No external dependencies (Redis-free).
 * Suitable for single-server deployment up to ~5000 users.
 */

class LRUCache {
  constructor(maxSize = 500) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check TTL
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key, value, ttlMs = 300000) {
    // Delete existing to update position
    this.cache.delete(key);

    // Evict oldest if full
    if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }

    this.cache.set(key, {
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : null,
    });
  }

  invalidate(key) {
    this.cache.delete(key);
  }

  invalidatePrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

// Singleton caches for different data types
const kpiCache = new LRUCache(200);      // Dashboard KPIs: TTL 5 min
const profileCache = new LRUCache(500);  // User profiles: TTL 10 min
const patternCache = new LRUCache(50);   // Memory patterns: TTL 30 min

module.exports = { LRUCache, kpiCache, profileCache, patternCache };
