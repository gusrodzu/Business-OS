import bcrypt from 'bcryptjs';
import {Router} from 'express';
import jwt from 'jsonwebtoken';
import {z} from 'zod';
import {prisma} from '../../../lib/prisma.js';
import {requireAuth, requireAnyAuth, requirePlatformSession} from '../../../middleware/auth.js';
import {clearAllSessionCookies, setSessionCookie} from '../../../lib/sessionCookies.js';
import {
  buildOtpAuthUri,
  decryptMfaSecret,
  encryptMfaSecret,
  generateMfaSecret,
  verifyTotp,
} from '../../../lib/mfa.js';

const router = Router();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_IP_LIMIT = 20;
const USER_LOCK_ATTEMPTS = 5;
const USER_LOCK_MS = 15 * 60 * 1000;
const ipAttempts = new Map();
const MAX_TRACKED_IPS = 10_000;

const loginSchema = z.object({
  email: z.string().email('Correo inválido').transform((value) => value.toLowerCase()),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

const mfaSchema = z.object({
  challengeToken: z.string().min(20),
  code: z.string().regex(/^\d{6}$/, 'El código MFA debe tener 6 dígitos'),
});

const reauthSchema = z.object({
  password: z.string().min(8),
  code: z.string().regex(/^\d{6}$/, 'El código MFA debe tener 6 dígitos'),
});

const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es obligatorio').max(80),
  lastName: z.string().trim().min(1, 'El apellido es obligatorio').max(80),
});

const preferencesSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']).default('system'),
  density: z.enum(['comfortable', 'compact']).default('comfortable'),
  reducedMotion: z.boolean().default(false),
  defaultLandingPage: z.enum(['/', '/agenda', '/ventas', '/compras', '/inventario/existencias', '/finanzas/flujo-efectivo', '/pos']).default('/'),
});

function serializeUser(user) {
  const roles = user.roles.map(({role}) => ({
    id: role.id,
    name: role.name,
    permissions: role.permissions.map(({permission}) => permission.key),
  }));

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    company: user.company,
    roles,
    permissions: [...new Set(roles.flatMap((role) => role.permissions))],
    preferences: user.preferences ?? {},
    mfaEnabled: Boolean(user.mfaEnabled),
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

function permissionsFor(user) {
  return [...new Set(user.roles.flatMap(({role}) => role.permissions.map(({permission}) => permission.key)))];
}

function isPlatformAdmin(user) {
  return permissionsFor(user).includes('platform.manage');
}

function createSessionToken(user, {kind = 'erp', mfa = false, reauthAt = null} = {}) {
  const expiresIn = kind === 'platform' ? '45m' : '8h';
  return jwt.sign(
    {
      sub: user.id,
      companyId: user.companyId,
      email: user.email,
      sv: user.sessionVersion,
      kind,
      mfa,
      ...(reauthAt ? {reauthAt} : {}),
    },
    process.env.JWT_SECRET,
    {expiresIn, algorithm: 'HS256'},
  );
}

function createMfaChallenge(user, purpose = 'platform_mfa') {
  return jwt.sign(
    {sub: user.id, companyId: user.companyId, email: user.email, purpose, sv: user.sessionVersion},
    process.env.JWT_SECRET,
    {expiresIn: '5m', algorithm: 'HS256'},
  );
}

async function loadUserByEmail(email) {
  return prisma.user.findUnique({
    where: {email},
    include: {
      company: true,
      roles: {include: {role: {include: {permissions: {include: {permission: true}}}}}},
    },
  });
}

async function loadUserById(id) {
  return prisma.user.findUnique({
    where: {id},
    include: {
      company: true,
      roles: {include: {role: {include: {permissions: {include: {permission: true}}}}}},
    },
  });
}

function checkIpRateLimit(ip) {
  const key = ip || 'unknown';
  const now = Date.now();
  // Bound memory under a high-cardinality IP flood; the old size check
  // removed expired entries only and could grow without limit.
  if (!ipAttempts.has(key) && ipAttempts.size >= MAX_TRACKED_IPS) {
    for (const [candidate, value] of ipAttempts) {
      if (now - value.startedAt > LOGIN_WINDOW_MS) ipAttempts.delete(candidate);
    }
    while (ipAttempts.size >= MAX_TRACKED_IPS) {
      ipAttempts.delete(ipAttempts.keys().next().value);
    }
  }
  const entry = ipAttempts.get(key);
  if (!entry || now - entry.startedAt > LOGIN_WINDOW_MS) {
    ipAttempts.set(key, {count: 1, startedAt: now});
    return true;
  }
  entry.count += 1;
  return entry.count <= LOGIN_IP_LIMIT;
}

function clearIpAttempts(ip) {
  ipAttempts.delete(ip || 'unknown');
}

async function recordFailedLogin(user, request, reason = 'Credenciales inválidas') {
  if (!user) return;
  const nextAttempts = (user.failedLoginAttempts || 0) + 1;
  const shouldLock = nextAttempts >= USER_LOCK_ATTEMPTS;
  await prisma.user.update({
    where: {id: user.id},
    data: {
      failedLoginAttempts: shouldLock ? 0 : nextAttempts,
      lockedUntil: shouldLock ? new Date(Date.now() + USER_LOCK_MS) : user.lockedUntil,
    },
  });
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'LOGIN_FAILED',
      entity: 'User',
      entityId: user.id,
      description: reason,
      ipAddress: request.ip,
      metadata: {locked: shouldLock},
    },
  });
}

