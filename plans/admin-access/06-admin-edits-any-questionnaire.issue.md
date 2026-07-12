## What to build

Admin can open, edit, and view results of any questionnaire by reusing the existing per-questionnaire screens. Patch `my_access(qid)` so it returns `'admin'` as a **fallback** — real role (owner/editor/viewer) is returned first, `'admin'` only when the caller has no other relationship and is an admin. Extend the `MyAccess` type with `'admin'` and handle it wherever the type is switched on. Add additive admin write policies: questionnaire UPDATE (owner-pinned via with-check — no ownership change here) and question/option write. From the admin questionnaires list, link into the existing builder and results screens (admin is now admitted by the guards).

## Acceptance criteria

- [ ] `my_access` returns `'admin'` only as fallback; real role first for questionnaires the admin owns or is shared.
- [ ] `MyAccess` type includes `'admin'`; all consumers handle it (label + full-rights treatment).
- [ ] Additive admin UPDATE policy (owner-pinned with-check) + question/option write policies; existing editor policies untouched.
- [ ] Admin can open any questionnaire in the existing builder and save edits; can view its results.
- [ ] Integration test: admin can UPDATE a questionnaire they don't own; non-admin cannot.
- [ ] Integration test: `my_access` precedence — `'admin'` for unrelated questionnaires, real role for owned/shared.

## Blocked by

- Blocked by #plans/admin-access/05-admin-views-all-questionnaires.issue.md
