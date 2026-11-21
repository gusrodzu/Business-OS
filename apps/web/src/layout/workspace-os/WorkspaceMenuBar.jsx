import {useEffect, useRef, useState} from 'react';
import {ChevronDown, ChevronRight, Layers3} from 'lucide-react';
import {useLocation, useNavigate} from 'react-router-dom';
import {isProfileVisible, navigationGroups} from '../../data/navigation';
import styles from './WorkspaceMenuBar.module.css';

const businessModules=navigationGroups.flatMap((group)=>group.children).filter(isProfileVisible);

function matches(path, prefix) {
  return Boolean(prefix) && (path===prefix || path.startsWith(prefix+'/'));
}

function menuModule(app) {
  if (!app?.path) return null;
  const path=app.path;
  return businessModules.find((item)=>item.moduleKey===app.key) || businessModules.find((item)=>{
    const routes=item.children?.length ? item.children.map((entry)=>entry.to) : [item.to];
    return routes.some((route)=>matches(path,route));
  }) || null;
}

export default function WorkspaceMenuBar({
  section, page, activeApp, onOpenCommand, onOpenAI, onOpenApps,
  onMinimizeWindow, onMaximizeWindow, onCloseWindow, toggleTheme, resolvedTheme,
}) {
  const navigate=useNavigate();
  const location=useLocation();
  const [open,setOpen]=useState(null);
  const [submenu,setSubmenu]=useState(null);
  const root=useRef(null);
  const foreground=activeApp?.windowKey ? activeApp : null;
  const module=menuModule(foreground);
  const moduleRoutes=module
    ? (module.children?.length ? module.children : [{label:module.label,to:module.to}]).filter((entry)=>Boolean(entry.to))
    : [];
  const moduleStart=moduleRoutes[0]?.to||foreground?.path||'/';

  // Switching windows must update the menus even if a background route lags.
  useEffect(()=>{setOpen(null);setSubmenu(null);},[location.pathname,foreground?.windowKey,foreground?.path]);
  useEffect(()=>{
    if(!open)return undefined;
    const outside=(event)=>{if(!root.current?.contains(event.target)){setOpen(null);setSubmenu(null);}};
    const escape=(event)=>{
      if(event.key!=='Escape')return;
      if(submenu){
        setSubmenu(null);
        root.current?.querySelector('[role="menuitem"][aria-haspopup="menu"][aria-expanded="true"]')?.focus();
      }else{
        setOpen(null);
        root.current?.querySelector('.'+styles.trigger+'[aria-expanded="true"]')?.focus();
      }
    };
    document.addEventListener('pointerdown',outside);
    document.addEventListener('keydown',escape);
    return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[open,submenu]);

  function invoke(action){setOpen(null);setSubmenu(null);action?.();}
  function toggleGroup(id){setSubmenu(null);setOpen((current)=>current===id?null:id);}
  function moveFocus(event){
    if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
    event.preventDefault();
    const menu=event.target.closest('[role="menu"]')||event.currentTarget;
    const items=Array.from(menu.querySelectorAll('[role="menuitem"]')).filter((item)=>item.closest('[role="menu"]')===menu);
    if(!items.length)return;
    const index=items.indexOf(document.activeElement);
    const next=event.key==='Home'?0:event.key==='End'?items.length-1
      :(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;
    items[next]?.focus();
  }

  const groups=[
    {id:'app',label:foreground?.title||'Business OS',items:[
      ...(foreground ? [{label:'Inicio de '+(module?.label||foreground.title),action:()=>navigate(moduleStart)}] : []),
      {label:'Ir al escritorio',action:()=>navigate('/')},
      {label:'Preferencias',action:()=>navigate('/preferencias')},
      {label:'Mi perfil',action:()=>navigate('/perfil')},
    ]},
    {id:'file',label:'Archivo',items:[
      {label:'Aplicaciones disponibles',action:onOpenApps},
      {label:'Buscar aplicaciones y acciones',action:onOpenCommand,shortcut:'Ctrl/⌘ K'},
    ]},
    {id:'go',label:'Ir',items: moduleRoutes.length
      ? [{label:'Secciones de '+module.label,children:moduleRoutes.map((entry)=>({
          label:entry.label,action:()=>navigate(entry.to),
          selected:matches(location.pathname,entry.to),
        }))}]
      : [{label:'Ir al escritorio',action:()=>navigate('/')}]
    },
    {id:'view',label:'Vista',items:[
      {label:resolvedTheme==='dark'?'Activar tema claro':'Activar tema oscuro',action:toggleTheme},
      {label:'Mostrar escritorio',action:()=>navigate('/')},
    ]},
    ...(foreground ? [{id:'window',label:'Ventana',items:[
      {label:'Minimizar',action:()=>onMinimizeWindow?.(foreground.windowKey)},
      {label:foreground.maximized?'Restaurar tamaño':'Maximizar',
        action:()=>onMaximizeWindow?.(foreground.windowKey)},
      {label:'Cerrar ventana',action:()=>onCloseWindow?.(foreground.windowKey)},
    ]}] : []),
    {id:'help',label:'Ayuda',items:[
      {label:'Buscar ayuda y comandos',action:onOpenCommand},
      {label:'Abrir asistente empresarial',action:onOpenAI},
    ]},
  ];

  return <nav className={styles.menubar} aria-label={foreground
    ? 'Menús de '+foreground.title
    : 'Barra de menú de Business OS'} ref={root}>
    <span className={styles.mark} aria-hidden="true"><Layers3 size={16}/></span>
    {groups.map((group)=><div className={styles.group} key={group.id}>
      <button type="button" className={styles.trigger}
        aria-expanded={open===group.id} aria-haspopup="menu"
        aria-controls={open===group.id?'business-os-menu-'+group.id:undefined}
        onClick={()=>toggleGroup(group.id)}
        onMouseEnter={()=>{if(open&&open!==group.id){setOpen(group.id);setSubmenu(null);}}}
        onKeyDown={(event)=>{
          if(event.key==='ArrowDown'){
            event.preventDefault();setOpen(group.id);setSubmenu(null);
            globalThis.window.requestAnimationFrame(()=>
              root.current?.querySelector('#business-os-menu-'+group.id+' [role="menuitem"]')?.focus());
          }
        }}>
        {group.label}{group.id==='app'?<ChevronDown size={12} aria-hidden="true"/>:null}
      </button>
      {open===group.id?<div id={'business-os-menu-'+group.id}
        className={styles.dropdown} role="menu" aria-label={'Menú '+group.label}
        onKeyDown={moveFocus}>
        {group.items.map((item)=>item.children?.length
          ? <div className={styles.submenuWrap} key={item.label}
              onMouseEnter={()=>setSubmenu(item.label)} onMouseLeave={()=>setSubmenu(null)}>
              <button type="button" role="menuitem" className={styles.option}
                aria-haspopup="menu" aria-expanded={submenu===item.label}
                onClick={()=>setSubmenu((current)=>current===item.label?null:item.label)}
                onKeyDown={(event)=>{
                  if(event.key==='ArrowRight'){
                    event.preventDefault();setSubmenu(item.label);
                    globalThis.window.requestAnimationFrame(()=>
                      root.current?.querySelector('[data-os-submenu="true"] [role="menuitem"]')?.focus());
                  }
                }}>
                <span>{item.label}</span><ChevronRight size={15} aria-hidden="true"/>
              </button>
              {submenu===item.label?<div role="menu" data-os-submenu="true"
                  className={styles.submenu} aria-label={item.label} onKeyDown={(event)=>{
                    if(event.key==='ArrowLeft'){
                      event.preventDefault();event.stopPropagation();
                      setSubmenu(null);event.currentTarget.parentElement?.querySelector('[aria-haspopup="menu"]')?.focus();
                    }
                  }}>
                {item.children.map((child)=><button key={child.label} type="button"
                    role="menuitem" className={styles.option+' '+(child.selected?styles.selected:'')}
                    aria-current={child.selected?'page':undefined}
                    onClick={()=>invoke(child.action)}>
                  <span>{child.selected?'✓  ':''}{child.label}</span>
                </button>)}
              </div>:null}
            </div>
          : <button key={item.label} type="button" role="menuitem"
              className={styles.option+' '+(item.selected?styles.selected:'')}
              onClick={()=>invoke(item.action)}>
              <span>{item.label}</span>{item.shortcut?<kbd>{item.shortcut}</kbd>:null}
            </button>)}
      </div>:null}
    </div>)}
    <span className={styles.context} title={section+' · '+page}>{section} <span aria-hidden="true">/</span> {page}</span>
  </nav>;
}
