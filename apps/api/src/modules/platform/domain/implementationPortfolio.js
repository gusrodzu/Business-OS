import {PROFILES} from '../../industries/catalog.js';

/**
 * Read-only implementation diagnostics for already registered real tenants.
 * This is NOT a persisted onboarding pipeline or an authorization decision.
 */
export function summarizeImplementationCompany(company) {
  const profiles = Array.isArray(company.industryProfiles) ? company.industryProfiles : [];
  const primary = profiles.find(item => item.isPrimary) || profiles[0];
  const catalogProfile = PROFILES.find(item => item.slug === primary?.activityKey);
  const subscription = company.subscriptions?.[0] ?? null;
  const enabledModules = (company.enabledModules || [])
    .filter(item => item.enabled && (!item.expiresAt || new Date(item.expiresAt) > new Date()))
    .map(item => ({key:item.module.key, name:item.module.name}));
  const checks = [
    {id:'industry', label:'Giro principal configurado', ready:Boolean(catalogProfile)},
    {id:'subscription', label:'Plan asociado', ready:Boolean(subscription?.plan)},
    {id:'modules', label:'Módulos habilitados', ready:enabledModules.length > 0},
    {id:'users', label:'Usuarios asignados', ready:(company._count?.users || 0) > 0},
  ];
  return {
    id:company.id,
    name:company.name,
    industry:catalogProfile?.name || company.industry || null,
    primaryActivityKey:catalogProfile?.slug || null,
    industryProfiles:profiles.map(item=>({activityKey:item.activityKey,isPrimary:item.isPrimary})),
    createdAt:company.createdAt,
    active:company.active,
    plan:subscription?.plan?.name || null,
    subscriptionStatus:subscription?.status || null,
    enabledModules,
    recommendedModules:catalogProfile?.required || [],
    userCount:company._count?.users || 0,
    readiness:{completed:checks.filter(c=>c.ready).length,total:checks.length,checks},
    onboardingStage:null, // No persisted lead/configuration/testing lifecycle exists yet.
  };
}
