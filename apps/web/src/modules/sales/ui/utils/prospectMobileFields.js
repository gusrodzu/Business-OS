// Presentation-only field mapping for mobile prospect cards.
// Formatters are injected so locale and currency behavior stays with the caller.
export function getProspectMobileFields(prospect, formatMoney, formatDateTime) {
  return [
    {label: 'Valor estimado', value: formatMoney(prospect.estimatedValue)},
    {label: 'Probabilidad', value: `${prospect.probability || 0}%`},
    {label: 'Próxima acción', value: prospect.nextActionAt ? formatDateTime(prospect.nextActionAt) : 'Sin programar'},
    {label: 'Origen', value: prospect.source || '—'},
  ];
}
