/** Read-only field values for the product detail panel. No mutations or API calls. */
export function getCommercialProductFields(product, formatMoney) {
  const price = Number(product.price);
  const cost = Number(product.cost);
  const margin = price - cost;

  return [
    ['Costo', formatMoney(product.cost)],
    ['Precio de venta', formatMoney(product.price)],
    ['Margen unitario', formatMoney(margin)],
    ['Margen porcentual', price > 0 ? `${Math.round((margin / price) * 100)}%` : '0%']
  ];
}

export function getInventoryProductFields(product) {
  return [
    ['Stock mínimo', `${Number(product.minStock)} ${product.unit}`],
    ['SKU', product.sku],
    ['Uso', 'Compras · Ventas · Inventario'],
    ['Control', 'Disponible para trazabilidad por almacén']
  ];
}
