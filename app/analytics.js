/* ═══════════════════════════════════════════════════════════════════════════
   BAKAL — Analytics & Charts Module
   Renders SVG-based charts for campaign performance visualization
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══ Data for extended chart periods ═══ */
const ANALYTICS_DATA = {
  '4w': [
    { label: 'S1', open: 51, reply: 5.2, linkedin: 30 },
    { label: 'S2', open: 58, reply: 6.8, linkedin: 35 },
    { label: 'S3', open: 60, reply: 7.1, linkedin: 38 },
    { label: 'S4', open: 62, reply: 8.1, linkedin: 38 }
  ],
  '8w': [
    { label: 'S1', open: 42, reply: 3.5, linkedin: 22 },
    { label: 'S2', open: 45, reply: 4.1, linkedin: 25 },
    { label: 'S3', open: 48, reply: 4.8, linkedin: 28 },
    { label: 'S4', open: 51, reply: 5.2, linkedin: 30 },
    { label: 'S5', open: 54, reply: 5.9, linkedin: 32 },
    { label: 'S6', open: 58, reply: 6.8, linkedin: 35 },
    { label: 'S7', open: 60, reply: 7.1, linkedin: 38 },
    { label: 'S8', open: 62, reply: 8.1, linkedin: 38 }
  ],
  '12w': [
    { label: 'S1', open: 35, reply: 2.8, linkedin: 18 },
    { label: 'S2', open: 38, reply: 3.0, linkedin: 20 },
    { label: 'S3', open: 40, reply: 3.2, linkedin: 22 },
    { label: 'S4', open: 42, reply: 3.5, linkedin: 22 },
    { label: 'S5', open: 45, reply: 4.1, linkedin: 25 },
    { label: 'S6', open: 48, reply: 4.8, linkedin: 28 },
    { label: 'S7', open: 51, reply: 5.2, linkedin: 30 },
    { label: 'S8', open: 54, reply: 5.9, linkedin: 32 },
    { label: 'S9', open: 58, reply: 6.8, linkedin: 35 },
    { label: 'S10', open: 60, reply: 7.1, linkedin: 38 },
    { label: 'S11', open: 61, reply: 7.8, linkedin: 38 },
    { label: 'S12', open: 62, reply: 8.1, linkedin: 38 }
  ]
};

let _currentPeriod = '4w';


/* ═══════════════════════════════════════════════════════════════════════════
   SVG Line Chart Renderer
   ═══════════════════════════════════════════════════════════════════════════ */

function renderLineChart(containerId, data, lines, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const width = 700;
  const height = 200;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 10;
  const paddingBottom = 30;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Find max value for scaling
  let maxVal = 0;
  lines.forEach(line => {
    data.forEach(d => {
      const v = d[line.key];
      if (v > maxVal) maxVal = v;
    });
  });
  maxVal = Math.ceil(maxVal / 10) * 10 || 100;

  const xStep = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

  // Build SVG
  let svg = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="width:100%;height:100%;">`;

  // Grid lines
  for (let i = 0; i <= 4; i++) {
    const y = paddingTop + (chartHeight / 4) * i;
    const val = Math.round(maxVal - (maxVal / 4) * i);
    svg += `<line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="4,4"/>`;
    svg += `<text x="${paddingLeft - 8}" y="${y + 4}" fill="var(--text-muted)" font-size="10" text-anchor="end" font-family="Inter, sans-serif">${val}${options.suffix || '%'}</text>`;
  }

  // X-axis labels
  data.forEach((d, i) => {
    const x = paddingLeft + i * xStep;
    svg += `<text x="${x}" y="${height - 5}" fill="var(--text-muted)" font-size="10" text-anchor="middle" font-family="Inter, sans-serif">${d.label}</text>`;
  });

  // Draw each line
  lines.forEach(line => {
    const points = data.map((d, i) => {
      const x = paddingLeft + i * xStep;
      const y = paddingTop + chartHeight - (d[line.key] / maxVal) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    // Area fill
    const firstX = paddingLeft;
    const lastX = paddingLeft + (data.length - 1) * xStep;
    const bottomY = paddingTop + chartHeight;
    svg += `<polygon points="${firstX},${bottomY} ${points} ${lastX},${bottomY}" fill="${line.color}" opacity="0.06"/>`;

    // Line
    svg += `<polyline points="${points}" fill="none" stroke="${line.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;

    // Dots
    data.forEach((d, i) => {
      const x = paddingLeft + i * xStep;
      const y = paddingTop + chartHeight - (d[line.key] / maxVal) * chartHeight;
      svg += `<circle cx="${x}" cy="${y}" r="3.5" fill="${line.color}" stroke="var(--bg-card)" stroke-width="2"/>`;
    });
  });

  svg += '</svg>';
  container.innerHTML = svg;
}


