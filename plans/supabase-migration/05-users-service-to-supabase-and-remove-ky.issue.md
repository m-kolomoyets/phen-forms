## What to build

Convert the `users` service to Supabase as the reference pattern for future tables, and remove `ky` entirely (the last non-Supabase I/O path).

## Acceptance criteria

- [ ] `src/services/users/api.ts`: `getUsers()`→`supabase.from('users').select('*')`, `getUser(id)`→`.eq('id', id).single()` (throw on `error`, return `data`). No `httpPrivate`.
- [ ] `src/services/users/types.ts`: `User` derived from `Database['public']['Tables']['users']['Row']`; `AuthRole` import removed. queries.ts/queryKeys.ts unchanged.
- [ ] `src/lib/@http.ts` deleted; `ky` uninstalled; `VITE_API_URL` removed from `envSchema`/`vite-env.d.ts`.
- [ ] `src/lib/@queryClient.ts` `Register.defaultError` retyped `HTTPError<BaseErrorData>` → `Error`; error toast still works.
- [ ] `pnpm tsc` passes; `pnpm knip` shows only the expected unused-`users` warning.

## Blocked by

- Blocked by #01-typed-supabase-client-and-env
