# ERP Cliente v4.7.4 — Recursos Humanos

Versión acumulativa construida sobre v1.5.0.

## Instalación

1. Copia `apps/api/.env.example` como `apps/api/.env`.
2. Copia `apps/web/.env.example` como `apps/web/.env`.
3. Ejecuta:

```powershell
docker compose up -d
npm install
npm run db:generate
npm run db:migrate -- --name v160_human_resources
npm run db:seed
npm run build
npm run dev
```

## Acceso
- URL: http://localhost:5173/login
- Usuario: admin@erp.local
- Contraseña: Admin123!

## Nuevo módulo
`Recursos humanos → Empleados y estructura`


## Nuevo en v4.7.4
Ruta: `Recursos humanos → Asistencias e incidencias`.


## v4.7.4
Nuevo módulo: Recursos humanos → Expedientes laborales.


## Carga de archivos (v4.7.4)

Los expedientes laborales permiten subir PDF, JPG, PNG, WEBP, DOC y DOCX de hasta 10 MB. En desarrollo se guardan en `apps/api/uploads`. Para producción se recomienda Google Cloud Storage.


## v4.7.4 — Prenómina

Nueva ruta:

```text
Recursos humanos → Prenómina
```

Instalación:

```powershell
docker compose up -d
npm install
npm run db:generate
npm run db:migrate -- --name v190_payroll
npm run db:seed
npm run build
npm run dev
```

> Esta versión gestiona prenómina operativa. No genera CFDI de nómina ni sustituye un cálculo fiscal certificado.


## v4.7.4 — Reportes ejecutivos

Nueva ruta:

```text
Reportes
```

Instalación:

```powershell
docker compose up -d
npm install
npm run db:generate
npm run db:migrate -- --name v200_reports
npm run db:seed
npm run build
npm run dev
```

Esta versión no agrega modelos nuevos: consolida los datos de los módulos existentes.


## v4.7.4 — Auditoría y notificaciones

Nueva ruta:

```text
Configuración → Centro de actividad
```

Instalación:

```powershell
docker compose up -d
npm install
npm run db:generate
npm run db:migrate -- --name v210_audit_notifications
npm run db:seed
npm run build
npm run dev
```


## v4.7.4 — Tesorería

Nueva ruta:

```text
Finanzas → Tesorería
```

Instalación:

```powershell
docker compose up -d
npm install
npm run db:generate
npm run db:migrate -- --name v220_treasury
npm run db:seed
npm run build
npm run dev
```


## v4.7.4 — Corrección visual de tarjetas KPI

Esta revisión aplica una corrección visual en 17 hojas de estilo.

Los indicadores ahora muestran:

```text
Ícono
Concepto
Valor
```

No agrega tablas ni migraciones. Para instalar:

```powershell
npm install
npm run build
npm run dev
```

No es necesario ejecutar `db:migrate`.


## v4.7.4 — Presupuestos y centros de costo

Nueva ruta:

```text
Finanzas → Presupuestos
```

Instalación:

```powershell
docker compose up -d
npm install
npm run db:generate
npm run db:migrate -- --name v230_budgets
npm run db:seed
npm run build
npm run dev
```


## v4.7.4 — Ventas

Nueva ruta:

```text
Ventas
```

Instalación:

```powershell
docker compose up -d
npm install
npm run db:generate
npm run db:migrate -- --name v240_sales
npm run db:seed
npm run build
npm run dev
```


## v4.7.4 — Base consolidada

La ruta de Ventas está registrada en React y visible en el menú:

```text
Ventas → Cotizaciones y pedidos
```

URL:

```text
http://localhost:5173/ventas
```

Validación recomendada:

```powershell
npm run validate:navigation
npm run build
npm run dev
```

Esta versión no añade una migración nueva sobre v2.4.0.
En una instalación limpia, ejecuta las migraciones acumuladas de Prisma normalmente.


## v4.7.4 — BuzzBee Framework

Funciones principales:

```text
Ctrl + K       Búsqueda global
Ícono Bot      Centro Buzz AI
Ícono Luna     Tema oscuro
```

Instalación:

```powershell
docker compose up -d
npm install
npm run db:generate
npm run db:seed
npm run validate:navigation
npm run build
npm run dev
```

Esta versión no requiere una migración nueva de Prisma sobre v3.0.0.


## v4.7.4 — Foundation estable

Instalación recomendada:

```powershell
docker compose up -d
npm install
npm run db:generate
npm run db:seed
npm run validate:foundation
npm run validate:navigation
npm run build
npm run dev
```

No requiere una migración nueva sobre v3.1.0.

Si Vite selecciona otro puerto, abre exactamente la URL indicada en la terminal.


