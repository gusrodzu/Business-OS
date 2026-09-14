import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const checks=[];
const add=(name,ok)=>checks.push({name,ok:Boolean(ok)});

const schema=read('apps/api/prisma/schema.prisma');
const auth=read('apps/api/src/middleware/auth.js');
const authRoute=read('apps/api/src/modules/core/api/auth.js');
const admin=read('apps/api/src/modules/core/api/admin.js');
const platform=read('apps/api/src/modules/platform/api/platformAdmin.js');
const enable=read('scripts/enable-platform-admin-v13.3.0.mjs');
const fixer=read('scripts/fix-tenant-isolation-v15.0.3.mjs');

add('Platform users may be company-less',/companyId\s+String\?/.test(schema));
add('User company relation is optional',/company\s+Company\?/.test(schema));
add('Tenant auth forbids platform sessions',auth.includes('TENANT_SESSION_REQUIRED')&&auth.includes('allowPlatform:false'));
add('Any-context auth exists for platform-safe endpoints',auth.includes('export async function requireAnyAuth'));
add('Platform API uses dedicated platform auth + MFA session',platform.includes('requirePlatformAuth')&&platform.includes('requirePlatformSession'));
add('ERP login requires active tenant company',authRoute.includes('tenantCompanyOk')&&authRoute.includes('TENANT_REQUIRED')); 
add('Super Admin enable detaches company',enable.includes('companyId: null'));
add('Super Admin enable removes ERP roles',enable.includes('userRole.deleteMany'));
add('Tenant user list excludes platform accounts',admin.includes("key: 'platform.manage'")&&admin.includes('roles: {none:'));
add('Tenant permission catalog excludes platform.manage',admin.includes("key:{not:'platform.manage'}"));
add('Tenant cannot assign platform permission',admin.includes('El permiso de plataforma no puede asignarse desde una empresa'));
add('Tenant user updates validate tenant roles',admin.includes('Uno o más roles no pertenecen a esta empresa'));
add('Migration fixer detaches existing platform users',fixer.includes('companyId:null')&&fixer.includes('sessionVersion:{increment:1}'));

let fail=0;
for(const c of checks){console.log(`${c.ok?'PASS':'FAIL'}  ${c.name}`);if(!c.ok)fail++;}
console.log(`\nTenant Isolation v15.0.3: ${checks.length-fail}/${checks.length} PASS`);
process.exit(fail?1:0);
