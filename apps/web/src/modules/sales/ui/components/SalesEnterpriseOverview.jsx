import SalesPipelineFunnel from './SalesPipelineFunnel';
import SalesRecentActivity from './SalesRecentActivity';
import SalesOverviewLists from './SalesOverviewLists';
import {formatSalesMoney} from '../utils/salesDisplayFormatters';
import {stages} from '../../utils/prospectStages';
import styles from '../pages/SalesEnterprise.module.css';

/** Presentational overview: navigation and data fetching remain in the page. */
export default function SalesEnterpriseOverview({
  pipeline, activities, quotes, receivables,
  onOpenPipeline, onOpenQuotes, onOpenReceivables,
}) {
  return (
    <>
      <section className={styles.mainGrid}>
        <SalesPipelineFunnel pipeline={pipeline} stages={stages} formatMoney={formatSalesMoney} onOpenPipeline={onOpenPipeline} />
        <SalesRecentActivity activities={activities} />
      </section>
      <SalesOverviewLists
        quotes={quotes}
        receivables={receivables}
        onOpenQuotes={onOpenQuotes}
        onOpenReceivables={onOpenReceivables}
      />
    </>
  );
}
