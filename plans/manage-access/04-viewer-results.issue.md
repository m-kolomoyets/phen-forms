## What to build

A viewer can open the results (charts + response table) but has no access to the
constructor — the menu entry is hidden and the route is blocked.

Layers:
- RLS: widen `responses` + `answers` SELECT to owner OR view-access
  (`can_view_resp_q` OR `can_edit_q`).
- `get_questionnaire_stats`: replace owner-only guard with owner OR view-access.
- Results route `beforeLoad` guard: allow owner/editor/viewer; else → list.
- Constructor entry hidden for viewers (sidebar/menu); builder route blocks
  viewers (redirect to results).
- Viewer card action menu: View results, Copy link, Preview only.

## Acceptance criteria

- [ ] Viewer can open results and see charts (stats RPC succeeds).
- [ ] Viewer can see the response table.
- [ ] Viewer cannot open the constructor (menu hidden + route redirects).
- [ ] Viewer card menu shows only View results, Copy link, Preview.
- [ ] Editors also retain results access (view-access = can_edit OR can_view).
- [ ] Anonymous public fill-in flow is unaffected.
- [ ] `pnpm tsc`, `pnpm lint`, `pnpm build` pass.

## Blocked by

- Blocked by #02-shared-card
