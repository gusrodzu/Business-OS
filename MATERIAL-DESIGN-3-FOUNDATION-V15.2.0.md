# BuzzBee v15.2.0 — Material Design 3 Foundation

BuzzBee adopta Material Design 3 como sistema visual base, conservando su identidad de marca y la arquitectura funcional existente.

## Alcance de esta fase

- Roles de color MD3 para Light y Dark.
- Surface container ladder MD3.
- Tipografía semántica adaptada a ERP denso.
- Spacing, shape, elevation y motion tokens.
- Preferencia Light / Dark / System.
- Capa de compatibilidad para tokens históricos de BuzzBee.
- Button actualizado a filled, tonal, outlined, text, elevated y danger, conservando primary/secondary/ghost.
- Card con elevated, filled y outlined.
- Input outlined con estados MD3.
- Switch con geometría Material 3.
- Badge/Status Chip basado en roles semánticos.
- Nuevos Checkbox y Select compartidos.
- Respeto global a prefers-reduced-motion.

## Regla a partir de v15.2.0

Los módulos no deben introducir nuevos colores, radios, elevaciones o controles base si existe un token/componente equivalente dentro de `apps/web/src/design-system`.

## Compatibilidad

Esta fase no modifica endpoints, permisos, Prisma ni lógica de negocio. Los nombres de tokens antiguos permanecen como aliases hacia roles MD3 para permitir una migración progresiva sin romper módulos existentes.

## Próximas fases

1. Navegación y shells (Sidebar, Topbar, Tabs).
2. KPI, chips, badges y cards de negocio.
3. Tablas, dialogs, drawers, snackbars y menus.
4. Migración visual módulo por módulo.
5. QA visual y accesibilidad final.

## QA

Ejecutar:

```powershell
npm run qa:md3-foundation
npm run qa:all
npm run dev
```
