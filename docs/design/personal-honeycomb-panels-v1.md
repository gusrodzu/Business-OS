# Business OS — Mi panal personalizado (v1)

## Experiencia
El Home mantiene su identidad de colmena. Los cuatro indicadores actuales siguen seleccionados al entrar por primera vez. Un quinto hexágono con **+ Agregar indicador** abre el catálogo sin navegar fuera del Home.

- Catálogo de **10 métricas** obtenidas del endpoint existente `/dashboard`.
- Se pueden seleccionar varios paneles, quitarlos y ver inmediatamente las tarjetas añadidas.
- **Organizar** habilita controles de mover izquierda/derecha y quitar directamente desde cada hexágono, accesibles con teclado.
- **Personalizar** mantiene la gestión de widgets completos y la densidad compacta.
- El orden y la selección se guardan **por empresa, usuario y contexto Demo Local/online** en `localStorage`. Esto persiste en el mismo navegador; no implica sincronización entre dispositivos.
- Primera personalización migra las preferencias legacy una sola vez. Otros usuarios no heredan automáticamente la configuración.

## Métricas iniciales
Solicitudes pendientes, órdenes del mes, valor del inventario y stock crítico.

## Catálogo adicional
Compras del año (suma de los registros de compras mensuales disponibles), solicitudes recientes, usuarios activos, próximos vencimientos (entradas de agenda), avisos operativos (notificaciones) y categorías inventariadas (entradas de la distribución por categoría).

No se fabrican valores y no se consultan endpoints nuevos. La visibilidad de los datos sigue determinada por el payload autorizado del backend. La personalización nunca otorga acceso adicional a módulos ni modifica permisos o estado de negocio.

## QA y responsive
- `npm run ui:honeycomb:audit`: verifica catálogo, filtros de IDs, almacenamiento separado, migración, orden y compatibilidad offline.
- `Frontend QA`: lint y build de frontend, auditorías visuales y UAT offline existentes.
- `Smartphone Browser Review`: abrir el catálogo, añadir un indicador, recargar, mover y quitar; prueba en **390 px** y **1440 px**, guardando capturas.
- Los cambios son específicos de dashboard y HoneycombKpis; Acciones rápidas y otras pantallas permanecen intactas.

## Evolución futura
Persistencia en API para sincronización entre dispositivos y paneles de datos específicos por rol; mostrar solo métricas respaldadas por permisos verificables del servidor.
