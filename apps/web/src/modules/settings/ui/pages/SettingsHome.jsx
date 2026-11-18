import {useState} from 'react';
import {Activity, Building2, ChevronRight, CreditCard, Home, Layers3, Monitor, Palette, Search, ShieldCheck, SlidersHorizontal, UserRound} from 'lucide-react';
import {Link} from 'react-router-dom';
import styles from './SettingsHome.module.css';

// OS settings are presentation-only: links point to existing, authorized routes.
const categories = [
  {id:'home',title:'Inicio',icon:Home},
  {id:'system',title:'Sistema',icon:Monitor},
  {id:'personal',title:'Personalización',icon:Palette},
  {id:'account',title:'Cuentas',icon:UserRound},
  {id:'company',title:'Empresa',icon:Building2},
  {id:'security',title:'Privacidad y seguridad',icon:ShieldCheck},
];
const entries = [
  {group:'system',to:'/preferencias',icon:SlidersHorizontal,title:'Preferencias',description:'Opciones personales y comportamiento de tu espacio de trabajo'},
  {group:'system',to:'/configuracion/modulos',icon:Layers3,title:'Aplicaciones',description:'Módulos y aplicaciones habilitadas para tu organización'},
  {group:'system',to:'/configuracion/actividad',icon:Activity,title:'Actividad y auditoría',description:'Historial de actividad y eventos disponibles'},
  {group:'personal',to:'/preferencias',icon:Palette,title:'Apariencia y preferencias',description:'Personaliza tu experiencia con las opciones disponibles'},
  {group:'account',to:'/perfil',icon:UserRound,title:'Mi perfil',description:'Consulta y administra tus datos personales'},
  {group:'account',to:'/configuracion/usuarios',icon:ShieldCheck,title:'Usuarios y roles',description:'Accesos y permisos de tu organización'},
  {group:'company',to:'/configuracion/empresa',icon:Building2,title:'Información de la empresa',description:'Identidad, moneda, zona horaria y datos fiscales'},
  {group:'company',to:'/configuracion/facturacion',icon:CreditCard,title:'Plan y facturación',description:'Información disponible de tu plan y facturación'},
  {group:'security',to:'/configuracion/usuarios',icon:ShieldCheck,title:'Permisos de acceso',description:'Control de usuarios y roles por empresa'},
  {group:'security',to:'/configuracion/actividad',icon:Activity,title:'Registro de actividad',description:'Consulta cambios y eventos de auditoría'},
];
export default function SettingsHome(){
  const [category,setCategory]=useState('system');
  const [search,setSearch]=useState('');
  const query=search.trim().toLocaleLowerCase('es');
  const shown=entries.filter(item=>(!query ? (category==='home'||item.group===category) : (item.title+' '+item.description).toLocaleLowerCase('es').includes(query)));
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
      <section className={styles.rows} aria-label={heading}>
        {shown.map(({to,title,description,icon:Icon})=><Link className={styles.row} key={to+'-'+title} to={to}>
          <Icon size={21} aria-hidden="true"/><span className={styles.rowCopy}><strong>{title}</strong><small>{description}</small></span><ChevronRight size={19} aria-hidden="true"/>
        </Link>)}
        {!shown.length?<p className={styles.empty}>No encontramos esa configuración. Prueba otra palabra.</p>:null}
      </section>
    </main>
  </div>;
}
