## What to build

Keep the app reactive to session changes. A root subscription to `supabase.auth.onAuthStateChange` syncs the TanStack Query cache + router; logout signs out and clears state; signing out in one tab reflects in another.

## Acceptance criteria

- [ ] Root subscription (`src/App.tsx`, named effect function per lint) to `onAuthStateChange`: `SIGNED_OUT` → `queryClient.clear()` + `router.invalidate()`; else `invalidateQueries(authKeys.meQueryKey())`. Unsubscribes on cleanup.
- [ ] `logoutMutationOptions` (or handler) calls `supabase.auth.signOut()` then clears cache + invalidates router.
- [ ] Logout returns user to `/login`; protected data no longer accessible.
- [ ] Multi-tab: sign out in tab B → tab A reacts.
- [ ] `pnpm tsc` + `pnpm lint` pass.

## Blocked by

- Blocked by #02-google-oauth-signin-and-guards
