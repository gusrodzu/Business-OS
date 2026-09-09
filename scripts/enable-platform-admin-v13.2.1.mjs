import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();
try {
  const permission = await prisma.permission.upsert({
    where: {key: 'platform.manage'},
    update: {name: 'Administrar globalmente BuzzBee SaaS, empresas, planes, suscripciones y operación de plataforma'},
    create: {key: 'platform.manage', name: 'Administrar globalmente BuzzBee SaaS, empresas, planes, suscripciones y operación de plataforma'},
  });
  const role = await prisma.role.findUnique({where: {name: 'Administrador'}});
  if (!role) throw new Error('No existe el rol Administrador. Ejecuta primero el seed base.');
  await prisma.rolePermission.upsert({
    where: {roleId_permissionId: {roleId: role.id, permissionId: permission.id}},
    update: {},
    create: {roleId: role.id, permissionId: permission.id},
  });
  console.log('PASS  platform.manage habilitado para el rol Administrador.');
} finally {
  await prisma.$disconnect();
}
