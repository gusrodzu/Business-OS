const SAFE_METHODS = new Set(['GET','HEAD','OPTIONS']);

export function assertEphemeralQaTarget() {
  if (process.env.ERP_QA_EPHEMERAL_DB !== '1') {
    throw new Error('Escrituras de QA bloqueadas: falta ERP_QA_EPHEMERAL_DB=1.');
  }
  let database;
  let api;
  try {
    database = new URL(process.env.DATABASE_URL || '');
    api = new URL(process.env.API_URL || '');
  } catch {
    throw new Error('Escrituras de QA bloqueadas: DATABASE_URL y API_URL deben configurarse explícitamente.');
  }
  if (!['postgres:','postgresql:'].includes(database.protocol)
    || !['127.0.0.1','localhost'].includes(database.hostname)
    || database.pathname !== '/erpqa'
    || !['http:'].includes(api.protocol)
    || !['127.0.0.1','localhost'].includes(api.hostname)
    || !/^\/api\/?$/.test(api.pathname)
  ) {
    throw new Error('Escrituras de QA bloqueadas: usa exclusivamente PostgreSQL local erpqa y API HTTP loopback.');
  }
  if (!process.env.JWT_SECRET?.startsWith('qa-only-')) {
    throw new Error('Escrituras de QA bloqueadas: configura un JWT_SECRET exclusivo de pruebas.');
  }
}

export function createQaApiRequester(base) {
  let cookie = null;
  const origin = process.env.CLIENT_URL || 'http://localhost:5173';
  return {
    get hasSession(){return Boolean(cookie)},
    async request(route,{method='GET',token,body}={}) {
      try {
        const headers={'Content-Type':'application/json'};
        if (cookie) {
          headers.Cookie=cookie;
          if (!SAFE_METHODS.has(method.toUpperCase())) headers.Origin=origin;
        } else if (token && token!=='cookie-session') {
          headers.Authorization='Bearer '+token;
        }
        const response=await fetch(base+route,{
          method,headers,signal:AbortSignal.timeout(15000),
          body:body===undefined?undefined:JSON.stringify(body),
        });
        if (route==='/auth/login' && response.ok) {
          const values=response.headers.getSetCookie?.()||[response.headers.get('set-cookie')||''];
          const erpCookie=values.find(v=>v.startsWith('bb_erp_session='));
          if (erpCookie) cookie=erpCookie.split(';')[0];
        }
        let data=null;
        try {data=await response.json()}catch {/* No JSON body */ }
        return {ok:response.ok,status:response.status,data,path:route};
      } catch(error) {
        return {ok:false,status:null,data:null,error:error.message,path:route};
      }
    },
  };
}
