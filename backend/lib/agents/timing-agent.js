/**
 * Timing Agent
 *
 * Analyzes temporal patterns to optimize email send windows:
 * - Best day of week (from open/reply rates)
 * - Best time of day
 * - Seasonality by sector
 * - Optimal follow-up delays
 *
 * Outputs: memory patterns + recommended send window updates
 */

const db = require('../../db');
const logger = require('../logger');

async function run(userId) {
  const report = { insights: 0, recommendations: [], errors: [] };

  try {
    // Load sent emails with timestamps and outcomes
    const emails = await db.query(`
      SELECT
        ne.sent_at, ne.status, ne.sentiment,
        EXTRACT(DOW FROM ne.sent_at) AS day_of_week,
        EXTRACT(HOUR FROM ne.sent_at) AS hour_of_day,
        ne.replied_at,
        o.status AS contact_status, o.company
      FROM nurture_emails ne
      LEFT JOIN opportunities o ON o.id = ne.opportunity_id
      WHERE ne.user_id = $1 AND ne.status = 'sent' AND ne.sent_at IS NOT NULL
      ORDER BY ne.sent_at DESC LIMIT 500
    `, [userId]);

    const rows = emails.rows;
    if (rows.length < 20) {
      report.recommendations.push('Not enough data yet (need 20+ sent emails)');
      return report;
    }

    // Analyze by day of week
    const byDay = {};
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    for (const r of rows) {
      const day = parseInt(r.day_of_week);
      if (!byDay[day]) byDay[day] = { sent: 0, replied: 0 };
      byDay[day].sent++;
      if (r.replied_at || r.sentiment === 'positive') byDay[day].replied++;
    }

    // Find best day
    let bestDay = null, bestRate = 0;
    for (const [day, stats] of Object.entries(byDay)) {
      if (stats.sent < 3) continue;
      const rate = stats.replied / stats.sent;
      if (rate > bestRate) { bestRate = rate; bestDay = parseInt(day); }
    }

    if (bestDay !== null) {
      const insight = `Meilleur jour d'envoi : ${dayNames[bestDay]} (${Math.round(bestRate * 100)}% de r\u00e9ponses vs moyenne)`;
      report.recommendations.push(insight);

      await db.memoryPatterns.create({
        pattern: insight,
        category: 'S\u00e9quence',
        data: JSON.stringify({ byDay, bestDay: dayNames[bestDay], bestRate: Math.round(bestRate * 100) }),
        confidence: rows.length >= 100 ? 'Haute' : 'Moyenne',
        sectors: [], targets: [],
      });
      report.insights++;
    }

    // Analyze by hour
    const byHour = {};
    for (const r of rows) {
      const hour = parseInt(r.hour_of_day);
      if (!byHour[hour]) byHour[hour] = { sent: 0, replied: 0 };
      byHour[hour].sent++;
      if (r.replied_at || r.sentiment === 'positive') byHour[hour].replied++;
    }

    let bestHour = null, bestHourRate = 0;
    for (const [hour, stats] of Object.entries(byHour)) {
      if (stats.sent < 3) continue;
      const rate = stats.replied / stats.sent;
      if (rate > bestHourRate) { bestHourRate = rate; bestHour = parseInt(hour); }
    }

    if (bestHour !== null) {
      const insight = `Meilleure heure d'envoi : ${bestHour}h (${Math.round(bestHourRate * 100)}% de r\u00e9ponses)`;
      report.recommendations.push(insight);
      report.insights++;
    }

    // Analyze optimal follow-up delay
    const withReply = rows.filter(r => r.replied_at);
    if (withReply.length >= 5) {
      const delays = withReply.map(r => {
        const sent = new Date(r.sent_at).getTime();
        const replied = new Date(r.replied_at).getTime();
        return Math.round((replied - sent) / 86400000); // days
      }).filter(d => d >= 0 && d <= 30);

      if (delays.length > 0) {
        const avgDelay = Math.round(delays.reduce((a, b) => a + b, 0) / delays.length);
        const insight = `D\u00e9lai moyen de r\u00e9ponse : ${avgDelay} jour(s) — adapter le timing des relances en cons\u00e9quence`;
        report.recommendations.push(insight);
        report.insights++;
      }
    }
  } catch (err) {
    report.errors.push(err.message);
    logger.error('timing-agent', err.message);
  }

  return report;
}

module.exports = { run };
