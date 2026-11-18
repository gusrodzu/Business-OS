import {useCallback, useMemo} from 'react';

/**
 * Controles de presentación del catálogo: filtros, vistas y selección móvil.
 * No realiza solicitudes ni altera las mutaciones de inventario.
 */
export function useProductCatalogWorkspaceControls({
  viewCounts, setView, setQuery, setCategoryFilter, setSelectedIds,
}) {
  const savedViews = useMemo(() => [
    {id:'all',label:'Todos',count:viewCounts.all},
    {id:'active',label:'Activos',count:viewCounts.active},
    {id:'inactive',label:'Inactivos',count:viewCounts.inactive},
    {id:'lowMargin',label:'Margen bajo',count:viewCounts.lowMargin},
  ], [viewCounts.all,viewCounts.active,viewCounts.inactive,viewCounts.lowMargin]);

  const clearFilters = useCallback(() => {
    setQuery('');
    setCategoryFilter('');
    setView('all');
  }, [setQuery,setCategoryFilter,setView]);

  const updateMobileSelection = useCallback((id,checked) => {
    setSelectedIds(ids => checked
      ? [...new Set([...ids,id])]
      : ids.filter(selectedId => selectedId !== id));
  }, [setSelectedIds]);

  return {savedViews,clearFilters,updateMobileSelection};
}
