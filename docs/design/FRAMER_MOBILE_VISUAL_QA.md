# BuzzBee Business OS · QA visual móvil de Framer

Fecha: 29 de octubre de 2026  
Proyecto editable: https://framer.com/projects/slIkcCDWidm68dZouEAI  
Alcance: **prototipo Framer**; no se aplica a la aplicación ERP productiva.

## Resultado verificado

| Pantalla o comprobación | Resultado | Evidencia / límites |
|---|---|---|
| Home de empresas, smartphone 390 px | PASS visual | Cinco fichas, resumen, filtros y footer visibles completos; captura de componente Framer |
| Dashboard restaurante, 390 px | PASS visual | KPI rectangulares, gráfico y accesos rápidos se apilan; tabla de actividad accesible en contenedor horizontal |
| Menú contextual móvil | PASS visual | Rail + submenú de dos niveles y fondo oscurecido; captura del estado abierto |
| Alta de empresa, paso 1 de 5 | PASS visual | Formulario centrado con progreso y acciones visibles; sólo se observó el paso 1 |
| Personalización KPI | PASS visual | Drawer de ancho completo en smartphone; indicadores y acciones visibles |
| Inventario / operaciones | PASS visual con mejora | Se añadió aviso de desplazamiento horizontal, región con foco de teclado y contenedor táctil para columnas adicionales |
| Escape en overlays | PASS implementación / QA interactivo pendiente | Listener con cierre de menú, wizard, KPI y detalle, liberado al desmontar; no se ejecutó teclado real en browser |
| Cierre tocando backdrop | PASS implementación / QA interactivo pendiente | Wizard y KPI comprueban que el toque fue en el backdrop; no se ejecutó interacción real en browser |
| Compilación TypeScript en Framer | PASS | `api.files.write('BusinessOS.tsx')` devolvió `diagnostics: []` |
| Cálculo responsive | PASS implementación | `ResizeObserver` toma el ancho del componente, en lugar de `window.innerWidth` |
| Altura auto 390 px | PASS visual, limitación de canvas | Al retirar el scroll interno, las capturas presentan el contenido completo; `getRect` sigue reportando 200 px de alto en la réplica de Framer, por lo que el motor del canvas requiere verificación de navegador real |
| 320, 360 y 430 px | NO VERIFICADO | No se capturaron ni inspeccionaron esos anchos |
| iOS Safari / Android Chrome / Huawei | NO VERIFICADO | Sin sesión en dispositivos reales |
| Trampa de foco, restauración de foco, lector de pantalla | PENDIENTE | No se ejecutaron pruebas automáticas ni manuales en navegador |
| Wizard pasos 2–5 y validación submit | PENDIENTE | No se ejecutó el flujo completo en navegador |
| Producción, roles ERP, multiempresa | NO APLICA | Framer usa datos exclusivamente ficticios; no conectado a backend |

## Correcciones realizadas en Framer

1. Se retiró el scroll vertical interno del contenido general para que el documento crezca naturalmente y la captura móvil muestre las cinco empresas, evitando la tarjeta cortada.
2. Se expusieron controles de `previewScreen` y `previewCompany` para inspeccionar directorio, dashboard por giro, inventario, ventas, menú, wizard, personalización y detalle sin depender de navegación previa.
3. Se añadió una región de tabla con `overflowX:auto`, desplazamiento táctil y `tabIndex=0` más explicación para usuarios de smartphone.
4. Se añadió cierre por Escape para menú y ventanas emergentes y cierre por backdrop para wizard y personalización. La implementación se compiló sin diagnósticos.
5. Se conservaron tres breakpoints 1200 / 810 / 390 px, y la versión móvil utiliza la misma instancia de componente que desktop mediante variantes Framer.

## Cierre

**QA visual móvil de las vistas seleccionadas: completado a 390 px con correcciones.** No equivale a QA funcional, pruebas en teléfonos reales, ni certificación WCAG 2.2 AA. Para aprobar el prototipo como referencia final faltan el barrido 320/360/430 px, pasos del wizard, interacción real de modales y navegación con teclado, y pruebas de focus/scroll en navegador.

El siguiente PR del ERP debe tratar esta referencia como diseño, no como código funcional ni verificación de aislamiento tenant. Consultar #73 y #206.
