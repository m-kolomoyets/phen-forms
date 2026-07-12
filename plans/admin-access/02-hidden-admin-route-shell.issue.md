## What to build

The hidden admin area shell. An `_authenticated/admin/` layout route whose single `beforeLoad` guard calls `am_i_admin()`; a non-admin is **silently redirected** to `/questionnaires` (behaves as if the route does not exist — no error, no forbidden signal). The layout renders an admin sub-nav (Users | Questionnaires) and an outlet. The index route redirects to the admin questionnaires list. **No navigation link to `/admin` exists anywhere in the app** — it is reachable only by typing the URL.

The child list screens are stubs at this slice (filled by slices 3 and 5); this slice delivers the guarded, non-obvious shell end-to-end.

## Acceptance criteria

- [ ] `_authenticated/admin/` layout route with one `beforeLoad` guard using `am_i_admin()`.
- [ ] Non-admin hitting any `/admin*` path → silent redirect to `/questionnaires`, no error/forbidden UI.
- [ ] Admin reaching `/admin` → lands in the shell; index redirects to `/admin/questionnaires`.
- [ ] Admin sub-nav (Users | Questionnaires) renders with an outlet.
- [ ] No link, button, or hint to `/admin` exists anywhere in app navigation.

## Blocked by

- Blocked by #plans/admin-access/01-admin-identity-foundation.issue.md
