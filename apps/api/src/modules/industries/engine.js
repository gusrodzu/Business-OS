import {PROFILES} from './catalog.js';
const unique=items=>[...new Set(items)];
const MODULE_ALIASES={
 sales:['ventas'],crm:['crm'],hr:['rrhh'],procurement:['compras'],
 finance:['finanzas'],projects:['proyectos'],inventory:['inventario'],
 production:['produccion'],pos:['pos'],operations:['operaciones'],
 agenda:['agenda'],reports:['reportes']
};

export function recommendBusinessModules(activities,availableModules=[]){
  if(!Array.isArray(activities)||activities.length===0) throw new Error('Selecciona al menos una actividad');
  const selected=unique(activities).map(slug=>PROFILES.find(profile=>profile.slug===slug));
  if(selected.some(profile=>!profile)) throw new Error('Actividad no reconocida');
  const required=unique(selected.flatMap(profile=>profile.required));
  const optional=unique(selected.flatMap(profile=>profile.optional??[]));
  const capabilities=unique(selected.flatMap(profile=>profile.capabilities??[]));
  const known=new Set(availableModules.map(module=>module.key));
  const resolve=key=>[key,...(MODULE_ALIASES[key]??[])].find(alias=>known.has(alias));
  const suggested=unique([...required,...optional]);
  return {activities:unique(activities),required,optional,capabilities,
    suggestedModules:unique(suggested.map(resolve).filter(Boolean)),
    unavailableModules:suggested.filter(key=>!resolve(key)),
    state:'RECOMMENDATION_ONLY',activationRequiresApproval:true};
}
