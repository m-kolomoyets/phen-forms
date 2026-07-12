## What to build

Make the normal questionnaires list provably immune to admin SELECT widening (which lands in slice 5). Add a `list_my_questionnaires()` `SECURITY DEFINER` RPC that returns only owned + shared-with-me questionnaires — never admin-widened — computing role and shares count server-side. Switch the normal `/questionnaires` list to call this RPC instead of a plain `.select()`. Single-row questionnaire reads and per-questionnaire response reads stay as-is (already id-scoped).

This is done before widening SELECT so the leak can never appear in a shipped state.

## Acceptance criteria

- [ ] `list_my_questionnaires()` returns exactly owned + shared-with-me rows, with role + shares count.
- [ ] Normal `/questionnaires` list uses the RPC; UI (role badge, shares count, owner) unchanged for regular users.
- [ ] Integration test: user's `list_my_questionnaires()` returns only their own + shared rows, never others'.
- [ ] Existing questionnaire-list integration behavior stays green.

## Blocked by

- Blocked by #plans/admin-access/01-admin-identity-foundation.issue.md
