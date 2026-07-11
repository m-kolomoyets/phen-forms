# 01 — Questionnaire CRUD + list

## What to build

End-to-end ability for a logged-in user to create, list, rename, and delete their own
draft questionnaires. Establishes the `questionnaires` table, its RLS, the service
layer, and the authenticated builder shell (list page + create/edit-meta form). Also
establishes the migration → `pnpm gen:types` workflow used by every later slice.

Scope of the table here: `id`, `owner_id`, `title`, `description`, `status`
(default `draft`), `accepting_responses`, `created_at`, `updated_at`. Lifecycle/welcome/
randomize columns arrive in later slices.

## Acceptance criteria

- [ ] Migration creates `questionnaire_status` enum + `questionnaires` table with RLS: owner full CRUD where `owner_id = auth.uid()`; other users see nothing.
- [ ] `pnpm gen:types` regenerates `src/lib/database.types.ts` including the new table.
- [ ] Service `src/services/questionnaires/*` (api/queries/queryKeys/types) mirrors `src/services/users/*`.
- [ ] Authenticated route lists the current user's questionnaires with status; a user sees only their own.
- [ ] User can create a questionnaire (title + description), edit its meta, and delete it.
- [ ] `pnpm tsc` + lint pass.

## Blocked by

- None — can start immediately.
