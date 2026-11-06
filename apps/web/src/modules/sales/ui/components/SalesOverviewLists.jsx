import {ArrowRight} from 'lucide-react';
import {statusLabel} from '../../../../design-system/i18n/uiLanguage.js';
import {Badge, Card} from '../../../../design-system/components';
import {formatSalesMoney as money, formatSalesDateTime as dateTime} from '../utils/salesDisplayFormatters';
import styles from '../pages/SalesEnterprise.module.css';

// Presentational overview lists. Navigation stays owned by the parent page.
export default function SalesOverviewLists({quotes = [], receivables = [], onOpenQuotes, onOpenReceivables}) {
  return (
      <section className={styles.secondaryGrid}>
        <Card className={styles.listCard}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardEyebrow}>Cotizaciones</span>
              <h2>Propuestas recientes</h2>
            </div>
          </div>
          <div className={styles.compactList}>
            {quotes.slice(0, 6).map((item) => (
              <button key={item.id} onClick={() => onOpenQuotes()}>
                <div>
                  <strong>{item.folio}</strong>
                  <span>
                    {item.customer.commercialName || item.customer.legalName}
                  </span>
                </div>
                <div>
                  <strong>{money(item.total)}</strong>
                  <Badge tone={item.status === 'ACCEPTED' ? 'success' : 'neutral'}>
                    {statusLabel(item.status)}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className={styles.listCard}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardEyebrow}>Cobranza</span>
              <h2>Saldos próximos</h2>
            </div>
            <button onClick={() => onOpenReceivables()}>
              Abrir CxC <ArrowRight size={15} />
            </button>
          </div>
          <div className={styles.compactList}>
            {receivables.slice(0, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => onOpenReceivables()}
              >
                <div>
                  <strong>{item.invoiceNumber}</strong>
                  <span>
                    {item.customer.commercialName || item.customer.legalName}
                  </span>
                </div>
                <div>
                  <strong>
                    {money(Number(item.total) - Number(item.paidAmount))}
                  </strong>
                  <small>{dateTime(item.dueDate)}</small>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </section>
  );
}
