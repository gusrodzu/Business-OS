import {useEffect, useMemo} from 'react';
import {ChevronRight} from 'lucide-react';
import {useLocation} from 'react-router-dom';
import {adminNavigation, navigationGroups} from '../data/navigation';
import styles from './UXRollout.module.css';

const RECENTS_KEY='buzzbee.ux.recents';

function fluidModule(routeId=''){
  const id=String(routeId).toLowerCase();
  if(id.includes('dashboard')||id==='core:home'||id.endsWith(':home')) return 'home';
  if(id.startsWith('sales:')) return 'sales';
  if(id.startsWith('procurement:')) return 'procurement';
  if(id.startsWith('inventory:')) return 'inventory';
  if(id.startsWith('finance:')) return 'finance';
  if(id.startsWith('crm:')) return 'crm';
  if(id.startsWith('hr:')) return 'hr';
  if(id.startsWith('projects:')) return 'projects';
  if(id.startsWith('pos:')) return 'pos';
  if(id.startsWith('production:')) return 'production';
  return 'workspace';
}

function flattenNavigation(){
  const rows=[];
  for(const group of navigationGroups){
    for(const item of group.children||[]){
      if(item.to) rows.push({label:item.label,to:item.to,group:group.label});
      for(const child of item.children||[]) rows.push({label:child.label,to:child.to,group:item.label,parentGroup:group.label});
    }
  }
  for(const item of adminNavigation||[]) rows.push({label:item.label,to:item.to,group:'Configuración'});
  return rows;
}
const NAV=flattenNavigation();
const FALLBACKS={
  '/administracion':['Administración','Centro administrativo'],
  '/facturacion-fiscal':['Administración','Facturación'],
  '/gastos':['Finanzas','Gastos'],
  '/activos-fijos':['Finanzas','Activos fijos'],
  '/produccion':['Apps','Producción'],
  '/proyectos':['Apps','Proyectos'],
  '/pos':['Apps','POS'],
  '/marketing':['Comercial','Marketing'],
  '/inteligencia':['Análisis','Inteligencia'],
  '/agenda':['Principal','Agenda'],
  '/aprobaciones':['Principal','Aprobaciones'],
  '/datos-maestros':['Plataforma','Datos maestros'],
  '/data-hub':['Plataforma','Importar datos'],
  '/integration-hub':['Plataforma','Integraciones'],
  '/flow':['Plataforma','Automatizaciones'],
};
function routeMeta(pathname){
  const clean=pathname==='/'?'/':pathname.replace(/\/$/,'');
  const direct=NAV.find(item=>item.to===clean);
  if(direct) return {group:direct.parentGroup||direct.group,label:direct.label};
  if(FALLBACKS[clean]) return {group:FALLBACKS[clean][0],label:FALLBACKS[clean][1]};
  const parts=clean.split('/').filter(Boolean);
  const label=(parts.at(-1)||'Inicio').replaceAll('-',' ').replace(/\b\w/g,c=>c.toUpperCase());
  return {group:parts.length>1?parts[0].replace(/\b\w/g,c=>c.toUpperCase()):'BuzzBee',label};
}
function writeRecent(item){
  try{
    const current=JSON.parse(localStorage.getItem(RECENTS_KEY)||'[]');
    const next=[item,...current.filter(row=>row.path!==item.path)].slice(0,8);
    localStorage.setItem(RECENTS_KEY,JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('buzzbee:recents-changed',{detail:next}));
  }catch{/* localStorage unavailable */}
}

export default function UXRouteFrame({routeId, children}){
  const location=useLocation();
  const meta=useMemo(()=>routeMeta(location.pathname),[location.pathname]);
  useEffect(()=>{
    if(location.pathname!=='/') writeRecent({label:meta.label,path:location.pathname,group:meta.group});
    document.documentElement.dataset.uxVersion='20.1';
  },[location.pathname,meta.label,meta.group]);

  return <section className={styles.routeFrame} data-ux-v19-route={routeId||'route'} data-ux-version="20.1" data-fluid-module={fluidModule(routeId)}>
    {location.pathname!=='/' && location.pathname!=='/pos'?<div className={styles.routeContext} aria-label="Contexto del módulo">
      <span>{meta.group}</span><ChevronRight size={12}/><strong>{meta.label}</strong>
    </div>:null}
    <div className={styles.routeContent}>{children}</div>
  </section>;
}
