/** Derive presentation totals from the requests already authorized and loaded by the page. */
export function getPurchaseRequestMetrics(requests) {
  return {
    total: requests.length,
    pending: requests.filter(request => request.status === 'PENDING').length,
    approved: requests.filter(request => request.status === 'APPROVED').length,
    value: requests.reduce((sum, request) => sum + request.items.reduce(
      (subtotal, item) => subtotal + Number(item.quantity) * Number(item.estimatedUnitCost), 0
    ), 0),
  };
}
