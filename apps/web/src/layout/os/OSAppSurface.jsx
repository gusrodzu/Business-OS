import {LayoutDashboard, ClipboardList, ShoppingCart, Truck, Users, Package, Wallet, FileText, BarChart3, Settings, ArrowLeftRight, CalendarDays, History, Factory, CreditCard, Receipt, Boxes} from 'lucide-react';
import {navigationGroups} from '../../data/navigation';
import {getActiveOSAppSection,getOSAppIdentity,getOSAppSections} from './workspaceAppIdentity';
import styles from './OSAppSurface.module.css';
import AppNavigationRail from './primitives/AppNavigationRail';

function sectionIcon(label){
 const key=label.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const icons=[[/resumen|inicio|general/,LayoutDashboard],[/solicitud|tarea|orden/,ClipboardList],[/recepcion|entrega|envio/,Truck],[/proveedor|cliente|contacto|empleado|equipo/,Users],[/producto|catalogo/,Package],[/almacen|existencia/,Boxes],[/cobranza|tesoreria|presupuesto/,Wallet],[/pago|cobrar|caja/,CreditCard],[/factur|fiscal/,Receipt],[/reporte|indicador|inteligencia/,BarChart3],[/configuracion|preferencia/,Settings],[/devolucion|movimiento|transferencia/,ArrowLeftRight],[/agenda|calendario/,CalendarDays],[/historial|actividad/,History],[/produccion|manufactura/,Factory],[/compra|venta/,ShoppingCart]];
 return icons.find(([pattern])=>pattern.test(key))?.[1]||FileText;
}

/** App window canvas. The shared rail owns internal routes; the OS dock and
 * launcher own app switching. The native window bar owns the app identity.
 * No duplicated breadcrumb or section-selector header. */
export default function OSAppSurface({appKey,pathname,children}){
  const identity=getOSAppIdentity(appKey);
  const sections=getOSAppSections(appKey,navigationGroups);
  const active=getActiveOSAppSection(pathname,sections);
  const hasSections=sections.length>1;
  const railItems=hasSections?sections.map(section=>({id:section.to,to:section.to,label:section.label,Icon:sectionIcon(section.label)})):[];
  const designTokens={
    '--os-app-accent':identity.accent,
    '--os-app-tint':identity.tint,
    '--os-app-accent-ink':identity.accentInk,
  };
  return <section className={styles.surface} data-os-app-surface={identity.key}
    data-os-active-section={active?.to||pathname}
    data-os-surface-version="3"
    aria-label={`Espacio de ${identity.label}`} style={designTokens}>
    <div className={styles.appNavigationWorkspace} data-has-app-rail={hasSections?'true':'false'}>
      {hasSections?<AppNavigationRail items={railItems} active={active?.to} label={`Navegación de ${identity.label}`}/>:null}
      <div className={styles.body} data-os-app-page="true" data-messenger-workspace={pathname.split(/[?#]/)[0]==='/mensajes'?'true':undefined}>
        {children}
      </div>
    </div>
  </section>;
}
