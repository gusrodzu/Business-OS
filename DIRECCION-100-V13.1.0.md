# BuzzBee ERP · Dirección 100/100 · v13.1.0

## Objetivo
Cerrar el rol de Dirección con una vista ejecutiva que permita entender la salud de la empresa, detectar decisiones pendientes y navegar al origen de cada indicador sin depender de reportes externos.

## Alcance implementado

### 1. Ventas y cobranza
- Ventas confirmadas del periodo desde `SalesOrder`.
- Cobranza real desde `CustomerPayment`.
- Comparación automática contra un periodo anterior de igual duración.
- Evolución mensual de ventas y cobranza.

### 2. Tesorería y liquidez
- Liquidez consolidada desde cuentas activas de Tesorería.
- Entradas y salidas operativas del periodo.
- Flujo neto visible desde el resumen ejecutivo.

### 3. Presupuesto
- Presupuesto activo/cerrado aplicable al rango.
- Ejecución administrativa del periodo.
- Variación y porcentaje de utilización.
- Alerta ejecutiva cuando existe sobre-ejecución.

### 4. Saldos reconstruidos al cierre
Cuentas por cobrar y pagar ya no dependen únicamente del estado actual del documento. El reporte reconstruye el saldo al cierre usando pagos con fecha menor o igual a la fecha final del reporte.

### 5. Salud del negocio
Score de 0 a 100 calculado con:
- cartera vencida,
- deuda vencida,
- inventario crítico,
- aprobaciones pendientes,
- ejecución presupuestal,
- liquidez.

El score es una lectura ejecutiva operativa y no sustituye indicadores financieros contables formales.

### 6. Decisiones que requieren atención
El reporte genera y prioriza decisiones con severidad y navegación directa:
- cobranza vencida,
- pagos vencidos,
- aprobaciones pendientes,
- stock crítico,
- desviación presupuestal,
- caída de ventas frente al periodo anterior.

### 7. Drill-down
Los KPIs y decisiones llevan al módulo que explica el dato:
- Ventas,
- Cobranza,
- Tesorería,
- CxC,
- CxP,
- Presupuestos,
- Nómina,
- Inventario,
- Aprobaciones.

### 8. Exportación ejecutiva
El CSV incluye:
- indicadores,
- comparativos,
- presupuesto,
- salud,
- decisiones,
- evolución mensual,
- proveedores,
- cartera,
- capital humano,
- stock crítico.

### 9. Accesibilidad de KPI
`KpiCard` ahora acepta navegación/click de forma estándar y soporta teclado con Enter/Espacio.

### 10. Tablas
Las tablas ejecutivas mantienen el estándar v13.0.5: wrap de texto, contenedor con scroll cuando sea necesario y sin recortes.

## QA
Ejecutar:

```bash
npm run qa:direction
```

Resultado esperado:

```text
Dirección 100/100 v13.1.0 OK · 22/22 checks passed.
```

## Base de datos
No requiere migración Prisma.

## Criterio de aceptación
Esta versión cubre el alcance funcional/técnico definido para Dirección 100/100. El cierre definitivo de producto requiere una prueba operativa con datos reales y usuarios del cliente para confirmar tiempos, comprensión de indicadores y permisos efectivos.
