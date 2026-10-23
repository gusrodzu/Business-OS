
import fs from 'node:fs';
import path from 'node:path';
import {assertEphemeralQaTarget,createQaApiRequester} from './qa-ephemeral-api.mjs';

const base=(process.env.API_URL||'http://localhost:4000/api').replace(/\/$/,'');
const email=process.env.O2C_EMAIL||'admin@erp.local';
const password=process.env.O2C_PASSWORD||'Admin123!';
const writeMode=['1','true','yes'].includes(String(process.env.O2C_WRITE||'').toLowerCase());

if(writeMode)assertEphemeralQaTarget();
const linkedPurchase=writeMode && process.env.MOTOR_E2E_HANDOFF==='1'
  ? JSON.parse(fs.readFileSync(path.resolve('artifacts','qa','motornorte-p2p-handoff.json'),'utf8'))
  : null;

const report={
  version:'9.6.0',
  startedAt:new Date().toISOString(),
  base,
  mode:writeMode?'WRITE_E2E':'READ_ONLY_PREFLIGHT',
  checks:[],
  entities:{},
};

function rec(name,ok,detail='',meta={}){
  report.checks.push({name,ok,detail,...meta});
  console.log(`${ok?'PASS':'FAIL'}  ${name}${detail?` · ${detail}`:''}`);
  return ok;
}
function msg(r){return r?.data?.message||r?.data?.error||r?.error||`HTTP ${r?.status??'-'}`;}

