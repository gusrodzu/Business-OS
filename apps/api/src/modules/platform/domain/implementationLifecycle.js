/**
 * Phase-2 implementation lifecycle. This pure contract does not persist anything.
 * Only authenticated, re-authorized platform endpoints may call a future writer,
 * using evidence fetched server-side (never client-supplied flags), within a
 * transaction that appends a PlatformImplementationEvent audit record.
 */
export const IMPLEMENTATION_KINDS=Object.freeze(['PROSPECT','REGISTERED_TENANT']);
export const IMPLEMENTATION_STAGES=Object.freeze(['LEAD','CONFIGURATION','TESTING','ACTIVE','PAUSED','CANCELLED']);
export const IMPLEMENTATION_TRANSITIONS=Object.freeze({
  LEAD:Object.freeze(['CONFIGURATION','CANCELLED']),
  CONFIGURATION:Object.freeze(['TESTING','PAUSED','CANCELLED']),
  TESTING:Object.freeze(['CONFIGURATION','ACTIVE','PAUSED','CANCELLED']),
  ACTIVE:Object.freeze(['PAUSED']),
  PAUSED:Object.freeze(['CONFIGURATION','TESTING','CANCELLED']),
  CANCELLED:Object.freeze([]),
});

export function validateImplementationLink(record){
  if(!record || !IMPLEMENTATION_KINDS.includes(record.kind))return false;
  const linked=typeof record.companyId==='string' && record.companyId.trim().length>0;
  return record.kind==='REGISTERED_TENANT'?linked:!linked;
}

/**
 * Transition safety prerequisites. This is NOT a permission check: the server
 * must still authenticate platform.manage + MFA + recent reauth, verify tenant,
 * plan, UAT and evidence itself, and write stage/event atomically.
 */
export function implementationTransitionReview(record,toStage){
  if(!record || !IMPLEMENTATION_STAGES.includes(record.stage) || !IMPLEMENTATION_STAGES.includes(toStage)){
    return {allowed:false,reasons:['Etapa no reconocida']};
  }
  const reasons=[];
  if(!IMPLEMENTATION_TRANSITIONS[record.stage].includes(toStage)){
    reasons.push('Transición no permitida');
  }
  if(toStage==='CONFIGURATION' && (!record.name?.trim() || !record.contactEmail?.trim())){
    reasons.push('Se requiere nombre y contacto autorizado');
  }
  if(['TESTING','ACTIVE'].includes(toStage) && !validateImplementationLink(record)){
    reasons.push('La prueba/activación requiere un tenant registrado y vinculado');
  }
  if(toStage==='ACTIVE'){
    reasons.push('La activación requiere pruebas intertenant, UAT, licencias y autorización verificadas por el backend');
  }
  return {allowed:reasons.length===0,reasons};
}