async function resetLoginFailures(userId) {
  await prisma.user.update({
    where: {id: userId},
    data: {failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date()},
  });
}

function verifyChallenge(token, purpose = 'platform_mfa') {
  const payload = jwt.verify(token, process.env.JWT_SECRET, {algorithms:['HS256']});
  if (payload?.purpose !== purpose || !payload?.sub || !payload?.sv) throw new Error('Challenge MFA inválido');
  return payload;
}

async function issuePlatformSession(user, request, response, action) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const token = createSessionToken(user, {kind: 'platform', mfa: true, reauthAt: nowSeconds});
  await resetLoginFailures(user.id);
  clearIpAttempts(request.ip);
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action,
      entity: 'PlatformSession',
      entityId: user.id,
      description: 'Acceso Super Admin validado con MFA',
      ipAddress: request.ip,
      metadata: {mfa: true, sessionMinutes: 45},
    },
  });
  setSessionCookie(response, 'platform', token, {maxAgeSeconds: 45 * 60});
  return {ok: true, authenticated: true, user: serializeUser(user), sessionKind: 'platform', expiresInMinutes: 45};
}

router.post('/login', async (request, response, next) => {
  try {
    if (!checkIpRateLimit(request.ip)) {
      return response.status(429).json({ok: false, code: 'LOGIN_RATE_LIMIT', message: 'Demasiados intentos. Intenta de nuevo más tarde.'});
    }

    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({ok: false, message: parsed.error.issues[0]?.message ?? 'Datos inválidos'});
    }

    const user = await loadUserByEmail(parsed.data.email);
    const passwordOk = Boolean(user && user.active && await bcrypt.compare(parsed.data.password, user.passwordHash));
    if (!passwordOk) {
      await recordFailedLogin(user, request);
      return response.status(401).json({ok: false, message: 'Correo o contraseña incorrectos'});
    }

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return response.status(423).json({ok: false, code: 'ACCOUNT_LOCKED', message: 'Cuenta bloqueada temporalmente por intentos fallidos'});
    }

    // El backend decide el contexto de sesión. El cliente no puede escoger entre ERP y plataforma.
    const platform = isPlatformAdmin(user);
    if (platform) {
      let encryptedSecret = user.mfaSecretEncrypted;
      let secret;
      if (!encryptedSecret) {
        secret = generateMfaSecret();
        encryptedSecret = encryptMfaSecret(secret);
        await prisma.user.update({where: {id: user.id}, data: {mfaSecretEncrypted: encryptedSecret}});
      } else if (!user.mfaEnabled) {
        secret = decryptMfaSecret(encryptedSecret);
      }

      const challengeToken = createMfaChallenge(user);
      if (!user.mfaEnabled) {
        return response.json({
          ok: true,
          mfaSetupRequired: true,
          challengeToken,
          secret,
          otpauthUri: buildOtpAuthUri({secret, email: user.email}),
          message: 'Configura MFA antes de acceder al Panel SaaS',
        });
      }

      return response.json({ok: true, mfaRequired: true, challengeToken, message: 'Ingresa tu código MFA'});
    }

    const tenantCompanyOk = Boolean(user.companyId && user.company?.active);
    if (!tenantCompanyOk) {
      await recordFailedLogin(user, request, 'Cuenta ERP sin empresa activa');
      return response.status(403).json({
        ok: false,
        code: 'TENANT_REQUIRED',
        message: 'La cuenta no tiene una empresa activa asignada.',
      });
    }

    await resetLoginFailures(user.id);
    clearIpAttempts(request.ip);
    const token = createSessionToken(user, {kind: 'erp'});
    await prisma.auditLog.create({
      data: {userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id, description: 'Inicio de sesión exitoso', ipAddress: request.ip},
    });
    setSessionCookie(response, 'erp', token, {maxAgeSeconds: 8 * 60 * 60});
    return response.json({ok: true, authenticated: true, user: serializeUser(user), sessionKind: 'erp', expiresInHours: 8});
  } catch (error) {
    return next(error);
  }
});

