# Capacidad 3 — Design to Code · De diseño aprobado a React real

## Activación
Cuando el usuario adjunte capturas, referencias, wireframes, diseño Figma o descripción de una pantalla y solicite implementarla en Business OS.

## Traducción a implementación
1. Identificar la ruta **realmente montada** en `apps/web/src/modules/*/routes.jsx` o `apps/web/src/pages/`. Verificar duplicados heredados; no modificar sólo una versión inactiva.
2. Descomponer la referencia en anatomía, espaciado, grid, jerarquía, tipografía, paleta, estados y comportamiento; distinguir lo visual de reglas de negocio. Aclarar únicamente bloqueos imprescindibles.
3. Mapear cada parte a componentes existentes de `design-system`, `module-system` y `ux-foundation`; reutilizar antes de crear nuevo componente. React actual y CSS Modules son el objetivo por defecto.
4. Implementar estructura semántica: `header/nav/main/section` cuando corresponda, botones reales para acciones, labels enlazadas, tablas para datos tabulares; evitar divs clicables sin soporte de teclado.
5. Conservar hooks, servicios `*Request`, rutas, formularios, adaptación offline, loading/error, permisos y segregación de `companyId`; no reemplazar datos reales por mockups ni inventar endpoints.
6. Usar tokens y reglas responsive existentes. Preferir CSS Grid/Flexbox y `minmax(0,1fr)`/`min-width:0` en widgets densos; evitar `!important` y CSS correctivo apilado.
7. Implementar las variantes necesarias: desktop/tablet/móvil, claro/oscuro, loading, vacío, error, acción completada, no-autorizado y offline cuando aplica.
8. QA: lint, build, scripts `ui:*`, rutas, funcionalidad en Demo Local, teclado, contraste y comparación visual con la referencia. Registrar discrepancias sin afirmar equivalencia 1:1 no verificada.

## Handoff técnico de cada pantalla
- Ruta y módulo, vista original vs aprobada, componentes reutilizados/nuevos, cambios JSX y CSS.
- Props/estados/acciones y contratos de datos; criterios de aceptación medibles.
- Capturas o pruebas de navegador por ancho/tema cuando estén disponibles.
- Archivos, rama, PR, checks y estado de despliegue verificado de forma independiente.

## Límites
Una referencia visual no autoriza a clonar marcas ajenas ni a rehacer flujos financieros. No devolver sólo HTML aislado cuando la solicitud exige integración en la aplicación.
