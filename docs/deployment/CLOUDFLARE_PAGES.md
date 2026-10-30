# Business OS · Cloudflare Pages (frontend only)

**Decision (2026-10-30):** migrate the Business OS Next **frontend** progressively from Vercel to Cloudflare Pages. The official Pages **project name is `business-os`**, not `business-os-next`. Do not rename the GitHub repository or brand; do not modify Atlas.

## Confirmed facts
- GitHub monorepo root: `/` with npm workspaces; install `npm ci --include=dev`.
- Vite frontend: `apps/web`; build `npm run build --workspace apps/web`; output `apps/web/dist`.
- React Router is an SPA. Cloudflare Pages serves `/index.html` for unknown client routes when no top-level `404.html` exists; verify deep-link refresh **on the actual deployment**.
- Vite reads **public** `VITE_API_URL` at build time, with a local-only fallback `http://localhost:4000/api`. Never ship that fallback as a live production backend.
- Cloudflare Pages serves **static frontend assets only**. The Node API, PostgreSQL, authentication, CORS, cookies, CSRF, role enforcement, tenant isolation and secrets require a separately secured backend. Never expose database credentials or API secrets through `VITE_*`.
- On 2026-10-30 the authorized Cloudflare account had no Pages projects. The new **direct-upload** project `business-os` was created with production branch `main` and assigned `business-os-59m.pages.dev`; **zero deployments at creation**. This reserved URL is **not** evidence of a live app.

## Safe release workflow
`.github/workflows/cloudflare-pages-release.yml` is **manual only**, with no push/PR or automatic release triggers. It refuses to publish unless:
1. The operator dispatches from `main`, enters the **exact 40-character SHA** and checks `confirm_publish`.
2. GitHub Actions has secrets `CLOUDFLARE_API_TOKEN` (scoped to the correct account, **Cloudflare Pages: Edit**) and `CLOUDFLARE_ACCOUNT_ID`. Do not commit their values.
3. GitHub Actions variable `BUSINESS_OS_API_URL` points to the real HTTPS API base ending in `/api`, with server-side CORS, cookies and CSRF configured for the Pages origin. This variable is intentionally public because Vite embeds it.
4. Lint, build, release/offline/tenant checks, UI/mobile and security regressions pass **in that workflow**. It then uses Wrangler Direct Upload for the existing `business-os` project.
5. Configure the `cloudflare-pages` GitHub Environment with appropriate reviewer restrictions before the first dispatch. No deployment is authorized merely by merging this configuration.

`wrangler.toml` pins the Pages name/output; `apps/web/public/_headers` preserves security headers and immutable hashed asset caching. No Pages Functions or Node API is deployed. The service worker caches public shell/assets only; audit tenant isolation and PWA behavior on a live origin.

## Verification required before migration
- **Cloudflare deployment:** actual Pages production deployment status, URL, deployed SHA, asset loading, deep links with direct refresh, 404/asset behavior, headers and HTTPS.
- **Full-stack authenticated smoke:** ERP role, Super Admin role, two distinct tenants, permission-denied paths, switching, data/API routes, CSRF/session/CORS, real API reachability; separately verify offline demo and PWA update/install without tenant data caching.
- **Quality:** GitHub Actions independent QA green, responsive and light/dark screenshots, WCAG/keyboard, bundle and rollback readiness.
- **Cutover:** keep Vercel project and domain unchanged as fallback until the above is evidenced; **DNS changes require a separate explicit authorization**. Do not disable Vercel triggers or required checks prematurely.
- **Release gate:** keep #73 DEPLOY-02 / QA-01 / RELEASE-01 and #234 NEXT-RELEASE-01 open until live evidence, not just CI success or a created Pages project.

Reference: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/ and https://developers.cloudflare.com/pages/configuration/serving-pages/
