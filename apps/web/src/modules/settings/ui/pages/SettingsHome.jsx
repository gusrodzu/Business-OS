import {Activity, Building2, CreditCard, Layers3, ShieldCheck, SlidersHorizontal} from 'lucide-react';
import {Link} from 'react-router-dom';
import {ModuleHeader} from '../../../../components/module-system';
import styles from './SettingsHome.module.css';

const sections = [
  {to:'/configuracion/empresa', icon:Building2, title:'Empresa', description:'Datos fiscales, identidad, moneda, zona horaria y configuración general de tu empresa.'},
  {to:'/configuracion/usuarios', icon:ShieldCheck, title:'Usuarios y roles', description:'Administra accesos, roles y permisos únicamente dentro de tu empresa.'},
  {to:'/configuracion/modulos', icon:Layers3, title:'Aplicaciones', description:'Consulta y administra los módulos habilitados para tu organización.'},
  {to:'/configuracion/actividad', icon:Activity, title:'Actividad y auditoría', description:'Revisa cambios, accesos y actividad relevante de los usuarios de tu empresa.'},
  {to:'/configuracion/facturacion', icon:CreditCard, title:'Plan y facturación', description:'Consulta la información de facturación disponible para tu organización.', optional:true},
];

export default function SettingsHome(){
  return <div className={styles.page}>
    <ModuleHeader
      eyebrow="Business OS · Configuración"
      title="Configuración"
      description="Administra la organización, accesos y preferencias de tu espacio de trabajo desde un solo lugar."
    />
    <section className={styles.grid} aria-label="Áreas de configuración">
      {sections.map(({to,icon:Icon,title,description,optional})=><Link key={to} to={to} className={styles.card}>
        <span className={styles.icon}><Icon size={21}/></span>
        <div><strong>{title}</strong><p>{description}</p>{optional?<small>La disponibilidad depende del plan contratado.</small>:null}</div>
        <span className={styles.arrow}>→</span>
      </Link>)}
    </section>
    <section className={styles.note}>
      <span className={styles.noteIcon}><SlidersHorizontal size={18}/></span>
      <div><strong>Configuración aislada por empresa</strong><p>Los cambios realizados aquí sólo afectan a tu organización. La configuración global de BuzzBee pertenece exclusivamente al Super Admin.</p></div>
    </section>
  </div>;
}
