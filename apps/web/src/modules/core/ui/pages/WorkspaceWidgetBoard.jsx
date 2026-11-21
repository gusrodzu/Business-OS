import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Activity, ArrowRight, Image as ImageIcon, LayoutDashboard,
  PackagePlus, ShoppingBag, ShoppingCart, FolderPlus,
  TrendingUp, Zap, GripVertical, ArrowUp, ArrowDown, RotateCcw, MoveDiagonal, Check, SlidersHorizontal,
} from 'lucide-react';
import {wallpaperBackground} from '../../../../layout/os/workspaceWallpapers';
import styles from './WorkspaceWidgetBoard.module.css';
import {
  WIDGET_IDS, WIDGET_SIZES, DEFAULT_WIDGET_SIZES, normalizeWidgetSizes,
  normalizeWidgetOrder, nudgeWidget, reorderWidget, sizeFromDrag,
  clampWidgetSizeIndex,
} from './workspaceWidgetLayout';

const SIZES = WIDGET_SIZES;
const SIZE_LABELS = {compact:'Compacto', medium:'Mediano', expanded:'Expandido'};
const WIDGETS = [
  {id:'control', title:'Centro de control', Icon:LayoutDashboard},
  {id:'wallpaper', title:'Wallpaper Studio', Icon:ImageIcon},
  {id:'activity', title:'Actividad reciente', Icon:Activity},
  {id:'shortcuts', title:'Accesos rápidos', Icon:Zap},
];
const QUICK_ACTIONS = [
  {label:'Ir a Ventas', path:'/ventas', Icon:ShoppingBag},
  {label:'Ir a Compras', path:'/compras', Icon:ShoppingCart},
  {label:'Inventario', path:'/inventario', Icon:PackagePlus},
  {label:'Proyectos', path:'/proyectos', Icon:FolderPlus},
];

function readLayout(key, fallback) {
  if (!key || typeof window === 'undefined') return fallback;
  try { return JSON.parse(window.localStorage.getItem(key) || 'null'); }
  catch { return fallback; }
}

function readSizes(key) {
  return normalizeWidgetSizes(readLayout(key, DEFAULT_WIDGET_SIZES));
}

function readOrder(key) {
  return normalizeWidgetOrder(readLayout(key && key + ':order', WIDGET_IDS));
}

function PurchaseSparkline({purchases}) {
  const values = purchases.slice(-6).map((row) => Math.max(0, Number(row.total) || 0));
  if (!values.length) return <p className={styles.empty}>Sin compras registradas en el periodo.</p>;
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = 12 + index * (296 / Math.max(1, values.length - 1));
    const y = 97 - value / max * 70;
    return x + ',' + y;
  }).join(' ');
  return (
    <svg className={styles.sparkline} viewBox="0 0 320 115" role="img"
      aria-label="Tendencia de compras de los últimos seis registros disponibles">
      <title>Compras mensuales</title>
      <path d="M12 27H308 M12 62H308 M12 97H308"
        fill="none" stroke="#e4e7ed" strokeWidth="1"/>
      <polyline points={points} fill="none" stroke="#7564de" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round"/>
      {values.length === 1
        ? <circle cx="12" cy={97 - values[0] / max * 70} r="4" fill="#7564de"/>
        : null}
    </svg>
  );
}

