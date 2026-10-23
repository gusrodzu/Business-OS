import {createPrismaClient} from '../apps/api/src/lib/prisma.js';

const prisma = createPrismaClient();

try {
  const platformPermission = await prisma.permission.findUnique({where:{key:'platform.manage'}});
  if (!platformPermission) {
    console.log('INFO  No existe platform.manage; no hay cuentas de plataforma que migrar.');
    process.exit(0);
  }

  const platformRoles = await prisma.role.findMany({
    where:{permissions:{some:{permissionId:platformPermission.id}}},
    select:{id:true,name:true},
  });
  const platformRoleIds = platformRoles.map((role)=>role.id);
  if (!platformRoleIds.length) {
    console.log('INFO  No existen roles de plataforma; no hay cuentas que migrar.');
    process.exit(0);
  }

  const platformUsers = await prisma.user.findMany({
    where:{roles:{some:{roleId:{in:platformRoleIds}}}},
    select:{id:true,email:true,companyId:true},
  });

  for (const user of platformUsers) {
    await prisma.$transaction(async (tx)=>{
      await tx.userRole.deleteMany({
        where:{userId:user.id,roleId:{notIn:platformRoleIds}},
      });
      await tx.user.update({
        where:{id:user.id},
        data:{companyId:null,sessionVersion:{increment:1}},
      });
    });
    console.log(`PASS  ${user.email}: desacoplado del tenant ${user.companyId ?? '(ninguno)'}`);
  }

  console.log(`PASS  ${platformUsers.length} cuenta(s) Super Admin aisladas de empresas cliente.`);
  console.log('INFO  Todas las sesiones previas fueron revocadas; vuelve a iniciar sesión.');
} finally {
  await prisma.$disconnect();
}
