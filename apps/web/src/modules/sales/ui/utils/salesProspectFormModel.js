/** Form-only defaults. Keep API payload normalization in the page that owns mutations. */
export const createBlankSalesProspect = () => ({
  name: '',
  companyName: '',
  email: '',
  phone: '',
  stage: 'LEAD',
  estimatedValue: '',
  probability: 10,
  source: '',
  nextActionAt: '',
  notes: '',
});

/** Prepare an existing prospect for controlled form inputs without mutating the record. */
export const toSalesProspectForm = (prospect) => ({
  ...prospect,
  estimatedValue: Number(prospect.estimatedValue || 0),
  nextActionAt: prospect.nextActionAt
    ? new Date(prospect.nextActionAt).toISOString().slice(0, 16)
    : '',
});
