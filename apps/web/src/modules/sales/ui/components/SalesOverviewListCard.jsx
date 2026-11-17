import {Card} from '../../../../design-system/components';
import styles from '../pages/SalesEnterprise.module.css';

/** Shared frame for the two read-only commercial overview lists. */
export default function SalesOverviewListCard({eyebrow, title, action, children}) {
  return (
    <Card className={styles.listCard}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardEyebrow}>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      <div className={styles.compactList}>{children}</div>
    </Card>
  );
}
