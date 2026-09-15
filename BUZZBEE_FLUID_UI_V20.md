# BuzzBee Fluid UI v20.0.0

Aplicación inicial del skill `apple-design` sobre la base v19.2.0.

## Implementado
- Capa global `apple-fluid.css`, cargada al final del stack visual para refinar MD3 sin romper la arquitectura existente.
- Feedback inmediato de press/tap.
- Chrome translúcido para topbar y navegación contextual.
- Jerarquía de profundidad para cards, drawers, command palette y BuzzBee AI.
- Tipografía con tracking y leading específicos por escala.
- Estados hover/focus coherentes para DataGrid/tablas e inputs.
- Scroll ownership y edge treatment del workspace.
- Dark mode basado en profundidad de superficies.
- `prefers-reduced-motion` y `prefers-contrast` integrados globalmente.
- Responsive refinement para móvil.
- Versión frontend elevada a 20.0.0.

## Ya presente y preservado
- Ctrl/Cmd + K Command Palette.
- BuzzBee AI contextual.
- Right rail / Agenda / Apps.
- Demo Live y Demo Offline.
- MD3 foundation y design-system existente.

## Validación
No fue posible ejecutar Vite dentro del sandbox porque el ZIP contiene dependencias/cachés de Windows incompletas y no incluye un binario Vite ejecutable para Linux. En tu equipo, desde la raíz, ejecuta:

```powershell
npm install
npm run build
```

o, para solo el frontend:

```powershell
npm --prefix apps/web install
npm --prefix apps/web run build
```
