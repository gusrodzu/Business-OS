import {formatSalesMoney as money, formatSalesDateTime as dateTime} from '../utils/salesDisplayFormatters';
import {stages} from '../../utils/prospectStages';
import styles from './SalesProspectDetailDrawer.module.css';

// The drawer owns navigation and mutations; these sections only render prospect data.
export default function SalesProspectDetailSections({selectedProspect, drawerTab}) {
  return <>
        {selectedProspect && drawerTab === 'summary' ? <div className={styles.uxDrawerGrid}>
          <div><span>Valor estimado</span><strong>{money(selectedProspect.estimatedValue)}</strong></div>
          <div><span>Probabilidad</span><strong>{selectedProspect.probability || 0}%</strong></div>
          <div><span>Origen</span><strong>{selectedProspect.source || 'Sin fuente'}</strong></div>
          <div><span>Próxima acción</span><strong>{selectedProspect.nextActionAt ? dateTime(selectedProspect.nextActionAt) : 'Sin programar'}</strong></div>
          <div className={styles.uxDrawerWide}><span>Notas</span><p>{selectedProspect.notes || 'Sin notas comerciales.'}</p></div>
        </div> : null}
        {selectedProspect && drawerTab === 'contact' ? <div className={styles.uxDrawerGrid}>
          <div><span>Contacto</span><strong>{selectedProspect.name}</strong></div>
          <div><span>Empresa</span><strong>{selectedProspect.companyName || 'Sin empresa'}</strong></div>
          <div><span>Correo</span><strong>{selectedProspect.email || 'Sin correo'}</strong></div>
          <div><span>Teléfono</span><strong>{selectedProspect.phone || 'Sin teléfono'}</strong></div>
        </div> : null}
        {selectedProspect && drawerTab === 'activity' ? <div className={styles.uxTimeline}>
          <article><i/><div><strong>Etapa actual</strong><p>{stages.find((entry) => entry.id === selectedProspect.stage)?.label || selectedProspect.stage} · {selectedProspect.probability || 0}% de probabilidad</p></div></article>
          <article><i/><div><strong>Próximo seguimiento</strong><p>{selectedProspect.nextActionAt ? dateTime(selectedProspect.nextActionAt) : 'No hay seguimiento programado.'}</p></div></article>
          <article><i/><div><strong>Registro comercial</strong><p>{selectedProspect.createdAt ? `Creado ${dateTime(selectedProspect.createdAt)}` : 'Oportunidad disponible en el pipeline.'}</p></div></article>
        </div> : null}
  </>;
}
