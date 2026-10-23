import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync} from 'node:fs';

const db = new URL(process.env.DATABASE_URL || 'postgresql://not-configured/invalid');
const base = new URL(process.env.API_URL || 'http://127.0.0.1:4000/api');
assert.equal(process.env.ERP_QA_EPHEMERAL_DB, '1', 'QA requires explicit disposable database opt-in');
assert.ok(['127.0.0.1','localhost'].includes(db.hostname), 'Refusing nonlocal PostgreSQL');
assert.equal(db.pathname, '/erpqa', 'Refusing any database other than isolated erpqa');
assert.ok(['127.0.0.1','localhost'].includes(base.hostname), 'Refusing to test against a remote API');

const checks = [];
async function request(path, options = {}) {
  const res = await fetch(new URL(base.pathname.replace(/\/$/, '') + path,base), {
    ...options,
    signal: AbortSignal.timeout(10000),
    headers:{accept:'application/json',...options.headers},
  });
  let data;
  try {data=await res.json()}catch {data=null}
  return {res,data};
}
function check(name, condition, detail = '') {
  checks.push({name,ok:Boolean(condition),detail});
  console.log((condition?'PASS':'FAIL')+' · '+name+(detail?' · '+detail:''));
  assert.ok(condition,name+': '+detail);
}

try {
  for (const path of ['/health','/ready']) {
    const {res,data} = await request(path);
    check(path,res.ok && data?.ok===true,'HTTP '+res.status);
  }
  const login=await request('/auth/login',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({email:'admin@erp.local',password:'Admin123!'}),
  });
  check('ERP login via HttpOnly session cookie',login.res.ok && login.data?.authenticated===true,'HTTP '+login.res.status);
  const cookie=(login.res.headers.getSetCookie?.() || [login.res.headers.get('set-cookie') || ''])
    .find(value=>value.startsWith('bb_erp_session='));
  check('ERP auth cookie issued',Boolean(cookie && /httponly/i.test(cookie)));
  const session=cookie.split(';')[0];
  const resources=[
    ['Compras (solicitudes)','/purchase-requests','requests'],
    ['Compras (órdenes)','/purchase-orders','orders'],
    ['Recepción de mercancía','/receipts','receipts'],
    ['Inventario','/inventory/balances','balances'],
    ['Kardex','/inventory/movements','movements'],
    ['Ventas','/sales','products'],
    ['Punto de venta','/pos/dashboard','products'],
    ['Cuentas por pagar','/accounts-payable',null],
    ['Cuentas por cobrar','/accounts-receivable',null],
    ['Cobranza','/collections','payments'],
    ['Dashboard P2P','/procurement/dashboard',null],
    ['Dashboard O2C','/order-to-cash/dashboard',null],
  ];
  for (const [label,path,key] of resources) {
    const {res,data}=await request(path,{headers:{cookie:session}});
    check(label,res.ok && typeof data==='object' && (!key || Array.isArray(data?.[key])),'HTTP '+res.status+(res.ok?'':' '+(data?.code||data?.message||'')));
  }
  const without=await request('/inventory/balances');
  check('Aislamiento: inventario requiere autenticación',without.res.status===401,'HTTP '+without.res.status);
} catch (error) {
  console.error('QA ERROR:',error.message);
  process.exitCode=1;
} finally {
  mkdirSync('.qa-reports',{recursive:true});
  const summary={kind:'backend-cookie-integration',checkedAt:new Date().toISOString(),checked:checks.length,passed:checks.filter(x=>x.ok).length,failed:checks.filter(x=>!x.ok).length,checks};
  writeFileSync('.qa-reports/backend-cookie-integration.json',JSON.stringify(summary,null,2));
  if (summary.failed) process.exitCode=1;
}
