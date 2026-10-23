import {createPrismaClient} from '../apps/api/src/lib/prisma.js';
const prisma = createPrismaClient();

const email = String(process.argv[2] || process.env.PLATFORM_ADMIN_EMAIL || '').trim().toLowerCase();
if (!email) {
  console.error('Uso: npm run platform-admin:enable -- correo@buzzbee.com');
  process.exit(1);
}

try {
  const user = await prisma.user.findUnique({where: {email}});
  if (!user) throw new Error(`No existe el usuario ${email}. Créalo primero como cuenta independiente.`);

  const permission = await prisma.permission.upsert({
    where: {key: 'platform.manage'},
    update: {name: 'Administrar globalmente BuzzBee SaaS'},
    create: {key: 'platform.manage', name: 'Administrar globalmente BuzzBee SaaS'},
  });

  const superRole = await prisma.role.upsert({
    where: {name: 'Super Admin SaaS'},
    update: {description: 'Administración global de BuzzBee. Requiere MFA y sesión endurecida.'},
    create: {name: 'Super Admin SaaS', description: 'Administración global de BuzzBee. Requiere MFA y sesión endurecida.'},
  });

  await prisma.rolePermission.upsert({
    where: {roleId_permissionId: {roleId: superRole.id, permissionId: permission.id}},
    update: {},
    create: {roleId: superRole.id, permissionId: permission.id},
  });

  const legacyGrants = await prisma.rolePermission.findMany({
    where: {permissionId: permission.id, roleId: {not: superRole.id}},
    select: {roleId: true, permissionId: true},
  });
  for (const grant of legacyGrants) {
    await prisma.rolePermission.delete({where: {roleId_permissionId: grant}});
  }

  // A platform administrator is not a tenant user. Remove ERP roles and detach
  // the account from any customer company before granting the platform role.
  await prisma.userRole.deleteMany({
    where: {userId: user.id, roleId: {not: superRole.id}},
  });
  await prisma.userRole.upsert({
    where: {userId_roleId: {userId: user.id, roleId: superRole.id}},
    update: {},
    create: {userId: user.id, roleId: superRole.id},
  });

  await prisma.user.update({
    where: {id: user.id},
    data: {
      companyId: null,
      sessionVersion: {increment: 1},
      mfaEnabled: false,
      mfaSecretEncrypted: null,
      mfaEnrolledAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  console.log(`PASS  ${email} asignado como Super Admin SaaS.`);
  console.log('PASS  platform.manage removido de roles ERP ordinarios.');
  console.log('PASS  cuenta Super Admin desacoplada de cualquier empresa/tenant.');
  console.log('INFO  MFA se configurará en el primer acceso a /login.');
} finally {
  await prisma.$disconnect();
}
