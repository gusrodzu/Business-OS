import {BadgeDollarSign, Clock3, Target, TrendingUp, UserPlus} from 'lucide-react';
import KpiCard from '../../../../components/KpiCard';
import KpiInfo from '../../../../components/KpiInfo';
import styles from './CrmOverviewKpis.module.css';

const money = (value) => new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
}).format(Number(value || 0));

export default function CrmOverviewKpis({prospects, openProspects, weightedPipeline, winRate, won, lost, thisMonthLeads, overdueActivities, pendingActivities}) {
  return (
    <section className={styles.metrics}>
        <KpiCard>
          <Target />
          <span>Pipeline abierto</span>
          <KpiInfo title="Pipeline abierto">Suma del valor estimado de oportunidades que aún no están ganadas ni perdidas.</KpiInfo>
          <strong>{money(openProspects.reduce((sum, item) => sum + Number(item.estimatedValue || 0), 0))}</strong>
          <small>{openProspects.length} oportunidades activas</small>
        </KpiCard>
        <KpiCard>
          <BadgeDollarSign />
          <span>Pipeline ponderado</span>
          <KpiInfo title="Pipeline ponderado">Valor estimado multiplicado por la probabilidad de cierre de cada oportunidad.</KpiInfo>
          <strong>{money(weightedPipeline)}</strong>
          <small>Pronóstico comercial</small>
        </KpiCard>
        <KpiCard>
          <TrendingUp />
          <span>Tasa de cierre</span>
          <KpiInfo title="Tasa de cierre">Oportunidades ganadas sobre el total de oportunidades cerradas.</KpiInfo>
          <strong>{winRate}%</strong>
          <small>{won} ganadas · {lost} perdidas</small>
        </KpiCard>
        <KpiCard>
          <UserPlus />
          <span>Leads del mes</span>
          <KpiInfo title="Leads del mes">Prospectos creados durante el mes calendario actual.</KpiInfo>
          <strong>{thisMonthLeads}</strong>
          <small>{prospects.length} prospectos históricos</small>
        </KpiCard>
        <KpiCard>
          <Clock3 />
          <span>Seguimientos vencidos</span>
          <KpiInfo title="Seguimientos vencidos">Actividades con fecha límite pasada que todavía no han sido completadas.</KpiInfo>
          <strong>{overdueActivities.length}</strong>
          <small>{pendingActivities.length} actividades pendientes</small>
        </KpiCard>
      </section>
  );
}
