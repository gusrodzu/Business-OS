import {ChevronRight, GripVertical} from 'lucide-react';
import styles from './Dashboard.module.css';

function WidgetHeader({title, description, badge, compact = false, onDetail}) {
  return (
    <header className={`${styles.cardHeader} ${compact ? styles.compactHeader : ''}`}>
      <span className={styles.dragHandle} aria-hidden="true"><GripVertical size={15} /></span>
      <div><h2>{title}</h2><p>{description}</p></div>
      {badge || (onDetail ? <button type="button" onClick={onDetail}>Ver detalle <ChevronRight size={15} /></button> : null)}
    </header>
  );
}

export default WidgetHeader;
