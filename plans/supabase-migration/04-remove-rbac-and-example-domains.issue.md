## What to build

Strip role-based access control (no roles now) and the unused example screens. Guards become signed-in vs. not; the sidebar shows only real destinations.

## Acceptance criteria

- [ ] `src/lib/utils/auth/permissions.ts` deleted; `ROLES_IDS`/`ROLES_CONFIG`/role + LS token key constants removed from `src/lib/constants.ts`.
- [ ] No permission checks remain in any route `beforeLoad`.
- [ ] `merchants` + `vouchers` routes (`src/routes/_authenticated/*`) and modules (`src/modules/Merchants`, `src/modules/Vouchers`) deleted; `routeTree.gen.ts` regenerated.
- [ ] `SidebarNavigation/constants.ts` drops merchants+vouchers entries, unused icon imports, and the `rolePermissionKey` field; `SidebarNavigation/index.tsx` drops the `hasPermissions` filter.
- [ ] `pnpm tsc` + `pnpm lint` + `pnpm build` pass.

## Blocked by

- Blocked by #02-google-oauth-signin-and-guards
