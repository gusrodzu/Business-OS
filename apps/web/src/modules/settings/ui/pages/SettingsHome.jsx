import {lazy, Suspense, useState} from 'react';
import {Activity, Building2, ChevronRight, CreditCard, Home, Layers3, Monitor, Palette, Search, ShieldCheck, SlidersHorizontal, UserRound} from 'lucide-react';
import {Link, useLocation, useSearchParams, useOutletContext} from 'react-router-dom';
import {Check, Image as ImageIcon, Paintbrush, Keyboard, Sun, LockKeyhole, PanelBottom, Type, ChevronLeft} from 'lucide-react';
import {WORKSPACE_WALLPAPERS, wallpaperBackground} from '../../../../layout/os/workspaceWallpapers';
import styles from './SettingsHome.module.css';

const detailPages = {
  perfil: lazy(() => import('./Profile')),
  preferencias: lazy(() => import('./Preferences')),
  actividad: lazy(() => import('./ActivityCenter')),
  empresa: lazy(() => import('./CompanySettings')),
  usuarios: lazy(() => import('./UsersAccess')),
  modulos: lazy(() => import('./Modules')),
  facturacion: lazy(() => import('./Billing')),
};
// OS settings are presentation-only: links point to existing, authorized routes.
const categories = [
  {id:'system',title:'Sistema',icon:Monitor},
  {id:'personal',title:'Personalización',icon:Palette},
  {id:'account',title:'Mi cuenta',icon:UserRound},
  {id:'company',title:'Empresa y equipo',icon:Building2},
  {id:'apps',title:'Aplicaciones y planes',icon:Layers3},
  {id:'security',title:'Privacidad y seguridad',icon:ShieldCheck},
];
const entries = [
  {group:'system',to:'/configuracion/actividad',icon:Activity,title:'Actividad y auditoría',description:'Historial de actividad y eventos disponibles'},
  {group:'system',to:'/configuracion/preferencias',icon:Monitor,title:'Pantalla y experiencia',description:'Apariencia, densidad y movimiento de la interfaz'},
  {group:'apps',to:'/configuracion/modulos',icon:Layers3,title:'Aplicaciones y módulos',description:'Consulta y administra los módulos habilitados en tu organización'},
  {group:'personal',to:'/configuracion/preferencias',icon:Palette,title:'Apariencia y preferencias',description:'Personaliza tu experiencia con las opciones disponibles'},
  {group:'account',to:'/configuracion/perfil',icon:UserRound,title:'Mi perfil',description:'Consulta y administra tus datos personales'},
  {group:'account',to:'/configuracion/preferencias',icon:Palette,title:'Mis preferencias',description:'Tema, movimiento y página de inicio de tu cuenta'},
  {group:'company',to:'/configuracion/usuarios',icon:ShieldCheck,title:'Usuarios y roles',description:'Accesos y permisos de tu organización'},
  {group:'company',to:'/configuracion/empresa',icon:Building2,title:'Información de la empresa',description:'Identidad, moneda, zona horaria y datos fiscales'},
  {group:'apps',to:'/configuracion/facturacion',icon:CreditCard,title:'Planes y facturación',description:'Consulta tu plan y la información de facturación disponible'},
  {group:'security',to:'/configuracion/usuarios',icon:ShieldCheck,title:'Permisos de acceso',description:'Control de usuarios y roles por empresa'},
  {group:'security',to:'/configuracion/actividad',icon:Activity,title:'Registro de actividad',description:'Consulta cambios y eventos de auditoría'},
];
export default function SettingsHome(){
  const {appearance='light',applyAppearance,wallpaper,applyWallpaper} = useOutletContext() || {};
  const {pathname}=useLocation();
  const normalizedPath=pathname.replace(/\/$/, '') || '/';
  const [searchParams]=useSearchParams();
  const detailKey=normalizedPath.match(/^\/configuracion\/([^/]+)\/?$/)?.[1];
  const DetailPage=detailPages[detailKey] || null;
  const requestedCategory=searchParams.get('seccion');
  const category=categories.some(item=>item.id===requestedCategory)?requestedCategory:'system';
  const matchingEntries=DetailPage ? entries.filter(item=>item.to===normalizedPath) : [];
  const contextualEntry=matchingEntries.find(item=>item.group===requestedCategory);
  const activeCategory=DetailPage ? (contextualEntry?.group || matchingEntries[0]?.group || category) : category;
  const [personalError,setPersonalError]=useState('');
  const [search,setSearch]=useState('');
  const query=search.trim().toLocaleLowerCase('es');
  const shown=entries.filter(item=>(!query ? (category==='home'||item.group===category) : (item.title+' '+item.description).toLocaleLowerCase('es').includes(query)));
  const themes=[{id:'light',label:'Claro · Windows',color:'#edf3f9'},{id:'classic',label:'Business Classic',color:'#64748b'},{id:'midnight',label:'Midnight',color:'#5277c3'},{id:'graphite',label:'Graphite',color:'#737d8b'},{id:'executive',label:'Executive',color:'#a67c45'}];
  const personalizationSections=[{id:'fondo',title:'Fondo',description:'Imagen de fondo y escritorio',Icon:ImageIcon},{id:'colores',title:'Colores',description:'Color de énfasis y apariencia',Icon:Palette},{id:'temas',title:'Temas',description:'Seleccionar y administrar temas',Icon:Paintbrush},{id:'movimiento',title:'Movimiento',description:'Preferencias de animaciones y accesibilidad',Icon:Sun},{id:'inicio',title:'Inicio',description:'Página inicial y comportamiento',Icon:Home},{id:'barra',title:'Barra de tareas',description:'Aplicaciones y elementos del escritorio',Icon:PanelBottom},{id:'texto',title:'Entrada de texto',description:'Opciones de escritura y teclado',Icon:Keyboard}];
  const [personalSection,setPersonalSection]=useState(null);
  const activeTheme=themes.find(item=>item.id===appearance)||themes[0];
  const activeEntry=DetailPage ? (contextualEntry || matchingEntries[0]) : null;
  const heading=query?'Resultados de búsqueda':categories.find(item=>item.id===category)?.title||'Configuración';
  const categoryDescriptions={system:'Estado del sistema, actividad y auditoría.',personal:'Apariencia, fondo y preferencias de tu espacio de trabajo.',account:'Identidad y datos personales de tu cuenta.',company:'Organización, usuarios y permisos de tu equipo.',apps:'Módulos, suscripción y facturación.',security:'Accesos, permisos y registros de seguridad.'};
  return <div className={styles.osSettings}>
    <aside className={styles.sidebar} aria-label="Categorías de configuración">
      <div className={styles.brand}><SlidersHorizontal size={20}/><strong>Configuración</strong></div>
      <nav className={styles.nav} aria-label="Secciones">
        {categories.map(({id,title,icon:Icon})=><Link key={id} to={id==='system'?'/configuracion':'/configuracion?seccion='+encodeURIComponent(id)} className={styles.navItem} aria-current={activeCategory===id?'page':undefined} onClick={()=>{setSearch('');setPersonalSection(null);}}><Icon size={19} aria-hidden="true"/><span>{title}</span></Link>)}
      </nav>
      <p className={styles.sideNote}>Las opciones disponibles dependen de tu cuenta y los permisos de tu empresa.</p>
    </aside>
    <main className={styles.main}>
      {!DetailPage ? <label className={styles.search}><Search size={18} aria-hidden="true"/><span className={styles.srOnly}>Buscar una configuración</span><input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Buscar una configuración"/></label> : null}
      {DetailPage ? <div className={styles.detailPanel}>
        <div className={styles.detailNavigation} aria-label="Ubicación en configuración">
          <Link to={'/configuracion?seccion='+encodeURIComponent(activeCategory)} className={styles.backLink} aria-label="Volver a la categoría de Configuración">← {categories.find(item=>item.id===activeCategory)?.title||'Configuración'}</Link>
          <span className={styles.detailLocation} aria-current="location">{activeEntry?.title || 'Configuración'}</span>
        </div>
        <Suspense fallback={<p role="status">Cargando configuración…</p>}><DetailPage/></Suspense>
      </div> : <>
      <header className={styles.pageHeader}><h1>{heading}</h1><p>{query?'Selecciona un resultado para abrir su configuración.':categoryDescriptions[category]}</p></header>
      {!query && category==='personal' ? <section className={styles.winPersonal} aria-label="Personalización del escritorio">
        {!personalSection ? <>
          <div className={styles.winThemeHero}>
            <div className={styles.winThemePreview} aria-hidden="true">
              <div className={styles.winPreviewWallpaper} style={{backgroundImage:wallpaperBackground(wallpaper),backgroundSize:'cover',backgroundPosition:'center'}}>
                <div className={styles.winPreviewWindow} style={{'--preview-accent':activeTheme.color}}><span/><span/><span/><i/></div>
              </div>
              <div className={styles.winPreviewStand}/>
            </div>
            <div className={styles.winThemeSelector}>
              <h2>Selecciona un tema para aplicarlo</h2><p className={styles.winThemeCurrent} role="status">Tema actual: {activeTheme.label}</p>
              <div className={styles.winThemeGrid} role="group" aria-label="Temas del sistema">
                {themes.map(theme=><button type="button" key={theme.id} className={styles.winThemeTile} aria-label={theme.label} aria-pressed={appearance===theme.id} title={theme.label} onClick={()=>{if(!applyAppearance?.(theme.id))setPersonalError('No se pudo guardar el tema en este navegador.');else setPersonalError('');}}>
                  <span className={styles.winThemeImage} style={{background:theme.id==='light'?'linear-gradient(135deg,#0872c9,#c6e5fc)':theme.id==='midnight'?'linear-gradient(135deg,#08132f,#355fa9)':theme.id==='executive'?'linear-gradient(135deg,#493222,#bb935d)':theme.id==='graphite'?'linear-gradient(135deg,#222c36,#7e8997)':'linear-gradient(135deg,#1c293a,#758aa6)'}} aria-hidden="true"><span className={styles.winThemeMiniWindow}/></span>
                  {appearance===theme.id?<span className={styles.winThemeSelected}><Check size={14}/></span>:null}
                </button>)}
              </div>
            </div>
          </div>
          <div className={styles.winSettingsRows}>
            {personalizationSections.map(({id,title,description,Icon})=><button type="button" key={id} className={styles.winSettingsRow} onClick={()=>setPersonalSection(id)}>
              <Icon size={21} aria-hidden="true"/><span><strong>{title}</strong><small>{description}</small></span><ChevronRight size={18} aria-hidden="true"/>
            </button>)}
          </div>
        </> : <div className={styles.winPersonalDetail}>
          <button type="button" className={styles.winPersonalBack} onClick={()=>setPersonalSection(null)}><ChevronLeft size={18}/> Personalización</button>
          <h2>{personalizationSections.find(item=>item.id===personalSection)?.title}</h2>
          {personalSection==='fondo'?<><p>Selecciona el fondo de tu escritorio. Se aplica al instante.</p><div className={styles.wallpaperGrid} role="group" aria-label="Fondos del sistema">{WORKSPACE_WALLPAPERS.map(item=><button type="button" key={item.id} className={styles.wallpaperButton} aria-pressed={wallpaper?.kind==='preset'&&wallpaper.id===item.id} onClick={()=>{if(!applyWallpaper?.({kind:'preset',id:item.id}))setPersonalError('No se pudo guardar el fondo.');else setPersonalError('');}}><span className={styles.wallpaperSwatch} style={{backgroundImage:item.background}} aria-hidden="true"/><span>{item.label}</span></button>)}</div></>:null}
          {personalSection==='colores'||personalSection==='temas'?<><p>Selecciona un tema visual para tu espacio de trabajo.</p><div className={styles.themeGrid} role="group" aria-label="Temas del sistema">{themes.map(theme=><button type="button" key={theme.id} className={styles.themeButton} aria-pressed={appearance===theme.id} onClick={()=>{if(!applyAppearance?.(theme.id))setPersonalError('No se pudo guardar el tema.');else setPersonalError('');}}><span className={styles.themeSwatch} style={{background:theme.color}} aria-hidden="true"/><span>{theme.label}</span>{appearance===theme.id?<Check size={18}/>:null}</button>)}</div></>:null}
          {['movimiento','inicio','barra','texto'].includes(personalSection)?<><p>{personalSection==='movimiento'?'Reduce las animaciones de la aplicación y ajusta la densidad de la interfaz.':personalSection==='inicio'?'Elige qué módulo se abre después de iniciar sesión.':personalSection==='barra'?'Configura el comportamiento de la interfaz y sus controles.':'Configura las preferencias disponibles de lectura y visualización.'}</p><Link className={styles.winPersonalSettingsLink} to={'/configuracion/preferencias?seccion=personal&ajuste='+encodeURIComponent(personalSection)}>Abrir controles de {personalizationSections.find(item=>item.id===personalSection)?.title.toLowerCase()} <ChevronRight size={17} aria-hidden="true"/></Link></>:null}
        </div>}
        {personalError?<p role="alert" className={styles.personalError}>{personalError}</p>:null}
      </section> : null}
      {!query && ['system','account','company','apps','security'].includes(category) ? <section className={styles.settingsCategoryHero} aria-label={'Resumen de '+heading}>
        <span className={styles.settingsCategoryIcon} aria-hidden="true">{category==='system'?<Monitor size={38}/>:category==='account'?<UserRound size={38}/>:category==='company'?<Building2 size={38}/>:category==='apps'?<Layers3 size={38}/>:<ShieldCheck size={38}/>}</span>
        <div><h2>{{system:'Tu espacio de trabajo',account:'Tu experiencia personal',company:'Tu organización',apps:'Tus aplicaciones',security:'Protección y acceso'}[category]}</h2><p>{{system:'Configura la apariencia y revisa la actividad disponible de Business OS.',account:'Administra tu perfil y tus preferencias sin salir del sistema operativo.',company:'Gestiona la identidad de la empresa, sus usuarios y sus roles.',apps:'Consulta los módulos habilitados, tu plan y la facturación.',security:'Revisa permisos y registros de auditoría de tu organización.'}[category]}</p></div>
      </section> : null}
      {(!query&&category==='personal')?null:<section className={styles.rows} aria-label={heading}>
        {shown.map(({to,title,description,icon:Icon})=><Link className={styles.row} key={to+'-'+title} to={to+'?seccion='+encodeURIComponent(entries.find(item=>item.to===to&&item.title===title)?.group || category)}>
          <Icon size={21} aria-hidden="true"/><span className={styles.rowCopy}><strong>{title}</strong><small>{description}</small></span><ChevronRight size={19} aria-hidden="true"/>
        </Link>)}
        {!shown.length?<p className={styles.empty}>{query?'No encontramos esa configuración. Prueba otra palabra.':'No hay opciones adicionales disponibles en esta sección.'}</p>:null}
      </section>}
      </>}
    </main>
  </div>;
}
