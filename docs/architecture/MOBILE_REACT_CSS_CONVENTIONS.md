# Business OS Next · Convenciones React y CSS mobile-first

Este documento guía refactors **incrementales**, no una migración masiva. El contrato visual sigue en [BUSINESS_OS_MOBILE_WIREFRAME_V2.md](../ui-ux/BUSINESS_OS_MOBILE_WIREFRAME_V2.md). Antes de editar, revisar `main` y PR abiertos para evitar colisiones.

## Responsabilidades por feature

```text
apps/web/src/modules/<area>/
  ui/
    pages/         # orquestación: permisos, estado, navegación y operaciones
    components/    # presentación y callbacks por props
    hooks/         # estado y efectos de interfaz reutilizables
    utils/         # transformaciones puras para render
  services/        # adaptadores de datos existentes; no mover contratos API en refactors visuales
```

La estructura es una **convención para nuevas extracciones**, no una orden de mover todos los archivos existentes. Conservar rutas/imports válidos. Un hook no debe introducir un segundo origen de verdad ni esconder reglas de autorización; un componente presentacional no debe consultar APIs ni mutar stock. Evitar dependencias circulares entre features.

## Componentes y consumidores reales

| Pieza | Uso |
| --- | --- |
| `components/MobileRecordCard` | tarjetas móviles de registros; reutilizado en prospectos |
| `modules/sales/ui/components/SalesProspectMobileList` | composición de oportunidades móviles |
| `modules/sales/ui/components/SalesProspectMobileActions` | selección y cambio de etapa; mutaciones delegadas al padre |
| `modules/sales/ui/components/SalesProspectDetailDrawer` | navegación/acciones del detalle; secciones presentacionales separadas |
| `modules/sales/ui/components/SalesEnterpriseOverview` | composición del resumen comercial |
| `modules/sales/ui/hooks/useSalesMobileTabs` | observación del breakpoint de pestañas |

**Regla de extracción:** crear un componente compartido solo cuando tenga al menos dos consumidores reales o encapsule una responsabilidad suficientemente compleja. No crear un componente por cada `div`. Mantener handlers de operaciones en el orquestador.

## CSS Modules y tokens

- Mantener `foundation.css` como entrada global. No añadir hojas globales de feature.
- Preferir un `*.module.css` por componente, o reutilizar temporalmente el módulo del padre durante la extracción.
- Usar tokens semánticos existentes de `design-system/styles/tokens.css` antes de introducir valores fijos. No duplicar hexadecimales, sombras, radios ni breakpoints sin motivo.
- Conservar temas claro/oscuro, foco visible, safe areas y targets táctiles de al menos 44 px.
- Evitar `!important`, selectores de alta especificidad y estilos de desktop alterados por una migración móvil.
- Eliminar reglas duplicadas solo tras identificar el valor efectivo de la cascada; no reescribir CSS global completo.

## Patrón incremental

1. Seleccionar **una** responsabilidad independiente en un archivo extenso y revisar PR abiertos.
2. Extraer UI pura a `components/`, efectos UI a `hooks/` o formato derivado a `utils/`. Mantener los mismos props, callbacks y orden de efectos.
3. Conservar endpoints, permisos, tenant, demo, transacciones, pagos y stock; no alterar contratos de dominio en un PR visual.
4. Migrar CSS solo para la pieza intervenida, reutilizando tokens existentes y manteniendo desktop intacto.
5. Abrir PR pequeño y reversible vinculado a #73. No fusionar con checks requeridos pendientes o fallidos.

## Alcance del QA

QA visual, accesibilidad, responsive e integración se agrupan en la **fase final** del rediseño. Esto no desactiva workflows ni protecciones automáticas de GitHub. Corregir de inmediato fallos críticos de seguridad, datos o compilación introducidos por el cambio actual. Cloudflare es la plataforma vigente; no intervenir infraestructura en refactors de UI.