/* ═══════════════════════════════════════════════════════════════════════════
   Horizontal Bar Chart (Campaign Performance)
   ═══════════════════════════════════════════════════════════════════════════ */

function renderCampaignPerformance() {
  const container = document.getElementById('campaignPerfChart');
  if (!container || typeof BAKAL === 'undefined') return;

  const campaigns = Object.values(BAKAL.campaigns).filter(c => c.status === 'active');
  if (campaigns.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:13px;">Aucune campagne active pour le moment.</div>';
    return;
  }

  let html = '';
  campaigns.forEach(c => {
    const isLinkedin = c.channel === 'linkedin';
    const openRate = isLinkedin ? null : c.kpis.openRate;
    const replyRate = c.kpis.replyRate;

    html += `<div class="campaign-perf-row">
      <div class="campaign-perf-name">${c.name}</div>
      <div class="campaign-perf-bars">`;

    // Open rate bar
    if (openRate !== null) {
      const openColor = openRate >= 50 ? 'var(--success)' : 'var(--warning)';
      html += `
        <div style="flex:1;">
          <div style="font-size:10px;color:var(--text-muted);margin-bottom:3px;">Ouverture</div>
          <div class="campaign-perf-bar-track">
            <div class="campaign-perf-bar-fill" style="width:${openRate}%;background:${openColor};"></div>
          </div>
        </div>
        <div class="campaign-perf-value" style="color:${openColor}">${openRate}%</div>`;
    }

    // Reply rate bar
    if (replyRate !== null) {
      const replyColor = replyRate >= 8 ? 'var(--blue)' : 'var(--warning)';
      html += `
        <div style="flex:1;">
          <div style="font-size:10px;color:var(--text-muted);margin-bottom:3px;">Réponse</div>
          <div class="campaign-perf-bar-track">
            <div class="campaign-perf-bar-fill" style="width:${Math.min(replyRate * 10, 100)}%;background:${replyColor};"></div>
          </div>
        </div>
        <div class="campaign-perf-value" style="color:${replyColor}">${replyRate}%</div>`;
    }

    html += `</div></div>`;
  });

  container.innerHTML = html;
}


/* ═══════════════════════════════════════════════════════════════════════════
   Channel Breakdown (Donut-like visual)
   ═══════════════════════════════════════════════════════════════════════════ */

