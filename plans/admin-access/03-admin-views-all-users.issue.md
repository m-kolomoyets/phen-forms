## What to build

Admin can view all users. Add an additive `users_admin_select` RLS policy gated on `is_admin()` (existing `users` policies untouched). Wire the existing `getUsers` service into a read-only `/admin/users` screen: a table showing avatar, name, email, and join date. No user-mutating actions of any kind (no admin-grant toggle — granting stays direct-SQL-only). Per-owner counts are deferred.

## Acceptance criteria

- [ ] Additive `users_admin_select` policy (`using is_admin()`); existing user policies unchanged.
- [ ] `/admin/users` renders a read-only table: avatar, name, email, join date.
- [ ] No mutation controls on the screen.
- [ ] Integration test: admin can SELECT all users; a non-admin still sees only self + co-shared rows (regression: existing user visibility unchanged).

## Blocked by

- Blocked by #plans/admin-access/01-admin-identity-foundation.issue.md
- Blocked by #plans/admin-access/02-hidden-admin-route-shell.issue.md
