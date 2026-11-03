import {ArrowRight} from 'lucide-react';
import {Card} from '../../../../design-system/components';
import styles from './SalesPipelineFunnel.module.css';

/** Read-only pipeline visualization; navigation and data ownership stay in the page. */
export default function SalesPipelineFunnel({pipeline, stages, formatMoney, onOpenPipeline}) {
  const maxValue = Math.max(1, ...pipeline.map((item) => Number(item.value || 0)));
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
        {pipeline.filter((item) => item.stage !== 'LOST').map((item) => {
          const stage = stages.find((entry) => entry.id === item.stage);
          return (
            <div key={item.stage}>
              <div className={styles.funnelCopy}>
                <span>{stage?.label}</span>
                <strong>{formatMoney(item.value)}</strong>
                <small>{item.count} oportunidades</small>
              </div>
              <div className={styles.funnelTrack}>
                <i style={{width: `${Math.max(5, (Number(item.value) / maxValue) * 100)}%`}} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