function renderChannelBreakdown() {
  const container = document.getElementById('channelBreakdown');
  if (!container || typeof BAKAL === 'undefined') return;

  const campaigns = Object.values(BAKAL.campaigns);
  let emailCount = 0, linkedinCount = 0, multiCount = 0;
  campaigns.forEach(c => {
    if (c.channel === 'email') emailCount++;
    else if (c.channel === 'linkedin') linkedinCount++;
    else multiCount++;
  });
  const total = campaigns.length || 1;

  // Email stats
  const emailCampaigns = campaigns.filter(c => c.channel === 'email' && c.status === 'active');
  const avgOpenRate = emailCampaigns.length > 0
    ? Math.round(emailCampaigns.reduce((s, c) => s + (c.kpis.openRate || 0), 0) / emailCampaigns.length)
    : 0;

  // LinkedIn stats
  const linkedinCampaigns = campaigns.filter(c => c.channel === 'linkedin' && c.status === 'active');
  const avgAcceptRate = linkedinCampaigns.length > 0
    ? Math.round(linkedinCampaigns.reduce((s, c) => s + (c.kpis.acceptRate || 0), 0) / linkedinCampaigns.length)
    : 0;

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <!-- Channel bars -->
      <div style="display:flex;gap:4px;height:12px;border-radius:6px;overflow:hidden;">
        <div style="flex:${emailCount};background:var(--blue);border-radius:6px 0 0 6px;"></div>
        <div style="flex:${linkedinCount};background:var(--purple);"></div>
        <div style="flex:${multiCount};background:var(--orange);border-radius:0 6px 6px 0;"></div>
      </div>

      <!-- Channel details -->
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--bg-elevated);border-radius:8px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:10px;height:10px;border-radius:3px;background:var(--blue);"></div>
            <div>
              <div style="font-size:13px;font-weight:600;">Email</div>
              <div style="font-size:11px;color:var(--text-muted);">${emailCount} campagne${emailCount !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:16px;font-weight:700;color:var(--blue);">${avgOpenRate}%</div>
            <div style="font-size:10px;color:var(--text-muted);">Ouverture moy.</div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--bg-elevated);border-radius:8px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:10px;height:10px;border-radius:3px;background:var(--purple);"></div>
            <div>
              <div style="font-size:13px;font-weight:600;">LinkedIn</div>
              <div style="font-size:11px;color:var(--text-muted);">${linkedinCount} campagne${linkedinCount !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:16px;font-weight:700;color:var(--purple);">${avgAcceptRate}%</div>
            <div style="font-size:10px;color:var(--text-muted);">Accept. moy.</div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--bg-elevated);border-radius:8px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:10px;height:10px;border-radius:3px;background:var(--orange);"></div>
            <div>
              <div style="font-size:13px;font-weight:600;">Multi-canal</div>
              <div style="font-size:11px;color:var(--text-muted);">${multiCount} campagne${multiCount !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:16px;font-weight:700;color:var(--orange);">${Math.round(multiCount / total * 100)}%</div>
            <div style="font-size:10px;color:var(--text-muted);">du portefeuille</div>
          </div>
        </div>
      </div>
    </div>
  `;
}


/* ═══════════════════════════════════════════════════════════════════════════
   Conversion Funnel
   ═══════════════════════════════════════════════════════════════════════════ */

function renderFunnel() {
  const container = document.getElementById('funnelChart');
  if (!container || typeof BAKAL === 'undefined') return;

  // Aggregate stats from all active campaigns
  const campaigns = Object.values(BAKAL.campaigns).filter(c => c.status === 'active');
  const totalContacts = campaigns.reduce((s, c) => s + (c.kpis.contacts || 0), 0);
  const avgOpen = campaigns.filter(c => c.kpis.openRate).reduce((s, c) => s + c.kpis.openRate, 0) / (campaigns.filter(c => c.kpis.openRate).length || 1);
  const totalInterested = campaigns.reduce((s, c) => s + (c.kpis.interested || 0), 0);
  const totalMeetings = campaigns.reduce((s, c) => s + (c.kpis.meetings || 0), 0);

  const opened = Math.round(totalContacts * avgOpen / 100);
  const replied = Math.round(totalContacts * 0.081);

  const stages = [
    { label: 'Contactés', value: totalContacts, color: 'var(--text-muted)', width: 100 },
    { label: 'Ouvert', value: opened, color: 'var(--blue)', width: Math.round(avgOpen) || 60 },
    { label: 'Répondu', value: replied, color: 'var(--success)', width: Math.min(Math.round(8.1 * 5), 50) },
    { label: 'Intéressé', value: totalInterested, color: 'var(--warning)', width: Math.round(totalInterested / (totalContacts || 1) * 100 * 5) || 15 },
    { label: 'RDV', value: totalMeetings, color: 'var(--purple)', width: Math.round(totalMeetings / (totalContacts || 1) * 100 * 10) || 8 }
  ];

  let html = '<div style="display:flex;flex-direction:column;gap:4px;align-items:center;">';
  stages.forEach((stage, i) => {
    const w = Math.max(stage.width, 8);
    html += `
      <div style="display:flex;align-items:center;gap:16px;width:100%;">
        <div style="width:80px;text-align:right;font-size:12px;color:var(--text-muted);font-weight:500;">${stage.label}</div>
        <div style="flex:1;display:flex;align-items:center;gap:12px;">
          <div style="width:${w}%;height:36px;background:${stage.color};border-radius:6px;opacity:${1 - i * 0.15};display:flex;align-items:center;justify-content:center;transition:width 0.6s ease;min-width:40px;">
            <span style="font-size:13px;font-weight:700;color:white;text-shadow:0 1px 2px rgba(0,0,0,0.3);">${stage.value}</span>
          </div>
          ${i > 0 ? `<span style="font-size:11px;color:var(--text-muted);">${totalContacts > 0 ? (stage.value / totalContacts * 100).toFixed(1) : 0}%</span>` : ''}
        </div>
      </div>`;
    if (i < stages.length - 1) {
      html += `<div style="width:2px;height:8px;background:var(--border);margin-left:88px;"></div>`;
    }
  });
  html += '</div>';
  container.innerHTML = html;
}


/* ═══════════════════════════════════════════════════════════════════════════
   Period Selector
   ═══════════════════════════════════════════════════════════════════════════ */

function setAnalyticsPeriod(btn, period) {
  _currentPeriod = period;
  document.querySelectorAll('.analytics-period-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderEngagementChart();
}


/* ═══════════════════════════════════════════════════════════════════════════
   Engagement Chart
   ═══════════════════════════════════════════════════════════════════════════ */

function renderEngagementChart() {
  const data = ANALYTICS_DATA[_currentPeriod] || ANALYTICS_DATA['4w'];
  renderLineChart('engagementChartWrap', data, [
    { key: 'open', color: 'var(--blue)' },
    { key: 'reply', color: 'var(--success)' },
    { key: 'linkedin', color: 'var(--purple)' }
  ]);
}


/* ═══════════════════════════════════════════════════════════════════════════
   Analytics KPIs (update from live data)
   ═══════════════════════════════════════════════════════════════════════════ */

function updateAnalyticsKpis() {
  if (typeof BAKAL === 'undefined') return;

  const campaigns = Object.values(BAKAL.campaigns).filter(c => c.status === 'active');
  const totalInterested = campaigns.reduce((s, c) => s + (c.kpis.interested || 0), 0);
  const totalMeetings = campaigns.reduce((s, c) => s + (c.kpis.meetings || 0), 0);

  const el1 = document.getElementById('analytics-open-rate');
  const el2 = document.getElementById('analytics-reply-rate');
  const el3 = document.getElementById('analytics-interested');
  const el4 = document.getElementById('analytics-meetings');

  if (BAKAL.globalKpis.openRate) {
    if (el1) el1.textContent = typeof BAKAL.globalKpis.openRate === 'object' ? BAKAL.globalKpis.openRate.value : BAKAL.globalKpis.openRate;
  }
  if (BAKAL.globalKpis.replyRate) {
    if (el2) el2.textContent = typeof BAKAL.globalKpis.replyRate === 'object' ? BAKAL.globalKpis.replyRate.value : BAKAL.globalKpis.replyRate;
  }
  if (el3) el3.textContent = totalInterested;
  if (el4) el4.textContent = totalMeetings;
}


/* ═══════════════════════════════════════════════════════════════════════════
   Empty Analytics State
   ═══════════════════════════════════════════════════════════════════════════ */

function renderEmptyAnalytics() {
  const section = document.getElementById('section-analytics');
  if (!section) return;

  section.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">📈</div>
      <div class="empty-state-title">Analytics non disponibles</div>
      <div class="empty-state-desc">
        Les graphiques de performance s'afficheront dès que votre première campagne sera active avec des données de prospection.
      </div>
      <button class="btn btn-ghost" onclick="showSection('overview')">Retour au dashboard</button>
    </div>
  `;
}


/* ═══════════════════════════════════════════════════════════════════════════
   Main Render — Called when Analytics tab is opened
   ═══════════════════════════════════════════════════════════════════════════ */

function renderAnalytics() {
  if (typeof BAKAL === 'undefined' || typeof isEmptyDashboard === 'undefined') return;

  if (isEmptyDashboard()) {
    renderEmptyAnalytics();
    return;
  }

  // Restore original analytics HTML if it was replaced by empty state
  const section = document.getElementById('section-analytics');
  if (section && !section.querySelector('.analytics-kpi-row')) {
    // Section was replaced — need to restore from scratch
    // This is the fallback; normally initFromData handles the empty case
    location.hash = '';
    showSection('overview');
    return;
  }

  updateAnalyticsKpis();
  renderEngagementChart();
  renderCampaignPerformance();
  renderChannelBreakdown();
  renderFunnel();
}
