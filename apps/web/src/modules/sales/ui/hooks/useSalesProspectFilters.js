import {useMemo, useState} from 'react';
import {filterSalesProspects, countSalesProspects} from '../../utils/prospectSelectors';

/**
 * Keeps pipeline presentation filters local to the sales workspace.
 * Domain selectors remain the single source for filtering and counts.
 */
export default function useSalesProspectFilters(prospects) {
  const [query, setQuery] = useState('');
  const [pipelineView, setPipelineView] = useState('all');
  const [stageFilter, setStageFilter] = useState('');

  const filteredProspects = useMemo(
    () => filterSalesProspects(prospects, {query, stageFilter, pipelineView}),
    [prospects, query, stageFilter, pipelineView],
  );
  const pipelineCounts = useMemo(
    () => countSalesProspects(prospects),
    [prospects],
  );

  return {
    query,
    setQuery,
    pipelineView,
    setPipelineView,
    stageFilter,
    setStageFilter,
    filteredProspects,
    pipelineCounts,
  };
}
