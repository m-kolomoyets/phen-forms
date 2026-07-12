## What to build

The app-level admin identity primitive. A dedicated `admin_users` table (keyed on `user_id → auth.users`), RLS-enabled with **no policies** so no role can read it directly. A `SECURITY DEFINER` `is_admin()` predicate (empty `search_path`, `stable`) — the single source of truth every admin policy and RPC will gate on. A thin `am_i_admin()` RPC returning a boolean for the client route guard. Granting admin is direct-SQL-only: no RPC, no UI, no seed trigger, no email committed to migrations.

Document the bootstrap step (sign in via Google once, then insert the caller's `auth.users` id into `admin_users` by email lookup) as a comment/README note next to the migration — not as app code.

## Acceptance criteria

- [ ] `admin_users` table exists, keyed on `user_id` referencing `auth.users`, RLS enabled, zero policies.
- [ ] `is_admin()` is `SECURITY DEFINER`, `search_path=''`, `stable`, returns true only when `auth.uid()` is in `admin_users`.
- [ ] `am_i_admin()` RPC returns the same boolean, callable by any authenticated user.
- [ ] A non-admin probing `admin_users` directly (select) gets zero rows, not an error.
- [ ] Bootstrap SQL is documented (not executed in a migration; no email hardcoded).
- [ ] Integration test: admin fixture → `is_admin()`/`am_i_admin()` true; non-admin → false.

## Blocked by

None - can start immediately.
