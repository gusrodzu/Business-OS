import assert from 'node:assert/strict';
import {offlineDemoRequest, resetOfflineDemo} from '../apps/web/src/offlineDemo.js';

// Isolated in-memory browser storage. No real storage, network, API or PostgreSQL.
const memory = new Map();
globalThis.localStorage = {
  getItem: key => memory.has(key) ? memory.get(key) : null,
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: key => memory.delete(key),
};
const get = path => offlineDemoRequest(path);
const post = (path, body) => offlineDemoRequest(path, {method:'POST',body});
let passed = 0;
const check = (condition, message) => { assert.ok(condition,message); passed++; };

try {
  resetOfflineDemo();
  const before = await get('/pos/dashboard');
  check(Array.isArray(before.products) && before.products.length > 0,'POS requiere productos demo');
  check(Array.isArray(before.sales),'POS requiere ventas demo');
  const product = before.products[0];
  const session = before.sessions.find(row => row.status === 'OPEN');
  const payload = {
    sessionId:session?.id,
    customerId:before.customers[0]?.id,
    items:[{productId:product.id,quantity:1,unitPrice:125,taxRate:16}],
    payments:[{method:'CASH',amount:145}],
  };
  const created = await post('/pos/sales',payload);
  check(Boolean(created.sale?.id),'POS debe devolver folio de venta');
  const after = await get('/pos/dashboard');
  check(after.sales.some(row => row.id === created.sale.id),'Venta POS debe persistir al consultar de nuevo');
  check(after.sales.length === before.sales.length + 1,'Lista POS debe aumentar en una venta');
  check(Number(created.sale.total) === 145,'POS debe calcular subtotal e IVA de una partida sin descuentos');

  const collectionsBefore = await get('/collections');
  check(Array.isArray(collectionsBefore.payments),'Cobranza debe devolver recibos');
  const customer = collectionsBefore.customers[0];
  const account = collectionsBefore.accounts[0];
  const amount = 125;
  const payment = await post('/collections/payments',{
    customerId:customer?.id,
    treasuryAccountId:account?.id,
    amount,
    applications:[],
    method:'TRANSFER',
    reference:'QA-OFFLINE-PERSISTENCE',
  });
  check(Boolean(payment.payment?.id),'Cobranza debe devolver identificador');
  const collectionsAfter = await get('/collections');
  check(collectionsAfter.payments.some(row => row.id === payment.payment.id),'Cobro debe persistir al consultar de nuevo');
  check(collectionsAfter.payments.length === collectionsBefore.payments.length + 1,'Lista de cobranza debe aumentar');
  check(Number(payment.payment.unappliedAmount) === amount,'Cobro sin aplicaciones debe conservar saldo sin aplicar');
  check(payment.payment.status === 'PARTIAL','Cobro no aplicado no puede figurar aplicado');

  console.log(`PASS · QA persistencia offline POS y cobranza: ${passed} aserciones`);
  console.log('NOTA · No demuestra integración POS → Kardex → CxC/Tesorería; requiere QA adicional.');
} finally {
  resetOfflineDemo();
}
