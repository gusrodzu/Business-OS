# BuzzBee ERP v12.3.0 — Visual Standardization

Esta versión estandariza el lenguaje visual y el idioma de las superficies operativas sin cambiar el modelo de datos ni las APIs.

## Cambios
- Nuevo `global-ui-v12.3.css` cargado después del sistema v10.5 para unificar dashboards, tarjetas, KPI, botones, filtros, inputs, tablas, listas, estados, vacíos y modales centrados.
- KPI mantiene el patrón compartido y máximo de 4 columnas definido por BuzzBee.
- Tablas con cabecera, densidad, jerarquía, hover y contenedor responsive consistentes.
- Modales centrados con backdrop, encabezado, cuerpo y footer coherentes.
- Diccionario central `uiLanguage.js` para presentar estados de API en español sin modificar sus enum internos.
- `Badge` traduce automáticamente estados enum comunes.
- Corrección de textos visibles heredados en inglés: Dashboard, Workflow Engine, Order-to-Cash, Procure-to-Pay, Marketing Campaign, Data Hub/Integration Hub en copy de interfaz, entre otros.
- Perfil y rutas del v12.2 permanecen intactos.

## Sin cambios de base de datos
No hay cambios de Prisma, migraciones, seeds ni `db:sync`.

## Validación
`npm run qa:visual-standardization`
`npm run qa:module-rationalization`
`npm run validate:navigation`
`npm run build`
