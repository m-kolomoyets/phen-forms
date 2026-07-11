# Manage Access — Questionnaire Sharing

## Problem Statement

A questionnaire owner works alone. They cannot let a colleague help edit the
questions or review incoming responses. Everything is locked to a single owner
account, so collaboration means sharing login credentials — insecure and
untraceable.

## Solution

An owner can share a questionnaire with other registered users and pick what
each collaborator may do:

- **Editor** — edit everything the owner can (questions, questionnaire
  settings, welcome/ending screens, publish/close) and view responses.
- **Viewer** — view responses only (results charts + table); no access to the
  questionnaire constructor.

Owners keep two exclusive powers: deleting the questionnaire and managing
access. A shared questionnaire is clearly marked on both sides — the
collaborator sees a "Shared" badge with the owner's avatar; the owner sees a
"Shared with N" badge.

## User Stories

1. As an owner, I want a "Manage access" action on my questionnaire, so that I can control who collaborates.
2. As an owner, I want to add a collaborator by email, so that I can share with a specific person.
3. As an owner, I want clear feedback when the email I enter has no registered account, so that I know the share did not happen.
4. As an owner, I want to be told when I try to share with myself, so that I don't create a meaningless share.
5. As an owner, I want to pick a role (Editor or Viewer) per collaborator, so that I grant only the access I intend.
6. As an owner, I want to change a collaborator's role later, so that I can adjust access over time.
7. As an owner, I want to re-adding an already-shared user to just update their role, so that I never get duplicate entries.
8. As an owner, I want to remove a collaborator, so that I can revoke access.
9. As an owner, I want to see how many people a questionnaire is shared with on its card, so that I can spot shared items at a glance.
10. As an owner, I want to share regardless of the questionnaire's status (draft, published, closed), so that I'm not blocked by lifecycle.
11. As an editor, I want the shared questionnaire to appear in my list, so that I can find it.
12. As an editor, I want to open the constructor and edit questions and settings, so that I can help build the questionnaire.
13. As an editor, I want to publish or close the questionnaire, so that I can manage its lifecycle like the owner.
14. As an editor, I want to view the responses and charts, so that I have full context.
15. As an editor, I want to NOT be able to delete the questionnaire or manage its access, so that ownership stays with the owner.
16. As a viewer, I want the shared questionnaire in my list, so that I can find it.
17. As a viewer, I want to open the results (charts + table), so that I can review responses.
18. As a viewer, I want the constructor hidden and its route blocked, so that I cannot accidentally edit.
19. As a collaborator, I want a "Shared" badge and the owner's avatar on the card, so that I know it isn't mine and who owns it.
20. As a collaborator whose access was revoked, I want to be redirected out with a clear message when I next act, so that I understand what happened.
21. As an owner, I want collaborators unable to change ownership, so that no one can take over my questionnaire.
22. As a respondent (anonymous), I want the public fill-in flow unchanged by sharing, so that response collection keeps working.

## Implementation Decisions

### Data model
- New table `questionnaire_shares`: `questionnaire_id`, `user_id`, `can_edit`,
  `can_view_responses`, `created_at`; primary key `(questionnaire_id, user_id)`;
  FK cascade from both `questionnaires` and `users`.
- Role is a UI concept mapped to two booleans: Editor → `can_edit=true` +
  `can_view_responses=true`; Viewer → `can_view_responses=true` only.
- Effective response access = `can_edit OR can_view_responses`.

### Database — access helpers (deep module)
- `security definer` SQL helpers that read `questionnaire_shares` while
  bypassing its RLS to avoid recursive policy evaluation:
  `has_share(qid)`, `can_edit_q(qid)`, `can_view_resp_q(qid)`.
- These are the single source of truth for every share-based policy and RPC.

### RLS changes
- `questionnaires`: SELECT owner OR `has_share`; UPDATE owner OR `can_edit_q`
  (with-check must keep `owner_id` immutable); DELETE owner only.
