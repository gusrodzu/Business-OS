import {Check, Plus, X} from 'lucide-react';
import {Button, Switch} from '../../../../design-system/components';
import {METRIC_CATALOG} from '../../../../components/honeycombPreferences';
import styles from './DashboardCustomizer.module.css';

export const widgetCatalog = [
  {id: 'requests', label: 'Solicitudes recientes', description: 'Últimas solicitudes de compra.'},
  {id: 'purchaseChart', label: 'Compras mensuales', description: 'Tendencia anual de compras.'},
  {id: 'quickActions', label: 'Acciones rápidas', description: 'Atajos frecuentes del ERP.'},
  {id: 'stock', label: 'Alertas de inventario', description: 'Productos con stock crítico.'},
  {id: 'calendar', label: 'Agenda financiera', description: 'Próximos cobros y pagos.'},
  {id: 'team', label: 'Actividad de usuarios', description: 'Usuarios activos recientemente.'},
  {id: 'spend', label: 'Inventario por categoría', description: 'Distribución del valor de inventario.'},
];

export default function DashboardCustomizer({preferences, onClose, onToggleWidget, onToggleMetric, onCompactChange, onReset}) {
  return (
    <div className={styles.customizerOverlay} role="presentation" onMouseDown={onClose}>
      <aside className={styles.customizer} role="dialog" aria-modal="true" aria-labelledby="customizer-title" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div><span>Panel principal</span><h2 id="customizer-title">Personalizar experiencia</h2><p>Elige qué información quieres ver al iniciar.</p></div>
          <button type="button" onClick={onClose} aria-label="Cerrar personalización"><X size={19} /></button>
        </header>
        <section className={styles.customizerSection}>
          <div className={styles.settingRow}>
            <div><strong>Vista compacta</strong><small>Reduce espacios para mostrar más información.</small></div>
            <Switch checked={preferences.compact} onChange={(event) => onCompactChange(event.target.checked)} />
          </div>
        </section>
        <section className={styles.customizerSection} aria-labelledby="dashboard-metric-catalog-title">
          <h3 id="dashboard-metric-catalog-title">Tarjetas de indicadores</h3>
          <p className={styles.metricDescription}>
            Agrega o quita las tarjetas de indicadores del dashboard.
          </p>
          <span className={styles.metricCounter} role="status">
            {preferences.selectedMetrics.length} de {METRIC_CATALOG.length} indicadores seleccionados
          </span>
          <div className={styles.metricOptions}>
            {METRIC_CATALOG.map(metric => {
              const active = preferences.selectedMetrics.includes(metric.id);
              return (
                <button type="button" data-ui-surface="card" key={metric.id}
                  className={`${styles.metricOption} ${active ? styles.metricSelected : ''}`}
                  aria-pressed={active}
                  onClick={() => onToggleMetric(metric.id)}>
                  <span className={styles.metricIcon} aria-hidden="true">
                    {active ? <Check size={16}/> : <Plus size={16}/>}
                  </span>
                  <span><strong>{metric.label}</strong><small>{metric.description}</small></span>
                  <span className={styles.metricGroup}>{metric.group}</span>
                </button>
              );
            })}
          </div>
        </section>
        <section className={styles.customizerSection}>
          <h3>Widgets visibles</h3>
          <div className={styles.widgetOptions}>
            {widgetCatalog.map((widget) => {
              const active = !preferences.hiddenWidgets.includes(widget.id);
              return (
                <button type="button" className={active ? styles.widgetOptionActive : ''} aria-pressed={active} onClick={() => onToggleWidget(widget.id)} key={widget.id}>
                  <span>{active ? <Check size={15} /> : null}</span>
                  <div><strong>{widget.label}</strong><small>{widget.description}</small></div>
                </button>
              );
            })}
          </div>
        </section>
        <footer><Button variant="ghost" onClick={onReset}>Restablecer</Button><Button onClick={onClose}>Guardar cambios</Button></footer>
      </aside>
    </div>
  );
}
