import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import {createPrismaClient} from '../apps/api/src/lib/prisma.js';
import {assertEphemeralQaTarget,createQaApiRequester} from './qa-ephemeral-api.mjs';
assertEphemeralQaTarget();
const db=createPrismaClient(), api=createQaApiRequester(process.env.API_URL.replace(/\/$/,''));
let failed=null;
const results=[];
function expect(title,passed,detail=''){results.push({title,passed,detail});console.log((passed?'PASS ':'FAIL ')+title+' '+detail);if(!passed)throw Error(title+' '+detail)}
try {
 const tenant=await db.company.findUnique({where:{taxId:'MRA160812MN1'}});
 const permissionKeys=['sales.read','reconciliation.read'];
 const perms=await db.permission.findMany({where:{key:{in:permissionKeys}}});
 expect('Read-only permissions exist',perms.length===2);
 const suffix=Date.now().toString();
 const role=await db.role.create({data:{name:'QA Auditor '+suffix,
   permissions:{create:perms.map(p=>({permissionId:p.id}))}}});
 const address='qa-audit-'+suffix+'@example.invalid';
 const password=process.env.O2C_PASSWORD;
 expect('Disposable test account password configured',Boolean(password));
 await db.user.create({data:{companyId:tenant.id,firstName:'QA',lastName:'Reader',
   email:address,passwordHash:await bcrypt.hash(password,12),
   roles:{create:[{roleId:role.id}]}}});
 const signed=await api.request('/auth/login',{method:'POST',
   body:{email:address,password}});
 expect('Read-only login sets session cookie',signed.ok&&api.hasSession,'HTTP '+signed.status);
 for(const url of ['/sales','/bank-reconciliation']){
   const r=await api.request(url);expect('Read permission '+url,r.status===200,'HTTP '+r.status);
 }
 for(const [method,url] of [['POST','/sales/orders'],['POST','/sales-returns/returns'],
   ['POST','/bank-reconciliation/statements'],['GET','/admin/users'],
   ['GET','/collections'],['GET','/pos/dashboard']]){
   const r=await api.request(url,{method,body:{}});
   expect('No privilege '+method+' '+url,r.status===403,'HTTP '+r.status+' '+(r.error||r.data?.message||''));
 }
}catch(e){failed=e.message;console.error('RBAC QA:',failed)}
finally{
 await db.$disconnect();
 fs.mkdirSync('artifacts/qa',{recursive:true});
 fs.writeFileSync('artifacts/qa/rbac-checks.json',JSON.stringify({results,failed},null,2));
 if(failed||results.some(x=>!x.passed))process.exitCode=1;
}
