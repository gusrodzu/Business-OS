# Vercel Hobby — main-only automatic deployments

## Why
Business OS previously received GitHub/Vercel errors with `api-deployments-free-per-day` and `build-rate-limit`. Frequent pull-request commits can consume the Hobby project's quota even when frontend build and QA are green. A Vercel quota failure is not proof that the app failed to compile.

## Policy
Both `vercel.json` (repository root) and `apps/web/vercel.json` (possible Vercel project root) declare:

```json
"git": {
  "deploymentEnabled": {
    "*": false,
    "main": true
  }
}
```

Vercel's documented minimatch behavior applies the more permissive result when a branch matches multiple patterns; thus only the `main` branch receives an automatic Git deployment. Preview branches are skipped.

**Do not copy/replace the rest of the files.** Their build, output, SPA rewrite, CORS/CSP and security headers differ by root-directory setup and are preserved as-is.

## CI workflow
- Every GitHub pull request still receives the existing frontend lint/build, offline UAT, security, multi-tenant and browser checks.
- Vercel Preview deployments are intentionally disabled to conserve quota.
- Merges/commits on `main` still trigger normal production deployments when the quota permits.
- `npm run vercel:deploy:audit` validates both JSON configs and critical build/SPA/security settings; Frontend QA also runs it.

## Operational verification
1. Determine the configured **Root Directory** and **Production Branch** under the Vercel project settings. It should be compatible with one of the two configs and `main`, respectively.
2. Check Usage / Deployments to see whether the daily limit has reset. This policy **cannot** reset the counter or force a `READY` deployment.
3. After quota resets, verify the next production deployment reaches `READY`, its source commit matches `main`, the site serves the expected asset versions and auth/offline smoke checks pass.
4. Confirm a new feature branch/PR does not create a Preview deployment; GitHub QA must still run.
5. If still blocked despite quota reset, review deployment settings, build logs and any extra deployment automation or other Vercel projects consuming the account quota.

Do not merge failing PRs to produce a new deployment, do not upgrade billing automatically, and do not disable GitHub QA to work around the Vercel quota.
