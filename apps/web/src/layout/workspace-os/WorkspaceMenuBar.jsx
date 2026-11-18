import {useEffect, useRef, useState} from 'react';
import {ChevronDown, Layers3} from 'lucide-react';
import {useLocation, useNavigate} from 'react-router-dom';
import styles from './WorkspaceMenuBar.module.css';

const NAV = [
  {label:'Inicio', to:'/'},
  {label:'Ventas', to:'/ventas'},
  {label:'Compras', to:'/compras'},
  {label:'Proveedores', to:'/compras/proveedores'},
  {label:'Inventario', to:'/inventario/existencias'},
  {label:'Punto de venta', to:'/pos'},
  {label:'Reportes', to:'/reportes'},
];

export default function WorkspaceMenuBar({section, page, onOpenCommand, onOpenAI, toggleTheme, resolvedTheme}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(null);
  const root = useRef(null);
  useEffect(() => {setOpen(null);}, [location.pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const dismiss = (event) => {
      if (!root.current?.contains(event.target)) setOpen(null);
    };
    const escape = (event) => {
      if (event.key === 'Escape') {setOpen(null);root.current?.querySelector('[aria-expanded="true"]')?.focus();}
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {document.removeEventListener('pointerdown', dismiss);document.removeEventListener('keydown', escape);};
  }, [open]);

  const invoke = (action) => {setOpen(null);action();};
  const menu = [
    {id:'system', label:'Business OS', items:[
      {label:'Escritorio', action:()=>navigate('/')},
      {label:'Buscar aplicaciones y acciones', action:onOpenCommand, shortcut:'⌘K'},
      {label:'Preferencias', action:()=>navigate('/preferencias')},
      {label:'Mi perfil', action:()=>navigate('/perfil')},
    ]},
    {id:'navigate', label:'Ir', items:NAV.map(({label,to})=>({label,action:()=>navigate(to),selected:location.pathname===to}))},
    {id:'view', label:'Vista', items:[
      {label:resolvedTheme==='dark'?'Activar tema claro':'Activar tema oscuro',action:toggleTheme},
      {label:'Volver al escritorio',action:()=>navigate('/')},
    ]},
    {id:'help',label:'Ayuda',items:[
      {label:'Buscar ayuda y comandos',action:onOpenCommand},
      {label:'Abrir Buzz AI',action:onOpenAI},
    ]},
  ];

  return <nav className={styles.menubar} aria-label="Barra de menú de Business OS" ref={root}>
    <span className={styles.mark} aria-hidden="true"><Layers3 size={16}/></span>
    {menu.map(group=><div className={styles.group} key={group.id}>
      <button type="button" className={styles.trigger} aria-expanded={open===group.id}
        aria-haspopup="true" aria-controls={open===group.id?'business-os-menu-'+group.id:undefined}
        onClick={()=>setOpen(current=>current===group.id?null:group.id)}
        onMouseEnter={()=>{if(open)setOpen(group.id);}}>
        {group.label}{group.id==='system'?<ChevronDown size={12} aria-hidden="true"/>:null}
      </button>
      {open===group.id?<div id={'business-os-menu-'+group.id} className={styles.dropdown} role="group" aria-label={'Menú '+group.label}>
        {group.items.map(item=><button key={item.label} type="button" className={`${styles.option} ${item.selected ? styles.selected : ''}`}
          aria-current={item.selected ? 'page' : undefined}
          onClick={()=>invoke(item.action)}>
          <span>{item.selected?'✓  ':''}{item.label}</span>
          {item.shortcut?<kbd>{item.shortcut}</kbd>:null}
        </button>)}
      </div>:null}
    </div>)}
    <span className={styles.context} title={section+' · '+page}>{section} <span aria-hidden="true">/</span> {page}</span>
  </nav>;
}
