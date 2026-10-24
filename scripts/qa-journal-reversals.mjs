import fs from 'node:fs';
import {createPrismaClient} from '../apps/api/src/lib/prisma.js';
import {assertEphemeralQaTarget,createQaApiRequester} from './qa-ephemeral-api.mjs';
assertEphemeralQaTarget();
const db=createPrismaClient(),api=createQaApiRequester(process.env.API_URL.replace(/\/$/,''));
const checks=[];
function check(title,ok,detail=''){checks.push({title,ok,detail});console.log((ok?'PASS ':'FAIL ')+title+' '+detail);if(!ok)throw Error(title+' '+detail)}
async function query(route,opts){return api.request(route,opts)}
async function good(title,route,opts){const r=await query(route,opts);check(title,r.ok,'HTTP '+r.status+' '+(r.data?.message||''));return r.data}
let failure;
try{
 await good('Login accounting manager','/auth/login',{method:'POST',body:{
   email:process.env.O2C_EMAIL,password:process.env.O2C_PASSWORD,
 }});
 const year=new Date().getUTCFullYear()+8;
 const date=new Date(Date.UTC(year,5,10,12)),later=new Date(Date.UTC(year+1,5,10,12));
 async function period(yr){
   const data=await good('Open isolated accounting period '+yr,'/accounting/periods',{
     method:'POST',body:{name:'QA Reversals '+yr,startDate:new Date(Date.UTC(yr,0,1)),
       endDate:new Date(Date.UTC(yr,11,31,23,59,59))},
   });
   return data.period.id;
 }
 const periodId=await period(year);
 async function createAccount(code,type,nature){
   const data=await good('Create temporary QA account '+code,'/accounting/accounts',{
     method:'POST',body:{code,name:'Accounting reversal QA '+code,type,nature,allowsPosting:true,active:true},
   });
   return data.account.id;
 }
 const assetId=await createAccount('QA-REV-CASH','ASSET','DEBIT');
 const incomeId=await createAccount('QA-REV-SALES','REVENUE','CREDIT');
 const amt=123.45;
 async function original(concept){
   const result=await good('Create balanced journal','/accounting/entries',{method:'POST',body:{
     periodId,entryDate:date,concept,
     lines:[{accountId:assetId,debit:amt,credit:0},{accountId:incomeId,debit:0,credit:amt}],
   }});
   const entry=result.entry;
   const posted=await good('Post original journal','/accounting/entries/'+entry.id+'/post',
     {method:'PATCH',body:{}});
   check('Original journal is POSTED',posted.entry?.status==='POSTED');
   return entry;
 }
 async function reverse(entry,period,stamp){
   return query('/accounting/entries/'+entry.id+'/reverse',{method:'POST',body:{
     periodId:period,entryDate:stamp,reason:'Corregir movimiento contable registrado por error en QA',
   }});
 }
 const first=await original('QA posted journal for reversal');
 const reversed=await reverse(first,periodId,date);
 check('Posted reversal accepted',reversed.status===201,'HTTP '+reversed.status+' '+(reversed.data?.message||''));
 const mirror=reversed.data?.reversal;
 check('Reversal is posted and traces source',mirror?.status==='POSTED'&&mirror?.sourceType==='REVERSAL'&&mirror?.sourceId===first.id);
 const originalLines=await db.journalLine.findMany({where:{entryId:first.id}});
 const reverseLines=await db.journalLine.findMany({where:{entryId:mirror.id}});
 const sumDebit=arr=>arr.reduce((acc,x)=>acc+Number(x.debit),0);
 const sumCredit=arr=>arr.reduce((acc,x)=>acc+Number(x.credit),0);
 check('Reversal swaps both debit/credit totals',
   Math.abs(sumDebit(originalLines)-sumCredit(reverseLines))<.011&&
   Math.abs(sumCredit(originalLines)-sumDebit(reverseLines))<.011);
 check('Source journal preserved as POSTED',(await db.journalEntry.findUnique({where:{id:first.id}}))?.status==='POSTED');
 const duplicate=await reverse(first,periodId,date);
 check('Duplicate reversal rejected',duplicate.status===409,'HTTP '+duplicate.status);
 const second=await original('QA journal to test closed period reversal');
 const closed=await good('Close QA accounting period','/accounting/periods/'+periodId+'/close',
   {method:'PATCH',body:{}});
 check('Period becomes CLOSED',closed.period?.status==='CLOSED');
 const invalid=await reverse(second,periodId,date);
 check('Reversal rejected inside closed period',invalid.status===409,'HTTP '+invalid.status);
 const nextId=await period(year+1);
 const valid=await reverse(second,nextId,later);
 check('Reversal posted in a new open accounting period',valid.status===201,'HTTP '+valid.status);
 check('Original historical journal is preserved',(await db.journalEntry.findUnique({where:{id:second.id}}))?.status==='POSTED');
 const duplicateLater=await reverse(second,nextId,later);
 check('Repeated reversal cannot create second journal',duplicateLater.status===409,'HTTP '+duplicateLater.status);
 const all=await db.journalEntry.findMany({where:{
   sourceType:'REVERSAL',sourceId:{in:[first.id,second.id]},
 }});
 check('Exactly two traceable reversals across accounting periods',all.length===2);
}catch(e){failure=e.message;console.error('Journal reversal QA:',failure)}
finally{
 await db.$disconnect();
 fs.mkdirSync('artifacts/qa',{recursive:true});
 fs.writeFileSync('artifacts/qa/journal-reversal-qa.json',JSON.stringify({checks,failure},null,2));
 console.log('Journal reversal: '+checks.filter(c=>c.ok).length+'/'+checks.length);
 if(failure||checks.some(c=>!c.ok))process.exitCode=1;
}
