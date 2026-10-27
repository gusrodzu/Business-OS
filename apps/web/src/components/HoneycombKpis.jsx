import {useEffect, useMemo, useRef, useState} from 'react';
import {ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Plus, X} from 'lucide-react';
import {createHoneycombLayout} from './honeycombLayout.js';
import styles from './HoneycombKpis.module.css';

/**
 * Personalized honeycomb, fed exclusively by the already authorized /dashboard
 * response. Geometric masks are decorative: buttons retain full hit targets.
 */
export default function HoneycombKpis({
  items = [],
  compact = false,
  editing = false,
  onAdd,
  onRemove,
  onMove,
}) {
  const rootRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;
    const resize = () => {
      const width = Math.round(node.getBoundingClientRect().width);
      setContainerWidth(previous => previous === width ? previous : width);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => createHoneycombLayout({
    count:items.length + (onAdd ? 1 : 0),
    width:containerWidth || 800,
    compact,
  }), [items.length, onAdd, containerWidth, compact]);

  const position = index => {
    const box = layout.positions[index];
    return box ? {
      left:`${box.left}px`,top:`${box.top}px`,
      width:`${box.width}px`,height:`${box.height}px`,
    } : undefined;
  };

  return (
    <section
      ref={rootRef}
      className={`${styles.honeycomb} ${compact ? styles.compact : ''} ${editing ? styles.editing : ''}`.trim()}
      style={{height:`${layout.height}px`}}
      data-honeycomb-layout={layout.mode}
      aria-label="Indicadores clave del negocio"
      data-honeycomb-kpis="true"
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const TrendIcon = item.trend === 'down' ? ArrowDownRight : item.trend === 'up' ? ArrowUpRight : null;
        const toneClass = styles[item.tone] || '';
        return (
          <article
            className={`${styles.cell} ${toneClass}`.trim()}
            key={item.id || item.label}
            data-honeycomb-panel={item.id || item.label}
            style={position(index)}
            aria-label={item.label}
          >
            {editing ? (
              <div className={styles.editTools} role="group" aria-label={`Ordenar o quitar ${item.label}`}>
                <button type="button" onClick={() => onMove?.(item.id, -1)}
                  aria-label={`Mover ${item.label} a la izquierda`} disabled={index === 0}>
                  <ArrowLeft size={15} aria-hidden="true"/>
                </button>
                <button type="button" onClick={() => onMove?.(item.id, 1)}
                  aria-label={`Mover ${item.label} a la derecha`} disabled={index === items.length - 1}>
                  <ArrowRight size={15} aria-hidden="true"/>
                </button>
                <button type="button" onClick={() => onRemove?.(item.id)}
                  aria-label={`Quitar ${item.label} del panal`}>
                  <X size={15} aria-hidden="true"/>
                </button>
              </div>
            ) : null}
            <div className={styles.content}>
              <div className={styles.icon} aria-hidden="true">
                {Icon ? <Icon size={19} strokeWidth={2.15} /> : null}
              </div>
              <span className={styles.label}>{item.label}</span>
              <strong className={styles.value}>{item.value}</strong>
              <span className={`${styles.change} ${item.trend === 'down' ? styles.down : styles.up}`}>
                {TrendIcon ? <TrendIcon size={13} aria-hidden="true"/> : null}
                {item.change}
              </span>
            </div>
          </article>
        );
      })}
      {onAdd ? (
        <button className={styles.addCell} style={position(items.length)}
          type="button" data-ui-surface="card" onClick={onAdd}
          aria-label="Agregar indicador al panal" data-honeycomb-add="true">
          <span className={styles.addInner}>
            <span className={styles.addIcon}><Plus size={24} aria-hidden="true"/></span>
            <strong>Agregar indicador</strong>
            <small>Personaliza tu información</small>
          </span>
        </button>
      ) : null}
    </section>
  );
}
