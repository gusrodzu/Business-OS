# Business OS — Retirar Vercel sin interrumpir Cloudflare

## Decisión de infraestructura

- Único frontend activo: **Cloudflare Workers Static Assets**.
- Worker autorizado: `business-os` (`https://business-os.gorz12.workers.dev/`).
- Origen del build: GitHub `gusrodzu/Business-OS` → rama `main`.
- Build `npm run build`; deploy `npx wrangler deploy --config ./wrangler.toml`.
- La API y PostgreSQL continúan separados. No cambiar rutas de backend, roles, datos,
  secrets, CORS, DNS ni licencias por retirar Vercel.

## Cambios dentro del repositorio

- Borrados `vercel.json` y `apps/web/vercel.json`.
- Eliminados validador y script `vercel:deploy:audit` que exigían publicar en Vercel.
- El release gate, pruebas de SPA/deep-links y validadores de CSP/HSTS/antiframes
  usan `wrangler.toml` y `apps/web/public/_headers` (Cloudflare).
- Retirada política antigua de despliegues Vercel; el contrato canónico se
  mantiene en `docs/deployment/CLOUDFLARE_PAGES.md`.
- GitHub Actions permanece habilitado (frontend, seguridad, Prisma, backend,
  transaccionales, browser y rutas); la política debe evitar recrear archivos
  de Vercel en PR futuros.

## Desconexión externa (requiere acceso a tu cuenta; un commit NO la ejecuta)

1. En **Vercel Dashboard**, abre **cada proyecto** que esté vinculado a
   `gusrodzu/Business-OS` (por ejemplo, antiguos proyectos de vista previa).
2. Ve a **Settings → Git → Connected Git Repository → Disconnect**.
   Esto detiene los nuevos despliegues disparados por la conexión Git.
3. En **GitHub**, abre **Settings → Applications → Installed GitHub Apps → Vercel → Configure**.
   Cambia a **Only select repositories** y **quita Business-OS** de la lista.
   Si no utilizas Vercel para ningún repositorio de esa cuenta, puedes
   **Uninstall**; no desinstales globalmente si da servicio a otros proyectos.
4. Revisa **GitHub → Business-OS → Settings → Rules → Rulesets**. Ninguna regla
   debe requerir un check de Vercel; preserva los checks de GitHub Actions.
5. Revisa un nuevo commit/PR: no deben generarse nuevas compilaciones ni
   notificaciones de Vercel; sí deben ejecutarse GitHub Actions y Cloudflare.
6. Si aparece un check *histórico* de Vercel, no intentes eliminarlo mediante
   commits; pertenece a los checks publicados por la integración externa.
   Verifica que Vercel esté realmente desconectado y sin acceso al repositorio.

Fuentes oficiales:
- https://vercel.com/docs/project-configuration/git-settings
- https://docs.github.com/en/apps/using-github-apps/reviewing-and-modifying-installed-github-apps

## Criterio de cierre

- `node --test scripts/validate-cloudflare-pages-policy.test.mjs`: PASS.
- `npm run release:final` y CI del PR: PASS.
- Build de Cloudflare para el SHA fusionado: **success**, despliegue en el
  Worker actual con la versión publicada al 100 %.
- Vercel desconectado desde su configuración externa; no quedan nuevos
  despliegues automáticos ni checks externos persistentes.
- No tocar ni eliminar el Worker `business-os`, el backend ni los DNS.
