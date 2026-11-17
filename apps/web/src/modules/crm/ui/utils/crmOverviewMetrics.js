/** Read-only CRM overview selectors. No API calls or mutations. */
export function getCrmOverviewMetrics(prospects, activities, now = new Date()) {
  const openProspects = prospects.filter((item) => !['WON', 'LOST'].includes(item.stage));
  const weightedPipeline = openProspects.reduce(
    (sum, item) => sum + Number(item.estimatedValue || 0) * (Number(item.probability || 0) / 100),
    0,
  );
  const won = prospects.filter((item) => item.stage === 'WON').length;
  const lost = prospects.filter((item) => item.stage === 'LOST').length;
  const winRate = won + lost ? Math.round((won / (won + lost)) * 100) : 0;
  const overdueActivities = activities.filter(
    (item) => item.dueAt && !item.completedAt && new Date(item.dueAt) < now,
  );
  const pendingActivities = activities.filter(
    (item) => item.dueAt && !item.completedAt,
  );
  const thisMonthLeads = prospects.filter((item) => {
    const created = new Date(item.createdAt);
    return (
      created.getFullYear() === now.getFullYear() &&
      created.getMonth() === now.getMonth()
    );
  }).length;

  return {openProspects, weightedPipeline, won, lost, winRate, overdueActivities, pendingActivities, thisMonthLeads};
}
