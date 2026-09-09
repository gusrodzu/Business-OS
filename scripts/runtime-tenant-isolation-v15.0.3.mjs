import fs from 'node:fs';
import path from 'node:path';
import jwt from 'jsonwebtoken';
import {PrismaClient} from '@prisma/client';

const prisma=new PrismaClient();
const base=(process.env.API_URL||'http://localhost:4000/api').replace(/\/$/,'');
const email=process.env.CORE_QA_EMAIL||'admin@erp.local';
const password=process.env.CORE_QA_PASSWORD||'Admin123!';
const report={version:'15.0.3',startedAt:new Date().toISOString(),mode:'TENANT_ISOLATION',checks:[]};
const rec=(name,ok,detail='')=>{report.checks.push({name,ok,detail});console.log(`${ok?'PASS':'FAIL'}  ${name}${detail?` · ${detail}`:''}`);return ok};
async function request(route,{method='GET',token,body}={}){try{const response=await fetch(`${base}${route}`,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body===undefined?undefined:JSON.stringify(body)});let data=null;try{data=await response.json()}catch{}return{ok:response.ok,status:response.status,data}}catch(error){return{ok:false,status:null,error:error.message}}}

console.log('\nBuzzBee Tenant Isolation Runtime QA — v15.0.3');
console.log('============================================');
try{
  if(!process.env.JWT_SECRET) throw new Error('JWT_SECRET requerido para validar separación de sesión platform/tenant.');
  const login=await request('/auth/login',{method:'POST',body:{email,password,context:'erp'}});
  rec('Tenant login',login.ok,login.ok?'OK':login.data?.message||login.error||`HTTP ${login.status}`);
  if(!login.ok||!login.data?.token) throw new Error('No se pudo iniciar sesión ERP de QA.');
  const tenantToken=login.data.token;

  const platformUser=await prisma.user.findFirst({
    where:{roles:{some:{role:{permissions:{some:{permission:{key:'platform.manage'}}}}}}},
    include:{roles:{include:{role:{include:{permissions:{include:{permission:true}}}}}}},
  });
  if(!platformUser) throw new Error('No existe una cuenta Super Admin para validar aislamiento.');
  rec('Super Admin no pertenece a tenant',platformUser.companyId===null,platformUser.companyId??'companyId=null');

  const users=await request('/admin/users',{token:tenantToken});
  rec('Tenant admin puede listar sus usuarios',users.ok,`HTTP ${users.status}`);
  const visible=(users.data?.users||[]).some((u)=>u.id===platformUser.id||u.email===platformUser.email);
  rec('Super Admin invisible para tenant admin',!visible,visible?'VISIBLE':'oculto');

  const roles=await request('/admin/roles',{token:tenantToken});
  rec('Tenant admin puede listar roles',roles.ok,`HTTP ${roles.status}`);
  const platformPermissionVisible=(roles.data?.permissions||[]).some((p)=>p.key==='platform.manage');
  const platformRoleVisible=(roles.data?.roles||[]).some((r)=>r.name==='Super Admin SaaS'||(r.permissions||[]).some((p)=>p.key==='platform.manage'));
  rec('platform.manage no aparece en permisos tenant',!platformPermissionVisible);
  rec('Rol Super Admin no aparece en roles tenant',!platformRoleVisible);

  const mutate=await request(`/admin/users/${platformUser.id}/status`,{method:'PATCH',token:tenantToken,body:{active:false}});
  rec('Tenant no puede gestionar Super Admin',mutate.status===404||mutate.status===403,`HTTP ${mutate.status}`);

  const globalWithTenant=await request('/platform-admin/dashboard',{token:tenantToken});
  rec('Sesión tenant rechazada por Control Plane',globalWithTenant.status===403,`HTTP ${globalWithTenant.status}`);

  const platformToken=jwt.sign({sub:platformUser.id,companyId:null,email:platformUser.email,sv:platformUser.sessionVersion,kind:'platform',mfa:true,reauthAt:Math.floor(Date.now()/1000)},process.env.JWT_SECRET,{expiresIn:'5m'});
  const tenantWithPlatform=await request('/admin/users',{token:platformToken});
  rec('Sesión platform rechazada por API tenant',tenantWithPlatform.status===403&&tenantWithPlatform.data?.code==='TENANT_SESSION_REQUIRED',`HTTP ${tenantWithPlatform.status}`);

  const tenantCompany=login.data?.user?.company?.id;
  rec('Sesión ERP contiene empresa',Boolean(tenantCompany),tenantCompany||'sin empresa');
  if(tenantCompany){
    const foreignLeak=(users.data?.users||[]).some((u)=>u.companyId&&u.companyId!==tenantCompany);
    rec('Listado de usuarios no contiene otra empresa',!foreignLeak);
  }
}catch(error){report.runtimeError=error.message;console.error(`ERROR QA: ${error.message}`)}finally{
  await prisma.$disconnect();
  report.finishedAt=new Date().toISOString();
  report.passed=report.checks.filter(x=>x.ok).length;
  report.failed=report.checks.filter(x=>!x.ok).length;
  const dir=path.resolve('artifacts','qa');fs.mkdirSync(dir,{recursive:true});
  const file=path.join(dir,`tenant-isolation-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);fs.writeFileSync(file,JSON.stringify(report,null,2));
  console.log(`Reporte JSON: ${file}`);
}
if(report.runtimeError||report.checks.some(x=>!x.ok))process.exit(1);
