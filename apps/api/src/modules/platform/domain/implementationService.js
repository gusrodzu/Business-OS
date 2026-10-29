import {implementationTransitionReview} from './implementationLifecycle.js';

export class ImplementationOperationError extends Error{
  constructor(status,code,message){super(message);this.status=status;this.code=code;}
}
const fail=(status,code,message)=>{throw new ImplementationOperationError(status,code,message)};
const clean=(record)=>({
  id:record.id,name:record.name,kind:record.kind,stage:record.stage,
  companyId:record.companyId,industryKey:record.industryKey,scianCode:record.scianCode,
  contactEmail:record.contactEmail,planKey:record.planKey,
  requestedModuleKeys:record.requestedModuleKeys||[],ownerUserId:record.ownerUserId,
  targetDate:record.targetDate,activatedAt:record.activatedAt,
  notes:record.notes,createdAt:record.createdAt,updatedAt:record.updatedAt,
});

export async function createPlatformProspect(db,{requestKey,name,contactEmail,industryKey=null,scianCode=null,notes=null,requestedModuleKeys=[]},actor,{ipAddress=null}={}){
  if(!actor)fail(403,'PLATFORM_ACTOR_REQUIRED','Se requiere un actor de plataforma');
  const data={requestKey,name,contactEmail,industryKey,scianCode,notes,requestedModuleKeys,kind:'PROSPECT',stage:'LEAD'};
  try{
    const record=await db.$transaction(async(tx)=>{
      const created=await tx.platformImplementation.create({data});
      await tx.platformImplementationEvent.create({data:{
        implementationId:created.id,actorUserId:actor,fromStage:null,toStage:'LEAD',
        reason:'Prospecto registrado por Super Admin',
      }});
      await tx.auditLog.create({data:{
        userId:actor,action:'IMPLEMENTATION_LEAD_CREATED',entity:'PlatformImplementation',
        entityId:created.id,description:'Registro de prospecto de implementación',
        ipAddress,metadata:{kind:'PROSPECT',stage:'LEAD'},
      }});
      return created;
    });
    return {record:clean(record),created:true};
  }catch(error){
    if(error?.code!=='P2002')throw error;
    const existing=await db.platformImplementation.findUnique({where:{requestKey}});
    if(existing && existing.kind==='PROSPECT' && existing.name===name && existing.contactEmail===contactEmail
      && existing.industryKey===industryKey && existing.scianCode===scianCode
      && existing.notes===notes
      && JSON.stringify(existing.requestedModuleKeys||[])===JSON.stringify(requestedModuleKeys)){
      return {record:clean(existing),created:false};
    }
    fail(409,'IDEMPOTENCY_CONFLICT','La clave de solicitud ya se utilizó para otra operación');
  }
}

export async function transitionPlatformImplementation(db,{id,toStage,reason},actor,{ipAddress=null}={}){
  if(!actor)fail(403,'PLATFORM_ACTOR_REQUIRED','Se requiere un actor de plataforma');
  // Activation/testing require independent evidence checks, so neither can be
  // initiated by this API, regardless of a client-supplied flag.
  if(!['CONFIGURATION','PAUSED','CANCELLED'].includes(toStage)){
    fail(409,'IMPLEMENTATION_TRANSITION_LOCKED','Esta transición requiere otro flujo de validación');
  }
  return db.$transaction(async(tx)=>{
    const current=await tx.platformImplementation.findUnique({where:{id}});
    if(!current)fail(404,'IMPLEMENTATION_NOT_FOUND','Registro de implementación no encontrado');
    const review=implementationTransitionReview(current,toStage);
    if(!review.allowed)fail(409,'IMPLEMENTATION_TRANSITION_INVALID',review.reasons.join('; '));
    const changed=await tx.platformImplementation.updateMany({
      where:{id,stage:current.stage},data:{stage:toStage},
    });
    if(changed.count!==1)fail(409,'IMPLEMENTATION_CONCURRENT_UPDATE','La etapa cambió durante la operación. Actualiza e intenta de nuevo.');
    await tx.platformImplementationEvent.create({data:{
      implementationId:id,actorUserId:actor,fromStage:current.stage,toStage,reason,
    }});
    await tx.auditLog.create({data:{
      userId:actor,action:'IMPLEMENTATION_STAGE_CHANGED',entity:'PlatformImplementation',
      entityId:id,description:'Cambio de etapa de implementación',
      ipAddress,metadata:{fromStage:current.stage,toStage},
    }});
    const updated=await tx.platformImplementation.findUnique({where:{id}});
    return clean(updated);
  });
}
