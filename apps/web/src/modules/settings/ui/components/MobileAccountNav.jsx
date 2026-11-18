import {ChevronRight, SlidersHorizontal, UserRound} from 'lucide-react';
import {NavLink} from 'react-router-dom';
import styles from './MobileAccountNav.module.css';

// Shared mobile account navigation. Routes remain protected by the existing router.
const items = [
  {to:'/perfil', label:'Mi perfil', icon:UserRound},
  {to:'/preferencias', label:'Preferencias', icon:SlidersHorizontal},
];

export default function MobileAccountNav() {
  return (
    <nav className={styles.nav} aria-label="Secciones de mi cuenta">
      {items.map(({to,label,icon:Icon}) => (
        <NavLink key={to} to={to} end
          className={({isActive}) => `${styles.link} ${isActive ? styles.active : ''}`}
          aria-label={label}>
          <Icon size={17} aria-hidden="true"/>
          <span>{label}</span>
          <ChevronRight size={15} className={styles.arrow} aria-hidden="true"/>
        </NavLink>
      ))}
    </nav>
  );
}