function WidgetContent({
  id, metrics, purchases, wallpaper, notifications, recentRequests,
  agenda, criticalStock, onOpenWallpaper, onOpenControlCenter,
}) {
  const navigate = useNavigate();

  if (id === 'control') {
    return (
      <div className={styles.widgetBody}>
        <div className={styles.metrics}>
          {metrics.slice(0, 2).map((metric, index) => (
            <div className={styles.metric} key={metric.id || index}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.change}</small>
            </div>
          ))}
          {!metrics.length
            ? <p className={styles.empty}>Elige tus indicadores en el Centro de control.</p>
            : null}
        </div>
        <div className={styles.trendTitle}>
          <span><TrendingUp size={16} aria-hidden="true"/> Compras mensuales</span>
          <small>Últimos seis registros</small>
        </div>
        <PurchaseSparkline purchases={purchases}/>
        <button type="button" className={styles.textAction}
          onClick={onOpenControlCenter}>Abrir panel <ArrowRight size={15} aria-hidden="true"/></button>
      </div>
    );
  }

  if (id === 'wallpaper') {
    return (
      <div className={styles.widgetBody}>
        <button type="button" onClick={onOpenWallpaper} className={styles.wallpaperPreview}
          style={{backgroundImage:wallpaperBackground(wallpaper)}}
          aria-label="Abrir personalización del escritorio">
          <span className={styles.previewOverlay}>Personalizar fondo <ArrowRight size={15} aria-hidden="true"/></span>
        </button>
        <p className={styles.wallpaperHint}>Tu espacio, tu fondo. Personaliza tu escritorio empresarial.</p>
        <button type="button" className={styles.wallpaperAction} onClick={onOpenWallpaper}>
          Personalizar escritorio <ArrowRight size={15} aria-hidden="true"/>
        </button>
      </div>
    );
  }

  if (id === 'activity') {
    const notices = notifications.slice(0, 3);
    const rows = notices.length
      ? notices.map((item, index) => ({key:item.id || index, label:item.title || item.message || 'Aviso operativo'}))
      : recentRequests.slice(0, 3).map((item, index) => ({
        key:item.id || index,
        label:item.folio ? 'Revisar solicitud ' + item.folio : 'Revisar solicitud de compras',
      }));
    return (
      <div className={styles.widgetBody}>
        <div className={styles.activityList}>
          {rows.map((item) => (
            <div key={item.key} className={styles.activityRow}>
              <span className={styles.activityBullet} aria-hidden="true"/>
              <span>{item.label}</span>
            </div>
          ))}
          {!rows.length && Number(criticalStock) > 0 ? (
            <button type="button" className={styles.activityRow}
              onClick={() => navigate('/inventario/existencias')}>
              <span className={styles.activityBullet} aria-hidden="true"/>
              <span>{criticalStock} artículos con stock crítico</span>
            </button>
          ) : null}
          {!rows.length && !(Number(criticalStock) > 0)
            ? <p className={styles.empty}>Sin avisos ni solicitudes recientes.</p> : null}
        </div>
        <button type="button" className={styles.textAction}
          onClick={() => navigate('/tareas')}>Ver tareas <ArrowRight size={15} aria-hidden="true"/></button>
      </div>
    );
  }

  return (
    <div className={styles.widgetBody}>
      <div className={styles.quickGrid}>
        {QUICK_ACTIONS.map(({label, path, Icon}) => (
          <button type="button" key={path} onClick={() => navigate(path)}>
            <Icon size={20} aria-hidden="true"/>
            <span>{label}</span>
          </button>
        ))}
      </div>
      {agenda.length ? (
        <button type="button" className={styles.textAction}
          onClick={() => navigate('/finanzas/flujo-efectivo')}>
          Ver {agenda.length} vencimientos próximos <ArrowRight size={15} aria-hidden="true"/>
        </button>
      ) : null}
    </div>
  );
}

/**
 * Editable widget studio: drag to reorder, snap-resize from the corner,
 * or use explicit keyboard/touch-safe controls.
 * Saves presentation preferences only and preserves the existing business data.
 */
