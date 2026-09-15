# BuzzBee Business OS v20.2.0 — Consolidated Fluid Release

## Aplicado
- Fluid UI Apple-inspired sobre MD3 para Home, Ventas, Compras, Inventario, Finanzas, CRM, RRHH, Proyectos, POS y Producción.
- App shell, KPI, tablas, drawers/paneles, feedback de interacción, dark mode, responsive y preferencias de accesibilidad consolidadas.
- Demo Offline automotriz y fallback universal preservados.
- Arquitectura modular y Shared kernel documentados.
- Versiones de raíz, WEB y API alineadas en 20.2.0.
- Scripts raíz para build y auditorías restaurados en el paquete source.

## QA comprobado en esta entrega
- Fluid UI: 13/13 PASS.
- Arquitectura modular: 36/36 PASS después de documentar Shared kernel y reglas de arquitectura.
- Offline all routes: 10/10 PASS (67 rutas descubiertas, 157 endpoints offline cubiertos).
- Offline Auto Parts Demo: 13/13 PASS.
- Multiempresa: 100% (54/54 rutas tenant-aware).
- Permisos: 100% (246/246 endpoints mutables protegidos).
- POS funcional: 29/29 PASS.
- KPI Design System: 23 pantallas con KpiGrid y 155 KPI con KpiCard.

## Nota de build
El contenedor no dispone de acceso de red utilizable para reconstruir dependencias npm y el source limpio no incluye node_modules. Por ello el build Vite debe ejecutarse en Windows después de `npm install`.

```powershell
cd <ruta>\BuzzBee-v20.2.0
npm install
npm run build
npm run fluid:audit
npm run architecture:audit
npm run dev
```
