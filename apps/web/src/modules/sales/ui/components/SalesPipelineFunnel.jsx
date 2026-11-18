import {ArrowRight} from 'lucide-react';
import {Card} from '../../../../design-system/components';
import styles from './SalesPipelineFunnel.module.css';

/** Prepare display-only rows without changing pipeline values or stage ordering. */
function getPipelineRows(pipeline, stages) {
  const maxValue = Math.max(1, ...pipeline.map((item) => Number(item.value || 0)));
  const labelsByStage = new Map(stages.map((stage) => [stage.id, stage.label]));

  return pipeline
    .filter((item) => item.stage !== 'LOST')
    .map((item) => ({
      ...item,
      stageLabel: labelsByStage.get(item.stage),
      width: `${Math.max(5, (Number(item.value) / maxValue) * 100)}%`,
    }));
}

/** Read-only pipeline visualization; navigation and data ownership stay in the page. */
export default function SalesPipelineFunnel({pipeline, stages, formatMoney, onOpenPipeline}) {
  const rows = getPipelineRows(pipeline, stages);
  return (
    <Card className={styles.pipelineCard}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardEyebrow}>Pipeline</span>
          <h2>Valor por etapa comercial</h2>
        </div>
        <button onClick={onOpenPipeline}>Ver pipeline <ArrowRight size={15} /></button>
      </div>
      <div className={styles.funnel}>
        {rows.map((item) => (
            <div key={item.stage}>
              <div className={styles.funnelCopy}>
                <span>{item.stageLabel}</span>
                <strong>{formatMoney(item.value)}</strong>
                <small>{item.count} oportunidades</small>
              </div>
              <div className={styles.funnelTrack}>
                <i style={{width: item.width}} />
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
}