export default function WorkspaceWidgetBoard({
  storageKey, metrics = [], purchases = [], notifications = [],
  recentRequests = [], agenda = [], criticalStock = 0,
  wallpaper, onOpenWallpaper, onOpenControlCenter,
}) {
  const [sizes, setSizes] = useState(() => readSizes(storageKey));
  const [order, setOrder] = useState(() => readOrder(storageKey));
  const [editing, setEditing] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);
  const [status, setStatus] = useState('');
  const activeDragId = useRef(null);
  const touchReorder = useRef(null);
  const resizeGesture = useRef(null);

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(sizes));
      window.localStorage.setItem(storageKey + ':order', JSON.stringify(order));
    } catch {
      // Storage may be unavailable, but widgets remain usable in this session.
    }
  }, [sizes, order, storageKey]);

  function resizeWidget(id, size) {
    if (!WIDGET_IDS.includes(id) || !SIZES.includes(size)) return;
    setSizes((previous) => ({...previous, [id]:size}));
    setStatus(WIDGETS.find((widget) => widget.id === id)?.title + ': ' + SIZE_LABELS[size]);
  }

  function moveWidget(id, direction) {
    const index = order.indexOf(id);
    if (index + direction < 0 || index + direction >= order.length) return;
    setOrder((previous) => nudgeWidget(previous, id, direction));
    setStatus(WIDGETS.find((widget) => widget.id === id)?.title + ' reubicado');
  }

  function startDrag(event, id) {
    if (!editing) {
      event.preventDefault();
      return;
    }
    activeDragId.current = id;
    setDraggingId(id);
    setDropTargetId(null);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
  }

  function dropBefore(event, targetId) {
    if (!editing || !activeDragId.current) return;
    event.preventDefault();
    const draggedId = activeDragId.current;
    activeDragId.current = null;
    setDraggingId(null);
    setDropTargetId(null);
    setOrder((previous) => reorderWidget(previous, draggedId, targetId));
    if (draggedId !== targetId) setStatus('Orden del escritorio actualizado');
  }

  function findWidgetUnderPointer(clientX, clientY, grip) {
    const board = grip.closest('[data-os-widget-board]');
    const target = document.elementFromPoint(clientX, clientY)?.closest('[data-widget-id]');
    return target && board?.contains(target) ? target.getAttribute('data-widget-id') : null;
  }

  function beginTouchReorder(event, id) {
    if (!editing || event.pointerType === 'mouse') return;
    touchReorder.current = {id, pointerId:event.pointerId};
    activeDragId.current = id;
    setDraggingId(id);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function moveTouchReorder(event) {
    if (!touchReorder.current || touchReorder.current.pointerId !== event.pointerId) return;
    const hovered = findWidgetUnderPointer(event.clientX, event.clientY, event.currentTarget);
    setDropTargetId(hovered && hovered !== touchReorder.current.id ? hovered : null);
  }

  function finishTouchReorder(event) {
    const gesture = touchReorder.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const targetId = event.type === 'pointercancel' ? null :
      findWidgetUnderPointer(event.clientX, event.clientY, event.currentTarget);
    touchReorder.current = null;
    activeDragId.current = null;
    setDraggingId(null);
    setDropTargetId(null);
    if (targetId && targetId !== gesture.id) {
      setOrder((previous) => reorderWidget(previous, gesture.id, targetId));
      setStatus('Orden del escritorio actualizado');
    }
  }

  function beginResize(event, id) {
    if (!editing || event.button !== 0) return;
    resizeGesture.current = {
      id, pointerId:event.pointerId, x:event.clientX, y:event.clientY,
      initial:sizes[id], final:sizes[id],
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function moveResize(event) {
    const gesture = resizeGesture.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const next = sizeFromDrag(gesture.initial, event.clientX - gesture.x, event.clientY - gesture.y);
    if (next !== gesture.final) {
      gesture.final = next;
      setSizes((previous) => ({...previous, [gesture.id]:next}));
    }
  }

  function finishResize(event) {
    const gesture = resizeGesture.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    resizeGesture.current = null;
    if (gesture.final !== gesture.initial) {
      setStatus(WIDGETS.find((widget) => widget.id === gesture.id)?.title
        + ': ' + SIZE_LABELS[gesture.final]);
    }
  }

  function resizeWithKeyboard(event, id) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = ['ArrowUp', 'ArrowRight'].includes(event.key) ? 1 : -1;
    const index = SIZES.indexOf(sizes[id]);
    resizeWidget(id, SIZES[clampWidgetSizeIndex(index + direction)]);
  }

  function resetLayout() {
    setSizes({...DEFAULT_WIDGET_SIZES});
    setOrder([...WIDGET_IDS]);
    setDropTargetId(null);
    setStatus('Distribución original restaurada');
  }

  return (
    <div className={styles.studio} data-widget-editing={editing ? 'true' : 'false'}>
      <div className={styles.studioToolbar}>
        <div className={styles.studioLabel}>
          <span className={styles.studioEyebrow}>TU ESCRITORIO</span>
          <span className={styles.studioTitle}>Widgets</span>
        </div>
        <div className={styles.studioActions}>
          {editing ? (
            <button type="button" className={styles.resetButton} onClick={resetLayout}>
              <RotateCcw size={15} aria-hidden="true"/> Restablecer
            </button>
          ) : null}
          <button type="button" className={styles.editButton}
            aria-pressed={editing} onClick={() => {
              setEditing((wasEditing) => !wasEditing);
              activeDragId.current = null;
              resizeGesture.current = null;
              setDraggingId(null);
              setDropTargetId(null);
              touchReorder.current = null;
            }}>
            {editing ? <Check size={17} aria-hidden="true"/> : <SlidersHorizontal size={17} aria-hidden="true"/>}
            {editing ? 'Listo' : 'Organizar'}
          </button>
        </div>
      </div>
      {editing ? (
        <p className={styles.editHint}>
          Arrastra el control de cada tarjeta para moverla y su esquina para ajustar el tamaño.
          También puedes usar las flechas.
        </p>
      ) : null}
      <section className={styles.board} data-os-widget-board="true" aria-label="Widgets del escritorio">
        {order.map((id) => {
          const widget = WIDGETS.find((item) => item.id === id);
          if (!widget) return null;
          const {title, Icon} = widget;
          const index = order.indexOf(id);
          return (
            <section className={styles.panel} key={id} data-widget-id={id}
              data-widget-size={sizes[id]} data-editing={editing ? 'true' : 'false'}
              data-dragging={draggingId === id ? 'true' : 'false'}
              data-drop-target={dropTargetId === id ? 'true' : 'false'}
              onDragOver={(event) => {
                if (editing && activeDragId.current && activeDragId.current !== id) {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                  if (dropTargetId !== id) setDropTargetId(id);
                }
              }}
              onDrop={(event) => dropBefore(event, id)}
              aria-labelledby={'os-widget-' + id}>
              <header className={styles.heading}>
                <div className={styles.headingTitle}>
                  {editing ? (
                    <button type="button" draggable className={styles.dragHandle}
                      aria-label={'Arrastrar ' + title + ' para reordenar'}
                      title={'Arrastrar ' + title} onDragStart={(event) => startDrag(event, id)}
                      onDragEnd={() => { activeDragId.current = null; setDraggingId(null); setDropTargetId(null); }}
                      onPointerDown={(event) => beginTouchReorder(event, id)}
                      onPointerMove={moveTouchReorder}
                      onPointerUp={finishTouchReorder} onPointerCancel={finishTouchReorder}>
                      <GripVertical size={18} aria-hidden="true"/>
                    </button>
                  ) : <Icon size={19} aria-hidden="true"/>}
                  <h2 id={'os-widget-' + id}>{title}</h2>
                </div>
                <div className={styles.headingActions}>
                  {editing ? (
                    <div className={styles.orderControls} role="group" aria-label={'Orden de ' + title}>
                      <button type="button" title="Mover antes" aria-label={'Mover ' + title + ' antes'}
                        disabled={index === 0} onClick={() => moveWidget(id, -1)}>
                        <ArrowUp size={15} aria-hidden="true"/>
                      </button>
                      <button type="button" title="Mover después" aria-label={'Mover ' + title + ' después'}
                        disabled={index === order.length - 1} onClick={() => moveWidget(id, 1)}>
                        <ArrowDown size={15} aria-hidden="true"/>
                      </button>
                    </div>
                  ) : null}
                  <details className={styles.sizeControl}>
                    <summary title={'Cambiar tamaño de ' + title}>
                      <MoveDiagonal size={17} aria-hidden="true"/>
                      <span className={styles.srOnly}>Cambiar tamaño de {title}, tamaño actual: {SIZE_LABELS[sizes[id]]}</span>
                    </summary>
                    <div className={styles.sizeMenu} role="group" aria-label={'Tamaño de ' + title}>
                      {SIZES.map((size) => (
                        <button key={size} type="button" aria-pressed={sizes[id] === size}
                          onClick={(event) => {
                            resizeWidget(id, size);
                            event.currentTarget.closest('details').open = false;
                          }}>
                          {SIZE_LABELS[size]}
                        </button>
                      ))}
                    </div>
                  </details>
                </div>
              </header>
              <WidgetContent id={id} metrics={metrics} purchases={purchases}
                notifications={notifications} recentRequests={recentRequests}
                agenda={agenda} criticalStock={criticalStock} wallpaper={wallpaper}
                onOpenWallpaper={onOpenWallpaper} onOpenControlCenter={onOpenControlCenter}/>
              {editing ? (
                <button type="button" className={styles.resizeHandle}
                  aria-label={'Redimensionar ' + title + ': arrastra o usa las flechas del teclado'}
                  title={'Redimensionar ' + title}
                  onPointerDown={(event) => beginResize(event, id)}
                  onPointerMove={moveResize} onPointerUp={finishResize}
                  onPointerCancel={finishResize} onKeyDown={(event) => resizeWithKeyboard(event, id)}>
                  <MoveDiagonal size={17} aria-hidden="true"/>
                </button>
              ) : null}
            </section>
          );
        })}
      </section>
      <span role="status" aria-live="polite" className={styles.srOnly}>{status}</span>
    </div>
  );
}
