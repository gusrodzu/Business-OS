import jwt from 'jsonwebtoken';
import {prisma} from '../lib/prisma.js';

async function authenticateToken(request, response, {allowPlatform = false, allowTenant = true} = {}) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    response.status(401).json({ok:false,message:'Sesión requerida',requestId:request.id||null});
    return null;
  }

  const token = authorization.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.sub || !payload?.sv) {
      response.status(401).json({ok:false,message:'Token incompleto',requestId:request.id||null});
      return null;
    }

    const kind = payload.kind === 'platform' ? 'platform' : 'erp';
    if (kind === 'platform' && !allowPlatform) {
      response.status(403).json({
        ok:false,
        code:'TENANT_SESSION_REQUIRED',
        message:'La sesión Super Admin no puede operar módulos internos de una empresa',
        requestId:request.id||null,
      });
      return null;
    }
    if (kind === 'erp' && !allowTenant) {
      response.status(403).json({
        ok:false,
        code:'PLATFORM_SESSION_REQUIRED',
        message:'Esta operación requiere una sesión Super Admin',
        requestId:request.id||null,
      });
      return null;
    }

    let user;
    if (kind === 'platform') {
      user = await prisma.user.findFirst({
        where:{id:payload.sub,active:true},
        select:{id:true,companyId:true,active:true,sessionVersion:true},
      });
    } else {
      if (!payload.companyId) {
        response.status(401).json({ok:false,message:'La sesión ERP no tiene empresa asignada',requestId:request.id||null});
        return null;
      }
      user = await prisma.user.findFirst({
        where:{
          id:payload.sub,
          companyId:payload.companyId,
          active:true,
          company:{active:true},
        },
        select:{id:true,companyId:true,active:true,sessionVersion:true},
      });
    }

    if (!user || user.sessionVersion !== payload.sv) {
      response.status(401).json({
        ok:false,
        message:'Sesión inválida, revocada o perteneciente a otra empresa',
        requestId:request.id||null,
      });
      return null;
    }

    request.auth = {...payload, kind};
    return request.auth;
  } catch {
    response.status(401).json({
      ok:false,
      message:'Sesión inválida o expirada',
      requestId:request.id||null,
    });
    return null;
  }
}

// Default for every ERP/tenant route: platform sessions are explicitly forbidden.
export async function requireAuth(request, response, next) {
  const auth = await authenticateToken(request, response, {allowPlatform:false, allowTenant:true});
  if (!auth) return;
  return next();
}

// Used only by endpoints that legitimately support both contexts (/me, /logout)
// or by platform endpoints that add requirePlatformSession immediately after it.
export async function requireAnyAuth(request, response, next) {
  const auth = await authenticateToken(request, response, {allowPlatform:true, allowTenant:true});
  if (!auth) return;
  return next();
}

export function requirePlatformSession(request, response, next) {
  if (request.auth?.kind !== 'platform' || request.auth?.mfa !== true) {
    return response.status(403).json({
      ok:false,
      code:'PLATFORM_SESSION_REQUIRED',
      message:'Esta operación requiere una sesión Super Admin con MFA',
    });
  }
  return next();
}

export function requireRecentReauth(maxAgeSeconds = 600) {
  return function recentReauthMiddleware(request, response, next) {
    const reauthAt = Number(request.auth?.reauthAt || 0);
    const ageSeconds = Math.floor(Date.now() / 1000) - reauthAt;
    if (!reauthAt || ageSeconds > maxAgeSeconds) {
      return response.status(428).json({
        ok:false,
        code:'REAUTH_REQUIRED',
        message:'Confirma tu contraseña y código MFA para continuar',
      });
    }
    return next();
  };
}
