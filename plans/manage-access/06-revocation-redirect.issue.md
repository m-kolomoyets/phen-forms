## What to build

When a collaborator's access is revoked mid-session, their next action fails the
RLS check; the app redirects them to the questionnaire list with a toast
explaining access was revoked. No realtime — purely reactive to the failed
fetch.

Layers:
- Query error handling on the builder/results paths: detect access-denied /
  empty-result → redirect to list + toast.

## Acceptance criteria

- [ ] Revoked collaborator navigating/refetching is redirected to the list.
- [ ] A toast explains access was revoked.
- [ ] Owner and still-valid collaborators are unaffected.
- [ ] No realtime subscription is introduced.
- [ ] `pnpm tsc`, `pnpm lint`, `pnpm build` pass.

## Blocked by

- Blocked by #03-editor-edits
- Blocked by #04-viewer-results
