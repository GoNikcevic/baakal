/**
 * Job Queue — PostgreSQL-backed persistent queue
 *
 * Features:
 * - Persistent across server restarts
 * - Atomic job claiming (no duplicate processing)
 * - Exponential backoff retries
 * - Dead letter queue for permanently failed jobs
 * - Concurrency-safe via SELECT FOR UPDATE SKIP LOCKED
 *
 * Usage:
 *   const queue = require('./queue');
 *   queue.add('collect-stats', { campaignId: '123' });
 */

const processors = require('./processors');

let db;
let polling = false;
let pollInterval = null;

function getDb() {
  if (!db) db = require('../../db');
  return db;
}

async function add(jobName, data = {}, opts = {}) {
  return getDb().jobQueue.add(jobName, data, opts);
}

async function processNext() {
  const database = getDb();
  const job = await database.jobQueue.claimNext();
  if (!job) return false;

  try {
    const data = typeof job.data === 'string' ? JSON.parse(job.data) : job.data;
    await processors.process(job.job_name, data);
    await database.jobQueue.complete(job.id);
    return true;
  } catch (err) {
    console.error(`[queue] Job ${job.job_name} failed (attempt ${job.attempts}/${job.max_attempts}):`, err.message);
    await database.jobQueue.fail(job.id, err.message);
    return true; // There was a job, check for more
  }
}

// Poll for pending jobs
function startPolling(intervalMs = 5000) {
  if (polling) return;
  polling = true;

  async function poll() {
    try {
      // Process all available jobs
      let hasMore = true;
      while (hasMore) {
        hasMore = await processNext();
      }
    } catch (err) {
      console.error('[queue] Poll error:', err.message);
    }
  }

  // Initial poll
  poll();
  pollInterval = setInterval(poll, intervalMs);
}

function stopPolling() {
  polling = false;
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

async function getDeadLetterQueue() {
  return getDb().jobQueue.getDeadLetterQueue();
}

module.exports = { add, getDeadLetterQueue, startPolling, stopPolling };
