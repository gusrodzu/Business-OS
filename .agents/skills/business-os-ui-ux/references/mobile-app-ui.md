# Capacidad 4 — Mobile App UI · Web responsive, PWA y futuro nativo

## Activación
Cuando se solicite mejorar la versión smartphone/tablet, la navegación móvil, una PWA, gestos, formularios táctiles o diseñar versiones para Android/iOS/Huawei.

## Distinguir las plataformas
- **Web responsive actual**: React/Vite + CSS Modules, misma aplicación ERP adaptada a viewport y capacidades táctiles.
- **PWA**: sobre la web, instalación y soporte offline si las rutas/acciones tienen adaptadores reales; no prometer transacciones offline sin sincronización.
- **Aplicación nativa futura**: Expo/React Native es trabajo separado; reutiliza APIs, validaciones y lógica compatible, pero **no** JSX HTML ni CSS Modules directamente. No suponer que `apps/mobile` ya es una app funcional.
- Android distribuido fuera de Google Play/Huawei exige validar servicios, compilación, firma, permisos y políticas de tienda; no anunciar soporte publicado sin build y pruebas.

## Navegación y pantallas
1. Identificar tareas de campo y frecuencia de uso: POS, existencias, inventario, ventas, aprobación, CRM. Mantener roles y empresa seleccionada.
2. En Business OS prevalece el sistema de **dos niveles**: rail/explorador contextual, adaptado a drawer móvil y/o barra inferior para destinos prioritarios sin duplicarlos. No imponer cinco tabs arbitrarios.
3. En una app nativa independiente, considerar 3–5 destinos primarios si responden a tareas frecuentes. Adaptar convenciones Apple HIG y Material Design sin copiar interfaces.
4. Definir mapas de pantalla: iniciar sesión/empresa, inicio KPI, lista y detalle, buscar/filtrar, crear/editar, notificaciones, preferencias, errores y modo offline.
5. Acciones importantes dentro de alcance del pulgar, controles claros y accesibles, confirmaciones seguras en pagos o movimientos de stock.

## Interacción, medidas y adaptabilidad
- Objetivos táctiles: **44 × 44 pt** orientativos para iOS y **48 × 48 dp** en Material Android. En web, cumplir mínimo WCAG 2.2 AA de 24 CSS px o separación/equivalentes permitidos y preferir ~44 CSS px para acciones frecuentes.
- Texto dinámico/zoom (incluido 200%), safe areas, teclado en pantalla, barras persistentes, orientación, gestos con alternativa de botón y contraste en ambos temas.
- Modo móvil: listas adaptativas o tabla con scroll local, nunca pantalla entera horizontal; no truncar SKU, dinero, folios, estados o acciones críticas.
- Estados loading/empty/error/permission/offline; guardar sólo cuando el servidor o adaptador real confirma.
- Comprobar 320/360/390/430/768/1024 px, además de 1440 de referencia web, y teclado externo/foco cuando se use navegador.

## Entregable
Mapa navegación y pantallas, decisiones por plataforma, comportamientos táctiles, diseño adaptable, riesgos offline, pruebas por dispositivo. No afirmar listo para stores por superar QA web.
