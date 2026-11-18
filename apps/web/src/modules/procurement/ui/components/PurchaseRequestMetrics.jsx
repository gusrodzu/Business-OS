import {Check, ClipboardList, Send} from 'lucide-react';
import KpiInfo from '../../../../components/KpiInfo';
import KpiGrid from '../../../../components/KpiGrid';
import KpiCard from '../../../../components/KpiCard';
import styles from './PurchaseRequestMetrics.module.css';

const money=(value)=>Number(value||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'});

/** Read-only summary. The page owns request data and its business operations. */
export default function PurchaseRequestMetrics({metrics}){
  return (
    <KpiGrid>
      <KpiCard><ClipboardList/><span>Total solicitudes</span><KpiInfo title="Solicitudes registradas">Cantidad total de solicitudes de compra.</KpiInfo><strong className={styles.metricValue}>{metrics.total}</strong><small>registro histórico</small></KpiCard>
      <KpiCard><Send/><span>Pendientes</span><KpiInfo title="Solicitudes pendientes">Solicitudes que todavía requieren revisión o aprobación.</KpiInfo><strong className={styles.metricValue}>{metrics.pending}</strong><small>requieren atención</small></KpiCard>
      <KpiCard><Check/><span>Aprobadas</span><KpiInfo title="Solicitudes autorizadas">Solicitudes aprobadas para continuar con una orden de compra.</KpiInfo><strong className={styles.metricValue}>{metrics.approved}</strong><small>listas para comprar</small></KpiCard>
      <KpiCard><ClipboardList/><span>Valor estimado</span><KpiInfo title="Importe solicitado">Valor estimado acumulado de las solicitudes de compra.</KpiInfo><strong className={styles.metricValue}>{money(metrics.value)}</strong><small>importe solicitado</small></KpiCard>
    </KpiGrid>
  );
}
