# Business OS · Adaptación a dispositivos plegables y multipantalla (2026-11-26)

**Estado:** primera base CSS + contrato de adopción. No constituye certificación física ni remodelación concluida de todos los módulos.

## Principios
- Un solo producto React: Pocket OS en cubierta estrecha; Workspace OS en pantallas amplias, sin depender de marca, sistema operativo, modelo o user-agent. El ancho disponible y las capacidades mandan; el tamaño exterior del equipo no garantiza tamaño del panel.
- Familias a probar: Samsung Galaxy Z Fold/Flip, Google Pixel Fold, OPPO Find N/Flip, Xiaomi Mix Fold/Flip, Huawei Mate X/Pura X y otras con navegadores compatibles. Incluir iPhone estándar y distintos tamaños de iOS como baseline; **no atribuir a Apple un iPhone plegable comercial sin confirmación**.
- Pantalla cerrada, abierta, landscape, portrait, multitarea/split-screen, teclado virtual, PWA y browser. Evitar reinicializar vistas, formularios, filtros o datos al plegar/desplegar.
- Distinguir **panel flexible continuo** de **dos pantallas con bisagra física**. Las viewport segments CSS solo deben aplicarse cuando la plataforma las expone y el contenedor está marcado explícitamente.

## Contratos técnicos
1. CSS **container queries** en superficies de módulo para KPI, encabezados y filtros. En un panel estrecho KPIs apilados; en medianos 2 columnas; contenidos complejos (Calendar, POS, Messages) hacen transición lista → detalle cuando no cabe un panel dual.
2. Shell: medir el espacio real con ResizeObserver/visualViewport donde sea necesario y evitar decisiones permanentes basadas en window.innerWidth o user-agent. La activación Pocket OS sigue en su propio shell; esta base no la reemplaza.
3. Bisagra: `data-fold-spanning='true'` en un contenedor **solo si** el componente está construido con dos hijos `data-fold-pane='start'` y `data-fold-pane='end'`. No activar spanning por defecto; pruebas con dispositivos reales para CSS viewport segments y degradación a una columna.
4. Safe areas: `data-fold-safe-area='true'` únicamente en contenedores que administren su propio padding; evitar aplicarlo junto a gutters heredados sin revisar. Acciones críticas fuera de la bisagra, notch y zonas de gesto.
5. Inputs: targets táctiles de 44 CSS px, foco visible, teclado, zoom 200%, scroll de tablas local, formatos de datos y estados sin cambios, sin auto-dismiss de editores por rotación.
6. No realizar sniffing de marcas (Samsung, OPPO, Xiaomi, Huawei, Apple). Progresividad de CSS sin dependencia nueva. Android Chrome, Samsung Internet, Safari iOS, Chromium/OEM Huawei deben verificarse sin asumir soporte uniforme de viewport segments.

## Matriz de QA (ancho CSS del panel, no pulgadas)
| Escenario | Anchos sugeridos | Objetivo |
|---|---|---|
| Cubierta angosta | 320 / 360 / 390 / 430 | Pocket OS, navegación accesible, KPIs legibles |
| Cubierta ancha y multitarea | 480 / 599 / 600 | Cambios de contenedor sin reiniciar formulario |
| Abierto compacto | 673 / 720 / 768 | Paneles adaptativos y dock sin contenido oculto |
| Abierto amplio y tableta | 840 / 900 / 1024 / 1100 | Doble panel cuando realmente cabe |
| Escritorio y tablet grande | 1200 / 1440 | Workspace OS original sin regresiones |
| Altura baja, landscape y teclado | 320–1024 + alturas 480 / 600 | Barra de acciones visible, scroll correcto |
| Doble pantalla con bisagra | 2 segmentos horizontales/verticales | Ningún control encima de la bisagra |
| Accesibilidad | 200% zoom, teclado, lector, dark/light, reduced motion | Sin desbordes globales ni pérdidas de foco |

## Secuencia P0 → P2
- **P0:** verificar shell y navegación real en cerrado/abierto; capturas y medidas del viewport; continuidad de ventana/pestaña, editores y formularios; corregir desbordes en shell.
- **P1:** migrar Calendar, Sales, Inventory, CRM, POS, Messages, Tasks y Approvals a patrones list/detail y container queries del módulo. Cada PR conserva permisos y lógica existente.
- **P2:** módulos restantes, experiencia con pantalla dividida y soporte opt-in de bisagra; auditoría por navegador, regresiones de UI, accesibilidad y rendimiento.

## Puerta de aceptación
No certificar “compatible con todos los plegables” hasta ejecutar rutas reales, capturas, flujo crear/editar/cancelar (tenant de prueba), navegador móvil y al menos un equipo físico plegable cerrado/abierto. PR de fundación es solo **fase inicial**; no modifica backend, seguridad, pagos ni datos de clientes.

## Passport Mode — perfil de geometría obligatorio
No es un cuarto shell ni un detector de modelos. Se activa en viewport táctil primario de 400–1180 CSS px, relación ancho/alto >= 2/3 y altura <= 900 CSS px. Son umbrales iniciales de diseño; también pueden coincidir teléfonos convencionales en landscape o tablets. Mantener Pocket y Workspace según sus contratos actuales; ningún perfil debe reconstruir formularios o cambiar permisos. Las decisiones lista/detalle dependen del ancho interno y del mínimo útil de ambos paneles, no del perfil Passport. No forzar dos paneles a 440 o 540 px.
- Dock compacto, controles de al menos 44 CSS px, safe areas, acciones accesibles y navegación existente. No reducir texto para que quepa.
- Casos QA CSS: 360×800 (baseline), 440×660, 540×540, 740×660, 820×620, 960×600, 1024×768, 1280×800; rotación, teclado, 200% zoom, cambios sin remount y navegación con lector de pantalla.
- Triple segmento horizontal: solo opt-in `data-fold-spanning='true'`, `data-fold-axis='horizontal'`, `data-fold-count='3'`, con tres hijos start/middle/end y superficie alineada al viewport. Las dos separaciones pueden diferir. Pantallas flexibles continuas no deben simular huecos. Sin soporte del navegador conservar diseño normal. No se ha activado en módulos; pendiente prueba física y vertical triple si aparece hardware compatible.
- Prioridad funcional: Calendar, Sales, Inventory, POS, Messages, CRM, Tasks, Approvals, Finance; probar cada ruta. Este cambio implementa perfil y ajustes de dock/espaciado, no el rediseño de todos los módulos ni garantiza continuidad de estado entre shells.
