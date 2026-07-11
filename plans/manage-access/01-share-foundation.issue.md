## What to build

The data + server foundation for questionnaire sharing, plus a minimal owner
entry point. An owner opens "Manage access" on their questionnaire, types a
collaborator's email, picks a role (Editor/Viewer), and submits. A registered
match creates/updates a share row; the owner gets a toast reflecting the result.

Layers:
- Migration: `questionnaire_shares` table (`questionnaire_id`, `user_id`,
  `can_edit`, `can_view_responses`, `created_at`, pk `(questionnaire_id,
  user_id)`, FK cascade from both parents).
- `security definer` access helpers: `has_share`, `can_edit_q`,
  `can_view_resp_q` (bypass shares RLS to avoid recursion).
- RLS: `questionnaire_shares` (SELECT owner-of-q OR own row; write owner-of-q
  only); narrow `users` SELECT policy (readable if reader co-shares a
  questionnaire with that user).
- RPC `share_questionnaire(qid, email, role)` `security definer`: verify caller
  owns q, resolve email→id, upsert with role→boolean mapping. Returns
  `'shared' | 'not_found' | 'self' | 'forbidden'`.
- Service wrapper for the RPC.
- Manage Access dialog (add-by-email form only) wired to the card's existing
  `onManageAccess`; toast per status.

## Acceptance criteria

- [ ] Migration applies cleanly; table + helpers + policies + RPC exist.
- [ ] Owner can open Manage Access dialog from the card menu.
- [ ] Adding a registered email as Editor or Viewer creates a share row with the
      correct booleans.
- [ ] Re-adding an existing collaborator updates their role (no duplicate).
- [ ] Unknown email → `not_found` toast, no row created.
- [ ] Owner's own email → `self` toast, no row created.
- [ ] Non-owner cannot create shares (RLS/RPC rejects).
- [ ] Sharing works for draft, published, and closed questionnaires.
- [ ] `pnpm tsc`, `pnpm lint`, `pnpm build` pass.

## Blocked by

None - can start immediately.
