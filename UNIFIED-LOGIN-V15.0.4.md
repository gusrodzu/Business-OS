# BuzzBee v15.0.4 — Unified Login

BuzzBee now exposes one login flow for ERP users and SaaS Super Admin accounts.

## Decision flow
1. `/login` receives email + password.
2. API validates the account.
3. API detects `platform.manage` server-side.
4. Platform account -> MFA setup/verification -> 45-minute platform session -> `/admin-saas`.
5. Tenant account -> active company validation -> 8-hour ERP session -> `/`.

The browser does not send an ERP/platform selector. Session context is decided by the API. `/admin-login` remains only as a compatibility redirect to `/login`.

Security boundaries from v15.0.3 remain unchanged: platform sessions cannot access tenant APIs and ERP sessions cannot access platform APIs.