router.post('/mfa/confirm', async (request, response, next) => {
  try {
    if (!checkIpRateLimit(request.ip)) {
      return response.status(429).json({ok:false,code:'AUTH_RATE_LIMIT',message:'Demasiados intentos de autenticación. Intenta nuevamente más tarde.'});
    }
    const parsed = mfaSchema.safeParse(request.body);
    if (!parsed.success) return response.status(400).json({ok:false,message:parsed.error.issues[0]?.message || 'Datos MFA inválidos'});
    const challenge = verifyChallenge(parsed.data.challengeToken);
    const user = await loadUserById(challenge.sub);
    if (!user || !user.active || user.sessionVersion !== challenge.sv || !isPlatformAdmin(user) || !user.mfaSecretEncrypted) {
      return response.status(401).json({ok:false,message:'Challenge MFA inválido o expirado'});
    }
    const secret = decryptMfaSecret(user.mfaSecretEncrypted);
    if (!verifyTotp(secret, parsed.data.code)) {
      return response.status(401).json({ok:false,message:'Código MFA incorrecto'});
    }
    await prisma.user.update({where:{id:user.id},data:{mfaEnabled:true,mfaEnrolledAt:new Date()}});
    user.mfaEnabled = true;
    return response.json(await issuePlatformSession(user, request, response, 'MFA_ENROLLED'));
  } catch (error) { return next(error); }
});

router.post('/mfa/verify', async (request, response, next) => {
  try {
    if (!checkIpRateLimit(request.ip)) {
      return response.status(429).json({ok:false,code:'AUTH_RATE_LIMIT',message:'Demasiados intentos de autenticación. Intenta nuevamente más tarde.'});
    }
    const parsed = mfaSchema.safeParse(request.body);
    if (!parsed.success) return response.status(400).json({ok:false,message:parsed.error.issues[0]?.message || 'Datos MFA inválidos'});
    const challenge = verifyChallenge(parsed.data.challengeToken);
    const user = await loadUserById(challenge.sub);
    if (!user || !user.active || user.sessionVersion !== challenge.sv || !user.mfaEnabled || !isPlatformAdmin(user) || !user.mfaSecretEncrypted) {
      return response.status(401).json({ok:false,message:'Challenge MFA inválido o expirado'});
    }
    const secret = decryptMfaSecret(user.mfaSecretEncrypted);
    if (!verifyTotp(secret, parsed.data.code)) {
      await prisma.auditLog.create({data:{userId:user.id,action:'MFA_FAILED',entity:'PlatformSession',entityId:user.id,description:'Código MFA incorrecto',ipAddress:request.ip}});
      return response.status(401).json({ok:false,message:'Código MFA incorrecto'});
    }
    return response.json(await issuePlatformSession(user, request, response, 'PLATFORM_LOGIN'));
  } catch (error) { return next(error); }
});

