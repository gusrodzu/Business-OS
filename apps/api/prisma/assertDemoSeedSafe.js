// Guard demo credentials and destructive seed mutations from production/remote databases.
const LOCAL_DB_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]']);
export function assertDemoSeedSafe({nodeEnv = process.env.NODE_ENV, databaseUrl = process.env.DATABASE_URL} = {}) {
  if (nodeEnv === 'production') {
    throw new Error('Se prohíbe ejecutar semillas DEMO con NODE_ENV=production.');
  }
  let url;
  try { url = new URL(databaseUrl || ''); }
  catch { throw new Error('Semillas DEMO: DATABASE_URL de PostgreSQL local obligatorio.'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !LOCAL_DB_HOSTS.has(url.hostname)) {
    throw new Error('Semillas DEMO bloqueadas: solo PostgreSQL local (localhost/127.0.0.1/::1).');
  }
}
