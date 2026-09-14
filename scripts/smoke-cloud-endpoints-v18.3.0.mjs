const web = String(process.env.BUZZBEE_WEB_URL || '').replace(/\/$/, '');
const api = String(process.env.BUZZBEE_API_URL || '').replace(/\/$/, '');
if (!web || !api) {
  console.error('Configura BUZZBEE_WEB_URL y BUZZBEE_API_URL para ejecutar el smoke cloud.');
  process.exit(2);
}

async function probe(name, url, options={}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {...options, redirect:'manual', signal:controller.signal});
    const ok = res.status >= 200 && res.status < 400;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name} · ${res.status} · ${url}`);
    if (!ok) process.exitCode = 1;
    return res;
  } catch (error) {
    console.log(`FAIL ${name} · ${error.name}: ${error.message} · ${url}`);
    process.exitCode = 1;
    return null;
  } finally { clearTimeout(timer); }
}

await probe('Frontend raíz', `${web}/`);
await probe('Frontend deep-link SPA', `${web}/finanzas/flujo-efectivo`);
await probe('API health', `${api}/api/health`);
await probe('API ready + PostgreSQL', `${api}/api/ready`);
const cors = await probe('CORS preflight login', `${api}/api/auth/login`, {
  method:'OPTIONS',
  headers:{Origin:web,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}
});
if (cors) {
  const origin = cors.headers.get('access-control-allow-origin');
  const creds = cors.headers.get('access-control-allow-credentials');
  const ok = origin === web && creds === 'true';
  console.log(`${ok ? 'PASS' : 'FAIL'} CORS credentials · origin=${origin} credentials=${creds}`);
  if (!ok) process.exitCode = 1;
}