router.post('/reauth', requireAnyAuth, requirePlatformSession, async (request, response, next) => {
  try {
    if (!checkIpRateLimit(request.ip)) {
      return response.status(429).json({ok:false,code:'AUTH_RATE_LIMIT',message:'Demasiados intentos de autenticación. Intenta nuevamente más tarde.'});
    }
    const parsed = reauthSchema.safeParse(request.body);
    if (!parsed.success) return response.status(400).json({ok:false,message:parsed.error.issues[0]?.message || 'Datos inválidos'});
    const user = await loadUserById(request.auth.sub);
    if (!user || !user.active || !user.mfaEnabled || !user.mfaSecretEncrypted || !isPlatformAdmin(user)) {
      return response.status(403).json({ok:false,message:'Reautenticación no disponible'});
    }
    const passwordOk = await bcrypt.compare(parsed.data.password, user.passwordHash);
    const secret = decryptMfaSecret(user.mfaSecretEncrypted);
    if (!passwordOk || !verifyTotp(secret, parsed.data.code)) {
      await prisma.auditLog.create({data:{userId:user.id,action:'REAUTH_FAILED',entity:'PlatformSession',entityId:user.id,description:'Reautenticación crítica fallida',ipAddress:request.ip}});
      return response.status(401).json({ok:false,message:'Contraseña o código MFA incorrectos'});
    }
    const token = createSessionToken(user, {kind:'platform',mfa:true,reauthAt:Math.floor(Date.now()/1000)});
    await prisma.auditLog.create({data:{userId:user.id,action:'REAUTH_SUCCESS',entity:'PlatformSession',entityId:user.id,description:'Reautenticación para acción crítica',ipAddress:request.ip}});
    setSessionCookie(response, 'platform', token, {maxAgeSeconds: 45 * 60});
    return response.json({ok:true,authenticated:true,sessionKind:'platform',expiresInMinutes:45});
  } catch (error) { return next(error); }
});

router.patch('/profile', requireAnyAuth, async (request, response, next) => {
  try {
    const parsed = profileSchema.safeParse(request.body);
    if (!parsed.success) return response.status(400).json({ok:false,message:parsed.error.issues[0]?.message || 'Datos inválidos'});
    await prisma.user.update({where:{id:request.auth.sub},data:parsed.data});
    await prisma.auditLog.create({data:{userId:request.auth.sub,action:'PROFILE_UPDATE',entity:'User',entityId:request.auth.sub,description:'Actualizó su perfil personal',ipAddress:request.ip}});
    const user = await loadUserById(request.auth.sub);
    if (!user || !user.active) return response.status(401).json({ok:false,message:'Usuario no disponible'});
    return response.json({ok:true,user:serializeUser(user)});
  } catch (error) { return next(error); }
});

router.patch('/preferences', requireAnyAuth, async (request, response, next) => {
  try {
    const parsed = preferencesSchema.safeParse(request.body);
    if (!parsed.success) return response.status(400).json({ok:false,message:parsed.error.issues[0]?.message || 'Preferencias inválidas'});
    await prisma.user.update({where:{id:request.auth.sub},data:{preferences:parsed.data}});
    await prisma.auditLog.create({data:{userId:request.auth.sub,action:'PREFERENCES_UPDATE',entity:'User',entityId:request.auth.sub,description:'Actualizó sus preferencias personales',ipAddress:request.ip}});
    const user = await loadUserById(request.auth.sub);
    if (!user || !user.active) return response.status(401).json({ok:false,message:'Usuario no disponible'});
    return response.json({ok:true,preferences:parsed.data,user:serializeUser(user)});
  } catch (error) { return next(error); }
});

router.get('/me', requireAnyAuth, async (request, response, next) => {
  try {
    const user = await loadUserById(request.auth.sub);
    if (!user || !user.active) return response.status(401).json({ok:false,message:'Usuario no disponible'});
    return response.json({ok:true,authenticated:true,user:serializeUser(user),sessionKind:request.auth.kind || 'erp',demoLive:Boolean(request.auth.demoLive)});
  } catch (error) { return next(error); }
});

router.post('/logout', requireAnyAuth, async (request, response, next) => {
  try {
    await prisma.$transaction([
      prisma.auditLog.create({data:{userId:request.auth.sub,action:'LOGOUT',entity:'User',entityId:request.auth.sub,description:'Cierre de sesión y revocación de tokens',ipAddress:request.ip}}),
      prisma.user.update({where:{id:request.auth.sub},data:{sessionVersion:{increment:1}}}),
    ]);
    clearAllSessionCookies(response);
    return response.json({ok:true});
  } catch (error) { return next(error); }
});

export default router;
