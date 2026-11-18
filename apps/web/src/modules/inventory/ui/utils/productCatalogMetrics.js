/** Derivados del maestro de productos; no representan valorización de existencias. */
export function getProductCatalogMetrics(products) {
  const active = products.filter(item => item.active).length;
  const catalogCost = products.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  return {active, catalogCost};
}
