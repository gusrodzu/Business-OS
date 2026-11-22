/**
 * Agent Office — shared team/status chip.
 *
 * A DOM-only visual component. Its mode comes from chooseMotion() and
 * verified public GitHub data, not inferred agent telemetry. No network,
 * HTML injection, cookies, business-OS imports or external assets.
 */
const ICONS=Object.freeze({
  frontend:'▦',
  backend:'⌘',
  security:'⬡',
  qa:'✓',
  director:'◈',
  devops:'☁',
});
const STATUS=Object.freeze({
  typing:{label:'CI activo',aria:'verificación de GitHub en ejecución'},
  waiting:{label:'En cola',aria:'verificación de GitHub en cola'},
  reading:{label:'PR abierto',aria:'solicitud de cambios pendiente'},
  celebrating:{label:'CI aprobado',aria:'verificación reciente aprobada'},
  alert:{label:'CI falló',aria:'verificación reciente fallida'},
  idle:{label:'En espera',aria:'sin trabajo activo confirmado en GitHub'},
  offline:{label:'Sin señal',aria:'actividad de GitHub no disponible'},
});
const VARIANTS=new Set(['floating','pill','detail','card']);

function part(className,text){
  const el=document.createElement('span');
  el.className=className;
  el.textContent=String(text);
  return el;
}

/**
 * @param {object} team - known internal team identity
 * @param {object} motion - result of chooseMotion(team,{fresh:...})
 * @param {{variant?:'floating'|'pill'|'detail'|'card',showName?:boolean}} options
 * @returns {HTMLSpanElement} safe, non-interactive phrasing component
 */
export function createAgentStatus(team,motion,{variant='floating',showName=true}={}){
  const v=VARIANTS.has(variant)?variant:'pill';
  const mode=Object.hasOwn(STATUS,motion?.mode)?motion.mode:'offline';
  const name=String(team?.name||'Equipo');
  const icon=Object.hasOwn(ICONS,team?.id)?ICONS[team.id]:'▣';
  const config=STATUS[mode];

  const wrapper=part('agent-status agent-status--'+v,'');
  wrapper.dataset.status=mode;
  wrapper.setAttribute('role','group');
  wrapper.setAttribute('aria-label',name+': '+config.aria);

  if(showName){
    const role=part('agent-status__role','');
    role.append(part('agent-status__icon',icon),part('agent-status__name',name));
    wrapper.append(role);
  }
  const badge=part('agent-status__badge','');
  badge.append(part('agent-status__dot',''),part('agent-status__state',config.label));
  badge.setAttribute('aria-hidden','true');
  wrapper.append(badge);
  return wrapper;
}
