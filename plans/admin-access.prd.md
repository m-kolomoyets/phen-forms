# Admin Access — PRD

## Problem Statement

There is no way for a trusted operator to oversee the whole platform. Today all authorization is strictly per-questionnaire (owner / editor / viewer via `questionnaire_shares`). Nobody can view all users, view every questionnaire and its responses, manage access on questionnaires they don't own, edit any questionnaire, delete a questionnaire, or reassign its ownership. There is no app-level role at all.

The operator also needs this capability to be **invisible and hard to reach** for regular users: the admin flow must exist only for a strict, known subset of people, must not be advertised anywhere in the UI, and must not reveal its own existence to anyone probing for it.

## Solution

Introduce an app-level **admin** capability, granted only by direct database access (no in-app path to become admin). An admin can:

- View all users (read-only).
- View all questionnaires, with the owner shown on each.
- Open and edit any questionnaire in the existing builder.
- View the responses of any questionnaire.
- Manage access (share / change role / remove collaborators) on any questionnaire.
- Delete any questionnaire.
- Transfer ownership of any questionnaire to another user.

Admin screens live under a hidden `/admin` area with no navigation link anywhere. A non-admin who reaches `/admin` is silently redirected to `/questionnaires`, indistinguishable from a route that doesn't exist. The real security boundary is the database (RLS + `SECURITY DEFINER` functions); the client hiding is cosmetic, to keep the flow non-obvious.

Regular users see zero change: their pages, queries, roles, and permissions behave exactly as before.

## User Stories

1. As an operator, I want to be made admin only by a direct database insert, so that there is no in-app path anyone could discover or exploit to gain admin.
2. As an operator, I want to bootstrap the first admin by signing in once and running one SQL insert, so that no admin identity is ever committed to the repository.
3. As an operator, I want the admin set stored in its own table, empty by default, so that admin status is never accidentally set on a regular user record.
4. As an admin, I want to reach an admin area by typing its URL, so that the capability exists without being advertised.
5. As a regular user, I want no admin link, hint, or error to ever appear, so that I never learn the admin flow exists.
6. As a regular user probing `/admin`, I want to be redirected as if the page doesn't exist, so that the app never confirms the flow to me.
7. As an admin, I want to see a list of all users (avatar, name, email, join date), so that I can audit who is on the platform.
8. As an admin, I want the user list to be read-only, so that I cannot accidentally mutate users and there is no in-app escalation surface.
9. As an admin, I want to see every questionnaire in one list with its owner shown, so that I can find and oversee any questionnaire regardless of who created it.
10. As an admin, I want my own normal questionnaires list to still show only my own and shared-with-me questionnaires, so that the admin capability doesn't clutter or leak into my everyday view.
11. As an admin, I want to open any questionnaire in the existing builder and edit it, so that I can correct or manage content on any questionnaire.
12. As an admin, I want to view the responses of any questionnaire, so that I can oversee submissions.
13. As an admin, I want to manage access on any questionnaire (add collaborator by email, change role, remove collaborator), so that I can fix or administer sharing for owners.
14. As an admin, I want to delete any questionnaire, so that I can remove abusive or broken content.
15. As an admin, I want to transfer ownership of any questionnaire to another user, so that I can reassign content when an owner changes.
16. As an admin transferring ownership, I want the new owner's now-redundant share row removed automatically, so that access data stays consistent.
17. As an admin transferring ownership, I want the previous owner to simply lose access (unless I re-share), so that ownership stays singular and unambiguous.
18. As an admin who also owns or is shared a specific questionnaire, I want to see my real role on it (owner/editor/viewer), so that admin override only applies to questionnaires I have no other relationship with.
19. As a regular user, I want every one of my existing queries and permissions to behave identically, so that the admin feature introduces no regression.
20. As an operator, I want the entire admin capability to be a small, removable set of additive database policies and functions, so that it can be audited or rolled back in isolation.
21. As an operator, I want the database to be the enforcement boundary, so that hiding the client route is not what protects the data.

## Implementation Decisions

### Identity & granting
- New table `admin_users` keyed on `user_id` referencing `auth.users`. RLS enabled with **no policies**, so no role can read it directly; only the admin predicate reads it.
- New `is_admin()` predicate: `SECURITY DEFINER`, empty `search_path`, `stable`; returns whether the current user is in `admin_users`. Mirrors the existing `has_share` / `can_edit_q` helper pattern (single source of truth for policies).
- Granting is **direct SQL only**. No grant RPC, no UI toggle, no seed trigger, no seeded email in migrations. Bootstrap = sign in via Google OAuth once, then insert the caller's `auth.users` id into `admin_users` by email lookup.

