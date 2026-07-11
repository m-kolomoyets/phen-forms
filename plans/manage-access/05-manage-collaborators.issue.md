## What to build

The Manage Access dialog gains a collaborator list. The owner sees each
collaborator (avatar/email), can change their role via a dropdown
(Editor/Viewer), and can remove them. Changes apply immediately (optimistic).

Layers:
- Service: list collaborators, update role, remove collaborator.
- Dialog UI: collaborator list with per-row role dropdown + remove button;
  optimistic mutations with rollback on error.

## Acceptance criteria

- [ ] Dialog lists current collaborators with avatar/email and current role.
- [ ] Changing a collaborator's role updates the share row's booleans.
- [ ] Removing a collaborator deletes the share row.
- [ ] Mutations are optimistic and roll back on error.
- [ ] Only the owner can list/update/remove (RLS enforced).
- [ ] `pnpm tsc`, `pnpm lint`, `pnpm build` pass.

## Blocked by

- Blocked by #01-share-foundation
