import {Building2, Edit3, Eye, FileUp, Mail, MapPin, Phone, Plus, ShoppingCart, Trash2} from 'lucide-react';
import {Badge, Button} from '../../../../design-system/components';
import WorkspaceOSRecordExplorer from '../../../../layout/workspace-os/WorkspaceOSRecordExplorer';
import osStyles from '../../../../layout/workspace-os/WorkspaceOSRecordExplorer.module.css';
import styles from './SuppliersOS.module.css';

const displayName = supplier => supplier.commercialName || supplier.legalName || 'Proveedor sin nombre';

/**
 * Suppliers OS is presentational: the procurement page remains responsible for
 * tenant-scoped reads, CRUD, permissions, confirmations and the existing drawers.
 * Selected records and form actions are reused, never duplicated here.
 */
export default function SuppliersOS({
  records = [], selectedSupplier, onSelect, query, onQueryChange,
  status, onStatusChange, allCount, activeCount, averageCredit,
  onCreate, onImport, onViewFull, onEdit, onToggle, onRemove, onOpenOrders,
  onResetFilters,
}) {
  return (
    <div className={styles.root} data-os-suppliers-workspace="true">
      <WorkspaceOSRecordExplorer
        eyebrow="Compras / Proveedores"
        title="Directorio de proveedores"
        description="Gestiona tus proveedores, contactos, información fiscal y condiciones de compra."
        records={records}
        selectedRecord={selectedSupplier}
        onSelect={onSelect}
        query={query}
        onQueryChange={onQueryChange}
        searchPlaceholder="Buscar proveedor, código, RFC o contacto"
        emptyMessage="No hay proveedores para estos filtros."
        actions={<>
          <Button variant="secondary" icon={FileUp} onClick={onImport}>Importar</Button>
          <Button icon={Plus} onClick={onCreate}>Nuevo proveedor</Button>
        </>}
        summary={<>
          <span>Total <strong>{allCount}</strong></span>
          <span>Activos <strong>{activeCount}</strong></span>
          <span>Crédito promedio <strong>{averageCredit} días</strong></span>
        </>}
        filters={<><select value={status} onChange={event => onStatusChange(event.target.value)}
          aria-label="Filtrar proveedores por estado">
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        {(status !== 'all' || query.trim()) ? (
          <button type="button" onClick={onResetFilters}>Limpiar filtros</button>
        ) : null}</>}
        renderListItem={supplier => (
          <>
            <span className={osStyles.rowHead}>
              <strong>{displayName(supplier)}</strong>
              <Badge tone={supplier.active ? 'success' : 'neutral'}>
                {supplier.active ? 'Activo' : 'Inactivo'}
              </Badge>
            </span>
            <span className={osStyles.rowMeta}>{supplier.code || 'Sin código'} · {supplier.taxId || 'Sin RFC'}</span>
            <span className={osStyles.rowMeta}>{supplier.contactName || 'Sin contacto'} · {Number(supplier.paymentTerms || 0)} días de crédito</span>
          </>
        )}
        renderDetail={supplier => (
          <>
            <div className={osStyles.recordTitle}>
              <div>
                <h2>{displayName(supplier)}</h2>
                <p>{supplier.code || 'Sin código'} · {supplier.legalName || 'Razón social no registrada'}</p>
              </div>
              <Badge tone={supplier.active ? 'success' : 'neutral'}>
                {supplier.active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <dl className={osStyles.detailGrid}>
              <div><dt>Razón social</dt><dd>{supplier.legalName || '—'}</dd></div>
              <div><dt>RFC</dt><dd>{supplier.taxId || '—'}</dd></div>
              <div><dt>Código</dt><dd>{supplier.code || '—'}</dd></div>
              <div><dt>Días de crédito</dt><dd>{Number(supplier.paymentTerms || 0)}</dd></div>
            </dl>
            <h3 className={osStyles.sectionTitle}><Building2 size={17} aria-hidden="true"/> Datos de contacto</h3>
            <dl className={styles.contactList}>
              <div><dt><Building2 size={17} aria-hidden="true"/> Responsable</dt><dd>{supplier.contactName || 'Sin contacto'}</dd></div>
              <div><dt><Mail size={17} aria-hidden="true"/> Correo</dt><dd>{supplier.email || 'No registrado'}</dd></div>
              <div><dt><Phone size={17} aria-hidden="true"/> Teléfono</dt><dd>{supplier.phone || 'No registrado'}</dd></div>
              <div><dt><MapPin size={17} aria-hidden="true"/> Dirección</dt><dd>{supplier.address || 'Sin dirección registrada'}</dd></div>
            </dl>
            <div className={osStyles.detailActions}>
              <Button variant="secondary" icon={Eye} onClick={() => onViewFull(supplier)}>
                Ver ficha completa
              </Button>
              <Button icon={Edit3} onClick={() => onEdit(supplier)}>Editar proveedor</Button>
              <Button variant="secondary" onClick={() => onToggle(supplier)}>
                {supplier.active ? 'Desactivar' : 'Activar'} proveedor
              </Button>
              <Button variant="secondary" icon={ShoppingCart} onClick={onOpenOrders}>
                Ver órdenes
              </Button>
              <button className={styles.deleteButton} type="button" onClick={() => onRemove(supplier)}
                aria-label={`Eliminar proveedor ${supplier.legalName || displayName(supplier)}`}>
                <Trash2 size={17} aria-hidden="true"/> Eliminar
              </button>
            </div>
          </>
        )}
      />
    </div>
  );
}
