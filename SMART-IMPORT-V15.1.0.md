# BuzzBee Smart Import v15.1.0

## Objetivo
Migrar datos históricos de Excel/CSV por departamento sin exigir una plantilla rígida.

## Flujo
1. Subir CSV/XLS/XLSX.
2. BuzzBee detecta automáticamente el tipo de información por encabezados.
3. En libros con varias hojas, analiza cada hoja y permite elegirla.
4. Sugiere el mapeo de columnas con coincidencia flexible de nombres.
5. Valida obligatorios, formatos, duplicados dentro del archivo y coincidencias existentes.
6. Presenta vista previa del archivo y comparación CREATE/UPDATE.
7. El usuario confirma el commit.
8. Cada lote conserva historial y rollback controlado.

## Entradas por módulo
- RR. HH. → EMPLOYEE
- Inventario → PRODUCT
- Compras → SUPPLIER
- Ventas / CRM → CUSTOMER

## Seguridad
Todos los jobs y registros usan `req.auth.companyId`. Los permisos son `data_hub.read`, `data_hub.import` y `data_hub.rollback` y pueden asignarse por rol/departamento.

## Escala actual
Hasta 5,000 filas y 10 MB por lote. Para cargas mayores se recomienda procesamiento asíncrono por chunks en una fase posterior.