- `questions` + `question_options`: SELECT owner OR share; INSERT/UPDATE/DELETE
  owner OR `can_edit_q`.
- `responses` + `answers`: SELECT owner OR view-access.
- `users`: add narrow SELECT policy — a user row is readable if the reader
  co-shares a questionnaire with that user (covers owner→collaborators and
  collaborator→owner for avatars/emails).
- `questionnaire_shares`: SELECT owner-of-questionnaire OR own row;
  INSERT/UPDATE/DELETE owner-of-questionnaire only.

### RPC changes
- New `share_questionnaire(qid, email, role)` `security definer`: verifies
  caller owns the questionnaire, resolves email → user id, upserts the share row
  with the role's boolean mapping. Returns a status:
  `'shared' | 'not_found' | 'self' | 'forbidden'`. No collaborator cap; any
  questionnaire status allowed.
- `get_questionnaire_stats`: replace the owner-only guard with owner OR
  view-access (reuse the access helper) so shared users can load charts.

### Locking (no change needed)
- Existing "locks" are a structure freeze once responses exist — global, not
  per-user. Multi-editor concurrency is last-write-wins; no collision infra is
  added.

### Client — services
- `getQuestionnaires`: query now returns owned + shared rows (via RLS). Embed
  `owner:users!owner_id(...)`, `shares(count)`, and the current user's share
  row; compute the current user's role in the mapper (owner if
  `owner_id === me`, else derive from the share row).
- New `myAccess(qid)` query returning `'owner' | 'editor' | 'viewer' | null`.
- New service functions for the shares domain: share (RPC wrapper), update role,
  remove collaborator, list collaborators.

### Client — routing guards
- Builder route `beforeLoad`: allow owner/editor; viewer → redirect to results;
  null → redirect to list.
- Results route `beforeLoad`: allow any of owner/editor/viewer; else redirect to
  list.
- Revocation is RLS-only: a failed fetch redirects to the list with a toast; no
  realtime subscription.

### Client — UI
- **Manage Access dialog** (owner only): email input + add (toast reflects RPC
  status); collaborator list with per-row role dropdown (Editor/Viewer) and
  remove; mutations optimistic.
- **Questionnaire card**: collaborator view shows a "Shared" badge, role, and
  owner avatar; owner view shows a "Shared with N" badge. Action menu gated by
  role — editors see everything except Delete and Manage access; viewers see
  only View results, Copy link, Preview.
- **Sidebar/menu**: constructor entry hidden for viewers.

## Testing Decisions

- Repo has **no test runner configured** (see `.claude/rules/code-style.md`);
  there is no unit/e2e harness. Automated tests are therefore out of scope for
  this PRD unless a harness is introduced first.
- Verification is manual + type/lint/build gates (`pnpm tsc`, `pnpm lint`,
  `pnpm build`) plus DB-level checks of RLS behavior.
- A good test would exercise external behavior only: given a share row with a
  role, the collaborator can/cannot reach a route or read a table — not the
  internal helper implementation.
- If/when a harness lands, priority coverage: the `share_questionnaire` RPC
  status matrix (`shared`/`not_found`/`self`/`forbidden`, re-share upsert), and
  RLS access decisions per role across questionnaires/questions/responses/stats.
- Edge cases to verify manually: revoked-mid-session redirect; editor cannot
  change `owner_id`; viewer route block; anonymous fill-in unaffected;
  structure-freeze still applies to editors.

## Out of Scope

- Inviting users who are not yet registered (pending/email invites).
- An open user directory or email autocomplete.
- Real-time live-kick on revocation.
- Editors deleting or re-sharing the questionnaire.
- Collaborator count limits.
- Transfer of ownership.
- Concurrent-edit locking / presence indicators.
- Notifications/emails on share.

## Further Notes

- "Editor = everything except delete + manage access" was an explicit decision;
  the two stored booleans stay for flexibility but the UI exposes only the two
  roles to avoid invalid combinations.
- All share-based authorization is centralized in the `security definer` helper
  functions so policies and RPCs share one definition and cannot drift.
