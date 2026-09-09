import {useState} from 'react';
import {
  Activity, BarChart3, BellRing, Building2, CreditCard, FileText, Gauge, Headphones,
  KeyRound, Layers3, LogOut, Menu, Moon, Network, PlugZap, RefreshCw, Settings,
  ShieldCheck, Sparkles, Sun, Users, WalletCards, X,
} from 'lucide-react';
import {Link, Outlet, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext';
import {useTheme} from '../framework/ThemeContext';
import styles from './PlatformShell.module.css';

const groups = [
  {label:'NEGOCIO', items:[
    {tab:'overview',label:'Resumen',icon:BarChart3},{tab:'companies',label:'Empresas',icon:Building2},
    {tab:'subscriptions',label:'Suscripciones',icon:WalletCards},{tab:'renewals',label:'Renovaciones',icon:RefreshCw},
    {tab:'trials',label:'Trials',icon:Sparkles},{tab:'billing',label:'Facturación',icon:FileText},
  ]},
  {label:'CLIENTES', items:[
    {tab:'users',label:'Usuarios globales',icon:Users},{tab:'health',label:'Health Score',icon:Activity},{tab:'support',label:'Soporte',icon:Headphones},
  ]},
  {label:'PRODUCTO', items:[
    {tab:'plans',label:'Planes',icon:CreditCard},{tab:'modules',label:'Módulos & Features',icon:Layers3},{tab:'integrations',label:'Integraciones',icon:PlugZap},
  ]},
  {label:'CRECIMIENTO', items:[{tab:'revenue',label:'Revenue',icon:Gauge}]},
  {label:'PLATAFORMA', items:[
    {tab:'system',label:'Sistema',icon:Network},{tab:'security',label:'Seguridad',icon:ShieldCheck},{tab:'audit',label:'Auditoría',icon:KeyRound},{tab:'settings',label:'Configuración',icon:Settings},
  ]},
];

export default function PlatformShell(){
  const {user,logout}=useAuth(); const {resolvedTheme,toggleTheme}=useTheme(); const location=useLocation(); const navigate=useNavigate();
  const [mobileOpen,setMobileOpen]=useState(false); const activeTab=new URLSearchParams(location.search).get('tab')||'overview';
  const initials=`${user?.firstName?.[0]??'S'}${user?.lastName?.[0]??'A'}`.toUpperCase();
  async function signOut(){await logout();navigate('/login',{replace:true});}
  return <div className={styles.shell}>
    <aside className={`${styles.sidebar} ${mobileOpen?styles.mobileOpen:''}`}>
      <div className={styles.brandRow}><Link className={styles.brand} to="/admin-saas" onClick={()=>setMobileOpen(false)}><span className={styles.brandMark}>🐝</span><span><strong>BuzzBee</strong><small>Control Plane</small></span></Link><button className={styles.mobileClose} onClick={()=>setMobileOpen(false)} aria-label="Cerrar menú"><X size={20}/></button></div>
      <div className={styles.securityBadge}><ShieldCheck size={16}/><span>SUPER ADMIN · MFA</span></div>
      <nav className={styles.nav} aria-label="Administración global de BuzzBee">{groups.map(group=><div key={group.label}><span className={styles.navLabel}>{group.label}</span>{group.items.map(({tab,label,icon:Icon})=><Link key={tab} to={`/admin-saas?tab=${tab}`} onClick={()=>setMobileOpen(false)} className={`${styles.navItem} ${activeTab===tab?styles.active:''}`}><Icon size={18}/><span>{label}</span></Link>)}</div>)}</nav>
      <div className={styles.sidebarFooter}><div className={styles.account}><span className={styles.avatar}>{initials}</span><div><strong>{user?.fullName||'Super Admin'}</strong><small>{user?.email||'Cuenta de plataforma'}</small></div></div><button onClick={signOut}><LogOut size={17}/><span>Cerrar sesión</span></button></div>
    </aside>
    {mobileOpen?<button className={styles.backdrop} onClick={()=>setMobileOpen(false)} aria-label="Cerrar navegación"/>:null}
    <section className={styles.workspace}><header className={styles.topbar}><div className={styles.topbarLeft}><button className={styles.menuButton} onClick={()=>setMobileOpen(true)} aria-label="Abrir navegación"><Menu size={20}/></button><div><span>BUZZBEE SAAS</span><strong>Control global de plataforma</strong></div></div><div className={styles.topbarRight}><span className={styles.secureSession}><ShieldCheck size={15}/> Sesión segura</span><button className={styles.iconButton} onClick={toggleTheme} aria-label="Cambiar tema">{resolvedTheme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button><button className={styles.profileButton} type="button"><span>{initials}</span><div><strong>{user?.fullName||'Super Admin'}</strong><small>Super Admin SaaS</small></div></button></div></header><main className={styles.content} data-md3-module="platform"><Outlet/></main></section>
  </div>;
}
