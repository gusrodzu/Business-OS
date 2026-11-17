import {useMemo, useState} from 'react';
import {filterCatalogProducts, countCatalogViews} from '../utils/catalogSelectors';

// Estado exclusivamente visual del catálogo; no gestiona solicitudes ni operaciones de inventario.
export function useProductCatalogView(items) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const filtered = useMemo(
    () => filterCatalogProducts(items, {query, view, categoryFilter}),
    [items, query, view, categoryFilter]
  );
  const viewCounts = useMemo(() => countCatalogViews(items), [items]);

  return {
    query, setQuery,
    view, setView,
    categoryFilter, setCategoryFilter,
    selectedIds, setSelectedIds,
    filtered, viewCounts
  };
}