const qaClient=createQaApiRequester(base);
const request=qaClient.request;
async function requireOk(r,name){
  if(!rec(name,r.ok,r.ok?`HTTP ${r.status}`:msg(r),{status:r.status,path:r.path})) throw new Error(`${name}: ${msg(r)}`);
  return r.data;
}
async function save(){
  report.finishedAt=new Date().toISOString();
  report.passed=report.checks.filter(x=>x.ok).length;
  report.failed=report.checks.filter(x=>!x.ok).length;
  const dir=path.resolve('artifacts','qa'); fs.mkdirSync(dir,{recursive:true});
  const file=path.join(dir,`o2c-runtime-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);
  fs.writeFileSync(file,JSON.stringify(report,null,2));
  console.log(`\nReporte JSON: ${file}`);
}

console.log('\nBuzzBee Order-to-Cash Functional QA — v9.6.0');
console.log('==============================================');
console.log(`Modo: ${writeMode?'WRITE E2E (crea datos QA, no elimina datos)':'READ-ONLY PREFLIGHT'}`);
console.log(`API: ${base}\n`);

try{
  await requireOk(await request('/health'),'API health');
  await requireOk(await request('/ready'),'API + PostgreSQL ready');

  const login=await requireOk(await request('/auth/login',{method:'POST',body:{email,password}}),'Autenticación QA');
  const token=login?.token || (qaClient.hasSession?'cookie-session':null);
  if(!token) throw new Error('Login sin cookie ERP ni token.');
  rec('Sesión ERP autenticada',true,qaClient.hasSession?'Cookie HttpOnly':'Bearer');

  const [sales,fulfillment,balances,movements,receivables,collections,o2c]=await Promise.all([
    requireOk(await request('/sales',{token}),'Ventas endpoint'),
    requireOk(await request('/sales-fulfillment',{token}),'Fulfillment endpoint'),
    requireOk(await request('/inventory/balances',{token}),'Inventario endpoint'),
    requireOk(await request('/inventory/movements',{token}),'Kardex endpoint'),
    requireOk(await request('/accounts-receivable',{token}),'CxC endpoint'),
    requireOk(await request('/collections',{token}),'Cobranza endpoint'),
    requireOk(await request('/order-to-cash/dashboard',{token}),'Order-to-Cash dashboard'),
  ]);

  const customer=sales.customers?.[0];
  const candidates=(balances.balances||[])
    .filter(b=>Number(b.quantity)>0 && sales.products?.some(p=>p.id===b.productId))
    .sort((a,b)=>Number(b.quantity)-Number(a.quantity));
  const eligible=linkedPurchase
    ? candidates.find(b=>b.productId===linkedPurchase.productId&&b.warehouseId===linkedPurchase.warehouseId)
    : candidates[0];
  const product=sales.products?.find(p=>p.id===eligible?.productId);
  const warehouse=fulfillment.warehouses?.find(w=>w.id===eligible?.warehouseId);
  const treasury=collections.accounts?.[0];

  rec('Catálogo: cliente disponible',Boolean(customer),customer?.commercialName||customer?.legalName||'Sin cliente');
  rec('Inventario vendible disponible',Boolean(eligible&&product&&warehouse),eligible?`${product?.sku||''} · ${Number(eligible.quantity)} unidades`:'Sin stock');
  rec('Tesorería: cuenta disponible',Boolean(treasury),treasury?.name||'Sin cuenta');

  if(!customer||!eligible||!product||!warehouse||!treasury) throw new Error('Faltan datos mínimos para ejecutar Order-to-Cash.');
  if(linkedPurchase){
    rec('Misma refacción recibida por Compras',product.sku===linkedPurchase.sku,`${product.sku} / ${linkedPurchase.sku}`);
    rec('Stock inicial O2C coincide con recepción P2P',Math.abs(Number(eligible.quantity)-linkedPurchase.afterQty)<0.000001,`${linkedPurchase.afterQty} → ${eligible.quantity}`);
    if(product.sku!==linkedPurchase.sku||Math.abs(Number(eligible.quantity)-linkedPurchase.afterQty)>0.000001)
      throw new Error('Descuadre de inventario entre Compras, POS y O2C.');
  }

  if(!writeMode){
    console.log('\nPreflight completado. Para ejecutar el flujo transaccional completo:');
    console.log('PowerShell:  $env:O2C_WRITE="1"; npm run qa:o2c');
    console.log('El modo WRITE crea registros QA y NO elimina ni resetea información.');
    await save();
    process.exit(report.checks.some(x=>!x.ok)?1:0);
  }

  const now=new Date();
  const valid=new Date(now); valid.setDate(valid.getDate()+15);
  const due=new Date(now); due.setDate(due.getDate()+30);
  const stamp=Date.now();
  const key=`QA-O2C-${stamp}`;
  const qty=1;
  const price=Math.max(1,Number(product.price||product.salePrice||100));
  const beforeQty=Number(eligible.quantity);
  report.entities.qaKey=key;
  report.entities.beforeQty=beforeQty;

  // 1. Quote
  const qd=await requireOk(await request('/sales/quotes',{
    method:'POST',token,body:{
      customerId:customer.id,
      quoteDate:now.toISOString(),
      validUntil:valid.toISOString(),
      currency:'MXN',
      notes:key,
      terms:'QA funcional Order-to-Cash v9.6.0',
      items:[{productId:product.id,description:product.name,quantity:qty,unitPrice:price,taxRate:16}]
    }
  }),'Crear cotización');
  const quote=qd.quote;
  report.entities.quote={id:quote.id,folio:quote.folio};
  rec('Cotización inicia DRAFT',quote.status==='DRAFT',quote.status);

  const sent=await requireOk(await request(`/sales/quotes/${quote.id}/status`,{
    method:'PATCH',token,body:{status:'SENT'}
  }),'Enviar cotización');
  rec('Cotización queda SENT',sent.quote?.status==='SENT',sent.quote?.status||'—');

  const accepted=await requireOk(await request(`/sales/quotes/${quote.id}/status`,{
    method:'PATCH',token,body:{status:'ACCEPTED'}
  }),'Aceptar cotización');
  rec('Cotización queda ACCEPTED',accepted.quote?.status==='ACCEPTED',accepted.quote?.status||'—');

  // 2. Convert to order and confirm
  const converted=await requireOk(await request(`/sales/quotes/${quote.id}/convert`,{
    method:'POST',token,body:{deliveryDate:now.toISOString(),shippingAddress:'QA Order-to-Cash'}
  }),'Convertir cotización a pedido');
  const order=converted.order;
  report.entities.order={id:order.id,folio:order.folio};
  rec('Pedido nace DRAFT',order.status==='DRAFT',order.status);

  const confirmed=await requireOk(await request(`/sales/orders/${order.id}/status`,{
    method:'PATCH',token,body:{status:'CONFIRMED'}
  }),'Confirmar pedido');
  rec('Pedido queda CONFIRMED',confirmed.order?.status==='CONFIRMED',confirmed.order?.status||'—');

  // 3. Fetch order item
  const sales2=await requireOk(await request('/sales',{token}),'Releer pedido');
  const orderFresh=(sales2.orders||[]).find(o=>o.id===order.id);
  const orderItem=orderFresh?.items?.[0];
  if(!orderItem) throw new Error('No se encontró la partida del pedido.');

  // 4. Deliver -> inventory + kardex
  const delivered=await requireOk(await request('/sales-fulfillment/deliveries',{
    method:'POST',token,body:{
      salesOrderId:order.id,
      warehouseId:warehouse.id,
      deliveryDate:now.toISOString(),
      recipientName:'Cliente QA',
      reference:key,
      shippingAddress:'QA Order-to-Cash',
      notes:key,
      items:[{salesOrderItemId:orderItem.id,quantity:qty}]
    }
  }),'Registrar remisión / entrega');
  const delivery=delivered.delivery;
  report.entities.delivery={id:delivery.id,folio:delivery.folio};

  const balances2=await requireOk(await request('/inventory/balances',{token}),'Releer inventario');
  const after=(balances2.balances||[]).find(b=>b.warehouseId===warehouse.id&&b.productId===product.id);
  const afterQty=Number(after?.quantity||0);
  report.entities.afterQty=afterQty;
  rec('Inventario descuenta la entrega',Math.abs(afterQty-(beforeQty-qty))<0.000001,`${beforeQty} → ${afterQty}`);

  const moves2=await requireOk(await request('/inventory/movements',{token}),'Releer Kardex');
  const saleMove=(moves2.movements||[]).find(m=>m.reference===delivery.folio&&m.type==='SALE_OUT');
  rec('Kardex contiene SALE_OUT',Boolean(saleMove),saleMove?`${saleMove.type} · ${saleMove.reference}`:'No encontrado');
  if(!saleMove) throw new Error('No se encontró SALE_OUT en Kardex.');

  // 5. Invoice + AR
  const invd=await requireOk(await request('/sales-fulfillment/invoices',{
    method:'POST',token,body:{
      salesOrderId:order.id,
      issueDate:now.toISOString(),
      dueDate:due.toISOString(),
      notes:key
    }
  }),'Facturar pedido');
  const invoice=invd.invoice;
  report.entities.invoice={id:invoice.id,invoiceNumber:invoice.invoiceNumber,total:Number(invoice.total)};

  // Duplicate invoice must be blocked
  const duplicate=await request('/sales-fulfillment/invoices',{
    method:'POST',token,body:{salesOrderId:order.id,issueDate:now.toISOString(),dueDate:due.toISOString(),notes:key}
  });
  rec('Doble facturación bloqueada',!duplicate.ok&&duplicate.status===409,duplicate.ok?'La API permitió duplicado':`HTTP ${duplicate.status}`);
  if(duplicate.ok) throw new Error('La API permitió facturar dos veces el pedido.');

  const arData=await requireOk(await request('/accounts-receivable',{token}),'Releer CxC');
  const ar=(arData.invoices||[]).find(x=>x.invoiceNumber===invoice.invoiceNumber);
  rec('Factura genera CxC',Boolean(ar),ar?`${ar.invoiceNumber} · ${ar.status}`:'No encontrada');
  if(!ar) throw new Error('La factura no generó CxC.');
  report.entities.receivable={id:ar.id,total:Number(ar.total)};

  // 6. Partial then final collection: enforce synchronization of AR, invoice and bank ledger.
  const balance=Number(ar.balance??(Number(ar.total)-Number(ar.paidAmount||0)));
  if(!Number.isFinite(balance)||balance<=0)throw new Error('La CxC de QA no tiene saldo positivo.');
  const partial=Math.round(balance*40)/100; // 40% exact, rounded to cents.
  const remainder=Math.round((balance-partial)*100)/100;
  const treasuryBefore=await requireOk(await request('/treasury',{token}),'Leer saldo de tesorería previo a cobros');
  const accountBefore=treasuryBefore.accounts?.find(a=>a.id===treasury.id);
  if(!accountBefore)throw new Error('La cuenta de cobranza no aparece en Tesorería.');
  const initialTreasury=Number(accountBefore.currentBalance);
  report.entities.initialTreasury=initialTreasury;

  async function collect(amount,suffix,label) {
    return requireOk(await request('/collections/payments',{
      method:'POST',token,body:{
        customerId:customer.id,
        treasuryAccountId:treasury.id,
        paymentDate:now.toISOString(),
        amount,
        method:'TRANSFER',
        reference:key+'-'+suffix,
        notes:'Cobro QA Order-to-Cash v9.6.0 ('+suffix+')',
        applications:[{accountsReceivableId:ar.id,amount}],
      }
    }),label);
  }
  const partCol=await collect(partial,'PARTIAL','Registrar pago parcial');
  report.entities.partialCollection={id:partCol.payment?.id,amount:partial};
  const arIntermediate=await requireOk(await request('/accounts-receivable',{token}),'Releer CxC tras anticipo');
  const partialAr=arIntermediate.invoices?.find(x=>x.id===ar.id);
  rec('CxC queda PARTIALLY_PAID',partialAr?.status==='PARTIALLY_PAID',partialAr?.status||'—');
  rec('CxC conserva saldo pendiente exacto',Math.abs(Number(partialAr?.balance??(Number(partialAr?.total||0)-Number(partialAr?.paidAmount||0)))-remainder)<0.011,String(remainder));

  const partTreasury=await requireOk(await request('/treasury',{token}),'Comprobar ingreso parcial en Tesorería');
  const accountIntermediate=partTreasury.accounts?.find(a=>a.id===treasury.id);
  rec('Tesorería registra el anticipo',Math.abs(Number(accountIntermediate?.currentBalance)-initialTreasury-partial)<0.011,String(accountIntermediate?.currentBalance));

  const finalCol=await collect(remainder,'FINAL','Registrar liquidación de factura');
  report.entities.collection={id:finalCol.payment?.id,folio:finalCol.payment?.folio,total:balance};

  const arFinal=await requireOk(await request('/accounts-receivable',{token}),'Validar CxC final');
  const arClosed=(arFinal.invoices||[]).find(x=>x.id===ar.id);
  rec('CxC queda PAID',arClosed?.status==='PAID',arClosed?.status||'—');
  rec('Saldo CxC queda en cero',Math.abs(Number(arClosed?.balance??(Number(arClosed?.total||0)-Number(arClosed?.paidAmount||0))))<0.011,String(arClosed?.balance??'—'));

  const fulfillmentFinal=await requireOk(await request('/sales-fulfillment',{token}),'Validar factura comercial');
  const salesInvoice=(fulfillmentFinal.invoices||[]).find(x=>x.id===invoice.id);
  rec('Factura comercial sincroniza PAID',salesInvoice?.status==='PAID',salesInvoice?.status||'—');

  const collectionsFinal=await requireOk(await request('/collections',{token}),'Validar recibos de cobranza');
  for(const paid of [partCol.payment,finalCol.payment]){
    const receipt=(collectionsFinal.payments||[]).find(x=>x.id===paid?.id);
    rec('Recibo de cobranza APPLIED '+String(paid?.folio||''),receipt?.status==='APPLIED',receipt?.status||'—');
    rec('Cobro sin importe no aplicado '+String(paid?.folio||''),Math.abs(Number(receipt?.unappliedAmount||0))<0.011,String(receipt?.unappliedAmount??'—'));
  }

  const treasuryFinal=await requireOk(await request('/treasury',{token}),'Validar saldo bancario y movimientos');
  const bank=treasuryFinal.accounts?.find(a=>a.id===treasury.id);
  rec('Tesorería incrementa exactamente por los dos cobros',
    Math.abs(Number(bank?.currentBalance)-initialTreasury-balance)<0.011,
    String(bank?.currentBalance??'—'));
  const movements=(treasuryFinal.movements||[]).filter(m=>m.accountId===treasury.id&&m.type==='INCOME'&&[key+'-PARTIAL',key+'-FINAL'].includes(m.reference));
  rec('Tesorería contiene ambos asientos de cobranza',movements.length===2,String(movements.length));
  rec('Suma de asientos coincide con la factura',Math.abs(movements.reduce((sum,m)=>sum+Number(m.amount),0)-balance)<0.011,String(balance));

  const overpayment=await request('/collections/payments',{method:'POST',token,body:{
    customerId:customer.id,treasuryAccountId:treasury.id,paymentDate:now.toISOString(),amount:1,
    method:'TRANSFER',reference:key+'-OVERPAY',applications:[{accountsReceivableId:ar.id,amount:1}],
  }});
  rec('Cobro sobre factura liquidada rechazado',overpayment.status===409,'HTTP '+overpayment.status);

  await requireOk(await request('/order-to-cash/dashboard',{token}),'Actualizar dashboard Order-to-Cash');

  console.log('\n----------------------------------------------');
  console.log(`Flujo creado: ${quote.folio} → ${order.folio} → ${delivery.folio} → ${invoice.invoiceNumber} → ${partCol.payment?.folio||'COB'} → ${finalCol.payment?.folio||'COB'}`);
  console.log('Resultado: Order-to-Cash E2E PASS.');
}catch(error){
  console.error(`\nERROR QA: ${error.message}`);
  report.runtimeError=error.message;
}finally{
  await save();
}
if(report.runtimeError||report.checks.some(x=>!x.ok)) process.exit(1);
