import {ArrowLeft, Search} from 'lucide-react';
import {useState} from 'react';
import styles from './WorkspaceOSRecordExplorer.module.css';

/**
 * Shared operational master-detail layout for Touch/Desktop OS.
 * The domain page owns fetching, filtering, permissions and business actions.
 * No API calls or record mutations happen inside this component.
 */
export default function WorkspaceOSRecordExplorer({
  title, description, eyebrow, records = [], selectedRecord,
  onSelect, renderListItem, renderDetail, query = '', onQueryChange,
  searchPlaceholder = 'Buscar registros', filters, actions, summary,
  emptyMessage = 'No hay registros con estos filtros.',
}) {
  const [mobileDetail, setMobileDetail] = useState(false);

  function selectRecord(record) {
    onSelect(record);
    setMobileDetail(true);
  }

  return (
    <section className={styles.explorer} aria-label={title}
      data-workspace-os-record-explorer="true"
      data-mobile-detail={mobileDetail ? 'true' : 'false'}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.eyebrow}>{eyebrow || 'Espacio de trabajo'}</span>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </header>
      {summary ? <div className={styles.summary} aria-label="Resumen operativo">{summary}</div> : null}
      <div className={styles.toolbar}>
        <label className={styles.search}>
          <Search size={18} aria-hidden="true"/>
          <span className={styles.srOnly}>Buscar en {title}</span>
          <input type="search" value={query} onChange={(event) => {setMobileDetail(false);onQueryChange?.(event.target.value);}}
            placeholder={searchPlaceholder}/>
        </label>
        {filters ? <div className={styles.filters}>{filters}</div> : null}
      </div>
      <div className={styles.panes}>
        <nav className={styles.list} aria-label={`Registros de ${title}`}>
          <div className={styles.paneLabel}><strong>Registros</strong><span>{records.length.toLocaleString('es-MX')}</span></div>
          <div className={styles.listScroll}>
            {records.length ? records.map((record) => (
              <button key={record.id} type="button"
                className={styles.listRow} data-selected={selectedRecord?.id === record.id ? 'true' : 'false'}
                aria-current={selectedRecord?.id === record.id ? 'true' : undefined}
                onClick={() => selectRecord(record)}>
                {renderListItem(record)}
              </button>
            )) : <p className={styles.empty} role="status">{emptyMessage}</p>}
          </div>
        </nav>
        <section className={styles.detail} aria-label={`Detalle de ${title}`}>
          <div className={styles.paneLabel}>
            <button type="button" className={styles.mobileBack} onClick={() => setMobileDetail(false)}
              aria-label={`Volver a registros de ${title}`}>
              <ArrowLeft size={18} aria-hidden="true"/> Volver al listado
            </button>
            <strong>Detalle del registro</strong>
          </div>
          <div className={styles.detailScroll}>
            {selectedRecord ? renderDetail(selectedRecord)
              : <p className={styles.empty}>Selecciona un registro para consultar sus detalles.</p>}
          </div>
        </section>
      </div>
    </section>
  );
}
