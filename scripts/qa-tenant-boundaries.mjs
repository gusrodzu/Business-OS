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

  // QA-02: real API cookies must scope module entitlements to their own tenant.
  // This runs only against the disposable PostgreSQL/API target guarded above.
  // The base transactional seed does not populate the module catalog.
  // Create one synthetic entitlement for each tenant in the guarded QA DB.
  const qaModule=await prisma.module.upsert({
    where:{key:'qa-tenant-cookie-scope'},
    update:{active:true},
    create:{key:'qa-tenant-cookie-scope',name:'QA tenant cookie scope',category:'QA',active:true},
  });
  // Give each tenant a different effective entitlement for the same catalog module.
  await Promise.all([[motor.id,true],[other.id,false]].map(([companyId,enabled])=>prisma.companyModule.upsert({
    where:{companyId_moduleId:{companyId,moduleId:qaModule.id}},
    update:{enabled},
    create:{companyId,moduleId:qaModule.id,enabled},
  })));
  const [motorModules,otherModules,spoofedModules]=await Promise.all([
    call(motorApi,'/modules/dashboard'),
    call(otherApi,'/modules/dashboard'),
    call(motorApi,'/modules/dashboard?companyId='+encodeURIComponent(other.id)),
  ]);
  const moduleScopeMatches=(response,companyId)=>
    response.status===200&&Array.isArray(response.data?.companyModules)
    &&response.data.companyModules.length>0
    &&response.data.companyModules.every(row=>row.companyId===companyId);
  record('MotorNorte module entitlements belong to its cookie tenant',
    moduleScopeMatches(motorModules,motor.id),'HTTP '+motorModules.status);
  record('Other company module entitlements belong to its cookie tenant',
    moduleScopeMatches(otherModules,other.id),'HTTP '+otherModules.status);
  record('Client-supplied companyId cannot switch module entitlement scope',
    moduleScopeMatches(spoofedModules,motor.id),'HTTP '+spoofedModules.status);
  const qaEntitlement=(response)=>response.data?.companyModules?.find(row=>row.moduleId===qaModule.id);
  record('MotorNorte effective QA module is enabled',
    qaEntitlement(motorModules)?.enabled===true,'HTTP '+motorModules.status);
  record('Other tenant effective QA module is disabled',
    qaEntitlement(otherModules)?.enabled===false,'HTTP '+otherModules.status);
  record('Spoofed companyId cannot adopt foreign effective module state',
    qaEntitlement(spoofedModules)?.enabled===true,'HTTP '+spoofedModules.status);

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
  // Positive control: valid direct orders inside the owner tenant must still work.
  const positiveOrder=await call(motorApi,'/sales/orders',{method:'POST',body:{
    customerId:motorCustomer.id,orderDate:new Date().toISOString(),currency:'MXN',
    notes:'QA local positive ownership check',
    items:[{productId:motorProduct.id,quantity:1,unitPrice:10,taxRate:16}],
  }});
  record('Owner tenant can create direct sales order with its own customer/product',
    positiveOrder.status===201&&positiveOrder.data?.order?.companyId===motor.id,
    'HTTP '+positiveOrder.status);

  const foreignIds=[motorProduct.id,motorWarehouse.id,motorCustomer.id,motorPR.id,motorAP.id,motorAR.id,motor.id];
  if(motorPOS)foreignIds.push(motorPOS.id);
  if(motorOrder)foreignIds.push(motorOrder.id);
  foreignIds.push(positiveOrder.data.order.id);
  const otherCustomer=await prisma.customer.findFirst({where:{companyId:other.id}});
  const otherWarehouse=await prisma.warehouse.findFirst({where:{branch:{companyId:other.id}}});
  record('Other tenant has own customer and warehouse',Boolean(otherCustomer&&otherWarehouse));
  const otherIds=[other.id,otherCustomer.id,otherWarehouse.id];
  const initialMotor=await snapshot(motor.id);
  const initialOther=await snapshot(other.id);
  const initialBalances=await prisma.inventoryBalance.findMany({
    where:{productId:motorProduct.id},select:{id:true,warehouseId:true,quantity:true}
  });
  const foreignLists=['/purchase-requests','/purchase-orders','/inventory/balances',
    '/inventory/movements','/accounts-payable','/accounts-receivable','/sales',
    '/pos/dashboard','/collections','/treasury'];
  for(const route of foreignLists){
    const [r,m]=await Promise.all([call(otherApi,route),call(motorApi,route)]);
    record('Other tenant list '+route+' contains no MotorNorte IDs',r.ok&&!containsAny(r.data,foreignIds),'HTTP '+r.status);
    record('MotorNorte list '+route+' contains no other tenant IDs',m.ok&&!containsAny(m.data,otherIds),'HTTP '+m.status);
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
    ['Foreign direct sales order status','/sales/orders/'+positiveOrder.data.order.id+'/status','PATCH',{status:'CANCELLED'}],
  ];
  for(const [label,route,method,body] of forbiddenCases){
    const r=await call(otherApi,route,{method,body});
    record(label+' blocked',notFound(r),'HTTP '+r.status);
  }

  const [foreignNote,foreignAccount,foreignJournal,foreignPeriod]=await Promise.all([
    prisma.salesCreditNote.findFirst({where:{companyId:motor.id,status:'APPLIED'}}),
    prisma.treasuryAccount.findFirst({where:{companyId:motor.id,type:'BANK'}}),
    prisma.journalEntry.findFirst({where:{companyId:motor.id,status:'POSTED',sourceType:{not:'REVERSAL'}}}),
    prisma.accountingPeriod.findFirst({where:{companyId:motor.id,status:'OPEN'}}),
  ]);
  record('Financial fixtures available for cross-tenant refund/reversal',Boolean(foreignNote&&foreignAccount&&foreignJournal&&foreignPeriod));
  const foreignRefund=await call(otherApi,'/sales-returns/credit-notes/'+foreignNote.id+'/refunds',{
    method:'POST',body:{
      treasuryAccountId:foreignAccount.id,externalReference:'FOREIGN-QA-DENY',
      confirmedAt:new Date().toISOString(),
    },
  });
  record('Foreign customer credit refund denied',notFound(foreignRefund),'HTTP '+foreignRefund.status);
  const foreignReversal=await call(otherApi,'/accounting/entries/'+foreignJournal.id+'/reverse',{
    method:'POST',body:{
      periodId:foreignPeriod.id,entryDate:new Date().toISOString(),
      reason:'Foreign journal manipulation must be denied',
    },
  });
  record('Foreign accounting reversal denied',notFound(foreignReversal),'HTTP '+foreignReversal.status);

  const now=new Date().toISOString();
  const salesBody=(customerId,productId)=>({
    customerId,orderDate:now,currency:'MXN',
    notes:'Security QA cross-tenant negative probe',
    items:[{productId,quantity:1,unitPrice:10,taxRate:16}],
  });
  const foreignOrder=await call(otherApi,'/sales/orders',{method:'POST',body:salesBody(motorCustomer.id,motorProduct.id)});
  record('Foreign customer/product direct sales order is rejected',notFound(foreignOrder),'HTTP '+foreignOrder.status);

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

  // QA-02: replay the original ERP cookie after logout. The QA requester deliberately
  // retains its cookie, so this verifies server-side sessionVersion revocation rather
  // than merely checking that the browser received a cleared cookie.
  const [motorBeforeLogout,otherBeforeLogout]=await Promise.all([
    call(motorApi,'/auth/me'),call(otherApi,'/auth/me'),
  ]);
  record('Both tenant sessions are valid before logout',
    motorBeforeLogout.status===200&&otherBeforeLogout.status===200);
  // QA-02: permissions must be evaluated on each request, not frozen in the
  // already-issued cookie. Mutate only the disposable QA database and restore
  // the original role assignments even if a regression assertion fails.
  const motorUserId=motorBeforeLogout.data?.user?.id;
  record('MotorNorte authenticated identity is available for role QA',Boolean(motorUserId));
  const originalRoles=await prisma.userRole.findMany({
    where:{userId:motorUserId},select:{roleId:true},
  });
  record('MotorNorte has seeded roles to restore after role QA',originalRoles.length>0);
  const privilegedBefore=await call(motorApi,'/admin/users');
  record('MotorNorte can read permitted users before role revocation',
    privilegedBefore.status===200,'HTTP '+privilegedBefore.status);
  try {
    await prisma.userRole.deleteMany({where:{userId:motorUserId}});
    const [revokedPermission,stillAuthenticated,otherStillAuthenticated]=await Promise.all([
      call(motorApi,'/admin/users'),call(motorApi,'/auth/me'),call(otherApi,'/auth/me'),
    ]);
    record('Role revocation denies the original cookie privileged users endpoint',
      revokedPermission.status===403,'HTTP '+revokedPermission.status);
    record('Role revocation does not implicitly revoke ERP authentication',
      stillAuthenticated.status===200,'HTTP '+stillAuthenticated.status);
    record('Role revocation of one user preserves the other tenant session',
      otherStillAuthenticated.status===200,'HTTP '+otherStillAuthenticated.status);
  } finally {
    await prisma.userRole.createMany({
      data:originalRoles.map(({roleId})=>({userId:motorUserId,roleId})),
      skipDuplicates:true,
    });
  }
  const privilegedRestored=await call(motorApi,'/admin/users');
  record('Restoring roles restores privileged access with the same cookie',
    privilegedRestored.status===200,'HTTP '+privilegedRestored.status);

  // QA-02: disabling a user must reject the already-issued ERP cookie on
  // every request. The disposable QA user's original active flag is restored
  // even if an assertion fails; the other company's session is unaffected.
  const motorUserState=await prisma.user.findUnique({
    where:{id:motorUserId},select:{active:true},
  });
  record('MotorNorte user is active before deactivation QA',motorUserState?.active===true);
  try {
    await prisma.user.update({where:{id:motorUserId},data:{active:false}});
    const [disabledMe,disabledModules,otherWhileDisabled]=await Promise.all([
      call(motorApi,'/auth/me'),
      call(motorApi,'/modules/dashboard'),
      call(otherApi,'/auth/me'),
    ]);
    record('Disabled user original cookie is rejected by /auth/me',
      disabledMe.status===401,'HTTP '+disabledMe.status);
    record('Disabled user original cookie cannot read module entitlements',
      disabledModules.status===401,'HTTP '+disabledModules.status);
    record('Disabling one user preserves the other tenant session',
      otherWhileDisabled.status===200,'HTTP '+otherWhileDisabled.status);
  } finally {
    await prisma.user.update({where:{id:motorUserId},data:{active:motorUserState.active}});
  }
  const reactivatedMe=await call(motorApi,'/auth/me');
  record('Reactivated QA user retains valid original cookie',
    reactivatedMe.status===200,'HTTP '+reactivatedMe.status);

  // QA-02: deactivating a tenant must invalidate its existing ERP cookies
  // without revoking another tenant's session. Only the disposable QA
  // company's active flag is changed and always restored in finally.
  const motorCompanyState=await prisma.company.findUnique({
    where:{id:motor.id},select:{active:true},
  });
  record('MotorNorte company is active before deactivation QA',
    motorCompanyState?.active===true);
  try {
    await prisma.company.update({where:{id:motor.id},data:{active:false}});
    const [disabledCompanyMe,disabledCompanyModules,otherWhileCompanyDisabled]=await Promise.all([
      call(motorApi,'/auth/me'),
      call(motorApi,'/modules/dashboard'),
      call(otherApi,'/auth/me'),
    ]);
    record('Disabled company original ERP cookie is rejected by /auth/me',
      disabledCompanyMe.status===401,'HTTP '+disabledCompanyMe.status);
    record('Disabled company original ERP cookie cannot read modules',
      disabledCompanyModules.status===401,'HTTP '+disabledCompanyModules.status);
    record('Disabling one company preserves another tenant session',
      otherWhileCompanyDisabled.status===200
        &&otherWhileCompanyDisabled.data?.user?.company?.id===other.id,
      'HTTP '+otherWhileCompanyDisabled.status);
  } finally {
    await prisma.company.update({
      where:{id:motor.id},data:{active:motorCompanyState.active},
    });
  }
  const restoredCompanyMe=await call(motorApi,'/auth/me');
  record('Reactivated QA company restores access with original ERP cookie',
    restoredCompanyMe.status===200,'HTTP '+restoredCompanyMe.status);

  const motorLogout=await call(motorApi,'/auth/logout',{method:'POST'});
  record('MotorNorte logout succeeds',motorLogout.status===200,'HTTP '+motorLogout.status);
  const [motorAfterLogout,motorModulesAfterLogout,otherAfterLogout]=await Promise.all([
    call(motorApi,'/auth/me'),
    call(motorApi,'/modules/dashboard'),
    call(otherApi,'/auth/me'),
  ]);
  record('Revoked MotorNorte cookie cannot access /auth/me',
    motorAfterLogout.status===401,'HTTP '+motorAfterLogout.status);
  record('Revoked MotorNorte cookie cannot access module entitlements',
    motorModulesAfterLogout.status===401,'HTTP '+motorModulesAfterLogout.status);
  record('Revoking one tenant session does not invalidate the other',
    otherAfterLogout.status===200&&otherAfterLogout.data?.user?.company?.id===other.id,
    'HTTP '+otherAfterLogout.status);

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
