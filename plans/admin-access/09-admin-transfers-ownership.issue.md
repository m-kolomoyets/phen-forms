## What to build

Admin can reassign ownership of any questionnaire. Add an `admin_transfer_ownership(qid, new_owner)` `SECURITY DEFINER` RPC that verifies `is_admin()`, then atomically sets `owner_id = new_owner` and deletes any existing share row for `new_owner` (redundant once they own it). The previous owner is left with no access (clean swap; admin can re-share explicitly if needed). This is the only path that changes `owner_id`, so the admin UPDATE policy stays owner-pinned. Add a Transfer-ownership action to the admin questionnaires list with a user picker (reusing the users data from slice 3).

## Acceptance criteria

- [ ] `admin_transfer_ownership` verifies `is_admin()`; a non-admin caller is forbidden.
- [ ] On success: `owner_id` is set to new owner, new owner's stale share row removed, old owner loses access — atomically.
- [ ] Transfer action + user picker available in the admin questionnaires list.
- [ ] Integration test: swap + stale-share removal + old-owner-loses-access; non-admin forbidden.

## Blocked by

- Blocked by #plans/admin-access/03-admin-views-all-users.issue.md
- Blocked by #plans/admin-access/05-admin-views-all-questionnaires.issue.md
