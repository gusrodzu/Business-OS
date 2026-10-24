import fs from 'node:fs';
import {createPrismaClient} from '../apps/api/src/lib/prisma.js';
import {assertEphemeralQaTarget,createQaApiRequester} from './qa-ephemeral-api.mjs';

assertEphemeralQaTarget();
const api=createQaApiRequester(process.env.API_URL.replace(/\/$/,''));
const db=createPrismaClient();
const sale=JSON.parse(fs.readFileSync('artifacts/qa/motornorte-o2c-handoff.json','utf8'));
const returned=JSON.parse(fs.readFileSync('artifacts/qa/motornorte-return-handoff.json','utf8'));
const checks=[],near=(a,b)=>Math.abs(Number(a)-Number(b))<=0.011;
function check(label,ok,detail=''){checks.push({label,ok,detail});console.log((ok?'PASS ':'FAIL ')+label+' '+detail);if(!ok)throw Error(label+' '+detail)}
async function request(route,options){return api.request(route,options)}
async function good(label,route,options){const r=await request(route,options);check(label,r.ok,'HTTP '+r.status+' '+(r.data?.message||''));return r.data}
let failure;
try {
 await good('MotorNorte auth','/auth/login',{method:'POST',body:{email:process.env.O2C_EMAIL,password:process.env.O2C_PASSWORD}});
 const note=await db.salesCreditNote.findUnique({where:{id:returned.creditNoteId}});
 check('Applied note eligible for confirmed refund',note?.status==='APPLIED'&&near(note?.total,sale.total));
 const bank=()=>db.treasuryAccount.findUnique({where:{id:sale.treasuryAccountId}});
 const before=await bank();
 const invalid=await request('/sales-returns/credit-notes/'+note.id+'/refunds',{method:'POST',body:{
   treasuryAccountId:before.id,externalReference:'',confirmedAt:new Date().toISOString(),
 }});
 check('Reject refund without bank confirmation reference',invalid.status===400,'HTTP '+invalid.status);
 const ref='EXT-QA-REF-'+Date.now();
 const payload={
   treasuryAccountId:before.id,externalReference:ref,confirmedAt:new Date().toISOString(),
   notes:'Simulated external transfer confirmed by QA in disposable database',
 };
 const confirmed=await good('Record confirmed external customer refund',
   '/sales-returns/credit-notes/'+note.id+'/refunds',{method:'POST',body:payload});
 check('Refund record does not claim to initiate external transfer',confirmed.executedExternally===false);
 const movement=confirmed.refund;
 check('Refund EXPENSE bound to exact credit note',
   movement?.type==='EXPENSE'&&movement?.referenceType==='SalesCreditNote'&&movement?.referenceId===note.id);
 const after=await bank();
 check('Treasury debited exactly refund amount',near(Number(before.currentBalance)-Number(after.currentBalance),note.total));
 const retry=await request('/sales-returns/credit-notes/'+note.id+'/refunds',{method:'POST',body:{
   ...payload,externalReference:'EXT-QA-DUP-'+Date.now(),
 }});
 check('Refund replay blocked even with different external reference',retry.status===409,'HTTP '+retry.status);
 check('No duplicate treasury debit',near((await bank()).currentBalance,after.currentBalance));
 const treasuryRows=await db.treasuryMovement.findMany({
   where:{referenceType:'SalesCreditNote',referenceId:note.id},
 });
 check('Exactly one refund for credit note',treasuryRows.length===1);

 // Simulated bank CSV is generated from a confirmed movement, not uploaded to a bank.
 const fixture='date,type,amount,reference,description\n'+
   new Date().toISOString().slice(0,10)+',DEBIT,'+Number(note.total).toFixed(2)+','+
   ref+',Customer refund confirmed QA\n';
 fs.mkdirSync('artifacts/qa',{recursive:true});
 const filename='artifacts/qa/bank-extract-refund-synthetic.csv';
 fs.writeFileSync(filename,fixture);
 const [heading,...records]=fs.readFileSync(filename,'utf8').trim().split(/\r?\n/);
 check('Bank extract CSV has expected schema',
   heading==='date,type,amount,reference,description'&&records.length===1);
 const [date,type,amount,reference,description]=records[0].split(',');
 check('Simulated debit agrees with confirmed outgoing movement',
   type==='DEBIT'&&near(amount,movement.amount)&&reference===movement.reference);
 const statement=await good('Create simulated refund statement','/bank-reconciliation/statements',{
   method:'POST',body:{
     treasuryAccountId:before.id,statementDate:date,periodStart:new Date(Date.now()-86400000).toISOString(),
     periodEnd:new Date(Date.now()+86400000).toISOString(),
     openingBalance:Number(before.currentBalance),closingBalance:Number(after.currentBalance),
     notes:'CSV synthetic QA refund - no real bank connection',
   },
 });
 const line=await good('Import synthetic debit as statement line',
   '/bank-reconciliation/statements/'+statement.statement.id+'/lines',{
     method:'POST',body:{transactionDate:date,type,amount:Number(amount),description,reference},
   });
 const match=await good('Reconcile confirmed refund with bank debit',
   '/bank-reconciliation/lines/'+line.line.id+'/match',{
     method:'POST',body:{treasuryMovementId:movement.id},
   });
 check('Refund debit reconciled',match.line?.status==='MATCHED');
 const closed=await good('Close refund bank statement',
   '/bank-reconciliation/statements/'+statement.statement.id+'/close',{method:'PATCH',body:{}});
 check('Outgoing refund bank statement CLOSED',closed.statement?.status==='CLOSED');
 const unmatching=await request('/bank-reconciliation/lines/'+line.line.id+'/match',
   {method:'POST',body:{treasuryMovementId:movement.id}});
 check('Refund bank match cannot repeat',unmatching.status===404,'HTTP '+unmatching.status);
}catch(e){failure=e.message;console.error('Refund CSV QA:',failure)}
finally{
 await db.$disconnect();
 fs.mkdirSync('artifacts/qa',{recursive:true});
 fs.writeFileSync('artifacts/qa/refund-bank-csv-qa.json',JSON.stringify({checks,failure},null,2));
 console.log('Refund + simulated CSV reconciliation: '+checks.filter(c=>c.ok).length+'/'+checks.length);
 if(failure||checks.some(c=>!c.ok))process.exitCode=1;
}
