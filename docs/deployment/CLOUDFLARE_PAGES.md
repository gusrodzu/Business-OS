# Business OS · Cloudflare Workers Static Assets (frontend only)

> **Supersedes the previous Cloudflare Pages plan (2026-10-31).** This document retains its legacy filename to avoid breaking existing links. The authorized target is the existing Cloudflare Worker **`business-os`** at https://business-os.gorz12.workers.dev/. Do **not** deploy to Pages, create a second Worker, rename the repo/brand, or modify Atlas.

## Build and deployment contract
- Repository: `gusrodzu/Business-OS`, branch `main`; npm workspaces at repository root.
- Cloudflare Git Builds: **root directory empty**, build command `npm run build`, deploy command `npx wrangler deploy --config ./wrangler.toml`.
- Vite app: `apps/web`; output: `apps/web/dist`.
- `wrangler.toml` sets `name = "business-os"` and `[assets]` with `directory = "./apps/web/dist"` and `not_found_handling = "single-page-application"`. Never reintroduce `pages_build_output_dir` or `wrangler pages deploy`.
- The obsolete manual Pages publication workflow was retired. GitHub Actions remains an independent QA gate; a green GitHub check does **not** demonstrate that Cloudflare has deployed the same SHA.
- The Cloudflare build token needs **Workers Scripts: Edit** on the authorized account. Keep it in the provider's secret store; never commit or print it. Do not create placeholder credentials.
- Public Vite variable `VITE_API_URL` must point to the real HTTPS backend API ending in `/api`. Verify the value in the actual Git Build configuration before production. Do not publish a build using the localhost fallback.

## Backend and security boundary
Cloudflare Workers Static Assets hosts the **frontend only**. The separate Node/Render API and PostgreSQL must remain protected. Confirm CORS allowed origin, secure cookie/SameSite behavior, CSRF, authentication, role authorization and tenant isolation on the deployed origin. Never expose database credentials or backend secrets via `VITE_*`. Keep ERP a medida and SaaS multiempresa isolated.

## Estado operativo y control de versiones (noviembre 2026)

- El frontend se despliega únicamente en **Cloudflare Workers Static Assets**
  desde Git Builds de `main` al Worker existente `business-os`.
- La API y PostgreSQL son servicios independientes. No cambiar sus endpoints,
  CORS, cookies, secretos ni permisos por retirar un frontend anterior.
- `vercel.json`, `apps/web/vercel.json` y el validador Vercel se eliminaron;
  `npm run release:final` comprueba Wrangler, cabeceras y aislamiento.
- Las cabeceras HTTP (CSP, HSTS, X-Frame-Options) se mantienen en
  `apps/web/public/_headers`, que también audita GitHub Actions.
- Verificar siempre el SHA publicado contra el SHA de `main`; una prueba de
  GitHub Actions verde no demuestra por sí sola una publicación Cloudflare.
- La desconexión de la app GitHub de Vercel y del proyecto remoto **no puede
  completarse sólo con un commit**. Seguir `docs/deployment/RETIRAR_VERCEL.md`.

## Comprobación de producción pendiente

Revisar sesión real, permisos por rol, dos tenants, aislamiento, CORS/CSRF,
PWA, almacenamiento y formularios transaccionales tras cada despliegue de UI.
Mantener el frontend y el ERP del cliente separados del SaaS multiempresa.
