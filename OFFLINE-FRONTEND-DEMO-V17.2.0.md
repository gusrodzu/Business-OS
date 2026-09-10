# BuzzBee v17.2.0 — Offline Frontend Demo

`admin@erp.local` ahora es una cuenta de demostración completamente local al frontend.

## Credenciales
- Usuario: `admin@erp.local`
- Contraseña: `Admin123!`

## Comportamiento
- No ejecuta `POST /auth/login`.
- No ejecuta `GET /auth/me`.
- No ejecuta `POST /auth/logout`.
- Mientras la sesión tenga `offlineDemo: true`, `apiRequest()` nunca usa Axios ni `VITE_API_URL`.
- Las respuestas se resuelven desde `apps/web/src/offlineDemo.js`.
- Las mutaciones se simulan localmente. La configuración de empresa se persiste en `localStorage`; el resto de operaciones son efímeras y vuelven a los fixtures al recargar.
- El modo muestra una barra `DEMO LOCAL · Frontend-only · sin API ni PostgreSQL`.

## Objetivo
Permitir desplegar sólo `apps/web` en Vercel y recorrer BuzzBee aun cuando API, workers y PostgreSQL no estén disponibles.

## Seguridad
Este modo sólo representa datos ficticios incluidos en el bundle. No contiene secretos de producción ni otorga acceso a la API. No debe reutilizarse como mecanismo de autenticación de usuarios reales.