## v4.7.4 — Sales App Enterprise

Ruta:

```text
Ventas → Centro comercial
```

Instalación:

```powershell
docker compose up -d
npm install
npm run db:generate
npm run db:migrate -- --name v410_sales_enterprise
npm run db:seed
npm run validate:foundation
npm run validate:navigation
npm run build
npm run dev
```

Esta versión sí requiere migración porque agrega prospectos y actividades comerciales.


## v4.7.4 — Entregas y facturación

Ruta:

```text
Ventas → Entregas y facturación
```

Instalación:

```powershell
docker compose up -d
npm install
npm run db:generate
npm run db:migrate -- --name v420_deliveries_billing
npm run db:seed
npm run validate:foundation
npm run validate:navigation
npm run build
npm run dev
```

Esta versión requiere migración de Prisma.


## v4.7.4 — Devoluciones y notas de crédito

Ruta:

```text
Ventas → Devoluciones y notas de crédito
```

Instalación:

```powershell
docker compose up -d
npm install
npm run db:generate
npm run db:migrate -- --name v430_sales_returns
npm run db:seed
npm run validate:foundation
npm run validate:navigation
npm run build
npm run dev
```

Esta versión requiere migración de Prisma.


## v4.7.4 — Cobranza

Ruta:

```text
Ventas → Cobranza
```

Instalación:

```powershell
docker compose up -d
npm install
npm run db:generate
npm run db:migrate -- --name v440_collections
npm run db:seed
npm run validate:foundation
npm run validate:navigation
npm run build
npm run dev
```

Esta versión requiere migración de Prisma.


## v4.7.4 — Conciliación bancaria

Ruta:

```text
Finanzas → Conciliación bancaria
```

Rama sugerida:

```text
feature/conciliacion-bancaria
```

Commit:

```text
feat(finanzas): implementar conciliación bancaria y relación de movimientos
```

Instalación:

```powershell
docker compose up -d
npm install
npm run db:generate
npm run db:migrate -- --name v450_conciliacion_bancaria
npm run db:seed
npm run validate:foundation
npm run validate:navigation
npm run build
npm run dev
```

Esta versión requiere migración de Prisma.


## v4.7.4 — Flujo de efectivo

Ruta:

```text
Finanzas → Flujo de efectivo
```

Rama sugerida:

```text
feature/flujo-efectivo
```

Commit:

```text
feat(finanzas): implementar flujo de efectivo y escenarios de proyección
```

Instalación:

```powershell
docker compose up -d
npm install
npm run db:generate
npm run db:migrate -- --name v460_flujo_efectivo
npm run db:seed
npm run validate:foundation
npm run validate:navigation
npm run build
npm run dev
```

Esta versión requiere migración de Prisma.


## v4.7.4 — Contabilidad

Ruta:

```text
Finanzas → Contabilidad
```

Rama sugerida:

```text
feature/contabilidad
```

Commit:

```text
feat(contabilidad): implementar catálogo de cuentas, periodos y pólizas automáticas
```

Instalación:

```powershell
docker compose up -d
npm install
npm run db:generate
npm run db:migrate -- --name v470_contabilidad
npm run db:seed
npm run validate:foundation
npm run validate:navigation
npm run build
npm run dev
```

Esta versión requiere migración de Prisma.


## v4.7.4 — Información contextual de KPI

Rama sugerida:

```text
feature/info-kpi
```

Commit:

```text
feat(ui): agregar información contextual a todas las tarjetas KPI
```

Esta versión no requiere una migración nueva de Prisma.

Validación:

```powershell
npm install
npm run validate:foundation
npm run validate:navigation
npm run build
npm run dev
```


## v4.7.4 — KPI Cards uniformes

Rama sugerida:

```text
fix/kpi-cards-uniformes
```

Commit:

```text
fix(ui): uniformar tarjetas KPI y mostrar la información sobre todos los elementos
```

No requiere migración de Prisma.

```powershell
npm install
npm run validate:foundation
npm run validate:navigation
npm run build
npm run dev
```


## v4.7.4 — Corrección definitiva de KPI

Rama sugerida:

```text
fix/estandar-kpi-global
```

Commit:

```text
fix(ui): forzar diseño uniforme de KPI y eliminar actualización del popover
```

No requiere migración de Prisma.

```powershell
npm install
npm run validate:foundation
npm run validate:navigation
npm run build
npm run dev
```


## v4.7.4 — Componente único de KPI

Rama sugerida:

```text
fix/componente-kpi-unico
```

Commit:

```text
fix(ui): reemplazar las KPI por un componente único y corregir su estructura interna
```

No requiere migración.

```powershell
npm install
npm run validate:foundation
npm run validate:navigation
npm run build
npm run dev
```
