/** Shared catalog currency presentation; keeps existing es-MX/MXN output. */
export const formatProductMoney = value => Number(value || 0).toLocaleString('es-MX', {style:'currency', currency:'MXN'});
