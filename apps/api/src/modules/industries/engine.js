import {PROFILES} from './catalog.js';
const unique=items=>[...new Set(items)];
export function recommendBusinessModules(activities,availableModules=[]){
  if(!Array.isArray(activities)||activities.length===0) throw new Error('Selecciona al menos una actividad');
  const selected=unique(activities).map(slug=>PROFILES.find(profile=>profile.slug===slug));
  if(selected.some(profile=>!profile)) throw new Error('Actividad no reconocida');
  const required=unique(selected.flatMap(profile=>profile.required));
  const optional=unique(selected.flatMap(profile=>profile.optional??[]));
  const capabilities=unique(selected.flatMap(profile=>profile.capabilities??[]));
  const known=new Set(availableModules.map(module=>module.key));
  const suggested=unique([...required,...optional]);
  return {activities:unique(activities),required,optional,capabilities,
    suggestedModules:suggested.filter(key=>known.has(key)),
    unavailableModules:suggested.filter(key=>!known.has(key)),
    state:'RECOMMENDATION_ONLY',activationRequiresApproval:true};
}
