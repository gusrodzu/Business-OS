import {ContactRound, MessagesSquare} from 'lucide-react';
import styles from './SystemUtilityApp.module.css';

// A working, routed application shell without suggesting chat or directory
// backend functionality exists before these services are implemented.
const views = {
  messages:{
    Icon:MessagesSquare,title:'Mensajes',eyebrow:'COMUNICACIÓN INTERNA',
    description:'Un espacio para la comunicación entre colaboradores de la misma empresa.',
    next:'Las conversaciones y los grupos estarán disponibles cuando se integre el servicio de mensajería con permisos y aislamiento por empresa.',
  },
  directory:{
    Icon:ContactRound,title:'Directorio',eyebrow:'EQUIPO Y ORGANIZACIÓN',
    description:'El acceso central a las personas y los equipos de tu organización.',
    next:'La consulta de colaboradores y sus datos autorizados se incorporará desde los registros de usuarios y Recursos Humanos.',
  },
};

export default function SystemUtilityApp({kind='messages'}){
  const view=views[kind]||views.messages;
  const Icon=view.Icon;
  return <div className={styles.app} data-system-utility={kind}>
    <header className={styles.heading}>
      <div className={styles.icon}><Icon size={25} aria-hidden="true"/></div>
      <div><small>{view.eyebrow}</small><h1>{view.title}</h1><p>{view.description}</p></div>
    </header>
    <section className={styles.empty} aria-label={'Estado de '+view.title}>
      <Icon size={30} aria-hidden="true"/>
      <h2>Aplicación en preparación</h2>
      <p>{view.next}</p>
      <span className={styles.status}>Servicio aún no disponible</span>
    </section>
  </div>;
}
