# BuzzBee ERP — QA integral v13.2.1

## Objetivo

Unificar en un solo comando los checks vigentes del ERP y evitar falsos negativos provocados por auditores históricos que validaban arquitectura, copy o números de versión ya reemplazados por estándares posteriores.

## Resultado estático certificado

`npm run qa:all`

- Base: **4/4 PASS**
- Flujos funcionales: **9/9 PASS**
- Plataforma / seguridad / confiabilidad: **16/16 PASS**
- UX/UI global: **15/15 PASS**
- Programa 100/100 ya certificado: **2/2 PASS**
- Release Candidate: **1/1 PASS**
- Total: **47/47 suites PASS**

El detalle ejecutable se genera automáticamente en:

- `artifacts/qa/qa-all-v13.2.1.md`
- `artifacts/qa/qa-all-v13.2.1.json`

## Correcciones realizadas durante la auditoría

1. Agenda: se agregaron permisos explícitos `agenda.read` y `agenda.manage` a lectura y mutaciones.
2. Seed: se agregaron ambos permisos para que puedan asignarse por rol.
3. Cobertura de mutaciones protegidas: **221/221 = 100%**.
4. `NotFound.jsx` dejó de contarse como pantalla funcional que deba consumir API.
5. Auditoría de RR. HH. actualizada para reconocer la máquina de estados centralizada de nómina.
6. Se eliminó `HrClientCenter`, una pantalla legacy sin ruta/import que duplicaba la experiencia actual de RR. HH.
7. Los auditores de Core/Integraciones ahora validan la versión centralizada actual en vez de exigir literales históricos como 10.6.0 o 10.8.0.
8. Navegación Administración/Finanzas quedó validada contra la arquitectura actual racionalizada.
9. Versión de aplicación alineada a **13.2.1** en root, API, web y `APP_VERSION`.

## Checks históricos

Los scripts antiguos se conservan como evidencia/regresión histórica, pero no todos son gates de release. Algunos validan decisiones que posteriormente fueron reemplazadas, por ejemplo drawers laterales v8.7 frente al estándar de modales centrados v9.2+, o entradas de navegación eliminadas por la racionalización de módulos v12.2.

`qa:all` usa la validación canónica más reciente de cada dominio para evitar que dos estándares contradictorios bloqueen el release.

## Runtime completo

Para validar comportamiento con API + PostgreSQL activos:

```bash
npm run qa:all:full
```

Este modo agrega smoke tests y pruebas runtime de P2P, O2C, Inventario, Administración/Finanzas, RR. HH., CRM, POS, Intelligence, Core SaaS y consistencia cross-module.

No debe confundirse el **47/47 estático** con una prueba runtime sobre una base real. Para certificar producción, el runtime debe ejecutarse en el entorno del cliente con PostgreSQL/API activos y revisar su reporte.

## Programa 100/100

La auditoría integral confirma que la base técnica para los módulos actuales está sana. Sin embargo, el sello 100/100 de experiencia de usuario sigue siendo independiente por rol:

- Dirección: **100/100 técnico ✅**
- Administración: **100/100 técnico ✅**
- Compras: funcional QA PASS; falta auditoría específica 100/100 de usuario
- Inventario: funcional QA PASS; falta auditoría específica 100/100 de usuario
- Finanzas: funcional QA PASS; falta auditoría específica 100/100 de usuario
- RR. HH.: funcional QA PASS; falta auditoría específica 100/100 de usuario
- Ventas + CRM: funcional QA PASS; falta auditoría específica 100/100 de usuario
- Proyectos: funcional QA PASS; falta auditoría específica 100/100 de usuario
- Administrador: seguridad/plataforma PASS; falta auditoría específica 100/100 de usuario

Esto evita declarar 100/100 sólo porque el código pasa checks técnicos.
