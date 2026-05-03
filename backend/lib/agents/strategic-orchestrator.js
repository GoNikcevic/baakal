/**
 * Strategic Agent Orchestrator
 *
 * Coordinates all strategic agents and exposes them to the API/chat.
 *
 * Agents:
 * 1. Competitor Watch — competitive landscape analysis
 * 2. Timing Agent — optimal send windows
 * 3. Deal Coach — next best action for stagnant deals
 * 4. Upsell Detector — cross-sell/upsell opportunities
 * 5. Win/Loss Analyst — patterns from won vs lost deals
 * 6. Copy Optimizer — email copy analysis + improvement
 * 7. ICP Refiner — ideal customer profile refinement
 *
 * Can run:
 * - All agents at once (weekly, Sunday after Memory Agent)
 * - Individual agents on-demand (from chat or API)
 */

const logger = require('../logger');

const AGENTS = {
  competitor_watch: { name: 'Competitor Watch', module: './competitor-watch' },
  timing: { name: 'Timing Agent', module: './timing-agent' },
  deal_coach: { name: 'Deal Coach', module: './deal-coach' },
  upsell: { name: 'Upsell Detector', module: './upsell-detector' },
  win_loss: { name: 'Win/Loss Analyst', module: './win-loss-analyst' },
  copy_optimizer: { name: 'Copy Optimizer', module: './copy-optimizer' },
  icp_refiner: { name: 'ICP Refiner', module: './icp-refiner' },
};

/**
 * Run all strategic agents for a user.
 */
async function runAll(userId) {
  const startTime = Date.now();
  const results = {};

  for (const [key, config] of Object.entries(AGENTS)) {
    try {
      const agent = require(config.module);
      results[key] = await agent.run(userId);
      logger.info('strategic-orchestrator', `${config.name}: done`);
    } catch (err) {
      results[key] = { errors: [err.message] };
      logger.warn('strategic-orchestrator', `${config.name} failed: ${err.message}`);
    }
  }

  results.duration = Date.now() - startTime;
  logger.info('strategic-orchestrator', `All agents done for user ${userId} in ${results.duration}ms`);
  return results;
}

/**
 * Run a single strategic agent.
 */
async function runOne(userId, agentKey) {
  const config = AGENTS[agentKey];
  if (!config) throw new Error(`Unknown agent: ${agentKey}. Available: ${Object.keys(AGENTS).join(', ')}`);

  const agent = require(config.module);
  return agent.run(userId);
}

/**
 * List available agents.
 */
function listAgents() {
  return Object.entries(AGENTS).map(([key, config]) => ({
    key,
    name: config.name,
  }));
}

module.exports = { runAll, runOne, listAgents, AGENTS };
