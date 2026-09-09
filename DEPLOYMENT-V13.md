# Deployment BuzzBee v13 RC1

## Frontend Vercel
- Root Directory: `apps/web`
- Framework: Vite
- Install: `npm install`
- Build: `npm run build`
- Output: `dist`
- Node: 24.x
- Config SPA: `apps/web/vercel.json`

Configurar la URL pública de la API mediante la variable que ya consuma el cliente (revisar `.env.example`).

## API
La API Express debe desplegarse como servicio Node persistente (por ejemplo Cloud Run/Railway/Render) salvo que se haga una adaptación explícita a funciones serverless. Requiere PostgreSQL accesible, secretos JWT y CLIENT_URL apuntando al dominio de Vercel.

## Gate antes de producción
1. `npm run qa:rc`
2. Suites runtime E2E en staging.
3. `npm run build`
4. Verificar `/api/health` y `/api/ready`.
5. Login, permisos, multiempresa, P2P, O2C, inventario, finanzas, RRHH, CRM y POS con datos de staging.
