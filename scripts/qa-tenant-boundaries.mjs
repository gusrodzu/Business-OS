import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createPrismaClient} from '../apps/api/src/lib/prisma.js';
import {assertEphemeralQaTarget,createQaApiRequester} from './qa-ephemeral-api.mjs';

assertEphemeralQaTarget();
const prisma=createPrismaClient();
const base=process.env.API_URL.replace(/\/$/,'');
const motorApi=createQaApiRequester(base);
const otherApi=createQaApiRequester(base);
const checks=[];
function record(name,ok,detail='') {
  checks.push({name,ok,detail});
  console.log((ok?'PASS':'FAIL')+'  '+name+(detail?' · '+detail:''));
  assert.ok(ok,name+' · '+detail);
}
async function call(api,route,opts) {
  const r=await api.request(route,opts);
  return r;
}
async function login(api,email,password,label) {
  const r=await call(api,'/auth/login',{method:'POST',body:{email,password}});
  record(label+' cookie-authenticated login',r.status===200&&api.hasSession,'HTTP '+r.status);
}
function forbiddenResult(r){return [403,404,409].includes(r.status);}
function notFound(r){return r.status===404;}
const snapshot=async(companyId)=>({
  pr:await prisma.purchaseRequest.findMany({where:{companyId},select:{id:true,status:true}}),
  po:await prisma.purchaseOrder.findMany({where:{companyId},select:{id:true,status:true}}),
  payable:await prisma.accountsPayable.findMany({where:{companyId},select:{id:true,status:true,paidAmount:true}}),
  receivable:await prisma.accountsReceivable.findMany({where:{companyId},select:{id:true,status:true,paidAmount:true}}),
  salesOrders:await prisma.salesOrder.count({where:{companyId}}),
  salesQuotes:await prisma.salesQuote.count({where:{companyId}}),
  pos:await prisma.posSale.findMany({where:{companyId},select:{id:true,status:true}}),
  treasuryMoves:await prisma.treasuryMovement.count({where:{companyId}}),
});
function containsAny(value,ids){
  const json=JSON.stringify(value);
  return ids.some(id=>json.includes('"'+id+'"'));
}
let error=null;
try{
  const [motor,other]=await Promise.all([
    prisma.company.findUnique({where:{taxId:'MRA160812MN1'}}),
    prisma.company.findUnique({where:{taxId:'XAXX010101000'}}),
  ]);
  record('Two distinct seeded tenant companies exist',Boolean(motor&&other&&motor.id!==other.id));
  await login(motorApi,'demo@buzzbee.mx','BuzzBee2026!','MotorNorte');
  await login(otherApi,'admin@erp.local','Admin123!','Other tenant');

  const [motorProduct,motorWarehouse,motorCustomer,motorPR,motorAP,motorAR,motorPOS,motorOrder]=await Promise.all([
    prisma.product.findFirst({where:{companyId:motor.id},orderBy:{createdAt:'asc'}}),
    prisma.warehouse.findFirst({where:{branch:{companyId:motor.id}}}),
    prisma.customer.findFirst({where:{companyId:motor.id}}),
    prisma.purchaseRequest.findFirst({where:{companyId:motor.id}}),
    prisma.accountsPayable.findFirst({where:{companyId:motor.id}}),
    prisma.accountsReceivable.findFirst({where:{companyId:motor.id}}),
    prisma.posSale.findFirst({where:{companyId:motor.id}}),
    prisma.salesOrder.findFirst({where:{companyId:motor.id}}),
  ]);
  record('MotorNorte fixtures: product, warehouse, customer, request, AP, AR',Boolean(motorProduct&&motorWarehouse&&motorCustomer&&motorPR&&motorAP&&motorAR));
  const foreignIds=[motorProduct.id,motorWarehouse.id,motorCustomer.id,motorPR.id,motorAP.id,motorAR.id,motor.id];
  if(motorPOS)foreignIds.push(motorPOS.id);
  if(motorOrder)foreignIds.push(motorOrder.id);
  const initialMotor=await snapshot(motor.id);
  const initialOther=await snapshot(other.id);
  const initialBalances=await prisma.inventoryBalance.findMany({
    where:{productId:motorProduct.id},select:{id:true,warehouseId:true,quantity:true}
  });
  const foreignLists=['/purchase-requests','/purchase-orders','/inventory/balances',
    '/inventory/movements','/accounts-payable','/accounts-receivable','/sales',
    '/pos/dashboard','/collections','/treasury'];
  for(const route of foreignLists){
    const r=await call(otherApi,route);
    record('Other tenant list '+route+' contains no MotorNorte IDs',r.ok&&!containsAny(r.data,foreignIds),'HTTP '+r.status);
  }
  const own=await call(motorApi,'/purchase-requests/'+motorPR.id);
  record('Positive control: MotorNorte can read its own purchase request',own.status===200);
  const foreignGet=await call(otherApi,'/purchase-requests/'+motorPR.id);
  record('Foreign purchase request is not readable',notFound(foreignGet),'HTTP '+foreignGet.status);

  const forbiddenCases=[
    ['Foreign request resolution','/purchase-requests/'+motorPR.id+'/resolve','POST',{decision:'APPROVED',note:'QA foreign access denial'}],
    ['Foreign AP payment','/accounts-payable/'+motorAP.id+'/payments','POST',{amount:1,paymentDate:new Date().toISOString(),method:'Transferencia'}],
    ['Foreign AP cancellation','/accounts-payable/'+motorAP.id+'/cancel','PATCH',{}],
    ['Foreign AR cancellation','/accounts-receivable/'+motorAR.id+'/cancel','PATCH',{}],
    ['Foreign AR payment','/accounts-receivable/'+motorAR.id+'/payments','POST',{amount:1,paymentDate:new Date().toISOString(),method:'Transferencia'}],
    ['Foreign warehouse status','/warehouses/'+motorWarehouse.id+'/status','PATCH',{active:false}],
  ];
  for(const [label,route,method,body] of forbiddenCases){
    const r=await call(otherApi,route,{method,body});
    record(label+' blocked',notFound(r),'HTTP '+r.status);
  }

  const now=new Date().toISOString();
  const salesBody=(customerId,productId)=>({
    customerId,orderDate:now,currency:'MXN',
    notes:'Security QA cross-tenant negative probe',
    items:[{productId,quantity:1,unitPrice:10,taxRate:16}],
  });
  const foreignOrder=await call(otherApi,'/sales/orders',{method:'POST',body:salesBody(motorCustomer.id,motorProduct.id)});
  record('Foreign customer/product direct sales order is rejected',notFound(foreignOrder),'HTTP '+foreignOrder.status);

  const otherCustomer=await prisma.customer.findFirst({where:{companyId:other.id}});
  record('Other tenant has its own seeded customer',Boolean(otherCustomer));
  const productSmuggling=await call(otherApi,'/sales/orders',{method:'POST',body:salesBody(otherCustomer.id,motorProduct.id)});
  record('Foreign product with own customer is rejected',notFound(productSmuggling),'HTTP '+productSmuggling.status);
  const quote=await call(otherApi,'/sales/quotes',{method:'POST',body:{
    customerId:motorCustomer.id,quoteDate:now,validUntil:now,currency:'MXN',
    items:[{productId:motorProduct.id,quantity:1,unitPrice:10,taxRate:16}],
  }});
  record('Foreign customer/product quote rejected',notFound(quote),'HTTP '+quote.status);

  const foreignWh=await call(otherApi,'/purchase-requests',{method:'POST',body:{
    warehouseId:motorWarehouse.id,title:'Cross-tenant isolation QA',priority:'NORMAL',
    items:[{productId:motorProduct.id,quantity:1,estimatedUnitCost:10}],
  }});
  record('Foreign warehouse/product purchasing request rejected',notFound(foreignWh),'HTTP '+foreignWh.status);
  const ownWarehouse=await prisma.warehouse.findFirst({where:{branch:{companyId:other.id}}});
  record('Other tenant has its own warehouse',Boolean(ownWarehouse));
  const foreignProduct=await call(otherApi,'/purchase-requests',{method:'POST',body:{
    warehouseId:ownWarehouse.id,title:'Cross-tenant isolation QA',priority:'NORMAL',
    items:[{productId:motorProduct.id,quantity:1,estimatedUnitCost:10}],
  }});
  record('Foreign product with own warehouse purchasing rejected',foreignProduct.status===400,'HTTP '+foreignProduct.status);
  if(motorPOS){
    const r=await call(otherApi,'/pos/sales/'+motorPOS.id+'/void',{method:'POST',body:{}});
    record('Other tenant cannot void MotorNorte POS ticket',notFound(r),'HTTP '+r.status);
  }
  if(motorOrder){
    const r=await call(otherApi,'/sales-fulfillment/invoices',{method:'POST',body:{
      salesOrderId:motorOrder.id,issueDate:now,dueDate:now,
    }});
    record('Other tenant cannot invoice MotorNorte order',notFound(r),'HTTP '+r.status);
  }

  const finalMotor=await snapshot(motor.id);
  const finalOther=await snapshot(other.id);
  const finalBalances=await prisma.inventoryBalance.findMany({
    where:{productId:motorProduct.id},select:{id:true,warehouseId:true,quantity:true}
  });
  record('Foreign mutation probes leave MotorNorte orders, receivables and receipts unchanged',
    JSON.stringify(finalMotor)===JSON.stringify(initialMotor));
  record('Foreign mutation probes do not create other tenant orders or quotes',
    finalOther.salesOrders===initialOther.salesOrders&&finalOther.salesQuotes===initialOther.salesQuotes&&
    finalOther.pr.length===initialOther.pr.length);
  record('Foreign mutation probes cannot change MotorNorte stock',JSON.stringify(initialBalances)===JSON.stringify(finalBalances));
}catch(e){error=e;console.error('Tenant QA failure:',e.message)}
finally{
  await prisma.$disconnect();
  const output={suite:'tenant-isolation',checkedAt:new Date().toISOString(),
    total:checks.length,passed:checks.filter(c=>c.ok).length,failed:checks.filter(c=>!c.ok).length,
    error:error?.message||null,checks};
  fs.mkdirSync(path.resolve('artifacts','qa'),{recursive:true});
  fs.writeFileSync(path.resolve('artifacts','qa','tenant-isolation-runtime.json'),JSON.stringify(output,null,2));
  console.log('Tenant isolation: '+output.passed+'/'+output.total+' passing');
  if(error||output.failed)process.exitCode=1;
}
