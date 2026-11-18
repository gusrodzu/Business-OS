import {useState} from 'react';
import {Activity, Building2, ChevronRight, CreditCard, Home, Layers3, Monitor, Palette, Search, ShieldCheck, SlidersHorizontal, UserRound} from 'lucide-react';
import {Link, useOutletContext} from 'react-router-dom';
import {Check, Image as ImageIcon} from 'lucide-react';
import {WORKSPACE_WALLPAPERS} from '../../../../layout/os/workspaceWallpapers';
import styles from './SettingsHome.module.css';

// OS settings are presentation-only: links point to existing, authorized routes.
const categories = [
  {id:'home',title:'Inicio',icon:Home},
  {id:'system',title:'Sistema',icon:Monitor},
  {id:'personal',title:'Personalización',icon:Palette},
  {id:'account',title:'Cuentas',icon:UserRound},
  {id:'company',title:'Empresa',icon:Building2},
  {id:'apps',title:'Aplicaciones y planes',icon:Layers3},
  {id:'security',title:'Privacidad y seguridad',icon:ShieldCheck},
];
const entries = [
  {group:'system',to:'/configuracion/preferencias',icon:SlidersHorizontal,title:'Preferencias',description:'Opciones personales y comportamiento de tu espacio de trabajo'},
  {group:'apps',to:'/configuracion/modulos',icon:Layers3,title:'Aplicaciones y módulos',description:'Consulta y administra los módulos habilitados en tu organización'},
  {group:'system',to:'/configuracion/actividad',icon:Activity,title:'Actividad y auditoría',description:'Historial de actividad y eventos disponibles'},
  {group:'personal',to:'/preferencias',icon:Palette,title:'Apariencia y preferencias',description:'Personaliza tu experiencia con las opciones disponibles'},
  {group:'account',to:'/configuracion/perfil',icon:UserRound,title:'Mi perfil',description:'Consulta y administra tus datos personales'},
  {group:'account',to:'/configuracion/preferencias',icon:SlidersHorizontal,title:'Mis preferencias',description:'Ajustes personales de tu cuenta'},
  {group:'company',to:'/configuracion/usuarios',icon:ShieldCheck,title:'Usuarios y roles',description:'Accesos y permisos de tu organización'},
  {group:'company',to:'/configuracion/empresa',icon:Building2,title:'Información de la empresa',description:'Identidad, moneda, zona horaria y datos fiscales'},
  {group:'apps',to:'/configuracion/facturacion',icon:CreditCard,title:'Planes y facturación',description:'Consulta tu plan y la información de facturación disponible'},
  {group:'security',to:'/configuracion/usuarios',icon:ShieldCheck,title:'Permisos de acceso',description:'Control de usuarios y roles por empresa'},
  {group:'security',to:'/configuracion/actividad',icon:Activity,title:'Registro de actividad',description:'Consulta cambios y eventos de auditoría'},
];
export default function SettingsHome(){
  const {appearance='light',applyAppearance,wallpaper,applyWallpaper} = useOutletContext() || {};
  const [category,setCategory]=useState('system');
  const [personalError,setPersonalError]=useState('');
  const [search,setSearch]=useState('');
  const query=search.trim().toLocaleLowerCase('es');
  const shown=entries.filter(item=>(!query ? (category==='home'||item.group===category) : (item.title+' '+item.description).toLocaleLowerCase('es').includes(query)));
  const themes=[{id:'light',label:'Claro · Windows',color:'#edf3f9'},{id:'classic',label:'Business Classic',color:'#64748b'},{id:'midnight',label:'Midnight',color:'#5277c3'},{id:'graphite',label:'Graphite',color:'#737d8b'},{id:'executive',label:'Executive',color:'#a67c45'}];
  const heading=query?'Resultados de búsqueda':categories.find(item=>item.id===category)?.title||'Configuración';
  return <div className={styles.osSettings}>
    <aside className={styles.sidebar} aria-label="Categorías de configuración">
      <div className={styles.brand}><SlidersHorizontal size={20}/><strong>Configuración</strong></div>
      <nav className={styles.nav} aria-label="Secciones">
        {categories.map(({id,title,icon:Icon})=><button type="button" key={id} className={styles.navItem} aria-current={category===id?'page':undefined} onClick={()=>{setCategory(id);setSearch('');}}><Icon size={19} aria-hidden="true"/><span>{title}</span></button>)}
      </nav>
      <p className={styles.sideNote}>Las opciones disponibles dependen de tu cuenta y los permisos de tu empresa.</p>
    </aside>
    <main className={styles.main}>
      <label className={styles.search}><Search size={18} aria-hidden="true"/><span className={styles.srOnly}>Buscar una configuración</span><input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Buscar una configuración"/></label>
      <header className={styles.pageHeader}><h1>{heading}</h1><p>Administra tu espacio de trabajo con opciones claras y fáciles de encontrar.</p></header>
      {!query && category==='personal' ? <section className={styles.personalPanel} aria-label="Personalización del escritorio">
        <h2>Colores y temas</h2><p>Elige cómo se ve tu escritorio. Los cambios de tema se aplican inmediatamente.</p>
        <div className={styles.themeGrid} role="group" aria-label="Temas del sistema">
          {themes.map(theme=><button type="button" key={theme.id} className={styles.themeButton} aria-pressed={appearance===theme.id} onClick={()=>{
            if(!applyAppearance?.(theme.id))setPersonalError('El tema se aplicó, pero no pudo guardarse en este navegador.');else setPersonalError('');
          }}><span className={styles.themeSwatch} style={{background:theme.color}} aria-hidden="true"/><span>{theme.label}</span>{appearance===theme.id?<Check size={18} aria-hidden="true"/>:null}</button>)}
        </div>
        <h2>Fondo</h2><p>Selecciona un fondo para el escritorio. Esta elección se guarda al instante.</p>
        <div className={styles.wallpaperGrid} role="group" aria-label="Fondos del sistema">
          {WORKSPACE_WALLPAPERS.map(item=><button type="button" key={item.id} className={styles.wallpaperButton} aria-pressed={wallpaper?.kind==='preset'&&wallpaper.id===item.id} onClick={()=>{
            if(!applyWallpaper?.({kind:'preset',id:item.id}))setPersonalError('No se pudo guardar el fondo. Comprueba el almacenamiento del navegador.');else setPersonalError('');
          }}><span className={styles.wallpaperSwatch} style={{backgroundImage:item.background}} aria-hidden="true"/><span>{item.label}</span>{wallpaper?.kind==='preset'&&wallpaper.id===item.id?<Check size={17} aria-hidden="true"/>:null}</button>)}
        </div>
        <p className={styles.personalHint}><ImageIcon size={17} aria-hidden="true"/> La carga de imágenes propias se integrará próximamente en esta sección.</p>
        {personalError?<p role="alert" className={styles.personalError}>{personalError}</p>:null}
      </section> : null}
      <section className={styles.rows} aria-label={heading}>
        {(category==='personal'&&!query?[]:shown).map(({to,title,description,icon:Icon})=><Link className={styles.row} key={to+'-'+title} to={to}>
          <Icon size={21} aria-hidden="true"/><span className={styles.rowCopy}><strong>{title}</strong><small>{description}</small></span><ChevronRight size={19} aria-hidden="true"/>
        </Link>)}
        {!shown.length && (category!=='personal'||Boolean(query))?<p className={styles.empty}>No encontramos esa configuración. Prueba otra palabra.</p>:null}
      </section>
    </main>
  </div>;
}
