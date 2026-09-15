const apiBase = String(process.env.BUZZBEE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const checks = [
  ['API health', `${apiBase}/health`],
  ['PostgreSQL readiness', `${apiBase}/ready`],
];
let failed = 0;
for (const [label, url] of checks) {
  try {
    const response = await fetch(url, {signal: AbortSignal.timeout(5000)});
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body?.ok === false) throw new Error(body?.message || `HTTP ${response.status}`);
    console.log(`PASS · ${label} · ${body.version || 'ok'}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL · ${label} · ${error.message}`);
  }
}
if (failed) {
  console.error(`Runtime health: ${checks.length - failed} PASS / ${failed} FAIL`);
  process.exit(1);
}
console.log(`Runtime health: ${checks.length}/${checks.length} PASS`);
