import {Search} from 'lucide-react';
import styles from './GoodsReceiptsMobile.module.css';

// Presentational only: filtering and opening the existing drawer stay in the page.
export default function GoodsReceiptsMobile({receipts, query, onQueryChange, onOpen}) {
  return <section className={styles.root} aria-label="Historial móvil de recepciones">
    <label className={styles.search}>
      <Search size={18} aria-hidden="true"/>
      <span className={styles.srOnly}>Buscar recepción, orden o proveedor</span>
      <input type="search" value={query} onChange={event=>onQueryChange(event.target.value)} placeholder="Buscar recepción o proveedor"/>
    </label>
    <p className={styles.count}>{receipts.length} {receipts.length===1?'recepción':'recepciones'}</p>
    <div className={styles.list}>
      {receipts.map(receipt=><button type="button" key={receipt.id} className={styles.card} onClick={()=>onOpen(receipt)} aria-label={`Ver detalle de recepción ${receipt.folio}`}>
        <span className={styles.top}><strong>{receipt.folio}</strong><span>{new Date(receipt.receivedAt).toLocaleDateString('es-MX')}</span></span>
        <span className={styles.supplier}>{receipt.purchaseOrder?.supplier?.commercialName||receipt.purchaseOrder?.supplier?.legalName||'Proveedor sin nombre'}</span>
        <span className={styles.meta}><span>OC {receipt.purchaseOrder?.folio||'—'}</span><span>{receipt.items?.length||0} partidas</span></span>
        <span className={styles.warehouse}>{receipt.warehouse?.name||'Sin almacén'}</span>
      </button>)}
      {!receipts.length?<p className={styles.empty}>{query?'No hay recepciones que coincidan con la búsqueda.':'Aún no hay recepciones registradas.'}</p>:null}
    </div>
  </section>;
}
