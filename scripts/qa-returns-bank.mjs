import fs from 'node:fs';
import {createPrismaClient} from '../apps/api/src/lib/prisma.js';
import {assertEphemeralQaTarget,createQaApiRequester} from './qa-ephemeral-api.mjs';
assertEphemeralQaTarget();
const prisma=createPrismaClient();
const api=createQaApiRequester(process.env.API_URL.replace(/\/$/,''));
const handoff=JSON.parse(fs.readFileSync('artifacts/qa/motornorte-o2c-handoff.json','utf8'));
const checks=[],approx=(a,b)=>Math.abs(Number(a)-Number(b))<0.011;
function check(label,ok,detail=''){checks.push({label,ok,detail});console.log((ok?'PASS ':'FAIL ')+label+' '+detail);if(!ok)throw Error(label+' '+detail)}
async function call(route,options){return api.request(route,options)}
async function good(label,route,options){const r=await call(route,options);check(label,r.ok,'HTTP '+r.status+' '+(r.data?.message||''));return r.data}
let failure;
try{
 await good('Login MotorNorte','/auth/login',{method:'POST',body:{email:process.env.O2C_EMAIL,password:process.env.O2C_PASSWORD}});
 check('Cookie de sesión ERP',api.hasSession);
 const tenant=await prisma.company.findUnique({where:{taxId:'MRA160812MN1'}});
 const paidAP=await prisma.accountsPayable.findFirst({where:{companyId:tenant.id,status:'PAID',paidAmount:{gt:0}}});
 const paidAR=await prisma.accountsReceivable.findFirst({where:{companyId:tenant.id,invoiceNumber:handoff.invoiceNumber,paidAmount:{gt:0}}});
 check('Documentos pagados para probar cancelación',Boolean(paidAP&&paidAR));
 for(const [label,endpoint] of [
   ['CxP pagada','/accounts-payable/'+paidAP.id+'/cancel'],
   ['CxC cobrada','/accounts-receivable/'+paidAR.id+'/cancel']
 ]){
   const blocked=await call(endpoint,{method:'PATCH',body:{}});
   check(label+' no admite cancelación directa',blocked.status===400,'HTTP '+blocked.status);
 }

 const delivery=await prisma.salesDelivery.findUnique({where:{id:handoff.salesDeliveryId},include:{items:true}});
 const deliveryItem=delivery?.items.find(i=>i.productId===handoff.productId);
 check('Refacción entregada localizable',!!deliveryItem);
 const row={warehouseId:handoff.warehouseId,productId:handoff.productId};
 const quantity=async()=>Number((await prisma.inventoryBalance.findUnique({where:{warehouseId_productId:row}}))?.quantity);
 const stock=await quantity();
 check('Stock tras entrega',approx(stock,handoff.stockAfterDelivery));
 const body={salesDeliveryId:delivery.id,warehouseId:row.warehouseId,
   returnDate:new Date().toISOString(),reason:'Devolución QA de refacción',
   items:[{salesDeliveryItemId:deliveryItem.id,quantity:handoff.quantityDelivered}]};
 const returned=await good('Devolución comercial','/sales-returns/returns',{method:'POST',body});
 check('Existencias restauradas',approx(await quantity(),stock+handoff.quantityDelivered));
 const movement=await prisma.inventoryMovement.findFirst({where:{reference:returned.salesReturn.folio,type:'SALE_RETURN_IN',productId:row.productId}});
 check('Kardex de devolución',Boolean(movement?.createdById));
 const twice=await call('/sales-returns/returns',{method:'POST',body});
 check('Devolución duplicada bloqueada',twice.status===409,'HTTP '+twice.status);
 check('Sin duplicar existencias',approx(await quantity(),stock+handoff.quantityDelivered));
 const total=Number(handoff.total),sub=Math.round(total/1.16*100)/100;
 const note={salesInvoiceId:handoff.salesInvoiceId,salesReturnId:returned.salesReturn.id,
   issueDate:new Date().toISOString(),subtotal:sub,taxTotal:Math.round((total-sub)*100)/100,
   reason:'Nota QA por devolución'};
 const credited=await good('Nota de crédito','/sales-returns/credit-notes',{method:'POST',body:note});
 check('Nota ligada a devolución',credited.creditNote?.salesReturnId===returned.salesReturn.id);
 const duplicateNote=await call('/sales-returns/credit-notes',{method:'POST',body:note});
 check('Nota de crédito duplicada bloqueada',[404,409].includes(duplicateNote.status),'HTTP '+duplicateNote.status);
 const refs=[handoff.paymentReferencePartial,handoff.paymentReferenceFinal];
 const movements=await Promise.all(refs.map(reference=>prisma.treasuryMovement.findFirst({
   where:{reference,accountId:handoff.treasuryAccountId}})));
 check('Dos asientos de Tesorería',movements.every(Boolean));
 const statement=await good('Abrir conciliación','/bank-reconciliation/statements',{method:'POST',body:{
   treasuryAccountId:handoff.treasuryAccountId,statementDate:new Date().toISOString(),
   periodStart:new Date(Date.now()-86400000).toISOString(),periodEnd:new Date(Date.now()+86400000).toISOString(),
   openingBalance:0,closingBalance:total}});
 const lines=[];
 for(const [i,amount] of [handoff.paymentPartial,handoff.paymentFinal].entries()){
   const d=await good('Movimiento bancario '+i,'/bank-reconciliation/statements/'+statement.statement.id+'/lines',
     {method:'POST',body:{transactionDate:new Date().toISOString(),description:'Cobro bancario QA '+i,
       type:'CREDIT',amount,reference:refs[i]}});
   lines.push(d.line);
 }
 const premature=await call('/bank-reconciliation/statements/'+statement.statement.id+'/close',{method:'PATCH',body:{}});
 check('No cerrar con partidas pendientes',premature.status===409,'HTTP '+premature.status);
 const mismatched=await call('/bank-reconciliation/lines/'+lines[0].id+'/match',
   {method:'POST',body:{treasuryMovementId:movements[1].id}});
 check('Rechaza importe incorrecto',mismatched.status===409,'HTTP '+mismatched.status);
 for(const i of [0,1]){
   const matched=await good('Conciliar ingreso '+i,'/bank-reconciliation/lines/'+lines[i].id+'/match',
     {method:'POST',body:{treasuryMovementId:movements[i].id}});
   check('Partida MATCHED '+i,matched.line?.status==='MATCHED');
 }
 const again=await call('/bank-reconciliation/lines/'+lines[0].id+'/match',
   {method:'POST',body:{treasuryMovementId:movements[0].id}});
 check('No duplicar match',again.status===404,'HTTP '+again.status);
 const closed=await good('Cerrar conciliación','/bank-reconciliation/statements/'+statement.statement.id+'/close',
   {method:'PATCH',body:{}});
 check('Conciliación cerrada',closed.statement?.status==='CLOSED');
 const read=await good('Consultar conciliación','/bank-reconciliation');
 const saved=read.statements?.find(s=>s.id===statement.statement.id);
 check('Dos asientos conciliados',saved?.lines?.length===2&&saved.lines.every(l=>l.status==='MATCHED'));
 fs.mkdirSync('artifacts/qa',{recursive:true});
 fs.writeFileSync('artifacts/qa/motornorte-return-handoff.json',JSON.stringify({
   creditNoteId:credited.creditNote.id,creditFolio:credited.creditNote.folio,
   salesReturnId:returned.salesReturn.id,bankStatementId:statement.statement.id,
 },null,2));
}catch(e){failure=e.message;console.error('QA finance error:',failure)}
finally{
 await prisma.$disconnect();
 fs.mkdirSync('artifacts/qa',{recursive:true});
 fs.writeFileSync('artifacts/qa/returns-bank-qa.json',JSON.stringify({checks,failure},null,2));
 console.log('Devoluciones + banco: '+checks.filter(x=>x.ok).length+'/'+checks.length);
 if(failure||checks.some(x=>!x.ok))process.exitCode=1;
}
