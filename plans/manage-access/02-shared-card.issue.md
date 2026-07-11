## What to build

A shared questionnaire shows up in the collaborator's list and is visually
marked on both sides. The collaborator's list now includes questionnaires shared
with them; each shared card shows a "Shared" badge, the collaborator's role, and
the owner's avatar. The owner's own cards show a "Shared with N" badge when
shared out.

Layers:
- RLS: widen `questionnaires` SELECT to owner OR `has_share`.
- `getQuestionnaires`: embed `owner:users!owner_id(...)`, `shares(count)`, and
  the current user's share row; compute the current user's role in the mapper
  (owner if `owner_id === me`, else derive from share row).
- Card UI: collaborator badge + role + owner avatar; owner "Shared with N"
  badge.

## Acceptance criteria

- [ ] A collaborator sees questionnaires shared with them in their list.
- [ ] Shared cards display a "Shared" badge, the role, and the owner's avatar.
- [ ] Owner cards display "Shared with N" when shared with ≥1 user.
- [ ] Role is correctly computed (owner / editor / viewer) per card.
- [ ] Owner profile (email/name/avatar) resolves for collaborators via the
      narrow `users` policy.
- [ ] `pnpm tsc`, `pnpm lint`, `pnpm build` pass.

## Blocked by

- Blocked by #01-share-foundation
