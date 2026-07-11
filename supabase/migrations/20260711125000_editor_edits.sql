-- Slice: editor edits.
-- An editor (share row with can_edit) may edit everything the owner can —
-- questions, options, questionnaire settings/screens, publish/close — but never
-- delete or change ownership. All widenings are additive permissive policies,
-- OR-combined by Postgres with the existing owner-only policies. Share helpers
-- (has_share / can_edit_q / can_view_resp_q) are SECURITY DEFINER and bypass the
-- shares RLS to avoid recursive policy evaluation.

-- ---------------------------------------------------------------------------
-- Stored owner lookup — SECURITY DEFINER so the editor UPDATE with-check can
-- pin owner_id to its committed value, keeping ownership immutable.
-- ---------------------------------------------------------------------------
create or replace function public.q_owner(p_questionnaire_id uuid)
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
    select owner_id from public.questionnaires where id = p_questionnaire_id;
$$;

-- ---------------------------------------------------------------------------
-- my_access — authoritative role for the current user on a questionnaire.
-- 'owner' | 'editor' | 'viewer' | null. Backs the client route guards.
-- ---------------------------------------------------------------------------
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
        else null
    end;
$$;

revoke all on function public.my_access(uuid) from public;
grant execute on function public.my_access(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- questionnaires: editors may UPDATE, but with-check pins owner_id to its
-- stored value so ownership cannot be reassigned. DELETE stays owner-only.
-- ---------------------------------------------------------------------------
create policy questionnaires_editor_update
    on public.questionnaires
    for update
    to authenticated
    using (public.can_edit_q(id))
    with check (public.can_edit_q(id) and owner_id = public.q_owner(id));

-- ---------------------------------------------------------------------------
-- questions: any share may SELECT; editors get full write. (Owner keeps its
-- existing for-all policy.)
-- ---------------------------------------------------------------------------
create policy questions_shared_select
    on public.questions
    for select
    to authenticated
    using (public.has_share(questionnaire_id));

create policy questions_editor_write
    on public.questions
    for all
    to authenticated
    using (public.can_edit_q(questionnaire_id))
    with check (public.can_edit_q(questionnaire_id));

-- ---------------------------------------------------------------------------
-- question_options: resolve the parent questionnaire via the question, then
-- reuse the share helpers.
-- ---------------------------------------------------------------------------
create policy question_options_shared_select
    on public.question_options
    for select
    to authenticated
    using (
        public.has_share(
            (select qn.questionnaire_id from public.questions qn where qn.id = question_options.question_id)
        )
    );

create policy question_options_editor_write
    on public.question_options
    for all
    to authenticated
    using (
        public.can_edit_q(
            (select qn.questionnaire_id from public.questions qn where qn.id = question_options.question_id)
        )
    )
    with check (
        public.can_edit_q(
            (select qn.questionnaire_id from public.questions qn where qn.id = question_options.question_id)
        )
    );
