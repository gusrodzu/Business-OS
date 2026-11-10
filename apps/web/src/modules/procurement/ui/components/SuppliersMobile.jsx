import {ChevronRight, Search} from 'lucide-react';
import styles from './SuppliersMobile.module.css';

// Vista presentacional: la página mantiene búsqueda, selección y mutaciones.
export default function SuppliersMobile({items, query, onQueryChange, onOpen}) {
  return <section className={styles.root} aria-label="Directorio móvil de proveedores">
    <label className={styles.search}>
      <Search size={18} aria-hidden="true"/>
      <span className={styles.srOnly}>Buscar proveedores</span>
      <input type="search" value={query} onChange={event=>onQueryChange(event.target.value)} placeholder="Buscar nombre, código o RFC"/>
    </label>
    <p className={styles.count}>{items.length} proveedores</p>
    <div className={styles.list}>
      {items.map(item=><button type="button" className={styles.card} key={item.id} onClick={()=>onOpen(item)}>
        <span className={styles.identity}>
          <strong>{item.commercialName||item.legalName}</strong>
          <small>{item.code} · {item.taxId||'Sin RFC'}</small>
          <span className={styles.meta}>{item.contactName||'Sin contacto'} · {item.paymentTerms||0} días de crédito</span>
        </span>
        <span className={styles.end}>
          <span className={item.active?styles.active:styles.inactive}>{item.active?'Activo':'Inactivo'}</span>
          <ChevronRight size={18} aria-hidden="true"/>
        </span>
      </button>)}
      {items.length===0?<p className={styles.empty}>No se encontraron proveedores.</p>:null}
    </div>
  </section>;
}
