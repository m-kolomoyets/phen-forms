## What to build

End-to-end Google sign-in. A signed-out user hitting a protected route is redirected to `/login`, clicks "Sign in with Google", completes the OAuth round-trip, and lands on the dashboard. Rename `authExample` service → `auth`; `me` resolves from `supabase.auth.getUser()`. No roles, no email/password.

## Acceptance criteria

- [ ] `services/authExample` renamed to `services/auth`; `api.ts` `login()`→`signInWithOAuth({provider:'google', options:{redirectTo: window.location.origin}})`, `me()`→`getUser()`, plus a `getSession()` helper. Refresh/token logic deleted.
- [ ] `authKeys` (renamed from `authExampleKeys`); `meQueryOptions` keeps `staleTime`.
- [ ] `types.ts`: `AuthContext = { isAuthenticated:true; user:User } | { isAuthenticated:false; user:null }` using Supabase `User`; `MeData`/`AuthRole`/refresh types removed.
- [ ] LoginForm is a single "Sign in with Google" button (email/pw form + signup removed).
- [ ] `_authenticated` `beforeLoad` uses `getSession()` → redirect `/login?redirect=…` if none, else ensure `me` + set `context.auth`.
- [ ] `_unauthenticated` redirects signed-in users away (keeps `validateSearch` redirect schema); `_public` resolves session tolerantly.
- [ ] `src/lib/utils/auth/tokens.ts` + `errorHandler.ts` deleted; router context `auth` type updated.
- [ ] `pnpm tsc` + `pnpm lint` pass; manual: signed-out→login, Google→dashboard, signed-in on /login→redirected.

## Blocked by

- Blocked by #01-typed-supabase-client-and-env
