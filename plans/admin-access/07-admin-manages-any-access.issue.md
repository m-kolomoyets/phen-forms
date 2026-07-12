## What to build

Admin can manage access on any questionnaire. Change the `share_questionnaire(...)` RPC owner check to owner-or-admin. Add additive admin insert/update/delete policies on `questionnaire_shares` (`using is_admin()`) so the direct-write collaborator operations (add/change-role/remove) work for admin. Wire the existing ManageAccessDialog into the admin questionnaires list so admin can open it on any questionnaire. Existing owner-only share policies untouched.

## Acceptance criteria

- [ ] `share_questionnaire` succeeds for an admin on a questionnaire they don't own (owner-or-admin).
- [ ] Additive admin insert/update/delete policies on `questionnaire_shares`; existing owner policies unchanged.
- [ ] ManageAccessDialog opens from the admin questionnaires list; add/change-role/remove work for admin.
- [ ] Integration test: admin can share, update role, and remove a collaborator on a non-owned questionnaire; non-admin cannot.

## Blocked by

- Blocked by #plans/admin-access/05-admin-views-all-questionnaires.issue.md