### Enforcement — additive, existing untouched
- Authorization uses **new additive permissive RLS policies** gated on `is_admin()`; existing owner/editor/viewer/share policies are not modified, so regular-user RLS has a zero-line diff.
- New admin SELECT policies on: questionnaires, questions, question options, responses, answers, questionnaire shares, users.
- New admin write policies: questionnaire UPDATE (owner-pinned via with-check — ownership is not changed through this policy), questionnaire DELETE, question/option write, and shares insert/update/delete (so manage-access works for admin).
- Only **functions** are edited in place (they cannot be OR-combined like policies):
  - `my_access(qid)` gains an `'admin'` result as a **fallback**: real role (owner/editor/viewer) is returned first; `'admin'` only when the caller has no other relationship and is an admin. The `MyAccess` type gains `'admin'`.
  - `share_questionnaire(...)` owner check becomes owner-or-admin.

### New RPCs
- `am_i_admin()` → boolean; backs the client route guard.
- `admin_transfer_ownership(qid, new_owner)` → `SECURITY DEFINER`, verifies `is_admin()`, atomically sets `owner_id = new_owner` and deletes any existing share row for `new_owner`. Old owner is left with no access. This is the **only** path that changes `owner_id`, so the admin UPDATE policy stays owner-pinned.
- `list_my_questionnaires()` → `SECURITY DEFINER`, returns only owned + shared-with-me questionnaires (never admin-widened), computing role and shares count server-side. The normal questionnaires list uses this so it is provably immune to admin SELECT widening.

### Routing & client
- Admin route module under `_authenticated/admin/`:
  - Layout route with a single `beforeLoad` guard calling `am_i_admin()`; non-admin → silent redirect to `/questionnaires`. Renders an admin sub-nav (Users | Questionnaires) and an outlet. One guard protects the whole subtree.
  - Index redirects to the admin questionnaires list.
  - Users screen: read-only table (avatar, name, email, join date). No user mutations. Counts deferred.
  - Questionnaires screen: global list showing the owner on each card; row actions for **Transfer ownership** (user picker) and **Manage access** (reuses the existing manage-access dialog). Backed by an unfiltered questionnaires query.
- **No navigation link** to `/admin` anywhere in the app.
- Editing, viewing results, and managing access reuse the **existing** `/questionnaires/$id` screens; admin is admitted because `my_access` now returns `'admin'`. Admin temporarily leaves the admin shell to use them.
- The normal `/questionnaires` list is switched to `list_my_questionnaires()` so it stays scoped for admins too. Single-row questionnaire reads and per-questionnaire response reads stay as-is (already id-scoped, which is exactly what admin reuse needs).

### Admin scope (locked)
View all users / questionnaires / responses · edit all questionnaires · manage all accesses · delete questionnaires · reassign ownership. **Not** deleting responses, and **not** any in-app admin-granting.

## Testing Decisions

Good tests here assert **externally observable authorization behavior** against a real database, not internal function shapes. The security boundary is the DB layer, so that is what is tested. Client route-guard and client services are **not** unit-tested (the client is cosmetic per the hidden-route decision; DB enforcement is what matters).

- **Harness / prior art**: the existing integration suite that replays migrations against a throwaway Supabase database (`tests/integration/`, e.g. `share_questionnaire.test.ts`, `shared_card_visibility.test.ts`, `editor_edits.test.ts`, `viewer_results.test.ts`). New tests follow the same style and insert their own admin fixture (no seeded admin exists, by design).

Cases to cover:
- `is_admin()` / `am_i_admin()` return true for an admin fixture and false otherwise.
- **Leak regression**: an admin's `list_my_questionnaires()` returns only their own + shared-with-them questionnaires, never others'.
- Admin's global questionnaires query returns all questionnaires; a non-admin's returns only scoped rows.
- Admin can SELECT all users; a non-admin still sees only self + co-shared.
- Admin can UPDATE (edit) and DELETE a questionnaire they don't own; a non-admin cannot.
- `admin_transfer_ownership`: owner_id swaps, the new owner's stale share row is removed, the old owner loses access; a non-admin caller is forbidden.
- Admin can manage shares on a questionnaire they don't own (share via owner-or-admin RPC, update role, remove collaborator); a non-admin cannot.
- `my_access` returns `'admin'` as a fallback for a questionnaire the admin has no relationship with, and returns the **real** role (owner/editor/viewer) when the admin also owns or is shared that questionnaire.
- Non-admin behavior on all existing per-questionnaire flows is unchanged (existing suite must stay green by construction, since existing policies are untouched).

## Out of Scope

- Any in-app way to grant or revoke admin (no RPC, no toggle, no seed trigger). Granting is direct SQL only.
- Deleting responses.
- A JWT/custom-claim role (no auth hook is introduced; the client learns admin status via an RPC, not a token claim).
- An admin dashboard with aggregate metrics; per-owner questionnaire counts on the user list (deferred fast-follow).
- Audit logging of admin actions.
- Subdomain / separate app isolation for admin.

## Further Notes

- Precedence in `my_access` is deliberately real-role-first so an admin operating on their own questionnaires gets the normal owner UI, and `'admin'` appears strictly for others' questionnaires.
- The client still ships the admin route names in its JS bundle (unavoidable for an SPA); this is acceptable because RLS is the real boundary and returns nothing useful to a non-admin.
- Landing page for `/admin` is a redirect to the questionnaires list; a small dashboard could replace it later without affecting the security model.
