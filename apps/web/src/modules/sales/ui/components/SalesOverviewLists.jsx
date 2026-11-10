import {ArrowRight} from 'lucide-react';
import {statusLabel} from '../../../../design-system/i18n/uiLanguage.js';
import {Badge} from '../../../../design-system/components';
import {formatSalesMoney as money, formatSalesDateTime as dateTime} from '../utils/salesDisplayFormatters';
import styles from '../pages/SalesEnterprise.module.css';
import SalesOverviewListCard from './SalesOverviewListCard';

/** Read-only overview lists. Navigation remains owned by the sales page. */
export default function SalesOverviewLists({quotes = [], receivables = [], onOpenQuotes, onOpenReceivables}) {
  return (
    <>
      <SalesOverviewListCard eyebrow="Cotizaciones" title="Propuestas recientes">
        {quotes.slice(0, 6).map((item) => (
          <button key={item.id} onClick={() => onOpenQuotes()}>
            <div>
              <strong>{item.folio}</strong>
              <span>{item.customer.commercialName || item.customer.legalName}</span>
            </div>
            <div>
              <strong>{money(item.total)}</strong>
              <Badge tone={item.status === 'ACCEPTED' ? 'success' : 'neutral'}>
                {statusLabel(item.status)}
              </Badge>
            </div>
          </button>
        ))}
      </SalesOverviewListCard>

      <SalesOverviewListCard
        eyebrow="Cobranza"
        title="Saldos próximos"
        action={
          <button onClick={() => onOpenReceivables()}>
            Abrir CxC <ArrowRight size={15} />
          </button>
        }
      >
        {receivables.slice(0, 6).map((item) => (
          <button key={item.id} onClick={() => onOpenReceivables()}>
            <div>
              <strong>{item.invoiceNumber}</strong>
              <span>{item.customer.commercialName || item.customer.legalName}</span>
            </div>
            <div>
              <strong>{money(Number(item.total) - Number(item.paidAmount))}</strong>
              <small>{dateTime(item.dueDate)}</small>
            </div>
          </button>
        ))}
      </SalesOverviewListCard>
    </>
  );
}
