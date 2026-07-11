## What to build

An editor can open the constructor and edit everything the owner can — questions,
options, questionnaire settings, welcome/ending screens, and publish/close —
but cannot delete or manage access.

Layers:
- RLS: widen `questions` + `question_options` (SELECT owner OR share;
  write owner OR `can_edit_q`) and `questionnaires` UPDATE (owner OR
  `can_edit_q`, with-check keeps `owner_id` immutable).
- `myAccess(qid)` query returning `'owner' | 'editor' | 'viewer' | null`.
- Builder route `beforeLoad` guard: allow owner/editor; viewer → results;
  null → list.
- Card action menu gating: editor sees all actions except Delete and Manage
  access.

## Acceptance criteria

- [ ] Editor can open the constructor and edit questions/options.
- [ ] Editor can edit questionnaire settings and welcome/ending screens.
- [ ] Editor can publish/close the questionnaire.
- [ ] Editor cannot change `owner_id` (rejected by with-check).
- [ ] Editor cannot delete or manage access (hidden in menu + blocked by RLS).
- [ ] Structure-freeze still applies to editors once responses exist.
- [ ] Builder route guard redirects non-editors correctly.
- [ ] `pnpm tsc`, `pnpm lint`, `pnpm build` pass.

## Blocked by

- Blocked by #02-shared-card
