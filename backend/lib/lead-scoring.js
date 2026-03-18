/**
 * Compute lead score (0-100) = engagement (max 50) + fit (max 50)
 */

const STATUS_ENGAGEMENT = {
  'new': 0,
  'interesse': 25,
  'intéressé': 25,
  'call planifie': 50,
  'call planifié': 50,
  'rappeler': 20,
  'lost': 5,
  'perdu': 5,
};

function computeEngagement(opportunity, campaign) {
  let score = 0;

  // Status-based
  const status = (opportunity.status || 'new').toLowerCase();
  score += STATUS_ENGAGEMENT[status] || 0;

  // Campaign metrics boost
  if (campaign) {
    if (campaign.open_rate > 50) score += 10;
    if (campaign.reply_rate > 5) score += 15;
    if (campaign.accept_rate_lk > 30) score += 10;
  }

  return Math.min(score, 50);
}

function computeFit(opportunity, campaign, profile) {
  if (!profile) return 0;
  let score = 0;

  const targetSectors = (profile.target_sectors || '').toLowerCase();
  const campaignSector = (campaign?.sector || '').toLowerCase();
  if (targetSectors && campaignSector && targetSectors.includes(campaignSector.split(' ')[0])) {
    score += 20;
  }

  const targetSize = (profile.target_size || '').toLowerCase();
  const oppSize = (opportunity.company_size || '').toLowerCase();
  if (targetSize && oppSize && (targetSize.includes(oppSize) || oppSize.includes(targetSize))) {
    score += 15;
  }

  const personas = ((profile.persona_primary || '') + ' ' + (profile.persona_secondary || '')).toLowerCase();
  const title = (opportunity.title || '').toLowerCase();
  if (personas && title) {
    const titleWords = title.split(/\s+/);
    if (titleWords.some(w => w.length > 3 && personas.includes(w))) {
      score += 20;
    }
  }

  const targetZones = (profile.target_zones || '').toLowerCase();
  const campaignZone = (campaign?.zone || '').toLowerCase();
  if (targetZones && campaignZone && targetZones.includes(campaignZone.split(' ')[0])) {
    score += 10;
  }

  return Math.min(score, 50);
}

function scoreOpportunities(opportunities, profile, campaignMap) {
  return opportunities.map(opp => {
    const campaign = opp.campaign_id ? campaignMap[opp.campaign_id] : null;
    const engagement = computeEngagement(opp, campaign);
    const fit = computeFit(opp, campaign, profile);
    const score = Math.min(engagement + fit, 100);

    return {
      ...opp,
      score,
      scoreBreakdown: { engagement, fit, total: score },
    };
  });
}

module.exports = { scoreOpportunities, computeEngagement, computeFit };
