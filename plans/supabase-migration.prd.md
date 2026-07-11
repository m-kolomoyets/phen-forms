# PRD: Migrate API layer to Supabase (Google OAuth + typed data client)

## Problem Statement

The app is a scaffold running on mock data: HTTP calls go through `ky` to DummyJSON, intercepted by MSW, behind a hand-rolled token auth (`authExample`) and custom role-based access control. None of it talks to a real backend, sessions are manually managed and brittle, and there is no typesafety against an actual database schema. The team wants a real backend with real authentication and end-to-end type safety.

## Solution

Adopt Supabase as the backend. Users sign in with **Google** (OAuth); Supabase manages the session (persistence + auto token refresh) natively. Data access goes through the Supabase client, **typed against the server schema** (types generated from the live project). MSW and `ky` are removed entirely. There are **no roles** for now — access is signed-in vs. not; fine-grained per-instance access management is a future concern. Tables are generated later, so the client must already be typesafe with a stub schema that regenerates cleanly.

## User Stories

1. As a user, I want to sign in with my Google account, so that I don't manage another password.
2. As a user, I want my session to persist across reloads, so that I stay signed in.
3. As a user, I want my access token refreshed automatically, so that my session doesn't drop mid-use.
4. As a user, I want signing out to take effect immediately, so that my data is no longer accessible.
5. As a user, I want signing out in one tab to sign me out everywhere, so that shared devices are safe.
6. As a user visiting a protected page while signed out, I want to be redirected to login, so that I know I must authenticate.
7. As a user returning from Google, I want to land on the dashboard automatically, so that the OAuth round-trip feels seamless.
8. As a signed-in user visiting the login page, I want to be redirected away, so that I'm not asked to log in twice.
9. As a first-time Google user, I want an account created automatically, so that I don't fill a signup form.
10. As a developer, I want data services to call Supabase behind the existing service seam, so that TanStack Query wiring stays unchanged.
11. As a developer, I want the Supabase client typed against the DB schema, so that table/column mistakes are caught at compile time.
12. As a developer, I want a `gen:types` script, so that I regenerate DB types after schema changes.
13. As a developer, I want a stub schema shipped now, so that the app compiles before real tables exist.
14. As a developer, I want MSW fully removed, so that there is no mock interception in dev or the bundle.
15. As a developer, I want `ky` and `VITE_API_URL` removed, so that the codebase has a single I/O path.
16. As a developer, I want the RBAC layer removed, so that dead role logic doesn't mislead.
17. As a developer, I want a `users` service converted to Supabase as a reference, so that I have a copy-paste pattern for real tables.
18. As a developer, I want unused example screens (merchants, vouchers) removed, so that the template is clean.
19. As a developer, I want env validation to require the Supabase vars, so that misconfiguration fails fast and readable.
20. As a developer, I want an auth-state listener at the root, so that the query cache and router stay in sync with session changes.

## Implementation Decisions

**Auth**
- Google OAuth via `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`.
- Native session: `createClient` auth options `persistSession`, `autoRefreshToken`, `detectSessionInUrl` all on. No manual token storage, no 401 refresh queue.
- Identity: `me` resolves from `supabase.auth.getUser()`. No profile table, no roles.
- Root subscription to `supabase.auth.onAuthStateChange`: on `SIGNED_OUT` clear the query cache + invalidate the router; otherwise invalidate the `me` query.
- LoginForm becomes a single "Sign in with Google" button (email/password form and signup form removed — Google auto-provisions accounts).

**Data layer**
- Keep the `services/<domain>/api.ts` seam; swap `ky` bodies for `supabase.from(...)` (throw on `error`, return `data`). TanStack Query `queryOptions`/`mutationOptions`/`queryKeys` structure unchanged.
- `users` service converted as the reference pattern (`select('*')`, `.eq('id', …).single()`).

**Typesafety**
- `createClient<Database>` with `Database` from a generated `database.types.ts`.
- Ship a hand-written stub `Database` with a placeholder `users` table (Row/Insert/Update) mirroring the current shape, matching the generator's output so regen is a clean overwrite.
- `gen:types` script: `supabase gen types typescript --project-id $PROJECT_ID`.

**Removals**
- MSW: mocks dir, generated worker script, `msw` package + package.json `msw` key, `prepareMSW` bootstrap, `VITE_USE_MSW`.
- `ky`: `@http` client, package, `VITE_API_URL`. Retype the query client's default error from the ky `HTTPError` to `Error`.
- RBAC: permissions util, role config/constants, permission checks in route guards.
- Example domains: merchants + vouchers routes and modules; sidebar nav entries and their icons/permission keys.

**Routing / guards**
- `_authenticated`: `beforeLoad` reads `getSession()`; no session → redirect to `/login?redirect=…`; else ensure `me` and set auth context. No permission checks.
- `_unauthenticated`: redirect signed-in users away (keep `validateSearch` redirect schema).
- `_public`: resolve session/`me` for context, tolerate anonymous.
- Router context `auth` type updated to `{ isAuthenticated; user }` union.

**Env**
- `envSchema` requires `VITE_SUPABASE_URL` (url) + `VITE_SUPABASE_PUBLISHABLE_KEY`; drop `VITE_API_URL`. Update `vite-env.d.ts` and `.env.local.example`.

## Testing Decisions

**No test runner is configured in this repo** (no unit/e2e per project conventions), so automated tests are out of scope. Verification is manual + static:

- Good check = observe external behavior, not internals.
- `pnpm tsc` — full type check (stub `Database` must cover the `users` service and auth `User`).
- `pnpm lint` — eslint/stylelint/prettier clean (named effect fn for the auth listener, block bodies, no `forwardRef`).
- `pnpm build` — succeeds (husky pre-push chains tsc → lint → build).
- `pnpm knip` — only the expected unused-`users` warning.
- Manual runtime flows: protected route while signed out → `/login`; Google sign-in round-trip → dashboard; logout clears cache → `/login`; second-tab sign-out reflected via `onAuthStateChange`; no MSW interception / no `ky`/`VITE_API_URL` in bundle.
- If a test runner is later added, the deepest testable seam is the auth service interface (`login`/`logout`/`me`/session) mocking the Supabase client.

## Out of Scope

- Roles / RBAC / per-instance access management (future).
- Real table schemas + RLS policies (generated later; stub only now).
- Password reset, email/password login, non-Google providers.
- SSR / `@supabase/ssr` (client-only SPA).
- Profile tables, user invitations, sharing access to other users.
- Supabase dashboard config (Google provider, redirect URLs) — a prerequisite, not code.

## Further Notes

- Prerequisites before running: enable Google provider + redirect URLs in Supabase dashboard; set real `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`; have `PROJECT_ID` + access token for `gen:types`.
- After real tables exist, run `pnpm gen:types` to overwrite the stub; the `users` reference service then becomes genuinely typesafe against the live schema.
- Detailed step-by-step lives in the plan file: `~/.claude/plans/noble-strolling-manatee.md`.
