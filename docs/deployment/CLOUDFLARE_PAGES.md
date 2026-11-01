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

## Evidence and open gates (2026-10-31)
- `main` includes Workers Static Assets configuration from PR #251.
- Cloudflare API returned existing `business-os` deployments with source `dash_template` (latest version `cd89f01e-d29a-4e11-a04f-7ef545879b84`, 2026-10-30); **no deployed Git SHA was verified**.
- Cloudflare API returned **zero builds and zero triggers** for `business-os` in the queried account. This does not establish whether the dashboard's Git connection is configured elsewhere; inspect its actual settings and permissions before triggering a build.
- **P0 remains open**: verify Git Build connection/permissions and first successful main deployment, then confirm served SHA, SPA deep-link refresh, assets, headers, PWA and authenticated API integration.
- Smoke must cover ERP and Super Admin roles, two distinct tenants, forbidden access, company switching, API session/CORS/CSRF, demo offline, and PWA caching boundaries. Include visual/mobile/keyboard checks and rollback evidence.
- Keep Vercel and DNS unchanged as fallback; DNS cutover requires separate explicit authorization. Do not claim DEPLOY-02, QA-01 or RELEASE-01 completed until authenticated live evidence exists.

Roadmap: https://github.com/gusrodzu/Business-OS/issues/73 · Next contract: https://github.com/gusrodzu/Business-OS/issues/234
