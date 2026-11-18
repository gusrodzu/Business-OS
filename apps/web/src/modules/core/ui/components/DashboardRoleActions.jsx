import {ChevronRight} from 'lucide-react';
import styles from './DashboardRoleActions.module.css';

export default function DashboardRoleActions({roleName, actions, onNavigate}) {
  return (
    <section className={styles.roleFocus} data-ux-v19="role-home" data-mobile-section="role">
      <div><span>MI ESPACIO DE TRABAJO</span><strong>Accesos para {roleName}</strong></div>
      <nav>{actions.map((item) => <button type="button" key={item.to} onClick={() => onNavigate(item.to)}>{item.label}<ChevronRight size={14} /></button>)}</nav>
    </section>
  );
}
