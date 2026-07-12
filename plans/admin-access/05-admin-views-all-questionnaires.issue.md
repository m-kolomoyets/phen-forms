## What to build

Admin can view every questionnaire and its data. Add additive admin SELECT policies (`using is_admin()`) on questionnaires, questions, question options, responses, answers, and questionnaire shares — existing policies untouched. Build the `/admin/questionnaires` global list backed by an unfiltered questionnaires query, showing the **owner** on each card. Because the normal list already uses `list_my_questionnaires()` (slice 4), widening SELECT here does not leak into regular users' everyday view.

## Acceptance criteria

- [ ] Additive admin SELECT policies on questionnaires, questions, question_options, responses, answers, questionnaire_shares.
- [ ] `/admin/questionnaires` lists all questionnaires with owner shown on each card.
- [ ] Integration test: admin's global query returns all questionnaires; a non-admin's returns only scoped rows.
- [ ] Integration test (leak regression): admin's normal `list_my_questionnaires()` still returns only own + shared.
- [ ] Existing owner/editor/viewer SELECT behavior unchanged.

## Blocked by

- Blocked by #plans/admin-access/02-hidden-admin-route-shell.issue.md
- Blocked by #plans/admin-access/04-leak-proof-normal-list.issue.md
