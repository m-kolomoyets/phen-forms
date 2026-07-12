## What to build

Admin can delete any questionnaire. Add an additive `questionnaires_admin_delete` policy (`using is_admin()`); existing owner-only DELETE stays untouched. Reuse the existing delete UI from the admin questionnaires list so admin can trigger it on any questionnaire. Response deletion remains out of scope (deleting a questionnaire cascades per existing FK behavior; there is no independent admin response-delete).

## Acceptance criteria

- [ ] Additive `questionnaires_admin_delete` policy; existing owner DELETE policy unchanged.
- [ ] Admin can delete a non-owned questionnaire from the admin list.
- [ ] No independent response-delete capability is added.
- [ ] Integration test: admin can DELETE a questionnaire they don't own; non-admin cannot.

## Blocked by

- Blocked by #plans/admin-access/05-admin-views-all-questionnaires.issue.md
