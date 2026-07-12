-- Slice: admin edits any questionnaire.
-- Two parts:
--   1. my_access gains an 'admin' fallback so the existing per-questionnaire route
--      guards admit an admin into the builder/results of questionnaires they have no
--      other relationship with. Real role wins first (owner/editor/viewer) — 'admin'
--      only when the caller is otherwise unrelated. This is an in-place function edit
--      (functions can't be OR-combined like policies).
--   2. Additive admin write policies for questionnaire UPDATE (owner-pinned — ownership
--      is changed only by admin_transfer_ownership, a later slice) and question/option
--      writes. Existing editor policies are untouched.

create or replace function public.my_access(p_questionnaire_id uuid)
returns text
language sql
security definer
set search_path = ''
stable
as $$
    select case
        when exists (
            select 1 from public.questionnaires q
            where q.id = p_questionnaire_id and q.owner_id = (select auth.uid())
        ) then 'owner'
        when public.can_edit_q(p_questionnaire_id) then 'editor'
        when public.can_view_resp_q(p_questionnaire_id) then 'viewer'
        when public.is_admin() then 'admin'
        else null
    end;
$$;

-- Admin UPDATE: owner-pinned via with-check exactly like the editor policy, so admin
-- edits cannot reassign ownership (that goes through a dedicated RPC).
create policy questionnaires_admin_update
    on public.questionnaires
    for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin() and owner_id = public.q_owner(id));

create policy questions_admin_write
    on public.questions
    for all
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

create policy question_options_admin_write
    on public.question_options
    for all
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());
