/**
 * Display-only catalog margin. Keep the existing rounding and zero-price
 * behavior identical across the desktop table and mobile record cards.
 * This is not inventory valuation or a transactional pricing calculation.
 */
export function getProductCatalogMargin(item) {
  const margin = Number(item.price || 0) - Number(item.cost || 0);
  const marginPct = Number(item.price || 0) > 0
    ? Math.round((margin / Number(item.price)) * 100)
    : 0;
  return {margin, marginPct};
}
