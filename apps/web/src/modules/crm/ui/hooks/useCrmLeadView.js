import {useMemo} from 'react';

/** Derivaciones de presentación de leads; no modifica el estado ni las operaciones CRM. */
export default function useCrmLeadView({prospects, query, leadView, stageFilter}) {
  const filteredProspects = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return prospects.filter((item) => {
      if (normalized && !`${item.name} ${item.companyName || ''} ${item.email || ''} ${item.phone || ''} ${item.source || ''}`.toLowerCase().includes(normalized)) return false;
      if (stageFilter && item.stage !== stageFilter) return false;
      if (leadView === 'open' && ['WON','LOST'].includes(item.stage)) return false;
      if (leadView === 'hot' && (['WON','LOST'].includes(item.stage) || Number(item.probability || 0) < 60)) return false;
      if (leadView === 'followup' && (!item.nextActionAt || ['WON','LOST'].includes(item.stage))) return false;
      if (leadView === 'won' && item.stage !== 'WON') return false;
      return true;
    });
  }, [prospects, query, leadView, stageFilter]);

  const leadCounts = useMemo(() => ({
    all: prospects.length,
    open: prospects.filter((item) => !['WON','LOST'].includes(item.stage)).length,
    hot: prospects.filter((item) => !['WON','LOST'].includes(item.stage) && Number(item.probability || 0) >= 60).length,
    followup: prospects.filter((item) => item.nextActionAt && !['WON','LOST'].includes(item.stage)).length,
    won: prospects.filter((item) => item.stage === 'WON').length,
  }), [prospects]);

  return {filteredProspects, leadCounts};
}
