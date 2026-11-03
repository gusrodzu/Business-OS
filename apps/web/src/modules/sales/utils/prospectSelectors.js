// Pure selectors for the sales pipeline. Keep filtering semantics aligned with the workspace.
const closedStages = ['WON', 'LOST'];

export function filterSalesProspects(prospects, {query = '', stageFilter = '', pipelineView = 'all'}, now = new Date()) {
  const normalized = query.trim().toLowerCase();
  return prospects.filter((item) => {
    const haystack = `${item.name} ${item.companyName || ''} ${item.email || ''} ${item.phone || ''} ${item.source || ''}`.toLowerCase();
    if (normalized && !haystack.includes(normalized)) return false;
    if (stageFilter && item.stage !== stageFilter) return false;
    if (pipelineView === 'hot' && (closedStages.includes(item.stage) || Number(item.probability || 0) < 60)) return false;
    if (pipelineView === 'followup' && (!item.nextActionAt || closedStages.includes(item.stage))) return false;
    if (pipelineView === 'won' && item.stage !== 'WON') return false;
    if (pipelineView === 'overdue' && (!item.nextActionAt || closedStages.includes(item.stage) || new Date(item.nextActionAt) >= now)) return false;
    return true;
  });
}

export function countSalesProspects(prospects, now = new Date()) {
  return {
    all: prospects.length,
    hot: prospects.filter((item) => !closedStages.includes(item.stage) && Number(item.probability || 0) >= 60).length,
    followup: prospects.filter((item) => item.nextActionAt && !closedStages.includes(item.stage)).length,
    won: prospects.filter((item) => item.stage === 'WON').length,
    overdue: prospects.filter((item) => item.nextActionAt && !closedStages.includes(item.stage) && new Date(item.nextActionAt) < now).length,
  };
}
